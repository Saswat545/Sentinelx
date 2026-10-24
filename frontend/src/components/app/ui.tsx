import React from 'react';
import { RiskBand, riskTone } from '../../lib/scanStore';

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#6D001A]">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#0a0a0a] sm:text-[28px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  children,
  className = '',
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${
        padded ? 'p-5 sm:p-6' : ''
      } ${className}`}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h2 className="font-display text-[15px] font-semibold text-[#0a0a0a]">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-gray-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

const STAT_TONES: Record<string, { bg: string; text: string }> = {
  brand: { bg: 'bg-[#6D001A]/[0.07]', text: 'text-[#6D001A]' },
  red: { bg: 'bg-red-50', text: 'text-red-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  slate: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'brand',
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon: React.ReactNode;
  tone?: keyof typeof STAT_TONES | string;
}) {
  const palette = STAT_TONES[tone] || STAT_TONES.brand;
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors hover:border-gray-300">
      <div className="flex items-start justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gray-400">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${palette.bg} ${palette.text}`}>
          {icon}
        </span>
      </div>
      <p className="mt-3 font-display text-[28px] font-bold leading-none text-[#0a0a0a]">{value}</p>
      {hint && <p className="mt-2 text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

export function RiskBadge({ level, size = 'sm' }: { level: RiskBand | string; size?: 'sm' | 'md' }) {
  const tone = riskTone(level);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${tone.bg} ${tone.text} ${tone.border} ${
        size === 'md' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {level}
    </span>
  );
}

export function ScoreRing({ score, size = 44 }: { score: number; size?: number }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;
  const tone = riskTone(score > 80 ? 'Critical' : score > 60 ? 'High' : score > 30 ? 'Medium' : 'Low');
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f1f3" strokeWidth="4" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tone.hex}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-semibold text-[#0a0a0a]">
        {score}
      </span>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8' : 'py-14'}`}>
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        {icon}
      </span>
      <h3 className="font-display text-sm font-semibold text-[#0a0a0a]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-gray-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Pill({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-gray-500 ${className}`}
    >
      {children}
    </span>
  );
}
