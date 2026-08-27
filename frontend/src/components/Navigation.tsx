import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, signOut, isConfigured } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const navItems = [
    {
      label: 'Product',
      items: [
        { label: 'Token Scanner', href: '/scan' },
        { label: 'Features', href: '/features' },
        { label: 'How It Works', href: '/how-it-works' },
        { label: 'Pricing', href: '/pricing' },
      ],
    },
    {
      label: 'Intelligence',
      items: [
        { label: 'Incident Reports', href: '/incident-reports' },
        { label: 'Case Studies', href: '/case-studies' },
        { label: 'Security Insights', href: '/insights' },
        { label: 'Methodology', href: '/methodology' },
      ],
    },
    {
      label: 'Resources',
      items: [
        { label: 'Documentation', href: '/docs' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Security', href: '/security' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
        <div
          className={`flex items-center justify-between w-full max-w-5xl px-5 py-2.5 transition-all duration-500 ${
            scrolled
              ? 'bg-white/85 backdrop-blur-2xl border border-gray-200/80 shadow-lg shadow-black/5'
              : 'bg-white/50 backdrop-blur-xl border border-white/10'
          } rounded-full`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="SentinelX Home">
            <img
              src="/brand/dark/Icon mark.png"
              alt="SentinelX"
              className="w-7 h-7 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span className="text-[#0a0a0a] font-display font-semibold text-sm tracking-tight hidden sm:block">
              Sentinel<span className="text-[#6D001A]">X</span>
            </span>
          </Link>

          {/* Desktop Nav - Pill items */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1 px-4 py-2 text-[13px] text-gray-500 hover:text-[#0a0a0a] font-medium transition-colors rounded-full hover:bg-gray-100/80">
                  {item.label}
                  <svg className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 py-1.5 bg-white/95 backdrop-blur-2xl border border-gray-200/80 rounded-2xl shadow-xl shadow-black/8"
                    >
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.label}
                          to={subItem.href}
                          className="block px-4 py-2.5 text-sm text-gray-500 hover:text-[#0a0a0a] hover:bg-gray-50 transition-colors mx-1 rounded-xl"
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user && isConfigured ? (
              <>
                <Link to="/dashboard" className="hidden sm:block px-4 py-2 text-[13px] text-gray-500 hover:text-[#0a0a0a] font-medium transition-colors rounded-full hover:bg-gray-100/80">
                  Dashboard
                </Link>
                <button onClick={() => signOut()} className="px-4 py-2 text-[13px] text-gray-500 hover:text-[#0a0a0a] font-medium transition-colors rounded-full hover:bg-gray-100/80">
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" className="hidden sm:block px-4 py-2 text-[13px] text-gray-500 hover:text-[#0a0a0a] font-medium transition-colors rounded-full hover:bg-gray-100/80">
                Log In
              </Link>
            )}
            <Link
              to="/scan"
              className="px-5 py-2 bg-[#6D001A] hover:bg-[#8B0023] text-white text-[13px] font-semibold rounded-full transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-[#6D001A]/20"
            >
              Scan a Token
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#0a0a0a] transition-colors rounded-full hover:bg-gray-100/80"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-20 z-50 lg:hidden px-4"
          >
            <div className="bg-white/95 backdrop-blur-2xl border border-gray-200/80 rounded-3xl shadow-xl shadow-black/10 overflow-hidden">
              <div className="p-6 space-y-1">
                {navItems.map((item) => (
                  <div key={item.label}>
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                      className="w-full flex items-center justify-between py-3 text-gray-600 hover:text-[#0a0a0a] transition-colors"
                    >
                      <span className="text-sm font-medium">{item.label}</span>
                      <svg className={`w-4 h-4 transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {activeDropdown === item.label && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="pl-4 pb-2 space-y-1">
                            {item.items.map((subItem) => (
                              <Link key={subItem.label} to={subItem.href} className="block py-2 text-sm text-gray-400 hover:text-[#0a0a0a] transition-colors">
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  {user && isConfigured ? (
                    <>
                      <Link to="/dashboard" className="block w-full py-3 text-center text-sm text-gray-600 hover:text-[#0a0a0a] rounded-xl hover:bg-gray-50 transition-all">
                        Dashboard
                      </Link>
                      <button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="block w-full py-3 text-center text-sm text-gray-600 hover:text-[#0a0a0a] rounded-xl hover:bg-gray-50 transition-all">
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="block w-full py-3 text-center text-sm text-gray-600 hover:text-[#0a0a0a] rounded-xl hover:bg-gray-50 transition-all">
                        Sign In
                      </Link>
                      <Link to="/signup" className="block w-full py-3 text-center text-sm text-white font-semibold bg-[#6D001A] hover:bg-[#8B0023] rounded-xl transition-all">
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
