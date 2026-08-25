import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('sentinelx_cookie_consent');
    if (consent) return;

    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('sentinelx_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('sentinelx_cookie_consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, x: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-50 w-80"
        >
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xl shadow-black/8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#6D001A]/10 flex items-center justify-center">
                <img
                  src="/brand/dark/Icon mark.png"
                  alt=""
                  className="w-4 h-4 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <h3 className="font-display font-semibold text-sm text-[#0a0a0a]">
                Cookie Preferences
              </h3>
            </div>

            {/* Content */}
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              We use cookies to enhance your experience and analyze site traffic.
              <a
                href="/privacy"
                className="text-[#6D001A] hover:underline ml-1 font-medium"
              >
                Learn more
              </a>
            </p>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleDecline}
                className="flex-1 px-3 py-2 border border-gray-200 text-gray-500 hover:text-[#0a0a0a] hover:border-[#6D001A]/30 rounded-lg text-xs font-semibold transition-all duration-200"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 px-3 py-2 bg-[#6D001A] hover:bg-[#8B0023] text-white rounded-lg text-xs font-semibold transition-all duration-200"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
