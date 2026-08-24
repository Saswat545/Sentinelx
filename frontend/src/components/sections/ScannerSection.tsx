import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ScannerSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [contractAddress, setContractAddress] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!contractAddress) return;
    setIsAnalyzing(true);
    // TODO: Integrate with real API
    setTimeout(() => setIsAnalyzing(false), 3000);
  };

  return (
    <section 
      ref={sectionRef}
      className="relative py-24 px-4 bg-dark-surface/50"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Analyze a Smart Contract
          </h2>
          <p className="text-dark-muted max-w-2xl mx-auto">
            Enter any Ethereum contract address to detect potential rug pulls, 
            honeypots, and security vulnerabilities.
          </p>
        </motion.div>

        {/* Scanner Input */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="glass rounded-2xl p-6 md:p-8 border border-brand-cobalt/30">
            {/* Input container */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  placeholder="Enter contract address (0x...)"
                  className="w-full px-6 py-4 bg-dark-deep border border-dark-border rounded-xl text-dark-text placeholder-dark-muted font-mono focus:outline-none focus:border-brand-cobalt focus:ring-2 focus:ring-brand-cobalt/30 transition-all duration-300"
                />
                {contractAddress && (
                  <button
                    onClick={() => setContractAddress('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-muted hover:text-dark-text transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAnalyze}
                disabled={!contractAddress || isAnalyzing}
                className="px-8 py-4 bg-gradient-to-r from-brand-cobalt to-brand-indigo text-white font-display font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 glow"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze Contract
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </motion.button>
            </div>

            {/* Supported features */}
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-dark-muted">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-cobalt" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                53+ Security Signals
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-cobalt" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                XGBoost ML Model
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-cobalt" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 2a1 1 0 10-2 0v2a1 1 0 102 0V9zM9 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
                </svg>
                SHAP Explainability
              </span>
            </div>
          </div>

          {/* Glow effect behind scanner */}
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-cobalt/20 to-brand-indigo/20 rounded-2xl blur-xl -z-10" />
        </motion.div>
      </div>
    </section>
  );
}
