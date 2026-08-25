import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Cookies() {
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
            <span className="text-[#0a0a0a]">Cookie Policy</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-[#0a0a0a] mb-2">Cookie Policy</h1>
          <p className="text-gray-500">Effective Date: August 20, 2026 · Last Updated: August 20, 2026</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8 text-gray-600"
        >
          <section>
            <h2 className="text-xl font-display font-semibold text-[#0a0a0a] mb-3">1. What Are Cookies?</h2>
            <p className="text-sm leading-relaxed">
              Cookies are small text files placed on your device when you visit a website. They allow the site to recognize your device, remember information about your visit, and help site owners understand how visitors use the site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-[#0a0a0a] mb-3">2. What Cookies SentinelX Uses</h2>
            <p className="text-sm leading-relaxed mb-4">We currently use two categories of cookies: <strong className="text-[#0a0a0a]">essential</strong> and <strong className="text-[#0a0a0a]">analytics</strong>.</p>

            <h3 className="text-lg font-semibold text-[#0a0a0a] mb-2">Essential Cookies</h3>
            <p className="text-sm leading-relaxed mb-4">
              These cookies are necessary for SentinelX to function and cannot be disabled. They include login/session cookies, security cookies, and CSRF protection cookies.
            </p>

            <h3 className="text-lg font-semibold text-[#0a0a0a] mb-2">Analytics Cookies</h3>
            <p className="text-sm leading-relaxed">
              We use Google Analytics to understand how visitors use SentinelX. Google Analytics cookies are set and managed by Google. You can opt out using the Google Analytics Opt-out Browser Add-on.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-[#0a0a0a] mb-3">3. Cookie Table</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-[#0a0a0a] font-semibold">Cookie</th>
                    <th className="text-left py-3 text-[#0a0a0a] font-semibold">Purpose</th>
                    <th className="text-left py-3 text-[#0a0a0a] font-semibold">Type</th>
                    <th className="text-left py-3 text-[#0a0a0a] font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-3 font-mono text-xs text-[#6D001A]">Session/auth cookie</td>
                    <td className="py-3 text-gray-600">Keeps you authenticated</td>
                    <td className="py-3 text-gray-600">Essential</td>
                    <td className="py-3 text-gray-600">Session</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-mono text-xs text-[#6D001A]">CSRF token</td>
                    <td className="py-3 text-gray-600">Protects against CSRF</td>
                    <td className="py-3 text-gray-600">Essential</td>
                    <td className="py-3 text-gray-600">Session</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-mono text-xs text-[#6D001A]">_ga, _ga_*</td>
                    <td className="py-3 text-gray-600">Analytics tracking</td>
                    <td className="py-3 text-gray-600">Analytics</td>
                    <td className="py-3 text-gray-600">Up to 2 years</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-[#0a0a0a] mb-3">4. Cookie Controls</h2>
            <p className="text-sm leading-relaxed">
              Most browsers let you view, delete, or block cookies. Since browser steps vary, check your browser's help documentation. Note that blocking essential cookies will likely prevent you from logging in or using core SentinelX features.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-[#0a0a0a] mb-3">5. Changes to This Policy</h2>
            <p className="text-sm leading-relaxed">
              We may update this Cookie Policy as SentinelX evolves. Changes will be reflected by updating the "Last Updated" date above.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-[#0a0a0a] mb-3">6. Contact Us</h2>
            <p className="text-sm leading-relaxed">
              If you have questions about this Cookie Policy, contact us at{' '}
              <a href="mailto:support@sentinelx.site" className="text-[#6D001A] hover:underline">
                support@sentinelx.site
              </a>
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
