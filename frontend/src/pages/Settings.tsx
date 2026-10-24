import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Check, KeyRound, LogOut, Mail, ShieldCheck, Trash2, User } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { PageHeader, Panel } from '../components/app/ui';

type Tab = 'profile' | 'security' | 'notifications' | 'account';

const NOTIFY_KEY = 'sentinelx:notify:v1';

interface NotifyPrefs {
  scanComplete: boolean;
  criticalRisk: boolean;
  productUpdates: boolean;
}

const DEFAULT_PREFS: NotifyPrefs = {
  scanComplete: true,
  criticalRisk: true,
  productUpdates: false,
};

function loadPrefs(): NotifyPrefs {
  try {
    const raw = localStorage.getItem(NOTIFY_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function Settings() {
  const { user, isConfigured, updateProfile, sendPasswordReset, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [name, setName] = useState('');
  const [profileState, setProfileState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [profileError, setProfileError] = useState('');
  const [resetState, setResetState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resetMessage, setResetMessage] = useState('');
  const [prefs, setPrefs] = useState<NotifyPrefs>(DEFAULT_PREFS);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    const meta = user?.user_metadata as { name?: string } | undefined;
    setName(meta?.name || '');
  }, [user]);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  const saveProfile = async () => {
    setProfileState('saving');
    setProfileError('');
    const { error } = await updateProfile({ name: name.trim() });
    if (error) {
      setProfileState('error');
      setProfileError(error);
      return;
    }
    setProfileState('saved');
    setTimeout(() => setProfileState('idle'), 2500);
  };

  const requestPasswordReset = async () => {
    setResetState('sending');
    setResetMessage('');
    const { error } = await sendPasswordReset(user?.email || '');
    if (error) {
      setResetState('error');
      setResetMessage(error);
      return;
    }
    setResetState('sent');
    setResetMessage(`Reset link sent to ${user?.email || 'your inbox'}.`);
  };

  const togglePref = (key: keyof NotifyPrefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    try {
      localStorage.setItem(NOTIFY_KEY, JSON.stringify(next));
    } catch {
      /* ignore storage failures */
    }
  };

  const providers = (user?.identities || []).map((identity) => identity.provider);
  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: KeyRound },
    { id: 'notifications', label: 'Notifications', icon: Mail },
    { id: 'account', label: 'Account', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Manage your identity, security and notification preferences."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-1.5 lg:flex-col lg:overflow-visible">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#6D001A]/[0.06] font-semibold text-[#6D001A]'
                  : 'font-medium text-gray-500 hover:bg-gray-50 hover:text-[#0a0a0a]'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          {activeTab === 'profile' && (
            <Panel>
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0a0a0a] text-sm font-semibold text-white">
                  {(name || user?.email || 'SX').slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <h2 className="font-display text-[15px] font-semibold text-[#0a0a0a]">Profile</h2>
                  <p className="text-xs text-gray-400">How you appear inside the workspace.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-gray-400">
                    Display name
                  </label>
                  <input
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setProfileState('idle');
                    }}
                    placeholder="Your name"
                    className="w-full max-w-md rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-[#0a0a0a] placeholder:text-gray-400 focus:border-[#6D001A]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D001A]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-gray-400">
                    Email
                  </label>
                  <input
                    value={user?.email || ''}
                    disabled
                    className="w-full max-w-md cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-3.5 py-2.5 text-sm text-gray-400"
                  />
                  <p className="mt-1 text-[11px] text-gray-400">
                    Email changes are handled through your identity provider.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-gray-400">
                    Plan
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#6D001A]/15 bg-[#6D001A]/[0.06] px-3 py-1 text-xs font-semibold text-[#6D001A]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Free
                    </span>
                    <Link to="/billing" className="text-xs font-medium text-[#6D001A] hover:underline">
                      View usage
                    </Link>
                  </div>
                </div>

                {profileState === 'error' && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-600">
                    {profileError}
                  </p>
                )}

                <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={saveProfile}
                    disabled={!isConfigured || profileState === 'saving' || !name.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#6D001A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#8B0023] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {profileState === 'saving' ? 'Saving…' : 'Save changes'}
                  </button>
                  {profileState === 'saved' && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <Check className="h-3.5 w-3.5" />
                      Profile updated
                    </span>
                  )}
                  {!isConfigured && (
                    <span className="text-[11px] text-gray-400">
                      Sign-in is not configured in this environment.
                    </span>
                  )}
                </div>
              </div>
            </Panel>
          )}

          {activeTab === 'security' && (
            <>
              <Panel>
                <h2 className="font-display text-[15px] font-semibold text-[#0a0a0a]">Password</h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  We email a secure reset link. No password is stored in this app.
                </p>
                <button
                  type="button"
                  onClick={requestPasswordReset}
                  disabled={!isConfigured || resetState === 'sending'}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:text-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <KeyRound className="h-4 w-4" />
                  {resetState === 'sending' ? 'Sending…' : 'Send password reset link'}
                </button>
                {resetState === 'sent' && (
                  <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
                    {resetMessage}
                  </p>
                )}
                {resetState === 'error' && (
                  <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-600">
                    {resetMessage}
                  </p>
                )}
              </Panel>

              <Panel>
                <h2 className="font-display text-[15px] font-semibold text-[#0a0a0a]">Connected accounts</h2>
                <p className="mt-0.5 text-xs text-gray-400">Sign-in methods linked to this profile.</p>
                <div className="mt-4 space-y-2">
                  {['google', 'github', 'email'].map((provider) => {
                    const connected = provider === 'email' ? !providers.length || providers.includes('email') : providers.includes(provider);
                    return (
                      <div
                        key={provider}
                        className="flex items-center justify-between rounded-xl border border-gray-100 px-3.5 py-2.5"
                      >
                        <span className="text-[13px] capitalize text-gray-700">{provider}</span>
                        <span
                          className={`font-mono text-[10px] uppercase tracking-wider ${
                            connected ? 'text-emerald-600' : 'text-gray-300'
                          }`}
                        >
                          {connected ? 'Connected' : 'Not linked'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            </>
          )}

          {activeTab === 'notifications' && (
            <Panel>
              <h2 className="font-display text-[15px] font-semibold text-[#0a0a0a]">Notifications</h2>
              <p className="mt-0.5 text-xs text-gray-400">
                Stored on this device. Delivery channels are not enabled yet.
              </p>
              <div className="mt-4 divide-y divide-gray-50">
                {[
                  { key: 'scanComplete' as const, label: 'Scan completed', desc: 'Confirm when an analysis finishes' },
                  { key: 'criticalRisk' as const, label: 'Critical risk detected', desc: 'Flag contracts scoring above 80' },
                  { key: 'productUpdates' as const, label: 'Product updates', desc: 'New features and model releases' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex cursor-pointer items-center justify-between gap-4 py-3.5"
                  >
                    <span>
                      <span className="block text-[13px] text-[#0a0a0a]">{item.label}</span>
                      <span className="block text-[11px] text-gray-400">{item.desc}</span>
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs[item.key]}
                      onClick={() => togglePref(item.key)}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                        prefs[item.key] ? 'bg-[#6D001A]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                          prefs[item.key] ? 'left-1 translate-x-5' : 'left-1 translate-x-0'
                        }`}
                      />
                    </button>
                  </label>
                ))}
              </div>
            </Panel>
          )}

          {activeTab === 'account' && (
            <>
              <Panel>
                <h2 className="font-display text-[15px] font-semibold text-[#0a0a0a]">Session</h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  Signing out clears this device's session and syncs no further scans.
                </p>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:text-[#0a0a0a]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </Panel>

              <Panel className="border-red-200">
                <h2 className="font-display text-[15px] font-semibold text-red-600">Danger zone</h2>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                  Deleting an account removes the profile and all stored analyses. This action cannot
                  be undone. Account deletion is processed manually by our team so we can verify
                  ownership.
                </p>
                {!showDelete ? (
                  <button
                    type="button"
                    onClick={() => setShowDelete(true)}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Request account deletion
                  </button>
                ) : (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50/60 p-4">
                    <p className="text-xs font-semibold text-red-600">
                      Email us from {user?.email || 'your account address'} to confirm.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={`mailto:support@sentinelx.site?subject=${encodeURIComponent(
                          'Account deletion request'
                        )}&body=${encodeURIComponent(
                          `Please delete the SentinelX account for ${user?.email || ''}.`
                        )}`}
                        className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                      >
                        Open email request
                      </a>
                      <button
                        type="button"
                        onClick={() => setShowDelete(false)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </Panel>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
