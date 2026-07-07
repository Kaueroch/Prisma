import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { CategoryId, Budget } from '../../shared/types';
import { useFinance } from '../../finance/useFinance';

interface AddBudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (budget: Omit<Budget, 'id'>) => void;
}

export function AddBudgetForm({ isOpen, onClose, onAdd }: AddBudgetFormProps) {
  const { categories } = useFinance();
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
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg glass-modal rounded-2xl shadow-2xl shadow-black/30 overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 pb-4 border-b border-white/[0.06]">
              <h2 className="text-xl font-semibold text-white tracking-tight">Criar Orçamento</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-glass cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">

              {/* Amount Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/40">Limite Mensal (R$)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-medium text-white/40">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0,00"
                    className="w-full glass-input rounded-xl py-4 pl-14 pr-4 text-3xl font-semibold text-white outline-none"
                    value={amount}
                    onChange={handleAmountChange}
                    required
                  />
                </div>
              </div>


              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/40">Categoria</label>
                <div className="relative">
                   <select
                     value={categoryId}
                     onChange={(e) => setCategoryId(e.target.value as CategoryId)}
                     className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/30"
                   >
                     {categories.filter(c => c.id !== 'salary').map((cat) => (
                       <option key={cat.id} value={cat.id} className="text-black">{cat.name}</option>
                     ))}
                   </select>
                </div>
              </div>

              {/* Add Button */}
              <button
                type="submit"
                className="mt-6 w-full bg-white hover:bg-white/90 text-black font-semibold text-lg py-4 rounded-xl transition-glass cursor-pointer glow-primary"
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
