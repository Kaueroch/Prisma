import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Sparkles, LayoutGrid, ArrowLeftRight, Tags, Target, Settings } from 'lucide-react'
import { TintaSidebar } from './tinta/TintaSidebar'
import { AddTransactionForm } from './transactions/components/AddTransactionForm'
import { HomePage } from './dashboard/HomePage'
import { TransactionsPage } from './transactions/TransactionsPage'
import { CategoriesPage } from './categories/CategoriesPage'
import { GoalsPage } from './goals/GoalsPage'
import { ProfilePage } from './profile/ProfilePage'
import { AuthPage } from './auth/AuthPage'
import { LandingPage } from './landing/LandingPage'
import { FinanceProvider } from './finance/FinanceContext'
import { TransactionFormProvider, useTransactionForm } from './finance/TransactionFormContext'
import { ToastProvider } from './shared/components/Toast'
import { Celebrate } from './shared/components/Celebrate'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { useFinance } from './finance/useFinance'
import type { Tab } from './shared/types'

const TAB_PATHS: Record<Tab, string> = {
  home: '/painel',
  transactions: '/transacoes',
  categories: '/categorias',
  goals: '/metas',
  profile: '/configuracoes',
}
const PATH_TABS: Record<string, Tab> = Object.fromEntries(
  Object.entries(TAB_PATHS).map(([tab, path]) => [path, tab as Tab]),
)

function getPublicRoute() {
  const hash = window.location.hash
  if (hash === '#/login') return 'login'
  if (hash === '#/cadastro') return 'cadastro'
  return 'landing'
}

function PublicGate() {
  const { user } = useAuth()
  // Redirect protected tab URLs to login when there is no session.
  if (!user && PATH_TABS[window.location.pathname]) {
    window.location.replace('/#/login')
    return null
  }
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
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>(() => (PATH_TABS[window.location.pathname] as Tab) || 'home')

  useEffect(() => {
    const path = TAB_PATHS[activeTab]
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path)
    }
  }, [activeTab])

  useEffect(() => {
    const onPop = () => {
      const tab = PATH_TABS[window.location.pathname]
      if (tab) setActiveTab(tab)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const [showWelcome, setShowWelcome] = useState(() => localStorage.getItem('prisma_auth_show_welcome') === 'true')

  const closeWelcome = () => {
    localStorage.removeItem('prisma_auth_show_welcome')
    setShowWelcome(false)
  }

  return (
    <>
      <TooltipProvider>
      <div className="flex h-screen bg-[#0c0a08] text-fg overflow-hidden">
        <div className="hidden md:flex"><TintaSidebar active={activeTab} onNavigate={setActiveTab} /></div>
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 relative z-10 overflow-hidden flex flex-col pb-16 md:pb-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="flex min-h-0 flex-1 flex-col"
              >
                {activeTab === 'home' && <HomePage setActiveTab={setActiveTab} />}
                {activeTab === 'transactions' && <TransactionsPage />}
                {activeTab === 'categories' && <CategoriesPage />}
                {activeTab === 'goals' && <GoalsPage />}
                {activeTab === 'profile' && <ProfilePage setActiveTab={setActiveTab} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <TransactionFormGate />
        <Celebrate />
      </div>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-edge bg-[#0c0a08]/95 backdrop-blur px-2 py-2">
        {[
          { icon: LayoutGrid, label: 'Painel', tab: 'home' },
          { icon: ArrowLeftRight, label: 'Transações', tab: 'transactions' },
          { icon: Tags, label: 'Categorias', tab: 'categories' },
          { icon: Target, label: 'Metas', tab: 'goals' },
          { icon: Settings, label: 'Config', tab: 'profile' },
        ].map(({ icon: Icon, label, tab }) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab as Tab)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] ${activeTab === tab ? 'text-brand' : 'text-fg-subtle'}`}
          >
            <Icon className="size-5" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </TooltipProvider>

      <Dialog open={showWelcome} onOpenChange={(open) => !open && closeWelcome()}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand" />
              Boas-vindas, {user?.name?.split(' ')[0] || 'por aqui'}!
            </DialogTitle>
            <DialogDescription className="pt-1">
              Que bom ter você aqui. Registre a primeira transação para ver seus números.
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
