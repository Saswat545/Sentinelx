import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-8xl font-display font-bold text-brand-cobalt/20 mb-4">404</div>
        <h1 className="text-2xl font-display font-bold text-white mb-2">Signal Lost</h1>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-brand-cobalt hover:bg-brand-cobalt/90 text-white font-semibold rounded-xl transition-all duration-300"
          >
            Return Home
          </Link>
          <Link
            to="/analyze"
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all duration-300"
          >
            Analyze a Contract
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
