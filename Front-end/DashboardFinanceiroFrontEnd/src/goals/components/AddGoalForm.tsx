import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Goal } from '../../shared/types';
import { motion, AnimatePresence } from 'motion/react';

interface AddGoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (goal: Omit<Goal, 'id'>) => void;
}

export function AddGoalForm({ isOpen, onClose, onAdd }: AddGoalFormProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [monthlySavings, setMonthlySavings] = useState('');
  const [savedAmount, setSavedAmount] = useState('');

  const parseCurrency = (val: string) => parseInt(val.replace(/\D/g, '') || '0', 10) / 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetAmt = parseCurrency(targetAmount);
    const monthlyAmt = parseCurrency(monthlySavings);
    const savedAmt = parseCurrency(savedAmount);

    if (!name || targetAmt <= 0 || monthlyAmt <= 0) return;

    onAdd({
      name,
      targetAmount: targetAmt,
      monthlySavings: monthlyAmt,
      savedAmount: savedAmt,
    });

    setName('');
    setTargetAmount('');
    setMonthlySavings('');
    setSavedAmount('');
    onClose();
  };

  const formatValue = (val: string) => {
    const rawValue = val.replace(/\D/g, '');
    if (!rawValue) return '';
    const numberValue = parseInt(rawValue, 10) / 100;
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numberValue);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#1c1c1f] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
        >
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Nova Meta</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/60">O que você quer comprar/alcançar?</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Carro Novo, Viagem..."
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-white/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/60">Valor total da meta</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">R$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={targetAmount}
                  onChange={e => setTargetAmount(formatValue(e.target.value))}
                  placeholder="0,00"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/60">Quanto você guarda por mês?</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">R$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={monthlySavings}
                  onChange={e => setMonthlySavings(formatValue(e.target.value))}
                  placeholder="0,00"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/60">Valor já guardado (Opcional)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">R$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={savedAmount}
                  onChange={e => setSavedAmount(formatValue(e.target.value))}
                  placeholder="0,00"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-lg shadow-purple-500/20"
              >
                Salvar Meta
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
