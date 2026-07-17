import { createContext, useContext, useMemo, useState } from 'react';
import api, { getStoredAuth, setStoredAuth } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getStoredAuth());

  // POST /api/auth/login → { token, expiresAt, user: { id, fullName, role } }
  async function login(email, password) {
    const { data } = await api.post('/api/auth/login', { email, password });
    const next = {
      token: data.token,
      expiresAt: data.expiresAt,
      user: data.user,
    };
    setStoredAuth(next);
    setAuth(next);
    return next;
  }

  function logout() {
    setStoredAuth(null);
    setAuth(null);
  }

  const value = useMemo(
    () => ({
      auth,
      user: auth?.user ?? null,
      role: auth?.user?.role ?? null,
      isAuthenticated: Boolean(auth?.token),
      login,
      logout,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
