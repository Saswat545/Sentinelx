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

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass





# ── Import our feature extractor ─────────────────────────────────────────────
# In production this file sits next to main.py
try:
    # Works when Render starts ``uvicorn main:app`` from backend/.
    from feature_extractor import extract_features, extract_features_from_address, fetch_source_code
except ImportError:
    # Works when the project is started from its repository root.
    from .feature_extractor import extract_features, extract_features_from_address, fetch_source_code

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
        "http://localhost:3000",
        "http://localhost:5173",
    ],
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
    chain: Optional[str] = "ETH"     # ETH, BSC, POLYGON


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


# ── Utility functions ─────────────────────────────────────────────────────────

ETH_ADDRESS_RE = __import__("re").compile(r"^0x[a-fA-F0-9]{40}$")

def is_eth_address(text: str) -> bool:
    return bool(ETH_ADDRESS_RE.match(text.strip()))


def score_to_verdict(score: int) -> tuple[str, str]:
    """Return (verdict_code, verdict_label) for a given score."""
    if score >= 80:
        return "CRITICAL", "Critical Risk — Do Not Invest"
    elif score >= 60:
        return "HIGH",     "High Risk — Extreme Caution"
    elif score >= 40:
        return "MEDIUM",   "Medium Risk — Verify Carefully"
    elif score >= 20:
        return "LOW",      "Low Risk — Standard Precautions"
    else:
        return "SAFE",     "Likely Safe — Still Do Your Research"


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

    input_type    = "unknown"
    token_address = None
    contract_name = None
    source_code   = None

    # ── Case 1: Token address ─────────────────────────────────
    if is_eth_address(raw_input):
        input_type    = "token_address"
        token_address = raw_input

        if not ETHERSCAN_API_KEY:
            raise HTTPException(500,
                "ETHERSCAN_API_KEY not set. "
                "Set it in .env or Render environment variables."
            )

        # Fetch source from Etherscan V2
        source_code = fetch_source_code(raw_input, ETHERSCAN_API_KEY, req.chain)

        if not source_code:
            # Unverified contract — automatic high risk
            return AnalyzeResponse(
                risk_score=90,
                verdict="CRITICAL",
                verdict_label="Critical Risk — Unverified Contract",
                rug_probability=0.90,
                input_type=input_type,
                flags=[FlagItem(
                    name="Unverified Source Code",
                    severity="CRITICAL",
                    description="Contract source code is not verified on Etherscan. "
                                "No legitimate project hides their code."
                )],
                shap_top_features=[],
                recommendation=(
                    "🚫 CRITICAL: Source code not verified on Etherscan.\n\n"
                    "This is an automatic red flag. Every legitimate project verifies "
                    "their source code. An unverified contract means:\n"
                    "  • The team is hiding what the code does\n"
                    "  • There is no way to audit it\n"
                    "  • This is a common pattern in exit scams\n\n"
                    "DO NOT INVEST in unverified contracts."
                ),
                model_used=False,
                analysis_time_ms=int((time.time() - start_ms) * 1000),
                token_address=token_address,
            )

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

    # ── ML scoring ────────────────────────────────────────────
    risk_score, rug_prob = run_model(features)
    model_used = model is not None

    # ── Critical override ─────────────────────────────────────
    # If 2+ critical flags → minimum 90 score
    # If 1 critical flag  → minimum 75 score
    raw_flags    = features_to_flags(features)
    critical_cnt = sum(1 for f in raw_flags if f["severity"] == "CRITICAL")
    if critical_cnt >= 2 and risk_score < 90:
        risk_score = 90
        rug_prob   = 0.90
    elif critical_cnt == 1 and risk_score < 75:
        risk_score = 75
        rug_prob   = 0.75

    # ── SHAP explanation ──────────────────────────────────────
    shap_features = get_shap_explanation(features)

    # ── Build response ────────────────────────────────────────
    verdict, verdict_label = score_to_verdict(risk_score)
    recommendation = score_to_recommendation(risk_score, raw_flags)

    flag_items = [
        FlagItem(name=f["name"], severity=f["severity"], description=f["description"])
        for f in raw_flags
    ]

    return AnalyzeResponse(
        risk_score=risk_score,
        verdict=verdict,
        verdict_label=verdict_label,
        rug_probability=round(rug_prob, 4),
        input_type=input_type,
        flags=flag_items,
        shap_top_features=shap_features,
        recommendation=recommendation,
        model_used=model_used,
        analysis_time_ms=int((time.time() - start_ms) * 1000),
        token_address=token_address,
        contract_name=contract_name,
    )
