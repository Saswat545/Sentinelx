"""
Cross-chain sanity check — does the Ethereum-trained model behave on other chains?

The model was fit and evaluated on Ethereum source. Nothing in the feature set is
Ethereum-specific (the features read Solidity), but that is an argument, not
evidence. This script produces the evidence:

  1. a control list of well-known, verified blue chips per chain — a sane model
     must not call USDC or WETH dangerous
  2. a seeded random sample of that chain's indexed token contracts, to see the
     distribution rather than hand-picked code
  3. the Ethereum baseline recomputed from bulk_results.json with the same code,
     so "worse than Ethereum" is a measurement and not an impression

Sampling uses CoinGecko's per-chain token list as the population and Etherscan v2
`getsourcecode` for the source itself. The Etherscan free plan refuses `logs` and
`proxy` on Base, OP and Avalanche and its public RPCs cap log ranges, so transfer
logs are not a portable way to enumerate these chains.

Scoring runs through the API's own functions (extract_features -> run_model ->
features_to_flags) plus the CRITICAL override, so the numbers match /analyze.

Usage:
    python backend/scripts/eval_chains.py --per-chain 25
"""

import argparse
import json
import random
import sys
import time
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[2]
BACKEND = ROOT / "backend"
SCRIPTS = BACKEND / "scripts"
LISTS = SCRIPTS / "token_lists"
RESULTS_PATH = SCRIPTS / "chain_results.json"
BASELINE_PATH = SCRIPTS / "bulk_results.json"

ETHERSCAN = "https://api.etherscan.io/v2/api"

CHAINS = {"ARB": 42161, "BASE": 8453, "OP": 10, "AVAX": 43114}
LIST_SLUGS = {
    "ARB": "arbitrum-one",
    "BASE": "base",
    "OP": "optimistic-ethereum",
    "AVAX": "avalanche",
}

