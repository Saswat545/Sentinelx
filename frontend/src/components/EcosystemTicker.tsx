import React from 'react';

const ecosystemItems = [
  { name: 'Ethereum', icon: '◆' },
  { name: 'Solidity', icon: '◇' },
  { name: 'EVM', icon: '◉' },
  { name: 'OpenZeppelin', icon: '◈' },
  { name: 'MetaMask', icon: '◆' },
  { name: 'Chainlink', icon: '◇' },
  { name: 'Base', icon: '◉' },
  { name: 'Arbitrum', icon: '◈' },
  { name: 'Polygon', icon: '◆' },
  { name: 'Hardhat', icon: '◇' },
  { name: 'Foundry', icon: '◉' },
  { name: 'Etherscan', icon: '◈' },
];

const analysisCapabilities = [
  'AI RISK ANALYSIS',
  'STATIC ANALYSIS',
  'CONTRACT INTELLIGENCE',
  'RUG PULL DETECTION',
  'VULNERABILITY SCANNING',
  'RISK SCORING',
  'SHAP EXPLAINABILITY',
  'HONEYPOT DETECTION',
];

export function EcosystemTicker() {
  return (
    <section className="relative py-16 overflow-hidden bg-[#060608]">
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#060608] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#060608] to-transparent z-10 pointer-events-none" />

      {/* Section label */}
      <div className="text-center mb-8">
        <p className="text-[11px] font-['JetBrains_Mono'] text-white/30 tracking-[0.3em] uppercase">
          Built for the Ethereum security ecosystem
        </p>
      </div>

      {/* Ticker 1 - Ecosystem logos */}
      <div className="relative mb-6 group">
        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
          {[...ecosystemItems, ...ecosystemItems].map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2.5 px-8 py-3 shrink-0"
            >
              <span className="text-[#6D001A]/60 text-lg">{item.icon}</span>
              <span className="text-white/30 text-sm font-medium tracking-wide hover:text-white/60 transition-colors duration-300 whitespace-nowrap">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ticker 2 - Capabilities (opposite direction) */}
      <div className="relative group">
        <div className="flex w-max animate-marquee-reverse group-hover:[animation-play-state:paused]">
          {[...analysisCapabilities, ...analysisCapabilities].map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-6 py-2 shrink-0"
            >
              <span className="text-[#6D001A]/30 text-[10px]">●</span>
              <span className="text-white/20 text-xs font-['JetBrains_Mono'] tracking-[0.15em] uppercase whitespace-nowrap">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 35s linear infinite;
        }
      `}</style>
    </section>
  );
}
