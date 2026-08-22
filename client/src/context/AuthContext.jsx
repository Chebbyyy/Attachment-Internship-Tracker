import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setReady(true);
      return;
    }
    api('/api/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => {
        setToken(null);
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const applyAuth = useCallback((payload, remember = true) => {
    setToken(payload.token, remember);
    setUser(payload.user);
  }, []);

  const register = useCallback(
    async (body, remember = true) => {
      const payload = await api('/api/auth/register', { method: 'POST', body, token: null });
      applyAuth(payload, remember);
      return payload.user;
    },
    [applyAuth]
  );

  const login = useCallback(
    async (body, remember = true) => {
      const payload = await api('/api/auth/login', { method: 'POST', body, token: null });
      applyAuth(payload, remember);
      return payload.user;
    },
    [applyAuth]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const signInWithToken = useCallback(async (token, remember = true) => {
    setToken(token, remember);
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
    () => ({ user, ready, register, login, logout, refreshUser, signInWithToken, setUser }),
    [user, ready, register, login, logout, refreshUser, signInWithToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
