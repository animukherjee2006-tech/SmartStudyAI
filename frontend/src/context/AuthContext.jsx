import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';
import { setToken, clearToken, restoreToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    notifications: { emailDigest: true, studyReminders: true, quizAlerts: true },
    theme: 'academic_cream',
    dailyGoal: 5,
  });
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      // Restore token from sessionStorage before calling getMe
      restoreToken();
      const data = await authApi.getMe();
      setUser(data.user);
      if (data.settings) {
        setSettings(data.settings);
      }
      return data.user;
    } catch {
      setUser(null);
      clearToken();
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    if (data.token) {
      setToken(data.token);
    }
    setUser(data.user);
    await refreshUser();
    return data;
  };

  const register = async (payload) => {
    const data = await authApi.register(payload);
    if (data.token) {
      setToken(data.token);
    }
    setUser(data.user);
    await refreshUser();
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      clearToken();
      setSettings({
        notifications: { emailDigest: true, studyReminders: true, quizAlerts: true },
        theme: 'academic_cream',
        dailyGoal: 5,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        settings,
        setSettings,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
