import React, { useState } from 'react';
import { Utensils, Car, ShoppingBag, Receipt, Grid, Plus } from 'lucide-react';
import { AddBudgetForm } from './components/AddBudgetForm';
import { useFinance } from '../finance/useFinance';
import { formatBRL } from '../shared/utils/formatters';

const ICONS = {
  food: Utensils,
  transport: Car,
  shopping: ShoppingBag,
  bills: Receipt,
  other: Grid,
};

export function BudgetsPage() {
  const { expenses, budgets, categories, addBudget } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-10 max-w-6xl mx-auto w-full">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-white mb-2">Orçamentos</h2>
          <p className="text-white/40">Acompanhe seus limites de gastos por categoria.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-white hover:bg-white/90 text-black flex items-center justify-center gap-2 rounded-xl transition-glass font-semibold glow-primary px-6 py-3 cursor-pointer"
        >
          <Plus className="w-5 h-5" strokeWidth={3} />
          Criar Orçamento
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {budgets.map(b => {
          const catInfo = categories.find(c => c.id === b.categoryId) || { name: 'Desconhecido', bgClass: 'bg-zinc-500', textClass: 'text-white' };
          const Icon = ICONS[b.categoryId as keyof typeof ICONS] || Grid;
          
          const spent = expenses
            .filter(e => e.categoryId === b.categoryId && e.type === 'expense')
            .reduce((sum, e) => sum + e.amount, 0);
            
          const percent = Math.min(100, Math.round((spent / b.amount) * 100)) || 0;
          const isOver = spent > b.amount;

          return (
            <div key={b.id || b.categoryId} className="glass-card rounded-3xl p-6 transition-all hover:bg-white/[0.07]">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${catInfo.bgClass} ${catInfo.textClass}`}>
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-white font-medium text-lg">{catInfo.name}</span>
                  <span className="text-white/40 text-xs mt-0.5">Gasto {formatBRL(spent)} de {formatBRL(b.amount)}</span>
                </div>
                <span className={`text-xl font-bold tracking-tight ${isOver ? 'text-red-400' : 'text-white'}`}>
                  {percent}%
                </span>
              </div>
              
              <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500`}
                  style={{ 
                    width: `${percent}%`,
                    backgroundColor: isOver ? '#ef4444' : catInfo.color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <AddBudgetForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addBudget}
      />
    </div>
  );
}
