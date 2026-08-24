import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signInWithEmail, signInWithGoogle, signInWithGitHub, isConfigured } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');

    const { error: signInError } = await signInWithEmail(email, password);
    if (signInError) {
      setError(signInError);
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    if (!isConfigured) { setError('Supabase not configured'); return; }
    await signInWithGoogle();
  };

  const handleGitHubLogin = async () => {
    if (!isConfigured) { setError('Supabase not configured'); return; }
    await signInWithGitHub();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#E8EBF0]">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[960px] bg-white rounded-3xl overflow-hidden shadow-2xl shadow-black/10 flex flex-col md:flex-row min-h-[560px]"
      >
        {/* Left Panel - Dark with branding */}
        <div className="hidden md:flex md:w-[45%] relative bg-[#111111] overflow-hidden">
          <div className="absolute inset-0">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1a1a1a" />
                  <stop offset="100%" stopColor="#0a0a0a" />
                </linearGradient>
              </defs>
              <rect width="400" height="600" fill="url(#grad2)" />
              <polygon points="0,200 400,100 400,300 0,400" fill="#151515" opacity="0.6" />
              <polygon points="0,350 400,250 400,450 0,550" fill="#1a1a1a" opacity="0.4" />
              <polygon points="0,500 400,400 400,600 0,600" fill="#181818" opacity="0.3" />
            </svg>
          </div>
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
            <span className="block text-[140px] font-bold text-white/[0.03] leading-none tracking-tighter select-none -mb-10">sentinelx</span>
          </div>
          <div className="relative z-10 flex flex-col justify-between p-10 text-white">
            <div>
              <img src="/brand/dark/Horizontal logo.png" alt="SentinelX" className="h-8 w-auto brightness-0 invert" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3 leading-tight">AI-Powered Smart Contract<br />Security Analysis</h2>
              <p className="text-white/40 text-sm leading-relaxed">Detect rug pulls, honeypots, and vulnerabilities before you sign anything.</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 flex items-center justify-center px-8 py-10">
          <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <Link to="/" className="md:hidden mb-8 inline-block">
              <img src="/brand/light/Horizontal logo.png" alt="SentinelX" className="h-7 w-auto" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </Link>

            {/* Mobile header */}
            <div className="md:hidden mb-6">
              <span className="text-sm text-gray-500">Don't have an account?</span>
              <Link to="/signup" className="ml-2 px-4 py-1.5 text-sm font-semibold text-gray-800 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">Sign Up</Link>
            </div>

            {/* Desktop header */}
            <div className="hidden md:flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome back</h1>
                <p className="text-gray-500 text-sm">Sign in to your SentinelX account</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Don't have an account?</span>
                <Link to="/signup" className="px-5 py-2 text-sm font-semibold text-gray-800 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">Sign Up</Link>
              </div>
            </div>

            {/* Social login */}
            <div className="flex gap-3 mb-6">
              <button onClick={handleGoogleLogin} className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium text-gray-700">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button onClick={handleGitHubLogin} className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium text-gray-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                GitHub
              </button>
            </div>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#6D001A] focus:ring-2 focus:ring-[#6D001A]/20 transition-all text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#6D001A] focus:ring-2 focus:ring-[#6D001A]/20 transition-all text-sm pr-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#6D001A] focus:ring-[#6D001A]/20" />
                  <span className="text-sm text-gray-500">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-[#6D001A] hover:underline">Forgot password?</Link>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

              <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#111111] hover:bg-[#222222] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 text-sm">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
