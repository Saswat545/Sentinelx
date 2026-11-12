"""
Validate the hybrid weighting instead of assuming 70:30 is optimal.

Three questions, each measured:

  1. False positives on known-good tokens. The old engine called 14 of 27 blue
     chips HIGH or CRITICAL across Arbitrum, Base, Optimism and Avalanche
     (52%). The hybrid has to do better than that, with proxy resolution on.
  2. Distribution on the 490-contract Ethereum corpus. A good change should move
     contracts off the artificial 75 floor without inventing new 90s.
  3. A known honeypot must still be CRITICAL. Lowering false positives is only
     acceptable if true positives survive.

Also sweeps the rule weight so the 70:30 target can be confirmed or replaced.

Usage:
    python backend/scripts/eval_hybrid.py
    python backend/scripts/eval_hybrid.py --refetch
"""

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BACKEND = ROOT / "backend"
SCRIPTS = BACKEND / "scripts"
CONTROL_CACHE = SCRIPTS / "cache_control_sources.json"
ETH_CACHE = SCRIPTS / "cache_sources.json"

sys.path.insert(0, str(BACKEND))
sys.path.insert(0, str(SCRIPTS))

from feature_extractor import bytecode_facts, extract_features, fetch_contract_meta  # noqa: E402
from main import run_model  # noqa: E402
from risk_engine import evaluate_bytecode, evaluate_rules, fuse, rule_score  # noqa: E402
from eval_chains import CHAINS, KNOWN_GOOD, KEY  # noqa: E402

HONEYPOT_PATH = ROOT / "_hp.sol"
SYNTHETIC_HONEYPOT = """
pragma solidity ^0.4.24;
contract Honeypot {
    address owner;
    mapping(address => bool) public blacklist;
    function buy() public payable { }
    function sell(uint256 amount) public {
        require(msg.sender == owner);
        require(!blacklist[msg.sender]);
        msg.sender.transfer(amount);
    }
    function setTax(uint256 fee) public { require(msg.sender == owner); }
}
"""


def legacy_score(features: dict) -> int:
    """The previous /analyze logic: model score plus the blunt critical floor."""
    score, _ = run_model(features)
    score = int(score)
    critical = sum(
        1
        for flag in _legacy_flags(features)
        if flag["severity"] == "CRITICAL"
    )
    if critical >= 2 and score < 90:
        return 90
    if critical == 1 and score < 75:
        return 75
    return score


def _legacy_flags(features: dict) -> list[dict]:
    from main import features_to_flags

    return features_to_flags(features)


def hybrid_score(source: str, name: str, weight: float) -> dict:
    features = extract_features(source)
    ai, _ = run_model(features)
    ai = int(ai)
    findings = evaluate_rules(features, source, name or "")
    rules = rule_score(findings)
    score, confidence = fuse(rules, ai, findings, "VERIFIED", rule_weight=weight)
    return {
        "score": score,
        "rule": rules,
        "ai": ai,
        "confidence": confidence,
        "findings": [item.title for item in findings],
    }


def load_control_sources(refetch: bool) -> dict:
    cache = {}
    if CONTROL_CACHE.exists() and not refetch:
        cache = json.loads(CONTROL_CACHE.read_text(encoding="utf-8"))

    for chain in CHAINS:
        for symbol, address in KNOWN_GOOD[chain]:
            key = f"{chain}:{address.lower()}"
            if key in cache and cache[key].get("source"):
                continue

            meta = fetch_contract_meta(address, KEY, chain)
            source = meta.get("source")
            name = meta.get("name") or symbol
            resolved = False

            if meta.get("is_proxy") and meta.get("implementation"):
                impl = fetch_contract_meta(meta["implementation"], KEY, chain)
                if impl.get("source"):
                    source = impl["source"]
                    name = f"{name} implementation"
                    resolved = True

            cache[key] = {
                "symbol": symbol,
                "source": source,
                "name": name,
                "resolved": resolved,
            }

    CONTROL_CACHE.write_text(json.dumps(cache), encoding="utf-8")
    return cache


