import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Check if user has already consented
    const consent = localStorage.getItem('sentinelx_cookie_consent');
    if (consent) {
      setHasConsented(true);
    } else {
      // Show popup after a short delay
      timer = setTimeout(() => setIsVisible(true), 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleAccept = () => {
    localStorage.setItem('sentinelx_cookie_consent', 'accepted');
    setHasConsented(true);
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('sentinelx_cookie_consent', 'declined');
    setHasConsented(true);
    setIsVisible(false);
  };

  if (hasConsented || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto glass rounded-2xl p-6 border border-brand-cobalt/30 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Cookie icon */}
              <div className="w-12 h-12 rounded-xl bg-brand-cobalt/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-brand-cobalt" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="font-display font-semibold text-lg mb-2">Cookie Preferences</h3>
                <p className="text-sm text-dark-muted leading-relaxed">
                  We use cookies to enhance your experience and analyze site traffic. 
                  By clicking "Accept", you consent to the use of cookies for analytics purposes.
                  <a href="/privacy" className="text-brand-cobalt hover:underline ml-1">
                    Read our Privacy Policy
                  </a>
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 w-full md:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDecline}
                  className="flex-1 md:flex-none px-6 py-3 border border-dark-border text-dark-muted hover:text-dark-text hover:border-brand-cobalt/30 rounded-lg text-sm font-semibold transition-all duration-200"
                >
                  Decline
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAccept}
                  className="flex-1 md:flex-none px-6 py-3 bg-brand-cobalt hover:bg-brand-cobalt/90 text-white rounded-lg text-sm font-semibold transition-all duration-200"
                >
                  Accept
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
