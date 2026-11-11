"""
Bulk evaluation — score real verified contracts with the real model.

Pipeline:
  1. discover token contracts from Etherscan token-transfer pages (no guessing)
  2. fetch verified Solidity for each, cached and resumable, throttled below the
     free tier's 5 requests/second
  3. score locally through the same code path /analyze uses:
     extract_features -> run_model -> features_to_flags -> critical override
  4. write per-contract results and print the distribution

Etherscan answers each getsourcecode call in roughly 2 seconds from here, so the
fetches run in a small thread pool. Scoring itself is local and takes
milliseconds per contract.

Usage (resumable — rerun with a higher target to continue):
    python backend/scripts/eval_bulk.py --target 400
    python backend/scripts/eval_bulk.py --target 1000
"""

import argparse
import json
import sys
import time
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[2]
BACKEND = ROOT / "backend"
SCRIPTS = BACKEND / "scripts"
CACHE_PATH = SCRIPTS / "cache_sources.json"
CANDIDATES_PATH = SCRIPTS / "cache_candidates.json"
RESULTS_PATH = SCRIPTS / "bulk_results.json"

ETHERSCAN = "https://api.etherscan.io/v2/api"

# High-volume addresses, used only to enumerate token contracts that exist.
# No labels come from here: the point is a random sample of real deployed code.
DISCOVERY_SOURCES = [
    # Exchange wallets: broad but repeating sets of popular tokens.
    "0x28C6c06298d514Db089934071355E5743bf21d60",
    "0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549",
    "0xDFd5293D8e347dFe59E90eFd55b2956a1343963d",
    "0x9696f59E4d72E237BE84fFD425DCaD154Bf96976",
    # Uniswap routers, taken from this repo's own example contracts. They move
    # thousands of distinct tokens, which is what makes the sample wide.
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
]

WORKERS = 6          # ~3 req/s at the observed 2s latency, under the 5/s cap
DISCOVERY_THROTTLE = 0.25


def api_key() -> str:
    text = (ROOT / ".env").read_text(encoding="utf-8", errors="ignore")
    for line in text.splitlines():
        if line.strip().startswith("ETHERSCAN_API_KEY"):
            _, _, value = line.partition("=")
            return value.strip().strip("'\"")
    raise SystemExit("ETHERSCAN_API_KEY missing from .env")


KEY = api_key()


def etherscan(params: dict, timeout: int = 25) -> dict:
    merged = {"chainid": 1, "apikey": KEY, **params}
    res = requests.get(ETHERSCAN, params=merged, timeout=timeout)
    res.raise_for_status()
    return res.json()


def read_json(path: Path, default):
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return default
    return default


def write_json(path: Path, payload) -> None:
    path.write_text(json.dumps(payload), encoding="utf-8")


# ── discovery ────────────────────────────────────────────────────────────────

def discover(need: int) -> list[str]:
    cached = read_json(CANDIDATES_PATH, [])
    found: list[str] = list(cached)
    seen: set[str] = set(found)

    if len(found) >= need:
        print(f"candidates: {len(found)} (cached)")
        return found

    for source in DISCOVERY_SOURCES:
        for page in range(1, 11):
            if len(found) >= need:
                break
            try:
                body = etherscan(
                    {
                        "module": "account",
                        "action": "tokentx",
                        "address": source,
                        "page": page,
                        "offset": 1000,
                        "sort": "desc",
                    }
                )
            except Exception as exc:
                print(f"  discovery {source[:10]} page {page}: {exc}")
                break

            rows = body.get("result") or []
            if not isinstance(rows, list) or not rows:
                break

            for row in rows:
                address = (row.get("contractAddress") or "").lower()
                if address and address not in seen:
                    seen.add(address)
                    found.append(address)

            print(f"  discovery {source[:10]} p{page}: {len(found)} candidates")
            time.sleep(DISCOVERY_THROTTLE)

    write_json(CANDIDATES_PATH, found)
    return found


# ── source fetching ──────────────────────────────────────────────────────────

def fetch_one(address: str) -> tuple[str, str, dict | None]:
    """Return (state, address, payload). Retries transient failures."""
    for attempt in range(3):
        try:
            body = etherscan({"module": "contract", "action": "getsourcecode", "address": address})
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


def fetch_sources(candidates: list[str], cache: dict, target: int) -> None:
    verified = cache["verified"]
    unverified = set(cache["unverified"])
    failed = set(cache["missing"])

    pending = [a for a in candidates if a not in verified and a not in unverified and a not in failed]
    print(
        f"cache: {len(verified)} verified, {len(unverified)} unverified, {len(failed)} failed "
        f"| pending {len(pending)} | target {target}"
    )

    batch_size = WORKERS * 3
    done = 0

    while pending and len(verified) < target:
        batch, pending = pending[:batch_size], pending[batch_size:]

        with ThreadPoolExecutor(max_workers=WORKERS) as pool:
            for state, address, payload in pool.map(fetch_one, batch):
                done += 1
                if state == "verified":
                    verified[address] = payload
                elif state == "unverified":
                    unverified.add(address)
                else:
                    failed.add(address)

        write_json(
            CACHE_PATH,
            {"verified": verified, "unverified": list(unverified), "missing": list(failed)},
        )
        print(
            f"  [{done}] verified={len(verified)} unverified={len(unverified)} failed={len(failed)}",
            flush=True,
        )

    print(f"fetch stage finished at {len(verified)} verified sources")


