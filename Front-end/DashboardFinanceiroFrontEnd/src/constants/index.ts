import { CategoryId, CategoryInfo } from '../types';

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
