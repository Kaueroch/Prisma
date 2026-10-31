import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useReducedMotion } from './shared/motion/useReducedMotion'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Sparkles, LayoutGrid, ArrowLeftRight, Tags, Settings } from 'lucide-react'
import { DURATION, EASE } from './shared/motion/tokens'
import { TintaSidebar } from './tinta/TintaSidebar'
import { AddTransactionForm } from './transactions/components/AddTransactionForm'
import { HomePage } from './dashboard/HomePage'
import { TransactionsPage } from './transactions/TransactionsPage'
import { CategoriesPage } from './categories/CategoriesPage'
import { ProfilePage } from './profile/ProfilePage'
import { AuthPage } from './auth/AuthPage'
import { LandingPage } from './landing/LandingPage'
import { FinanceProvider } from './finance/FinanceContext'
import { TransactionFormProvider, useTransactionForm } from './finance/TransactionFormContext'
import { ToastProvider } from './shared/components/Toast'
import { MotionRoot } from './shared/motion/MotionRoot'
import { Celebrate } from './shared/components/Celebrate'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { useFinance } from './finance/useFinance'
import type { Tab } from './shared/types'

const TAB_PATHS: Record<Tab, string> = {
  home: '/painel',
  transactions: '/transacoes',
  categories: '/categorias',
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
  const { isOpen, initialType, editingExpense, closeTransactionForm } = useTransactionForm()
  const { addExpense, updateExpense } = useFinance()
  return (
    <AddTransactionForm
      isOpen={isOpen}
      onClose={closeTransactionForm}
      onAdd={addExpense}
      onEdit={editingExpense ? (updates) => updateExpense(editingExpense.id, updates) : undefined}
      initialData={editingExpense}
      initialType={initialType}
    />
  )
}

function AuthenticatedApp() {
  // Providers inside the authenticated area ensure fresh data per user session.
  return (
    <FinanceProvider>
      <TransactionFormProvider>
        <AuthenticatedAppContent />
      </TransactionFormProvider>
    </FinanceProvider>
  )
}

function AuthenticatedAppContent() {
  const { user } = useAuth()
  const reduceMotion = useReducedMotion()
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
      <div className="flex h-[100dvh] pt-[var(--safe-area-top)] bg-ink text-fg overflow-hidden">
        <div className="hidden md:flex"><TintaSidebar active={activeTab} onNavigate={setActiveTab} /></div>
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 relative z-10 overflow-hidden flex flex-col pb-[calc(4rem+var(--safe-area-bottom))] md:pb-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.995 }}
                transition={{ duration: reduceMotion ? 0 : DURATION.fast, ease: EASE }}
                className="flex min-h-0 flex-1 flex-col"
              >
                {activeTab === 'home' && <HomePage setActiveTab={setActiveTab} />}
                {activeTab === 'transactions' && <TransactionsPage />}
                {activeTab === 'categories' && <CategoriesPage />}
{activeTab === 'profile' && <ProfilePage setActiveTab={setActiveTab} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <TransactionFormGate />
        <Celebrate />
      </div>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-edge bg-ink/95 backdrop-blur px-2 pt-2 pb-[calc(0.5rem+var(--safe-area-bottom))]">
        {[
          { icon: LayoutGrid, label: 'Painel', tab: 'home' },
          { icon: ArrowLeftRight, label: 'Transações', tab: 'transactions' },
          { icon: Tags, label: 'Categorias', tab: 'categories' },
          { icon: Settings, label: 'Config', tab: 'profile' },
        ].map(({ icon: Icon, label, tab }) => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab as Tab)}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {/* Pill do item ativo: desliza entre as abas. */}
              {isActive && (
                <motion.span
                  layoutId="mobile-nav-active"
                  className="absolute inset-x-1 inset-y-0 rounded-lg bg-brand-soft"
                  transition={reduceMotion ? { duration: 0 } : { duration: DURATION.base, ease: EASE }}
                />
              )}
              <motion.span
                className="relative flex flex-col items-center gap-0.5"
                whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                transition={{ duration: DURATION.fast, ease: EASE }}
              >
                <Icon className="size-5" />
                <span className={isActive ? 'text-brand' : 'text-fg-subtle'}>{label}</span>
              </motion.span>
            </button>
          )
        })}
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
      <ToastProvider>
        <MotionRoot>
          <PublicGate />
        </MotionRoot>
      </ToastProvider>
    </AuthProvider>
  )
}
