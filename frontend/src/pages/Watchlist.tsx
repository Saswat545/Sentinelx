import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Plus, ScanLine, Trash2 } from 'lucide-react';
import { useWatchlist } from '../lib/scanStore';
import { EmptyState, PageHeader, Panel } from '../components/app/ui';

const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

export function Watchlist() {
  const { items, add, remove } = useWatchlist();
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = address.trim();
    if (!ADDRESS_PATTERN.test(trimmed)) {
      setError('Enter a valid Ethereum address: 0x followed by 40 hex characters.');
      return;
    }
    if (items.some((item) => item.address.toLowerCase() === trimmed.toLowerCase())) {
      setError('That address is already on your watchlist.');
      return;
    }
    add({
      address: trimmed,
      label: label.trim() || `${trimmed.slice(0, 6)}…${trimmed.slice(-4)}`,
      addedAt: new Date().toISOString(),
    });
    setAddress('');
    setLabel('');
    setError('');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Workspace"
        title="Watchlist"
        description="Keep the contracts you care about in one place for fast re-checks."
        actions={
          <Link
            to="/scan"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#6D001A] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#8B0023]"
          >
            <ScanLine className="h-4 w-4" />
            New scan
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel>
          <h2 className="font-display text-[15px] font-semibold text-[#0a0a0a]">Add a contract</h2>
          <p className="mt-0.5 text-xs text-gray-400">Track any mainnet contract address.</p>

          <form onSubmit={submit} className="mt-4 space-y-3">
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-gray-400">
                Contract address
              </label>
              <input
                value={address}
                onChange={(event) => {
                  setAddress(event.target.value);
                  setError('');
                }}
                placeholder="0x…"
                spellCheck={false}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 font-mono text-[12px] text-[#0a0a0a] placeholder:text-gray-400 focus:border-[#6D001A]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D001A]/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-gray-400">
                Label <span className="normal-case tracking-normal text-gray-300">(optional)</span>
              </label>
              <input
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="e.g. TREASURY-V3"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-[12px] text-[#0a0a0a] placeholder:text-gray-400 focus:border-[#6D001A]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D001A]/10"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] leading-relaxed text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#0a0a0a] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#222]"
            >
              <Plus className="h-4 w-4" />
              Add to watchlist
            </button>
          </form>

          <p className="mt-4 border-t border-gray-100 pt-3 text-[10px] leading-relaxed text-gray-400">
            Monitoring is manual for now; each entry gives you a one-click re-scan. Automated
            re-scanning and alerts are on the roadmap.
          </p>
        </Panel>

        <Panel className="lg:col-span-2" padded={false}>
          <div className="flex items-center justify-between p-5 pb-3 sm:p-6 sm:pb-3">
            <div>
              <h2 className="font-display text-[15px] font-semibold text-[#0a0a0a]">Monitored contracts</h2>
              <p className="mt-0.5 text-xs text-gray-400">
                {items.length} address{items.length === 1 ? '' : 'es'}
              </p>
            </div>
          </div>

          {items.length === 0 ? (
            <EmptyState
              compact
              icon={<Eye className="h-5 w-5" />}
              title="No contracts monitored"
              description="Add an address to keep it within reach for quick risk re-checks."
            />
          ) : (
            <ul className="divide-y divide-gray-50 border-t border-gray-100">
              {items.map((item) => (
                <li key={item.address} className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                    <Eye className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-[#0a0a0a]">{item.label}</p>
                    <p className="truncate font-mono text-[11px] text-gray-400">
                      {item.address.slice(0, 18)}…{item.address.slice(-6)}
                    </p>
                  </div>
                  <span className="hidden shrink-0 text-[11px] text-gray-400 sm:block">
                    Added{' '}
                    {new Date(item.addedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <Link
                    to={`/scan?address=${item.address}`}
                    className="shrink-0 rounded-lg border border-gray-200 px-2.5 py-1.5 text-[11px] font-medium text-gray-600 transition-colors hover:border-[#6D001A]/30 hover:text-[#6D001A]"
                  >
                    Scan
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(item.address)}
                    className="shrink-0 rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label={`Remove ${item.label}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
