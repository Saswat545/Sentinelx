import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Security() {
  return (
    <div className="min-h-screen bg-white pt-28 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link to="/" className="hover:text-[#0a0a0a] transition-colors">Home</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-[#0a0a0a]">Security</span>
          </div>
          <span className="text-[#6D001A] font-mono text-xs tracking-[0.2em] uppercase mb-4 block">Trust & Safety</span>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[#0a0a0a] mb-2">Security at SentinelX</h1>
          <p className="text-gray-500">Security is fundamental to everything we build.</p>
        </motion.div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-display font-semibold text-[#0a0a0a] mb-4">Our Security Practices</h2>
            <div className="space-y-4 text-gray-500 text-sm leading-relaxed">
              <p>SentinelX applies industry-standard security measures to protect our platform and user data. We use encrypted password storage, secure API practices, and access controls to safeguard the information entrusted to us.</p>
              <p>We do not store wallet private keys or sensitive financial information. Contract addresses submitted for analysis are processed to generate security insights and are not shared with third parties except as necessary to provide the service.</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-8 border border-[#6D001A]/20 shadow-sm">
            <h2 className="text-xl font-display font-semibold text-[#0a0a0a] mb-4">Responsible Disclosure</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">If you've discovered a potential vulnerability in SentinelX, we encourage you to report it responsibly. Please email us with details of the issue and we will investigate promptly.</p>
            <a href="mailto:security@sentinelx.site" className="inline-flex items-center gap-2 px-6 py-3 bg-[#6D001A] hover:bg-[#8B0023] text-white font-semibold rounded-xl transition-all duration-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              security@sentinelx.site
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-display font-semibold text-[#0a0a0a] mb-4">Data Protection</h2>
            <div className="space-y-3 text-gray-600 text-sm">
              {['Encrypted password storage (bcrypt hashing)', 'HTTPS enforced on all connections', 'CSRF protection on state-changing requests', 'API keys never exposed to the frontend', 'Rate limiting on public API endpoints'].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-[#6D001A] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
