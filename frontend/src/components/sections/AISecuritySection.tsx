import React from 'react';
import { motion } from 'framer-motion';

export function AISecuritySection() {
  return (
    <section className="py-24 px-4 bg-dark-surface/30 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-cobalt/10 rounded-full blur-3xl" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-brand-cobalt font-mono text-sm tracking-wider uppercase mb-4 block">
              AI Security Analysis
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
              Powered by over 50 blockchain security signals
            </h2>
            <p className="text-dark-muted text-lg mb-8 leading-relaxed">
              Our XGBoost model evaluates contract behavior, ownership patterns, 
              and code vulnerabilities to deliver transparent risk analysis you can trust.
            </p>
            
            <div className="space-y-4">
              {[
                'Honeypot detection patterns',
                'Ownership privilege analysis',
                'Hidden mint functions',
                'Blacklist mechanism detection',
                'Fee manipulation risks'
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-cobalt/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-brand-cobalt" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-dark-text">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="glass rounded-2xl p-8 border border-brand-cobalt/30">
              {/* Code visualization */}
              <div className="bg-dark-deep rounded-xl p-6 font-mono text-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="space-y-2">
                  <div className="text-dark-muted">// Analyzing contract...</div>
                  <div className="text-brand-cobalt">function <span className="text-green-400">transfer</span>() {'{'}</div>
                  <div className="pl-4 text-brand-danger">⚠ Hidden ownership check detected</div>
                  <div className="pl-4 text-dark-muted">require(owner == msg.sender);</div>
                  <div className="text-brand-cobalt">{'}'}</div>
                  <div className="mt-4 text-yellow-400">Risk Score: <span className="text-brand-danger font-bold">72/100</span></div>
                </div>
              </div>
              
              {/* Risk meter */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-dark-muted">Risk Level</span>
                  <span className="text-brand-danger font-semibold">High Risk</span>
                </div>
                <div className="h-2 bg-dark-deep rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '72%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-yellow-500 to-brand-danger rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
