"""
SENTINELX API — main.py
======================
FastAPI backend for SentinelX AI.

Endpoints:
  POST /analyze        — analyze contract code or token address
  GET  /health         — health check + model status
  GET  /metrics        — model accuracy metrics
  GET  /docs           — auto-generated API docs (built into FastAPI)

How to run locally:
  uvicorn main:app --reload --port 8000

Then open: http://localhost:8000/docs
"""
import sys
import os
import json
import time
import pickle
import numpy as np
import requests
from typing import Optional
from collections import defaultdict
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from solana_engine import analyze_solana, is_solana_address

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass





# ── Import our feature extractor ─────────────────────────────────────────────
# In production this file sits next to main.py
try:
    # Works when Render starts ``uvicorn main:app`` from backend/.
    from feature_extractor import (
        CHAIN_IDS,
        bytecode_facts,
        extract_features,
        extract_features_from_address,
        fetch_contract_meta,
        fetch_source_code,
    )
    from risk_engine import (
        evaluate_bytecode,
        evaluate_rules,
        fuse,
        recommendation_for,
        rule_score,
        verdict_for,
    )
except ImportError:
    # Works when the project is started from its repository root.
    from .feature_extractor import (
        CHAIN_IDS,
        bytecode_facts,
        extract_features,
        extract_features_from_address,
        fetch_contract_meta,
        fetch_source_code,
    )
    from .risk_engine import (
        evaluate_bytecode,
        evaluate_rules,
        fuse,
        recommendation_for,
        rule_score,
        verdict_for,
    )

load_dotenv()

# ── App setup ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="SentinelX API",
    description="AI-powered smart contract risk intelligence",
    version="2.0.0",
)

# Allow frontend (Vercel) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sentinelx.site",
        "https://www.sentinelx.site",
        "https://rug-guard-vmuy.vercel.app",
        "https://sentinelx-git-main-saswat545s-projects.vercel.app",
        "https://sentinelx-pksgzpb3e-saswat545s-projects.vercel.app",
        "https://sentinelx-seven-ashen.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_origin_regex=r"https://sentinelx.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ── Rate Limiting ───────────────────────────────────────────────────────────
# In-memory sliding window rate limiter.
# Render free tier runs a single instance, so this is sufficient.
# For multi-instance deployments, replace with Redis-backed limiter.

RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX_REQUESTS = 10  # per window per IP

_rate_limit_store: dict[str, list[float]] = defaultdict(list)


def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Only rate-limit the /analyze endpoint
    if request.url.path == "/analyze" and request.method == "POST":
        client_ip = _get_client_ip(request)
        now = time.time()
        # Remove expired entries
        _rate_limit_store[client_ip] = [
            t for t in _rate_limit_store[client_ip] if now - t < RATE_LIMIT_WINDOW
        ]
        if len(_rate_limit_store[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded",
                    "message": f"Maximum {RATE_LIMIT_MAX_REQUESTS} analyses per minute. Please wait and try again.",
                    "retry_after": int(RATE_LIMIT_WINDOW - (now - _rate_limit_store[client_ip][0]))
                }
            )
        _rate_limit_store[client_ip].append(now)
    response = await call_next(request)
    return response


# ── Load model artifacts ──────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(BASE_DIR, "models", "rugguard_v2.pkl")
COLS_PATH = os.path.join(BASE_DIR, "models", "feature_columns.pkl")
EXPLAINER_PATH = os.path.join(BASE_DIR, "models", "shap_explainer.pkl")
METRICS_PATH = os.path.join(BASE_DIR, "models", "metrics.json")
ETHERSCAN_API_KEY  = os.getenv("ETHERSCAN_API_KEY", "")
model     = None
feat_cols = None
explainer = None
metrics   = {}

def load_models():
    global model, feat_cols, explainer, metrics
    try:
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
        with open(COLS_PATH, "rb") as f:
            feat_cols = pickle.load(f)
        print(f"✅ Model loaded — {len(feat_cols)} features")
    except FileNotFoundError:
        print("⚠️  Model files not found. Train the model first.")
        print("   API will still work but will return rule-based scores only.")

    try:
        with open(EXPLAINER_PATH, "rb") as f:
            explainer = pickle.load(f)
        print("✅ SHAP explainer loaded")
    except Exception:
        print("⚠️  SHAP explainer not found (optional)")

    try:
        with open(METRICS_PATH, "r") as f:
            metrics = json.load(f)
        print(f"✅ Metrics loaded — accuracy {metrics.get('accuracy', '?')}")
    except Exception:
        pass

