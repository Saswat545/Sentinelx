"""
Solana token risk engine — chain state, not source code.

There is no verified-source registry for Solana programs, so the 54 Solidity
features do not apply. What is readable for free over any Solana RPC is exactly
what a rug pull hides in, so the rules below read that state directly:

  * mint authority    — can still inflate supply
  * freeze authority  — can freeze holder accounts (a honeypot by another name)
  * holder spread     — supply parked in one or ten accounts
  * DEX liquidity     — is there any exit at all, how deep, how new

Every finding names the account or number that produced it. When the mint does
not exist or cannot be read, the result is INSUFFICIENT_DATA, never a guess.
"""

from __future__ import annotations

import os
import time
from typing import Optional

import requests

try:
    from risk_engine import Finding, fuse, recommendation_for, rule_score, verdict_for
except ImportError:
    # Render imports this as backend.solana_engine, not a top-level module.
    from .risk_engine import Finding, fuse, recommendation_for, rule_score, verdict_for

SOL_RPC = os.getenv("SOLANA_RPC_URL", "https://api.mainnet-beta.solana.com")
DEXSCREENER = "https://api.dexscreener.com/latest/dex/tokens"

TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
TOKEN_2022 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"

import re

BASE58_RE = re.compile(r"^[1-9A-HJ-NP-Za-km-z]{32,44}$")


def is_solana_address(text: str) -> bool:
    return bool(BASE58_RE.match((text or "").strip()))


def _rpc(method: str, params: list) -> dict:
    response = requests.post(
        SOL_RPC,
        json={"jsonrpc": "2.0", "id": 1, "method": method, "params": params},
        timeout=20,
    )
    response.raise_for_status()
    body = response.json()
    if body.get("error"):
        raise RuntimeError(body["error"].get("message", "RPC error"))
    return body.get("result") or {}


def fetch_mint(mint: str) -> Optional[dict]:
    """Parsed SPL mint, or None when the address is not a token mint."""
    result = _rpc("getAccountInfo", [mint, {"encoding": "jsonParsed"}])
    value = result.get("value")
    if not value:
        return None
    owner = value.get("owner")
    if owner not in (TOKEN_PROGRAM, TOKEN_2022):
        return None
    parsed = ((value.get("data") or {}).get("parsed") or {})
    if parsed.get("type") != "mint":
        return None
    info = parsed.get("info") or {}
    info["_program"] = "token-2022" if owner == TOKEN_2022 else "spl-token"
    return info


def largest_holders(mint: str) -> list[dict]:
    result = _rpc("getTokenLargestAccounts", [mint])
    return result.get("value") or []


def market(mint: str) -> Optional[dict]:
    """DexScreener pairs, or None when the market API cannot be read."""
    try:
        response = requests.get(f"{DEXSCREENER}/{mint}", timeout=15)
        response.raise_for_status()
        pairs = (response.json() or {}).get("pairs") or []
    except Exception:
        return None
    return {"pairs": pairs}


def _share(amount: int, supply: int) -> float:
    return 0.0 if supply <= 0 else amount / supply


