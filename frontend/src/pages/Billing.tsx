import React from 'react';
import { Link } from 'react-router-dom';
import { Check, CreditCard, Gauge, ScanLine, ShieldCheck, Sparkles } from 'lucide-react';
import { useScans } from '../lib/scanStore';
import { PageHeader, Panel, PanelHeader, Pill } from '../components/app/ui';

const FREE_LIMIT = 50;

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    description: 'For individual analysts evaluating contracts.',
    features: ['50 scans per month', 'Risk score + security signals', '7-day scan history', 'Email support'],
    cta: 'Current plan',
    href: null,
  },
  {
    name: 'Pro',
    price: '$79',
    cadence: 'per month',
    description: 'For active traders and security researchers.',
    features: [
      'Unlimited scans',
      'Full SHAP explanations',
      'Watchlists and alerts',
      'Unlimited history + CSV export',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    href: '/pricing',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    cadence: '',
    description: 'For protocols, funds and audit teams.',
    features: ['REST API + SDK access', 'Team seats and SSO', 'Custom rate limits', 'SLA and dedicated support'],
    cta: 'Contact sales',
    href: '/contact',
  },
];

export function Billing() {
  const { stats, scans } = useScans();
  const used = stats.last30Days;
  const percentage = Math.min(100, Math.round((used / FREE_LIMIT) * 100));
  const remaining = Math.max(0, FREE_LIMIT - used);

  const resetDate = new Date();
  resetDate.setMonth(resetDate.getMonth() + 1, 1);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Account"
        title="Billing & Usage"
        description="Track scan consumption for the current cycle and compare plan limits."
        actions={
          <Link
            to="/pricing"
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-[#0a0a0a]"
          >
            Compare plans
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Pill>
                <ShieldCheck className="h-3 w-3 text-[#6D001A]" />
                Current plan
              </Pill>
              <h2 className="mt-3 font-display text-2xl font-bold text-[#0a0a0a]">Free</h2>
              <p className="mt-1 text-sm text-gray-500">
                {FREE_LIMIT} scans per month · risk scoring and security signals included.
              </p>
            </div>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#6D001A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#8B0023]"
            >
              <Sparkles className="h-4 w-4" />
              Upgrade
            </Link>
          </div>

          <div className="mt-7">
            <div className="mb-2 flex items-end justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-gray-400">
                Scans this cycle
              </span>
              <span className="text-sm font-semibold text-[#0a0a0a]">
                {used}
                <span className="text-gray-400"> / {FREE_LIMIT}</span>
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  percentage >= 90 ? 'bg-red-500' : percentage >= 70 ? 'bg-amber-500' : 'bg-[#6D001A]'
                }`}
                style={{ width: `${Math.max(percentage, used > 0 ? 3 : 0)}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
              <span>{remaining} scans remaining</span>
              <span>
                Resets{' '}
                {resetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: 'Total scans', value: stats.total, icon: ScanLine },
              { label: 'High / critical', value: stats.highRisk, icon: ShieldCheck },
              { label: 'Avg risk', value: stats.total ? stats.averageRisk : '-', icon: Gauge },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <item.icon className="h-3.5 w-3.5" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em]">{item.label}</span>
                </div>
                <p className="mt-1.5 font-display text-lg font-bold text-[#0a0a0a]">{item.value}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Payment method" />
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-4 text-center">
            <span className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-400 shadow-sm">
              <CreditCard className="h-4 w-4" />
            </span>
            <p className="text-[12px] font-medium text-gray-600">No payment method on file</p>
            <p className="mt-1 text-[11px] leading-relaxed text-gray-400">
              The free plan does not require billing details. A payment provider is not connected yet;
              paid plans are arranged with our team.
            </p>
            <Link
              to="/contact"
              className="mt-3 inline-block text-[11px] font-semibold text-[#6D001A] hover:underline"
            >
              Contact us about Pro →
            </Link>
          </div>

          <div className="mt-5">
            <PanelHeader title="Recent activity" />
            {scans.length === 0 ? (
              <p className="text-xs text-gray-400">No scans recorded this cycle.</p>
            ) : (
              <ul className="space-y-2">
                {scans.slice(0, 4).map((scan) => (
                  <li key={scan.id} className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="truncate font-mono text-gray-500">
                      {scan.contract.slice(0, 14)}…
                    </span>
                    <span className="shrink-0 text-gray-400">
                      {new Date(scan.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <Panel
            key={plan.name}
            className={
              plan.highlighted
                ? 'relative border-[#6D001A]/30 ring-1 ring-[#6D001A]/10'
                : undefined
            }
          >
            {plan.highlighted && (
              <span className="absolute -top-2.5 left-5 rounded-full bg-[#6D001A] px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white">
                Recommended
              </span>
            )}
            <h3 className="font-display text-base font-semibold text-[#0a0a0a]">{plan.name}</h3>
            <p className="mt-0.5 text-[11px] text-gray-400">{plan.description}</p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-2xl font-bold text-[#0a0a0a]">{plan.price}</span>
              {plan.cadence && <span className="text-[11px] text-gray-400">/ {plan.cadence}</span>}
            </div>
            <ul className="mt-4 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-[12px] text-gray-600">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6D001A]" />
                  {feature}
                </li>
              ))}
            </ul>
            {plan.href ? (
              <Link
                to={plan.href}
                className="mt-5 block rounded-xl border border-gray-200 bg-white py-2 text-center text-[12px] font-semibold text-[#0a0a0a] transition-colors hover:border-[#6D001A]/30 hover:text-[#6D001A]"
              >
                {plan.cta}
              </Link>
            ) : (
              <span className="mt-5 block rounded-xl bg-gray-50 py-2 text-center text-[12px] font-semibold text-gray-400">
                {plan.cta}
              </span>
            )}
          </Panel>
        ))}
      </div>
    </div>
  );
}
