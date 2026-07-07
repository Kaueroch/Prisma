import React, { useState, useMemo } from 'react';
import { Expense, CategoryId } from '../shared/types';
import { Search, Utensils, Car, ShoppingBag, Receipt, Grid, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../finance/useFinance';
import { formatBRL, formatDateBR } from '../shared/utils/formatters';

const ICONS = {
  food: Utensils,
  transport: Car,
  shopping: ShoppingBag,
  bills: Receipt,
  other: Grid,
  salary: DollarSign,
};

export function TransactionsPage() {
  const { expenses, categories } = useFinance();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<CategoryId | 'all'>('all');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [expandedId, setExpandedId] = useState<CategoryId | null>(null);

  const formatHeader = (dateStr: string) => {
    return formatDateBR(dateStr, { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const categoryGroups = useMemo(() => {
    const filtered = expenses.filter(e => {
      const matchSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = filterCategory === 'all' || e.categoryId === filterCategory;
      const matchType = filterType === 'all' || e.type === filterType;
      return matchSearch && matchCat && matchType;
    });

    const groups = {} as Record<string, { total: number; maxExpense: Expense | null; items: Expense[] }>;

    for (const expense of filtered) {
      if (!groups[expense.categoryId]) {
        groups[expense.categoryId] = { total: 0, maxExpense: null, items: [] };
      }
      
      const group = groups[expense.categoryId];
      group.total += expense.amount;
      group.items.push(expense);
      
      if (!group.maxExpense || expense.amount > group.maxExpense.amount) {
        group.maxExpense = expense;
      }
    }

    // Sort items inside groups by date
    Object.values(groups).forEach(g => {
      g.items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    return Object.entries(groups).map(([id, data]) => ({
      id: id as CategoryId,
      ...data
    })).sort((a, b) => b.total - a.total);

  }, [expenses, searchQuery, filterCategory, filterType]);

  return (
    <div className="p-10 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight text-white mb-2">Transações</h2>
        <p className="text-white/40">Toda a sua atividade financeira centralizada em um só lugar.</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar transação..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input rounded-xl py-3 pl-12 pr-4 text-white outline-none transition-glass"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="glass-input rounded-xl py-3 px-4 text-white outline-none transition-glass appearance-none min-w-[140px]"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="text-black">{c.name}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="glass-input rounded-xl py-3 px-4 text-white outline-none transition-glass appearance-none min-w-[140px]"
          >
            <option value="all">Todos os Tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
        </div>
      </div>
      
      {categoryGroups.length === 0 ? (
        <p className="text-white/40 text-sm mt-8">Nenhuma transação encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {categoryGroups.map(({ id, total, maxExpense, items }) => {
            const catInfo = categories.find(c => c.id === id) || { name: 'Desconhecido', bgClass: 'bg-zinc-500', textClass: 'text-white' };
            const Icon = ICONS[id as keyof typeof ICONS] || Grid;
            const isExpanded = expandedId === id;
            
            return (
              <div 
                key={id} 
                className={`glass-card rounded-2xl overflow-hidden transition-glass ${
                  isExpanded ? 'ring-1 ring-white/20' : ''
                }`}
              >
                {/* Card Header & Body */}
                <div 
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${catInfo.bgClass} ${catInfo.textClass}`}>
                        <Icon className="w-5 h-5" strokeWidth={2.5} />
                      </div>
                      <span className="font-semibold text-white">{catInfo.name}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-white/30" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-white/30" />
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-white tracking-tight">
                      {formatBRL(total)}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1 text-sm text-white/40">
                    {maxExpense && (
                      <p className="truncate">
                        Maior gasto: <span className="font-medium text-white/60">{formatBRL(maxExpense.amount)}</span> ({maxExpense.name})
                      </p>
                    )}
                    <p>{items.length} transaç{items.length === 1 ? 'ão' : 'ões'}</p>
                  </div>
                </div>

                {/* Detail View (Accordion) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="border-t border-white/[0.06] bg-black/20"
                    >
                      <div className="p-5 flex flex-col gap-4 max-h-80 overflow-y-auto">
                        {items.map(expense => (
                          <div key={expense.id} className="flex flex-col gap-1">
                            <div className="flex items-start justify-between">
                              <span className="text-white/60 font-medium">{expense.name}</span>
                              <span className={`font-medium ${expense.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                                {expense.type === 'income' ? '+' : '-'}{formatBRL(expense.amount)}
                              </span>
                            </div>
                            <span className="text-xs text-white/30 uppercase tracking-wider">
                              {formatDateBR(expense.date, { day: '2-digit', month: 'short' })}
                            </span>
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
      )}
    </div>
  );
}
