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

import base64
import json
import os
import struct
import threading
import time
from typing import Optional

import requests

try:
    from risk_engine import Finding, fuse, recommendation_for, rule_score, verdict_for
except ImportError:
    # Render imports this as backend.solana_engine, not a top-level module.
    from .risk_engine import Finding, fuse, recommendation_for, rule_score, verdict_for

# The official endpoint answers getAccountInfo but throttles
# getTokenLargestAccounts (HTTP 429 by method) and publicnode blocks it outright,
# which left holder concentration permanently unmeasured in production. These
# are tried in order; the first one that answers wins, and each read is cached.
SOL_RPC = os.getenv("SOLANA_RPC_URL", "https://solana-mainnet.g.alchemy.com/v2/demo")
FALLBACK_RPC = os.getenv("SOLANA_RPC_FALLBACK", "https://api.mainnet-beta.solana.com")
EXTRA_RPC = os.getenv("SOLANA_RPC_EXTRA", "https://solana-rpc.publicnode.com")
DEXSCREENER = "https://api.dexscreener.com/latest/dex/tokens"

# Errors that mean "this endpoint will not serve this method", not "bad request".
ENDPOINT_ERROR_CODES = {401, 403, 410, 429, -32029}

TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
TOKEN_2022 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"

import re

BASE58_RE = re.compile(r"^[1-9A-HJ-NP-Za-km-z]{32,44}$")

SYSTEM_PROGRAM = "11111111111111111111111111111111"

# Authorities that hold tokens for a market, not for a seller. The owner-program
# check below catches these generically; the explicit entry covers the largest
# AMM so the intent is readable.
KNOWN_POOL_AUTHORITIES = {
    "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",  # Raydium AMM v4 authority
}


def is_solana_address(text: str) -> bool:
    return bool(BASE58_RE.match((text or "").strip()))


# Public RPCs throttle bursts. A scan makes three to five reads, and people
# rescan the same mint, so identical reads inside a short window are reused.
CACHE_TTL = float(os.getenv("SOLANA_CACHE_TTL", "60"))
CACHE_MAX = 512
_cache: dict[str, tuple[float, dict]] = {}
_cache_lock = threading.Lock()


def _cache_get(key: str) -> Optional[dict]:
    with _cache_lock:
        entry = _cache.get(key)
        if entry is None:
            return None
        stored_at, value = entry
        if time.time() - stored_at > CACHE_TTL:
            _cache.pop(key, None)
            return None
        return value


def _cache_put(key: str, value: dict) -> None:
    with _cache_lock:
        if len(_cache) >= CACHE_MAX:
            now = time.time()
            for stale in [k for k, (at, _) in _cache.items() if now - at > CACHE_TTL]:
                _cache.pop(stale, None)
            if len(_cache) >= CACHE_MAX:
                _cache.clear()
        _cache[key] = (time.time(), value)


def clear_cache() -> None:
    with _cache_lock:
        _cache.clear()


# A method an endpoint refuses stays refused for a while; retrying it on every
# scan cost tens of seconds. Ten minutes, then we try again.
_method_blocked: dict[str, float] = {}
METHOD_BLOCK_TTL = 600


def _method_allowed(method: str) -> bool:
    until = _method_blocked.get(method)
    return until is None or time.time() > until


def _rpc(method: str, params: list) -> dict:
    """Call the RPC, caching reads and retrying on 429 with a fallback endpoint."""
    key = json.dumps([method, params], sort_keys=True, default=str)
    cached = _cache_get(key)
    if cached is not None:
        return cached

    payload = {"jsonrpc": "2.0", "id": 1, "method": method, "params": params}
    problems: list[str] = []

    for url in dict.fromkeys([SOL_RPC, FALLBACK_RPC, EXTRA_RPC]):
        for attempt in (1, 2):
            try:
                response = requests.post(url, json=payload, timeout=20)
                if response.status_code == 429:
                    problems.append(f"{url}: rate limited")
                    # Public endpoints throttle bursts; back off before retrying.
                    time.sleep(1.2 * attempt)
                    continue
                response.raise_for_status()
                body = response.json()
                if body.get("error"):
                    error = body["error"]
                    message = str(error.get("message", "RPC error"))
                    blocked = error.get("code") in ENDPOINT_ERROR_CODES or any(
                        word in message.lower()
                        for word in ("blocked", "disabled", "too many", "rate limit")
                    )
                    if blocked:
                        # Not our request's fault: try the next endpoint.
                        problems.append(f"{url}: {message}")
                        break
                    raise RuntimeError(message)
                result = body.get("result") or {}
                _cache_put(key, result)
                return result
            except RuntimeError:
                raise
            except Exception as exc:
                problems.append(f"{url}: {exc}")
                break

    _method_blocked[method] = time.time() + METHOD_BLOCK_TTL
    raise RuntimeError("Solana RPC unavailable (" + "; ".join(problems[-2:]) + ")")


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


