import React, { useMemo } from 'react';
import { Calendar, User } from 'lucide-react';
import { Expense } from '../types';
import { CATEGORIES } from '../data';
import { DonutChart } from './DonutChart';
import { CategoryList } from './CategoryList';

const formatBRL = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

interface HomeTabProps {
  expenses: Expense[];
}

export function HomeTab({ expenses }: HomeTabProps) {
  const incomes = useMemo(() => expenses.filter(e => e.type === 'income'), [expenses]);
  const outcomes = useMemo(() => expenses.filter(e => e.type === 'expense'), [expenses]);

  const totalIncome = useMemo(() => incomes.reduce((sum, item) => sum + item.amount, 0), [incomes]);
  const totalExpense = useMemo(() => outcomes.reduce((sum, item) => sum + item.amount, 0), [outcomes]);
  const balance = totalIncome - totalExpense;

  const chartData = useMemo(() => {
    const grouped = outcomes.reduce((acc, item) => {
      acc[item.categoryId] = (acc[item.categoryId] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([id, value]) => ({
      name: CATEGORIES[id as keyof typeof CATEGORIES].name,
      value: value,
      color: CATEGORIES[id as keyof typeof CATEGORIES].color,
      percent: totalExpense > 0 ? Math.round((value / totalExpense) * 100) : 0,
    }));
  }, [outcomes, totalExpense]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Top Header */}
      <header className="h-20 flex items-center justify-between px-10 border-b border-zinc-800/50 shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-tight">Visão Geral</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-zinc-900 rounded-lg p-1 hidden sm:flex">
            {['7D', '30D', '90D', 'Todos'].map((filter) => (
              <button 
                key={filter}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === '30D' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {filter}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800/50 transition-colors">
            <Calendar className="w-4 h-4 text-zinc-400" />
            1 Jun - 17 Jun, 2026
          </button>

          <div className="ml-2 w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700/50 shrink-0">
            <User className="w-4 h-4 text-zinc-400" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-auto">
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          
          {/* Top Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 flex flex-col justify-center gap-2">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-[0.1em]">Saldo Atual</span>
              <span className="text-4xl lg:text-5xl font-bold tracking-tighter text-white">
                {formatBRL(balance)}
              </span>
            </div>
            
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 flex flex-col justify-center gap-2">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-[0.1em]">Receitas</span>
              <span className="text-3xl lg:text-4xl font-bold tracking-tighter text-green-400">
                {formatBRL(totalIncome)}
              </span>
            </div>
            
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 flex flex-col justify-center gap-2">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-[0.1em]">Despesas</span>
              <span className="text-3xl lg:text-4xl font-bold tracking-tighter text-red-400">
                {formatBRL(totalExpense)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left Column: Chart */}
            <div className="flex flex-col items-center justify-center gap-16 lg:sticky lg:top-10 lg:self-start">
              <div className="relative w-64 h-64 xl:w-80 xl:h-80">
                {chartData.length > 0 ? (
                  <DonutChart data={chartData} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-zinc-800 rounded-full">
                    <span className="text-zinc-500 font-medium">Sem dados</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-zinc-500 text-xs uppercase font-bold tracking-tighter">Despesas</span>
                </div>
              </div>
            </div>

            {/* Right Column: Categories */}
            <div>
              <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-6">Por Categoria</h3>
              <CategoryList expenses={outcomes} />
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
