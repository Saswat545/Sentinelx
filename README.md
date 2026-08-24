<div align="center">

# SentinelX

### AI-Powered Blockchain Security & Rug Pull Detection

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-3776AB.svg)](https://www.python.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6.svg)](https://www.typescriptlang.org/)

[Website](https://sentinelx.site) · [Documentation](/docs) · [Report Bug](https://github.com/Saswat545/Sentinelx/issues)

</div>

---

## What is SentinelX?

SentinelX analyzes Ethereum smart contracts using **machine learning** and **static code analysis** to detect rug pulls, honeypots, and hidden backdoors — before you sign anything.

The platform combines an **XGBoost classifier** trained on 2,400+ labeled contracts with 53+ feature extraction signals, achieving **96.15% accuracy** on our evaluation dataset. Every risk score comes with **SHAP-based explainability** so you understand exactly why a contract was flagged.

## Key Features

| Feature | Description |
|---------|-------------|
| **Contract Scanner** | Paste any Ethereum address or Solidity source code for instant analysis |
| **ML Risk Scoring** | XGBoost model classifies contracts from 0-100 risk score |
| **53+ Security Signals** | Ownership analysis, token mechanics, permission patterns, liquidity signals |
| **Explainable AI** | SHAP feature attribution shows exactly why a score was assigned |
| **Real-time Detection** | Honeypots, hidden mints, blacklist abuse, proxy upgrades, fee manipulation |
| **Free Tier** | Basic scans without account. Full analysis with free signup |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│  React 19 · TypeScript · Tailwind CSS · Vite        │
│  Three.js · OGL · Framer Motion · React Router      │
├─────────────────────────────────────────────────────┤
│                    BACKEND                           │
│  FastAPI · Python 3.10+                              │
│  XGBoost · scikit-learn · SHAP · Etherscan API      │
├─────────────────────────────────────────────────────┤
│                   DATABASE                           │
│  Supabase (PostgreSQL) · Row Level Security          │
│  Auth · Real-time · Edge Functions                   │
└─────────────────────────────────────────────────────┘
```

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Tailwind CSS v4
- Three.js / OGL (WebGL shaders)
- Framer Motion / GSAP (animations)
- React Router v7
- Supabase JS Client

**Backend**
- Python 3.10+ / FastAPI
- XGBoost / scikit-learn
- SHAP (explainable AI)
- Etherscan API integration
- Supabase Python client

**Infrastructure**
- Supabase (Auth, Database, Realtime)
- Render (backend deployment)
- Vercel / Netlify (frontend deployment)

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- npm or pnpm
- Supabase account (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/Saswat545/Sentinelx.git
cd Sentinelx
```

### 2. Frontend setup

```bash
cd frontend
npm install

# Create environment file
cat > .env << EOF
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:8000
EOF

# Start development server
npm run dev
```

### 3. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create environment file
cat > .env << EOF
ETHERSCAN_API_KEY=your_etherscan_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
EOF

# Start the API server
uvicorn main:app --reload --port 8000
```

### 4. Database setup

Run the SQL migration in your Supabase Dashboard → SQL Editor:

```sql
-- See: frontend/supabase/migrations/001_profiles_rls.sql
```

This creates the `profiles`, `scan_history`, and `watchlist` tables with Row Level Security.

## Project Structure

```
Sentinelx/
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── bits/       # React Bits (Beams, ColorBends, etc.)
│   │   │   └── ui/         # Base components (Dots, BlurText, etc.)
│   │   ├── pages/          # Route pages
│   │   ├── lib/            # Auth, utilities
│   │   └── services/       # API clients
│   └── public/brand/       # Logo assets
├── backend/                # FastAPI server
│   ├── main.py             # API endpoints
│   ├── feature_extractor.py # 53+ feature extraction
│   └── requirements.txt    # Python dependencies
├── brand-logo/             # Brand assets (dark/light variants)
├── models/                 # Trained ML models
├── data/                   # Training datasets
└── illustrations/          # Design assets
```

## How It Works

```
Contract Address / Solidity Code
            │
            ▼
    ┌───────────────┐
    │   Input       │  Fetch from Etherscan or parse source
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │   Feature     │  Extract 53+ security signals
    │   Extraction  │  Ownership, permissions, liquidity, code patterns
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │   ML Model    │  XGBoost classifier (96.15% accuracy)
    │   Scoring     │  Binary rug-pull classification
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │   SHAP        │  Feature attribution for explainability
    │   Explain     │  Why this score? Which signals mattered?
    └───────┬───────┘
            │
            ▼
    Risk Score: 0-100 + Detailed Breakdown
```

## API Reference

### `POST /analyze`

Analyze a smart contract for rug pull indicators.

**Request:**
```json
{
  "contract_address": "0x..."
}
```

Or for raw Solidity code:

```json
{
  "solidity_code": "pragma solidity ^0.8.0; ..."
}
```

**Response:**
```json
{
  "contract_address": "0x...",
  "risk_score": 72,
  "risk_level": "High",
  "flags": [
    { "name": "Owner can mint tokens", "severity": "High" },
    { "name": "Liquidity not locked", "severity": "Medium" }
  ],
  "ai_assessment": "This contract shows multiple high-risk patterns...",
  "model": "XGBoost ML",
  "features_used": 53,
  "response_time": "1.2s"
}
```

## Risk Score Reference

| Score | Level | Description |
|-------|-------|-------------|
| 0-20 | Very Low | Minimal risk signals detected |
| 21-40 | Low | Few minor risk signals |
| 41-60 | Medium | Moderate risk signals, manual review recommended |
| 61-80 | High | Significant risk indicators, caution advised |
| 81-100 | Critical | Multiple severe risk signals, avoid interaction |

## Environment Variables

### Frontend (`frontend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable key | Yes |
| `VITE_API_URL` | Backend API endpoint | Yes |

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `ETHERSCAN_API_KEY` | Etherscan API key | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_KEY` | Supabase service role key | Yes |

## Branding

SentinelX uses a strict **Black / Burgundy / White** color palette:

| Color | Hex | Usage |
|-------|-----|-------|
| Black | `#0a0a0a` | Primary backgrounds, text |
| Burgundy | `#6D001A` | Accent, CTAs, active states |
| White | `#ffffff` | Light surfaces, text on dark |

### Logo Variants

| Variant | Usage |
|---------|-------|
| **Horizontal** | Website headers, navigation |
| **Stacked** | Login screens, presentations |
| **Icon Mark** | Favicon, app icon, small spaces |
| **Monochrome** | Documents, PDFs |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

SentinelX provides automated security analysis for **informational purposes only**. Results are not a guarantee of safety or financial advice. Always conduct your own research before interacting with any smart contract.

If you discover a security vulnerability, please report it responsibly to **security@sentinelx.site**.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Etherscan](https://etherscan.io/) — Contract source code API
- [Supabase](https://supabase.com/) — Auth, database, and realtime
- [XGBoost](https://xgboost.readthedocs.io/) — Gradient boosting framework
- [SHAP](https://shap.readthedocs.io/) — Explainable AI
- [React](https://react.dev/) — UI framework
- [Three.js](https://threejs.org/) — 3D graphics

---

<div align="center">

**Built to protect your wallet before it's too late.**

[Scan a Token →](https://sentinelx.site/scan)

</div>
