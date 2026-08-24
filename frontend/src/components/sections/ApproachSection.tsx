import React from 'react';
import { motion } from 'framer-motion';

export function ApproachSection() {
  const approaches = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Static Code Analysis',
      description: 'Deep inspection of Solidity bytecode for dangerous patterns, backdoors, and vulnerabilities.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'Machine Learning',
      description: 'XGBoost model trained on 2,400+ contracts with 96.15% accuracy for rug pull detection.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Real-Time Intelligence',
      description: 'Blockchain data extraction and on-chain analysis for comprehensive risk assessment.'
    }
  ];

  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-brand-cobalt font-mono text-sm tracking-wider uppercase mb-4 block">
            Our Approach
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            Every smart contract tells a story.
          </h2>
          <p className="text-lg text-dark-muted max-w-3xl mx-auto">
            SentinelX combines static analysis, machine learning, and explainable AI 
            to detect malicious smart contracts — before your wallet signs anything.
          </p>
        </motion.div>

        {/* Approach cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {approaches.map((approach, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className="glass rounded-2xl p-8 border border-dark-border hover:border-brand-cobalt/50 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-xl bg-brand-cobalt/10 flex items-center justify-center text-brand-cobalt mb-6">
                {approach.icon}
              </div>
              <h3 className="text-xl font-display font-semibold mb-4">{approach.title}</h3>
              <p className="text-dark-muted leading-relaxed">{approach.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 glass rounded-2xl p-8 border border-dark-border"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-display font-bold text-brand-cobalt mb-2">53+</div>
              <div className="text-sm text-dark-muted">Security Signals</div>
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-brand-cobalt mb-2">2,400+</div>
              <div className="text-sm text-dark-muted">Contracts Analyzed</div>
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-brand-cobalt mb-2">96.15%</div>
              <div className="text-sm text-dark-muted">Model Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-brand-cobalt mb-2">&lt;1s</div>
              <div className="text-sm text-dark-muted">Analysis Time</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
