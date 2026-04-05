import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as authApi from '../api/auth';
import { getProfile } from '../api/profile';
import { syncAll } from '../api/sync';

export interface AuthUser {
  userId: string;
  displayName: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoggedIn: boolean;
  aimlabsUsername: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (displayName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadProfile: () => Promise<string | null>;
}

function parseToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('auth_token');
      return null;
    }
    return { userId: payload.sub, displayName: payload.displayName, email: payload.email };
  } catch {
    return null;
  }
}

function loadUserFromStorage(): AuthUser | null {
  const token = localStorage.getItem('auth_token');
  return token ? parseToken(token) : null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUserFromStorage);
  const [aimlabsUsername, setAimlabsUsername] = useState<string | null>(null);

  const loadProfile = useCallback(async (): Promise<string | null> => {
    try {
      const profile = await getProfile();
      setAimlabsUsername(profile.aimlabs_username ?? null);
      if (profile.display_name) setUser(prev => prev ? { ...prev, displayName: profile.display_name } : prev);
      return profile.aimlabs_username ?? null;
    } catch {
      return null;
    }
  }, []);

  // Load profile on mount if logged in
  useEffect(() => {
    if (user) loadProfile();
  }, []);

  // Background sync polling every 10 minutes
  useEffect(() => {
    if (!user || !aimlabsUsername) return;
    const id = setInterval(() => { syncAll().catch(() => {}); }, 600_000);
    return () => clearInterval(id);
  }, [user?.userId, aimlabsUsername]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    localStorage.setItem('auth_token', res.token);
    setUser({ userId: res.user_id, displayName: res.display_name, email });
  }, []);

  const register = useCallback(async (displayName: string, email: string, password: string) => {
    const res = await authApi.register(displayName, email, password);
    localStorage.setItem('auth_token', res.token);
    setUser({ userId: res.user_id, displayName: res.display_name, email });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setAimlabsUsername(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isLoggedIn: user !== null, aimlabsUsername,
      login, register, logout, loadProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
