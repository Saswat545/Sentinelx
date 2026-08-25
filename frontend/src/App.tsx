import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Auth
import { AuthProvider } from './lib/auth';

// Components
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';
import { LoadingScreen } from './components/LoadingScreen';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Analyze } from './pages/Analyze';
import { Results } from './pages/Results';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Contact } from './pages/Contact';
import { Pricing } from './pages/Pricing';
import { FAQ } from './pages/FAQ';
import { NotFound } from './pages/NotFound';
import { Cookies } from './pages/Cookies';
import { About } from './pages/About';
import { Security } from './pages/Security';
import { Disclaimer } from './pages/Disclaimer';
import { HowItWorks } from './pages/HowItWorks';
import { IncidentReports } from './pages/IncidentReports';
import { Insights } from './pages/Insights';
import { Docs } from './pages/Docs';
import { ForgotPassword } from './pages/ForgotPassword';
import { ComingSoon } from './pages/ComingSoon';

gsap.registerPlugin(ScrollTrigger);

const AUTH_PAGES = ['/login', '/signup'];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
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

function AppLayout({ children }: { children: React.ReactNode }) {
  // Dashboard/app layout — no marketing footer
  return (
    <div className="min-h-screen bg-white text-[#0a0a0a]">
      {children}
    </div>
  );
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => { lenis.destroy(); clearTimeout(timer); };
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
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
          <Route path="/how-it-works" element={<MainLayout><HowItWorks /></MainLayout>} />
          <Route path="/incident-reports" element={<MainLayout><IncidentReports /></MainLayout>} />
          <Route path="/insights" element={<MainLayout><Insights /></MainLayout>} />
          <Route path="/docs" element={<MainLayout><Docs /></MainLayout>} />
          <Route path="/privacy" element={<MainLayout><Privacy /></MainLayout>} />
          <Route path="/terms" element={<MainLayout><Terms /></MainLayout>} />
          <Route path="/cookies" element={<MainLayout><Cookies /></MainLayout>} />
          <Route path="/disclaimer" element={<MainLayout><Disclaimer /></MainLayout>} />

          {/* Coming Soon pages */}
          <Route path="/case-studies" element={<MainLayout><ComingSoon title="Case Studies" /></MainLayout>} />
          <Route path="/methodology" element={<MainLayout><ComingSoon title="Methodology" description="Our detailed risk scoring methodology is being documented. Learn how the XGBoost model classifies contracts and how SHAP explainability works." /></MainLayout>} />
          <Route path="/watchlist" element={<MainLayout><ProtectedRoute><ComingSoon title="Watchlist" description="Monitor your favorite tokens and get alerts when risk signals change." /></ProtectedRoute></MainLayout>} />
          <Route path="/alerts" element={<MainLayout><ProtectedRoute><ComingSoon title="Alerts" description="Real-time notifications for token risk changes, new vulnerabilities, and suspicious activity." /></ProtectedRoute></MainLayout>} />
          <Route path="/billing" element={<MainLayout><ProtectedRoute><ComingSoon title="Billing" description="Manage your subscription, view invoices, and upgrade your plan." /></ProtectedRoute></MainLayout>} />
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
          <Route path="/dashboard" element={
            <MainLayout>
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            </MainLayout>
          } />
          <Route path="/history" element={
            <MainLayout>
              <ProtectedRoute><History /></ProtectedRoute>
            </MainLayout>
          } />
          <Route path="/settings" element={
            <MainLayout>
              <ProtectedRoute><Settings /></ProtectedRoute>
            </MainLayout>
          } />

          <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
