import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const pipelineSteps = [
  {
    num: '01',
    title: 'Contract Input',
    desc: 'You provide an Ethereum contract address or paste raw Solidity source code. For addresses, we fetch verified source code from Etherscan.',
    details: ['Supports Ethereum mainnet', 'Etherscan API integration', 'Raw Solidity code analysis'],
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    num: '02',
    title: 'Feature Extraction',
    desc: 'We extract 53+ security-relevant features from the contract source code, bytecode, and on-chain metadata.',
    details: ['Static code analysis', 'Bytecode inspection', 'Permission mapping', 'Token mechanics parsing'],
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  },
  {
    num: '03',
    title: 'ML Classification',
    desc: 'Our XGBoost model, trained on 2,400+ labeled contracts, classifies the risk level based on the extracted features.',
    details: ['XGBoost gradient boosting', '96.15% accuracy on test set', 'Binary rug-pull classification', 'Calibrated probability scores'],
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
  {
    num: '04',
    title: 'Explainable Results',
    desc: 'SHAP feature attribution shows you exactly which factors contributed to the risk score. No black boxes.',
    details: ['SHAP value visualization', 'Per-feature contribution', 'Transparent methodology', 'Open for scrutiny'],
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
];

const riskScoreRanges = [
  { range: '0 - 20', label: 'Very Low', color: 'bg-emerald-500', desc: 'Minimal risk signals detected. Standard contract patterns.' },
  { range: '21 - 40', label: 'Low', color: 'bg-emerald-400', desc: 'Few minor risk signals. Generally standard behavior.' },
  { range: '41 - 60', label: 'Medium', color: 'bg-amber-500', desc: 'Moderate risk signals. Requires manual review recommended.' },
  { range: '61 - 80', label: 'High', color: 'bg-orange-500', desc: 'Significant risk indicators. Caution strongly advised.' },
  { range: '81 - 100', label: 'Critical', color: 'bg-red-500', desc: 'Multiple severe risk signals. Avoid interaction.' },
];

const featureCategories = [
  { name: 'Ownership Analysis', count: 12, desc: 'Owner privileges, renouncement, privilege escalation vectors' },
  { name: 'Token Mechanics', count: 8, desc: 'Mint functions, burn patterns, supply manipulation, fee structures' },
  { name: 'Permission Patterns', count: 10, desc: 'Access control, proxy patterns, upgradeable contracts, backdoors' },
  { name: 'Liquidity Signals', count: 6, desc: 'Liquidity locks, withdrawal patterns, trading restrictions' },
  { name: 'Code Quality', count: 9, desc: 'Reentrancy risks, overflow protection, known vulnerability patterns' },
  { name: 'Social & On-Chain', count: 8, desc: 'Contract age, transaction patterns, deployer history' },
];

export function HowItWorks() {
  return (
    <div className="min-h-screen bg-white pt-28 pb-16">
      {/* Hero */}
      <section className="px-4 mb-24">
        <div className="max-w-5xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#6D001A] font-mono text-xs tracking-[0.2em] uppercase mb-4 block"
          >
            Methodology
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold text-[#0a0a0a] mb-6"
          >
            How SentinelX
            <br />
            <span className="text-gray-400">analyzes contracts.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed"
          >
            A transparent look at our analysis pipeline. We show you exactly how we arrive at every risk score.
          </motion.p>
        </div>
      </section>

      {/* Pipeline */}
      <section className="px-4 mb-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {pipelineSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-[#6D001A]/20 transition-all group shadow-sm"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-[#6D001A]/5 border border-[#6D001A]/10 flex items-center justify-center shrink-0 group-hover:bg-[#6D001A]/10 transition-colors">
                    <svg className="w-7 h-7 text-[#6D001A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={step.icon} />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-mono text-[#6D001A]/50 block mb-1">Step {step.num}</span>
                    <h3 className="text-xl font-display font-semibold text-[#0a0a0a] mb-2">{step.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{step.desc}</p>
                    <div className="space-y-2">
                      {step.details.map((detail, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 text-[#6D001A]/60" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-500">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk Score Explainer */}
      <section id="risk-score" className="px-4 mb-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-[#6D001A] font-mono text-xs tracking-[0.2em] uppercase mb-4 block">
              Risk Scoring
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[#0a0a0a] mb-4">
              What does the score mean?
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              The SentinelX risk score ranges from 0 to 100. Higher scores indicate more risk signals detected.
            </p>
          </motion.div>

          <div className="space-y-3">
            {riskScoreRanges.map((range, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="flex items-center gap-6 p-5 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="w-20 shrink-0">
                  <span className="text-lg font-display font-bold text-[#0a0a0a]">{range.range}</span>
                </div>
                <div className={`w-3 h-3 rounded-full ${range.color} shrink-0`} />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-[#0a0a0a]">{range.label}</span>
                  <span className="text-gray-400 mx-2">|</span>
                  <span className="text-sm text-gray-500">{range.desc}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-100">
            <p className="text-sm text-gray-500 leading-relaxed">
              <strong className="text-[#0a0a0a]">Important:</strong> The risk score is based on automated ML analysis and rule-based pattern detection.
              It identifies risk signals — it does not guarantee that a contract is safe or unsafe.
              Always perform your own due diligence before interacting with any smart contract.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Categories */}
      <section className="px-4 mb-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-[#6D001A] font-mono text-xs tracking-[0.2em] uppercase mb-4 block">
              Feature Extraction
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[#0a0a0a] mb-4">
              53+ signals, six categories.
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Each contract is analyzed across multiple security dimensions to produce a comprehensive risk profile.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featureCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#6D001A]/20 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#0a0a0a]">{category.name}</h3>
                  <span className="text-xs font-mono text-[#6D001A] bg-[#6D001A]/5 px-2 py-0.5 rounded-full">
                    {category.count}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{category.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-50 rounded-3xl p-12 text-center border border-gray-100"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold text-[#0a0a0a] mb-4">
              Ready to analyze a contract?
            </h2>
            <p className="text-gray-500 mb-8 max-w-lg mx-auto">
              No account required for basic scans. Try it yourself and see the methodology in action.
            </p>
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#6D001A] hover:bg-[#8B0023] text-white font-semibold rounded-full transition-all duration-300 shadow-sm"
            >
              Scan a Token
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
