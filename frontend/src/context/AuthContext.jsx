import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { getStoredUser, clearSession, saveSession } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.getMe();
      const u = { id: me.id, fullName: me.fullName, email: me.email, role: me.role, isVerified: me.isVerified };
      setUser(u);
      localStorage.setItem('user', JSON.stringify(u));
    } catch (_e) {
      clearSession();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const handleExpired = () => {
      clearSession();
      setUser(null);
    };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setUser({
      id: data.user.id,
      fullName: data.user.fullName,
      email: data.user.email,
      role: data.user.role,
      isVerified: data.user.isVerified,
    });
    return data;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, isAdmin, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
