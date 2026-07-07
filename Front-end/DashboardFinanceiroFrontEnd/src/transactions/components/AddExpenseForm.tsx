import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { CategoryId, Expense, TransactionType } from '../../shared/types';
import { CATEGORIES } from '../../shared/constants';

interface AddExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: Omit<Expense, 'id'>) => void;
}

export function AddExpenseForm({ isOpen, onClose, onAdd }: AddExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState<CategoryId>('food');
  const [type, setType] = useState<TransactionType>('expense');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !name || !date) return;
    
    const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) / 100;
    if (!numericAmount || numericAmount <= 0) return;

    onAdd({
      amount: numericAmount,
      name,
      date,
      categoryId,
      type
    });
    
    // Reset and close
    setAmount('');
    setName('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategoryId('food');
    setType('expense');
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
              <h2 className="text-xl font-semibold text-white tracking-tight">Nova Transação</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
              {/* Type Toggle */}
              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${type === 'expense' ? 'bg-red-500/20 text-red-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${type === 'income' ? 'bg-green-500/20 text-green-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Receita
                </button>
              </div>

              {/* Amount Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-400">Valor</label>
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

              {/* Name & Date */}
              <div className="flex gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-sm font-medium text-zinc-400">Descrição</label>
                  <input
                    type="text"
                    placeholder="Ex: Padaria"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3.5 px-4 text-base text-white outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-600"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2 w-40">
                  <label className="text-sm font-medium text-zinc-400">Data</label>
                  <input
                    type="date"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3.5 px-4 text-base text-white outline-none focus:border-zinc-700 transition-colors color-scheme-dark"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-400">Categoria</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(Object.keys(CATEGORIES) as CategoryId[]).map((cat) => {
                    const isSelected = categoryId === cat;
                    const info = CATEGORIES[cat];
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryId(cat)}
                        className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-all cursor-pointer ${
                          isSelected 
                            ? `${info.bgClass} ${info.textClass} border-transparent shadow-lg` 
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                       {info.name.split(' ')[0]}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Add Button */}
              <button
                type="submit"
                className="mt-6 w-full bg-white hover:bg-zinc-200 text-black font-semibold text-lg py-4 rounded-xl transition-colors cursor-pointer"
              >
                Salvar Transação
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
