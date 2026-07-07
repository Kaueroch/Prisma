import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { useFinance } from '../../finance/useFinance';
import { CategoryId, Expense, TransactionType } from '../../shared/types';

interface AddExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  initialType?: TransactionType;
}

export function AddExpenseForm({ isOpen, onClose, onAdd, initialType = 'expense' }: AddExpenseFormProps) {
  const { categories } = useFinance();
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState<CategoryId>('food');
  const [type, setType] = useState<TransactionType>(initialType);

  // Sync initial type when opening
  React.useEffect(() => {
    if (isOpen) {
      setType(initialType);
    }
  }, [isOpen, initialType]);

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
              <h2 className="text-xl font-semibold text-white tracking-tight">Nova Transação</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-glass cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
              {/* Type Toggle */}
              <div className="flex bg-black/30 p-1 rounded-xl border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setType('expense')}                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-glass cursor-pointer ${type === 'expense' ? 'bg-red-500/20 text-red-400' : 'text-white/40 hover:text-white/70'}`}
                >
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-glass cursor-pointer ${type === 'income' ? 'bg-green-500/20 text-green-400' : 'text-white/40 hover:text-white/70'}`}
                >
                  Receita
                </button>
              </div>

              {/* Amount Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/40">Valor</label>
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

              {/* Name & Date */}
              <div className="flex gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-sm font-medium text-white/40">Descrição</label>
                  <input
                    type="text"
                    placeholder="Ex: Padaria"
                    className="w-full glass-input rounded-xl py-3.5 px-4 text-base text-white outline-none placeholder:text-white/30"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2 w-40">
                  <label className="text-sm font-medium text-white/40">Data</label>
                  <input
                    type="date"
                    className="w-full glass-input rounded-xl py-3.5 px-4 text-base text-white outline-none color-scheme-dark"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white/40">Categoria</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map((info) => {
                    return (
                      <button
                        key={info.id}
                        type="button"
                        onClick={() => setCategoryId(info.id as CategoryId)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          categoryId === info.id
                            ? 'bg-white/10 border-white/20'
                            : 'border-white/5 hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center`} style={{ backgroundColor: info.color }}></div>
                        <span className="text-white text-sm">{info.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add Button */}
              <button
                type="submit"
                className="mt-6 w-full bg-white hover:bg-white/90 text-black font-semibold text-lg py-4 rounded-xl transition-glass cursor-pointer glow-primary"
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
