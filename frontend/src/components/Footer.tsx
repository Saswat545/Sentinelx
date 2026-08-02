import React from 'react';
import { NavigationPage } from '../types';
import { SentinelLogo } from './ui/SentinelLogo';

interface FooterProps {
  onNavigate: (page: NavigationPage) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#0b132b] border-t border-[#457b9d]/30 text-[#a8dadc] text-xs font-sans">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10 text-left">
          
          <div className="md:col-span-2 space-y-4">
            <SentinelLogo variant="horizontal" size="md" />
            <p className="text-[#a8dadc] max-w-sm leading-relaxed text-xs">
              SentinelX is an AI-powered blockchain security platform that analyzes Ethereum smart contracts using machine learning, static code analysis, and risk detection before users interact with them.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-heading font-semibold bg-[#1c2541] text-[#f1faee] border border-[#457b9d]/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e63946] animate-pulse"></span>
                Security Engine Active
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-extrabold text-[#f1faee] mb-3 uppercase tracking-wider text-[11px]">Company</h4>
            <ul className="space-y-2 font-sans">
              <li>
                <button onClick={() => onNavigate('landing')} className="hover:text-[#f1faee] transition-colors cursor-pointer">
                  Product Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-[#f1faee] transition-colors cursor-pointer">
                  Pricing Plans
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('auth')} className="hover:text-[#f1faee] transition-colors cursor-pointer">
                  Get Started
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-extrabold text-[#f1faee] mb-3 uppercase tracking-wider text-[11px]">Documentation</h4>
            <ul className="space-y-2 font-sans">
              <li>
                <button onClick={() => onNavigate('docs')} className="hover:text-[#f1faee] transition-colors cursor-pointer">
                  Developer API Reference
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('docs')} className="hover:text-[#f1faee] transition-colors cursor-pointer">
                  TypeScript SDK
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('docs')} className="hover:text-[#f1faee] transition-colors cursor-pointer">
                  SHAP Risk Metrics
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-extrabold text-[#f1faee] mb-3 uppercase tracking-wider text-[11px]">Security & Legal</h4>
            <ul className="space-y-2 font-sans text-[#a8dadc]">
              <li><a href="#security" onClick={(e) => { e.preventDefault(); alert("Security audit reports available on request."); }} className="hover:text-[#f1faee] transition-colors">Security Overview</a></li>
              <li><a href="#privacy" onClick={(e) => { e.preventDefault(); alert("Privacy Policy: We do not store private keys or IP logs."); }} className="hover:text-[#f1faee] transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" onClick={(e) => { e.preventDefault(); alert("Terms of Service: SentinelX reports are automated risk scores."); }} className="hover:text-[#f1faee] transition-colors">Terms of Service</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-[#457b9d]/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#a8dadc]/80">
          <p>© {new Date().getFullYear()} SentinelX Security Platform. Built for Ethereum smart contract intelligence.</p>
          <div className="flex items-center gap-4 text-xs font-sans">
            <span>Status: <strong className="text-[#f1faee]">Operational</strong></span>
            <span>•</span>
            <span>V2.4 Model</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
