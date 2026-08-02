import React from 'react';

interface Partner {
  name: string;
  badge: string;
  category: string;
}

const PARTNERS: Partner[] = [
  { name: 'ETHEREUM', badge: 'Mainnet Protocol', category: 'L1 Blockchain' },
  { name: 'OPENZEPPELIN', badge: 'Security Contracts', category: 'Audit Standard' },
  { name: 'GITHUB', badge: 'Code Repository', category: 'Dev Ops' },
  { name: 'CHAINLINK', badge: 'Oracle Network', category: 'Data Feed' },
  { name: 'POLYGON', badge: 'PoS & ZK-EVM', category: 'L2 Scaling' },
  { name: 'UNISWAP', badge: 'DEX Liquidity', category: 'DeFi Protocol' },
  { name: 'AAVE', badge: 'Lending Pool', category: 'DeFi Infrastructure' },
  { name: 'ARBITRUM', badge: 'Nitro Rollup', category: 'L2 Scaling' },
  { name: 'OPTIMISM', badge: 'OP Stack', category: 'L2 Scaling' },
  { name: 'CERTIK', badge: 'Security Verification', category: 'Auditing' },
  { name: 'BASE', badge: 'Coinbase L2', category: 'Ecosystem' },
  { name: 'SOLANA', badge: 'High-Throughput', category: 'L1 Blockchain' },
];

export const PartnerMarquee: React.FC = () => {
  // Duplicate list to achieve infinite seamless looping
  const marqueeItems = [...PARTNERS, ...PARTNERS];

  return (
    <div className="w-full overflow-hidden bg-[#0b132b]/80 border-y border-[#457b9d]/30 py-6 relative select-none">
      
      {/* Soft gradient fade on left and right edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0b132b] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0b132b] to-transparent z-10 pointer-events-none"></div>

      <div className="flex animate-marquee items-center gap-6">
        {marqueeItems.map((partner, index) => (
          <div
            key={index}
            className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-[#1c2541]/90 border border-[#457b9d]/40 shadow-sm hover:border-[#a8dadc] transition-colors cursor-pointer group shrink-0"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#a8dadc] group-hover:bg-[#e63946] transition-colors"></div>
            <div className="flex flex-col text-left">
              <span className="font-heading font-extrabold text-xs tracking-wider text-[#f1faee] group-hover:text-[#a8dadc] transition-colors">
                {partner.name}
              </span>
              <span className="text-[10px] font-sans text-[#a8dadc]/70">
                {partner.badge}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
