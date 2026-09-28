// SentinelX — build-time prerender
// Generates a unique HTML file per public route so crawlers and AI agents get
// page-specific <title>, meta description, canonical, Open Graph tags and real
// body text WITHOUT executing JavaScript.
//
// Runs after `vite build`. Output: dist/<route>.html (served extensionless via
// vercel.json cleanUrls).

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://www.sentinelx.site';
const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const templatePath = join(dist, 'index.html');

if (!existsSync(templatePath)) {
  console.error('[prerender] dist/index.html not found — run vite build first.');
  process.exit(1);
}

const template = readFileSync(templatePath, 'utf8');

/** Escape text for safe interpolation into HTML. */
const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Each route: path, title, description, h1, body paragraphs, extra links.
 * Titles/descriptions match PAGE_SEO in src/lib/seo.ts and the runtime
 * setPageSEO() calls so prerendered and rendered values never disagree.
 */
const routes = [
  {
    path: '/scan',
    title: 'Scan a Smart Contract | SentinelX Contract Analyzer',
    description:
      'Paste an Ethereum contract address or Solidity code to detect rug pulls, honeypots, and security vulnerabilities. Free AI-powered analysis with 53+ security signals.',
    h1: 'Scan an Ethereum Smart Contract',
    body: [
      'The SentinelX scanner analyzes any verified Ethereum contract by address, or raw Solidity source code you paste directly. Our XGBoost classifier extracts 53 security-relevant features — owner privileges, mint functions, blacklist mechanisms, transfer restrictions, liquidity controls — and returns a 0–100 risk score in under three seconds.',
      'Every score is explained with SHAP feature attribution, so you see exactly which contract patterns drove the result instead of a black-box verdict. Scanning is free and requires no account.',
    ],
    links: ['features', 'methodology', 'pricing', 'faq'],
  },
  {
    path: '/features',
    title: 'Features | SentinelX — AI Security Platform Capabilities',
    description:
      'Explore SentinelX features: XGBoost ML risk scoring, SHAP explainability, 53+ security signals, honeypot detection, access control analysis, and real-time monitoring.',
    h1: 'SentinelX Platform Features',
    body: [
      'SentinelX combines static code analysis, machine learning classification, and explainable AI in one platform. Features include honeypot detection (sell-side restrictions and blacklist mechanisms), ownership and privilege analysis, hidden mint identification, composite risk scoring from 0–100, and full SHAP feature attribution for every prediction.',
      'The XGBoost classifier is trained on a labeled dataset of 2,400+ smart contracts and achieves 96.15% accuracy on rug-pull classification using 53 extracted feature signals. Watchlists, alerts, scan history, and a REST API with SDK integration cover the monitoring and integration workflow.',
    ],
    links: ['scan', 'methodology', 'how-it-works', 'docs'],
  },
  {
    path: '/how-it-works',
    title: 'How SentinelX Works | Smart Contract Security Analysis',
    description:
      'Discover how SentinelX analyzes Ethereum contracts: feature extraction, XGBoost ML classification, SHAP explainability, and rule-based security detection.',
    h1: 'How SentinelX Works',
    body: [
      'Four steps: (1) Contract input — paste an Ethereum address (verified source fetched from Etherscan) or raw Solidity. (2) Feature extraction — 53+ security-relevant features are extracted from source code, bytecode, and on-chain metadata. (3) ML classification — an XGBoost model trained on 2,400+ labeled contracts classifies the risk. (4) Explainable results — SHAP feature attribution shows which factors contributed to the score, with no black boxes.',
      'Rule-based detection runs alongside the model to flag critical patterns such as unbounded minting, owner-only sell blocks, and external call risks before the ML score is finalized.',
    ],
    links: ['methodology', 'scan', 'features', 'faq'],
  },
  {
    path: '/pricing',
    title: 'Pricing | SentinelX — AI Security Plans',
    description:
      'Choose a SentinelX plan: Free basic scans, Pro unlimited analysis, or Enterprise custom deployment. Secure your DeFi portfolio today.',
    h1: 'SentinelX Pricing',
    body: [
      'SentinelX offers a free tier for one-off contract scans, a Pro plan for unlimited analysis with watchlists and alerts, and an Enterprise plan with API access, team seats, and custom deployment. Core scanning — 53-feature extraction, XGBoost risk scoring, and SHAP explanations — is available on every plan.',
      'No credit card is required to start. Compare plan limits, API rate limits, and support levels on the pricing page, and contact us for security-research or audit-team licensing.',
    ],
    links: ['scan', 'features', 'contact', 'faq'],
  },
  {
    path: '/methodology',
    title: 'How SentinelX Works | Security Methodology & ML Pipeline',
    description:
      'The SentinelX security methodology: input processing, 53-feature extraction, rule-based detection, XGBoost ML classification, SHAP explainability, and risk reporting.',
    h1: 'SentinelX Security Methodology',
    body: [
      'The SentinelX pipeline has six stages: input processing (Etherscan source retrieval or raw Solidity), feature extraction across 53 security signals, rule-based detection for known danger patterns, XGBoost machine-learning classification, SHAP explainability, and a final risk report scored from 0 to 100.',
      'The model was trained on 2,400+ labeled contracts with an 80/20 train-test split and achieved 96.15% test accuracy. Feature extraction is deterministic regex and AST-driven analysis of source code; the ML layer classifies, and rules override for critical findings. Full details, feature taxonomy, and evaluation metrics are published on this page.',
    ],
    links: ['features', 'how-it-works', 'case-studies', 'docs'],
  },
  {
    path: '/case-studies',
    title: 'Case Studies | Real Smart Contract Security Analysis Examples',
    description:
      'Real smart contract security analyses: honeypot tokens, hidden mint attacks, and legitimate DeFi protocols scored by SentinelX.',
    h1: 'SentinelX Case Studies',
    body: [
      'Worked examples of SentinelX analysis: a honeypot token with hidden sell restrictions, a hidden-mint contract with unlimited token inflation, and a legitimate DeFi protocol that returned a low risk score. Each case shows the extracted features, rule hits, ML classification, and SHAP attributions that produced the final score.',
      'Use these studies to calibrate your own reading of the 0–100 risk scale and to see how the 53-feature extractor surfaces privilege and liquidity risks in real deployed contracts.',
    ],
    links: ['methodology', 'insights', 'scan', 'incident-reports'],
  },
  {
    path: '/insights',
    title: 'Security Insights | SentinelX Blockchain Intelligence',
    description:
      'Latest blockchain security insights: rug pull indicators, XGBoost detection accuracy, SHAP explainability, honeypot detection, and DeFi security best practices.',
    h1: 'Security Insights',
    body: [
      'Research and threat analysis from the SentinelX security team: the top rug-pull indicators every investor should know, how XGBoost detects rug pulls at 96.15% accuracy, reading SHAP explanations, how honeypots block selling, the full list of 53 smart-contract features we analyze, and DeFi security best practices for 2026.',
      'Each article cites real incidents and shows which signals SentinelX would have raised before funds were lost.',
    ],
    links: ['case-studies', 'incident-reports', 'methodology', 'faq'],
  },
  {
    path: '/security',
    title: 'How SentinelX Works | Security Methodology',
    description:
      'Learn how SentinelX uses XGBoost ML, rule-based detection, SHAP explainability, and 53+ smart-contract features to identify rug-pull risk indicators.',
    h1: 'Security at SentinelX',
    body: [
      'SentinelX applies layered detection: deterministic rule-based checks for critical patterns, an XGBoost classifier for probabilistic risk scoring, and SHAP explainability so every result is auditable. The platform analyzes 53 smart-contract features covering access control, minting, blacklist and transfer restrictions, liquidity handling, and external calls.',
      'This page documents our security posture, responsible disclosure policy, and how to report a vulnerability. SentinelX output is automated security intelligence for informational purposes and is not financial advice.',
    ],
    links: ['methodology', 'docs', 'contact', 'disclaimer'],
  },
  {
    path: '/incident-reports',
    title: 'Incident Reports | Real Crypto Rug Pull Case Studies',
    description:
      'Analyze real rug-pull incidents: Toncoin, Aqua, Memecoin, and more. Learn from real cases how SentinelX would have detected these threats.',
    h1: 'Rug Pull Incident Reports',
    body: [
      'Post-mortems of real rug pulls — including Toncoin, Aqua, and Memecoin — broken down by the on-chain and source-code signals that preceded the drain: privileged mint functions, blacklist switches, unaudited owner privileges, and liquidity pulled by deployer wallets.',
      'Each report maps the incident to the SentinelX feature signals that would have flagged the contract before users deposited funds.',
    ],
    links: ['case-studies', 'insights', 'scan', 'methodology'],
  },
  {
    path: '/about',
    title: 'About SentinelX | AI-Powered Blockchain Security',
    description:
      'SentinelX is an AI-powered blockchain security platform that protects crypto users from rug pulls, honeypots, and smart contract vulnerabilities using machine learning.',
    h1: 'About SentinelX',
    body: [
      'SentinelX is an AI-powered blockchain security platform built to protect crypto users from rug pulls, honeypots, and smart contract vulnerabilities before they sign a transaction. Our mission is to make institutional-grade contract analysis free and understandable for everyone.',
      'The platform is built on XGBoost machine learning trained on 2,400+ labeled contracts, 53+ feature-extraction signals, SHAP explainability, and static analysis — delivering sub-three-second, explainable risk assessments on Ethereum contracts.',
    ],
    links: ['methodology', 'features', 'contact', 'pricing'],
  },
  {
    path: '/contact',
    title: 'Contact SentinelX | Get in Touch',
    description:
      'Contact the SentinelX team for partnerships, security research inquiries, or support. We respond to all legitimate requests within 48 hours.',
    h1: 'Contact SentinelX',
    body: [
      'Reach the SentinelX team for product support, security-research inquiries, partnership proposals, or press requests. We respond to all legitimate requests within 48 hours.',
      'If you are reporting a vulnerability in the SentinelX platform, use the security disclosure channel described on the security page so your report is handled confidentially.',
    ],
    links: ['security', 'docs', 'about', 'faq'],
  },
  {
    path: '/faq',
    title: 'FAQ | SentinelX — Smart Contract Security Questions',
    description:
      'Get answers to common questions about SentinelX: how risk scores work, supported chains, model accuracy, and whether SentinelX is financial advice.',
    h1: 'Frequently Asked Questions',
    body: [
      'What is SentinelX? An AI-powered blockchain security platform that analyzes Ethereum smart contracts and token addresses for rug-pull indicators, dangerous contract behaviors, and privilege risks using machine learning and rule-based detection.',
      'How are risk scores calculated? An XGBoost model trained on a labeled dataset, combined with 53 feature signals, rule-based analysis, and SHAP attribution, produces a 0–100 score. Can SentinelX analyze any Ethereum contract? Yes — by address via Etherscan verified source, or by pasting raw Solidity. Is a low score a guarantee of safety? No. SentinelX provides automated security signals for informational and research purposes only and does not provide financial advice.',
    ],
    links: ['scan', 'docs', 'methodology', 'pricing'],
  },
  {
    path: '/docs',
    title: 'Documentation | SentinelX API & Integration Guide',
    description:
      'SentinelX developer documentation: API reference, integration guides, SDK setup, and smart contract analysis examples.',
    h1: 'SentinelX Documentation',
    body: [
      'Developer documentation covering getting started, running your first scan, understanding the 0–100 risk score, supported chains, API authentication with API keys, endpoints, rate limits, and SDK integration examples.',
      'The public REST API returns structured JSON risk reports with score, risk level, flagged signals, and SHAP feature attributions. An OpenAPI specification is published at /openapi.json for automated client generation.',
    ],
    links: ['scan', 'methodology', 'features', 'faq'],
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | SentinelX',
    description:
      'SentinelX privacy policy: how we collect, use, and protect your data. We do not sell personal information. Read our full privacy practices.',
    h1: 'Privacy Policy',
    body: [
      'This privacy policy explains how SentinelX collects, uses, and protects information when you use our AI-powered smart contract security analysis platform. We do not sell personal information.',
      'The policy covers account data, scanned contract addresses, analytics, cookies, data retention, third-party processors, and your rights regarding personal data.',
    ],
    links: ['terms', 'cookies', 'contact', 'disclaimer'],
  },
  {
    path: '/terms',
    title: 'Terms of Service | SentinelX',
    description:
      'SentinelX terms of service: acceptable use, liability limitations, and service agreements. SentinelX provides automated analysis, not financial advice.',
    h1: 'Terms of Service',
    body: [
      'These terms of service govern acceptable use of the SentinelX platform, including account responsibilities, service availability, intellectual property, and liability limitations.',
      'SentinelX provides automated security analysis for informational purposes only. Results are not financial, investment, or trading advice and are not guarantees of safety.',
    ],
    links: ['privacy', 'disclaimer', 'contact', 'faq'],
  },
  {
    path: '/disclaimer',
    title: 'Disclaimer | SentinelX — Not Financial Advice',
    description:
      'SentinelX provides automated security analysis for informational purposes only. Results are not a guarantee of safety or financial advice.',
    h1: 'Disclaimer',
    body: [
      'SentinelX provides automated security analysis for informational and research purposes only. Nothing on this platform constitutes financial, investment, trading, or legal advice.',
      'Risk scores are probabilistic model outputs. A low score does not guarantee that a contract is safe, and a high score does not guarantee that a contract is malicious. Always conduct your own research.',
    ],
    links: ['privacy', 'terms', 'faq', 'methodology'],
  },
  {
    path: '/cookies',
    title: 'Cookie Policy | SentinelX',
    description:
      'SentinelX cookie policy: how we use cookies to improve your experience. Essential cookies only — no tracking without consent.',
    h1: 'Cookie Policy',
    body: [
      'This cookie policy explains how SentinelX uses cookies and similar storage. We use essential cookies for authentication and session state, and optional analytics cookies only with your consent.',
      'You can change your preferences at any time through the cookie banner or your browser settings.',
    ],
    links: ['privacy', 'terms', 'contact', 'disclaimer'],
  },
];

