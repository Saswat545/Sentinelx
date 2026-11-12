"""
FEATURE_EXTRACTOR.PY — RugGuard ML Pipeline
=============================================
Fetches verified source code from Etherscan V2 API
and extracts 53 ML features from Solidity contracts.

Usage:
  from feature_extractor import extract_features_from_address
  features = extract_features_from_address("0x123...", api_key="YOUR_KEY")
"""

import re
import time
import json
import requests
from typing import Optional

# ── Etherscan V2 (single endpoint, chain via chainid param) ──
ETHERSCAN_V2_URL = "https://api.etherscan.io/v2/api"
CHAIN_IDS = {
    # Every chain below is an Etherscan V2 chain id that answered
    # contract/getsourcecode on a free key. Chains whose source module is not
    # served return UNKNOWN rather than a wrong score.
    "ETH": 1,              # Ethereum
    "BSC": 56,             # BNB Smart Chain
    "POLYGON": 137,        # Polygon PoS
    "ARB": 42161,          # Arbitrum One
    "BASE": 8453,          # Base
    "OP": 10,              # OP Mainnet
    "AVAX": 43114,         # Avalanche C-Chain
    "LINEA": 59144,        # Linea
    "SCROLL": 534352,      # Scroll
    "MANTLE": 5000,        # Mantle
    "BLAST": 81457,        # Blast
    "ZKSYNC": 324,         # zkSync Era
    "CELO": 42220,         # Celo
    "GNOSIS": 100,         # Gnosis
    "SONIC": 146,          # Sonic
    "WORLD": 480,          # World Chain
    "UNICHAIN": 130,       # Unichain
    "BERACHAIN": 80094,    # Berachain
    "SEI": 1329,           # Sei
    "MONAD": 143,          # Monad
    "HYPEREVM": 999,       # HyperEVM
    "INK": 57073,          # Ink
    "SONEIUM": 1868,       # Soneium
    "ABSTRACT": 2741,      # Abstract
    "KATANA": 747474,      # Katana
    "PLASMA": 9745,        # Plasma
    "MEGAETH": 4326,       # MegaETH
    "STABLE": 988,         # Stable
    "ROBINHOOD": 4663,     # Robinhood Chain
    "ARC": 5042,           # Arc
    "FRAXTAL": 252,        # Fraxtal
    "TAIKO": 167000,       # Taiko
    "XDC": 50,             # XDC Network
    "BTT": 199,            # BitTorrent Chain
    "MEMECORE": 4352,      # Memecore
    "FANTOM": 250,         # Fantom
    "CRONOS": 25,          # Cronos
    "KAVA": 2222,          # Kava
    "METIS": 1088,         # Metis
    "MANTA": 169,          # Manta Pacific
    "FUSE": 122,           # Fuse
    "TELOS": 40,           # Telos
    "MERLIN": 4200,        # Merlin Chain
    "ELYSIUM": 1339,       # Elysium
    "APECHAIN": 33139,     # ApeChain
    "FLOW": 747,           # Flow EVM
    "INJECTIVE": 1776,     # Injective EVM
    "HEDERA": 295,         # Hedera
    "PULSECHAIN": 369,     # PulseChain
}


def chain_id_for(chain: str) -> int:
    """
    Resolve a chain code to its Etherscan chain id.

    Unknown codes used to fall back to Ethereum, which silently answered about
    the wrong chain's source code. Fail loudly instead.
    """
    key = (chain or "ETH").upper()
    if key not in CHAIN_IDS:
        raise ValueError(
            f"Unsupported chain '{chain}'. Supported: {', '.join(sorted(CHAIN_IDS))}"
        )
    return CHAIN_IDS[key]


