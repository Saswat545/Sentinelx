import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Terms() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Terms of Service</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-gray-400">Last updated: August 2026</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#181533] rounded-xl p-8 border border-white/10 space-y-6 text-gray-300"
        >
          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p className="text-sm leading-relaxed">
              By accessing or using SentinelX, you agree to be bound by these Terms of Service. 
              If you do not agree, do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">2. Description of Service</h2>
            <p className="text-sm leading-relaxed">
              SentinelX provides AI-powered security analysis of Ethereum smart contracts 
              and token addresses. Our service identifies potential risks but does not 
              guarantee the safety or profitability of any asset.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">3. Disclaimer</h2>
            <p className="text-sm leading-relaxed">
              <strong className="text-white">SentinelX is not financial advice.</strong>{' '}
              Our analysis is provided for informational and security research purposes only. 
              Always conduct your own research before interacting with any smart contract 
              or making financial decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">4. Limitation of Liability</h2>
            <p className="text-sm leading-relaxed">
              SentinelX shall not be liable for any losses or damages arising from the use 
              of our platform or reliance on our security analysis results.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">5. Contact</h2>
            <p className="text-sm leading-relaxed">
              For questions about these Terms, contact us at{' '}
              <a href="mailto:legal@sentinelx.site" className="text-brand-cobalt hover:underline">
                legal@sentinelx.site
              </a>
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
