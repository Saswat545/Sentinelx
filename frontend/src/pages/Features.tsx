import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const features = [
  {
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    title: 'Static Code Analysis',
    description: 'Deep inspection of Solidity bytecode for dangerous patterns, backdoors, and known vulnerability signatures. Analyzes contract source code for 53+ security-relevant features.',
    details: ['Bytecode disassembly and pattern matching', 'Known vulnerability signature detection', 'Function permission analysis', 'State variable access control review'],
  },
  {
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    title: 'Machine Learning',
    description: 'XGBoost classifier trained on a labeled dataset of smart contracts, achieving 96.15% accuracy for rug-pull classification with 53 feature extraction signals.',
    details: ['XGBoost gradient boosting classifier', '53 smart-contract feature extraction', 'Trained on ~2,474 labeled contracts', 'Cross-validated at 97.16% accuracy'],
  },
  {
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: 'Explainable AI',
    description: 'SHAP feature attribution provides transparent, interpretable explanations for every risk score prediction. Understand exactly which factors contributed to the result.',
    details: ['SHAP (SHapley Additive exPlanations) values', 'Per-feature contribution breakdown', 'Transparent decision reasoning', 'No black-box predictions'],
  },
  {
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    title: 'Honeypot Detection',
    description: 'Identifies tokens that prevent selling by analyzing transfer restrictions, blacklist mechanisms, and owner-only sell blocks.',
    details: ['Transfer restriction analysis', 'Blacklist mechanism detection', 'Owner-only sell block identification', 'Fee manipulation pattern recognition'],
  },
  {
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    title: 'Ownership Analysis',
    description: 'Evaluates contract ownership structure, privilege escalation risks, and centralized control mechanisms that could be exploited.',
    details: ['Ownership transfer detection', 'Privileged function analysis', 'Admin role mapping', 'Timelock and multisig detection'],
  },
  {
    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    title: 'Risk Scoring',
    description: 'Composite risk score from 0-100 based on ML classification and rule-based analysis. Lower scores indicate fewer detected risk signals.',
    details: ['0-100 risk scale', 'Multi-factor weighted scoring', 'Severity classification (Low/Medium/High/Critical)', 'Continuous model improvement'],
  },
];

export function Features() {
  return (
    <div className="min-h-screen bg-white pt-28 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="text-[#6D001A] font-mono text-xs tracking-[0.2em] uppercase mb-4 block">
            Features
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-[#0a0a0a] mb-4">
            Security Intelligence at Every Layer
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            SentinelX combines machine learning, static analysis, and explainable AI
            to detect malicious smart contracts before your wallet signs anything.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-[#6D001A]/20 transition-all duration-300 group shadow-sm hover:shadow-md"
            >
              <div className="w-14 h-14 rounded-xl bg-[#6D001A]/5 flex items-center justify-center text-[#6D001A] mb-6 group-hover:bg-[#6D001A]/10 transition-colors">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-xl font-display font-semibold text-[#0a0a0a] mb-3">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4 text-[#6D001A] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {detail}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-gray-500 mb-6">Ready to analyze a contract?</p>
          <Link
            to="/scan"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#6D001A] hover:bg-[#8B0023] text-white font-semibold rounded-full transition-all duration-300 shadow-lg shadow-[#6D001A]/20"
          >
            Analyze a Contract
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default Features;