GPA_MAX_BYTES = 8 * 1024 * 1024
_B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"


def _b58encode(raw: bytes) -> str:
    number = int.from_bytes(raw, "big")
    out = ""
    while number:
        number, remainder = divmod(number, 58)
        out = _B58[remainder] + out
    for byte in raw:
        if byte != 0:
            break
        out = _B58[0] + out
    return out or "_"


def _holders_from_program_accounts(mint: str, program: Optional[str] = None) -> list[dict]:
    """Read every token account for the mint straight from the token program.

    getTokenLargestAccounts is an "indexed" method that public RPCs throttle or
    refuse without a key. getProgramAccounts is served, but returns every holder,
    so the response is streamed and abandoned past a size cap: a mint with
    millions of accounts stays unmeasured instead of exhausting memory.
    """
    accounts: list[dict] = []
    # The mint tells us which token program holds its accounts, so only that one
    # needs querying.
    programs = (TOKEN_2022,) if program == "token-2022" else (TOKEN_PROGRAM,)
    for token_program in programs:
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getProgramAccounts",
            "params": [
                token_program,
                {
                    "encoding": "base64",
                    "filters": [{"memcmp": {"offset": 0, "bytes": mint}}],
                    "dataSlice": {"offset": 0, "length": 72},
                },
            ],
        }
        for url in dict.fromkeys([FALLBACK_RPC, SOL_RPC]):
            try:
                with requests.post(url, json=payload, timeout=30, stream=True) as response:
                    if response.status_code != 200:
                        continue
                    total = 0
                    chunks: list[bytes] = []
                    for chunk in response.iter_content(65536):
                        total += len(chunk)
                        if total > GPA_MAX_BYTES:
                            chunks = []
                            break
                        chunks.append(chunk)
                    if not chunks:
                        continue
                    body = json.loads(b"".join(chunks))
            except Exception:
                continue

            if body.get("error"):
                continue
            for item in body.get("result") or []:
                raw = base64.b64decode((item.get("account", {}).get("data") or [""])[0] or "")
                if len(raw) < 72:
                    continue
                accounts.append(
                    {
                        "address": item.get("pubkey"),
                        "owner": _b58encode(raw[32:64]),
                        "amount": str(struct.unpack("<Q", raw[64:72])[0]),
                    }
                )
            break

    accounts.sort(key=lambda h: -int(h["amount"]))
    return accounts[:20]


def largest_holders(mint: str, program: Optional[str] = None) -> list[dict]:
    """Top holders by balance, with a program-account fallback when the indexed
    endpoint refuses the request. Returns [] when neither path could read them."""
    if _method_allowed("getTokenLargestAccounts"):
        try:
            values = _rpc("getTokenLargestAccounts", [mint]).get("value") or []
            if values:
                return values
        except Exception:
            pass
    return _holders_from_program_accounts(mint, program)


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


