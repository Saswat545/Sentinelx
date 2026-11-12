"""
HYBRID RISK ENGINE — deterministic rules + ML, fused with evidence.

Most smart-contract risk is decidable: a honeypot is a honeypot whether or not a
model has seen one. A minority is contextual, and that is where the XGBoost model
earns its 30% share. This module owns the rule half and the fusion, and keeps
every number traceable to a named finding.

Design rules that came out of the cross-chain evaluation:

  * A single heuristic cannot produce HIGH on its own. Marginal signals such as
    `Assembly Caller`, `Hash-based Access` or a bare `Hidden Owner` carry small
    weights, because they appear on over half of legitimate verified contracts.
  * Only corroborated findings are "confirmed", and only a confirmed CRITICAL
    overrides the fused score to 90.
  * A resolved proxy is scored on its implementation. The proxy itself only
    contributes an upgradeability finding.
  * Unverified contracts are scored from bytecode where possible and never
    labelled SAFE. With no evidence at all the result is UNKNOWN, not 90/CRITICAL.

Weights are the result of measuring false positives on a known-good control set
(see scripts/eval_hybrid.py), not an assumed 70:30 optimum.
"""

import re
from dataclasses import dataclass, field
from typing import Optional

# A privileged fund extractor, narrowly: `rescueERC20` and `emergencyWithdraw`
# are standard admin functions (FiatToken, vaults) and must not match.
DRAIN_PATTERN = re.compile(r"function\s+(drain|rugPull|rug)\s*\(", re.I)
WITHDRAW_ALL_PATTERN = re.compile(r"function\s+withdrawAll\s*\(", re.I)

# The feature extractor's `has_hidden_owner` also fires on any contract that has
# both `bytes32` and the word "owner", which is most of them. Only a genuinely
# obfuscated privileged address may corroborate a critical finding.
STRICT_HIDDEN_OWNER = re.compile(
    r"address\s+(private|internal)\s+\w*(owner|admin|controller)", re.I
)

# Verified blue chips on these chains legitimately mint and use tx.origin.
BRIDGE_MARKERS = (
    "bridgetoken",
    "optimismmintable",
    "l1standardbridge",
    "canonical",
    "l2standardbridge",
    "childerc20",
    "wrapped",
)


@dataclass
class Finding:
    rule: str
    title: str
    severity: str            # CRITICAL / HIGH / MEDIUM / LOW / INFO
    weight: int              # contribution to the rule score, 0-100
    evidence: str            # what in the contract produced this
    confirmed: bool = False  # corroborated; only confirmed CRITICALs override

    def as_dict(self) -> dict:
        return {
            "rule": self.rule,
            "title": self.title,
            "severity": self.severity,
            "weight": self.weight,
            "evidence": self.evidence,
            "confirmed": self.confirmed,
        }


def is_bridge_context(contract_name: str, source: str) -> bool:
    haystack = f"{contract_name or ''} {source[:20000]}".lower()
    return any(marker in haystack for marker in BRIDGE_MARKERS)


