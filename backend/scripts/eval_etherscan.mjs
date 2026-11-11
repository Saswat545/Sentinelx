/**
 * Pull verified Solidity from Etherscan V2 and push it through the live
 * /analyze endpoint, so we see the model's real output for real code.
 *
 *   node backend/scripts/eval_etherscan.mjs
 *
 * Reads ETHERSCAN_API_KEY from the project .env. Keys never leave this process:
 * the model call sends source code, not the key.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(here, '../../.env');

const API = process.env.MODEL_API ?? 'https://sentinelx-iz11.onrender.com';
const ETHERSCAN = 'https://api.etherscan.io/v2/api';

function readKey() {
  const text = readFileSync(envPath, 'utf8');
  const match = text.match(/^ETHERSCAN_API_KEY\s*=\s*(.*)$/m);
  const value = (match?.[1] ?? '').trim().replace(/^['"]|['"]$/g, '');
  if (!value) throw new Error('ETHERSCAN_API_KEY missing from .env');
  return value;
}

const TARGETS = [
  { label: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
  { label: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
  { label: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
  { label: 'UNI', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' },
  { label: 'LINK', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA' },
  { label: 'SHIB', address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE' },
];

const key = readKey();

async function fetchSource(address) {
  const url = new URL(ETHERSCAN);
  url.searchParams.set('chainid', '1');
  url.searchParams.set('module', 'contract');
  url.searchParams.set('action', 'getsourcecode');
  url.searchParams.set('address', address);
  url.searchParams.set('apikey', key);

  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) return { error: `etherscan HTTP ${res.status}` };

  const body = await res.json();
  if (body.status !== '1' || !Array.isArray(body.result) || body.result.length === 0) {
    return { error: `etherscan: ${body.message ?? 'no result'}` };
  }

  const entry = body.result[0];
  // Multi-file sources arrive wrapped in {{...}} JSON, which still contains the
  // Solidity text the extractor expects.
  const source = (entry.SourceCode ?? '').replace(/^\{\{/, '').replace(/\}\}$/, '');
  return { source, name: entry.ContractName || '(unnamed)' };
}

async function analyze(input, label) {
  const started = Date.now();
  const res = await fetch(`${API}/analyze`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ input, chain: 'ETH' }),
    signal: AbortSignal.timeout(180000),
  });
  const ms = Date.now() - started;
  if (!res.ok) {
    return { label, error: `analyze HTTP ${res.status}: ${(await res.text()).slice(0, 140)}`, ms };
  }
  const data = await res.json();
  return { label, ...data, ms };
}

const rows = [];

for (const target of TARGETS) {
  process.stdout.write(`${target.label} … `);
  const fetched = await fetchSource(target.address);

  if (fetched.error) {
    console.log(fetched.error);
    rows.push({ label: target.label, address: target.address, status: 'fetch failed', note: fetched.error });
    continue;
  }
  if (!fetched.source || fetched.source.trim().length < 20) {
    console.log('unverified');
    rows.push({
      label: target.label,
      address: target.address,
      status: 'unverified',
      note: 'model cannot run on this address',
    });
    continue;
  }

  const result = await analyze(fetched.source, target.label);
  if (result.error) {
    console.log(result.error);
    rows.push({ label: target.label, address: target.address, status: 'analyze failed', note: result.error });
    continue;
  }

  const topFeature = result.shap_top_features?.[0]?.feature ?? null;
  const topImpact = result.shap_top_features?.[0]?.impact ?? null;

  console.log(
    `${result.risk_score}/100 ${result.verdict} ` +
      `(model=${result.model_used}, flags=${result.flags.length}, ${result.analysis_time_ms}ms)`,
  );

  rows.push({
    label: target.label,
    address: target.address,
    contract: fetched.name,
    status: 'scored',
    sourceChars: fetched.source.length,
    score: result.risk_score,
    verdict: result.verdict,
    modelUsed: result.model_used,
    flags: result.flags.map((flag) => flag.name),
    topFeature,
    topImpact,
  });
}

console.log('\n--- summary ---');
console.log(JSON.stringify(rows, null, 2));
