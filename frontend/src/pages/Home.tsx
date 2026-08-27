import React, { useState, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Dots } from '../components/ui/Dots';
import { TextShimmer } from '../components/ui/TextShimmer';
import LogoLoop from '../components/bits/LogoLoop';
import DepthCarousel from '../components/bits/DepthCarousel';
import SpotlightCard from '../components/bits/SpotlightCard';
import TextLoop from '../components/ui/TextLoop';
import ScrollReveal from '../components/ui/ScrollReveal';

const Beams = React.lazy(() => import('../components/bits/Beams').then(m => ({ default: m.default })));
const ScrollExpand = React.lazy(() => import('../components/bits/ScrollExpand').then(m => ({ default: m.default })));

const rugpullIncidents = [
  { image: 'https://picsum.photos/seed/rug1/400/500', alt: 'Squid Game Token', title: 'Squid Game Token', amount: '$3.4M', date: 'Nov 2021', description: 'Token creators rug-pulled investors after price surged 23M%. Holders unable to sell.' },
  { image: 'https://picsum.photos/seed/rug2/400/500', alt: 'AnubisDAO', title: 'AnubisDAO', amount: '$60M', date: 'Oct 2021', description: 'Liquidity drained within 24 hours of launch. Deployer moved all funds to personal wallet.' },
  { image: 'https://picsum.photos/seed/rug3/400/500', alt: 'Meerkat Finance', title: 'Meerkat Finance', amount: '$31M', date: 'Mar 2021', description: 'DeFi protocol drained hours after launch. Deployer claimed it was a "test".' },
  { image: 'https://picsum.photos/seed/rug4/400/500', alt: 'Forsage', title: 'Forsage', amount: '$340M', date: 'Aug 2022', description: 'Ponzi scheme operating as a smart contract. SEC charged founders with fraud.' },
  { image: 'https://picsum.photos/seed/rug5/400/500', alt: 'DeFi100', title: 'DeFi100', amount: '$32M', date: 'May 2021', description: 'Team abandoned project after draining treasury. Website displayed a taunting message.' },
  { image: 'https://picsum.photos/seed/rug6/400/500', alt: 'TurtleDex', title: 'TurtleDex', amount: '$2.5M', date: 'Mar 2022', description: 'Liquidity pooled tokens swapped and sent to multiple wallets within minutes of launch.' },
];

const faqs = [
  { q: 'What is SentinelX?', a: 'SentinelX is an AI-powered blockchain security platform that analyzes Ethereum smart contracts and token addresses to identify potential rug-pull indicators, dangerous contract behaviors, and other security risks using machine learning and rule-based detection.' },
  { q: 'How does the risk score work?', a: 'SentinelX uses an XGBoost machine learning model trained on 2,400+ labeled contracts with 53 feature extraction signals. The model produces a risk score from 0-100, where lower scores indicate lower risk. Each analysis includes SHAP-based explainability so you can understand exactly which factors contributed to the score.' },
  { q: 'Can I analyze any Ethereum contract?', a: 'Yes. You can analyze any Ethereum smart contract by entering its address (we fetch verified source code via Etherscan) or by pasting raw Solidity source code directly. We support Ethereum mainnet analysis.' },
  { q: 'Does a low risk score guarantee safety?', a: 'No. SentinelX provides automated risk signals based on ML analysis and pattern detection. A low score does not guarantee that a contract is safe. Always do your own research and never invest more than you can afford to lose.' },
  { q: 'Is SentinelX free to use?', a: 'SentinelX offers a free tier for basic contract analysis. Premium plans provide faster analysis, batch scanning, API access, and advanced threat detection capabilities.' },
];

