import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { CategoryId, Budget } from '../types';
import { CATEGORIES } from '../data';

interface AddBudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (budget: Omit<Budget, 'id'>) => void;
}

export function AddBudgetForm({ isOpen, onClose, onAdd }: AddBudgetFormProps) {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>('food');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    
    const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) / 100;
    if (!numericAmount || numericAmount <= 0) return;

    onAdd({
      amount: numericAmount,
      categoryId,
    });
    
    // Reset and close
    setAmount('');
    setCategoryId('food');
    onClose();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (!rawValue) {
      setAmount('');
      return;
    }
    const numberValue = parseInt(rawValue, 10) / 100;
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numberValue);
    setAmount(formatted);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 pb-4 border-b border-zinc-800/50">
              <h2 className="text-xl font-semibold text-white tracking-tight">Criar Orçamento</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">

              {/* Amount Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-400">Limite Mensal (R$)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-medium text-zinc-500">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0,00"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-14 pr-4 text-3xl font-semibold text-white outline-none focus:border-zinc-700 transition-colors"
                    value={amount}
                    onChange={handleAmountChange}
                    required
                  />
                </div>
              </div>


              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-400">Categoria</label>
                <div className="relative">
                 <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value as CategoryId)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3.5 px-4 text-base text-white outline-none focus:border-zinc-700 transition-colors appearance-none"
                 >
                   {(Object.keys(CATEGORIES) as CategoryId[]).filter(c => c !== 'salary').map((cat) => (
                     <option key={cat} value={cat}>{CATEGORIES[cat].name}</option>
                   ))}
                  </select>
                </div>
              </div>

              {/* Add Button */}
              <button
                type="submit"
                className="mt-6 w-full bg-white hover:bg-zinc-200 text-black font-semibold text-lg py-4 rounded-xl transition-colors"
              >
                Salvar Orçamento
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
