import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearLegacyTokens } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    clearLegacyTokens();
    api('/api/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  const register = useCallback(async (body, remember = true) => {
    const payload = await api('/api/auth/register', { method: 'POST', body: { ...body, remember } });
    setUser(payload.user);
    return payload.user;
  }, []);

  const login = useCallback(async (body, remember = true) => {
    const payload = await api('/api/auth/login', { method: 'POST', body: { ...body, remember } });
    setUser(payload.user);
    return payload.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch {
      /* still clear the local session */
    }
    setUser(null);
  }, []);

  const completeSession = useCallback(async () => {
    const data = await api('/api/auth/me');
    setUser(data.user);
    return data.user;
  }, []);

  const refreshUser = useCallback(async () => {
    const data = await api('/api/auth/me');
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo(
    () => ({ user, ready, register, login, logout, refreshUser, completeSession, setUser }),
    [user, ready, register, login, logout, refreshUser, completeSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