# Verified, widely held tokens. Every one of these should land in LOW or SAFE:
# a HIGH here is a false positive that would scare someone off a blue chip.
KNOWN_GOOD = {
    "ARB": [
        ("USDC.e", "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"),
        ("WETH", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"),
        ("USDT", "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"),
        ("DAI", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"),
        ("LINK", "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4"),
        ("WBTC", "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f"),
    ],
    "BASE": [
        ("USDC", "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"),
        ("WETH", "0x4200000000000000000000000000000000000006"),
        ("DAI", "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"),
        ("USDbC", "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA"),
        ("cbETH", "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22"),
        ("AERO", "0x940181a94A35A4569E4529A3CDfB74e38FD98631"),
        ("LINK", "0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196"),
    ],
    "OP": [
        ("OP", "0x4200000000000000000000000000000000000042"),
        ("USDC", "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85"),
        ("USDC.e", "0x7F5c764cBc14f9669B88837ca1490cCa17c31607"),
        ("WETH", "0x4200000000000000000000000000000000000006"),
        ("DAI", "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"),
        ("LINK", "0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6"),
        ("USDT", "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58"),
    ],
    "AVAX": [
        ("WAVAX", "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"),
        ("USDC", "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"),
        ("USDT", "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7"),
        ("DAI.e", "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70"),
        ("LINK.e", "0x5947BB275c521040051D82396192181b413227A3"),
        ("WBTC.e", "0x50b7545627a5162F82A992c33b87aDc75187B218"),
        ("JOE", "0x6e84a6216eA6dACC71Ee8E6b0a5B7322EEbC0fDd"),
    ],
}

WORKERS = 6          # ~3 req/s at the observed 2s latency, under the 5/s cap
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0 Safari/537.36"}


def api_key() -> str:
    text = (ROOT / ".env").read_text(encoding="utf-8", errors="ignore")
    for line in text.splitlines():
        if line.strip().startswith("ETHERSCAN_API_KEY"):
            _, _, value = line.partition("=")
            return value.strip().strip("'\"")
    raise SystemExit("ETHERSCAN_API_KEY missing from .env")


KEY = api_key()


def etherscan(chain: str, params: dict, timeout: int = 25) -> dict:
    merged = {"chainid": CHAINS[chain], "apikey": KEY, **params}
    res = requests.get(ETHERSCAN, params=merged, timeout=timeout)
    res.raise_for_status()
    return res.json()


# ── sampling ─────────────────────────────────────────────────────────────────

def token_list(chain: str) -> list[dict]:
    LISTS.mkdir(parents=True, exist_ok=True)
    path = LISTS / f"{chain.lower()}.json"
    if not path.exists():
        res = requests.get(
            f"https://tokens.coingecko.com/{LIST_SLUGS[chain]}/all.json",
            headers=UA,
            timeout=40,
        )
        res.raise_for_status()
        path.write_text(json.dumps(res.json().get("tokens", [])), encoding="utf-8")
    return json.loads(path.read_text(encoding="utf-8"))


def sample_addresses(chain: str, need: int, seed: int) -> list[str]:
    known = {address.lower() for _, address in KNOWN_GOOD[chain]}
    population = []
    seen: set[str] = set()
    for token in token_list(chain):
        address = (token.get("address") or "").lower()
        if not address or address in known or address in seen:
            continue
        seen.add(address)
        population.append(address)

    picked = random.Random(seed).sample(population, min(need, len(population)))
    print(f"[{chain}] population {len(population)}, sampling {len(picked)}")
    return picked


# ── source fetching ──────────────────────────────────────────────────────────

def fetch_one(chain: str, address: str) -> tuple[str, str, dict | None]:
    for attempt in range(3):
        try:
            body = etherscan(
                chain, {"module": "contract", "action": "getsourcecode", "address": address}
            )
        except Exception:
            time.sleep(0.8 * (attempt + 1))
            continue

        result = body.get("result")
        if body.get("status") == "0" and isinstance(result, str) and "rate limit" in result.lower():
            time.sleep(1.5 * (attempt + 1))
            continue

        rows = result if isinstance(result, list) else []
        entry = rows[0] if rows else {}
        source = (entry.get("SourceCode") or "").strip()

        if source and len(source) > 40:
            cleaned = source
            if cleaned.startswith("{{") and cleaned.endswith("}}"):
                cleaned = cleaned[2:-2]
            return (
                "verified",
                address,
                {
                    "name": entry.get("ContractName") or "(unnamed)",
                    "source": cleaned,
                    "pragma": entry.get("CompilerVersion") or "",
                },
            )
        return ("unverified", address, None)

    return ("failed", address, None)


def fetch_sources(chain: str, addresses: list[str]) -> dict:
    verified: dict[str, dict] = {}
    total = len(addresses)
    done = 0
    batch_size = WORKERS * 3

    while addresses:
        batch, addresses = addresses[:batch_size], addresses[batch_size:]
        with ThreadPoolExecutor(max_workers=WORKERS) as pool:
            for state, address, payload in pool.map(lambda a: fetch_one(chain, a), batch):
                done += 1
                if state == "verified":
                    verified[address.lower()] = payload
        if done % 10 == 0 or done == total:
            print(f"  {chain} fetch [{done}/{total}] verified={len(verified)}", flush=True)

    return verified


# ── scoring ──────────────────────────────────────────────────────────────────

def score_locally(chain: str, verified: dict, labels: dict) -> list[dict]:
    sys.path.insert(0, str(BACKEND))
    from main import extract_features, features_to_flags, run_model, score_to_verdict  # noqa: E402

    results: list[dict] = []
    for address, entry in verified.items():
        try:
            features = extract_features(entry["source"])
            score, probability = run_model(features)
            score = int(score)
            flags = features_to_flags(features)

            critical = sum(1 for flag in flags if flag["severity"] == "CRITICAL")
            overridden = False
            if critical >= 2 and score < 90:
                score, probability, overridden = 90, 0.90, True
            elif critical == 1 and score < 75:
                score, probability, overridden = 75, 0.75, True

            verdict, _ = score_to_verdict(score)
            results.append(
                {
                    "chain": chain,
                    "address": address,
                    "label": labels.get(address),
                    "name": entry["name"],
                    "chars": len(entry["source"]),
                    "score": score,
                    "probability": round(float(probability), 4),
                    "verdict": verdict,
                    "overridden": overridden,
                    "flags": [flag["name"] for flag in flags],
                }
            )
        except Exception as exc:
            results.append(
                {
                    "chain": chain,
                    "address": address,
                    "label": labels.get(address),
                    "name": entry.get("name"),
                    "error": str(exc),
                }
            )
    return results


def stats(scores: list[int]) -> dict:
    if not scores:
        return {"n": 0}
    ordered = sorted(scores)
    return {
        "n": len(ordered),
        "median": ordered[len(ordered) // 2],
        "mean": round(sum(ordered) / len(ordered), 1),
        "min": ordered[0],
        "max": ordered[-1],
        "pct_60_plus": round(sum(1 for s in ordered if s >= 60) / len(ordered) * 100, 1),
        "pct_75_exact": round(sum(1 for s in ordered if s == 75) / len(ordered) * 100, 1),
        "pct_90_plus": round(sum(1 for s in ordered if s >= 90) / len(ordered) * 100, 1),
        "pct_20_below": round(sum(1 for s in ordered if s < 20) / len(ordered) * 100, 1),
    }


def eth_baseline() -> dict | None:
    if not BASELINE_PATH.exists():
        return None
    data = json.loads(BASELINE_PATH.read_text(encoding="utf-8"))
    return stats([row["score"] for row in data if "score" in row])


def report(chain: str, results: list[dict], unverified: int) -> dict:
    scored = [r for r in results if "score" in r]
    errors = [r for r in results if "error" in r]
    known = [r for r in scored if r["label"]]
    sampled = [r for r in scored if not r["label"]]

    print(f"\n=== {chain} ===")
    print(
        f"scored {len(scored)} (control {len(known)}, sampled {len(sampled)}), "
        f"unverified {unverified}, errors {len(errors)}"
    )

    if known:
        print("\nknown-good control:")
        for row in sorted(known, key=lambda r: -r["score"]):
            flags = ", ".join(row["flags"][:3]) or "-"
            print(
                f"  {row['label']:<8}{row['score']:>4} {row['verdict']:<9}"
                f"{row['name'][:24]:<25}{flags}"
            )
        control = stats([r["score"] for r in known])
        print(
            f"  control median {control['median']}  max {control['max']}  "
            f">=60: {control['pct_60_plus']}%  (<20: {control['pct_20_below']}%)"
        )
    else:
        control = {"n": 0}

    if sampled:
        sample = stats([r["score"] for r in sampled])
        print(
            f"\nsampled distribution: median {sample['median']}  mean {sample['mean']}  "
            f"max {sample['max']}  >=60 {sample['pct_60_plus']}%  "
            f"exactly 75 {sample['pct_75_exact']}%  >=90 {sample['pct_90_plus']}%"
        )
        flag_counts: Counter = Counter()
        for row in sampled:
            flag_counts.update(row["flags"])
        print("  top flags: " + ", ".join(f"{k} {v}" for k, v in flag_counts.most_common(5)))
    else:
        sample = {"n": 0}

    return {"chain": chain, "control": control, "sample": sample, "results": results}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--per-chain", type=int, default=25, help="sampled contracts per chain")
    parser.add_argument("--seed", type=int, default=7, help="sampling seed (fixed for repeatability)")
    args = parser.parse_args()

    reports = []
    for chain in CHAINS:
        labels = {address.lower(): symbol for symbol, address in KNOWN_GOOD[chain]}
        sample = sample_addresses(chain, args.per_chain, args.seed)
        addresses = list(labels) + sample

        print(f"[{chain}] fetching {len(addresses)} sources from Etherscan chain {CHAINS[chain]}")
        verified = fetch_sources(chain, addresses)
        unverified = sum(1 for address in addresses if address.lower() not in verified)
        print(f"[{chain}] verified {len(verified)}/{len(addresses)}")

        results = score_locally(chain, verified, labels)
        reports.append(report(chain, results, unverified))

    print("\n=== summary ===")
    baseline = eth_baseline()
    if baseline:
        print(
            f"ETH baseline (bulk_results.json): n={baseline['n']} median {baseline['median']} "
            f">=60 {baseline['pct_60_plus']}% exactly75 {baseline['pct_75_exact']}%"
        )
    print(
        f"{'chain':<7}{'ctrl med':>9}{'ctrl max':>9}{'ctrl>=60%':>11}"
        f"{'smp med':>9}{'smp>=60%':>10}{'=75%':>7}{'>=90%':>7}"
    )
    for entry in reports:
        c, s = entry["control"], entry["sample"]
        print(
            f"{entry['chain']:<7}{c.get('median', '-'):>9}{c.get('max', '-'):>9}"
            f"{c.get('pct_60_plus', '-'):>11}{s.get('median', '-'):>9}"
            f"{s.get('pct_60_plus', '-'):>10}{s.get('pct_75_exact', '-'):>7}"
            f"{s.get('pct_90_plus', '-'):>7}"
        )

    RESULTS_PATH.write_text(json.dumps(reports, indent=1), encoding="utf-8")
    print(f"\nwrote {RESULTS_PATH}")


if __name__ == "__main__":
    main()