/** Build the crawlable static body that replaces the generic #root fallback. */
function bodyHTML(route) {
  const paragraphs = route.body.map((p) => `<p style="color:#374151;line-height:1.7;margin-bottom:1.25rem;">${esc(p)}</p>`).join('\n        ');
  const links = route.links
    .map((l) => `<li><a href="/${l}">/${l}</a></li>`)
    .join('');
  return `
      <header style="padding:2rem;text-align:center;border-bottom:1px solid #e5e7eb;">
        <p style="color:#6b7280;font-size:0.875rem;letter-spacing:0.1em;text-transform:uppercase;">SentinelX</p>
        <h1 style="font-size:2rem;font-weight:bold;color:#0a0a0a;margin-top:0.5rem;">${esc(route.h1)}</h1>
        <p style="color:#6b7280;margin-top:0.5rem;">AI-Powered Blockchain Security Platform</p>
      </header>
      <main style="max-width:800px;margin:2rem auto;padding:0 1rem;">
        ${paragraphs}
        <h2 style="font-size:1.25rem;font-weight:bold;color:#0a0a0a;margin:1.5rem 0 0.75rem;">Related pages</h2>
        <ul style="color:#374151;line-height:1.8;padding-left:1.5rem;">
          <li><a href="/">Home</a></li>
          ${links}
        </ul>
        <p style="color:#6b7280;margin-top:2rem;font-size:0.875rem;">SentinelX provides automated security analysis for informational purposes only. Results are not financial advice or guarantees of safety.</p>
      </main>
  `;
}

