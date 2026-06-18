export type CategoryId = 'food' | 'transport' | 'shopping' | 'bills' | 'other' | 'salary';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  color: string; // for the chart
  bgClass: string; // for the icon background
  textClass: string; // for the icon color
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

export interface Budget {
  id: string;
  categoryId: CategoryId;
  amount: number;
}
