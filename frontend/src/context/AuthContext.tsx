import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, confirmPassword?: string) => Promise<void>;
  logout: () => void;
  updateName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('livepoll_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('livepoll_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('livepoll_token');
      if (storedToken) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          localStorage.setItem('livepoll_user', JSON.stringify(profile));
        } catch (e) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('livepoll_token');
          localStorage.removeItem('livepoll_user');
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('livepoll_token', res.token);
    localStorage.setItem('livepoll_user', JSON.stringify(res.user));
  };

  const signup = async (name: string, email: string, password: string, confirmPassword?: string) => {
    const res = await api.signup({ name, email, password, confirmPassword });
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('livepoll_token', res.token);
    localStorage.setItem('livepoll_user', JSON.stringify(res.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('livepoll_token');
    localStorage.removeItem('livepoll_user');
  };

  const updateName = async (name: string) => {
    const updated = await api.updateProfile(name);
    setUser(updated);
    localStorage.setItem('livepoll_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
