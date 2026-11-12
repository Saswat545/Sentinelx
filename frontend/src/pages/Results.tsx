import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Check, Info } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { CountUp } from '../components/motion/CountUp';

interface AnalysisResult {
  contractAddress: string;
  inputMode?: string;
  riskScore: number | null;
  riskLevel: string;
  verdictLabel?: string | null;
  scoreSource?: 'model' | 'policy' | 'onchain';
  flags: { name: string; severity: string }[];
  modelInfo: { model: string; features: number; responseTime: string };
  aiAssessment: string;
  shapValues?: any;
  saved?: boolean;
  error?: string;
  engine?: {
    ruleScore: number | null;
    aiScore: number | null;
    confidence: number | null;
    status: string | null;
    findings: { title: string; severity: string; evidence: string; confirmed: boolean }[];
  } | null;
}

const severityStyles: Record<string, { chip: string; dot: string }> = {
  CRITICAL: { chip: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  HIGH: { chip: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  MEDIUM: { chip: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  LOW: { chip: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  INFORMATIONAL: {
    chip: 'bg-gray-50 text-gray-600 border-gray-200',
    dot: 'bg-gray-400',
  },
};

const scoreTone = (score: number) => {
  if (score <= 30) return { stroke: '#059669', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
  if (score <= 60) return { stroke: '#D97706', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
  if (score <= 80) return { stroke: '#EA580C', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' };
  return { stroke: '#DC2626', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' };
};

export function Results() {
  const location = useLocation();
  const result = location.state as AnalysisResult | null;
  const { user, isConfigured } = useAuth();
  const reduceMotion = useReducedMotion();
  const engine = result?.engine ?? null;

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 pt-28 pb-16">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-semibold text-gray-900">No result to show</h1>
          <p className="mt-2 text-sm text-gray-500">
            Run a scan first, then the result appears here.
          </p>
          <Link
            to="/scan"
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-[#0149FD] px-5 text-sm font-semibold text-white hover:bg-[#0033CC]"
          >
            Open scanner
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="min-h-screen bg-white px-4 pt-28 pb-16">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-gray-400">Scanner</p>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">Analysis unavailable</h1>
          <p className="mt-1 font-mono text-sm text-gray-500">{result.contractAddress}</p>

          <div className="mt-8 rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
              <div>
                <h2 className="font-medium text-gray-900">The analysis service did not respond</h2>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{result.error}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/scan"
                className="inline-flex h-10 items-center rounded-lg bg-[#0149FD] px-5 text-sm font-semibold text-white hover:bg-[#0033CC]"
              >
                Try again
              </Link>
              <Link
                to="/"
                className="inline-flex h-10 items-center rounded-lg border border-gray-300 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const score = result.riskScore;
  const tone = score !== null ? scoreTone(score) : { stroke: '#9CA3AF', text: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
  const isAuthenticated = isConfigured && user;
  const policyScore = result.scoreSource === 'policy';
  const visibleFlags = isAuthenticated ? result.flags : result.flags.slice(0, 3);
  const hiddenFlagsCount = isAuthenticated ? 0 : Math.max(0, result.flags.length - 3);

  const summary = result.aiAssessment
    ? result.aiAssessment
    : policyScore
      ? 'No source is available for this address, so the score comes from bytecode checks, or is UNKNOWN when those cannot run.'
      : `The model scored ${score} of 100 from ${result.modelInfo.features} extracted signals.`;

  return (
    <div className="min-h-screen bg-white px-4 pt-28 pb-20">
      <motion.div
        className="mx-auto max-w-4xl"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <header>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-gray-400">
            Scanner / Result
          </p>
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">Scan result</h1>
            {result.saved && (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                Saved to scan history
              </span>
            )}
          </div>
          <p className="mt-1 break-all font-mono text-sm text-gray-500">
            {result.contractAddress}
          </p>
        </header>

        {/* Score */}
        <section className="mt-8 rounded-xl border border-gray-200">
          <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[200px_1fr] md:items-center">
            <div className="relative mx-auto h-36 w-36">
              <svg className="h-36 w-36" viewBox="0 0 120 120" aria-hidden="true">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#F3F4F6" strokeWidth="8" />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={tone.stroke}
                  strokeWidth="8"
                  strokeDasharray="339.292"
                  initial={{ strokeDashoffset: 339.292 }}
                  animate={{ strokeDashoffset: 339.292 - (339.292 * (score ?? 0)) / 100 }}
                  transition={{ duration: reduceMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-semibold tabular-nums text-gray-900">
                  {score !== null ? <CountUp to={score} duration={0.9} /> : '--'}
                </span>
                <span className="font-mono text-xs text-gray-400">of 100</span>
              </div>
            </div>

            <div>
              <span
                className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${tone.bg} ${tone.border} ${tone.text}`}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone.stroke }} />
                {result.riskLevel} risk
              </span>
              <h2 className="mt-3 text-xl font-semibold text-gray-900">
                {result.verdictLabel || 'Risk assessment'}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{summary}</p>
              <p className="mt-4 text-xs text-gray-500">
                Score basis:{' '}
                <span className="font-medium text-gray-700">
                  {engine && engine.ruleScore !== null
                    ? engine.aiScore !== null
                      ? `rules ${engine.ruleScore} × 0.7 + model ${engine.aiScore} × 0.3`
                      : `rules only (${engine.ruleScore}); no model score for this input`
                    : policyScore
                      ? 'policy rule (source not verified)'
                      : `model (${result.modelInfo.model})`}
                </span>
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 px-6 py-3 sm:px-8">
            <Link
              to="/how-it-works#risk-score"
              className="inline-flex items-center gap-1.5 text-sm text-[#0149FD] hover:underline"
            >
              How the score is calculated
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* Engine split: the backend fuses rules (70%) and model (30%) */}
        {engine && (
          <section className="mt-6 rounded-xl border border-gray-200">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 px-6 py-4">
              <h2 className="text-sm font-semibold text-gray-900">How this score was built</h2>
              <span className="font-mono text-xs text-gray-400">
                {engine.status === 'insufficient_data'
                  ? 'not scored'
                  : engine.aiScore !== null
                    ? 'rules 70% · model 30%'
                    : 'rules only'}
              </span>
            </div>

            {engine.status !== 'insufficient_data' && (
              <div className="grid gap-6 px-6 py-5 sm:grid-cols-2">
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-gray-700">Rule engine</span>
                  <span className="font-mono text-sm tabular-nums text-gray-900">
                    {engine.ruleScore}
                  </span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-gray-100" aria-hidden="true">
                  <div
                    className="h-1.5 rounded-full bg-[#0149FD]"
                    style={{ width: `${Math.min(Math.max(engine.ruleScore ?? 0, 0), 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-500">
                  Deterministic checks. Each one names the code pattern it matched.
                </p>
              </div>

              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-gray-700">XGBoost model</span>
                  <span className="font-mono text-sm tabular-nums text-gray-900">
                    {engine.aiScore ?? 'not run'}
                  </span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-gray-100" aria-hidden="true">
                  <div
                    className="h-1.5 rounded-full bg-[#0149FD]/40"
                    style={{ width: `${Math.min(Math.max(engine.aiScore ?? 0, 0), 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-500">
                  {engine.aiScore === null
                    ? 'Not run for this input, so the rules carried the score.'
                    : '54 extracted features, scored by the trained booster.'}
                </p>
              </div>
              </div>
            )}

            {engine.findings.length > 0 && engine.status !== 'insufficient_data' && (
              <ul className="divide-y divide-gray-100 border-t border-gray-100">
                {engine.findings.slice(0, 8).map((finding, index) => {
                  const style =
                    severityStyles[finding.severity?.toUpperCase()] ?? severityStyles.INFORMATIONAL;
                  return (
                    <li key={index} className="flex flex-wrap items-start justify-between gap-3 px-6 py-3">
                      <div className="min-w-0">
                        <p className="text-sm text-gray-800">
                          {finding.title}
                          {finding.confirmed && (
                            <span className="ml-2 font-mono text-[10px] uppercase tracking-wide text-red-600">
                              confirmed
                            </span>
                          )}
                        </p>
                        {finding.evidence && (
                          <p className="mt-0.5 break-all font-mono text-[11px] text-gray-500">
                            {finding.evidence}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-md border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide ${style.chip}`}
                      >
                        {finding.severity}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="border-t border-gray-100 px-6 py-3">
              <p className="text-xs text-gray-500">
                {engine.status === 'insufficient_data'
                  ? 'There was not enough readable evidence to score this contract. UNKNOWN, not safe.'
                  : engine.status === 'onchain_state'
                    ? 'Scored from live Solana chain state: mint and freeze authority, holder concentration and DEX liquidity. No source code is read on Solana.'
                    : engine.status === 'bytecode_only'
                    ? `Source is unverified, so the model did not run. This score comes from bytecode evidence alone (${engine.confidence ?? '--'}% of it readable).`
                    : `Confidence ${engine.confidence ?? '--'}%, based on how much of the source could be read.`}
              </p>
            </div>
          </section>
        )}

        {policyScore && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-semibold text-amber-900">No verified source</h2>
              <p className="mt-1 text-sm leading-relaxed text-amber-800">
                Etherscan has no verified source code for this address, so the rule engine and model
                could not read it. SentinelX scores the bytecode where it can, and returns UNKNOWN
                when even that is unavailable. Ask the deployer to verify the source, and treat an
                unknown result as unverified rather than safe.
              </p>
            </div>
          </div>
        )}

        {/* Signals */}
        <section className="mt-6 rounded-xl border border-gray-200">
          <div className="flex items-baseline justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Security signals</h2>
            <span className="font-mono text-xs text-gray-400">{result.flags.length} found</span>
          </div>

          {visibleFlags.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {visibleFlags.map((flag, index) => {
                const style = severityStyles[flag.severity?.toUpperCase()] ?? severityStyles.INFORMATIONAL;
                return (
                  <motion.li
                    key={index}
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.35 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center justify-between gap-4 px-6 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
                      <span className="text-sm text-gray-800">{flag.name}</span>
                    </div>
                    <span
                      className={`shrink-0 rounded-md border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide ${style.chip}`}
                    >
                      {flag.severity}
                    </span>
                  </motion.li>
                );
              })}
            </ul>
          ) : (
            <p className="px-6 py-6 text-sm text-gray-500">No security signals in this result.</p>
          )}

          {hiddenFlagsCount > 0 && (
            <div className="border-t border-gray-100 px-6 py-5">
              <p className="text-sm text-gray-600">
                {hiddenFlagsCount} more {hiddenFlagsCount === 1 ? 'signal' : 'signals'} with a free
                account.
              </p>
              <Link
                to="/signup"
                className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg bg-[#0149FD] px-4 text-sm font-semibold text-white hover:bg-[#0033CC]"
              >
                Create free account
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          )}
        </section>

        {/* Model information */}
        <section className="mt-6 rounded-xl border border-gray-200">
          <h2 className="border-b border-gray-100 px-6 py-4 text-sm font-semibold text-gray-900">
            Analysis details
          </h2>
          <dl className="grid grid-cols-2 divide-gray-100 sm:grid-cols-4 sm:divide-x">
            {[
              { label: 'Model', value: result.modelInfo.model },
              { label: 'Features', value: result.modelInfo.features || '0' },
              { label: 'Time', value: result.modelInfo.responseTime },
              {
                label: 'Basis',
                value:
                  engine && engine.ruleScore !== null
                    ? engine.aiScore !== null
                      ? 'Rules 70% + model 30%'
                      : 'Rules only (on-chain state)'
                    : policyScore
                      ? 'Policy rule'
                      : 'Model',
              },
            ].map((item) => (
              <div key={item.label} className="border-b border-gray-100 px-6 py-4 last:border-b-0 sm:border-b-0">
                <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-gray-400">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="mt-6 text-xs leading-relaxed text-gray-500">
          Automated analysis for information only. It is not a guarantee of safety and not financial
          advice.{' '}
          <Link to="/disclaimer" className="text-[#0149FD] hover:underline">
            Read the full disclaimer
          </Link>
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/scan"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-[#0149FD] text-sm font-semibold text-white hover:bg-[#0033CC]"
          >
            Scan another contract
          </Link>
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {isAuthenticated ? 'Back to dashboard' : 'Back to home'}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
