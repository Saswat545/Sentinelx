import React, { useState } from 'react';
import { ApiKeyItem, UserProfile } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  User, Key, Shield, CreditCard, Copy, Check, Plus, Trash2, Download
} from 'lucide-react';

interface SettingsScreenProps {
  user: UserProfile;
  apiKeys: ApiKeyItem[];
  onUpdateUser: (updated: UserProfile) => void;
  onCreateApiKey: (name: string) => void;
  onRevokeApiKey: (id: string) => void;
  onLogout?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  user,
  apiKeys,
  onUpdateUser,
  onCreateApiKey,
  onRevokeApiKey,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'apikeys' | 'security' | 'billing'>('profile');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Profile form state
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [company, setCompany] = useState(user.company || '');
  const [role, setRole] = useState(user.role);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ ...user, name, email, company, role });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleCopyKey = (key: ApiKeyItem) => {
    navigator.clipboard.writeText(key.fullKey || key.keyPrefix);
    setCopiedKeyId(key.id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleCreateKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    onCreateApiKey(newKeyName.trim());
    setNewKeyName('');
    setShowKeyModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#0B0F17] text-gray-100">
      
      {/* Title */}
      <div className="pb-6 border-b border-gray-800 font-mono">
        <h1 className="text-2xl font-bold text-white tracking-tight">Console & API Settings</h1>
        <p className="text-xs text-gray-400 mt-1">
          Manage developer credentials, REST API keys, security preferences, and subscription billing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Side Navigation */}
        <Card className="p-2 space-y-1 md:col-span-1 h-fit bg-[#111827] border-gray-800 font-mono">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded text-left transition-colors cursor-pointer ${
              activeTab === 'profile' ? 'bg-blue-900/40 text-blue-400 font-bold border border-blue-800/60' : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab('apikeys')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded text-left transition-colors cursor-pointer ${
              activeTab === 'apikeys' ? 'bg-blue-900/40 text-blue-400 font-bold border border-blue-800/60' : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>REST API Keys ({apiKeys.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded text-left transition-colors cursor-pointer ${
              activeTab === 'security' ? 'bg-blue-900/40 text-blue-400 font-bold border border-blue-800/60' : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security & 2FA</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded text-left transition-colors cursor-pointer ${
              activeTab === 'billing' ? 'bg-blue-900/40 text-blue-400 font-bold border border-blue-800/60' : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Billing</span>
          </button>
        </Card>

        {/* Right Content Panel */}
        <div className="md:col-span-3 space-y-6">
          
          {/* Tab 1: Profile */}
          {activeTab === 'profile' && (
            <Card className="p-6 bg-[#111827] border-gray-800">
              <CardHeader className="px-0 pt-0 font-mono">
                <CardTitle>Security Researcher Profile</CardTitle>
                <CardDescription className="text-gray-400">Update account credentials and organization role</CardDescription>
              </CardHeader>

              {saveSuccess && (
                <div className="mb-4 p-3 bg-emerald-950/60 text-emerald-400 border border-emerald-800 rounded text-xs flex items-center gap-2 font-mono">
                  <Check className="w-4 h-4" />
                  <span>Profile updated.</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2.5 border border-gray-800 rounded bg-[#0B0F17] text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2.5 border border-gray-800 rounded bg-[#0B0F17] text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Organization</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full p-2.5 border border-gray-800 rounded bg-[#0B0F17] text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Role Title</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full p-2.5 border border-gray-800 rounded bg-[#0B0F17] text-white"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                  {onLogout ? (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={onLogout}
                      className="text-red-400 border-red-800 hover:bg-red-950/40"
                    >
                      Sign Out
                    </Button>
                  ) : <div></div>}
                  <Button type="submit" variant="primary">Save Settings</Button>
                </div>
              </form>
            </Card>
          )}

          {/* Tab 2: API Keys */}
          {activeTab === 'apikeys' && (
            <Card className="p-6 space-y-6 bg-[#111827] border-gray-800">
              <div className="flex items-center justify-between pb-4 border-b border-gray-800 font-mono">
                <div>
                  <h3 className="text-base font-bold text-white">SentinelX API Keys</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Use secret tokens to authenticate automated scans via REST endpoints.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowKeyModal(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Generate Key
                </Button>
              </div>

              <div className="space-y-3 font-mono">
                {apiKeys.map((k) => (
                  <div key={k.id} className="p-4 bg-[#0B0F17] rounded-lg border border-gray-800 text-xs flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{k.name}</span>
                        <Badge variant="success" size="sm">{k.status}</Badge>
                      </div>
                      <p className="text-gray-400 text-[11px]">{k.keyPrefix}</p>
                      <p className="text-[10px] text-gray-500">Created {k.createdAt} • Used {k.lastUsedAt}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyKey(k)}
                        leftIcon={copiedKeyId === k.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      >
                        {copiedKeyId === k.id ? 'Copied' : 'Copy Key'}
                      </Button>
                      <button
                        onClick={() => onRevokeApiKey(k.id)}
                        className="p-2 text-gray-500 hover:text-red-400 rounded"
                        title="Revoke Token"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Tab 3: Security & 2FA */}
          {activeTab === 'security' && (
            <Card className="p-6 space-y-6 bg-[#111827] border-gray-800 font-mono">
              <div>
                <h3 className="text-base font-bold text-white">Two-Factor Authentication</h3>
                <p className="text-xs text-gray-400 mt-1">Protect your account with TOTP authenticator app multi-factor authentication.</p>
              </div>

              <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-lg text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-400 block">2FA Enabled</span>
                  <span className="text-emerald-300 text-[11px]">Hardware key backing active</span>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            </Card>
          )}

          {/* Tab 4: Billing */}
          {activeTab === 'billing' && (
            <Card className="p-6 space-y-6 bg-[#111827] border-gray-800 font-mono">
              <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                <div>
                  <h3 className="text-base font-bold text-white">Subscription & Invoices</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Pro Security Plan • $79/month</p>
                </div>
                <Badge variant="info">Active</Badge>
              </div>

              <div className="space-y-3 text-xs">
                <span className="font-bold text-gray-300 block">Recent Invoice</span>
                <div className="p-3 bg-[#0B0F17] rounded-lg border border-gray-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white">INV-2026-0701</span>
                    <span className="text-gray-500 block text-[11px]">July 1, 2026 • Pro Tier ($79.00)</span>
                  </div>
                  <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                    PDF Receipt
                  </Button>
                </div>
              </div>
            </Card>
          )}

        </div>

      </div>

      {/* New API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111827] rounded-xl max-w-md w-full p-6 space-y-4 border border-gray-800 shadow-2xl font-mono">
            <h3 className="font-bold text-white text-sm">Generate SentinelX REST API Key</h3>
            <form onSubmit={handleCreateKeySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Key Label Name</label>
                <input
                  type="text"
                  required
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Production Trading Bot Key"
                  className="w-full p-2.5 border border-gray-800 rounded bg-[#0B0F17] text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowKeyModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Generate Token</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