load_models()


# ── Request / Response models ─────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    input: str                        # token address OR raw Solidity code
    chain: Optional[str] = "ETH"     # ETH, BSC, POLYGON, ARB, BASE, OP, AVAX


class FlagItem(BaseModel):
    name: str
    severity: str          # CRITICAL, HIGH, MEDIUM, LOW
    description: str


class AnalyzeResponse(BaseModel):
    risk_score: int                   # 0-100
    verdict: str                      # CRITICAL / HIGH / MEDIUM / LOW
    verdict_label: str                # human-readable label
    rug_probability: float            # 0.0-1.0
    input_type: str                   # "token_address" or "contract_code"
    flags: list[FlagItem]
    shap_top_features: list[dict]     # top SHAP signals for "why" panel
    recommendation: str
    model_used: bool                  # True if ML model ran, False if rule-only
    analysis_time_ms: int
    token_address: Optional[str] = None
    contract_name: Optional[str] = None
    rule_score: int = 0               # deterministic rules alone, 0-100
    ai_score: Optional[int] = None    # model alone, 0-100 (None when it could not run)
    confidence: float = 0.0           # how much evidence supports the verdict
    status: str = "VERIFIED"          # VERIFIED / PROXY_RESOLVED / BYTECODE_ONLY / ONCHAIN_STATE / INSUFFICIENT_DATA
    findings: list[dict] = []         # per-rule evidence for the explanation panel


# ── Utility functions ─────────────────────────────────────────────────────────

ETH_ADDRESS_RE = __import__("re").compile(r"^0x[a-fA-F0-9]{40}$")

def is_eth_address(text: str) -> bool:
    return bool(ETH_ADDRESS_RE.match(text.strip()))


def score_to_verdict(score: int) -> tuple[str, str]:
    """Return (verdict_code, verdict_label) for a given score."""
    if score >= 80:
        return "CRITICAL", "Treat this contract as hostile."
    elif score >= 60:
        return "HIGH",     "Review this contract before interacting with it."
    elif score >= 40:
        return "MEDIUM",   "Check the flagged signals before trading."
    elif score >= 20:
        return "LOW",      "Standard precautions apply."
    else:
        return "SAFE",     "No rug pull patterns matched."


def score_to_recommendation(score: int, flags: list) -> str:
    critical_flags = [f for f in flags if f["severity"] == "CRITICAL"]

    if score >= 80:
        return (
            "🚫 CRITICAL RISK — Do not invest under any circumstances.\n\n"
            f"Detected {len(critical_flags)} critical vulnerability/ies in this contract. "
            "The contract has structural patterns consistent with confirmed rug pulls:\n"
            + "\n".join(f"  • {f['name']}: {f['description']}" for f in critical_flags[:3])
            + "\n\nRequired before any investment: Professional security audit (CertiK/PeckShield level), "
            "timelock on all privileged functions, multi-signature ownership, "
            "and public renouncement of dangerous functions."
        )
    elif score >= 60:
        return (
            "⚠️ HIGH RISK — Invest only with amounts you can afford to lose entirely.\n\n"
            "This contract has significant privilege concentration or economic manipulation risks. "
            "Verify: team identity, liquidity lock duration (6+ months), "
            "third-party audit completion, and community sentiment before investing."
        )
    elif score >= 40:
        return (
            "⚠️ MEDIUM RISK — Independent verification required before investing.\n\n"
            "Some risk signals present but no critical vulnerabilities detected. "
            "Steps: verify team on LinkedIn/GitHub, check for audit report, "
            "confirm liquidity is locked, test with a small amount first."
        )
    else:
        return (
            "✅ LOWER RISK — Basic security checks passed.\n\n"
            "No critical vulnerabilities detected. "
            "Standard due diligence still applies: "
            "verify team credibility, check audit status, "
            "and never invest more than you can afford to lose.\n\n"
            "Note: This is automated analysis only, not financial advice."
        )


