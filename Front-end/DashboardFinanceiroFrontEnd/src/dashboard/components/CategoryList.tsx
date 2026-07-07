import React, { useState } from 'react';
import { Expense, CategoryId } from '../../shared/types';
import { CATEGORIES } from '../../shared/constants';
import { Utensils, Car, ShoppingBag, Receipt, Grid, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatBRL, formatDateBR } from '../../shared/utils/formatters';

interface CategoryListProps {
  expenses: Expense[];
}

const ICONS: Record<CategoryId, React.ElementType> = {
  food: Utensils,
  transport: Car,
  shopping: ShoppingBag,
  bills: Receipt,
  other: Grid,
  salary: DollarSign,
};

export function CategoryList({ expenses }: CategoryListProps) {
  const [expandedId, setExpandedId] = useState<CategoryId | null>(null);

  // Group expenses by category
  const grouped = expenses.reduce((acc, expense) => {
    if (!acc[expense.categoryId]) {
      acc[expense.categoryId] = {
        total: 0,
        items: []
      };
    }
    acc[expense.categoryId].total += expense.amount;
    acc[expense.categoryId].items.push(expense);
    return acc;
  }, {} as Record<CategoryId, { total: number; items: Expense[] }>);

  const totalOverall = expenses.reduce((sum, item) => sum + item.amount, 0);

  // Convert to array and sort by total descending
  const categoryTotals = Object.entries(grouped)
    .map(([id, data]) => ({
      id: id as CategoryId,
      total: data.total,
      percent: totalOverall > 0 ? Math.round((data.total / totalOverall) * 100) : 0,
      items: data.items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }))
    .sort((a, b) => b.total - a.total);

  const toggleExpand = (id: CategoryId) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4 w-full">
      {categoryTotals.map(({ id, total, percent, items }) => {
        const catInfo = CATEGORIES[id];
        const Icon = ICONS[id];
        const isExpanded = expandedId === id;

        return (
          <div key={id} className="flex flex-col">
            <button
              onClick={() => toggleExpand(id)}
              className={`group flex items-center justify-between p-5 rounded-2xl hover:bg-zinc-900/50 border transition-all cursor-pointer ${
                isExpanded ? 'bg-zinc-900/50 border-zinc-800/50' : 'border-transparent'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${catInfo.bgClass} ${catInfo.textClass}`}>
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <span className="text-white font-medium text-lg">{catInfo.name}</span>
              </div>
              <div className="text-right flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-white">{formatBRL(total)}</p>
                    <span className="text-zinc-500 text-sm font-semibold">{percent}%</span>
                  </div>
                  <p className="text-xs text-zinc-500 italic">{items.length} transações</p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-zinc-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                )}
              </div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-5 pb-5"
                >
                  <div className="flex flex-col gap-4 mt-2 pt-4 border-t border-zinc-800/50">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between pl-14">
                        <div className="flex flex-col">
                          <span className="text-zinc-300 text-sm font-medium">{item.name}</span>
                          <span className="text-zinc-600 text-[10px] uppercase tracking-tighter mt-0.5">
                            {formatDateBR(item.date)}
                          </span>
                        </div>
                        <span className="text-zinc-400 text-sm font-semibold">{formatBRL(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
