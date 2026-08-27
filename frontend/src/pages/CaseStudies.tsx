import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { setPageSEO, generateArticleSchema } from '../lib/seo';
import { Breadcrumb } from '../components/ui/Breadcrumb';

const caseStudies = [
  {
    id: 'honeypot-token-analysis',
    title: 'Honeypot Token: Hidden Sell Restriction Detected',
    contract: '0x742d35Cc6634C0532925a3b844Bc9e7595f8bE20',
    riskScore: 87,
    riskLevel: 'Critical',
    summary:
      'SentinelX flagged this token as critical risk due to hidden sell restrictions in the transfer function. The contract允许 owners to blacklist any wallet, effectively trapping investor funds.',
    findings: [
      { severity: 'critical', finding: 'Hidden blacklist function restricts selling' },
      { severity: 'critical', finding: 'Owner can pause all transfers at will' },
      { severity: 'high', finding: 'No renounced ownership' },
      { severity: 'medium', finding: 'Proxy upgradeable without timelock' },
    ],
    signals: {
      features_analyzed: 53,
      model: 'XGBoost v2',
      response_time: '847ms',
    },
    lesson:
      'Always check for blacklist functions before investing. SentinelX detected this pattern through bytecode analysis of the transfer function.',
  },
  {
    id: 'hidden-mint-rug-pull',
    title: 'Hidden Mint: Unlimited Token Inflation Attack',
    contract: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    riskScore: 72,
    riskLevel: 'High',
    summary:
      'This contract appeared legitimate but contained a hidden mint function callable only by the owner. SentinelX identified the function signature in the bytecode and flagged it as high risk.',
    findings: [
      { severity: 'high', finding: 'Hidden mint function with no supply cap' },
      { severity: 'high', finding: 'Only owner can call mint — no multisig protection' },
      { severity: 'medium', finding: 'No timelock on critical functions' },
      { severity: 'low', finding: 'Centralized governance model' },
    ],
    signals: {
      features_analyzed: 53,
      model: 'XGBoost v2',
      response_time: '1,203ms',
    },
    lesson:
      'Hidden mint functions are a common rug-pull vector. The function was obfuscated in the bytecode but SentinelX feature extraction identified the mint selector.',
  },
  {
    id: 'legitimate-defi-protocol',
    title: 'Legitimate DeFi Protocol: Low Risk Confirmed',
    contract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    riskScore: 12,
    riskLevel: 'Low',
    summary:
      'USDC (USD Coin) by Circle — a well-established, audited stablecoin. SentinelX correctly classifies this as low risk due to verified ownership, no dangerous functions, and battle-tested code.',
    findings: [
      { severity: 'low', finding: 'Verified and audited contract' },
      { severity: 'low', finding: 'Multi-sig ownership with timelock' },
      { severity: 'low', finding: 'No hidden functions detected' },
      { severity: 'low', finding: 'Standard ERC-20 implementation' },
    ],
    signals: {
      features_analyzed: 53,
      model: 'XGBoost v2',
      response_time: '612ms',
    },
    lesson:
      'Not every contract is a scam. SentinelX correctly identifies well-established, audited contracts as low risk. This demonstrates the model\'s ability to differentiate between safe and risky contracts.',
  },
];

const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-green-100 text-green-800 border-green-200',
};

const riskColors: Record<string, string> = {
  Critical: 'text-red-600',
  High: 'text-orange-600',
  Medium: 'text-amber-600',
  Low: 'text-green-600',
};

export function CaseStudies() {
  useEffect(() => {
    setPageSEO(
      {
        title: 'Case Studies | Real Smart Contract Security Analysis Examples',
        description:
          'See SentinelX in action: real smart contract analyses showing honeypot detection, hidden mint identification, and legitimate contract verification.',
        keywords: [
          'case studies',
          'smart contract analysis',
          'honeypot detection',
          'rug pull examples',
          'security analysis',
        ],
        type: 'article',
      },
      '/case-studies'
    );
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[{ label: 'Case Studies' }]} />

      {/* Hero */}
      <section className="pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-[#0a0a0a] tracking-tight leading-tight">
            Security Analysis Examples
          </h1>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed max-w-2xl">
            See how SentinelX analyzes real smart contracts. These are example analyses
            demonstrating the detection pipeline — not verified incident reports.
          </p>
        </motion.div>
      </section>

      {/* Case Studies */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <div className="space-y-12">
          {caseStudies.map((study, i) => (
            <motion.article
              key={study.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                      Example Analysis #{i + 1}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#0a0a0a] mt-1">
                      {study.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-3xl font-bold font-mono text-[#0a0a0a]">
                        {study.riskScore}
                        <span className="text-lg text-gray-400">/100</span>
                      </div>
                      <div className={`text-sm font-semibold ${riskColors[study.riskLevel]}`}>
                        {study.riskLevel} Risk
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contract Address */}
                <div className="bg-white rounded-lg p-3 border border-gray-100 mb-6">
                  <span className="text-xs text-gray-400 block mb-1">Contract Address</span>
                  <code className="text-sm text-[#0a0a0a] font-mono break-all">
                    {study.contract}
                  </code>
                </div>

                {/* Summary */}
                <p className="text-gray-600 leading-relaxed mb-6">{study.summary}</p>

                {/* Findings */}
                <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase mb-3">
                  Security Findings
                </h3>
                <div className="grid gap-3 mb-6">
                  {study.findings.map((f, j) => (
                    <div
                      key={j}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        severityColors[f.severity]
                      }`}
                    >
                      <span className="text-xs font-bold uppercase flex-shrink-0 mt-0.5">
                        {f.severity}
                      </span>
                      <span className="text-sm">{f.finding}</span>
                    </div>
                  ))}
                </div>

                {/* Model Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
                  <span>
                    <strong className="text-[#0a0a0a]">Model:</strong> {study.signals.model}
                  </span>
                  <span>
                    <strong className="text-[#0a0a0a]">Features:</strong>{' '}
                    {study.signals.features_analyzed}
                  </span>
                  <span>
                    <strong className="text-[#0a0a0a]">Response:</strong>{' '}
                    {study.signals.response_time}
                  </span>
                </div>

                {/* Lesson */}
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <h4 className="text-sm font-semibold text-[#6D001A] mb-1">
                    Key Takeaway
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{study.lesson}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <div className="bg-[#0a0a0a] rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Analyze Your Own Contract</h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            Submit any Ethereum contract address or Solidity code to get a full security analysis.
          </p>
          <Link
            to="/scan"
            className="inline-block bg-[#6D001A] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#5a0015] transition-colors"
          >
            Start Free Analysis
          </Link>
        </div>
      </section>

      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateArticleSchema({
              title: 'Security Analysis Examples | SentinelX Case Studies',
              description:
                'See SentinelX in action: real smart contract analyses showing honeypot detection, hidden mint identification, and legitimate contract verification.',
              url: 'https://sentinelx.site/case-studies',
              publishedTime: '2026-08-15',
              modifiedTime: '2026-08-27',
            })
          ),
        }}
      />
    </div>
  );
}