const threatTypes = [
  { name: 'Honeypot Detection', desc: 'Identifies tokens that prevent selling', severity: 'critical', icon: 'M18.36 9.64a9 9 0 01-12.73 0M12 12v4m0 0h.01' },
  { name: 'Hidden Mint', desc: 'Detects unauthorized token minting functions', severity: 'high', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { name: 'Blacklist Abuse', desc: 'Finds discriminatory owner-only sell blocks', severity: 'high', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
  { name: 'Proxy Upgrade', desc: 'Flags upgradeable contracts with admin backdoors', severity: 'medium', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
  { name: 'Owner Privilege', desc: 'Detects excessive owner-only functions', severity: 'medium', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { name: 'Fee Manipulation', desc: 'Identifies dynamic fee structures that can be exploited', severity: 'high', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

const steps = [
  { num: '01', title: 'Enter Address', desc: 'Paste any Ethereum contract address or Solidity source code into the scanner.' },
  { num: '02', title: 'AI Analysis', desc: 'Our XGBoost model extracts 53+ features and performs real-time risk classification.' },
  { num: '03', title: 'Explainable Results', desc: 'SHAP feature attribution shows you exactly why the contract received its risk score.' },
  { num: '04', title: 'Make Informed Decisions', desc: 'Use transparent, AI-backed insights before interacting with any smart contract.' },
];

const metrics = [
  { value: '96.15%', label: 'Model Accuracy', sub: 'XGBoost Classifier' },
  { value: '53+', label: 'Security Signals', sub: 'Feature Extraction' },
  { value: '2,400+', label: 'Contracts Trained', sub: 'Labeled Dataset' },
  { value: '<3s', label: 'Analysis Time', sub: 'Average Response' },
];

const ecosystemLogos = [
  { node: <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '15px', color: '#ffffff' }}>Ethereum</span>, title: 'Ethereum' },
  { node: <span style={{ fontFamily: 'Arial', fontWeight: 900, letterSpacing: '0.08em', fontSize: '13px', textTransform: 'uppercase', color: '#ffffff' }}>Solidity</span>, title: 'Solidity' },
  { node: <span style={{ fontFamily: 'Trebuchet MS', fontWeight: 600, fontSize: '15px', color: '#ffffff' }}>EVM</span>, title: 'EVM' },
  { node: <span style={{ fontFamily: 'Courier New', fontWeight: 700, letterSpacing: '0.12em', fontSize: '13px', textTransform: 'uppercase', color: '#ffffff' }}>OpenZeppelin</span>, title: 'OpenZeppelin' },
  { node: <span style={{ fontFamily: 'Verdana', fontWeight: 700, fontSize: '13px', color: '#ffffff' }}>MetaMask</span>, title: 'MetaMask' },
  { node: <span style={{ fontFamily: 'Palatino', fontWeight: 500, fontSize: '15px', color: '#ffffff' }}>Chainlink</span>, title: 'Chainlink' },
  { node: <span style={{ fontFamily: 'Arial', fontWeight: 800, fontSize: '14px', color: '#ffffff' }}>Base</span>, title: 'Base' },
  { node: <span style={{ fontFamily: 'Verdana', fontWeight: 700, fontSize: '13px', color: '#ffffff' }}>Arbitrum</span>, title: 'Arbitrum' },
  { node: <span style={{ fontFamily: 'Georgia', fontWeight: 600, fontSize: '14px', color: '#ffffff' }}>Polygon</span>, title: 'Polygon' },
  { node: <span style={{ fontFamily: 'Courier New', fontWeight: 700, fontSize: '13px', color: '#ffffff' }}>Hardhat</span>, title: 'Hardhat' },
  { node: <span style={{ fontFamily: 'Helvetica', fontWeight: 700, fontSize: '13px', color: '#ffffff' }}>Foundry</span>, title: 'Foundry' },
  { node: <span style={{ fontFamily: 'Verdana', fontWeight: 700, fontSize: '13px', color: '#ffffff' }}>Etherscan</span>, title: 'Etherscan' },
];

const analysisCapabilities = [
  'AI Risk Analysis', 'Static Analysis', 'Contract Intelligence', 'Rug Pull Detection', 'Vulnerability Scanning', 'Risk Scoring',
];

const getSeverityStyle = (severity: string) => {
  if (severity === 'critical') return { bg: 'bg-red-50 border-red-200', dot: 'bg-red-500', text: 'text-red-600', label: 'CRITICAL' };
  if (severity === 'high') return { bg: 'bg-orange-50 border-orange-200', dot: 'bg-orange-500', text: 'text-orange-600', label: 'HIGH' };
  return { bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500', text: 'text-amber-600', label: 'MEDIUM' };
};

export function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <Suspense fallback={null}>
            <Beams beamWidth={2} beamHeight={15} beamNumber={12} lightColor="#ffffff" speed={2} noiseIntensity={1.75} scale={0.2} rotation={0} />
          </Suspense>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 z-[1]" />
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-24">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 shadow-sm">
            <span className="w-2 h-2 bg-[#6D001A] rounded-full animate-pulse" />
            <span className="text-xs font-mono text-white/50 tracking-wider uppercase">AI-Powered Security</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} className="text-5xl md:text-7xl lg:text-[88px] font-display font-bold mb-6 leading-[1.05] tracking-tight text-white">
            Detect Rug Pulls<br /><span className="text-white/40">Before They</span><br /><span className="text-[#6D001A]">Drain Your Wallet</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed">
            SentinelX analyzes Ethereum smart contracts using machine learning, static code analysis, and 53+ security signals to detect rug pulls, honeypots, and hidden backdoors — before you sign anything.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/scan" className="group inline-flex items-center gap-3 px-8 py-4 bg-[#6D001A] text-white font-semibold rounded-full transition-all duration-300 hover:bg-[#8B0023] hover:shadow-lg hover:shadow-[#6D001A]/20">
              Scan a Token
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
            </Link>
            <Link to="/how-it-works" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 font-medium rounded-full hover:bg-white/15 hover:text-white transition-all duration-300">See How It Works</Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════ ECOSYSTEM TICKER ═══════ */}
      <section className="relative py-12 overflow-hidden bg-black border-y border-white/5">
        <div className="text-center mb-6">
          <p className="text-[11px] font-mono text-white/70 tracking-[0.3em] uppercase">Built for the Ethereum security ecosystem</p>
        </div>
        <LogoLoop logos={ecosystemLogos} speed={30} direction="left" logoHeight={24} gap={48} fadeOut fadeOutColor="#0a0a0a" ariaLabel="Ecosystem technologies" />
        <div className="mt-6">
          <LogoLoop logos={analysisCapabilities.map(name => ({ node: <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 500, fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B1B30' }}>{name}</span>, title: name }))} speed={25} direction="right" logoHeight={20} gap={32} fadeOut fadeOutColor="#0a0a0a" ariaLabel="Analysis capabilities" />
        </div>
      </section>

      {/* ═══════ RUGPULL INCIDENTS - DEPTH CAROUSEL ═══════ */}
      <section className="py-24 px-4 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#6D001A]/10 rounded-full blur-[120px]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-[#6D001A] font-mono text-xs tracking-[0.2em] uppercase mb-4 block">Real-World Incidents</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 text-white">Millions lost to rug pulls.</h2>
            <p className="text-white/40 max-w-2xl mx-auto">SentinelX was built to detect these patterns before they drain your wallet. Swipe through real incidents.</p>
          </motion.div>
          <DepthCarousel items={rugpullIncidents} cardWidth={320} cardHeight={420} radius={16} tint="rgba(0,0,0,0.5)" depth={200} spread={100} tilt={20} tiltDirection="right" perspective={1400} visibleCards={3} falloff={0.18} blur={4} duration={600} autoplay autoplayDelay={4000} loop />
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-12">
            <p className="text-white/30 text-sm mb-6">Don't become the next statistic.</p>
            <Link to="/scan" className="inline-flex items-center gap-2 px-8 py-4 bg-[#6D001A] hover:bg-[#8B0023] text-white font-semibold rounded-full transition-all duration-300 shadow-lg shadow-[#6D001A]/30">
              Scan Before You Invest
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════ SCROLL EXPAND ═══════ */}
      <section className="bg-white">
        <Suspense fallback={<div className="h-[120vh]" />}>
          <ScrollExpand title="Built for Trust" scrollHint="Scroll to expand" startWidth={65} startHeight={55} startRadius={24} endRadius={0} mediaZoom={1.15} scrollDistance={1.5} holdDistance={0.4} overlayScrim={0.5}>
            <h2>Every pixel, everywhere.</h2>
            <p>SentinelX analyzes the signals that matter — so you don't have to read every line of code.</p>
          </ScrollExpand>
        </Suspense>
      </section>

      {/* ═══════ WHY SENTINELX ═══════ */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-[#6D001A] font-mono text-xs tracking-[0.2em] uppercase mb-4 block">Why SentinelX</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-[#0a0a0a]">Every smart contract<br /><span className="text-gray-400">tells a story.</span></h2>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto">SentinelX combines static analysis, machine learning, and explainable AI to detect malicious smart contracts — before your wallet signs anything.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', title: 'Static Code Analysis', description: 'Deep inspection of Solidity bytecode for dangerous patterns, backdoors, and known vulnerability signatures.' },
              { icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', title: 'Machine Learning', description: 'XGBoost model trained on 2,400+ labeled contracts achieving 96.15% accuracy for rug pull classification.' },
              { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Explainable AI', description: 'SHAP feature attribution provides transparent, interpretable explanations for every risk score prediction.' },
            ].map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.15 }} whileHover={{ y: -8, transition: { duration: 0.3 } }} className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-[#6D001A]/20 transition-all duration-500 group shadow-sm">
                <div className="w-14 h-14 rounded-xl bg-[#6D001A]/5 flex items-center justify-center text-[#6D001A] mb-6 group-hover:bg-[#6D001A]/10 transition-colors">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} /></svg>
                </div>
                <h3 className="text-xl font-display font-semibold mb-3 text-[#0a0a0a]">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ THREAT DETECTION ═══════ */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-[#6D001A] font-mono text-xs tracking-[0.2em] uppercase mb-4 block">Threat Detection</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-[#0a0a0a]">What we detect.</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {threatTypes.map((threat, index) => {
              const sev = getSeverityStyle(threat.severity);
              return (
                <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                  <SpotlightCard className="h-full" spotlightColor="rgba(109, 0, 26, 0.12)">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl ${sev.bg} flex items-center justify-center`}>
                          <svg className={`w-5 h-5 ${sev.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={threat.icon} />
                          </svg>
                        </div>
                        <div>
                          <span className={`text-[10px] font-mono ${sev.text} uppercase tracking-wider font-semibold`}>{sev.label}</span>
                        </div>
                      </div>
                      <h3 className="text-[#0a0a0a] font-display font-semibold mb-2">{threat.name}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{threat.desc}</p>
                    </div>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section id="how-it-works" className="py-24 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-[#6D001A] font-mono text-xs tracking-[0.2em] uppercase mb-4 block">How It Works</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-[#0a0a0a]">Four steps to clarity.</h2>
          </motion.div>
          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.15 }} className="flex items-start gap-6 p-6 bg-white rounded-2xl border border-gray-200 hover:border-[#6D001A]/20 transition-all group shadow-sm">
                <span className="text-4xl font-display font-bold text-[#6D001A]/15 group-hover:text-[#6D001A]/30 transition-colors shrink-0">{step.num}</span>
                <div>
                  <h3 className="text-lg font-display font-semibold text-[#0a0a0a] mb-1">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ METRICS ═══════ */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-[#6D001A] font-mono text-xs tracking-[0.2em] uppercase mb-4 block">Model Performance</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-[#0a0a0a]">Verified metrics.</h2>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 text-center hover:border-[#6D001A]/20 transition-all">
                <p className="text-3xl md:text-4xl font-display font-bold text-[#0a0a0a] mb-2">{metric.value}</p>
                <p className="text-gray-600 text-sm font-medium mb-1">{metric.label}</p>
                <p className="text-gray-400 text-xs font-mono">{metric.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TEXT LOOP (GSAP PATH) ═══════ */}
      <section className="py-20 px-4 bg-[#0a0a0a] overflow-hidden">
        <TextLoop
          text="SentinelX • Detect Rug Pulls • Analyze Smart Contracts • AI-Powered Security • Protect Your Wallet"
          shape="wave"
          speed={70}
          direction="forward"
          separator="✦"
          curviness={80}
          fontSize={38}
          fontWeight={800}
          letterSpacing={1}
          uppercase={true}
          color="#ffffff"
          ribbon={true}
          ribbonColor="rgba(109, 0, 26, 0.3)"
          ribbonWidth={72}
          pauseOnHover={true}
          className="max-w-5xl mx-auto"
        />
      </section>

      {/* ═══════ SCROLL REVEAL ═══════ */}
      <section className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal
            enableBlur={true}
            baseOpacity={0.1}
            baseRotation={2}
            blurStrength={6}
            containerClassName=""
            textClassName="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-white leading-tight"
          >{'Every smart contract tells a story. Some lie. SentinelX reads between the lines — analyzing 53+ security signals with machine learning to detect rug pulls, honeypots, and hidden backdoors before they drain your wallet.'}</ScrollReveal>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-[#6D001A] font-mono text-xs tracking-[0.2em] uppercase mb-4 block">FAQ</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-[#0a0a0a]">Frequently asked questions.</h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.08 }} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <button onClick={() => setActiveFaq(activeFaq === index ? null : index)} className="w-full flex items-center justify-between p-6 text-left">
                  <span className="text-[#0a0a0a] font-medium text-sm pr-4">{faq.q}</span>
                  <svg className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      <div className="px-6 pb-6 text-gray-500 text-sm leading-relaxed">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className="py-32 px-4 bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#6D001A]/20 rounded-full blur-[120px]" />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-white">Protect your wallet<br /><span className="text-white/40">before it's too late.</span></h2>
          <p className="text-white/40 text-lg mb-10 max-w-xl mx-auto">Start analyzing smart contracts for free. No account required for basic scans.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/scan" className="group inline-flex items-center gap-3 px-8 py-4 bg-[#6D001A] hover:bg-[#8B0023] text-white font-semibold rounded-full transition-all duration-300 shadow-lg shadow-[#6D001A]/30">
              Scan a Token
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
            <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white/70 font-medium rounded-full hover:bg-white/15 hover:text-white transition-all duration-300">Create Account</Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
