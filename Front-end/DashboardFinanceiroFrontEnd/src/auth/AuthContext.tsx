/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useState, useEffect, useMemo, ReactNode, useContext } from 'react';

interface User {
  email: string;
  name: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'prisma_auth_user';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// TODO: Altere esta URL para a URL real da sua API quando o back-end estiver pronto
const API_URL = 'http://localhost:3333';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Persist current user session
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) return false;
      
      const data = await response.json();
      
      if (data.token) {
        // Salva o token do back-end
        localStorage.setItem('prisma_auth_token', data.token);
        
        // Zera todos os dados financeiros locais para começar o dashboard zerado
        localStorage.removeItem('finance_dashboard_expenses');
        localStorage.removeItem('finance_dashboard_budgets');
        localStorage.removeItem('finance_dashboard_categories');
        localStorage.removeItem('finance_dashboard_goals');

        // Define o usuário (isso já atualiza o nome lá em cima no TopNav)
        setUser({ email, name: data.nome, token: data.token });
        
        // Recarrega a página para o FinanceContext montar com o LocalStorage zerado
        window.location.href = '/';
        return true;
      } else if (data.nome) {
        // Fallback temporário caso o token não venha mas a requisição dê sucesso
        setUser({ email, name: data.nome });
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      if (!response.ok) return false;
      
      const data = await response.json();
      // Assumindo que seu back-end retorna { user: { email, name } }
      setUser({ email: data.user.email, name: data.user.name });
      return true;
    } catch (error) {
      console.error("Erro no registro:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('prisma_auth_token');
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