def features_to_flags(features: dict) -> list[dict]:
    """Convert feature dict into human-readable flag list."""
    flag_map = [
        # (feature_key, severity, name, description)
        ("has_honeypot_pattern",     "CRITICAL", "Honeypot",
         "Buy enabled but sell appears restricted — classic honeypot pattern"),
        ("has_hidden_owner",         "CRITICAL", "Hidden Owner",
         "Privileged address obfuscated via hash or private variable"),
        ("has_tx_origin",            "CRITICAL", "tx.origin Usage",
         "tx.origin used in economic context — phishing vulnerability"),
        ("has_fallback_trap",        "CRITICAL", "Fallback Trap",
         "Dangerous logic (selfdestruct/delegatecall) inside fallback()"),
        ("has_drain_function",       "CRITICAL", "Drain Function",
         "Function named drain/rescue/withdrawAll — direct fund extraction risk"),
        ("has_selfdestruct",         "HIGH",     "Selfdestruct",
         "Contract can destroy itself and transfer all ETH to owner"),
        ("has_unlimited_mint",       "HIGH",     "Unlimited Mint",
         "Owner can mint infinite tokens with no supply cap"),
        ("has_uncapped_tax",         "HIGH",     "Uncapped Tax",
         "Dynamic fee/tax with no maximum cap — owner can set to 100%"),
        ("proxy_no_timelock",        "HIGH",     "Proxy Without Timelock",
         "Upgradeable proxy with no timelock — owner can replace logic silently"),
        ("has_arbitrary_transfer",   "HIGH",     "Arbitrary Transfer",
         "Owner may be able to transfer tokens from any address"),
        ("has_sell_restriction",     "HIGH",     "Sell Restriction",
         "Explicit sell restriction detected in contract code"),
        ("selfdestruct_and_owner",   "HIGH",     "Owner + Selfdestruct",
         "Owner-controlled selfdestruct — high fund drain risk"),
        ("mint_and_owner_no_cap",    "HIGH",     "Mint + No Cap",
         "Owner can mint tokens with no maximum supply limit"),
        ("has_dynamic_tax",          "MEDIUM",   "Dynamic Tax",
         "Tax/fee can be changed by owner after deployment"),
        ("has_assembly_caller",      "MEDIUM",   "Assembly Caller",
         "Low-level assembly with caller — possible hidden backdoor"),
        ("has_hash_access_control",  "MEDIUM",   "Hash-based Access",
         "Access control via keccak256 — obfuscated ownership pattern"),
        ("has_gas_restriction",      "MEDIUM",   "Gas Restriction",
         "gasleft() used in conditions — may block sell transactions"),
        ("hidden_owner_and_drain",   "CRITICAL", "Hidden Owner + Drain",
         "Combination of hidden ownership and fund extraction capability"),
        ("is_old_solidity",          "MEDIUM",   "Old Solidity Version",
         "Pragma < 0.6.0 — missing security improvements and overflow protection"),
        ("has_blacklist",            "MEDIUM",   "Blacklist Mechanism",
         "Contract can blacklist addresses from transacting"),
    ]

    flags = []
    for key, severity, name, desc in flag_map:
        if features.get(key, 0) == 1:
            flags.append({"name": name, "severity": severity, "description": desc})

    # Sort: CRITICAL first, then HIGH, MEDIUM, LOW
    order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    flags.sort(key=lambda x: order.get(x["severity"], 99))
    return flags


def get_shap_explanation(features: dict) -> list[dict]:
    """
    Get top SHAP feature contributions for this contract.
    Falls back to rule-based importance if SHAP not available.
    """
    if explainer is None or feat_cols is None:
        # Fallback: return non-zero risk features ranked by risk weight
        risk_weights = {
            "has_honeypot_pattern": 60, "has_hidden_owner": 50,
            "has_tx_origin": 40, "has_drain_function": 40,
            "has_fallback_trap": 40, "has_selfdestruct": 35,
            "has_unlimited_mint": 30, "proxy_no_timelock": 30,
            "has_uncapped_tax": 25, "has_dynamic_tax": 15,
        }
        result = []
        for k, w in sorted(risk_weights.items(), key=lambda x: -x[1]):
            if features.get(k, 0) == 1:
                result.append({"feature": k, "impact": w, "direction": "risk"})
        return result[:8]

    try:
        row = np.array([[features.get(c, 0) for c in feat_cols]], dtype=float)
        shap_vals = explainer.shap_values(row)[0]
        shap_df = sorted(
            zip(feat_cols, shap_vals),
            key=lambda x: abs(x[1]),
            reverse=True
        )
        return [
            {
                "feature": k,
                "impact": round(float(abs(v)), 4),
                "direction": "risk" if v > 0 else "safe",
                "feature_value": int(features.get(k, 0))
            }
            for k, v in shap_df[:8]
        ]
    except Exception:
        return []


