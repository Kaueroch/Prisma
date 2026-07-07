/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar, Tab } from './layout/Sidebar';
import { AddExpenseForm } from './transactions/components/AddExpenseForm';
import { HomePage } from './dashboard/HomePage';
import { TransactionsPage } from './transactions/TransactionsPage';
import { BudgetsPage } from './budgets/BudgetsPage';
import { ProfilePage } from './profile/ProfilePage';
import { AuthPage } from './auth/AuthPage';
import { FinanceProvider } from './finance/FinanceContext';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { useFinance } from './finance/useFinance';

function AppShell() {
  const { user } = useAuth();

  // If not authenticated, show the auth page
  if (!user) {
    return <AuthPage />;
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
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
    <AuthProvider>
      <FinanceProvider>
        <AppShell />
      </FinanceProvider>
    </AuthProvider>
  );
}
