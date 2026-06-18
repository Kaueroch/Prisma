import { CategoryInfo, Expense, Budget, CategoryId } from './types';

export const CATEGORIES: Record<CategoryId, CategoryInfo> = {
  food: { 
    id: 'food', 
    name: 'Alimentação', 
    color: '#fb923c', 
    bgClass: 'bg-orange-400', 
    textClass: 'text-black' 
  },
  transport: { 
    id: 'transport', 
    name: 'Transporte', 
    color: '#38bdf8', 
    bgClass: 'bg-sky-400', 
    textClass: 'text-black' 
  },
  shopping: { 
    id: 'shopping', 
    name: 'Compras', 
    color: '#c084fc', 
    bgClass: 'bg-purple-400', 
    textClass: 'text-black' 
  },
  bills: { 
    id: 'bills', 
    name: 'Contas da Casa', 
    color: '#4ade80', 
    bgClass: 'bg-green-400', 
    textClass: 'text-black' 
  },
  other: { 
    id: 'other', 
    name: 'Outros', 
    color: '#a1a1aa', 
    bgClass: 'bg-zinc-400', 
    textClass: 'text-black' 
  },
  salary: { 
    id: 'salary', 
    name: 'Salário', 
    color: '#4ade80', 
    bgClass: 'bg-green-500', 
    textClass: 'text-black' 
  },
};

export const INITIAL_EXPENSES: Expense[] = [
  { id: '0', amount: 5000.00, date: '2026-06-01', categoryId: 'salary', name: 'Salário Mensal', type: 'income' },
  { id: '1', amount: 142.50, date: '2026-06-12', categoryId: 'food', name: 'Mercado Livre', type: 'expense' },
  { id: '2', amount: 45.00, date: '2026-06-10', categoryId: 'transport', name: 'Uber X', type: 'expense' },
  { id: '3', amount: 299.00, date: '2026-06-05', categoryId: 'shopping', name: 'Mercado Livre', type: 'expense' },
  { id: '4', amount: 95.20, date: '2026-06-02', categoryId: 'bills', name: 'Conta de Luz', type: 'expense' },
  { id: '5', amount: 15.00, date: '2026-06-14', categoryId: 'food', name: 'Padaria Artesanal', type: 'expense' },
  { id: '6', amount: 60.00, date: '2026-06-16', categoryId: 'shopping', name: 'Shopee', type: 'expense' },
  { id: '7', amount: 12.50, date: '2026-06-16', categoryId: 'transport', name: 'Metrô', type: 'expense' },
];

export const INITIAL_BUDGETS: Budget[] = [
  { id: 'b1', categoryId: 'food', amount: 400 },
  { id: 'b2', categoryId: 'transport', amount: 100 },
  { id: 'b3', categoryId: 'shopping', amount: 200 },
  { id: 'b4', categoryId: 'bills', amount: 500 },
  { id: 'b5', categoryId: 'other', amount: 100 },
];
