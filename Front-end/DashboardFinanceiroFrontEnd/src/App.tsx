/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
// Trigger HMR
import { Sidebar, Tab } from './layout/Sidebar';
import { TopNav } from './layout/TopNav';
import { AddExpenseForm } from './transactions/components/AddExpenseForm';
import { HomePage } from './dashboard/HomePage';
import { TransactionsPage } from './transactions/TransactionsPage';
import { BudgetsPage } from './budgets/BudgetsPage';
import { CategoriesPage } from './categories/CategoriesPage';
import { ProfilePage } from './profile/ProfilePage';
import { GoalsPage } from './goals/GoalsPage';
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
    <div className="flex flex-col h-screen w-full bg-[#141416] text-white font-sans selection:bg-white/10 overflow-hidden relative">
      
      {/* Animated background glows inside the app */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Navigation */}
      <TopNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto z-10 relative custom-scrollbar">
        {activeTab === 'home' && <HomePage setActiveTab={setActiveTab} />}
        {activeTab === 'transactions' && <TransactionsPage />}
        {activeTab === 'budgets' && <BudgetsPage />}
        {activeTab === 'categories' && <CategoriesPage />}
        {activeTab === 'goals' && <GoalsPage />}
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