# ── scoring ──────────────────────────────────────────────────────────────────

def verdict_for(score: int) -> str:
    if score >= 90:
        return "CRITICAL"
    if score >= 70:
        return "HIGH"
    if score >= 40:
        return "MEDIUM"
    if score >= 20:
        return "LOW"
    return "SAFE"


def score_locally(cache: dict) -> list[dict]:
    sys.path.insert(0, str(BACKEND))
    from main import extract_features, features_to_flags, run_model, model  # noqa: E402

    print(f"model loaded: {model is not None}")
    results: list[dict] = []

    for address, entry in cache["verified"].items():
        try:
            features = extract_features(entry["source"])
            score, probability = run_model(features)
            flags = features_to_flags(features)

            critical = sum(1 for flag in flags if flag["severity"] == "CRITICAL")
            overridden = False
            if critical >= 2 and score < 90:
                score, probability, overridden = 90, 0.90, True
            elif critical == 1 and score < 75:
                score, probability, overridden = 75, 0.75, True

            results.append(
                {
                    "address": address,
                    "name": entry["name"],
                    "pragma": entry["pragma"],
                    "chars": len(entry["source"]),
                    "score": int(score),
                    "probability": round(float(probability), 4),
                    "verdict": verdict_for(int(score)),
                    "model_used": model is not None,
                    "overridden": overridden,
                    "flags": [flag["name"] for flag in flags],
                }
            )
        except Exception as exc:
            results.append({"address": address, "name": entry.get("name"), "error": str(exc)})

    return results


def report(results: list[dict]) -> None:
    scored = [r for r in results if "score" in r]
    failed = [r for r in results if "error" in r]

    print("\n=== bulk evaluation ===")
    print(f"contracts scored: {len(scored)}")
    print(f"scoring errors:   {len(failed)}")
    if not scored:
        return

    scores = sorted(r["score"] for r in scored)
    print(
        f"mean {sum(scores) / len(scores):.1f}   median {scores[len(scores) // 2]}   "
        f"min {scores[0]}   max {scores[-1]}"
    )

    print("\nverdict spread:")
    for verdict, count in Counter(r["verdict"] for r in scored).most_common():
        print(f"  {verdict:<9}{count:>6}  ({count / len(scored) * 100:.1f}%)")

    buckets = Counter(min(9, r["score"] // 10) for r in scored)
    print("\nscore deciles:")
    for bucket in range(10):
        count = buckets.get(bucket, 0)
        bar = "#" * round(count / len(scored) * 60)
        print(f"  {bucket * 10:>3}-{bucket * 10 + 9:<4}{count:>6} {bar}")

    overridden = [r for r in scored if r["overridden"]]
    print(
        f"\nrule override raised the model score: {len(overridden)} "
        f"({len(overridden) / len(scored) * 100:.1f}%)"
    )

    flag_counts: Counter = Counter()
    for result in scored:
        flag_counts.update(result["flags"])
    print("\ntop flags across the corpus:")
    for flag, count in flag_counts.most_common(15):
        print(f"  {flag:<30}{count:>6}  ({count / len(scored) * 100:.1f}%)")

    critical = [r for r in scored if r["score"] >= 90]
    print(f"\ncontracts at 90+: {len(critical)}")
    for result in critical[:10]:
        print(
            f"  {result['score']:>3} {result['name'][:32]:<32} "
            f"{','.join(result['flags'][:3]) or '-'}"
        )

    write_json(RESULTS_PATH, results)
    print(f"\nwrote {RESULTS_PATH}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--target", type=int, default=400)
    args = parser.parse_args()

    cache = read_json(CACHE_PATH, {"verified": {}, "unverified": [], "missing": []})
    cache.setdefault("verified", {})
    cache.setdefault("unverified", [])
    cache.setdefault("missing", [])
    print(f"verified sources cached: {len(cache['verified'])}")

    if len(cache["verified"]) < args.target:
        need = max(args.target * 2, 600)
        candidates = discover(need)
        # Unverified contracts cannot be scored, so a "failed" lookup is retried
        # on the next run, but a definitive "unverified" answer is not.
        cache["missing"] = []
        fetch_sources(candidates, cache, args.target)

    results = score_locally(cache)
    report(results)


if __name__ == "__main__":
    main()
