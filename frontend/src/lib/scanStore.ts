// SentinelX — local scan store
// Persists analysed contracts per account so the dashboard, history table and
// billing usage all read the same source of truth.
//
// Storage is scoped by Supabase user id (or "guest" when signed out) and kept
// in localStorage. Swapping this module for a Supabase table later only
// requires changing the read/write helpers below.

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './auth';

export type RiskBand = 'Low' | 'Medium' | 'High' | 'Critical';

export interface ScanFlag {
  name: string;
  severity: string;
}

export interface ScanRecord {
  id: string;
  contract: string;
  inputMode: 'address' | 'solidity';
  riskScore: number;
  riskLevel: RiskBand;
  flags: ScanFlag[];
  model: string;
  features: number;
  responseTime: string;
  aiAssessment: string;
  createdAt: string;
}

export interface WatchItem {
  address: string;
  label: string;
  addedAt: string;
}

export interface ScanStats {
  total: number;
  highRisk: number;
  averageRisk: number;
  last7Days: number;
  last30Days: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  trend: { date: string; label: string; scans: number }[];
  topFlag: { name: string; count: number } | null;
}

const SCANS_PREFIX = 'sentinelx:scans:v1';
const WATCHLIST_PREFIX = 'sentinelx:watchlist:v1';
const UPDATE_EVENT = 'sentinelx:store-update';
const MAX_RECORDS = 250;
const GUEST_SCOPE = 'guest';

const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(UPDATE_EVENT));
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or private-mode failure — the UI keeps working from memory.
  }
}

const scansKey = (scope: string) => `${SCANS_PREFIX}:${scope}`;
const watchKey = (scope: string) => `${WATCHLIST_PREFIX}:${scope}`;

export function loadScans(scope: string): ScanRecord[] {
  return read<ScanRecord[]>(scansKey(scope), []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Insert a scan, dropping duplicates of the same contract+runs. */
export function addScan(scope: string, record: ScanRecord): ScanRecord[] {
  const existing = loadScans(scope);
  if (existing.some((item) => item.id === record.id)) return existing;
  const next = [record, ...existing].slice(0, MAX_RECORDS);
  write(scansKey(scope), next);
  emit();
  return next;
}

export function deleteScan(scope: string, id: string): ScanRecord[] {
  const next = loadScans(scope).filter((item) => item.id !== id);
  write(scansKey(scope), next);
  emit();
  return next;
}

export function clearScans(scope: string): void {
  write(scansKey(scope), []);
  emit();
}

/** Move anonymous scans into the signed-in account on first load. */
export function adoptGuestScans(scope: string): void {
  if (scope === GUEST_SCOPE) return;
  const guestScans = loadScans(GUEST_SCOPE);
  if (guestScans.length === 0) return;
  const owned = loadScans(scope);
  const known = new Set(owned.map((item) => item.id));
  const merged = [...owned, ...guestScans.filter((item) => !known.has(item.id))]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MAX_RECORDS);
  write(scansKey(scope), merged);
  write(scansKey(GUEST_SCOPE), []);
  emit();
}

export function loadWatchlist(scope: string): WatchItem[] {
  return read<WatchItem[]>(watchKey(scope), []).sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  );
}

export function addWatchItem(scope: string, item: WatchItem): WatchItem[] {
  const existing = loadWatchlist(scope);
  if (existing.some((entry) => entry.address.toLowerCase() === item.address.toLowerCase())) {
    return existing;
  }
  const next = [item, ...existing];
  write(watchKey(scope), next);
  emit();
  return next;
}

export function removeWatchItem(scope: string, address: string): WatchItem[] {
  const next = loadWatchlist(scope).filter(
    (item) => item.address.toLowerCase() !== address.toLowerCase()
  );
  write(watchKey(scope), next);
  emit();
  return next;
}

export function normalizeRiskLevel(level: string | undefined, score: number): RiskBand {
  const value = (level || '').toLowerCase();
  if (value.startsWith('crit')) return 'Critical';
  if (value.startsWith('high')) return 'High';
  if (value.startsWith('med')) return 'Medium';
  if (value.startsWith('low') || value.startsWith('safe')) return 'Low';
  if (score > 80) return 'Critical';
  if (score > 60) return 'High';
  if (score > 30) return 'Medium';
  return 'Low';
}

