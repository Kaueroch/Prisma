export type CategoryId = string;

export type CategoryKind = 'income' | 'expense';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  color: string;
  bgClass: string;
  textClass: string;
  type: CategoryKind;
}

export type TransactionType = 'expense' | 'income';

export interface Expense {
  id: string;
  amount: number;
  date: string;
  categoryId: CategoryId;
  name: string;
  type: TransactionType;
  contactId?: string;
}

export interface Budget {
  id: string;
  categoryId: CategoryId;
  amount: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  monthlySavings: number;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  type: 'client' | 'lead' | 'partner' | 'supplier';
  notes: string;
  createdAt: string;
}

export interface Deal {
  id: string;
  name: string;
  contactId: string;
  value: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expectedCloseDate: string;
  notes: string;
  createdAt: string;
}

export type Tab = 'home' | 'transactions' | 'budgets' | 'categories' | 'goals' | 'contacts' | 'profile';

export interface MonthFilter {
  month: number;
  year: number;
}
