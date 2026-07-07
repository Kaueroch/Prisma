import React, { useState, useMemo } from 'react';
import { Calendar, Download, Send, ArrowDownLeft, ArrowUpRight, Plus, MoreHorizontal, CheckCircle2, ChevronDown } from 'lucide-react';
import { useFinance } from '../finance/useFinance';
import { formatBRL, formatDateBR } from '../shared/utils/formatters';
import { AddExpenseForm } from '../transactions/components/AddExpenseForm';
import { TransactionType } from '../shared/types';
import { Tab } from '../layout/Sidebar';

interface HomePageProps {
  setActiveTab?: (tab: Tab) => void;
}

export function HomePage({ setActiveTab }: HomePageProps = {}) {
  const { totalIncome, totalExpense, balance, expenses, categories, addExpense } = useFinance();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('income');

  // Sort expenses by date descending to get recent activity
  const recentActivity = useMemo(() => {
    return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  }, [expenses]);

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-8 gap-6 relative z-10 text-white font-sans max-w-[1400px] mx-auto w-full">
      
      {/* 1. Big Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-900 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center border border-purple-500/30 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col gap-2 z-10">
          <span className="text-white/80 font-medium">Saldo Atual</span>
          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-bold tracking-tight">{formatBRL(balance)}</h1>
            <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all">
              <ChevronDown className="w-4 h-4 text-white" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 mt-6">
            <button 
              onClick={() => { setModalType('income'); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-white text-purple-900 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-white/90 transition-all cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4" />
              Receber
            </button>
            <button 
              onClick={() => { setModalType('expense'); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-white/20 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/30 transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              Transferir
            </button>
            <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all">
              <MoreHorizontal className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4 mt-8 md:mt-0 z-10">
          <div className="flex items-center gap-2 bg-black/20 rounded-full p-1 border border-white/10">
            <button className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium text-white/80 hover:bg-white/10 transition-all">
              <Calendar className="w-3 h-3" />
              Este Mês
            </button>
            <button className="flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-xs font-medium text-white shadow-sm">
              <Download className="w-3 h-3" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* 2. Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receitas */}
        <div className="bg-[#1c1c1f]/80 border border-white/[0.05] rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 text-green-500" />
             </div>
             <span className="text-white/60 font-medium text-sm">Receitas Totais</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{formatBRL(totalIncome)}</span>
            <span className="text-green-400 text-xs mt-1 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              Em dia
            </span>
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-[#1c1c1f]/80 border border-white/[0.05] rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-orange-500" />
             </div>
             <span className="text-white/60 font-medium text-sm">Despesas Totais</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{formatBRL(totalExpense)}</span>
            <span className="text-white/40 text-xs mt-1 font-medium flex items-center gap-1">
              Referente a este mês
            </span>
          </div>
        </div>

        {/* Economia */}
        <div className="bg-[#1c1c1f]/80 border border-white/[0.05] rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-purple-500" />
             </div>
             <span className="text-white/60 font-medium text-sm">Economia (Líquido)</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{formatBRL(totalIncome - totalExpense)}</span>
            <span className="text-purple-400 text-xs mt-1 font-medium flex items-center gap-1">
              Disponível para Metas
            </span>
          </div>
        </div>

        {/* Limite / Cartões */}
        <div className="bg-[#1c1c1f]/80 border border-white/[0.05] rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-500" />
             </div>
             <span className="text-white/60 font-medium text-sm">Próximos Vencimentos</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold">R$ 0,00</span>
            <span className="text-white/40 text-xs mt-1 font-medium">
              Nenhuma conta para hoje
            </span>
          </div>
        </div>
      </div>

      {/* 3. Recent Activity Table */}
      <div className="bg-[#1c1c1f]/80 border border-white/[0.05] rounded-3xl p-6 lg:p-8 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-white">Atividade Recente</h2>
          <button 
            onClick={() => setActiveTab?.('transactions')}
            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/80 hover:text-white transition-all cursor-pointer"
          >
            Ver todas
          </button>
        </div>

        {recentActivity.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-white/40">
            Nenhuma transação recente encontrada.
          </div>
        ) : (
          <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  <th className="pb-4 text-xs font-medium text-white/40 uppercase tracking-wider">Tipo</th>
                  <th className="pb-4 text-xs font-medium text-white/40 uppercase tracking-wider">Data</th>
                  <th className="pb-4 text-xs font-medium text-white/40 uppercase tracking-wider">Valor</th>
                  <th className="pb-4 text-xs font-medium text-white/40 uppercase tracking-wider">Categoria</th>
                  <th className="pb-4 text-xs font-medium text-white/40 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((transaction) => {
                  const isIncome = transaction.type === 'income';
                  const catInfo = categories.find(c => c.id === transaction.categoryId);
                  
                  return (
                    <tr key={transaction.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isIncome ? 'bg-green-500/10' : 'bg-white/5'}`}>
                            {isIncome ? <ArrowDownLeft className="w-4 h-4 text-green-500" /> : <ArrowUpRight className="w-4 h-4 text-white/60" />}
                          </div>
                          <span className="font-medium text-sm text-white/90 group-hover:text-white transition-colors">{transaction.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-white/60">{formatDateBR(transaction.date)}</td>
                      <td className="py-4 font-medium text-sm text-white/90">
                        {isIncome ? '+' : '-'}{formatBRL(transaction.amount)}
                      </td>
                      <td className="py-4">
                        {catInfo ? (
                           <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: catInfo.color }}></div>
                             <span className="text-sm text-white/60">{catInfo.name}</span>
                           </div>
                        ) : (
                           <span className="text-sm text-white/40">Sem categoria</span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Concluído
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddExpenseForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addExpense}
        initialType={modalType}
      />
    </div>
  );
}
