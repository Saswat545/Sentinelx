import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase, useAuth } from '../lib/auth';

/**
 * Landing page for the password-reset link emailed by ForgotPassword.
 * Supabase stores the recovery session from the URL, then this form
 * calls updateUser({ password }) to set the new password.
 */
export function ResetPassword() {
  const { session, loading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!supabase) {
      setError('Supabase not configured. Please check your environment variables.');
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setDone(true);
    }
  };

  const linkMissing = !loading && !session && !done;

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel - dark */}
      <div className="hidden md:flex md:w-1/2 bg-[#0a0a0a] relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(1, 73, 253,0.15)_0%,_transparent_70%)]" />
        <div className="relative z-10 text-center px-12">
          <img
            src="/brand/dark/Stacked logo.png"
            alt="SentinelX"
            className="w-48 h-auto mx-auto mb-8 opacity-80"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <p className="text-white/30 text-sm leading-relaxed max-w-xs mx-auto">
            Choose a strong password you haven't used on this account before.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="md:hidden mb-8 inline-block">
            <img
              src="/brand/light/Horizontal logo.png"
              alt="SentinelX"
              className="h-7 w-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-2xl font-bold text-[#0a0a0a] mb-2">
              Set a new password
            </h1>
            <p className="text-sm text-gray-500 mb-8">
              This replaces the password on your SentinelX account.
            </p>

            {done ? (
              <>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  Your password has been updated. You can sign in with it now.
                </p>
                <Link
                  to="/login"
                  className="block w-full py-3.5 bg-[#111111] hover:bg-[#222222] text-white font-semibold rounded-xl transition-colors text-sm text-center"
                >
                  Continue to sign in
                </Link>
              </>
            ) : linkMissing ? (
              <>
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  This reset link is missing, expired, or has already been used.
                  Request a fresh one and open it within an hour.
                </p>
                <Link
                  to="/forgot-password"
                  className="block w-full py-3.5 bg-[#111111] hover:bg-[#222222] text-white font-semibold rounded-xl transition-colors text-sm text-center"
                >
                  Request a new link
                </Link>
              </>
            ) : loading ? (
              <p className="text-sm text-gray-400">Verifying reset link…</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="new-password" className="block text-xs font-semibold text-gray-500 mb-1.5">
                    New password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0149FD] focus:ring-2 focus:ring-[#0149FD]/20 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-xs font-semibold text-gray-500 mb-1.5">
                    Confirm password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat the new password"
                    required
                    minLength={8}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0149FD] focus:ring-2 focus:ring-[#0149FD]/20 transition-colors text-sm"
                  />
                </div>

                {error && (
                  <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#111111] hover:bg-[#222222] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  {submitting ? 'Saving…' : 'Set new password'}
                </button>
              </form>
            )}

            <p className="text-xs text-gray-400 text-center mt-6">
              Remembered it?{' '}
              <Link to="/login" className="text-[#0149FD] hover:underline font-medium">
                Back to sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}