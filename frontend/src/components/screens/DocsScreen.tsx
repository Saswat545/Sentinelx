import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Copy, Check } from 'lucide-react';

export const DocsScreen: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [lang, setLang] = useState<'curl' | 'python' | 'ts' | 'hardhat'>('curl');

  const handleCopy = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const codeSnippets = {
    curl: `curl -X POST "https://rugguard-api.onrender.com/analyze" \\
  -H "Authorization: Bearer sx_live_9f81a7b2c3d4..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    "chain": "ETH"
  }'`,
    python: `import requests

url = "https://rugguard-api.onrender.com/analyze"
headers = {
    "Authorization": "Bearer sx_live_9f81a7b2c3d4...",
    "Content-Type": "application/json"
}
payload = {
    "input": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    "chain": "ETH"
}

response = requests.post(url, json=payload, headers=headers)
report = response.json()
print("Risk Score:", report["risk_score"])
print("SHAP Top Features:", report["shap_top_features"])`,
    ts: `import { SentinelXClient } from '@sentinelx/sdk';

const client = new SentinelXClient({
  apiKey: process.env.SENTINELX_API_KEY
});

const report = await client.analyzeContract({
  address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  chain: 'ETH'
});

console.log('Risk Level:', report.verdict);
console.log('Score:', report.risk_score);`,
    hardhat: `// hardhat.config.ts
import "@sentinelx/hardhat-plugin";

export default {
  solidity: "0.8.20",
  sentinelx: {
    apiKey: process.env.SENTINELX_API_KEY,
    blockOnHighRisk: true,
    maxAllowedRiskScore: 50
  }
};`
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#0B0F17] text-gray-100">
      
      {/* Title */}
      <div className="pb-6 border-b border-gray-800">
        <div className="flex items-center gap-3 font-mono">
          <h1 className="text-2xl font-bold text-white tracking-tight">API & Developer Documentation</h1>
          <Badge variant="info">FastAPI OpenAPI 3.0</Badge>
        </div>
        <p className="text-xs text-gray-400 mt-1 font-mono">
          Integrate XGBoost smart contract analysis and SHAP feature attribution directly into trading bots and deployment scripts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6 font-mono">
          
          <Card className="bg-[#111827] border-gray-800">
            <CardHeader>
              <CardTitle>FastAPI REST Endpoints</CardTitle>
              <CardDescription className="text-gray-400">Production REST API Specification</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              
              <div className="p-4 bg-[#0B0F17] rounded-xl border border-gray-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono font-bold text-[10px]">
                      POST
                    </span>
                    <span className="font-bold text-white">/analyze</span>
                  </div>
                  <Badge variant="success">EVM Scanner</Badge>
                </div>
                <p className="text-gray-400 font-sans">
                  Submits contract address or raw Solidity code to the XGBoost inference cluster and returns Shapley feature explanations.
                </p>
              </div>

              <div className="p-4 bg-[#0B0F17] rounded-xl border border-gray-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono font-bold text-[10px]">
                      GET
                    </span>
                    <span className="font-bold text-white">/health</span>
                  </div>
                  <Badge variant="outline">Health Check</Badge>
                </div>
                <p className="text-gray-400 font-sans">
                  Returns ML model loading status, XGBoost metadata, and server operational metrics.
                </p>
              </div>

            </CardContent>
          </Card>

          {/* Interactive Code Snippets */}
          <Card className="bg-[#111827] border-gray-800">
            <div className="flex border-b border-gray-800 bg-[#0B0F17] rounded-t-xl px-4 pt-3 gap-2">
              {(['curl', 'python', 'ts', 'hardhat'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-t-lg uppercase cursor-pointer ${
                    lang === l ? 'bg-[#111827] text-blue-400 border-t border-x border-gray-800' : 'text-gray-400'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <CardContent className="p-4">
              <div className="relative">
                <button
                  onClick={() => handleCopy(codeSnippets[lang], lang)}
                  className="absolute right-3 top-3 p-1.5 bg-gray-900 text-gray-300 rounded border border-gray-800 hover:bg-gray-800 transition-colors"
                >
                  {copied === lang ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <pre className="p-4 bg-[#0B0F17] text-gray-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-gray-800">
                  <code>{codeSnippets[lang]}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column */}
        <div className="space-y-6 font-mono">
          <Card className="p-5 bg-[#111827] border-gray-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              53-Feature ML Vectors
            </h3>
            <ul className="space-y-2 text-xs text-gray-400 font-sans">
              <li className="p-2 bg-[#0B0F17] rounded border border-gray-800">
                <strong className="text-white block font-mono">has_honeypot_pattern</strong>
                <span>Buy allowed but sell restricted in contract logic.</span>
              </li>
              <li className="p-2 bg-[#0B0F17] rounded border border-gray-800">
                <strong className="text-white block font-mono">has_hidden_owner</strong>
                <span>Obfuscated ownership address via hash or private variable.</span>
              </li>
              <li className="p-2 bg-[#0B0F17] rounded border border-gray-800">
                <strong className="text-white block font-mono">has_unlimited_mint</strong>
                <span>Owner capable of minting tokens post-deployment.</span>
              </li>
            </ul>
          </Card>
        </div>

      </div>

    </div>
  );
};
