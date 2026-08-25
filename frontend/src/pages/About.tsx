import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function About() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link to="/" className="hover:text-[#0a0a0a] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#0a0a0a]">About</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-[#0a0a0a] mb-2">About SentinelX</h1>
          <p className="text-gray-500">AI-powered blockchain security intelligence.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-display font-semibold text-[#0a0a0a] mb-4">Our Mission</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              SentinelX exists to make blockchain interactions safer. We combine machine learning,
              static code analysis, and explainable AI to help users identify potential risks in
              Ethereum smart contracts before they interact with them.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-display font-semibold text-[#0a0a0a] mb-4">What We Do</h2>
            <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
              <p>
                SentinelX analyzes Ethereum smart contracts and wallet addresses using an XGBoost
                machine learning model trained on thousands of labeled contracts. Our system extracts
                53+ security features and provides SHAP-based explainability for every risk score.
              </p>
              <p>
                We detect rug-pull indicators, honeypot patterns, privilege escalation risks,
                unusual fee mechanisms, and other potentially dangerous contract behaviors.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-display font-semibold text-[#0a0a0a] mb-4">Technology</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'XGBoost ML', desc: 'Gradient-boosted tree classification trained on 2,400+ contracts' },
                { title: '53+ Features', desc: 'Comprehensive smart contract feature extraction' },
                { title: 'SHAP Explainability', desc: 'Transparent, interpretable risk explanations' },
                { title: 'Static Analysis', desc: 'Solidity bytecode and source code pattern detection' },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h3 className="text-[#0a0a0a] font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
            <h2 className="text-xl font-display font-semibold text-[#0a0a0a] mb-4">Get in Touch</h2>
            <p className="text-gray-500 text-sm mb-6">
              Have questions or want to collaborate? We'd love to hear from you.
            </p>
            <Link
              to="/contact"
              className="inline-flex px-6 py-3 bg-[#6D001A] hover:bg-[#8B0023] text-white font-semibold rounded-xl transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
