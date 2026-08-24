import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth';

type Tab = 'profile' | 'security' | 'notifications' | 'account';

export function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { user, signOut, isConfigured } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'account', label: 'Account' },
  ];

  return (
    <div className="min-h-screen bg-white pt-28 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-display font-bold text-[#0a0a0a] mb-2">Settings</h1>
          <p className="text-gray-500 text-sm">Manage your account preferences.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-50 rounded-xl p-1 border border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#0a0a0a] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h2 className="font-display font-semibold text-[#0a0a0a] mb-6">Profile Information</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Name</label>
                <input
                  type="text"
                  defaultValue={user?.user_metadata?.name || ''}
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#0a0a0a] placeholder-gray-400 focus:outline-none focus:border-[#6D001A] focus:ring-1 focus:ring-[#6D001A]/20 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Plan</label>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-[#6D001A]/5 text-[#6D001A] border border-[#6D001A]/10 rounded-lg text-sm font-semibold">Free Tier</span>
                  <Link to="/pricing" className="text-sm text-[#6D001A] hover:underline font-medium">Upgrade</Link>
                </div>
              </div>
              <button className="px-6 py-2.5 bg-[#6D001A] hover:bg-[#8B0023] text-white font-semibold rounded-xl transition-all text-sm">
                Save Changes
              </button>
            </div>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h2 className="font-display font-semibold text-[#0a0a0a] mb-6">Password</h2>
              <button className="px-6 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold rounded-xl transition-all text-sm">
                Change Password
              </button>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h2 className="font-display font-semibold text-[#0a0a0a] mb-4">Connected Accounts</h2>
              <div className="space-y-3">
                {[
                  { name: 'Google', connected: false },
                  { name: 'GitHub', connected: false },
                ].map((account) => (
                  <div key={account.name} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <span className="text-gray-600 text-sm">{account.name}</span>
                    <button className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      account.connected
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                    }`}>
                      {account.connected ? 'Connected' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h2 className="font-display font-semibold text-[#0a0a0a] mb-6">Notification Preferences</h2>
            <div className="space-y-5">
              {[
                { label: 'Email notifications', desc: 'Receive email updates about your scans', default: false },
                { label: 'Security alerts', desc: 'Get notified about critical security findings', default: true },
                { label: 'Product updates', desc: 'Learn about new SentinelX features', default: false },
              ].map((item) => (
                <label key={item.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 cursor-pointer">
                  <div>
                    <span className="text-[#0a0a0a] text-sm block">{item.label}</span>
                    <span className="text-gray-400 text-xs">{item.desc}</span>
                  </div>
                  <input type="checkbox" defaultChecked={item.default} className="w-5 h-5 rounded border-gray-300 text-[#6D001A] focus:ring-[#6D001A]/30" />
                </label>
              ))}
            </div>
          </motion.div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 border border-red-200 shadow-sm">
            <h2 className="font-display font-semibold text-red-600 mb-4">Danger Zone</h2>
            <p className="text-gray-500 text-sm mb-6">
              Once you delete your account, all your data including scan history will be permanently removed. This action cannot be undone.
            </p>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm font-semibold transition-all duration-200"
              >
                Delete Account
              </button>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 border border-red-200">
                <p className="text-red-600 text-sm font-semibold mb-3">Are you absolutely sure?</p>
                <p className="text-gray-500 text-xs mb-4">This will permanently delete your account and all associated data.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-all">
                    Yes, Delete My Account
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
