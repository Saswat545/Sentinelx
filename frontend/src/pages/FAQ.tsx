import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { question: 'What is SentinelX?', answer: 'SentinelX is an AI-powered blockchain security platform that analyzes Ethereum smart contracts and token addresses to identify potential rug-pull indicators, dangerous contract behaviors, privilege risks, and other security signals.' },
    { question: 'How does SentinelX calculate risk scores?', answer: 'SentinelX uses an XGBoost machine learning model trained on 2,400+ labeled contracts, combined with rule-based security analysis of 53+ smart contract features. The model achieves 96.15% accuracy on our evaluation dataset.' },
    { question: 'Can SentinelX analyze any Ethereum contract?', answer: 'Yes, SentinelX can analyze any publicly deployed Ethereum smart contract. Simply enter the contract address or paste the Solidity source code for analysis.' },
    { question: 'Does a low score guarantee that a contract is safe?', answer: 'No. SentinelX identifies potential security risks — it does not guarantee the safety or profitability of any asset. A low risk score means fewer concerning patterns were detected, but it is not a guarantee of safety.' },
    { question: 'Is SentinelX financial advice?', answer: 'No. SentinelX is a security analysis tool for informational and research purposes only. It is not financial advice, and you should always conduct your own research before making any financial decisions.' },
    { question: 'Which chains are supported?', answer: 'SentinelX currently supports Ethereum mainnet analysis. We plan to expand to additional EVM-compatible chains in the future.' },
    { question: 'How accurate is the model?', answer: 'Our XGBoost model achieves 96.15% accuracy on our labeled test dataset of 2,400+ contracts. However, real-world performance may vary, and the model should be used as one of many tools in your security assessment.' },
  ];

  return (
    <div className="min-h-screen bg-white pt-28 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="text-[#6D001A] font-mono text-xs tracking-[0.2em] uppercase mb-4 block">FAQ</span>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-[#0a0a0a] mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-500">Everything you need to know about SentinelX.</p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.06 }} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full px-6 py-5 flex items-center justify-between text-left">
                <span className="font-medium text-[#0a0a0a] text-sm pr-4">{faq.question}</span>
                <svg className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="px-6 pb-5 text-gray-500 text-sm leading-relaxed">{faq.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