export function riskTone(level: RiskBand | string): {
  text: string;
  bg: string;
  border: string;
  dot: string;
  hex: string;
} {
  switch (level) {
    case 'Critical':
      return { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', hex: '#dc2626' };
    case 'High':
      return { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500', hex: '#ea580c' };
    case 'Medium':
      return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', hex: '#d97706' };
    default:
      return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', hex: '#059669' };
  }
}

export function computeStats(scans: ScanRecord[]): ScanStats {
  const now = Date.now();
  const day = 86_400_000;
  const total = scans.length;
  const sum = scans.reduce((acc, scan) => acc + scan.riskScore, 0);

  const buckets = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  const flagCounts = new Map<string, number>();

  for (const scan of scans) {
    buckets[scan.riskLevel] = (buckets[scan.riskLevel] || 0) + 1;
    for (const flag of scan.flags) {
      flagCounts.set(flag.name, (flagCounts.get(flag.name) || 0) + 1);
    }
  }

  const trend: ScanStats['trend'] = [];
  for (let offset = 13; offset >= 0; offset -= 1) {
    const start = new Date(now - offset * day);
    start.setHours(0, 0, 0, 0);
    const end = start.getTime() + day;
    const count = scans.filter((scan) => {
      const time = new Date(scan.createdAt).getTime();
      return time >= start.getTime() && time < end;
    }).length;
    trend.push({
      date: start.toISOString(),
      label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      scans: count,
    });
  }

  let topFlag: ScanStats['topFlag'] = null;
  for (const [name, count] of flagCounts.entries()) {
    if (!topFlag || count > topFlag.count) topFlag = { name, count };
  }

  return {
    total,
    highRisk: buckets.Critical + buckets.High,
    averageRisk: total === 0 ? 0 : Math.round(sum / total),
    last7Days: scans.filter((scan) => new Date(scan.createdAt).getTime() >= now - 7 * day).length,
    last30Days: scans.filter((scan) => new Date(scan.createdAt).getTime() >= now - 30 * day).length,
    critical: buckets.Critical,
    high: buckets.High,
    medium: buckets.Medium,
    low: buckets.Low,
    trend,
    topFlag,
  };
}

function useScope(): string {
  const { user } = useAuth();
  return user?.id || GUEST_SCOPE;
}

export function useScans() {
  const scope = useScope();
  const [scans, setScans] = useState<ScanRecord[]>(() => loadScans(scope));

  useEffect(() => {
    setScans(loadScans(scope));
    const refresh = () => setScans(loadScans(scope));
    listeners.add(refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener(UPDATE_EVENT, refresh);
    return () => {
      listeners.delete(refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener(UPDATE_EVENT, refresh);
    };
  }, [scope]);

  const stats = useMemo(() => computeStats(scans), [scans]);

  return {
    scope,
    scans,
    stats,
    remove: (id: string) => setScans(deleteScan(scope, id)),
    clear: () => {
      clearScans(scope);
      setScans([]);
    },
  };
}

export function useWatchlist() {
  const scope = useScope();
  const [items, setItems] = useState<WatchItem[]>(() => loadWatchlist(scope));

  useEffect(() => {
    setItems(loadWatchlist(scope));
    const refresh = () => setItems(loadWatchlist(scope));
    listeners.add(refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener(UPDATE_EVENT, refresh);
    return () => {
      listeners.delete(refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener(UPDATE_EVENT, refresh);
    };
  }, [scope]);

  return {
    scope,
    items,
    add: (item: WatchItem) => setItems(addWatchItem(scope, item)),
    remove: (address: string) => setItems(removeWatchItem(scope, address)),
  };
}

/** Compute the busiest-hours summary used by the dashboard footer. */
export function lastScanAt(scans: ScanRecord[]): string | null {
  return scans.length > 0 ? scans[0].createdAt : null;
}
