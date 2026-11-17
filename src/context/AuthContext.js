import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, endpoints } from '../api/client';

const AuthContext = createContext(null);
const TOKEN_KEY = 'fintrack_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return undefined;
    }
    api
      .get(endpoints.auth.me)
      .then(({ data }) => active && setUser(data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('fintrack:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('fintrack:unauthorized', handleUnauthorized);
  }, []);

  const persist = useCallback((data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post(endpoints.auth.login, { email, password });
    return persist(data);
  }, [persist]);

  const register = useCallback(async (payload) => {
    const { data } = await api.post(endpoints.auth.register, payload);
    return persist(data);
  }, [persist]);

  const logout = useCallback(async () => {
    try {
      await api.post(endpoints.auth.logout);
    } catch (error) {
      // Clear local session regardless of network state.
    }
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const setCurrentUser = useCallback((next) => setUser(next), []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, setCurrentUser, isAuthenticated: Boolean(user) }),
    [user, loading, login, register, logout, setCurrentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
