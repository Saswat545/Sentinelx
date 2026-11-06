import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../lib/auth';

const fieldClass =
  'w-full h-11 px-3.5 bg-white border border-gray-300 rounded-lg text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0149FD] focus:ring-4 focus:ring-[#0149FD]/10 transition-colors';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const {
    signInWithEmail,
    signInWithGoogle,
    signInWithGitHub,
    isConfigured,
    serviceStatus,
    checkService,
  } = useAuth();
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

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError('');
    const { error: oauthError } =
      provider === 'google' ? await signInWithGoogle() : await signInWithGitHub();
    if (oauthError) setError(oauthError);
  };

  const offline = isConfigured && serviceStatus === 'offline';

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[1fr_1.05fr]">
      {/* Brand panel */}
      <aside className="hidden lg:flex flex-col justify-between bg-[#111827] p-12 xl:p-16 text-white">
        <Link to="/" aria-label="SentinelX home" className="inline-flex items-center gap-2.5">
          <img
            src="/brand/dark/Icon mark.png"
            alt=""
            className="h-7 w-7 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span className="text-[15px] font-semibold tracking-tight text-white">
            Sentinel<span className="text-[#7DA2FF]">X</span>
          </span>
        </Link>

        <div className="max-w-md">
          <h2 className="text-3xl font-semibold leading-tight mb-4">
            Smart contract security intelligence
          </h2>
          <p className="text-gray-400 leading-relaxed mb-10">
            SentinelX scores Ethereum contracts for rug pull risk and shows the signals behind each
            score, so you can decide before you connect a wallet.
          </p>
          <dl className="space-y-4 border-t border-white/10 pt-8">
            {[
              { value: '53', label: 'signals extracted per contract' },
              { value: '96.15%', label: 'model accuracy on the labelled test set' },
              { value: 'SHAP', label: 'explanation for every risk score' },
            ].map((item) => (
              <div key={item.label} className="flex items-baseline gap-3">
                <dt className="font-mono text-sm text-white w-16 shrink-0">{item.value}</dt>
                <dd className="text-sm text-gray-400">{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
          Automated analysis for research. Not financial advice, and a low score is not a guarantee
          of safety.
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex min-h-screen flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-[400px] mx-auto">
          <Link to="/" className="lg:hidden inline-block mb-10" aria-label="SentinelX home">
            <img
              src="/brand/light/Horizontal logo.png"
              alt="SentinelX"
              className="h-8 w-auto mix-blend-multiply"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </Link>

          <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            New to SentinelX?{' '}
            <Link to="/signup" className="font-medium text-[#0149FD] hover:underline">
              Create an account
            </Link>
          </p>

          {offline && (
            <div
              role="status"
              className="mt-6 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-900"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-medium">Sign-in is temporarily unavailable</p>
                <p className="mt-0.5 text-amber-800">
                  Our authentication provider is not responding. You can still scan contracts
                  without an account.
                </p>
                <button
                  type="button"
                  onClick={() => void checkService()}
                  className="mt-2 inline-flex items-center gap-1.5 font-medium text-amber-900 hover:underline"
                >
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                  Check again
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => void handleOAuth('google')}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => void handleOAuth('github')}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                aria-invalid={!!error}
                className={fieldClass}
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-500 hover:text-gray-900 mb-1.5"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className={`${fieldClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-gray-400 hover:text-gray-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0149FD] text-sm font-semibold text-white hover:bg-[#0033CC] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              {loading ? 'Signing in' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-xs text-gray-500">
            Signed in users can save scans and watch contracts.{' '}
            <Link to="/scan" className="text-[#0149FD] hover:underline">
              Scan without an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