def fetch_source_code(address: str, api_key: str, chain: str = "ETH") -> Optional[str]:
    """
    Fetch verified source code using Etherscan V2 API.
    Returns source string or None if unverified.
    Raises RuntimeError on hard API failures.
    """
    chain_id = chain_id_for(chain)

    params = {
        "chainid": chain_id,
        "module": "contract",
        "action": "getsourcecode",
        "address": address,
        "apikey": api_key,
    }

    try:
        r = requests.get(ETHERSCAN_V2_URL, params=params, timeout=15)

        if r.status_code == 403:
            raise RuntimeError(
                "403 Forbidden from Etherscan. "
                "Check API key at etherscan.io/myapikey"
            )
        if r.status_code != 200:
            raise RuntimeError(f"HTTP {r.status_code}: {r.text[:100]}")

        data = r.json()

        if "Invalid API Key" in str(data.get("result", "")):
            raise RuntimeError("Invalid API Key")

        if data.get("status") != "1" or not data.get("result"):
            return None  # Not verified — expected, not an error

        result = data["result"][0]
        source = result.get("SourceCode", "")

        if not source or len(source.strip()) < 100:
            return None

        # Handle multi-file JSON format (Hardhat/Foundry)
        cleaned = source.strip()
        if cleaned.startswith("{{"):
            cleaned = cleaned[1:-1]
        if cleaned.startswith('{"') or cleaned.startswith("{{"):
            try:
                parsed = json.loads(cleaned)
                if "sources" in parsed:
                    source = "\n".join(
                        v.get("content", "") for v in parsed["sources"].values()
                    )
            except Exception:
                pass

        return source

    except RuntimeError:
        raise
    except Exception as e:
        return None  # Network hiccup — caller will retry


# ── Contract metadata: proxy resolution and bytecode ────────────────────────

# EIP-1967 implementation slot and the EIP-1167 clone prefix are fixed constants,
# so a proxy can be recognised without reading its ABI.
ERC1967_SLOT = "360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
MINIMAL_PROXY_PREFIX = "363d3d373d3d3d363d73"

# 4-byte selectors. Unlike keywords, these cannot appear by accident in a
# dispatch table, which makes them usable on unverified bytecode.
SELECTORS = {
    "mint_address_uint": "40c10f19",
    "mint_uint": "a0712d68",
    "owner": "8da5cb5b",
    "renounce_ownership": "715018a6",
    "transfer_ownership": "f2fde38b",
    "pause": "8456cb59",
}


def fetch_contract_meta(address: str, api_key: str, chain: str = "ETH") -> dict:
    """
    One call for everything /analyze needs about an address.

    Returns the verified source, the contract name, whether Etherscan marks it as
    a proxy and which implementation it points at, plus the deployed bytecode when
    the plan allows reading it.
    """
    meta = {
        "source": None,
        "name": None,
        "is_proxy": False,
        "implementation": None,
        "bytecode": None,
        "verified": False,
    }

    params = {
        "chainid": chain_id_for(chain),
        "module": "contract",
        "action": "getsourcecode",
        "address": address,
        "apikey": api_key,
    }

    try:
        r = requests.get(ETHERSCAN_V2_URL, params=params, timeout=20)
        if r.status_code == 200:
            data = r.json()
            rows = data.get("result") if isinstance(data.get("result"), list) else []
            entry = rows[0] if rows else {}
            source = (entry.get("SourceCode") or "").strip()
            meta["name"] = entry.get("ContractName") or None
            meta["is_proxy"] = str(entry.get("Proxy") or "0") == "1"
            implementation = (entry.get("Implementation") or "").strip()
            meta["implementation"] = implementation or None

            if source and len(source) >= 100:
                cleaned = source
                if cleaned.startswith("{{") and cleaned.endswith("}}"):
                    cleaned = cleaned[1:-1]
                if cleaned.startswith('{'):
                    try:
                        parsed = json.loads(cleaned)
                        if "sources" in parsed:
                            cleaned = "\n".join(
                                v.get("content", "") for v in parsed["sources"].values()
                            )
                    except Exception:
                        pass
                meta["source"] = cleaned
                meta["verified"] = True
    except Exception:
        pass

    # eth_getCode is not on the free plan for every chain, so treat it as optional.
    try:
        r = requests.get(
            ETHERSCAN_V2_URL,
            params={
                "chainid": chain_id_for(chain),
                "module": "proxy",
                "action": "eth_getCode",
                "address": address,
                "tag": "latest",
                "apikey": api_key,
            },
            timeout=20,
        )
        if r.status_code == 200:
            body = r.json()
            code = body.get("result")
            if isinstance(code, str) and code.startswith("0x") and len(code) > 10:
                meta["bytecode"] = code
    except Exception:
        pass

    return meta


