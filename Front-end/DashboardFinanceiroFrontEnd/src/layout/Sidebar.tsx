import React from 'react';
import { Plus, Home, ListStart, PieChart, Settings, Target } from 'lucide-react';

export type Tab = 'home' | 'transactions' | 'budgets' | 'profile' | 'categories' | 'goals';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onOpenTransactionForm: () => void;
}

export function Sidebar({ activeTab, setActiveTab, onOpenTransactionForm }: SidebarProps) {
  return (
    <aside className="w-64 glass-sidebar flex flex-col justify-between hidden md:flex shrink-0">
      <div>
        <div className="h-20 flex items-center px-8 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <span className="font-bold text-xl tracking-tight text-white">Prisma</span>
          </div>
        </div>
        
        <nav className="p-4 space-y-1 mt-4">
          <button 
            onClick={() => setActiveTab('home')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-glass ${
              activeTab === 'home' 
                ? 'glass-nav-active text-white font-medium' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="w-5 h-5" strokeWidth={activeTab === 'home' ? 2.5 : 2} />
            <span>Visão Geral</span>
          </button>

          <button 
            onClick={() => setActiveTab('transactions')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-glass ${
              activeTab === 'transactions' 
                ? 'glass-nav-active text-white font-medium' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <ListStart className="w-5 h-5" strokeWidth={activeTab === 'transactions' ? 2.5 : 2} />
            <span>Transações</span>
          </button>

          <button 
            onClick={() => setActiveTab('budgets')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-glass ${
              activeTab === 'budgets' 
                ? 'glass-nav-active text-white font-medium' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <PieChart className="w-5 h-5" strokeWidth={activeTab === 'budgets' ? 2.5 : 2} />
            <span>Orçamentos</span>
          </button>
          <button 
            onClick={() => setActiveTab('goals')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-glass ${
              activeTab === 'goals' 
                ? 'glass-nav-active text-white font-medium' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <Target className="w-5 h-5" strokeWidth={activeTab === 'goals' ? 2.5 : 2} />
            <span>Metas</span>
          </button>
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-glass ${
              activeTab === 'profile' 
                ? 'glass-nav-active text-white font-medium' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
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
          className="w-full h-12 bg-white hover:bg-white/90 text-black flex items-center justify-center gap-2 rounded-xl transition-glass font-semibold glow-primary cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          Nova Transação
        </button>
      </div>
    </aside>
  );
}
