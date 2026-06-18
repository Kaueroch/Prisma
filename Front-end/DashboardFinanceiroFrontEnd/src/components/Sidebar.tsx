import React from 'react';
import { Plus, Home, ListStart, PieChart, Settings, Wallet } from 'lucide-react';

export type Tab = 'home' | 'transactions' | 'budgets' | 'profile';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onOpenTransactionForm: () => void;
}

export function Sidebar({ activeTab, setActiveTab, onOpenTransactionForm }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-zinc-800/50 bg-zinc-900/30 flex flex-col justify-between hidden md:flex shrink-0">
      <div>
        <div className="h-20 flex items-center px-8 border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-black flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">Finance</span>
          </div>
        </div>
        
        <nav className="p-4 space-y-1 mt-4">
          <button 
            onClick={() => setActiveTab('home')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'home' 
                ? 'bg-zinc-800/80 text-white font-medium' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
            }`}
          >
            <Home className="w-5 h-5" strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            <span>Visão Geral</span>
          </button>

          <button 
            onClick={() => setActiveTab('transactions')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'transactions' 
                ? 'bg-zinc-800/80 text-white font-medium' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
            }`}
          >
            <ListStart className="w-5 h-5" strokeWidth={activeTab === 'transactions' ? 2.5 : 2} />
            <span>Transações</span>
          </button>

          <button 
            onClick={() => setActiveTab('budgets')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'budgets' 
                ? 'bg-zinc-800/80 text-white font-medium' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
            }`}
          >
            <PieChart className="w-5 h-5" strokeWidth={activeTab === 'budgets' ? 2.5 : 2} />
            <span>Orçamentos</span>
          </button>
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'profile' 
                ? 'bg-zinc-800/80 text-white font-medium' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
            }`}
          >
            <Settings className="w-5 h-5" strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
            <span>Configurações</span>
          </button>
        </nav>
      </div>
      
      <div className="p-6">
        <button 
          onClick={onOpenTransactionForm}
          className="w-full h-12 bg-white hover:bg-zinc-200 text-black flex items-center justify-center gap-2 rounded-xl transition-all font-semibold shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          Nova Transação
        </button>
      </div>
    </aside>
  );
}
