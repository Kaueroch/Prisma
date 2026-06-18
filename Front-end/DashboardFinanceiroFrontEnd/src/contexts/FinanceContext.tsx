import React, { createContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Expense, Budget } from '../types';
import { financeService } from '../services/financeService';

interface FinanceContextType {
  expenses: Expense[];
  budgets: Budget[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

interface FinanceProviderProps {
  children: ReactNode;
}

export function FinanceProvider({ children }: FinanceProviderProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // Load initial data on mount
  useEffect(() => {
    setExpenses(financeService.getExpenses());
    setBudgets(financeService.getBudgets());
  }, []);

  // Save updates to localstorage
  const handleAddExpense = (newExpense: Omit<Expense, 'id'>) => {
    const expense: Expense = {
      ...newExpense,
      id: Math.random().toString(36).substring(7),
    };
    setExpenses((prev) => {
      const updated = [expense, ...prev];
      financeService.saveExpenses(updated);
      return updated;
    });
  };

  const handleAddBudget = (newBudget: Omit<Budget, 'id'>) => {
    const newBudgetEntry: Budget = {
      ...newBudget,
      id: Math.random().toString(36).substring(7)
    };
    setBudgets((prev) => {
      // If budget for this category already exists, replace it, otherwise add new
      const filtered = prev.filter((b) => b.categoryId !== newBudgetEntry.categoryId);
      const updated = [...filtered, newBudgetEntry];
      financeService.saveBudgets(updated);
      return updated;
    });
  };

  const handleSetBudgets = (action: React.SetStateAction<Budget[]>) => {
    setBudgets((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      financeService.saveBudgets(next);
      return next;
    });
  };

  // Memoized computations
  const incomes = useMemo(() => expenses.filter(e => e.type === 'income'), [expenses]);
  const outcomes = useMemo(() => expenses.filter(e => e.type === 'expense'), [expenses]);

  const totalIncome = useMemo(() => incomes.reduce((sum, item) => sum + item.amount, 0), [incomes]);
  const totalExpense = useMemo(() => outcomes.reduce((sum, item) => sum + item.amount, 0), [outcomes]);
  const balance = useMemo(() => totalIncome - totalExpense, [totalIncome, totalExpense]);

  const value = useMemo(() => ({
    expenses,
    budgets,
    addExpense: handleAddExpense,
    addBudget: handleAddBudget,
    setBudgets: handleSetBudgets,
    totalIncome,
    totalExpense,
    balance
  }), [expenses, budgets, totalIncome, totalExpense, balance]);

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}
