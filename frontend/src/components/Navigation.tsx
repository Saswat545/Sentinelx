import React, { useState } from 'react';
import { NavigationPage, UserProfile } from '../types';
import { ChevronDown, Menu, X, LogOut } from 'lucide-react';
import { SentinelLogo } from './ui/SentinelLogo';

interface NavigationProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  user: UserProfile | null;
  isAuthenticated: boolean;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
  user,
  isAuthenticated,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0b132b]/95 backdrop-blur-md border-b border-[#457b9d]/30 font-sans transition-colors">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-10">
          <button 
            onClick={() => onNavigate('landing')}
            className="hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-2.5 text-left focus:outline-none"
          >
            <SentinelLogo variant="horizontal" size="md" />
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 font-heading">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currentPage === 'landing'
                  ? 'text-[#f1faee] bg-[#1d3557] border border-[#457b9d]/50'
                  : 'text-[#a8dadc] hover:text-[#f1faee] hover:bg-[#1c2541]'
              }`}
            >
              Product
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currentPage === 'dashboard'
                  ? 'text-[#f1faee] bg-[#1d3557] border border-[#457b9d]/50'
                  : 'text-[#a8dadc] hover:text-[#f1faee] hover:bg-[#1c2541]'
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => onNavigate('analyzer')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currentPage === 'analyzer' || currentPage === 'result'
                  ? 'text-[#f1faee] bg-[#457b9d] border border-[#a8dadc]/40'
                  : 'text-[#a8dadc] hover:text-[#f1faee] hover:bg-[#1c2541]'
              }`}
            >
              Scanner
            </button>

            <button
              onClick={() => onNavigate('pricing')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currentPage === 'pricing'
                  ? 'text-[#f1faee] bg-[#1d3557] border border-[#457b9d]/50'
                  : 'text-[#a8dadc] hover:text-[#f1faee] hover:bg-[#1c2541]'
              }`}
            >
              Pricing
            </button>

            <button
              onClick={() => onNavigate('docs')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currentPage === 'docs'
                  ? 'text-[#f1faee] bg-[#1d3557] border border-[#457b9d]/50'
                  : 'text-[#a8dadc] hover:text-[#f1faee] hover:bg-[#1c2541]'
              }`}
            >
              Documentation
            </button>
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('analyzer')}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-heading font-bold rounded-xl bg-[#e63946] hover:bg-[#d62828] text-white transition-colors cursor-pointer shadow-md"
              >
                <span>New Contract Scan</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-[#1c2541] transition-colors border border-[#457b9d]/40 cursor-pointer"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-[#a8dadc]/40"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-[#a8dadc] mr-1 hidden sm:block" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#1c2541] rounded-2xl shadow-2xl border border-[#457b9d]/50 py-2 z-50 text-left">
                    <div className="px-4 py-3 border-b border-[#457b9d]/30">
                      <p className="text-xs font-heading font-bold text-[#f1faee] truncate">{user.name}</p>
                      <p className="text-[11px] text-[#a8dadc] truncate">{user.email}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1d3557] text-[#a8dadc] border border-[#457b9d]/60">
                          {user.plan} Plan
                        </span>
                        <span className="text-[10px] text-[#a8dadc] font-number">
                          {user.analysesUsed} / {user.analysesLimit} Scans
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => { onNavigate('dashboard'); setProfileDropdownOpen(false); }}
                        className="w-full px-4 py-2 text-xs text-[#f1faee] hover:bg-[#1d3557] text-left cursor-pointer font-sans"
                      >
                        Dashboard Console
                      </button>
                      <button
                        onClick={() => { onNavigate('history'); setProfileDropdownOpen(false); }}
                        className="w-full px-4 py-2 text-xs text-[#f1faee] hover:bg-[#1d3557] text-left cursor-pointer font-sans"
                      >
                        Scan History
                      </button>
                      <button
                        onClick={() => { onNavigate('settings'); setProfileDropdownOpen(false); }}
                        className="w-full px-4 py-2 text-xs text-[#f1faee] hover:bg-[#1d3557] text-left cursor-pointer font-sans"
                      >
                        API Keys & Settings
                      </button>
                    </div>

                    <div className="border-t border-[#457b9d]/30 pt-1">
                      <button
                        onClick={() => { setProfileDropdownOpen(false); onLogout(); }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#e63946] hover:bg-[#e63946]/10 text-left font-semibold cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onNavigate('auth')}
                className="px-3.5 py-1.5 text-xs font-heading font-semibold text-[#a8dadc] hover:text-[#f1faee] transition-colors cursor-pointer"
              >
                Sign In
              </button>
              
              <button
                onClick={() => onNavigate('auth')}
                className="px-4 py-2 text-xs font-heading font-bold rounded-xl bg-[#e63946] hover:bg-[#d62828] text-white transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <span>Get Started Free</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#a8dadc] hover:bg-[#1c2541] rounded-lg cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#457b9d]/30 bg-[#0b132b] px-4 py-3 space-y-1 font-heading">
          <button
            onClick={() => { onNavigate('landing'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-[#f1faee] hover:bg-[#1c2541]"
          >
            Product Overview
          </button>
          <button
            onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-[#f1faee] hover:bg-[#1c2541]"
          >
            Dashboard Console
          </button>
          <button
            onClick={() => { onNavigate('analyzer'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-[#f1faee] hover:bg-[#1c2541]"
          >
            Smart Contract Scanner
          </button>
          <button
            onClick={() => { onNavigate('pricing'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-[#f1faee] hover:bg-[#1c2541]"
          >
            Pricing
          </button>
          <button
            onClick={() => { onNavigate('docs'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-[#f1faee] hover:bg-[#1c2541]"
          >
            Documentation
          </button>

          {!isAuthenticated && (
            <div className="pt-2 border-t border-[#457b9d]/30">
              <button
                onClick={() => { onNavigate('auth'); setMobileMenuOpen(false); }}
                className="w-full py-2 text-xs font-bold rounded-xl bg-[#e63946] text-white text-center"
              >
                Get Started Free
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
