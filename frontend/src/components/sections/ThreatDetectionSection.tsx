import React from 'react';
import { motion } from 'framer-motion';

export function ThreatDetectionSection() {
  const threats = [
    { name: 'Honeypot', severity: 'Critical', color: 'text-red-500', bg: 'bg-red-500/10' },
    { name: 'Hidden Mint', severity: 'High', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { name: 'Blacklist', severity: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { name: 'Fee Manipulation', severity: 'High', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { name: 'Ownership Abuse', severity: 'Critical', color: 'text-red-500', bg: 'bg-red-500/10' },
    { name: 'Proxy Upgrade', severity: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
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
            Threat Detection
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            What can SentinelX detect?
          </h2>
          <p className="text-lg text-dark-muted max-w-3xl mx-auto">
            Our AI identifies malicious patterns that human auditors might miss.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {threats.map((threat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="glass rounded-xl p-6 border border-dark-border hover:border-brand-cobalt/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg ${threat.bg} flex items-center justify-center`}>
                  <svg className={`w-5 h-5 ${threat.color}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className={`text-xs font-mono ${threat.color}`}>{threat.severity}</span>
              </div>
              <h3 className="text-lg font-display font-semibold mb-2">{threat.name}</h3>
              <p className="text-sm text-dark-muted">
                Detected through advanced pattern matching and ML analysis.
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
