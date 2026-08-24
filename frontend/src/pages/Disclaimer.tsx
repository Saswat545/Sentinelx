import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Disclaimer() {
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
            <span className="text-white">Disclaimer</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Disclaimer</h1>
          <p className="text-gray-400">Effective Date: August 20, 2026 · Last Updated: August 20, 2026</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#181533] rounded-xl p-8 border border-white/10 space-y-8 text-gray-300"
        >
          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">1. Not Financial, Investment, or Legal Advice</h2>
            <p className="text-sm leading-relaxed">
              SentinelX provides automated, AI-generated security and risk analysis of Ethereum smart contracts, 
              wallet addresses, and token contracts, based on machine learning models and static code analysis.
            </p>
            <p className="text-sm leading-relaxed mt-3">
              <strong className="text-white">Nothing on SentinelX constitutes financial, investment, legal, tax, or 
              professional advice of any kind.</strong> Risk scores, flags, explanations, and recommendations generated 
              by SentinelX are provided for <strong className="text-white">informational purposes only</strong> and should 
              never be the sole basis for any financial or investment decision.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">2. No Guarantee of Accuracy</h2>
            <p className="text-sm leading-relaxed">
              SentinelX's analysis is generated using machine learning (including an XGBoost classification model) 
              and static analysis techniques. Like any automated system, it may produce false positives or false 
              negatives, may not detect novel attack patterns, and may be affected by incomplete or delayed 
              third-party blockchain data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">3. Your Responsibility</h2>
            <p className="text-sm leading-relaxed">
              You are solely responsible for your own decisions regarding any blockchain asset, smart contract, 
              or cryptocurrency-related activity. Before interacting with any token, wallet, or contract, conduct 
              your own independent research, consider consulting a qualified professional, and understand that 
              cryptocurrency investments carry inherent risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">4. No Liability for Financial Loss</h2>
            <p className="text-sm leading-relaxed">
              To the maximum extent permitted by law, SentinelX and its team shall not be liable for any financial 
              loss, loss of funds, loss of profits, or other damages arising from reliance on any risk score, flag, 
              or recommendation provided by the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">5. Third-Party Data</h2>
            <p className="text-sm leading-relaxed">
              SentinelX may reference or retrieve data from third-party sources (such as blockchain explorers) 
              and may link to external websites. We do not control, and are not responsible for, the accuracy, 
              availability, or content of third-party data or websites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-white mb-3">6. Contact Us</h2>
            <p className="text-sm leading-relaxed">
              If you have questions about this Disclaimer, contact us at{' '}
              <a href="mailto:support@sentinelx.site" className="text-brand-cobalt hover:underline">
                support@sentinelx.site
              </a>
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