def evaluate_rules(features: dict, source: str, contract_name: str = "") -> list[Finding]:
    """Run every deterministic check. Order is by weight, highest first."""
    f = features
    findings: list[Finding] = []
    bridge = is_bridge_context(contract_name, source)
    drain = bool(DRAIN_PATTERN.search(source))
    withdraw_all = bool(WITHDRAW_ALL_PATTERN.search(source))
    obfuscated_owner = bool(STRICT_HIDDEN_OWNER.search(source))

    # ── Confirmed fund-loss patterns ────────────────────────────────────────
    if f.get("has_honeypot_pattern"):
        findings.append(
            Finding(
                "honeypot",
                "Honeypot pattern",
                "CRITICAL",
                100,
                "A buy path exists while selling is blocked in the same contract.",
                True,
            )
        )
    if f.get("has_sell_restriction"):
        findings.append(
            Finding(
                "sell_restriction",
                "Sell restriction",
                "CRITICAL",
                90,
                "Code explicitly conditions or reverts on selling.",
                True,
            )
        )
    if obfuscated_owner and (drain or f.get("has_eth_withdrawal") or f.get("has_selfdestruct")):
        findings.append(
            Finding(
                "hidden_owner_drain",
                "Hidden owner with fund withdrawal",
                "CRITICAL",
                90,
                "A private or internal owner address is combined with a withdrawal or "
                "selfdestruct path.",
                True,
            )
        )
    if f.get("has_mint") and (drain or withdraw_all) and f.get("has_owner"):
        findings.append(
            Finding(
                "mint_and_drain",
                "Privileged mint plus fund extraction",
                "CRITICAL",
                90,
                "The owner can mint supply and separately drain the contract's balance, which "
                "is enough to inflate and exit.",
                True,
            )
        )
    if f.get("has_arbitrary_transfer"):
        findings.append(
            Finding(
                "arbitrary_transfer",
                "Arbitrary transfer",
                "CRITICAL",
                85,
                "The contract exposes the ability to move tokens from any address.",
                True,
            )
        )
    if f.get("has_uncapped_tax") and f.get("has_blacklist"):
        findings.append(
            Finding(
                "tax_and_blacklist",
                "Uncapped tax with blacklist",
                "CRITICAL",
                85,
                "Owners can raise fees without a cap and block specific holders from transferring.",
                True,
            )
        )

    # ── Strong but unconfirmed signals ──────────────────────────────────────
    if (drain or withdraw_all) and not findings:
        findings.append(
            Finding(
                "drain_function",
                "Drain-style function",
                "HIGH",
                35 if withdraw_all else 50,
                "A function named drain/rugPull/withdrawAll exists. Verify who can call it.",
            )
        )
    if f.get("has_fallback_trap"):
        findings.append(
            Finding(
                "fallback_trap",
                "Dangerous fallback",
                "HIGH",
                45,
                "The fallback function performs selfdestruct, delegatecall or a raw call.",
            )
        )
    if f.get("has_selfdestruct"):
        findings.append(
            Finding(
                "selfdestruct",
                "Selfdestruct present",
                "HIGH",
                20,
                "The contract can be destroyed, and any balance moves to a designated address.",
            )
        )
    if f.get("has_unlimited_mint"):
        findings.append(
            Finding(
                "unlimited_mint",
                "Uncapped minting",
                "HIGH",
                12 if bridge else 25,
                "A privileged address can mint more supply with no maximum."
                + (
                    " This is expected for a bridge-issued token, where supply follows locked deposits."
                    if bridge
                    else ""
                ),
            )
        )
    if f.get("has_uncapped_tax"):
        findings.append(
            Finding(
                "uncapped_tax",
                "Uncapped fee changes",
                "HIGH",
                40,
                "Fees can be changed by an owner with no maximum in code.",
            )
        )
    if f.get("has_eth_withdrawal") and f.get("has_owner"):
        findings.append(
            Finding(
                "eth_withdrawal",
                "Owner ETH withdrawal",
                "MEDIUM",
                22,
                "An owner-controlled path can withdraw the contract's ETH balance.",
            )
        )

    # ── Contextual, low-weight signals ──────────────────────────────────────
    if f.get("proxy_no_timelock"):
        findings.append(
            Finding(
                "upgradeable_no_timelock",
                "Upgradeable without timelock",
                "MEDIUM",
                15,
                "Storage or proxy logic can be replaced by an admin with no delay.",
            )
        )
    if f.get("has_blacklist"):
        findings.append(
            Finding(
                "blacklist",
                "Blacklist mechanism",
                "MEDIUM",
                20,
                "Addresses can be blocked from transferring."
                + (" Standard for bridged assets." if bridge else ""),
            )
        )
    if f.get("has_gas_restriction"):
        findings.append(
            Finding(
                "gas_restriction",
                "Gas-dependent conditions",
                "MEDIUM",
                18,
                "gasleft() appears in a condition, which can be used to block sells.",
            )
        )
    if f.get("has_tx_origin"):
        findings.append(
            Finding(
                "tx_origin",
                "tx.origin authorisation",
                "MEDIUM",
                12 if bridge else 18,
                "Authorisation compares tx.origin, which a phishing contract can satisfy."
                + (" Common in bridge deposit paths that credit the original sender." if bridge else ""),
            )
        )
    if f.get("has_dynamic_tax"):
        findings.append(
            Finding(
                "dynamic_tax",
                "Owner-adjustable fees",
                "MEDIUM",
                12,
                "Fee/tax setters exist; check the enforced maximum.",
            )
        )
    if f.get("has_hidden_owner"):
        findings.append(
            Finding(
                "hidden_owner",
                "Obfuscated privileged address",
                "MEDIUM",
                6,
                "A private or hashed owner reference exists. On its own this is a pattern, not proof.",
            )
        )

    # ── Quality signals: reported, never decisive ───────────────────────────
    if f.get("has_assembly_caller"):
        findings.append(
            Finding(
                "assembly_caller",
                "Assembly with caller",
                "LOW",
                6,
                "Inline assembly reads the caller. Present in most modern proxy and token code.",
            )
        )
    if f.get("has_hash_access_control"):
        findings.append(
            Finding(
                "hash_access",
                "Hashed access control",
                "LOW",
                5,
                "keccak256 over msg.sender or a stored owner constant.",
            )
        )
    if f.get("is_old_solidity"):
        findings.append(
            Finding(
                "old_solidity",
                "Pre-0.6 compiler",
                "LOW",
                5,
                "Compiled with Solidity < 0.6, before overflow checks were default.",
            )
        )

    findings.sort(key=lambda item: -item.weight)
    return findings


