import React, { useState } from 'react';
import { AuthMode, NavigationPage, UserProfile } from '../../types';
import { SentinelLogo } from '../ui/SentinelLogo';
import { SentinelAnimation } from '../ui/SentinelAnimation';
import { ArrowLeft, Mail, Lock, User, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';

interface AuthScreenProps {
  onNavigate: (page: NavigationPage) => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onNavigate,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('analyst@sentinelx.io');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Security Lead');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid work email address.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      if (mode === 'forgot-password') {
        setSuccessMessage(`Password recovery link sent to ${email}. Check your inbox.`);
      } else {
        const activeUser: UserProfile = {
          id: 'usr_' + Math.random().toString(36).substring(2, 8),
          name: name || 'Security Analyst',
          email: email || 'analyst@sentinelx.io',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          role: mode === 'signup' ? 'Security Researcher' : 'Blockchain Security Lead',
          company: 'SentinelX Security Workspace',
          plan: 'Pro',
          analysesUsed: 12,
          analysesLimit: 1000,
          apiKeyCount: 1,
        };
        onLoginSuccess(activeUser);
        onNavigate('dashboard');
      }
    }, 450);
  };

  const handleSsoLogin = (provider: 'Google' | 'Microsoft') => {
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      const ssoUser: UserProfile = {
        id: `usr_${provider.toLowerCase()}_` + Math.random().toString(36).substring(2, 7),
        name: `Security Analyst (${provider} SSO)`,
        email: 'analyst@sentinelx.io',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'Blockchain Security Lead',
        company: 'SentinelX Security Workspace',
        plan: 'Enterprise',
        analysesUsed: 42,
        analysesLimit: 10000,
        apiKeyCount: 3,
      };
      onLoginSuccess(ssoUser);
      onNavigate('dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#0b132b] flex items-center justify-center p-4 sm:p-6 lg:p-12 font-sans">
      <div className="max-w-[1140px] w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side: Weav-inspired Minimal Login Card */}
        <div className="bg-[#1c2541] border border-[#457b9d]/40 rounded-2xl p-8 sm:p-10 shadow-2xl space-y-6">
          
          {/* Card Header */}
          <div className="space-y-2 text-left">
            <div className="mb-4">
              <SentinelLogo variant="horizontal" size="md" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#f1faee] tracking-tight font-heading">
              {mode === 'login' && 'Welcome to SentinelX'}
              {mode === 'signup' && 'Create Your SentinelX Account'}
              {mode === 'forgot-password' && 'Reset Account Password'}
            </h1>
            <p className="text-xs text-[#a8dadc]">
              {mode === 'login' && 'Sign in to access AI-powered smart contract security intelligence.'}
              {mode === 'signup' && 'Start analyzing Ethereum smart contracts with machine learning.'}
              {mode === 'forgot-password' && 'Enter your work email to receive password reset instructions.'}
            </p>
          </div>

          {/* Alert Messages */}
          {errorMessage && (
            <div className="p-3 bg-[#e63946]/20 border border-[#e63946] text-[#e63946] rounded-xl text-xs flex items-center gap-2 font-sans font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500 text-emerald-400 rounded-xl text-xs flex items-center gap-2 font-sans font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Social SSO Buttons */}
          {mode !== 'forgot-password' && (
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleSsoLogin('Google')}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-[#0b132b] hover:bg-[#15263f] border border-[#457b9d]/40 rounded-xl text-xs font-heading font-semibold text-[#f1faee] transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSsoLogin('Microsoft')}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-[#0b132b] hover:bg-[#15263f] border border-[#457b9d]/40 rounded-xl text-xs font-heading font-semibold text-[#f1faee] transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H12z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                <span>Continue with Microsoft</span>
              </button>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#457b9d]/30"></div>
                </div>
                <div className="relative flex justify-center text-[11px] font-sans">
                  <span className="px-3 bg-[#1c2541] text-[#a8dadc]">or</span>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-sans text-[#a8dadc] mb-1.5 font-medium">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#457b9d] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Security Lead"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0b132b] border border-[#457b9d]/40 rounded-xl text-xs text-[#f1faee] placeholder-[#457b9d] focus:outline-none focus:border-[#a8dadc] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-sans text-[#a8dadc] mb-1.5 font-medium">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#457b9d] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@sentinelx.io"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0b132b] border border-[#457b9d]/40 rounded-xl text-xs text-[#f1faee] placeholder-[#457b9d] focus:outline-none focus:border-[#a8dadc] transition-colors"
                />
              </div>
            </div>

            {mode !== 'forgot-password' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-sans text-[#a8dadc] font-medium">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot-password');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[11px] text-[#a8dadc] hover:text-[#f1faee] font-sans cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-[#457b9d] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0b132b] border border-[#457b9d]/40 rounded-xl text-xs text-[#f1faee] placeholder-[#457b9d] focus:outline-none focus:border-[#a8dadc] transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#e63946] hover:bg-[#d62828] text-white font-heading font-bold rounded-xl text-xs transition-colors shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>
                  {mode === 'login' && 'Continue'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot-password' && 'Send Reset Link'}
                </span>
              )}
            </button>
          </form>

          {/* Footer Action Links */}
          <div className="pt-2 flex flex-col items-center gap-2 text-xs font-sans text-[#a8dadc]">
            {mode === 'forgot-password' ? (
              <button
                onClick={() => setMode('login')}
                className="inline-flex items-center gap-1.5 text-[#a8dadc] hover:text-[#f1faee] cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            ) : mode === 'login' ? (
              <div className="flex items-center gap-4 text-[11px]">
                <button
                  onClick={() => setMode('signup')}
                  className="text-[#a8dadc] hover:text-[#f1faee] font-semibold cursor-pointer"
                >
                  Register new account
                </button>
                <span>•</span>
                <a href="mailto:security@sentinelx.io" className="text-[#a8dadc] hover:text-[#f1faee] cursor-pointer inline-flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" /> Need help?
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-4 text-[11px]">
                <span>Already registered?</span>
                <button
                  onClick={() => setMode('login')}
                  className="text-[#a8dadc] hover:text-[#f1faee] font-semibold cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Animated SentinelX Geometric Visualization */}
        <div className="hidden lg:block">
          <SentinelAnimation />
        </div>

      </div>
    </div>
  );
};