def run_model(features: dict) -> tuple[int, float]:
    """
    Run ML model on features.
    Returns (risk_score_0_100, probability_0_1).
    Falls back to rule-based score if model not loaded.
    """
    if model is None or feat_cols is None:
        # Rule-based fallback scoring
        weights = {
            "has_honeypot_pattern": 60, "has_hidden_owner": 50,
            "has_tx_origin": 40, "has_drain_function": 40,
            "has_fallback_trap": 40, "selfdestruct_and_owner": 35,
            "has_unlimited_mint": 30, "proxy_no_timelock": 30,
            "hidden_owner_and_drain": 35, "has_uncapped_tax": 25,
            "has_dynamic_tax": 15, "has_blacklist": 10,
            "has_assembly_caller": 15, "mint_and_owner_no_cap": 20,
        }
        score = 15  # base floor
        for k, w in weights.items():
            if features.get(k, 0) == 1:
                score += w
        score = min(score, 100)
        return score, score / 100

    try:
        row = np.array([[features.get(c, 0) for c in feat_cols]], dtype=float)
        prob = float(model.predict_proba(row)[0][1])
        score = int(round(prob * 100))
        return score, prob
    except Exception as e:
        return 50, 0.5


# ── API Endpoints ─────────────────────────────────────────────────────────────


@app.get("/")
def root():
    """Friendly root route so the bare API URL doesn't 404."""
    return {
        "service": "SentinelX API",
        "status": "live",
        "version": "2.0.0",
        "model_loaded": model is not None,
        "docs": "/docs",
        "endpoints": ["/analyze", "/health", "/metrics"],
        "message": "This is the SentinelX backend API. Use the frontend website to interact with it, or POST to /analyze directly."
    }


@app.get("/health")
def health():
    """Health check — confirms API is running and model status."""
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "shap_loaded": explainer is not None,
        "features": len(feat_cols) if feat_cols else 0,
        "version": "2.0.0",
    }


@app.get("/metrics")
def get_metrics():
    """Return model evaluation metrics (accuracy, F1, AUC, confusion matrix)."""
    if not metrics:
        return {"message": "Model not trained yet."}
    return metrics


