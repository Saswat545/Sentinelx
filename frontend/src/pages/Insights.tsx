import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const articles = [
  { title: 'How to Identify a Potential Rug Pull', category: 'Security Guide', readTime: '5 min', excerpt: 'Learn the key warning signs that a token or DeFi project might be a rug pull before you invest your funds.' },
  { title: 'What Does Renounced Ownership Actually Mean?', category: 'Deep Dive', readTime: '4 min', excerpt: 'Many investors believe renounced ownership equals safety. Here is why that assumption can be dangerously wrong.' },
  { title: 'Can a Verified Contract Still Be Dangerous?', category: 'Analysis', readTime: '6 min', excerpt: 'Etherscan verification is a good sign, but it does not guarantee a contract is safe. Learn what verification actually tells you.' },
  { title: '5 Token Permissions Every Investor Should Understand', category: 'Education', readTime: '7 min', excerpt: 'From minting to pausing, these are the contract permissions that can put your funds at risk.' },
  { title: 'How Machine Learning Detects Rug Pulls', category: 'Technology', readTime: '8 min', excerpt: 'A look inside the XGBoost model and the 53 features that power SentinelX risk classification.' },
  { title: 'Understanding SHAP Feature Attribution', category: 'Explainability', readTime: '5 min', excerpt: 'How we use SHAP values to explain why a contract received its risk score — no black boxes.' },
];

export function Insights() {
  return (
    <div className="min-h-screen bg-white pt-28 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <span className="text-[#6D001A] font-mono text-xs tracking-[0.2em] uppercase mb-4 block">Intelligence</span>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-[#0a0a0a] mb-4">Security Insights</h1>
          <p className="text-gray-500 max-w-2xl">Deep dives into smart contract security, rug pull detection, and the technology behind SentinelX.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {articles.map((article, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.08 }} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-[#6D001A]/20 transition-all group cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono text-[#6D001A] bg-[#6D001A]/5 px-2 py-0.5 rounded-full">{article.category}</span>
                <span className="text-xs font-mono text-gray-400">{article.readTime} read</span>
              </div>
              <h3 className="text-lg font-display font-semibold text-[#0a0a0a] mb-2 group-hover:text-[#6D001A] transition-colors">{article.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{article.excerpt}</p>
              <div className="mt-4 flex items-center gap-1 text-sm text-[#6D001A] font-medium">
                Read more
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 bg-gray-50 rounded-3xl p-12 text-center border border-gray-100">
          <h2 className="text-2xl font-display font-bold text-[#0a0a0a] mb-4">Run your own analysis.</h2>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto">Apply what you've learned. Scan any Ethereum contract for free.</p>
          <Link to="/scan" className="inline-flex items-center gap-2 px-8 py-4 bg-[#6D001A] hover:bg-[#8B0023] text-white font-semibold rounded-full transition-all duration-300">
            Scan a Token
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
