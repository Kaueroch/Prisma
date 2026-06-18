/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Home, ListStart, PieChart, Settings, Wallet } from 'lucide-react';
import { INITIAL_EXPENSES, INITIAL_BUDGETS } from './data';
import { Expense } from './types';
import { AddExpenseForm } from './components/AddExpenseForm';
import { HomeTab } from './components/HomeTab';
import { TransactionsTab } from './components/TransactionsTab';
import { BudgetsTab } from './components/BudgetsTab';
import { ProfileTab } from './components/ProfileTab';

type Tab = 'home' | 'transactions' | 'budgets' | 'profile';

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const handleAddExpense = (newExpense: Omit<Expense, 'id'>) => {
    const expense: Expense = {
      ...newExpense,
      id: Math.random().toString(36).substring(7),
    };
    setExpenses((prev) => [expense, ...prev]);
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-white font-sans selection:bg-zinc-800 overflow-hidden">
      
      {/* Sidebar Navigation */}
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'home' ? 'bg-zinc-800/80 text-white font-medium' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'}`}
            >
              <Home className="w-5 h-5" strokeWidth={activeTab === 'home' ? 2.5 : 2} />
              <span>Visão Geral</span>
            </button>

            <button 
              onClick={() => setActiveTab('transactions')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'transactions' ? 'bg-zinc-800/80 text-white font-medium' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'}`}
            >
              <ListStart className="w-5 h-5" strokeWidth={activeTab === 'transactions' ? 2.5 : 2} />
              <span>Transações</span>
            </button>

            <button 
              onClick={() => setActiveTab('budgets')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'budgets' ? 'bg-zinc-800/80 text-white font-medium' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'}`}
            >
              <PieChart className="w-5 h-5" strokeWidth={activeTab === 'budgets' ? 2.5 : 2} />
              <span>Orçamentos</span>
            </button>
            <button 
              onClick={() => setActiveTab('profile')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-zinc-800/80 text-white font-medium' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'}`}
            >
              <Settings className="w-5 h-5" strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
              <span>Configurações</span>
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          <button 
            onClick={() => setIsFormOpen(true)}
            className="w-full h-12 bg-white hover:bg-zinc-200 text-black flex items-center justify-center gap-2 rounded-xl transition-all font-semibold shadow-lg"
          >
            <Plus className="w-4 h-4" strokeWidth={3} />
            Nova Transação
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        {activeTab === 'home' && <HomeTab expenses={expenses} />}
        {activeTab === 'transactions' && <TransactionsTab expenses={expenses} />}
        {activeTab === 'budgets' && <BudgetsTab expenses={expenses} budgets={budgets} setBudgets={setBudgets} />}
        {activeTab === 'profile' && <ProfileTab />}
      </main>

      {/* Global Add Modal */}
      <AddExpenseForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onAdd={handleAddExpense} 
      />

    </div>
  );
}

