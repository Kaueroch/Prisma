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
}

export type Tab = 'home' | 'transactions' | 'categories' | 'profile';

export interface MonthFilter {
  month: number;
  year: number;
}
