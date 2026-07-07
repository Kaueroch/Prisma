import React, { useState } from 'react';
import { Target, Plus } from 'lucide-react';
import { useFinance } from '../finance/useFinance';
import { AddGoalForm } from './components/AddGoalForm';
import { formatBRL } from '../shared/utils/formatters';

export function GoalsPage() {
  const { goals, addGoal } = useFinance();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Helper to calculate progress
  const getProgress = (saved: number, target: number) => {
    if (target === 0) return 0;
    const ratio = saved / target;
    return Math.min(Math.max(ratio * 100, 0), 100);
  };

  // Helper to calculate time left
  const getMonthsLeft = (saved: number, target: number, monthly: number) => {
    if (monthly <= 0) return '∞';
    const remaining = target - saved;
    if (remaining <= 0) return 0;
    return Math.ceil(remaining / monthly);
  };

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-8 gap-6 text-white font-sans w-full max-w-[1400px] mx-auto relative z-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Metas</h1>
          <p className="text-white/40 mt-1">Acompanhe seus objetivos financeiros.</p>
        </div>
        
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-5 h-5" />
          Nova Meta
        </button>
      </div>
      
      {goals?.length === 0 ? (
        <div className="bg-[#1c1c1f]/80 border border-white/[0.05] rounded-3xl p-12 flex flex-col items-center justify-center gap-4 flex-1">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/40">
            <Target className="w-8 h-8" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-medium text-white mb-2">Nenhuma meta definida</h2>
            <p className="text-white/40 max-w-sm">Comece criando uma meta financeira para acompanhar sua jornada rumo aos seus objetivos.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals?.map(goal => {
            const progress = getProgress(goal.savedAmount, goal.targetAmount);
            const monthsLeft = getMonthsLeft(goal.savedAmount, goal.targetAmount, goal.monthlySavings);
            const isCompleted = goal.savedAmount >= goal.targetAmount;

            return (
              <div key={goal.id} className="bg-[#1c1c1f]/80 border border-white/[0.05] rounded-3xl p-6 flex flex-col gap-5 shadow-lg shadow-black/20">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white">{goal.name}</h3>
                      <p className="text-white/40 text-sm">
                        Economizando {formatBRL(goal.monthlySavings)}/mês
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60">Progresso</span>
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-2.5 bg-black/40 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-green-500' : 'bg-purple-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2 pt-5 border-t border-white/[0.05]">
                  <div>
                    <span className="text-white/40 text-xs block mb-1">Guardado</span>
                    <span className="font-semibold text-white">
                      {formatBRL(goal.savedAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40 text-xs block mb-1">Objetivo</span>
                    <span className="font-semibold text-white/80">
                      {formatBRL(goal.targetAmount)}
                    </span>
                  </div>
                </div>

                {!isCompleted && (
                  <div className="bg-white/5 rounded-xl px-4 py-3 text-sm text-white/60 text-center">
                    Faltam <span className="text-white font-medium">{monthsLeft} meses</span> para alcançar.
                  </div>
                )}
                
                {isCompleted && (
                  <div className="bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl px-4 py-3 text-sm font-medium text-center">
                    Meta Alcançada! 🎉
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AddGoalForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onAdd={addGoal}
      />
    </div>
  );
}
