import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TextType from '../components/ui/TextType';

interface ComingSoonProps {
  title?: string;
  description?: string;
}

export function ComingSoon({ title = 'This Page', description }: ComingSoonProps) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 bg-white">
      {/* Subtle background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#6D001A]/3 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Coming soon badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-gray-50 border border-gray-200"
        >
          <span className="w-2 h-2 bg-[#6D001A] rounded-full animate-pulse" />
          <span className="text-xs font-mono text-gray-500 tracking-wider uppercase">Under Construction</span>
        </motion.div>

        {/* TextType animation */}
        <div className="mb-6 h-16 md:h-20 flex items-center justify-center">
          <TextType
            text={[title, 'Coming Soon', 'Stay Tuned']}
            typingSpeed={60}
            deletingSpeed={35}
            pauseDuration={2500}
            loop={true}
            showCursor={true}
            cursorCharacter="|"
            className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-[#0a0a0a]"
            textColors={['#0a0a0a', '#6D001A', '#0a0a0a']}
          />
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-gray-500 text-lg leading-relaxed mb-10 max-w-lg mx-auto"
        >
          {description || `We're working hard to bring you ${title.toLowerCase()}. Check back soon for updates.`}
        </motion.p>

        {/* Separator */}
        <div className="w-16 h-px bg-gray-200 mx-auto mb-10" />

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#6D001A] text-white font-semibold rounded-full transition-all duration-300 hover:bg-[#8B0023] hover:shadow-lg hover:shadow-[#6D001A]/20"
          >
            Back to Home
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-50 border border-gray-200 text-gray-600 font-medium rounded-full hover:bg-gray-100 hover:text-[#0a0a0a] transition-all duration-300"
          >
            Contact Us
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default ComingSoon;
