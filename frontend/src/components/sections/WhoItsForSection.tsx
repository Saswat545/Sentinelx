import React from 'react';
import { motion } from 'framer-motion';

export function WhoItsForSection() {
  const audiences = [
    {
      title: 'DeFi Traders',
      description: 'Verify token contracts before investing. Detect honeypots and rug pulls in seconds.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      title: 'Security Auditors',
      description: 'Accelerate smart contract audits with AI-assisted vulnerability detection.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: 'Web3 Developers',
      description: 'Integrate security analysis into your dApps and development workflow.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      title: 'Institutional Investors',
      description: 'Due diligence at scale with comprehensive risk reports and API access.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
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
            Who It's For
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            Is this for me?
          </h2>
          <p className="text-lg text-dark-muted max-w-3xl mx-auto">
            Whether you're a solo trader or an enterprise team, SentinelX has you covered.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {audiences.map((audience, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="glass rounded-2xl p-8 border border-dark-border hover:border-brand-cobalt/30 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-xl bg-brand-cobalt/10 flex items-center justify-center text-brand-cobalt mb-6">
                {audience.icon}
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">{audience.title}</h3>
              <p className="text-dark-muted leading-relaxed">{audience.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
