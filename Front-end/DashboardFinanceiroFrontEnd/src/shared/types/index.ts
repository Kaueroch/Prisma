/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CategoryId = string;

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

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  monthlySavings: number;
}
