import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Eye,
  Gauge,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../lib/auth';
import { useScans, useWatchlist } from '../lib/scanStore';
import {
  EmptyState,
  PageHeader,
  Panel,
  PanelHeader,
  Pill,
  RiskBadge,
  ScoreRing,
  StatCard,
} from '../components/app/ui';

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const RISK_COLORS: Record<string, string> = {
  Critical: '#dc2626',
  High: '#ea580c',
  Medium: '#d97706',
  Low: '#059669',
};

export function Dashboard() {
  const { user } = useAuth();
  const { scans, stats } = useScans();
  const { items: watchlist } = useWatchlist();

  const meta = user?.user_metadata as { name?: string } | undefined;
  const displayName = meta?.name || (user?.email ? user.email.split('@')[0] : 'analyst');
  const recent = scans.slice(0, 5);

  const distribution = [
    { name: 'Critical', value: stats.critical },
    { name: 'High', value: stats.high },
    { name: 'Medium', value: stats.medium },
    { name: 'Low', value: stats.low },
  ].filter((entry) => entry.value > 0);

  const hasActivity = stats.total > 0;
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={today}
        title={`Welcome back, ${displayName}`}
        description={
          hasActivity
            ? `${stats.total} contract${stats.total === 1 ? '' : 's'} analysed · ${stats.highRisk} flagged high or critical risk.`
            : 'Your workspace is ready. Run your first contract analysis to start building a security profile.'
        }
        actions={
          <>
            <Link
              to="/history"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-[#0a0a0a]"
            >
              View history
            </Link>
            <Link
              to="/scan"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#6D001A] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#8B0023]"
            >
              <ScanLine className="h-4 w-4" />
              New scan
            </Link>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total scans"
          value={stats.total}
          hint={
            <span className="inline-flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              {stats.last7Days} in the last 7 days
            </span>
          }
          icon={<ScanLine className="h-[18px] w-[18px]" />}
          tone="brand"
        />
        <StatCard
          label="High / critical"
          value={stats.highRisk}
          hint={stats.total > 0 ? `${Math.round((stats.highRisk / stats.total) * 100)}% of analysed contracts` : 'No data yet'}
          icon={<AlertTriangle className="h-[18px] w-[18px]" />}
          tone="red"
        />
        <StatCard
          label="Average risk"
          value={hasActivity ? `${stats.averageRisk}` : '-'}
          hint="Weighted across all scans"
          icon={<Gauge className="h-[18px] w-[18px]" />}
          tone="amber"
        />
        <StatCard
          label="Watchlist"
          value={watchlist.length}
          hint={watchlist.length > 0 ? 'Contracts under observation' : 'Nothing monitored yet'}
          icon={<Eye className="h-[18px] w-[18px]" />}
          tone="emerald"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHeader
            title="Scan activity"
            description="Contracts analysed per day, last 14 days"
            action={
              <Pill>
                <Activity className="h-3 w-3 text-[#6D001A]" />
                {stats.last7Days} this week
              </Pill>
            }
          />
          <div className="h-[248px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trend} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="scanFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6D001A" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#6D001A" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#f1f1f3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'JetBrains Mono' }}
                  interval={2}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'JetBrains Mono' }}
                  width={40}
                />
                <Tooltip
                  cursor={{ stroke: '#d4d4d8', strokeWidth: 1 }}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    fontSize: 12,
                    boxShadow: '0 8px 24px rgba(16,24,40,0.08)',
                  }}
                  labelStyle={{ color: '#0a0a0a', fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="scans"
                  name="Scans"
                  stroke="#6D001A"
                  strokeWidth={2}
                  fill="url(#scanFill)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Risk distribution" description="All analysed contracts" />
          {distribution.length === 0 ? (
            <EmptyState
              compact
              icon={<ShieldCheck className="h-5 w-5" />}
              title="No risk data yet"
              description="Risk bands appear here once you analyse a contract."
              action={
                <Link to="/scan" className="text-xs font-semibold text-[#6D001A] hover:underline">
                  Run a scan →
                </Link>
              }
            />
          ) : (
            <>
              <div className="relative h-[168px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={54}
                      outerRadius={78}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {distribution.map((entry) => (
                        <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #e5e7eb',
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-2xl font-bold text-[#0a0a0a]">{stats.total}</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-gray-400">
                    contracts
                  </span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {distribution.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-gray-500">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: RISK_COLORS[entry.name] }}
                      />
                      {entry.name}
                    </span>
                    <span className="font-mono text-[11px] text-gray-600">
                      {entry.value}
                      <span className="ml-1 text-gray-400">
                        ({Math.round((entry.value / stats.total) * 100)}%)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Panel>
      </div>

      {/* Recent scans + side rail */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2" padded={false}>
          <div className="flex items-start justify-between gap-3 p-5 pb-0 sm:p-6 sm:pb-0">
            <div>
              <h2 className="font-display text-[15px] font-semibold text-[#0a0a0a]">Recent scans</h2>
              <p className="mt-0.5 text-xs text-gray-400">Latest contract analyses in this workspace</p>
            </div>
            <Link
              to="/history"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#6D001A] hover:underline"
            >
              All scans
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <EmptyState
              icon={<ScanLine className="h-5 w-5" />}
              title="No scans yet"
              description="Analyse a contract address or paste Solidity source code; results land here with a full history."
              action={
                <Link
                  to="/scan"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#6D001A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#8B0023]"
                >
                  Analyze your first contract
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse">
                <thead>
                  <tr className="border-y border-gray-100 bg-gray-50/60 text-left">
                    <th className="px-5 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-gray-400 sm:px-6">
                      Contract
                    </th>
                    <th className="px-3 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-gray-400">
                      Risk
                    </th>
                    <th className="px-3 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-gray-400">
                      Level
                    </th>
                    <th className="px-3 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-gray-400">
                      Flags
                    </th>
                    <th className="px-5 py-2.5 text-right font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-gray-400 sm:px-6">
                      When
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((scan) => (
                    <tr
                      key={scan.id}
                      className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/70"
                    >
                      <td className="max-w-[220px] px-5 py-3 sm:px-6">
                        <Link to="/history" className="block">
                          <span className="block truncate font-mono text-[12px] text-[#0a0a0a]">
                            {scan.contract.length > 26
                              ? `${scan.contract.slice(0, 12)}…${scan.contract.slice(-8)}`
                              : scan.contract}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-gray-400">
                            {scan.inputMode === 'solidity' ? 'Source code' : 'Address'}
                          </span>
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <ScoreRing score={scan.riskScore} />
                      </td>
                      <td className="px-3 py-3">
                        <RiskBadge level={scan.riskLevel} />
                      </td>
                      <td className="px-3 py-3 font-mono text-[11px] text-gray-500">
                        {scan.flags.length}
                      </td>
                      <td className="px-5 py-3 text-right text-[11px] text-gray-400 sm:px-6">
                        {relativeTime(scan.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Quick actions" />
            <div className="space-y-1.5">
              {[
                { to: '/scan', label: 'Analyse a contract', desc: 'Address or Solidity', icon: ScanLine },
                { to: '/watchlist', label: 'Monitor a token', desc: 'Add to watchlist', icon: Eye },
                { to: '/billing', label: 'Review usage', desc: 'Plan and limits', icon: Sparkles },
              ].map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-gray-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-colors group-hover:bg-[#6D001A]/[0.08] group-hover:text-[#6D001A]">
                    <action.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-[#0a0a0a]">{action.label}</span>
                    <span className="block text-[11px] text-gray-400">{action.desc}</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#6D001A]" />
                </Link>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="Watchlist"
              action={
                <Link to="/watchlist" className="text-xs font-medium text-[#6D001A] hover:underline">
                  Manage
                </Link>
              }
            />
            {watchlist.length === 0 ? (
              <p className="text-xs leading-relaxed text-gray-400">
                No contracts monitored yet. Add an address to keep an eye on its risk posture.
              </p>
            ) : (
              <div className="space-y-2">
                {watchlist.slice(0, 3).map((item) => (
                  <div key={item.address} className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100">
                      <Eye className="h-3.5 w-3.5 text-gray-400" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium text-[#0a0a0a]">{item.label}</p>
                      <p className="truncate font-mono text-[10px] text-gray-400">
                        {item.address.slice(0, 10)}…{item.address.slice(-6)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
