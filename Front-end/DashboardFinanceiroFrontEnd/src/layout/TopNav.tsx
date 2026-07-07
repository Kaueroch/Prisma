import React from 'react';
import { Settings, User } from 'lucide-react';
import { Tab } from './Sidebar';
import { useAuth } from '../auth/AuthContext';

interface TopNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function TopNav({ activeTab, setActiveTab }: TopNavProps) {
  const { user } = useAuth();

  return (
    <nav className="h-16 px-6 flex items-center justify-between shrink-0 border-b border-white/[0.05] relative">
      {/* Logo */}
      {/* Tabs (Left) */}
      <div className="flex items-center gap-2 bg-black/20 p-1 rounded-full border border-white/[0.05] z-10">
        <button 
          onClick={() => setActiveTab('home')}
          className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'home' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('transactions')}
          className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'transactions' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
        >
          Transações
        </button>
        <button 
          onClick={() => setActiveTab('budgets')}
          className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'budgets' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
        >
          Orçamentos
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'categories' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
        >
          Categorias
        </button>
        <button 
          onClick={() => setActiveTab('goals')}
          className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'goals' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
        >
          Metas
        </button>
      </div>

      {/* Logo (Center) */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
        <span className="font-bold text-xl tracking-tight text-white">Prisma</span>
      </div>

      {/* Actions (Right) */}
      <div className="flex items-center gap-4 z-10">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border border-white/[0.05] ${activeTab === 'profile' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
        >
          <Settings className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3">
          {user?.name && (
            <span className="text-sm font-medium text-white/90">
              Olá, {user.name}
            </span>
          )}
          <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </nav>
  );
}
