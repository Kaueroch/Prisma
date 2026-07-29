import { useState } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppSidebar } from './layout/AppSidebar'
import { SiteHeader } from './layout/SiteHeader'
import { AddExpenseForm } from './transactions/components/AddExpenseForm'
import { HomePage } from './dashboard/HomePage'
import { TransactionsPage } from './transactions/TransactionsPage'
import { BudgetsPage } from './budgets/BudgetsPage'
import { CategoriesPage } from './categories/CategoriesPage'
import { ProfilePage } from './profile/ProfilePage'
import { GoalsPage } from './goals/GoalsPage'
import { ContactsPage } from './contacts/ContactsPage'
import { AuthPage } from './auth/AuthPage'
import { FinanceProvider } from './finance/FinanceContext'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { useFinance } from './finance/useFinance'
import type { Tab } from './shared/types'

function AppShell() {
  const { user } = useAuth()
  if (!user) return <AuthPage />
  return <AuthenticatedApp />
}

function AuthenticatedApp() {
  const { addExpense } = useFinance()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('home')

  return (
      <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenTransactionForm={() => setIsFormOpen(true)}
        />
        <SidebarInset>
          <SiteHeader activeTab={activeTab} />
          <div className="flex-1 flex flex-col overflow-auto relative">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="flex-1 relative z-10">
              {activeTab === 'home' && <HomePage setActiveTab={setActiveTab} />}
              {activeTab === 'transactions' && <TransactionsPage />}
              {activeTab === 'budgets' && <BudgetsPage />}
              {activeTab === 'categories' && <CategoriesPage />}
              {activeTab === 'goals' && <GoalsPage />}
              {activeTab === 'contacts' && <ContactsPage />}
              {activeTab === 'profile' && <ProfilePage />}
            </div>
          </div>
        </SidebarInset>
        <AddExpenseForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onAdd={addExpense}
        />
      </SidebarProvider>
    </TooltipProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <AppShell />
      </FinanceProvider>
    </AuthProvider>
  )
}
