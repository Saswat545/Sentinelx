import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Privacy() {
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
            <span className="text-[#0a0a0a]">Privacy Policy</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-[#0a0a0a] mb-2">Privacy Policy</h1>
          <p className="text-gray-500">Last updated: August 2026</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm max-w-none"
        >
          <div className="space-y-6 text-gray-600">
            <section>
              <h2 className="text-xl font-display font-semibold text-[#0a0a0a] mb-3">1. Introduction</h2>
              <p className="text-sm leading-relaxed">
                SentinelX ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard 
                your information when you use our blockchain security analysis platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-semibold text-[#0a0a0a] mb-3">2. Information We Collect</h2>
              <p className="text-sm leading-relaxed">
                We collect information you provide directly, such as contract addresses you 
                submit for analysis, email addresses for account creation, and usage data 
                to improve our services. We do not collect wallet private keys or sensitive 
                financial information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-semibold text-[#0a0a0a] mb-3">3. How We Use Your Information</h2>
              <p className="text-sm leading-relaxed">
                We use collected information to provide and maintain our service, notify you 
                about changes, provide customer support, and gather analytics to improve 
                the platform. Contract addresses submitted for analysis are used solely 
                for security assessment purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-semibold text-[#0a0a0a] mb-3">4. Data Security</h2>
              <p className="text-sm leading-relaxed">
                We implement industry-standard security measures to protect your personal 
                information. However, no method of transmission over the Internet or 
                electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-semibold text-[#0a0a0a] mb-3">5. Contact Us</h2>
              <p className="text-sm leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@sentinelx.site" className="text-[#6D001A] hover:underline">
                  privacy@sentinelx.site
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
