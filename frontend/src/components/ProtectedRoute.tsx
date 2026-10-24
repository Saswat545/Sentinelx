import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isConfigured } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F6F7]">
        <div className="flex flex-col items-center gap-3">
          <span className="flex h-11 w-11 animate-pulse items-center justify-center rounded-xl border border-[#6D001A]/15 bg-[#6D001A]/[0.06]">
            <svg className="h-5 w-5 text-[#6D001A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </span>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-gray-400">
            Verifying session…
          </p>
        </div>
      </div>
    );
  }

  // If Supabase is not configured, allow access (local development)
  if (!isConfigured) {
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
