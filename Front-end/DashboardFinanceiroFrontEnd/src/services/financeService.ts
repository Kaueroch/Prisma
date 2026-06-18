import { Budget, Expense } from '../types';
import { INITIAL_BUDGETS, INITIAL_EXPENSES } from './mockData';

const EXPENSES_STORAGE_KEY = 'finance_dashboard_expenses';
const BUDGETS_STORAGE_KEY = 'finance_dashboard_budgets';

export const financeService = {
  getExpenses(): Expense[] {
    const data = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!data) {
      // Seed initial data
      this.saveExpenses(INITIAL_EXPENSES);
      return INITIAL_EXPENSES;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_EXPENSES;
    }
  },

  saveExpenses(expenses: Expense[]): void {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  },

  getBudgets(): Budget[] {
    const data = localStorage.getItem(BUDGETS_STORAGE_KEY);
    if (!data) {
      // Seed initial data
      this.saveBudgets(INITIAL_BUDGETS);
      return INITIAL_BUDGETS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_BUDGETS;
    }
  },

  saveBudgets(budgets: Budget[]): void {
    localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
  }
};
