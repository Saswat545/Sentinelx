import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Dots } from './ui/Dots';
import LightRays from './bits/LightRays';

export function LoadingScreen() {
  const [letters, setLetters] = useState<{ char: string; delay: number }[]>([]);
  const text = 'SentinelX';

  useEffect(() => {
    setLetters(
      text.split('').map((char, i) => ({
        char,
        delay: i * 0.08 + 0.4,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden">
      {/* LightRays background — white, large, full viewport */}
      <div className="absolute inset-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={0.8}
          lightSpread={1.2}
          rayLength={2.5}
          followMouse={true}
          mouseInfluence={0.15}
          noiseAmount={0.05}
          distortion={0.03}
          fadeDistance={1.4}
          saturation={0.8}
        />
      </div>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(10,10,10,0.3)_0%,_rgba(10,10,10,0.7)_100%)] z-[4]" />

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
            className="w-16 h-16 object-contain brightness-0 invert"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* Pulse ring */}
          <div className="absolute inset-0 -m-3">
            <div
              className="w-[calc(100%+24px)] h-[calc(100%+24px)] rounded-full border border-white/10 animate-ping"
              style={{ animationDuration: '2s' }}
            />
          </div>
        </motion.div>

        {/* SentinelX Split Text Animation */}
        <div className="flex items-center justify-center overflow-hidden">
          {letters.map((letter, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{
                duration: 0.8,
                delay: letter.delay,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-4xl md:text-6xl font-display font-bold text-white inline-block"
              style={{ willChange: 'transform, opacity, filter' }}
            >
              {letter.char === 'X' ? (
                <span className="text-[#6D001A]">X</span>
              ) : (
                letter.char
              )}
            </motion.span>
          ))}
        </div>

        {/* Blinking dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <Dots className="w-2.5 h-2.5 text-white/40" dots={3} />
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-[10px] font-mono text-white/20 tracking-[0.3em] uppercase"
        >
          AI-Powered Blockchain Security
        </motion.p>
      </div>
    </div>
  );
}
