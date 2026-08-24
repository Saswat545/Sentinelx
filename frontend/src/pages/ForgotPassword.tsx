import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/auth';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');

    if (!supabase) {
      setError('Supabase not configured. Please check your environment variables.');
      setLoading(false);
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel - dark */}
      <div className="hidden md:flex md:w-1/2 bg-[#0a0a0a] relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(109,0,26,0.15)_0%,_transparent_70%)]" />
        <div className="relative z-10 text-center px-12">
          <img src="/brand/dark/Stacked logo.png" alt="SentinelX" className="w-48 h-auto mx-auto mb-8 opacity-80" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <p className="text-white/30 text-sm leading-relaxed max-w-xs mx-auto">We'll send you a link to reset your password securely.</p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="md:hidden mb-8 inline-block">
            <img src="/brand/light/Horizontal logo.png" alt="SentinelX" className="h-7 w-auto" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {sent ? (
              <>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-display font-bold text-[#0a0a0a] mb-2">Check your email</h1>
                <p className="text-gray-500 text-sm mb-8">We sent a password reset link to <strong className="text-[#0a0a0a]">{email}</strong></p>
                <Link to="/login" className="inline-flex items-center gap-2 text-sm text-[#6D001A] hover:underline font-medium">Back to Sign In</Link>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-display font-bold text-[#0a0a0a] mb-2">Reset your password</h1>
                <p className="text-gray-500 text-sm mb-8">Enter your email address and we'll send you a link to reset your password.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0a0a] placeholder-gray-400 focus:outline-none focus:border-[#6D001A] focus:ring-1 focus:ring-[#6D001A]/20 transition-all duration-300" />
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <button type="submit" disabled={loading} className="w-full py-3 bg-[#6D001A] hover:bg-[#8B0023] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300">
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                  Remember your password? <Link to="/login" className="text-[#6D001A] hover:underline font-medium">Sign in</Link>
                </p>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
