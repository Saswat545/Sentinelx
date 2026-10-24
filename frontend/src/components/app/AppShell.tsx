import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronRight,
  CreditCard,
  Eye,
  History as HistoryIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { adoptGuestScans, useScans } from '../../lib/scanStore';

const PAGE_META: Record<string, { title: string; crumb: string }> = {
  '/dashboard': { title: 'Overview', crumb: 'Overview' },
  '/history': { title: 'Scan History', crumb: 'History' },
  '/watchlist': { title: 'Watchlist', crumb: 'Watchlist' },
  '/billing': { title: 'Billing & Usage', crumb: 'Billing' },
  '/settings': { title: 'Settings', crumb: 'Settings' },
  '/scan': { title: 'Contract Scanner', crumb: 'Scanner' },
  '/results': { title: 'Analysis Result', crumb: 'Results' },
};

const PRIMARY_NAV = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/history', label: 'Scan History', icon: HistoryIcon },
  { to: '/watchlist', label: 'Watchlist', icon: Eye },
];

const SECONDARY_NAV = [
  { to: '/billing', label: 'Billing & Usage', icon: CreditCard },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

function initialsFor(name?: string | null, email?: string | null): string {
  const source = (name || email || '').trim();
  if (!source) return 'SX';
  const parts = source.replace(/@.*/, '').split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return 'SX';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function NavItem({
  to,
  label,
  icon: Icon,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
          isActive
            ? 'bg-[#6D001A]/[0.06] font-semibold text-[#6D001A]'
            : 'font-medium text-gray-600 hover:bg-gray-100 hover:text-[#0a0a0a]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[#6D001A]" />
          )}
          <Icon
            className={`h-[18px] w-[18px] shrink-0 transition-colors ${
              isActive ? 'text-[#6D001A]' : 'text-gray-400 group-hover:text-gray-600'
            }`}
          />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const { stats } = useScans();
  const meta = user?.user_metadata as { name?: string } | undefined;
  const displayName =
    meta?.name || (user?.email ? user.email.split('@')[0] : 'Signed out');
  const email = user?.email || 'Not signed in';

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
        <Link to="/" className="flex items-center gap-2.5" onClick={onNavigate}>
          <img
            src="/brand/dark/Icon mark.png"
            alt=""
            className="h-7 w-7 object-contain"
            onError={(event) => {
              (event.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span className="font-display text-[15px] font-semibold tracking-tight text-[#0a0a0a]">
            Sentinel<span className="text-[#6D001A]">X</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={onNavigate}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-gray-400">
          Workspace
        </p>
        <nav className="space-y-1">
          {PRIMARY_NAV.map((item) => (
            <NavItem key={item.to} {...item} onNavigate={onNavigate} />
          ))}
        </nav>

        <p className="px-3 pb-2 pt-6 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-gray-400">
          Account
        </p>
        <nav className="space-y-1">
          {SECONDARY_NAV.map((item) => (
            <NavItem key={item.to} {...item} onNavigate={onNavigate} />
          ))}
        </nav>

        {/* Scanner CTA */}
        <div className="mt-6 rounded-2xl border border-[#6D001A]/10 bg-gradient-to-br from-[#6D001A]/[0.06] via-white to-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#6D001A]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6D001A]">
              Scanner
            </span>
          </div>
          <p className="text-[13px] leading-snug text-gray-600">
            Analyse any contract address or Solidity source in under 3 seconds.
          </p>
          <Link
            to="/scan"
            onClick={onNavigate}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#6D001A] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#8B0023]"
          >
            <Plus className="h-3.5 w-3.5" />
            New scan
          </Link>
        </div>
      </div>

      {/* Footer: usage + account */}
      <div className="border-t border-gray-100 p-3">
        <div className="mb-3 rounded-xl bg-gray-50 px-3 py-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-mono uppercase tracking-wider text-gray-400">This month</span>
            <span className="font-semibold text-[#0a0a0a]">{stats.last30Days} scans</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-[#6D001A] transition-all duration-500"
              style={{ width: `${Math.min(100, (stats.last30Days / 50) * 100)}%` }}
            />
          </div>
          <Link
            to="/billing"
            onClick={onNavigate}
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#6D001A] hover:underline"
          >
            View usage
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <Link
          to="/settings"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-gray-100"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a] text-[11px] font-semibold text-white">
            {initialsFor(meta?.name, user?.email)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold text-[#0a0a0a]">
              {displayName}
            </span>
            <span className="block truncate text-[11px] text-gray-400">{email}</span>
          </span>
        </Link>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { stats } = useScans();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const meta = PAGE_META[location.pathname] || { title: 'Workspace', crumb: 'Workspace' };
  const userMeta = user?.user_metadata as { name?: string } | undefined;

  // Anyone who scanned while signed out keeps those results after signing in.
  useEffect(() => {
    if (user?.id) adoptGuestScans(user.id);
  }, [user?.id]);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/history?q=${encodeURIComponent(trimmed)}` : '/history');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F6F6F7] text-[#0a0a0a]">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 z-50 w-[272px] border-r border-gray-200 bg-white transition-[left] duration-300 ease-out lg:left-0 ${
          mobileOpen ? 'left-0' : '-left-[272px]'
        }`}
      >
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </aside>

      {/* Content column */}
      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden min-w-0 items-center gap-1.5 text-sm sm:flex">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-gray-400">
                Workspace
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
              <span className="truncate font-semibold text-[#0a0a0a]">{meta.crumb}</span>
            </div>

            <span className="truncate font-semibold text-[#0a0a0a] sm:hidden">{meta.title}</span>

            <div className="ml-auto flex items-center gap-2">
              <form onSubmit={submitSearch} className="hidden md:block">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search contracts…"
                    className="w-56 rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-[#0a0a0a] placeholder:text-gray-400 transition-all focus:w-72 focus:border-[#6D001A]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D001A]/10"
                  />
                </div>
              </form>

              <Link
                to="/scan"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#6D001A] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#8B0023]"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New scan</span>
              </Link>

              <Link
                to="/watchlist"
                className="relative hidden rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 sm:block"
                aria-label="Watchlist"
              >
                <Bell className="h-[18px] w-[18px]" />
                {stats.highRisk > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#6D001A]" />
                )}
              </Link>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a0a0a] text-[11px] font-semibold text-white transition-opacity hover:opacity-90"
                  aria-label="Account menu"
                  aria-expanded={menuOpen}
                >
                  {initialsFor(userMeta?.name, user?.email)}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-11 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-black/5">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-[#0a0a0a]">
                        {userMeta?.name || (user?.email ? user.email.split('@')[0] : 'Guest session')}
                      </p>
                      <p className="truncate text-xs text-gray-400">{user?.email || 'Not signed in'}</p>
                    </div>
                    <div className="p-1.5">
                      <Link
                        to="/settings"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#0a0a0a]"
                      >
                        <SettingsIcon className="h-4 w-4 text-gray-400" />
                        Account settings
                      </Link>
                      <Link
                        to="/billing"
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#0a0a0a]"
                      >
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        Billing & usage
                      </Link>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#0a0a0a]"
                      >
                        <LogOut className="h-4 w-4 text-gray-400" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>

        <footer className="mx-auto w-full max-w-[1400px] px-4 pb-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-2 border-t border-gray-200 pt-4 text-[11px] text-gray-400 sm:flex-row sm:items-center">
            <span className="font-mono uppercase tracking-wider">
              SentinelX · {meta.title}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              XGBoost v2.4 · 53 feature AST
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default AppShell;