def pct(values: list[int], threshold: int) -> float:
    return round(sum(1 for v in values if v >= threshold) / len(values) * 100, 1) if values else 0.0


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--refetch", action="store_true")
    args = parser.parse_args()

    control = load_control_sources(args.refetch)
    print(f"control sources: {sum(1 for v in control.values() if v.get('source'))}/{len(control)}")

    eth = {}
    if ETH_CACHE.exists():
        eth = json.loads(ETH_CACHE.read_text(encoding="utf-8")).get("verified", {})
    print(f"eth corpus: {len(eth)} sources")

    weights = [0.6, 0.7, 0.8]

    # ── 1. known-good control ────────────────────────────────────────────────
    print("\n=== known-good control (blue chips, proxies resolved) ===")
    rows = []
    for key, entry in control.items():
        if not entry.get("source"):
            continue
        features = extract_features(entry["source"])
        legacy = legacy_score(features)
        hybrid = {w: hybrid_score(entry["source"], entry["name"], w) for w in weights}
        rows.append((key, entry, legacy, hybrid))

    print(f"{'token':<10}{'chain':<7}{'legacy':>7}" + "".join(f"{'w=' + str(w):>9}" for w in weights))
    for key, entry, legacy, hybrid in sorted(rows, key=lambda r: -r[3][0.7]["score"]):
        chain = key.split(":")[0]
        mark = "*" if hybrid[0.7]["score"] < legacy else " "
        print(
            f"{entry['symbol']:<10}{chain:<7}{legacy:>7}"
            + "".join(f"{hybrid[w]['score']:>9}" for w in weights)
            + f"  {mark}"
        )

    for w in weights:
        legacy_fp = pct([legacy for _, _, legacy, _ in rows], 60)
        hybrid_fp = pct([hybrid[w]["score"] for _, _, _, hybrid in rows], 60)
        print(f"  weight {w}: legacy FP {legacy_fp}% -> hybrid FP {hybrid_fp}%")

    # ── 2. ethereum corpus ──────────────────────────────────────────────────
    if eth:
        print("\n=== Ethereum corpus (490 verified contracts) ===")
        legacy_scores, hybrid_scores = [], {w: [] for w in weights}
        for address, entry in eth.items():
            source = entry.get("source") or ""
            if not source:
                continue
            features = extract_features(source)
            legacy_scores.append(legacy_score(features))
            for w in weights:
                hybrid_scores[w].append(hybrid_score(source, entry.get("name") or "", w)["score"])

        def summary(label: str, scores: list[int]) -> None:
            ordered = sorted(scores)
            print(
                f"  {label:<14} median {ordered[len(ordered) // 2]:>3}  "
                f">=60 {pct(scores, 60):>5}%  >=90 {pct(scores, 90):>5}%  "
                f"exactly75 {round(sum(1 for s in scores if s == 75) / len(scores) * 100, 1):>5}%"
            )

        summary("legacy", legacy_scores)
        for w in weights:
            summary(f"hybrid w={w}", hybrid_scores[w])

    # ── 3. true positives ───────────────────────────────────────────────────
    print("\n=== true positives ===")
    hp_source = (
        HONEYPOT_PATH.read_text(encoding="utf-8", errors="ignore")
        if HONEYPOT_PATH.exists()
        else SYNTHETIC_HONEYPOT
    )
    label = "_hp.sol" if HONEYPOT_PATH.exists() else "synthetic honeypot"
    features = extract_features(hp_source)
    print(f"  {label}: legacy {legacy_score(features)}")
    for w in weights:
        result = hybrid_score(hp_source, "Honeypot", w)
        print(
            f"    hybrid w={w}: {result['score']} (rules {result['rule']}, ai {result['ai']}) "
            f"{result['findings'][:3]}"
        )

    facts = bytecode_facts(
        "0x6080604052348015600f57600080fd5b506004361060285760003560e01c806340c10f1914602d5780638da5cb5b"
        "14604c575b600080fd5b"
    )
    bytecode_findings = evaluate_bytecode(facts)
    print(
        "  unverified bytecode fixture: "
        + (", ".join(f"{i.title}({i.weight})" for i in bytecode_findings) or "no findings")
    )


if __name__ == "__main__":
    main()
