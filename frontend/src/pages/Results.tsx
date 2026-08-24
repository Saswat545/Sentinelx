import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth';

interface AnalysisResult {
  contractAddress: string;
  inputMode?: string;
  riskScore: number | null;
  riskLevel: string;
  flags: { name: string; severity: string }[];
  modelInfo: { model: string; features: number; responseTime: string };
  aiAssessment: string;
  shapValues?: any;
  error?: string;
}

export function Results() {
  const location = useLocation();
  const result = location.state as AnalysisResult | null;
  const { user, isConfigured } = useAuth();

  if (!result) {
    return (
      <div className="min-h-screen bg-white pt-28 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-display font-bold text-[#0a0a0a] mb-2">No Results Yet</h2>
          <p className="text-gray-500 text-sm mb-6">Run a contract analysis first to see results here.</p>
          <Link
            to="/scan"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#6D001A] hover:bg-[#8B0023] text-white font-semibold rounded-xl transition-all duration-300"
          >
            Scan a Token
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (result.error) {
    return (
      <div className="min-h-screen bg-white pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-[#0a0a0a] mb-2">Analysis Unavailable</h1>
            <p className="text-gray-500">Contract: <span className="font-mono text-gray-700">{result.contractAddress}</span></p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-[#0a0a0a] font-semibold mb-2">Backend API Not Available</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{result.error}</p>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-mono text-gray-400 mb-2">Quick Setup:</p>
              <code className="text-xs font-mono text-[#6D001A]">
                VITE_API_URL=https://api.sentinelx.site
              </code>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex gap-4 mt-6">
            <Link to="/scan" className="flex-1 py-3 bg-[#6D001A] hover:bg-[#8B0023] text-white font-semibold rounded-xl transition-all duration-300 text-center">
              Try Again
            </Link>
            <Link to="/" className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300 text-center">
              Back to Home
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Successful result
  const getRiskColor = (score: number) => {
    if (score <= 30) return { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-600', stroke: '#10b981', label: 'text-emerald-600' };
    if (score <= 60) return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-600', stroke: '#f59e0b', label: 'text-amber-600' };
    if (score <= 80) return { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-600', stroke: '#f97316', label: 'text-orange-600' };
    return { bg: 'bg-red-50 border-red-200', text: 'text-red-600', stroke: '#ef4444', label: 'text-red-600' };
  };

  const risk = result.riskScore !== null ? getRiskColor(result.riskScore) : { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-500', stroke: '#9ca3af', label: 'text-gray-500' };
  const isAuthenticated = isConfigured && user;

  // Free tier: show first 3 flags only
  const visibleFlags = isAuthenticated ? result.flags : result.flags.slice(0, 3);
  const hiddenFlagsCount = isAuthenticated ? 0 : Math.max(0, result.flags.length - 3);

  return (
    <div className="min-h-screen bg-white pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link to="/scan" className="hover:text-[#0a0a0a] transition-colors">Scanner</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[#0a0a0a]">Results</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-[#0a0a0a] mb-2">Analysis Complete</h1>
          <p className="text-gray-500">
            Contract: <span className="font-mono text-gray-700 text-sm">{result.contractAddress}</span>
          </p>
        </motion.div>

        {/* Risk Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Score Circle */}
            <div className="relative shrink-0">
              <svg className="w-36 h-36" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke={risk.stroke}
                  strokeWidth="8"
                  strokeDasharray="339.292"
                  strokeDashoffset={339.292 - (339.292 * (result.riskScore || 0) / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-display font-bold text-[#0a0a0a]">{result.riskScore}</span>
                <span className="text-xs text-gray-400 font-mono">/100</span>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 ${risk.bg} border ${risk.label} rounded-full text-sm font-semibold mb-4`}>
                <span className="w-2 h-2 rounded-full bg-current" />
                {result.riskLevel} Risk
              </div>
              <h2 className="text-xl font-display font-semibold text-[#0a0a0a] mb-3">Risk Assessment</h2>
              {result.aiAssessment && (
                <p className="text-gray-500 text-sm leading-relaxed">{result.aiAssessment}</p>
              )}
              {!result.aiAssessment && (
                <p className="text-gray-400 text-sm">
                  This contract has been analyzed using our XGBoost ML model with {result.modelInfo.features} feature extraction signals.
                </p>
              )}
            </div>
          </div>

          {/* "How is this calculated?" link */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <Link to="/how-it-works#risk-score" className="text-xs text-[#6D001A] hover:underline font-medium">
              How is this risk score calculated?
            </Link>
          </div>
        </motion.div>

        {/* Security Signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6"
        >
          <h3 className="font-display font-semibold text-[#0a0a0a] mb-4">Security Signals</h3>
          {visibleFlags.length > 0 ? (
            <div className="space-y-3">
              {visibleFlags.map((flag, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    {flag.severity === 'High' ? (
                      <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : flag.severity === 'Medium' ? (
                      <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="text-[#0a0a0a] text-sm">{flag.name}</span>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    flag.severity === 'High' ? 'bg-red-50 text-red-600 border border-red-200' :
                    flag.severity === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                    'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  }`}>
                    {flag.severity}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">No security signals detected</p>
          )}

          {/* Gated content */}
          {hiddenFlagsCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100">
                <p className="text-sm text-gray-500 mb-3">
                  <span className="font-semibold text-[#0a0a0a]">{hiddenFlagsCount} more signals</span> available with a free account
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-[#6D001A]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Full risk breakdown
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-[#6D001A]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    SHAP explanations
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-[#6D001A]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Scan history
                  </span>
                </div>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#6D001A] hover:bg-[#8B0023] text-white text-sm font-semibold rounded-lg transition-all duration-300"
                >
                  Create Free Account
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </motion.div>

        {/* Model Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6"
        >
          <h3 className="font-display font-semibold text-[#0a0a0a] mb-4">Model Information</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-gray-400 text-xs mb-1 font-mono uppercase tracking-wider">Model</p>
              <p className="text-[#0a0a0a] text-sm font-semibold">{result.modelInfo.model}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-gray-400 text-xs mb-1 font-mono uppercase tracking-wider">Features</p>
              <p className="text-[#0a0a0a] text-sm font-semibold">{result.modelInfo.features}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-gray-400 text-xs mb-1 font-mono uppercase tracking-wider">Time</p>
              <p className="text-[#0a0a0a] text-sm font-semibold">{result.modelInfo.responseTime}</p>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6"
        >
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            SentinelX provides automated security analysis for informational purposes only. Results are not a guarantee of safety or financial advice.{' '}
            <Link to="/disclaimer" className="text-[#6D001A] hover:underline">Read full disclaimer</Link>
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            to="/scan"
            className="flex-1 py-3.5 bg-[#6D001A] hover:bg-[#8B0023] text-white font-semibold rounded-xl transition-all duration-300 text-center"
          >
            Analyze Another Contract
          </Link>
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="flex-1 py-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300 text-center"
            >
              Back to Dashboard
            </Link>
          ) : (
            <Link
              to="/"
              className="flex-1 py-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300 text-center"
            >
              Back to Home
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  );
}