def evaluate_bytecode(facts: dict) -> list[Finding]:
    """
    Rules that work without source code.

    Selector presence is reliable: a 4-byte dispatch entry cannot appear by
    accident the way a keyword can. Delegatecall and selfdestruct can appear as
    push data, so they are reported as low-weight observations only.
    """
    findings: list[Finding] = []
    if not facts:
        return findings

    if facts.get("is_minimal_proxy"):
        findings.append(
            Finding(
                "minimal_proxy",
                "Minimal proxy",
                "MEDIUM",
                15,
                "EIP-1167 clone: the logic lives in another contract and can be swapped.",
            )
        )
    if facts.get("is_erc1967_proxy"):
        findings.append(
            Finding(
                "erc1967_proxy",
                "Upgradeable proxy",
                "MEDIUM",
                15,
                "EIP-1967 implementation slot present; logic is replaceable by the admin.",
            )
        )
    if facts.get("has_mint_selector") and not facts.get("has_renounce_selector"):
        findings.append(
            Finding(
                "bytecode_mint",
                "Mint entry point",
                "HIGH",
                45,
                "The bytecode dispatches a mint(address,uint256) or mint(uint256) selector "
                "and has no renounceOwnership entry point.",
            )
        )
    elif facts.get("has_mint_selector"):
        findings.append(
            Finding(
                "bytecode_mint_renounceable",
                "Mint entry point, renounceable",
                "MEDIUM",
                20,
                "Mint selector present, and ownership can be renounced.",
            )
        )
    if facts.get("has_owner_selector") and not facts.get("has_renounce_selector"):
        findings.append(
            Finding(
                "bytecode_owner_no_renounce",
                "Owner with no renounce",
                "LOW",
                10,
                "owner() is dispatched but renounceOwnership() is not present.",
            )
        )
    if facts.get("has_delegatecall"):
        findings.append(
            Finding(
                "bytecode_delegatecall",
                "Delegatecall opcode",
                "LOW",
                5,
                "DELEGATECALL appears in the bytecode; ordinary for proxies, also used by attacks.",
            )
        )

    findings.sort(key=lambda item: -item.weight)
    return findings


def rule_score(findings: list[Finding]) -> int:
    """Sum of weights, capped. Deliberately additive: every point is traceable."""
    return min(100, sum(item.weight for item in findings))


def fuse(
    rules: int,
    ai: Optional[int],
    findings: list[Finding],
    status: str,
    rule_weight: float = 0.7,
) -> tuple[int, float]:
    """
    Combine the engines.

    Returns (score, confidence). `ai is None` means the model could not run, and
    the result is rules-only at low confidence rather than a fabricated 90.
    """
    if status == "INSUFFICIENT_DATA":
        return 0, 0.15

    if ai is None:
        combined = rules
        confidence = 0.45 if status == "BYTECODE_ONLY" else 0.3
    else:
        combined = round(rules * rule_weight + ai * (1 - rule_weight))
        confidence = 0.9 if status == "PROXY_RESOLVED" else 0.8

    # Only corroborated, confirmed criticals may force the top band.
    if any(item.confirmed and item.severity == "CRITICAL" for item in findings):
        combined = max(combined, 90)
        confidence = max(confidence, 0.75)

    # A lone unconfirmed signal must not read as a verdict.
    if findings and not any(item.confirmed for item in findings) and len(findings) <= 2:
        combined = min(combined, 59)

    # An overwhelming rule total means several independent checks agreed; the
    # model should not be able to argue it back down.
    if rules >= 90:
        combined = max(combined, 90)

    # The mirror case: the model is confident and the rules are quiet. A 70/30
    # average would erase that signal, so it lifts the floor to MEDIUM and never
    # lets the result read SAFE.
    if ai is not None and ai >= 80:
        combined = max(combined, 55)

    return int(combined), round(confidence, 2)


def verdict_for(score: int) -> tuple[str, str]:
    if score >= 80:
        return "CRITICAL", "Treat this contract as hostile."
    if score >= 60:
        return "HIGH", "Review this contract before interacting with it."
    if score >= 40:
        return "MEDIUM", "Check the flagged signals before trading."
    if score >= 20:
        return "LOW", "Standard precautions apply."
    return "SAFE", "No rug pull patterns matched."


def recommendation_for(score: int, findings: list[Finding]) -> str:
    top = [item for item in findings if item.severity in ("CRITICAL", "HIGH")][:3]

    if score >= 80:
        body = (
            "Confirmed patterns consistent with a scam:\n"
            + "\n".join(f"  - {item.title}: {item.evidence}" for item in top)
            if top
            else "Multiple critical findings."
        )
        return (
            "Do not interact with this contract.\n\n"
            + body
            + "\n\nNothing below a full audit and a timelocked, multisig-owned deployment "
            "changes this result."
        )
    if score >= 60:
        return (
            "Treat this as high risk until verified.\n\n"
            + "\n".join(f"  - {item.title}: {item.evidence}" for item in top)
            + "\n\nCheck who controls the privileged functions, whether liquidity is locked, "
            "and whether an independent audit exists."
        )
    if score >= 40:
        return (
            "Some risk signals are present but none are conclusive.\n\n"
            + "\n".join(f"  - {item.title}: {item.evidence}" for item in top)
            + "\n\nVerify the team, the ownership address and the liquidity lock before trading."
        )
    return (
        "No dangerous patterns were matched by either engine.\n\n"
        "This is not an audit: it means the checks we run found nothing. "
        "Standard due diligence still applies."
    )