def analyze_unverified(meta: dict, token_address: Optional[str], start_ms: float) -> AnalyzeResponse:
    """
    Unverified contract: score what the bytecode does instead of a flat 90.

    A missing source is an absence of evidence, not evidence of fraud. When the
    bytecode cannot be read either, the honest answer is UNKNOWN.
    """
    facts = bytecode_facts(meta.get("bytecode") or "")
    findings = evaluate_bytecode(facts)
    elapsed = int((time.time() - start_ms) * 1000)

    if not facts:
        return AnalyzeResponse(
            risk_score=0,
            verdict="UNKNOWN",
            verdict_label="Not enough evidence to judge this contract.",
            rug_probability=0.0,
            input_type="token_address",
            flags=[FlagItem(
                name="No source and no bytecode",
                severity="MEDIUM",
                description="Etherscan has no verified source for this address and the "
                            "bytecode could not be read, so neither engine could run. "
                            "This is not a clean result.",
            )],
            shap_top_features=[],
            recommendation=(
                "There is not enough evidence to score this contract. Treat unknown as "
                "unverified: read the bytecode yourself or ask the deployer to verify "
                "the source before trading."
            ),
            model_used=False,
            analysis_time_ms=elapsed,
            token_address=token_address,
            contract_name=meta.get("name"),
            rule_score=0,
            ai_score=None,
            confidence=0.15,
            status="INSUFFICIENT_DATA",
            findings=[],
        )

    rules = rule_score(findings)
    score, confidence = fuse(rules, None, findings, "BYTECODE_ONLY")
    verdict, band_label = verdict_for(score)

    flags = [
        FlagItem(name=item.title, severity=item.severity, description=item.evidence)
        for item in findings
    ] or [FlagItem(
        name="Unverified source",
        severity="LOW",
        description="No source on Etherscan, but the bytecode shows no mint, owner or "
                    "proxy entry points that this engine checks for.",
    )]

    return AnalyzeResponse(
        risk_score=score,
        verdict=verdict,
        verdict_label=f"{band_label} Scored from bytecode; the source is unverified.",
        rug_probability=round(score / 100, 4),
        input_type="token_address",
        flags=flags,
        shap_top_features=[],
        recommendation=recommendation_for(score, findings),
        model_used=False,
        analysis_time_ms=elapsed,
        token_address=token_address,
        contract_name=meta.get("name"),
        rule_score=rules,
        ai_score=None,
        confidence=confidence,
        status="BYTECODE_ONLY",
        findings=[item.as_dict() for item in findings],
    )


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    """
    Main analysis endpoint.

    Input:  { "input": "0x123..." }  OR  { "input": "pragma solidity..." }
    Output: Full risk assessment with score, flags, SHAP explanation, recommendation.
    """
    start_ms = time.time()

    raw_input = req.input.strip()
    if not raw_input:
        raise HTTPException(400, "Input cannot be empty")
    if len(raw_input) < 10:
        raise HTTPException(400, "Input too short — paste a full contract or token address")
    if len(raw_input) > 500_000:
        raise HTTPException(413, "Input too large — maximum 500,000 characters")

    chain = (req.chain or "ETH").upper()

    # Solana is not an EVM chain: its tokens have no verified source and no
    # Etherscan entry, so this path reads chain state instead.
    if chain == "SOL" or (is_solana_address(raw_input) and not is_eth_address(raw_input)):
        try:
            return AnalyzeResponse(**analyze_solana(raw_input.strip()))
        except Exception as exc:
            raise HTTPException(502, f"Solana RPC unavailable: {exc}")

    # An unknown chain must not fall back to Ethereum: that returns a confident
    # score about a different chain's contract.
    if chain not in CHAIN_IDS:
        raise HTTPException(
            400,
            f"Unsupported chain '{req.chain}'. Supported: {', '.join(sorted(CHAIN_IDS))}",
        )

    input_type    = "unknown"
    token_address = None
    contract_name = None
    source_code   = None
    meta          = {}
    status        = "VERIFIED"

    # ── Case 1: Token address ─────────────────────────────────
    if is_eth_address(raw_input):
        input_type    = "token_address"
        token_address = raw_input

        if not ETHERSCAN_API_KEY:
            raise HTTPException(500,
                "ETHERSCAN_API_KEY not set. "
                "Set it in .env or Render environment variables."
            )

        # ── Normalisation: resolve a proxy to the logic it actually runs ──
        meta = fetch_contract_meta(raw_input, ETHERSCAN_API_KEY, chain)
        source_code = meta["source"]
        contract_name = meta["name"]

        if meta["is_proxy"] and meta["implementation"]:
            implementation = fetch_contract_meta(meta["implementation"], ETHERSCAN_API_KEY, chain)
            if implementation["source"]:
                source_code = implementation["source"]
                contract_name = f"{meta['name'] or 'Proxy'} implementation"
                status = "PROXY_RESOLVED"

        if not source_code:
            # No source: score the bytecode rather than returning a flat 90.
            return analyze_unverified(meta, token_address, start_ms)

    # ── Case 2: Raw Solidity code ─────────────────────────────
    else:
        input_type  = "contract_code"
        source_code = raw_input

        # Basic validation
        solidity_keywords = ["function", "contract", "pragma", "address",
                             "uint", "mapping", "public", "private"]
        if not any(kw in source_code.lower() for kw in solidity_keywords):
            raise HTTPException(
                400,
                "Does not appear to be valid Solidity code. "
                "Paste the full contract source or a token address (0x...)"
            )

    # ── Feature extraction ────────────────────────────────────
    features = extract_features(source_code)

    # ── ML engine (30% of the fused score) ────────────────────
    ai_raw, _model_probability = run_model(features)
    ai_score = int(ai_raw) if model is not None else None
    model_used = model is not None

    # ── Rule engine (70% of the fused score) ──────────────────
    findings = evaluate_rules(features, source_code or "", contract_name or "")
    rules = rule_score(findings)

    # ── Fusion: weights, confidence, confirmed-critical override ──
    risk_score, confidence = fuse(rules, ai_score, findings, status)

    # ── SHAP explanation ──────────────────────────────────────
    shap_features = get_shap_explanation(features)

    # ── Build response ────────────────────────────────────────
    verdict, verdict_label = verdict_for(risk_score)
    recommendation = recommendation_for(risk_score, findings)

    flag_items = [
        FlagItem(name=item.title, severity=item.severity, description=item.evidence)
        for item in findings
    ]

    return AnalyzeResponse(
        risk_score=risk_score,
        verdict=verdict,
        verdict_label=verdict_label,
        rug_probability=round(risk_score / 100, 4),
        input_type=input_type,
        flags=flag_items,
        shap_top_features=shap_features,
        recommendation=recommendation,
        model_used=model_used,
        analysis_time_ms=int((time.time() - start_ms) * 1000),
        token_address=token_address,
        contract_name=contract_name,
        rule_score=rules,
        ai_score=ai_score,
        confidence=confidence,
        status=status,
        findings=[item.as_dict() for item in findings],
    )
