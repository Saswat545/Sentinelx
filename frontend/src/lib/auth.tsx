import { createClient, Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/** 'online' means the auth endpoint answered; 'offline' means the request
    never reached it (DNS, CORS, or the project itself is down). */
export type AuthServiceStatus = 'checking' | 'online' | 'offline';

const UNREACHABLE = "The sign-in service is not responding. Try again in a moment.";

/** Supabase reports transport failures as "Failed to fetch" / AuthRetryableFetchError.
    Those mean the API host did not answer, not that the password was wrong. */
function normalizeAuthError(message?: string): string {
  if (!message) return 'Something went wrong. Try again.';
  const text = message.toLowerCase();

  if (
    text.includes('failed to fetch') ||
    text.includes('networkerror') ||
    text.includes('network error') ||
    text.includes('load failed') ||
    text.includes('fetch failed')
  ) {
    return UNREACHABLE;
  }
  if (text.includes('invalid login credentials')) {
    return 'Email or password is incorrect.';
  }
  if (text.includes('email not confirmed')) {
    return 'Confirm your email address before signing in.';
  }
  if (text.includes('rate limit') || text.includes('too many requests')) {
    return 'Too many attempts. Wait a minute and try again.';
  }
  if (text.includes('user already registered')) {
    return 'An account with this email already exists.';
  }
  if (text.includes('password should be at least')) {
    return 'Password is too short. Use at least 6 characters.';
  }
  return message;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  serviceStatus: AuthServiceStatus;
  checkService: () => Promise<AuthServiceStatus>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithGitHub: () => Promise<{ error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  updateProfile: (data: { name?: string }) => Promise<{ error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  serviceStatus: 'checking',
  checkService: async () => 'checking',
  signInWithGoogle: async () => ({}),
  signInWithGitHub: async () => ({}),
  signInWithEmail: async () => ({ error: 'Not configured' }),
  signUpWithEmail: async () => ({ error: 'Not configured' }),
  updateProfile: async () => ({ error: 'Not configured' }),
  sendPasswordReset: async () => ({ error: 'Not configured' }),
  signOut: async () => {},
  isConfigured: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [serviceStatus, setServiceStatus] = useState<AuthServiceStatus>('checking');

  const checkService = useCallback(async (): Promise<AuthServiceStatus> => {
    if (!supabase) {
      setServiceStatus('offline');
      return 'offline';
    }

    setServiceStatus('checking');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
        headers: { apikey: supabaseAnonKey },
        signal: controller.signal,
      });
      const next = response.ok ? 'online' : 'offline';
      setServiceStatus(next);
      return next;
    } catch {
      setServiceStatus('offline');
      return 'offline';
    } finally {
      clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setServiceStatus('offline');
      return;
    }

    void checkService();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkService]);

  const oauthRedirect = () =>
    import.meta.env.VITE_AUTH_REDIRECT_URL || `${window.location.origin}/dashboard`;

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return { error: 'Sign-in is not configured for this deployment.' };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: oauthRedirect() },
    });
    return { error: error ? normalizeAuthError(error.message) : undefined };
  }, []);

  const signInWithGitHub = useCallback(async () => {
    if (!supabase) return { error: 'Sign-in is not configured for this deployment.' };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: oauthRedirect() },
    });
    return { error: error ? normalizeAuthError(error.message) : undefined };
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Sign-in is not configured for this deployment.' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setServiceStatus(error.message.includes('Failed to fetch') ? 'offline' : 'online');
    return { error: error ? normalizeAuthError(error.message) : undefined };
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, name: string) => {
    if (!supabase) return { error: 'Sign-up is not configured for this deployment.' };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    return { error: error ? normalizeAuthError(error.message) : undefined };
  }, []);

  const updateProfile = useCallback(async (data: { name?: string }) => {
    if (!supabase) return { error: 'Sign-in is not configured for this deployment.' };
    const { error } = await supabase.auth.updateUser({ data });
    return { error: error ? normalizeAuthError(error.message) : undefined };
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    if (!supabase) return { error: 'Sign-in is not configured for this deployment.' };
    if (!email) return { error: 'No email address on this account' };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error ? normalizeAuthError(error.message) : undefined };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      serviceStatus,
      checkService,
      signInWithGoogle,
      signInWithGitHub,
      signInWithEmail,
      signUpWithEmail,
      updateProfile,
      sendPasswordReset,
      signOut,
      isConfigured: !!supabase,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