def bytecode_facts(code: str) -> dict:
    """Selector and proxy facts from deployed bytecode, for unverified contracts."""
    if not code or len(code) < 10:
        return {}

    body = code.lower()[2:] if code.lower().startswith("0x") else code.lower()
    facts = {
        "size": len(body) // 2,
        "is_minimal_proxy": body.startswith(MINIMAL_PROXY_PREFIX)
        or ("363d3d373d3d3d363d73" in body[:80]),
        "is_erc1967_proxy": ERC1967_SLOT in body,
        "has_delegatecall": "f4" in body,
    }

    for name, selector in SELECTORS.items():
        facts[f"has_{name}_selector"] = f"63{selector}" in body

    return facts


# ── Feature Extraction — 53 features ─────────────────────────────────────────

def extract_features(source_code: str) -> dict:
    """Extract 53 ML features from Solidity source code."""
    if not source_code:
        return _empty_features()

    code = source_code
    code_lower = code.lower()
    lines = code.split("\n")
    total_lines = len(lines)
    features = {}

    # ── 1. Ownership & Access Control ────────────────────────
    features["has_owner"]      = int("owner" in code_lower)
    features["has_onlyowner"]  = int("onlyowner" in code_lower)
    features["owner_count"]    = min(code_lower.count("owner"), 50)
    features["has_renounce"]   = int(
        "renounceownership" in code_lower or "owner = address(0)" in code_lower
    )
    features["has_hidden_owner"] = int(
        bool(re.search(r'address\s+(private|internal)\s+\w*(owner|admin|controller)', code_lower))
        or ("bytes32" in code_lower and "owner" in code_lower)
    )
    features["has_tx_origin"]  = int("tx.origin" in code_lower)
    features["has_multisig"]   = int("multisig" in code_lower or "gnosis" in code_lower)
    features["has_timelock"]   = int(
        "timelock" in code_lower or "executeafter" in code_lower
        or "queuedtransaction" in code_lower
    )
    features["has_delegatecall"] = int("delegatecall" in code_lower)
    features["has_proxy"] = int(
        "proxy" in code_lower or "uups" in code_lower
        or "erc1967" in code_lower or "transparentupgradeable" in code_lower
    )

    function_matches = re.findall(
        r'function\s+\w+\s*\([^)]*\)\s*(?:public|private|internal|external)?[^{]*\{',
        code, re.IGNORECASE
    )
    total_functions = len(function_matches)
    features["function_count"] = min(total_functions, 100)

    owner_controlled = len(re.findall(
        r'function\s+\w+[^{]*\b(onlyOwner|onlyowner|onlyRole|onlyAdmin)\b',
        code, re.IGNORECASE
    ))
    features["owner_controlled_functions"] = owner_controlled
    features["privilege_concentration"] = round(
        (owner_controlled / total_functions) if total_functions > 0 else 0, 3
    )

    # ── 2. Economic / Token Mechanics ─────────────────────────
    features["has_mint"] = int(bool(re.search(r'\bmint\b', code_lower)))
    features["has_unlimited_mint"] = int(
        features["has_mint"] == 1
        and features["has_owner"] == 1
        and not bool(re.search(r'(maxsupply|max_supply|supplylimit|cap)', code_lower))
    )
    features["has_supply_cap"] = int(
        bool(re.search(r'(maxsupply|max_supply|supplylimit|_cap|maxTokens)', code_lower))
    )
    features["has_dynamic_tax"] = int(bool(re.search(r'set(fee|tax|rate)', code_lower)))
    features["has_uncapped_tax"] = int(
        features["has_dynamic_tax"] == 1
        and not bool(re.search(r'max(fee|tax|rate)', code_lower))
    )
    features["has_blacklist"] = int(
        bool(re.search(r'\b(blacklist|blocklist|banned|forbidden)\b', code_lower))
    )
    features["has_whitelist"] = int(
        bool(re.search(r'\b(whitelist|allowlist|approved)\b', code_lower))
    )
    features["has_burn"]      = int(bool(re.search(r'\bburn\b', code_lower)))
    features["payable_count"] = min(len(re.findall(r'\bpayable\b', code_lower)), 30)

    # ── 3. Fund Drain Patterns ────────────────────────────────
    features["has_selfdestruct"] = int("selfdestruct" in code_lower)
    features["has_eth_withdrawal"] = int(
        bool(re.search(
            r'(owner|admin|msg\.sender)\s*\.\s*transfer\s*\(\s*address\s*\(\s*this\s*\)\s*\.\s*balance',
            code_lower
        ))
        or bool(re.search(r'withdraw.*address\(this\)\.balance', code_lower))
    )
    features["has_drain_function"] = int(
        bool(re.search(
            r'function\s+(drain|rescue|emergencyWithdraw|withdrawAll|rugPull)',
            code, re.IGNORECASE
        ))
    )
    features["has_arbitrary_transfer"] = int(
        bool(re.search(r'arbitrarilytransfer|arbitrarytransfer', code_lower))
    )
    fallback = re.search(
        r'fallback\s*\(\)\s*external[^{]*\{([^}]+)\}', code, re.IGNORECASE | re.DOTALL
    )
    features["has_fallback_trap"] = int(
        fallback is not None and any(
            x in fallback.group(1).lower()
            for x in ["selfdestruct", "delegatecall", "call(", "tx.origin"]
        )
    )

    # ── 4. Honeypot Signals ───────────────────────────────────
    features["has_sell_restriction"] = int(
        bool(re.search(r'(revert.*sell|require.*!sell|cannot\s*sell|selling\s*disabled)', code_lower))
    )
    has_buy  = bool(re.search(r'function\s+(buy|purchase)', code_lower))
    has_sell = bool(re.search(r'function\s+(sell|withdraw)', code_lower))
    sell_owner_only = bool(re.search(
        r'function\s+sell[^{]*\{[^}]*require\s*\(\s*msg\.sender\s*==\s*(owner|admin)',
        code, re.IGNORECASE | re.DOTALL
    ))
    features["has_honeypot_pattern"] = int(
        (has_buy and features["has_sell_restriction"] == 1)
        or (has_sell and sell_owner_only)
    )
    features["has_gas_restriction"] = int(
        bool(re.search(r'(require|if)\s*\(\s*gasleft\s*\(', code_lower))
    )
    features["has_transfer_block"] = int(
        bool(re.search(
            r'if\s*\([^)]*(_from|sender)\s*!=\s*(owner|_owner|admin)',
            code, re.IGNORECASE
        ))
        and ("revert" in code_lower or "require(false" in code_lower)
    )

    # ── 5. Obfuscation ────────────────────────────────────────
    features["has_assembly"]        = int("assembly" in code_lower)
    features["has_assembly_caller"] = int("assembly" in code_lower and "caller" in code_lower)
    features["has_hash_access_control"] = int(
        bool(re.search(r'keccak256\s*\(.*msg\.sender', code_lower))
        or bool(re.search(r'bytes32.*owner.*=.*keccak', code_lower))
    )
    features["has_encodepacked_msgsender"] = int(
        "abi.encodepacked" in code_lower and "msg.sender" in code_lower
    )

    # ── 6. Code Quality & Transparency ───────────────────────
    comment_lines = code.count("//") + code.count("/*") + code.count("*")
    features["comment_count"] = min(comment_lines, 200)
    features["comment_ratio"] = round(
        comment_lines / total_lines if total_lines > 0 else 0, 3
    )
    features["has_openzeppelin"]    = int("@openzeppelin" in code_lower or "openzeppelin" in code_lower)
    features["has_audit_reference"] = int(
        any(kw in code_lower for kw in ["audit", "certik", "peckshield", "quantstamp", "hacken", "slowmist"])
    )
    features["has_spdx_license"] = int("spdx-license-identifier" in code_lower)
    features["require_count"]    = min(len(re.findall(r'\brequire\b', code_lower)), 100)
    features["modifier_count"]   = min(len(re.findall(r'\bmodifier\b', code_lower)), 30)
    features["event_count"]      = min(len(re.findall(r'\bevent\b', code_lower)), 50)
    features["code_length"]      = min(len(source_code), 100000)
    features["total_lines"]      = min(total_lines, 5000)

    pragma = re.search(r'pragma\s+solidity\s+[\^~]?(\d+)\.(\d+)', code_lower)
    if pragma:
        features["solidity_major"]  = int(pragma.group(1))
        features["solidity_minor"]  = int(pragma.group(2))
        features["is_old_solidity"] = int(int(pragma.group(1)) == 0 and int(pragma.group(2)) < 6)
    else:
        features["solidity_major"]  = 0
        features["solidity_minor"]  = 0
        features["is_old_solidity"] = 0

    features["private_count"] = min(len(re.findall(r'\bprivate\b', code_lower)), 50)

    # ── 7. Interaction / Combined Features ───────────────────
    features["mint_and_owner_no_cap"]  = int(
        features["has_mint"] == 1 and features["has_owner"] == 1 and features["has_supply_cap"] == 0
    )
    features["selfdestruct_and_owner"] = int(
        features["has_selfdestruct"] == 1 and features["has_owner"] == 1
    )
    features["proxy_no_timelock"]      = int(
        features["has_proxy"] == 1 and features["has_timelock"] == 0
    )
    features["hidden_owner_and_drain"] = int(
        features["has_hidden_owner"] == 1
        and (features["has_eth_withdrawal"] == 1 or features["has_selfdestruct"] == 1)
    )

    return features