/** Replace an HTML attribute value in a specific tag matched by a selector-ish pattern. */
function replaceAttr(html, pattern, replacement) {
  const next = html.replace(pattern, replacement);
  if (next === html) console.warn(`[prerender] pattern did not match: ${pattern}`);
  return next;
}

let generated = 0;

for (const route of routes) {
  const url = `${SITE_URL}${route.path}`;
  let html = template;

  // <title>
  html = replaceAttr(html, /<title>[^<]*<\/title>/, `<title>${esc(route.title)}</title>`);

  // meta description
  html = replaceAttr(
    html,
    /(<meta name="description" content=")[^"]*(")/,
    `$1${esc(route.description)}$2`,
  );

  // canonical
  html = replaceAttr(html, /(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);

  // Open Graph / Twitter
  html = replaceAttr(html, /(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);
  html = replaceAttr(html, /(<meta property="og:title" content=")[^"]*(")/, `$1${esc(route.title)}$2`);
  html = replaceAttr(
    html,
    /(<meta property="og:description" content=")[^"]*(")/,
    `$1${esc(route.description)}$2`,
  );
  html = replaceAttr(html, /(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(route.title)}$2`);
  html = replaceAttr(
    html,
    /(<meta name="twitter:description" content=")[^"]*(")/,
    `$1${esc(route.description)}$2`,
  );

  // Page-specific crawlable body (replaces the generic #root fallback)
  const rootStart = html.indexOf('<div id="root">');
  // Vite injects the module script into <head>, so anchor on </body> instead.
  const bodyEnd = html.indexOf('</body>');
  if (rootStart === -1 || bodyEnd === -1) {
    console.error(`[prerender] could not locate #root or </body> for ${route.path}`);
    process.exit(1);
  }
  // The last </div> before </body> closes #root.
  const rootClose = html.lastIndexOf('</div>', bodyEnd);
  html =
    html.slice(0, rootStart + '<div id="root">'.length) +
    bodyHTML(route) +
    '    ' +
    html.slice(rootClose);

  // Per-page WebPage JSON-LD (injected before the homepage schemas)
  const schema = `<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","name":${JSON.stringify(route.title)},"description":${JSON.stringify(route.description)},"url":"${url}"}</script>`;
  html = replaceAttr(html, /<script type="application\/ld\+json">/, schema + '<script type="application/ld+json">');

  const outFile = join(dist, `${route.path.slice(1)}.html`);
  writeFileSync(outFile, html);
  generated++;
  console.log(`[prerender] ${route.path} -> dist/${route.path.slice(1)}.html`);
}

console.log(`[prerender] done — ${generated} pages generated.`);
