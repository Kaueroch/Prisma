/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar, Tab } from './components/Sidebar';
import { AddExpenseForm } from './components/AddExpenseForm';
import { HomePage } from './pages/HomePage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { ProfilePage } from './pages/ProfilePage';
import { FinanceProvider } from './contexts/FinanceContext';
import { useFinance } from './hooks/useFinance';

function AppShell() {
  const { addExpense } = useFinance();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');

  return (
    <div className="flex h-screen bg-zinc-950 text-white font-sans selection:bg-zinc-800 overflow-hidden">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenTransactionForm={() => setIsFormOpen(true)} 
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'transactions' && <TransactionsPage />}
        {activeTab === 'budgets' && <BudgetsPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      {/* Global Add Modal */}
      <AddExpenseForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onAdd={addExpense} 
      />

    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <AppShell />
    </FinanceProvider>
  );
}