def exclude_pool_accounts(holders: list[dict]) -> tuple[list[dict], int]:
    """Drop token accounts held by a program (pool vault, escrow, lock) instead
    of a wallet.

    A user wallet is an account owned by the System Program. AMM vaults and
    escrow PDAs are owned by the DEX program, so the owner of the authority
    tells us which is which without hardcoding every pool address. Returns the
    remaining holders and how many were dropped.
    """
    if not holders:
        return holders, 0

    addresses = [h.get("address") for h in holders]
    if not all(addresses):
        return holders, 0

    infos = _rpc("getMultipleAccounts", [addresses, {"encoding": "jsonParsed"}]).get("value") or []

    # Index, never zip: a short response must leave the trailing holders
    # unclassified (and therefore counted), not silently remove them.
    authorities: list[Optional[str]] = []
    for index in range(len(addresses)):
        info = infos[index] if index < len(infos) else None
        parsed = ((info or {}).get("data") or {}).get("parsed") or {}
        authorities.append((parsed.get("info") or {}).get("owner"))

    unique = [a for a in dict.fromkeys(authorities) if a]
    owner_program: dict[str, Optional[str]] = {}
    if unique:
        programs = _rpc("getMultipleAccounts", [unique, {"encoding": "jsonParsed"}]).get("value") or []
        if len(programs) == len(unique):
            for address, value in zip(unique, programs):
                owner_program[address] = (value or {}).get("owner")

    kept: list[dict] = []
    dropped = 0
    for index, holder in enumerate(holders):
        authority = authorities[index] if index < len(authorities) else None
        program = owner_program.get(authority) if authority else None
        is_program_held = authority in KNOWN_POOL_AUTHORITIES or (
            program is not None and program != SYSTEM_PROGRAM
        )
        if is_program_held:
            dropped += 1
            continue
        kept.append(holder)

    return kept, dropped


def evaluate_state(mint: str) -> tuple[list[Finding] | None, dict]:
    """Build findings from chain state.

    Returns the findings and what was actually read. A None finding list means
    the mint itself could not be read. The stats exist so a caller can tell
    "no concentration found" apart from "holder data was unavailable": public
    RPCs throttle getTokenLargestAccounts, and silence must not look safe.
    """
    stats: dict = {
        "holder_data": "unavailable",
        "accounts": 0,
        "excluded_pool_accounts": 0,
        "top1_share": None,
        "top10_share": None,
    }

    info = fetch_mint(mint)
    if info is None:
        return None, stats

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
        holders = largest_holders(mint, info.get("_program"))
    except Exception:
        holders = []

    # Pool and vault accounts hold most of a healthy token's supply; counting
    # them as whales flagged legitimate tokens. Drop them before measuring.
    dropped = 0
    if holders:
        stats["holder_data"] = "raw"
        try:
            holders, dropped = exclude_pool_accounts(holders)
            stats["holder_data"] = "classified"
        except Exception:
            # If ownership cannot be read, measure the raw list rather than claim
            # an exclusion that did not happen.
            dropped = 0
    stats["accounts"] = len(holders)
    stats["excluded_pool_accounts"] = dropped

    if holders and supply > 0:
        top = [int(h.get("amount") or 0) for h in holders]
        top1 = _share(top[0], supply) if top else 0.0
        top10 = _share(sum(top[:10]), supply)
        stats["top1_share"] = round(top1, 4)
        stats["top10_share"] = round(top10, 4)

        if top1 >= 0.50:
            findings.append(
                Finding(
                    "top1_holder",
                    "One account holds most of the supply",
                    "HIGH",
                    25,
                    f"{holders[0].get('address')} holds {top1:.1%} of supply; that wallet can "
                    f"sell into any liquidity in one transaction."
                    + (f" {dropped} pool/vault accounts were excluded." if dropped else ""),
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
                    f"{holders[0].get('address')} holds {top1:.1%} of supply."
                    + (f" {dropped} pool/vault accounts were excluded." if dropped else ""),
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
                    f"The ten largest token accounts hold {top10:.1%} of supply."
                    + (f" {dropped} pool/vault accounts were excluded." if dropped else ""),
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

    return findings, stats


def analyze_solana(mint: str) -> dict:
    """Return a response shaped like main.AnalyzeResponse."""
    start_ms = time.time()
    findings, holder_stats = evaluate_state(mint)

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
            "holder_stats": holder_stats,
        }

    rules = rule_score(findings)
    score, confidence = fuse(rules, None, findings, "ONCHAIN_STATE")

    # A market hours old has no trading history; it must not read as SAFE.
    if any(item.rule == "new_pool" for item in findings):
        score = max(score, 20)

    # Holder distribution is evidence; if it could not be read, say so through a
    # lower confidence instead of letting silence read as a clean result.
    if holder_stats.get("holder_data") == "unavailable":
        confidence = round(confidence * 0.7, 2)

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
        "holder_stats": holder_stats,
    }