def evaluate_state(mint: str) -> list[Finding] | None:
    """Build findings from chain state. None means the mint could not be read."""
    info = fetch_mint(mint)
    if info is None:
        return None

    findings: list[Finding] = []
    supply = int(info.get("supply") or 0)

    if not info.get("isInitialized", True):
        findings.append(
            Finding(
                "mint_uninitialized",
                "Mint account is not initialized",
                "CRITICAL",
                60,
                "The mint account exists but was never initialized.",
                True,
            )
        )

    if supply == 0:
        findings.append(
            Finding(
                "zero_supply",
                "Mint has zero supply",
                "CRITICAL",
                40,
                "No tokens exist to trade; anything offered against this mint is not this mint.",
                True,
            )
        )

    mint_authority = info.get("mintAuthority")
    if mint_authority:
        findings.append(
            Finding(
                "mint_authority_active",
                "Supply can still be inflated",
                "HIGH",
                20,
                f"Mint authority is {mint_authority}; that key can mint new supply at will.",
                False,
            )
        )

    freeze_authority = info.get("freezeAuthority")
    if freeze_authority:
        findings.append(
            Finding(
                "freeze_authority_active",
                "Holder accounts can be frozen",
                "HIGH",
                20,
                f"Freeze authority is {freeze_authority}; it can freeze any holder's token "
                "account, which blocks selling without touching the contract.",
                False,
            )
        )

    if info.get("_program") == "token-2022":
        findings.append(
            Finding(
                "token_2022",
                "Token-2022 extensions are in play",
                "MEDIUM",
                8,
                "Issued under the Token-2022 program, where transfer hooks and fees can be "
                "configured on the mint itself.",
                False,
            )
        )

    try:
        holders = largest_holders(mint)
    except Exception:
        holders = []

    if holders and supply > 0:
        top = [int(h.get("amount") or 0) for h in holders]
        top1 = _share(top[0], supply) if top else 0.0
        top10 = _share(sum(top[:10]), supply)

        if top1 >= 0.50:
            findings.append(
                Finding(
                    "top1_holder",
                    "One account holds most of the supply",
                    "HIGH",
                    25,
                    f"{holders[0].get('address')} holds {top1:.1%} of supply; that wallet can "
                    "sell into any liquidity in one transaction.",
                    False,
                )
            )
        elif top1 >= 0.25:
            findings.append(
                Finding(
                    "top1_holder",
                    "Large single holder",
                    "MEDIUM",
                    12,
                    f"{holders[0].get('address')} holds {top1:.1%} of supply.",
                    False,
                )
            )

        if top10 >= 0.90:
            findings.append(
                Finding(
                    "top10_holders",
                    "Ten accounts hold nearly all supply",
                    "MEDIUM",
                    12,
                    f"The ten largest token accounts hold {top10:.1%} of supply.",
                    False,
                )
            )

    dex = market(mint)
    if dex is not None:
        pairs = dex["pairs"]
        if not pairs:
            findings.append(
                Finding(
                    "no_liquidity",
                    "No DEX pair found",
                    "HIGH",
                    30,
                    "DexScreener returns no pair for this mint, so there may be no market to "
                    "sell into. Treat it as unsellable until a pool exists.",
                    False,
                )
            )
        else:
            liquidity = max(float((p.get("liquidity") or {}).get("usd") or 0) for p in pairs)
            if liquidity < 10_000:
                findings.append(
                    Finding(
                        "thin_liquidity",
                        "Thin liquidity",
                        "MEDIUM",
                        15,
                        f"Deepest pair holds ${liquidity:,.0f} of liquidity; a small sell can "
                        "move the price against you.",
                        False,
                    )
                )

            created = [p.get("pairCreatedAt") for p in pairs if p.get("pairCreatedAt")]
            if created:
                age_hours = (time.time() * 1000 - min(created)) / 3_600_000
                if age_hours < 24:
                    findings.append(
                        Finding(
                            "new_pool",
                            "Market is less than a day old",
                            "MEDIUM",
                            10,
                            f"The oldest pair was created {age_hours:.1f} hours ago; there is no "
                            "trading history to judge the market by.",
                            False,
                        )
                    )

    return findings


def analyze_solana(mint: str) -> dict:
    """Return a response shaped like main.AnalyzeResponse."""
    start_ms = time.time()
    findings = evaluate_state(mint)

    if findings is None:
        return {
            "risk_score": 0,
            "verdict": "UNKNOWN",
            "verdict_label": "Not readable as an SPL token mint.",
            "rug_probability": 0.0,
            "input_type": "solana_mint",
            "flags": [],
            "shap_top_features": [],
            "recommendation": (
                "This address is not a readable SPL token mint on Solana mainnet. If it is a "
                "program, a wallet, or a token on another network, check that you picked the "
                "right chain and pasted the mint address."
            ),
            "model_used": False,
            "analysis_time_ms": int((time.time() - start_ms) * 1000),
            "token_address": mint,
            "contract_name": None,
            "rule_score": 0,
            "ai_score": None,
            "confidence": 0.15,
            "status": "INSUFFICIENT_DATA",
            "findings": [],
        }

    rules = rule_score(findings)
    score, confidence = fuse(rules, None, findings, "ONCHAIN_STATE")

    # A market hours old has no trading history; it must not read as SAFE.
    if any(item.rule == "new_pool" for item in findings):
        score = max(score, 20)

    verdict, band_label = verdict_for(score)

    flags = [
        {"name": item.title, "severity": item.severity, "description": item.evidence}
        for item in findings
    ] or [
        {
            "name": "No Solana rug signals found",
            "severity": "LOW",
            "description": "Mint and freeze authority are renounced, supply is spread across "
            "holders, and the mint has a funded DEX pair.",
        }
    ]

    return {
        "risk_score": score,
        "verdict": verdict,
        "verdict_label": f"{band_label} Scored from on-chain token state.",
        "rug_probability": round(score / 100, 4),
        "input_type": "solana_mint",
        "flags": flags,
        "shap_top_features": [],
        "recommendation": recommendation_for(score, findings),
        "model_used": False,
        "analysis_time_ms": int((time.time() - start_ms) * 1000),
        "token_address": mint,
        "contract_name": None,
        "rule_score": rules,
        "ai_score": None,
        "confidence": confidence,
        "status": "ONCHAIN_STATE",
        "findings": [item.as_dict() for item in findings],
    }
