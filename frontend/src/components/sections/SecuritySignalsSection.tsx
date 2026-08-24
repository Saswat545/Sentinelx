import React from 'react';
import { motion } from 'framer-motion';

export function SecuritySignalsSection() {
  const signals = [
    { category: 'Access Control', items: ['Owner privileges', 'Proxy patterns', 'Timelock delays'] },
    { category: 'Token Economics', items: ['Mint functions', 'Fee mechanisms', 'Supply limits'] },
    { category: 'Trading Logic', items: ['Honeypot detection', 'Blacklist checks', 'Pause functionality'] },
    { category: 'Code Quality', items: ['Reentrancy guards', 'Overflow protection', 'Gas optimization'] },
  ];

  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-brand-cobalt font-mono text-sm tracking-wider uppercase mb-4 block">
            Security Signals
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            53+ signals analyzed in real-time
          </h2>
          <p className="text-lg text-dark-muted max-w-3xl mx-auto">
            Our comprehensive analysis covers every aspect of smart contract security.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {signals.map((signal, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass rounded-xl p-6 border border-dark-border"
            >
              <h3 className="text-lg font-display font-semibold mb-4 text-brand-cobalt">{signal.category}</h3>
              <ul className="space-y-3">
                {signal.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-dark-muted">
                    <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
