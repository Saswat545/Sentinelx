import React from 'react';

export const SentinelAnimation: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center min-h-[440px] w-full bg-[#1c2541] rounded-2xl border border-[#457b9d]/40 p-8 overflow-hidden select-none ${className}`}>
      
      {/* Subtle Grid Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#457b9d_1px,transparent_1px)] [background-size:24px_24px] opacity-30"></div>
      
      {/* Soft Glow Ambient Layer */}
      <div className="absolute w-72 h-72 rounded-full bg-[#457b9d]/20 blur-3xl pointer-events-none"></div>

      {/* Pulsing Blockchain Network Node Graphic */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        
        {/* Outer Circular Node Ring */}
        <div className="absolute inset-0 rounded-full border border-[#457b9d]/50 border-dashed animate-[spin_40s_linear_infinite]"></div>

        {/* Orbiting Nodes & Blockchain Connection Lines */}
        <svg className="absolute inset-0 w-full h-full text-[#457b9d]" viewBox="0 0 200 200" fill="none">
          {/* Connection Lines */}
          <line x1="100" y1="100" x2="30" y2="50" stroke="#457b9d" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="100" y1="100" x2="170" y2="40" stroke="#457b9d" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="100" y1="100" x2="160" y2="160" stroke="#457b9d" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="100" y1="100" x2="40" y2="150" stroke="#457b9d" strokeWidth="1" strokeDasharray="3 3" />
          
          <line x1="30" y1="50" x2="170" y2="40" stroke="#1d3557" strokeWidth="1" />
          <line x1="170" y1="40" x2="160" y2="160" stroke="#1d3557" strokeWidth="1" />
          <line x1="160" y1="160" x2="40" y2="150" stroke="#1d3557" strokeWidth="1" />
          <line x1="40" y1="150" x2="30" y2="50" stroke="#1d3557" strokeWidth="1" />

          {/* Node Points in New Color Palette */}
          <circle cx="30" cy="50" r="4" fill="#a8dadc" className="animate-node-pulse" />
          <circle cx="170" cy="40" r="3.5" fill="#457b9d" className="animate-node-pulse" style={{ animationDelay: '0.6s' }} />
          <circle cx="160" cy="160" r="4" fill="#e63946" className="animate-node-pulse" style={{ animationDelay: '1.2s' }} />
          <circle cx="40" cy="150" r="3.5" fill="#f1faee" className="animate-node-pulse" style={{ animationDelay: '1.8s' }} />
        </svg>

        {/* Outer Rotating Diamond Geometry */}
        <div className="absolute w-44 h-44 border border-[#a8dadc]/30 rounded-3xl transform rotate-45 animate-[spin_25s_linear_infinite]"></div>

        {/* Inner Counter-Rotating Hex Geometry */}
        <div className="absolute w-32 h-32 border border-[#457b9d]/60 rounded-2xl transform -rotate-12 animate-[spin_18s_linear_infinite_reverse]"></div>

        {/* SentinelX Central Emblem Shield */}
        <div className="relative z-10 w-24 h-24 bg-[#1d3557] rounded-2xl border border-[#a8dadc]/40 flex items-center justify-center shadow-2xl">
          <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
            <path d="M20 3L6 9V19C6 28.5 12.2 35.8 20 38C27.8 35.8 34 28.5 34 19V9L20 3Z" fill="#0b132b" stroke="#457b9d" strokeWidth="2.5" />
            <path d="M13 14L27 26M27 14L13 26" stroke="#a8dadc" strokeWidth="3" strokeLinecap="round" />
          </svg>
          {/* Radar Scan Line Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#a8dadc]/0 via-[#a8dadc]/15 to-[#a8dadc]/0 animate-[ping_3s_ease-in-out_infinite] rounded-2xl opacity-40 pointer-events-none"></div>
        </div>

      </div>

      {/* Subtitle statement */}
      <div className="relative z-10 mt-8 text-center max-w-xs space-y-2">
        <p className="text-sm font-heading font-medium text-[#f1faee] tracking-tight leading-relaxed">
          Analyze every smart contract with confidence.
        </p>
        <p className="text-xs text-[#a8dadc] font-sans">
          Deploy with trust.
        </p>
      </div>

      {/* Security Status Tag */}
      <div className="relative z-10 mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0b132b] border border-[#457b9d]/50 text-[11px] font-sans text-[#a8dadc]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#e63946] animate-ping"></span>
        <span>AI Machine Learning Engine Deployed</span>
      </div>

    </div>
  );
};
