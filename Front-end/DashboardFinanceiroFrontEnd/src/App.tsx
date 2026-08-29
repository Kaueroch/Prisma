import { useState, useEffect } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Sparkles } from 'lucide-react'
import { AppSidebar } from './layout/AppSidebar'
import { SiteHeader } from './layout/SiteHeader'
import { AddTransactionForm } from './transactions/components/AddTransactionForm'
import { HomePage } from './dashboard/HomePage'
import { TransactionsPage } from './transactions/TransactionsPage'
import { BudgetsPage } from './budgets/BudgetsPage'
import { CategoriesPage } from './categories/CategoriesPage'
import { ProfilePage } from './profile/ProfilePage'
import { GoalsPage } from './goals/GoalsPage'
import { ContactsPage } from './contacts/ContactsPage'
import { AuthPage } from './auth/AuthPage'
import { LandingPage } from './landing/LandingPage'
import { FinanceProvider } from './finance/FinanceContext'
import { TransactionFormProvider, useTransactionForm } from './finance/TransactionFormContext'
import { ToastProvider } from './shared/components/Toast'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { useFinance } from './finance/useFinance'
import type { Tab } from './shared/types'

function getPublicRoute() {
  const hash = window.location.hash
  if (hash === '#/login') return 'login'
  if (hash === '#/cadastro') return 'cadastro'
  return 'landing'
}

function PublicGate() {
  const { user } = useAuth()
  const [route, setRoute] = useState(getPublicRoute)

  useEffect(() => {
    const onChange = () => setRoute(getPublicRoute())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const goToLanding = () => {
    setRoute('landing')
    history.pushState(null, '', window.location.pathname + window.location.search)
  }

  if (user) return <AuthenticatedApp />
  if (route === 'login') {
    return <AuthPage initialTab="login" onBack={goToLanding} />
  }
  if (route === 'cadastro') {
    return <AuthPage initialTab="register" onBack={goToLanding} />
  }
  return <LandingPage />
}

function TransactionFormGate() {
  const { isOpen, initialType, closeTransactionForm } = useTransactionForm()
  const { addExpense } = useFinance()
  return (
    <AddTransactionForm
      isOpen={isOpen}
      onClose={closeTransactionForm}
      onAdd={addExpense}
      initialType={initialType}
    />
  )
}

function AuthenticatedApp() {
  const { openTransactionForm } = useTransactionForm()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [showWelcome, setShowWelcome] = useState(() => localStorage.getItem('prisma_auth_show_welcome') === 'true')

  const closeWelcome = () => {
    localStorage.removeItem('prisma_auth_show_welcome')
    setShowWelcome(false)
  }

  return (
    <>
      <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenTransactionForm={openTransactionForm}
        />
        <SidebarInset>
          <SiteHeader activeTab={activeTab} />
          <div className="flex-1 flex flex-col overflow-auto relative">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-lime-400/[0.05] blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-white/[0.03] blur-[120px] rounded-full pointer-events-none" />
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
        <TransactionFormGate />
      </SidebarProvider>
    </TooltipProvider>

      <Dialog open={showWelcome} onOpenChange={(open) => !open && closeWelcome()}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Bem-vindo(a), {user?.name || 'usuário'}!
            </DialogTitle>
            <DialogDescription className="pt-1">
              Que bom ter você aqui. Aproveite o seu painel financeiro!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="w-full sm:w-auto" onClick={closeWelcome}>
              Começar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <TransactionFormProvider>
          <ToastProvider>
            <PublicGate />
          </ToastProvider>
        </TransactionFormProvider>
      </FinanceProvider>
    </AuthProvider>
  )
}
