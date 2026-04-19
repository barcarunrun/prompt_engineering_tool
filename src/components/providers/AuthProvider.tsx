'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User, AuthContextType } from '@/types/auth';

const STORAGE_KEY = 'prompt_tool_auth_user';

const MOCK_USER: User = {
  id: '1',
  name: 'テストユーザー',
  email: 'test@example.com',
  role: 'admin',
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    // モック認証: 少し遅延をシミュレート
    await new Promise((resolve) => setTimeout(resolve, 800));

    const loggedInUser: User = {
      ...MOCK_USER,
      email,
    };
    setUser(loggedInUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
