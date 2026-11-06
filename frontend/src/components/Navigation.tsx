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
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white/85 backdrop-blur-md">
        <div
          className={`mx-auto flex w-full max-w-6xl items-center justify-between px-6 transition-[height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            scrolled ? 'h-14' : 'h-16'
          }`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="SentinelX Home">
            <img
              src="/brand/dark/Icon mark.png"
              alt=""
              width="28"
              height="28"
              className="w-7 h-7 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span className="text-[#0a0a0a] font-display font-semibold text-sm tracking-tight hidden sm:block">
              Sentinel<span className="text-[#0149FD]">X</span>
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
                <button className="flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
                  {item.label}
                  <svg className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.99 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      style={{ transformOrigin: 'top center' }}
                      className="absolute top-full left-1/2 mt-2 w-56 -translate-x-1/2 rounded-lg border border-gray-200 bg-white py-1.5 shadow-[0_8px_24px_rgba(15,18,22,0.08)]"
                    >
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.label}
                          to={subItem.href}
                          className="mx-1 block rounded-md px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
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
                <Link to="/dashboard" className="hidden rounded-md px-3 py-2 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 sm:block">
                  Dashboard
                </Link>
                <button onClick={() => signOut()} className="rounded-md px-3 py-2 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" className="hidden rounded-md px-3 py-2 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 sm:block">
                Log in
              </Link>
            )}
            <Link
              to="/scan"
              className="inline-flex h-9 items-center rounded-lg bg-[#0149FD] px-4 text-[13px] font-semibold text-white hover:bg-[#0033CC]"
            >
              Scan a contract
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 lg:hidden"
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
            className="fixed inset-x-0 top-16 z-40 border-b border-gray-200 bg-white lg:hidden"
          >
            <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="space-y-1 px-6 py-5">
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
                      <Link to="/signup" className="block w-full py-3 text-center text-sm text-white font-semibold bg-[#0149FD] hover:bg-[#0033CC] rounded-xl transition-all">
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
