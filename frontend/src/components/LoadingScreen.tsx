import React from 'react';
import { Dots } from './ui/Dots';
import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden">
      {/* Subtle radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(109,0,26,0.08)_0%,_transparent_70%)]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Logo mark with pulse */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <img
            src="/brand/dark/Icon mark.png"
            alt="SentinelX"
            className="w-16 h-16 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* Pulse ring */}
          <div className="absolute inset-0 -m-3">
            <div className="w-[calc(100%+24px)] h-[calc(100%+24px)] rounded-full border border-[#6D001A]/20 animate-ping" style={{ animationDuration: '2s' }} />
          </div>
        </motion.div>

        {/* SentinelX text */}
        <motion.h1
          initial={{ filter: 'blur(20px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight"
        >
          Sentinel<span className="text-[#6D001A]">X</span>
        </motion.h1>

        {/* Blinking dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Dots className="w-2.5 h-2.5 text-white/40" dots={3} />
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-[10px] font-mono text-white/20 tracking-[0.3em] uppercase"
        >
          AI-Powered Blockchain Security
        </motion.p>
      </div>
    </div>
  );
}