def _empty_features() -> dict:
    dummy = extract_features("pragma solidity ^0.8.0; contract X {}")
    return {k: 0 for k in dummy}


def extract_features_from_address(
    address: str, api_key: str, chain: str = "ETH", retry: int = 2
) -> dict:
    """Full pipeline: address → source → features dict."""
    source = None
    for attempt in range(retry):
        source = fetch_source_code(address, api_key, chain)
        if source:
            break
        if attempt < retry - 1:
            time.sleep(1)

    if not source:
        feats = _empty_features()
        feats["source_fetched"] = 0
        return feats

    feats = extract_features(source)
    feats["source_fetched"] = 1
    return feats


# ── Quick test ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    test_code = """
    pragma solidity ^0.8.0;
    contract ScamToken {
        address private _owner;
        constructor() { _owner = msg.sender; }
        function mint(uint256 amount) public { require(tx.origin == _owner); }
        function buy() external payable {}
        function sell(uint amount) external { require(msg.sender == _owner); }
        function drain() public { require(msg.sender == _owner); payable(_owner).transfer(address(this).balance); }
        fallback() external { selfdestruct(payable(_owner)); }
    }
    """
    features = extract_features(test_code)
    print(f"Total features: {len(features)}")
    non_zero = {k: v for k, v in features.items() if v != 0}
    print(f"Non-zero (risk signals): {len(non_zero)}")
    for k, v in sorted(non_zero.items()):
        print(f"  {k:40s} = {v}")