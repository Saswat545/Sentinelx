import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Auth
import { AuthProvider } from './lib/auth';
import { PAGE_SEO } from './lib/seo';

// Components
import { Navigation } from './components/Navigation';
import { AppShell } from './components/app/AppShell';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';
import { LoadingScreen } from './components/LoadingScreen';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages — Home stays eager (landing route); everything else code-splits on demand
import { Home } from './pages/Home';
import { ComingSoon } from './pages/ComingSoon';

const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Signup = lazy(() => import('./pages/Signup').then((m) => ({ default: m.Signup })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Analyze = lazy(() => import('./pages/Analyze').then((m) => ({ default: m.Analyze })));
const Results = lazy(() => import('./pages/Results').then((m) => ({ default: m.Results })));
const History = lazy(() => import('./pages/History').then((m) => ({ default: m.History })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));
const Privacy = lazy(() => import('./pages/Privacy').then((m) => ({ default: m.Privacy })));
const Terms = lazy(() => import('./pages/Terms').then((m) => ({ default: m.Terms })));
const Contact = lazy(() => import('./pages/Contact').then((m) => ({ default: m.Contact })));
const Pricing = lazy(() => import('./pages/Pricing').then((m) => ({ default: m.Pricing })));
const FAQ = lazy(() => import('./pages/FAQ').then((m) => ({ default: m.FAQ })));
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));
const Cookies = lazy(() => import('./pages/Cookies').then((m) => ({ default: m.Cookies })));
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })));
const Security = lazy(() => import('./pages/Security').then((m) => ({ default: m.Security })));
const Disclaimer = lazy(() => import('./pages/Disclaimer').then((m) => ({ default: m.Disclaimer })));
const HowItWorks = lazy(() => import('./pages/HowItWorks').then((m) => ({ default: m.HowItWorks })));
const IncidentReports = lazy(() => import('./pages/IncidentReports').then((m) => ({ default: m.IncidentReports })));
const Insights = lazy(() => import('./pages/Insights').then((m) => ({ default: m.Insights })));
const Docs = lazy(() => import('./pages/Docs').then((m) => ({ default: m.Docs })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then((m) => ({ default: m.ForgotPassword })));
const Billing = lazy(() => import('./pages/Billing').then((m) => ({ default: m.Billing })));
const Watchlist = lazy(() => import('./pages/Watchlist').then((m) => ({ default: m.Watchlist })));
const Features = lazy(() => import('./pages/Features').then((m) => ({ default: m.Features })));
const Methodology = lazy(() => import('./pages/Methodology').then((m) => ({ default: m.Methodology })));
const CaseStudies = lazy(() => import('./pages/CaseStudies').then((m) => ({ default: m.CaseStudies })));

gsap.registerPlugin(ScrollTrigger);

const AUTH_PAGES = ['/login', '/signup'];

/* Tab titles for SPA navigation — full page loads get theirs from the
   prerendered HTML, but client-side route changes must update too. */
const ROUTE_TITLES: Record<string, string> = {
  '/': PAGE_SEO.home.title,
  '/scan': PAGE_SEO.scan.title,
  '/features': PAGE_SEO.features.title,
  '/pricing': PAGE_SEO.pricing.title,
  '/security': PAGE_SEO.security.title,
  '/about': PAGE_SEO.about.title,
  '/faq': PAGE_SEO.faq.title,
  '/contact': PAGE_SEO.contact.title,
  '/privacy': PAGE_SEO.privacy.title,
  '/terms': PAGE_SEO.terms.title,
  '/disclaimer': PAGE_SEO.disclaimer.title,
  '/cookies': PAGE_SEO.cookies.title,
  '/how-it-works': PAGE_SEO.how_it_works.title,
  '/incident-reports': PAGE_SEO.incident_reports.title,
  '/insights': PAGE_SEO.insights.title,
  '/docs': PAGE_SEO.docs.title,
  '/methodology': 'How SentinelX Works | Security Methodology & ML Pipeline',
  '/case-studies': 'Case Studies | Real Smart Contract Security Analysis Examples',
  '/security/report': 'Vulnerability Reports | SentinelX',
  '/login': 'Log In | SentinelX',
  '/signup': 'Create Account | SentinelX',
  '/forgot-password': 'Reset Password | SentinelX',
  '/analyze': 'Analyze Contract | SentinelX',
  '/results': 'Analysis Results | SentinelX',
  '/dashboard': 'Dashboard | SentinelX',
  '/history': 'Scan History | SentinelX',
  '/watchlist': 'Watchlist | SentinelX',
  '/billing': 'Billing | SentinelX',
  '/alerts': 'Alerts | SentinelX',
  '/settings': 'Settings | SentinelX',
};

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => {
    document.title = ROUTE_TITLES[pathname] ?? 'Page Not Found | SentinelX';
  }, [pathname]);
  return null;
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-[#0a0a0a] flex flex-col">
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieBanner />
    </div>
  );
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = reduceMotion
      ? null
      : new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });

    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    }
    gsap.ticker.lagSmoothing(0);

    // First visit in a session plays the full brand splash; later loads skip the wait
    const seen = sessionStorage.getItem('sentinelx_splash_seen');
    const delay = seen ? 0 : 1900;
    const timer = setTimeout(() => {
      sessionStorage.setItem('sentinelx_splash_seen', '1');
      setIsLoading(false);
    }, delay);
    return () => { lenis?.destroy(); clearTimeout(timer); };
  }, []);

  if (isLoading) return <MotionConfig reducedMotion="user"><LoadingScreen /></MotionConfig>;

  return (
    <MotionConfig reducedMotion="user">
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Suspense
          fallback={
            <div className="min-h-screen bg-white flex items-center justify-center" role="status" aria-label="Loading page">
              <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#6D001A] animate-spin" />
            </div>
          }
        >
          <Routes>
          {/* Auth pages — no nav/footer */}
          <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
          <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
          <Route path="/signup" element={<AuthLayout><Signup /></AuthLayout>} />

          {/* Public marketing pages */}
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/pricing" element={<MainLayout><Pricing /></MainLayout>} />
          <Route path="/faq" element={<MainLayout><FAQ /></MainLayout>} />
          <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
          <Route path="/about" element={<MainLayout><About /></MainLayout>} />
          <Route path="/security" element={<MainLayout><Security /></MainLayout>} />
          <Route path="/features" element={<MainLayout><Features /></MainLayout>} />
          <Route path="/how-it-works" element={<MainLayout><HowItWorks /></MainLayout>} />
          <Route path="/incident-reports" element={<MainLayout><IncidentReports /></MainLayout>} />
          <Route path="/insights" element={<MainLayout><Insights /></MainLayout>} />
          <Route path="/docs" element={<MainLayout><Docs /></MainLayout>} />
          <Route path="/privacy" element={<MainLayout><Privacy /></MainLayout>} />
          <Route path="/terms" element={<MainLayout><Terms /></MainLayout>} />
          <Route path="/cookies" element={<MainLayout><Cookies /></MainLayout>} />
          <Route path="/disclaimer" element={<MainLayout><Disclaimer /></MainLayout>} />

          {/* Full content pages */}
          <Route path="/case-studies" element={<MainLayout><CaseStudies /></MainLayout>} />
          <Route path="/methodology" element={<MainLayout><Methodology /></MainLayout>} />
          <Route path="/security/report" element={<MainLayout><ComingSoon title="Vulnerability Reports" description="Report a security vulnerability responsibly. Our security team reviews all submissions." /></MainLayout>} />

          {/* Scanner — public free scan, but deeper features need auth */}
          <Route path="/scan" element={<MainLayout><Analyze /></MainLayout>} />

          {/* Protected app pages — require login */}
          <Route path="/analyze" element={
            <MainLayout>
              <ProtectedRoute><Analyze /></ProtectedRoute>
            </MainLayout>
          } />
          <Route path="/results" element={
            <MainLayout>
              <ProtectedRoute><Results /></ProtectedRoute>
            </MainLayout>
          } />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppShell><Dashboard /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <AppShell><History /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <AppShell><Watchlist /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <AppShell><Billing /></AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <AppShell>
                  <ComingSoon
                    title="Alerts"
                    description="Automated risk-change alerts are being built. Add contracts to your watchlist in the meantime."
                  />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppShell><Settings /></AppShell>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
    </MotionConfig>
  );
}

export default App;
