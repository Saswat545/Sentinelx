import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  ScanLine,
  Search,
  Trash2,
} from 'lucide-react';
import { useScans, riskTone, ScanRecord } from '../lib/scanStore';
import { EmptyState, PageHeader, Panel, RiskBadge, ScoreRing } from '../components/app/ui';

const PAGE_SIZE = 10;

type SortKey = 'newest' | 'oldest' | 'risk-high' | 'risk-low';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function toCsv(rows: ScanRecord[]): string {
  const header = ['contract', 'mode', 'risk_score', 'risk_level', 'flags', 'model', 'analyzed_at'];
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  const lines = rows.map((row) =>
    [
      row.contract,
      row.inputMode,
      row.riskScore,
      row.riskLevel,
      row.flags.map((flag) => `${flag.name} (${flag.severity})`).join('; '),
      row.model,
      row.createdAt,
    ]
      .map(escape)
      .join(',')
  );
  return [header.join(','), ...lines].join('\n');
}

export function History() {
  const { scans, remove, clear } = useScans();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [level, setLevel] = useState('All');
  const [sort, setSort] = useState<SortKey>('newest');
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setPage(0);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = scans.filter((scan) => {
      const matchesSearch =
        !needle ||
        scan.contract.toLowerCase().includes(needle) ||
        scan.riskLevel.toLowerCase().includes(needle);
      const matchesLevel = level === 'All' || scan.riskLevel === level;
      return matchesSearch && matchesLevel;
    });

    return [...rows].sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'risk-high':
          return b.riskScore - a.riskScore;
        case 'risk-low':
          return a.riskScore - b.riskScore;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [scans, query, level, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  const updateQuery = (value: string) => {
    setQuery(value);
    setPage(0);
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set('q', value.trim());
    else next.delete('q');
    setSearchParams(next, { replace: true });
  };

  const exportCsv = () => {
    const blob = new Blob([toCsv(filtered)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sentinelx-scans-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Workspace"
        title="Scan History"
        description="Every contract you have analysed, with risk scores, security signals and model metadata."
        actions={
          <>
            {scans.length > 0 && (
              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-[#0a0a0a]"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            )}
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

      <Panel padded={false}>
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Search by contract address or name…"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 font-mono text-[12px] text-[#0a0a0a] placeholder:font-sans placeholder:text-gray-400 focus:border-[#6D001A]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D001A]/10"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <select
                value={level}
                onChange={(event) => {
                  setLevel(event.target.value);
                  setPage(0);
                }}
                className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-8 pr-8 text-xs font-medium text-gray-600 focus:border-[#6D001A]/40 focus:outline-none focus:ring-2 focus:ring-[#6D001A]/10"
              >
                {['All', 'Critical', 'High', 'Medium', 'Low'].map((option) => (
                  <option key={option} value={option}>
                    {option === 'All' ? 'All risk levels' : option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="relative">
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-xs font-medium text-gray-600 focus:border-[#6D001A]/40 focus:outline-none focus:ring-2 focus:ring-[#6D001A]/10"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="risk-high">Highest risk</option>
                <option value="risk-low">Lowest risk</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ScanLine className="h-5 w-5" />}
            title={scans.length === 0 ? 'No analyses yet' : 'No matching scans'}
            description={
              scans.length === 0
                ? 'Your completed contract analyses will appear here with full history, risk scores and signals.'
                : 'Try a different search term or clear the risk-level filter.'
            }
            action={
              scans.length === 0 ? (
                <Link
                  to="/scan"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#6D001A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#8B0023]"
                >
                  Start your first scan
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    updateQuery('');
                    setLevel('All');
                  }}
                  className="text-xs font-semibold text-[#6D001A] hover:underline"
                >
                  Clear filters
                </button>
              )
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr className="bg-gray-50/60 text-left">
                    <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-gray-400">
                      Contract
                    </th>
                    <th className="px-3 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-gray-400">
                      Risk
                    </th>
                    <th className="px-3 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-gray-400">
                      Level
                    </th>
                    <th className="px-3 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-gray-400">
                      Signals
                    </th>
                    <th className="px-3 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-gray-400">
                      Analysed
                    </th>
                    <th className="px-5 py-3 text-right font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((scan) => {
                    const isOpen = expanded === scan.id;
                    return (
                      <React.Fragment key={scan.id}>
                        <tr
                          onClick={() => setExpanded(isOpen ? null : scan.id)}
                          className="cursor-pointer border-b border-gray-50 transition-colors hover:bg-gray-50/70"
                        >
                          <td className="max-w-[260px] px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <ChevronRight
                                className={`h-3.5 w-3.5 shrink-0 text-gray-300 transition-transform ${
                                  isOpen ? 'rotate-90 text-[#6D001A]' : ''
                                }`}
                              />
                              <div className="min-w-0">
                                <p className="truncate font-mono text-[12px] text-[#0a0a0a]">
                                  {scan.contract}
                                </p>
                                <p className="text-[10px] uppercase tracking-wider text-gray-400">
                                  {scan.inputMode === 'solidity' ? 'Solidity source' : 'Address'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3.5">
                            <ScoreRing score={scan.riskScore} size={40} />
                          </td>
                          <td className="px-3 py-3.5">
                            <RiskBadge level={scan.riskLevel} />
                          </td>
                          <td className="px-3 py-3.5">
                            <span className="font-mono text-[11px] text-gray-500">
                              {scan.flags.length === 0 ? '-' : `${scan.flags.length} flag${scan.flags.length === 1 ? '' : 's'}`}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3.5 text-[11px] text-gray-400">
                            {formatDate(scan.createdAt)}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                remove(scan.id);
                              }}
                              className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                              aria-label="Delete scan"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>

                        {isOpen && (
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <td colSpan={6} className="px-5 py-5">
                              <div className="grid gap-5 lg:grid-cols-3">
                                <div className="lg:col-span-2">
                                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-gray-400">
                                    Assessment
                                  </p>
                                  <p className="text-[13px] leading-relaxed text-gray-600">
                                    {scan.aiAssessment ||
                                      `Scored ${scan.riskScore}/100 by ${scan.model}. ${scan.flags.length} security signal${
                                        scan.flags.length === 1 ? '' : 's'
                                      } returned for this contract.`}
                                  </p>

                                  <p className="mb-2 mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-gray-400">
                                    Security signals
                                  </p>
                                  {scan.flags.length === 0 ? (
                                    <p className="text-[12px] text-gray-400">No signals were returned.</p>
                                  ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                      {scan.flags.map((flag, index) => {
                                        const tone = riskTone(
                                          flag.severity.toLowerCase().startsWith('high')
                                            ? 'High'
                                            : flag.severity.toLowerCase().startsWith('med')
                                              ? 'Medium'
                                              : 'Low'
                                        );
                                        return (
                                          <span
                                            key={`${flag.name}-${index}`}
                                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] ${tone.bg} ${tone.text} ${tone.border}`}
                                          >
                                            {flag.name}
                                            <span className="font-mono text-[9px] uppercase opacity-60">
                                              {flag.severity}
                                            </span>
                                          </span>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                <dl className="space-y-2 rounded-xl border border-gray-200 bg-white p-3.5">
                                  {[
                                    ['Model', scan.model],
                                    ['Features', String(scan.features)],
                                    ['Response', scan.responseTime],
                                    ['Analyzed', formatDate(scan.createdAt)],
                                  ].map(([label, value]) => (
                                    <div key={label} className="flex items-center justify-between gap-3">
                                      <dt className="font-mono text-[10px] uppercase tracking-wider text-gray-400">
                                        {label}
                                      </dt>
                                      <dd className="truncate text-[11px] font-medium text-[#0a0a0a]">
                                        {value}
                                      </dd>
                                    </div>
                                  ))}
                                </dl>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-5 py-3 sm:flex-row">
              <p className="text-[11px] text-gray-400">
                Showing{' '}
                <span className="font-medium text-gray-600">
                  {currentPage * PAGE_SIZE + 1}–{Math.min(filtered.length, (currentPage + 1) * PAGE_SIZE)}
                </span>{' '}
                of {filtered.length}
                {filtered.length !== scans.length && ` (filtered from ${scans.length})`}
              </p>
              <div className="flex items-center gap-1.5">
                {scans.length > 0 && (
                  <button
                    type="button"
                    onClick={() => clear()}
                    className="mr-2 rounded-lg px-2.5 py-1.5 text-[11px] text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    Clear all
                  </button>
                )}
                <button
                  type="button"
                  disabled={currentPage === 0}
                  onClick={() => setPage((value) => Math.max(0, value - 1))}
                  className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="px-2 font-mono text-[11px] text-gray-500">
                  {currentPage + 1} / {pageCount}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= pageCount - 1}
                  onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
                  className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}
