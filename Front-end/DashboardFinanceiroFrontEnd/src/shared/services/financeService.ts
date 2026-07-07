import { Budget, Expense, Goal } from '../types';
import { CATEGORIES } from '../constants';

const EXPENSES_STORAGE_KEY = 'finance_dashboard_expenses';
const BUDGETS_STORAGE_KEY = 'finance_dashboard_budgets';
const GOALS_STORAGE_KEY = 'finance_dashboard_goals';

export const financeService = {
  getExpenses(): Expense[] {
    const data = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!data) {
      return [];
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveExpenses(expenses: Expense[]): void {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  },

  getBudgets(): Budget[] {
    const data = localStorage.getItem(BUDGETS_STORAGE_KEY);
    if (!data) {
      return [];
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveBudgets(budgets: Budget[]): void {
    localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
  },

  getCategories(): import('../types').CategoryInfo[] {
    const data = localStorage.getItem('finance_dashboard_categories');
    if (!data) {
      const initial = Object.values(CATEGORIES) as import('../types').CategoryInfo[];
      this.saveCategories(initial);
      return initial;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveCategories(categories: import('../types').CategoryInfo[]): void {
    localStorage.setItem('finance_dashboard_categories', JSON.stringify(categories));
  },

  getGoals(): Goal[] {
    const data = localStorage.getItem(GOALS_STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveGoals(goals: Goal[]): void {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  }
};
