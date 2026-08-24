import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const sections = [
  {
    title: 'Getting Started',
    items: [
      { title: 'What is SentinelX?', desc: 'An overview of the platform and its capabilities.' },
      { title: 'Running Your First Scan', desc: 'Step-by-step guide to analyzing your first contract.' },
      { title: 'Understanding Risk Scores', desc: 'How to interpret the 0-100 risk score and risk levels.' },
    ],
  },
  {
    title: 'Scanner',
    items: [
      { title: 'Supported Chains', desc: 'Ethereum mainnet and planned EVM chain support.' },
      { title: 'Risk Score Methodology', desc: 'How the XGBoost model classifies contract risk.' },
      { title: 'Security Signals', desc: 'The 53+ features extracted during analysis.' },
      { title: 'SHAP Explanations', desc: 'Understanding explainable AI feature attribution.' },
    ],
  },
  {
    title: 'Account',
    items: [
      { title: 'Authentication', desc: 'Google, GitHub, and email/password sign-in.' },
      { title: 'Scan History', desc: 'Viewing and managing your past analyses.' },
      { title: 'Watchlists', desc: 'Monitoring tokens for risk changes.' },
      { title: 'Alerts', desc: 'Setting up notifications for risk changes.' },
    ],
  },
  {
    title: 'API',
    items: [
      { title: 'Authentication', desc: 'API key setup and authentication.' },
      { title: 'Endpoints', desc: 'Available REST API endpoints.' },
      { title: 'Rate Limits', desc: 'Request limits and throttling policies.' },
    ],
  },
];

export function Docs() {
  return (
    <div className="min-h-screen bg-white pt-28 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <span className="text-[#6D001A] font-mono text-xs tracking-[0.2em] uppercase mb-4 block">Documentation</span>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-[#0a0a0a] mb-4">SentinelX Docs</h1>
          <p className="text-gray-500 max-w-2xl">Everything you need to integrate, understand, and use SentinelX effectively.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}>
              <h2 className="text-lg font-display font-semibold text-[#0a0a0a] mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#6D001A]/10 flex items-center justify-center text-[#6D001A] text-xs font-bold">{index + 1}</span>
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.items.map((item, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#6D001A]/20 transition-all cursor-pointer group">
                    <h3 className="text-sm font-semibold text-[#0a0a0a] group-hover:text-[#6D001A] transition-colors mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 bg-gray-50 rounded-3xl p-12 text-center border border-gray-100">
          <h2 className="text-2xl font-display font-bold text-[#0a0a0a] mb-4">Ready to start?</h2>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto">Try the scanner yourself — no account needed for basic scans.</p>
          <Link to="/scan" className="inline-flex items-center gap-2 px-8 py-4 bg-[#6D001A] hover:bg-[#8B0023] text-white font-semibold rounded-full transition-all duration-300">
            Scan a Token
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
