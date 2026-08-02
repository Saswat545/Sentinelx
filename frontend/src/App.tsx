import React, { useState, useEffect } from 'react';
import { ApiKeyItem, NavigationPage, SmartContractReport, UserProfile } from './types';
import { INITIAL_USER, INITIAL_REPORTS, INITIAL_API_KEYS } from './data/mockDatabase';
import { SAMPLE_CONTRACTS } from './data/sampleContracts';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';

// Screens
import { LandingScreen } from './components/screens/LandingScreen';
import { AuthScreen } from './components/screens/AuthScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { AnalyzerScreen } from './components/screens/AnalyzerScreen';
import { ResultScreen } from './components/screens/ResultScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { PricingScreen } from './components/screens/PricingScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { DocsScreen } from './components/screens/DocsScreen';
import { ErrorPages } from './components/screens/ErrorPages';

export function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('landing');
  
  // Hydrate user session from localStorage or use default demo user
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('rugguard_user_session');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_USER; }
    }
    return INITIAL_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('rugguard_user_session');
    return saved !== null || true; // Initialized as true with default demo account
  });

  const [reports, setReports] = useState<SmartContractReport[]>(INITIAL_REPORTS);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(INITIAL_API_KEYS);
  
  // Currently selected report for result screen
  const [selectedReport, setSelectedReport] = useState<SmartContractReport>(INITIAL_REPORTS[0]);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>('sample-honeypot');

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setIsAuthenticated(true);
    localStorage.setItem('rugguard_user_session', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    localStorage.removeItem('rugguard_user_session');
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page: NavigationPage) => {
    // Route Protection: Protected routes requiring authentication
    const protectedPages: NavigationPage[] = ['dashboard', 'history', 'settings'];
    if (protectedPages.includes(page) && !isAuthenticated) {
      setCurrentPage('auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Redirect already authenticated users away from Auth page to Dashboard
    if (page === 'auth' && isAuthenticated) {
      setCurrentPage('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalysisComplete = (newReport: SmartContractReport) => {
    setReports((prev) => [newReport, ...prev]);
    setSelectedReport(newReport);
  };

  const handleDeleteReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
    );
  };

  const handleCreateApiKey = (name: string) => {
    const newKey: ApiKeyItem = {
      id: 'key_' + Math.random().toString(36).substring(2, 7),
      name,
      keyPrefix: 'rg_live_' + Math.random().toString(36).substring(2, 8) + '...',
      fullKey: 'rg_live_' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      createdAt: new Date().toISOString().substring(0, 10),
      lastUsedAt: 'Just now',
      requestsCount: 0,
      monthlyLimit: 10000,
      status: 'active',
    };
    setApiKeys((prev) => [newKey, ...prev]);
  };

  const handleRevokeApiKey = (id: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const activeUser = user || INITIAL_USER;

  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Navigation Top Header */}
      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
        user={activeUser}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />

      {/* Main View Screen Router */}
      <main className="flex-1">
        {currentPage === 'landing' && (
          <LandingScreen
            onNavigate={handleNavigate}
            onSelectSampleContract={(id) => {
              setSelectedSampleId(id);
              const sample = SAMPLE_CONTRACTS.find((s) => s.id === id);
              if (sample) {
                setSelectedReport(sample.sampleReport);
              }
            }}
          />
        )}

        {currentPage === 'auth' && (
          <AuthScreen
            onNavigate={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {currentPage === 'dashboard' && (
          <DashboardScreen
            onNavigate={handleNavigate}
            reports={reports}
            user={activeUser}
            onSelectReport={(r) => setSelectedReport(r)}
            onSelectSampleContract={(id) => setSelectedSampleId(id)}
          />
        )}

        {currentPage === 'analyzer' && (
          <AnalyzerScreen
            onNavigate={handleNavigate}
            onAnalysisComplete={handleAnalysisComplete}
            selectedSampleId={selectedSampleId}
          />
        )}

        {currentPage === 'result' && (
          <ResultScreen
            report={selectedReport}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'history' && (
          <HistoryScreen
            reports={reports}
            onNavigate={handleNavigate}
            onSelectReport={(r) => setSelectedReport(r)}
            onDeleteReport={handleDeleteReport}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentPage === 'pricing' && (
          <PricingScreen onNavigate={handleNavigate} />
        )}

        {currentPage === 'settings' && (
          <SettingsScreen
            user={activeUser}
            apiKeys={apiKeys}
            onUpdateUser={(updated) => {
              setUser(updated);
              localStorage.setItem('rugguard_user_session', JSON.stringify(updated));
            }}
            onCreateApiKey={handleCreateApiKey}
            onRevokeApiKey={handleRevokeApiKey}
            onLogout={handleLogout}
          />
        )}

        {currentPage === 'docs' && <DocsScreen />}

        {currentPage === '404' && <ErrorPages type="404" onNavigate={handleNavigate} />}
        {currentPage === '500' && <ErrorPages type="500" onNavigate={handleNavigate} />}
        {currentPage === 'maintenance' && <ErrorPages type="maintenance" onNavigate={handleNavigate} />}
        {currentPage === 'offline' && <ErrorPages type="offline" onNavigate={handleNavigate} />}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

    </div>
  );
}

export default App;
