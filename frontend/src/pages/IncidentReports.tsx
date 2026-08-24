import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const incidents = [
  { name: 'Squid Game Token (SQUID)', date: 'November 1, 2021', chain: 'Ethereum', loss: '$3.4M', type: 'Rug Pull', description: 'The token, inspired by the Netflix show, surged over 23,000,000% in days. When investors tried to sell, the deployer drained the liquidity pool. The token became untradable.', signals: ['Liquidity not locked', 'Owner can pause trading', 'Honeypot pattern detected'] },
  { name: 'AnubisDAO', date: 'October 28, 2021', chain: 'Ethereum', loss: '$60M', type: 'Liquidity Drain', description: 'AnubisDAO raised $60M in a liquidity offering. Within 24 hours, all liquidity was moved to a different wallet. The team claimed their domain was hacked.', signals: ['Deployer had unilateral access', 'No timelock on withdrawals', 'Unaudited contract'] },
  { name: 'Meerkat Finance', date: 'March 20, 2021', chain: 'BSC', loss: '$31M', type: 'Rug Pull', description: 'Meerkat Finance, a DeFi yield protocol, drained $31M from its vault just hours after launch. The team later claimed it was a "test" and that funds would be returned.', signals: ['Centralized vault control', 'No multi-sig', 'Rushed deployment'] },
  { name: 'DeFi100 (DFO)', date: 'May 22, 2021', chain: 'BSC', loss: '$32M', type: 'Rug Pull', description: 'The team drained funds and posted a taunting message on the project website. Investors were unable to recover any funds.', signals: ['Owner privilege abuse', 'No governance', 'Liquidity unlocked'] },
  { name: 'TurtleDex', date: 'March 17, 2022', chain: 'BSC', loss: '$2.5M', type: 'Liquidity Drain', description: 'Within minutes of launch, the team swapped all liquidity pool tokens and distributed them across multiple wallets, effectively rug-pulling investors.', signals: ['Deployer-controlled mint', 'No renounced ownership', 'Suspicious tokenomics'] },
  { name: 'Forsage', date: 'August 2022', chain: 'Ethereum/BSC', loss: '$340M', type: 'Ponzi Scheme', description: 'A smart-contract-based Ponzi scheme that operated for years. The SEC charged the founders with running a $340M fraudulent pyramid scheme.', signals: ['Referral-based returns', 'No real product', 'Unsustainable yield promises'] },
];

export function IncidentReports() {
  return (
    <div className="min-h-screen bg-white pt-28 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <span className="text-[#6D001A] font-mono text-xs tracking-[0.2em] uppercase mb-4 block">Intelligence</span>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-[#0a0a0a] mb-4">Incident Reports</h1>
          <p className="text-gray-500 max-w-2xl">Real-world rug pulls and security incidents. See how SentinelX would have detected these patterns.</p>
        </motion.div>

        <div className="space-y-6">
          {incidents.map((incident, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.08 }} className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm hover:border-[#6D001A]/20 transition-all">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="shrink-0">
                  <div className="text-3xl font-display font-bold text-red-500 mb-1">{incident.loss}</div>
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">{incident.type}</span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-lg font-display font-semibold text-[#0a0a0a]">{incident.name}</h3>
                    <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{incident.chain}</span>
                    <span className="text-xs font-mono text-gray-400">{incident.date}</span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{incident.description}</p>
                  <div>
                    <p className="text-xs font-mono text-[#6D001A] uppercase tracking-wider mb-2">What SentinelX would flag:</p>
                    <div className="flex flex-wrap gap-2">
                      {incident.signals.map((signal, i) => (
                        <span key={i} className="text-xs px-3 py-1 bg-[#6D001A]/5 text-[#6D001A] border border-[#6D001A]/10 rounded-full">
                          {signal}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12 bg-gray-50 rounded-3xl p-12 text-center border border-gray-100">
          <h2 className="text-2xl font-display font-bold text-[#0a0a0a] mb-4">Don't become the next statistic.</h2>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto">Analyze any contract before you invest. No account required for basic scans.</p>
          <Link to="/scan" className="inline-flex items-center gap-2 px-8 py-4 bg-[#6D001A] hover:bg-[#8B0023] text-white font-semibold rounded-full transition-all duration-300">
            Scan a Token
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
