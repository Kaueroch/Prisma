import { CategoryId, CategoryInfo } from '../types';

export const CATEGORIES: Record<CategoryId, CategoryInfo> = {
  food: { 
    id: 'food', 
    name: 'Food', 
    color: '#fb923c', 
    bgClass: 'bg-orange-400', 
    textClass: 'text-black',
    type: 'expense',
  },
  transport: { 
    id: 'transport', 
    name: 'Transport', 
    color: '#38bdf8', 
    bgClass: 'bg-sky-400', 
    textClass: 'text-black',
    type: 'expense',
  },
  shopping: { 
    id: 'shopping', 
    name: 'Shopping', 
    color: '#c084fc', 
    bgClass: 'bg-purple-400', 
    textClass: 'text-black',
    type: 'expense',
  },
  bills: { 
    id: 'bills', 
    name: 'Household bills', 
    color: '#a3e635', 
    bgClass: 'bg-lime-400', 
    textClass: 'text-black',
    type: 'expense',
  },
  other: { 
    id: 'other', 
    name: 'Other', 
    color: '#a1a1aa', 
    bgClass: 'bg-zinc-400', 
    textClass: 'text-black',
    type: 'expense',
  },
  salary: { 
    id: 'salary', 
    name: 'Salary', 
    color: '#a3e635', 
    bgClass: 'bg-lime-400', 
    textClass: 'text-black',
    type: 'income',
  },
};
