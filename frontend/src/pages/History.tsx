import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function History() {
  return (
    <div className="min-h-screen bg-white pt-28 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-display font-bold text-[#0a0a0a] mb-2">Scan History</h1>
          <p className="text-gray-500 text-sm">View all your previous contract analyses.</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by contract address..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0a0a] placeholder-gray-400 font-mono text-sm focus:outline-none focus:border-[#6D001A] focus:ring-1 focus:ring-[#6D001A]/20 transition-all"
            />
          </div>
          <select className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 text-sm focus:outline-none focus:border-[#6D001A] appearance-none cursor-pointer">
            <option>All Risk Levels</option>
            <option>Low Risk</option>
            <option>Medium Risk</option>
            <option>High Risk</option>
            <option>Critical</option>
          </select>
          <select className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 text-sm focus:outline-none focus:border-[#6D001A] appearance-none cursor-pointer">
            <option>Newest First</option>
            <option>Oldest First</option>
            <option>Highest Risk</option>
          </select>
        </motion.div>

        {/* Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm"
        >
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-display font-semibold text-[#0a0a0a] mb-3">No Analyses Yet</h2>
            <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto leading-relaxed">
              Your completed contract analyses will appear here with full history, risk scores, and security flags. Start your first scan to begin building your security profile.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/scan"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#6D001A] hover:bg-[#8B0023] text-white font-semibold rounded-xl transition-all duration-300"
              >
                Start Your First Scan
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-all"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
