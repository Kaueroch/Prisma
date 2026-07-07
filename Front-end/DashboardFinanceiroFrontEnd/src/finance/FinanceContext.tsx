import React, { createContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Expense, Budget, CategoryInfo, Goal } from '../shared/types';
import { financeService } from '../shared/services/financeService';

interface FinanceContextType {
  expenses: Expense[];
  budgets: Budget[];
  categories: CategoryInfo[];
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  addCategory: (category: Omit<CategoryInfo, 'id'>) => void;
  updateCategory: (id: string, category: Partial<CategoryInfo>) => void;
  deleteCategory: (id: string) => void;
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
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  // Load initial data on mount
  useEffect(() => {
    setExpenses(financeService.getExpenses());
    setBudgets(financeService.getBudgets());
    setCategories(financeService.getCategories());
    setGoals(financeService.getGoals());
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

  const handleAddCategory = (newCategory: Omit<CategoryInfo, 'id'>) => {
    const category: CategoryInfo = {
      ...newCategory,
      id: Math.random().toString(36).substring(7),
    };
    setCategories((prev) => {
      const updated = [...prev, category];
      financeService.saveCategories(updated);
      return updated;
    });
  };

  const handleUpdateCategory = (id: string, updates: Partial<CategoryInfo>) => {
    setCategories((prev) => {
      const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      financeService.saveCategories(updated);
      return updated;
    });
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => {
      const updated = prev.filter(c => c.id !== id);
      financeService.saveCategories(updated);
      return updated;
    });
  };

  const handleAddGoal = (newGoal: Omit<Goal, 'id'>) => {
    const goal: Goal = {
      ...newGoal,
      id: Math.random().toString(36).substring(7),
    };
    setGoals((prev) => {
      const updated = [...prev, goal];
      financeService.saveGoals(updated);
      return updated;
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
    categories,
    goals,
    addGoal: handleAddGoal,
    addExpense: handleAddExpense,
    addBudget: handleAddBudget,
    setBudgets: handleSetBudgets,
    addCategory: handleAddCategory,
    updateCategory: handleUpdateCategory,
    deleteCategory: handleDeleteCategory,
    totalIncome,
    totalExpense,
    balance
  }), [expenses, budgets, categories, goals, totalIncome, totalExpense, balance]);

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}
