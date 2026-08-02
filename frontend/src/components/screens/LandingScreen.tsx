import React, { useState } from 'react';
import { NavigationPage } from '../../types';
import { SentinelLogo } from '../ui/SentinelLogo';
import { LandingSkeleton } from '../ui/SkeletonLoader';
import { PartnerMarquee } from '../ui/PartnerMarquee';
import { 
  ShieldAlert, ArrowRight, CheckCircle2, Cpu, 
  Terminal, ChevronRight, Code2, Zap, Copy, Check
} from 'lucide-react';

interface LandingScreenProps {
  onNavigate: (page: NavigationPage) => void;
  onSelectSampleContract: (sampleId: string) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onNavigate,
  onSelectSampleContract,
}) => {
  const [isLoadingSkeleton] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'findings' | 'source'>('overview');

  const handleCopyCode = () => {
    const code = `npm install @sentinelx/sdk\n\nimport { SentinelX } from '@sentinelx/sdk';\nconst client = new SentinelX({ apiKey: process.env.SENTINELX_API_KEY });\nconst report = await client.analyzeContract('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D');`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (isLoadingSkeleton) {
    return <LandingSkeleton />;
  }

  return (
    <div className="bg-[#0b132b] text-[#f1faee] min-h-screen font-sans selection:bg-[#e63946] selection:text-white">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-24 border-b border-[#457b9d]/30 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Side */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Live Status Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1c2541] border border-[#457b9d]/40 text-[#a8dadc] text-xs font-sans">
              <span className="w-2 h-2 rounded-full bg-[#e63946] animate-ping"></span>
              <span>AI Blockchain Risk Engine Active</span>
            </div>

            {/* Headline in Montserrat */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#f1faee] tracking-tight leading-[1.12] font-heading">
              Analyze Smart Contracts Before You Trust Them.
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-[#a8dadc] leading-relaxed max-w-xl font-sans">
              AI-powered blockchain security for investors and developers. Detect rug pulls, security vulnerabilities, and hidden risks before interacting with Ethereum smart contracts.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-heading">
              <button
                onClick={() => onNavigate('analyzer')}
                className="px-6 py-3.5 text-sm font-bold rounded-xl bg-[#e63946] hover:bg-[#d62828] text-white transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('docs')}
                className="px-6 py-3.5 text-sm font-semibold rounded-xl bg-[#1c2541] hover:bg-[#15263f] text-[#f1faee] border border-[#457b9d]/40 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Terminal className="w-4 h-4 text-[#a8dadc]" />
                <span>View Documentation</span>
              </button>
            </div>

            {/* Quick Test Links */}
            <div className="pt-4 flex flex-wrap items-center gap-2 text-xs text-[#a8dadc]">
              <span className="font-heading font-semibold text-[#f1faee]">Try Live Audit Samples:</span>
              <button
                onClick={() => {
                  onSelectSampleContract('sample-honeypot');
                  onNavigate('analyzer');
                }}
                className="px-2.5 py-1 rounded-lg bg-[#1c2541] border border-[#457b9d]/40 hover:border-[#a8dadc] text-[#f1faee] transition-colors cursor-pointer"
              >
                ElonMars (Honeypot)
              </button>
              <button
                onClick={() => {
                  onSelectSampleContract('sample-safe-erc20');
                  onNavigate('analyzer');
                }}
                className="px-2.5 py-1 rounded-lg bg-[#1c2541] border border-[#457b9d]/40 hover:border-[#a8dadc] text-[#f1faee] transition-colors cursor-pointer"
              >
                Aether Token (Verified Safe)
              </button>
            </div>

          </div>

          {/* Hero Right Side: Dashboard Preview Widget */}
          <div className="lg:col-span-6">
            <div className="bg-[#1c2541] rounded-2xl border border-[#457b9d]/50 shadow-2xl overflow-hidden text-left">
              
              {/* Header Bar */}
              <div className="bg-[#0b132b] px-4 py-3 border-b border-[#457b9d]/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#e63946]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#a8dadc]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#457b9d]"></div>
                  <span className="ml-2 text-xs font-sans text-[#a8dadc] truncate">
                    SentinelX Intelligence Console — 0x7a25...2488D
                  </span>
                </div>
                <span className="px-2.5 py-0.5 text-[10px] font-sans font-bold rounded bg-[#e63946]/20 text-[#e63946] border border-[#e63946]/50">
                  HIGH RISK (94/100)
                </span>
              </div>

              {/* Sub-Header Tabs */}
              <div className="flex border-b border-[#457b9d]/30 bg-[#1c2541] px-4 text-xs font-heading">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2.5 px-3 border-b-2 font-semibold cursor-pointer ${
                    activeTab === 'overview'
                      ? 'border-[#a8dadc] text-[#f1faee]'
                      : 'border-transparent text-[#a8dadc]/70 hover:text-[#f1faee]'
                  }`}
                >
                  Contract Overview
                </button>
                <button
                  onClick={() => setActiveTab('findings')}
                  className={`py-2.5 px-3 border-b-2 font-semibold cursor-pointer ${
                    activeTab === 'findings'
                      ? 'border-[#a8dadc] text-[#f1faee]'
                      : 'border-transparent text-[#a8dadc]/70 hover:text-[#f1faee]'
                  }`}
                >
                  Security Findings (3)
                </button>
                <button
                  onClick={() => setActiveTab('source')}
                  className={`py-2.5 px-3 border-b-2 font-semibold cursor-pointer ${
                    activeTab === 'source'
                      ? 'border-[#a8dadc] text-[#f1faee]'
                      : 'border-transparent text-[#a8dadc]/70 hover:text-[#f1faee]'
                  }`}
                >
                  Source Code Analysis
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-5 space-y-4 font-sans">
                
                {activeTab === 'overview' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#0b132b] p-3.5 rounded-xl border border-[#457b9d]/30">
                        <span className="text-[10px] text-[#a8dadc] uppercase font-bold font-heading">Token Contract</span>
                        <p className="text-xs font-bold text-[#f1faee] mt-0.5">ElonMars ($ELON)</p>
                        <p className="text-[10px] text-[#a8dadc] mt-1">Solidity v0.8.19 • Verified AST</p>
                      </div>

                      <div className="bg-[#0b132b] p-3.5 rounded-xl border border-[#457b9d]/30">
                        <span className="text-[10px] text-[#a8dadc] uppercase font-bold font-heading">AI Threat Classifier</span>
                        <p className="text-xs font-bold text-[#e63946] mt-0.5">Honeypot Trap Detected</p>
                        <p className="text-[10px] text-[#a8dadc] mt-1">XGBoost ML Vector #53</p>
                      </div>
                    </div>

                    {/* SHAP Feature Contribution Matrix */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#f1faee] font-semibold font-heading">SHAP Feature Risk Attribution</span>
                        <span className="text-[10px] text-[#a8dadc]">TreeSHAP Engine</span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="p-2.5 bg-[#0b132b] rounded-lg border border-[#457b9d]/30 flex items-center justify-between">
                          <span className="text-[#f1faee] text-[11px]">has_honeypot_pattern</span>
                          <span className="text-[#e63946] font-bold text-[11px]">+60.0 Risk</span>
                        </div>
                        <div className="p-2.5 bg-[#0b132b] rounded-lg border border-[#457b9d]/30 flex items-center justify-between">
                          <span className="text-[#f1faee] text-[11px]">uncapped_sell_tax</span>
                          <span className="text-[#e63946] font-bold text-[11px]">+50.0 Risk</span>
                        </div>
                        <div className="p-2.5 bg-[#0b132b] rounded-lg border border-[#457b9d]/30 flex items-center justify-between">
                          <span className="text-[#f1faee] text-[11px]">has_renounce_ownership</span>
                          <span className="text-[#a8dadc] font-bold text-[11px]">-20.0 Safe</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'findings' && (
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-[#e63946]/10 border border-[#e63946]/40 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#e63946]">CRITICAL: DEX Sell Restricted</span>
                        <span className="text-[10px] px-2 py-0.5 bg-[#e63946] text-white rounded">SWC-128</span>
                      </div>
                      <p className="text-[#f1faee] text-[11px]">
                        Transfer function contains conditional lock requiring deployer whitelist to execute DEX sells.
                      </p>
                    </div>

                    <div className="p-3 bg-[#1d3557] border border-[#457b9d]/40 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#a8dadc]">HIGH: Dynamic Tax Override</span>
                        <span className="text-[10px] px-2 py-0.5 bg-[#457b9d] text-white rounded">TAX-OVERRIDE</span>
                      </div>
                      <p className="text-[#f1faee] text-[11px]">
                        Deployer retains privilege to raise sell tax up to 99% dynamically after token launch.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'source' && (
                  <div className="bg-[#0b132b] p-3 rounded-xl border border-[#457b9d]/30 text-[11px] text-[#f1faee] overflow-x-auto space-y-1">
                    <div className="text-[#a8dadc]">// Vulnerability snippet at Line 142 in ElonToken.sol</div>
                    <div><span className="text-[#a8dadc]">function</span> <span className="text-[#f1faee]">_transfer</span>(address sender, address recipient, uint256 amount) internal &#123;</div>
                    <div className="pl-4 text-[#e63946]">if (sender != owner() && !isWhitelisted[sender]) revert("Sell restricted");</div>
                    <div className="pl-4 text-[#f1faee]">uint256 tax = (amount * sellTaxFee) / 100;</div>
                    <div className="pl-4 text-[#f1faee]">super._transfer(sender, recipient, amount - tax);</div>
                    <div>&#125;</div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between text-xs text-[#a8dadc] border-t border-[#457b9d]/30">
                  <span>Audit Engine Speed: <strong>140 ms</strong></span>
                  <button
                    onClick={() => {
                      onSelectSampleContract('sample-honeypot');
                      onNavigate('result');
                    }}
                    className="text-[#a8dadc] hover:text-[#f1faee] font-semibold flex items-center gap-1 cursor-pointer font-heading"
                  >
                    View Report Details <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* CONTINUOUS MARQUEE INFINITE SLOW SIDE SCROLLING FOR TRUSTED COMPANIES */}
      <section className="space-y-3 text-center">
        <p className="text-xs font-heading font-extrabold text-[#a8dadc] uppercase tracking-widest pt-4">
          Trusted Ecosystems & Security Infrastructure Integrations
        </p>
        <PartnerMarquee />
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 border-b border-[#457b9d]/30 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-[#f1faee] tracking-tight font-heading">
            Enterprise Security Infrastructure
          </h2>
          <p className="text-sm text-[#a8dadc] font-sans">
            Designed for smart contract security auditors, institutional investors, and DeFi developers.
          </p>
        </div>

        {/* Feature 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-[#1c2541] text-[#a8dadc] border border-[#457b9d]/50 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-[#f1faee] font-heading">AI Risk Detection</h3>
            <p className="text-sm text-[#a8dadc] leading-relaxed font-sans">
              SentinelX evaluates 53 extracted AST variables using gradient-boosted decision trees trained across historical mainnet rug pulls and verified protocol contracts.
            </p>
            <ul className="space-y-2 text-xs text-[#f1faee] font-sans">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#a8dadc]" />
                <span>TreeSHAP explainability for every score</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#a8dadc]" />
                <span>96.15% model accuracy cross-validated</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 bg-[#1c2541] p-6 rounded-2xl border border-[#457b9d]/40 space-y-3 text-left">
            <div className="flex items-center justify-between text-xs font-heading">
              <span className="text-[#a8dadc]">ML Model Vector Benchmark</span>
              <span className="text-[#f1faee] font-bold">XGBoost v2.4</span>
            </div>
            <div className="p-3 bg-[#0b132b] rounded-xl border border-[#457b9d]/30 text-xs space-y-2 font-sans">
              <div className="flex justify-between">
                <span className="text-[#a8dadc]">Accuracy Score</span>
                <span className="text-[#f1faee] font-bold">96.15%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a8dadc]">Precision Score</span>
                <span className="text-[#f1faee] font-bold">99.57%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a8dadc]">AUC-ROC Score</span>
                <span className="text-[#a8dadc] font-bold">98.54%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 lg:order-2 space-y-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-[#1c2541] text-[#a8dadc] border border-[#457b9d]/50 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-[#f1faee] font-heading">Static Code Analysis</h3>
            <p className="text-sm text-[#a8dadc] leading-relaxed font-sans">
              Combines AST parsing with control flow graph inspection to detect uninitialized proxies, delegatecall traps, reentrancy vectors, and hidden owner backdoors.
            </p>
            <ul className="space-y-2 text-xs text-[#f1faee] font-sans">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#a8dadc]" />
                <span>SWC registry vulnerability mapping</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#a8dadc]" />
                <span>Full Solidity ^0.8.x compiler support</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 lg:order-1 bg-[#1c2541] p-6 rounded-2xl border border-[#457b9d]/40 text-left text-xs font-sans">
            <div className="text-[#a8dadc] mb-2 font-heading font-semibold">// Static AST Detector Log</div>
            <div className="p-3 bg-[#0b132b] rounded-xl border border-[#457b9d]/30 text-[#f1faee] space-y-1.5">
              <div className="text-[#e63946] font-bold">[!] AST Detector #22: UNPROTECTED_UPGRADE</div>
              <div className="text-[#a8dadc] text-[11px]">Proxy implementation upgradeable without multi-sig timelock.</div>
              <div className="text-[#a8dadc] text-[11px]">File: YieldVault.sol (Line 84)</div>
            </div>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-[#1c2541] text-[#a8dadc] border border-[#457b9d]/50 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-[#f1faee] font-heading">Transaction Simulation</h3>
            <p className="text-sm text-[#a8dadc] leading-relaxed font-sans">
              Simulates exact EVM transaction executions against mainnet forks before you send funds to verify buy tax, sell tax, and transfer restrictions.
            </p>
          </div>

          <div className="lg:col-span-6 bg-[#1c2541] p-6 rounded-2xl border border-[#457b9d]/40 text-left text-xs space-y-3 font-sans">
            <div className="flex items-center justify-between text-[#a8dadc]">
              <span>Mainnet EVM Fork Simulation</span>
              <span className="text-[#a8dadc] font-bold">VERIFIED (0.02s)</span>
            </div>
            <div className="p-3 bg-[#0b132b] rounded-xl border border-[#457b9d]/30 space-y-1">
              <div className="text-[#f1faee] font-bold">Simulated Swap: 1.0 ETH ➔ Token</div>
              <div className="text-[#a8dadc] text-[11px]">Slippage Tolerance: 0.5%</div>
              <div className="text-[#a8dadc] text-[11px]">Effective Tax: 0.00% Buy / 0.00% Sell</div>
            </div>
          </div>
        </div>

      </section>

      {/* DEVELOPER QUICK START */}
      <section className="py-20 border-b border-[#457b9d]/30 bg-[#0b132b]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-4 text-left">
              <span className="text-xs font-heading font-extrabold text-[#a8dadc] uppercase tracking-wider">
                Developer API & SDK
              </span>
              <h2 className="text-3xl font-extrabold text-[#f1faee] font-heading">
                Integrate Security Scans in Seconds.
              </h2>
              <p className="text-sm text-[#a8dadc] leading-relaxed">
                Automate smart contract risk checks inside your trading bots, DeFi protocols, CI/CD pipelines, or crypto wallets with our REST API and TypeScript SDK.
              </p>
              
              <div className="pt-2 flex flex-wrap gap-3 text-xs font-heading">
                <button
                  onClick={() => onNavigate('docs')}
                  className="px-5 py-2.5 rounded-xl bg-[#457b9d] text-white font-bold hover:bg-[#1d3557] cursor-pointer transition-colors"
                >
                  Read Documentation
                </button>
                <button
                  onClick={() => onNavigate('settings')}
                  className="px-5 py-2.5 rounded-xl bg-[#1c2541] text-[#f1faee] border border-[#457b9d]/40 hover:bg-[#15263f] cursor-pointer transition-colors"
                >
                  Get API Key
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#1c2541] rounded-2xl border border-[#457b9d]/40 p-5 text-left text-xs font-sans">
              <div className="flex items-center justify-between pb-3 border-b border-[#457b9d]/30 text-[#a8dadc]">
                <span className="font-heading font-semibold">TypeScript Quick Start</span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 hover:text-[#f1faee] cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-[#a8dadc]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy snippet'}</span>
                </button>
              </div>
              <pre className="py-4 text-[#f1faee] overflow-x-auto text-[11px] leading-relaxed">
{`npm install @sentinelx/sdk

import { SentinelX } from '@sentinelx/sdk';

const client = new SentinelX({ 
  apiKey: process.env.SENTINELX_API_KEY 
});

const report = await client.analyzeContract({
  address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  network: 'ethereum'
});

console.log(report.riskScore); // 94 (High Risk)`}
              </pre>
            </div>

          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="py-20 border-b border-[#457b9d]/30 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="space-y-3 max-w-xl mx-auto">
          <h2 className="text-3xl font-extrabold text-[#f1faee] font-heading">Predictable SaaS Pricing</h2>
          <p className="text-sm text-[#a8dadc]">Simple plans for individual traders, security auditors, and enterprise teams.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left font-sans">
          
          {/* Starter */}
          <div className="bg-[#1c2541] p-8 rounded-2xl border border-[#457b9d]/40 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-[#f1faee] font-heading">Starter</h3>
              <p className="text-xs text-[#a8dadc]">For retail traders and web3 security testing.</p>
              <div className="flex items-baseline gap-1 font-heading">
                <span className="text-3xl font-extrabold text-[#f1faee]">$0</span>
                <span className="text-xs text-[#a8dadc]">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[#f1faee] pt-4 border-t border-[#457b9d]/30">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#a8dadc]" /> 10 Free Scans / Month</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#a8dadc]" /> Basic Risk Score & AST</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#a8dadc]" /> Etherscan Multi-chain Explorer</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('auth')}
              className="w-full py-3 rounded-xl bg-[#0b132b] hover:bg-[#15263f] text-[#f1faee] border border-[#457b9d]/40 text-xs font-heading font-bold cursor-pointer transition-colors"
            >
              Get Started Free
            </button>
          </div>

          {/* Professional */}
          <div className="bg-[#1c2541] p-8 rounded-2xl border-2 border-[#e63946] flex flex-col justify-between space-y-6 relative shadow-xl">
            <div className="absolute -top-3 right-6 bg-[#e63946] text-white text-[10px] font-heading uppercase font-bold px-3 py-0.5 rounded-full">
              Most Popular
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-[#f1faee] font-heading">Professional</h3>
              <p className="text-xs text-[#a8dadc]">For active traders and security researchers.</p>
              <div className="flex items-baseline gap-1 font-heading">
                <span className="text-3xl font-extrabold text-[#f1faee]">$99</span>
                <span className="text-xs text-[#a8dadc]">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[#f1faee] pt-4 border-t border-[#457b9d]/30">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#a8dadc]" /> 1,000 Scans / Month</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#a8dadc]" /> SHAP Feature Risk Attribution</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#a8dadc]" /> REST API Access & SDK</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#a8dadc]" /> Real-time EVM Mainnet Simulation</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('auth')}
              className="w-full py-3 rounded-xl bg-[#e63946] hover:bg-[#d62828] text-white text-xs font-heading font-bold cursor-pointer transition-colors shadow-md"
            >
              Start 14-Day Free Trial
            </button>
          </div>

          {/* Enterprise */}
          <div className="bg-[#1c2541] p-8 rounded-2xl border border-[#457b9d]/40 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-[#f1faee] font-heading">Enterprise</h3>
              <p className="text-xs text-[#a8dadc]">For institutional funds, exchanges & protocols.</p>
              <div className="flex items-baseline gap-1 font-heading">
                <span className="text-3xl font-extrabold text-[#f1faee]">Custom</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[#f1faee] pt-4 border-t border-[#457b9d]/30">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#a8dadc]" /> Unlimited API Scans</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#a8dadc]" /> Custom ML Model Fine-Tuning</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#a8dadc]" /> Dedicated SLA & 24/7 Support</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('pricing')}
              className="w-full py-3 rounded-xl bg-[#0b132b] hover:bg-[#15263f] text-[#f1faee] border border-[#457b9d]/40 text-xs font-heading font-bold cursor-pointer transition-colors"
            >
              Contact Sales
            </button>
          </div>

        </div>
      </section>

      {/* FINAL BOTTOM CTA */}
      <section className="py-20 text-center max-w-4xl mx-auto px-4 space-y-6">
        <h2 className="text-3xl font-extrabold text-[#f1faee] tracking-tight font-heading">
          Analyze Smart Contracts with Confidence.
        </h2>
        <p className="text-sm text-[#a8dadc] max-w-lg mx-auto">
          Start identifying rug pulls and malicious smart contract mechanics today.
        </p>
        <div className="pt-2 flex justify-center font-heading">
          <button
            onClick={() => onNavigate('analyzer')}
            className="px-8 py-3.5 text-sm font-bold rounded-xl bg-[#e63946] hover:bg-[#d62828] text-white transition-all shadow-lg cursor-pointer flex items-center gap-2"
          >
            <span>Analyze Smart Contract Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
};
