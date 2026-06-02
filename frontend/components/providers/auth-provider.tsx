'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, getAuthToken, setAuthToken, logout as apiLogout, fetchWithAuth } from '@/lib/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (username: string, pass: string) => Promise<void>;
  register: (formData: any) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const profile = await fetchWithAuth('/auth/profile');
      if (profile) {
        setUser(profile);
      } else {
        apiLogout();
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      const isNetworkError =
        error instanceof TypeError ||
        (error instanceof Error && (
          error.message.includes('Failed to fetch') ||
          error.message.includes('fetch') ||
          error.message.includes('NetworkError')
        ));
      if (!isNetworkError) {
        apiLogout();
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (username: string, pass: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let msg = 'Failed to login';
        try {
          const json = JSON.parse(errorText);
          msg = json.message || msg;
        } catch (_) {}
        throw new Error(msg);
      }

      const data = await response.json();
      setAuthToken(data.access_token);
      setUser(data.user);
      router.push('/dashboard');
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: any) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let msg = 'Failed to register';
        try {
          const json = JSON.parse(errorText);
          msg = json.message || msg;
        } catch (_) {}
        throw new Error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    router.push('/login');
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
