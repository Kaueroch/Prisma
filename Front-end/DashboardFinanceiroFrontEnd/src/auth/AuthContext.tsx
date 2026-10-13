/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useState, useEffect, useMemo, ReactNode, useContext } from 'react';
import { isTokenValid } from '../shared/utils/token';

interface User {
  email: string;
  name: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<string | null>;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'prisma_auth_user';
const TOKEN_STORAGE_KEY = 'prisma_auth_token';
const WELCOME_FLAG_KEY = 'prisma_auth_show_welcome';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

function clearStoredSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

// Clear local finance data and the welcome flag so the next
// user on the same browser does not see the previous user data.
function clearLocalFinanceData() {
  localStorage.removeItem('finance_dashboard_expenses');
  localStorage.removeItem('finance_dashboard_categories');
  localStorage.removeItem(WELCOME_FLAG_KEY);
}

function readStoredUser(): User | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as User;
    const token = localStorage.getItem(TOKEN_STORAGE_KEY) || parsed.token;
    if (!isTokenValid(token)) {
      clearStoredSession();
      return null;
    }
    return parsed;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(readStoredUser);

  // Persist current user session
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  // Route guard: revalidate the token periodically to drop tokens
  // that are expired/invalid even with the tab open.
  useEffect(() => {
    const check = () => {
      setUser((prev) => {
        if (!prev) return prev;
        const token = localStorage.getItem(TOKEN_STORAGE_KEY) || prev.token;
        if (!isTokenValid(token)) {
          clearStoredSession();
          return null;
        }
        return prev;
      });
    };
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const response = await fetch(`${API_URL}/api/v1/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password })
      });

      if (!response.ok) {
        const message = await response.text();
        return message || 'Could not sign in.';
      }

      const data = await response.json();

      if (!data.token) return 'Could not sign in.';

      // Save the backend token
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);

      // Clear all local finance data to start with an empty dashboard
      localStorage.removeItem('finance_dashboard_expenses');
      localStorage.removeItem('finance_dashboard_categories');

      // Flag the welcome popup to show after reload
      localStorage.setItem(WELCOME_FLAG_KEY, 'true');

      // Set the user (this already updates the name up in the header)
      setUser({ email, name: data.nome ?? email, token: data.token });

      // Reload the page so FinanceContext mounts with cleared localStorage
      window.location.href = '/';
      return null;
    } catch (error) {
      console.error("Sign-in error:", error);
      return 'Could not reach the server.';
    }
  };

  const register = async (name: string, email: string, password: string): Promise<string | null> => {
    try {
      const response = await fetch(`${API_URL}/api/v1/user/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: name, email, senha: password })
      });

      if (!response.ok) {
        const message = await response.text();
        return message || 'Could not create the account.';
      }

      return null;
    } catch (error) {
      console.error("Sign-up error:", error);
      return 'Could not reach the server.';
    }
  };

  // Sign out: clear the token and local finance data and go straight
  // to the sign-in screen. The reload ensures FinanceProvider remounts empty.
  const logout = () => {
    clearStoredSession();
    clearLocalFinanceData();
    window.location.hash = '#/login';
    window.location.reload();
  };

  const value = useMemo(() => ({ user, login, register, logout }), [user]);

  return (
    <AuthContext.Provider value={value}>
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
