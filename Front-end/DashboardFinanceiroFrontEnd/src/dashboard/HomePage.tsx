import { useMemo, useState, useEffect } from 'react'
import { ArrowDownRight, ArrowUpRight, Eye, EyeOff, Plus, ChevronDown, ChevronUp, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useFinance } from '../finance/useFinance'
import { useTransactionForm } from '../finance/TransactionFormContext'
import { useAuth } from '../auth/AuthContext'
import { OrganizerFlow } from './components/OrganizerFlow'
import { isSameMonth, matchesMonthFilter, formatBRL } from '../shared/utils/formatters'
import { getPrefs, initialMonthFilter } from '../shared/services/prefsService'
import { getGoals } from '../shared/services/goalsService'
import type { Tab, MonthFilter } from '../shared/types'
import { DURATION, EASE } from '../shared/motion/tokens'
import { KpiStrip } from '../tinta/KpiStrip'
import { CategoryDonutTinta } from '../tinta/CategoryDonutTinta'
import { BalanceHistoryTinta } from '../tinta/BalanceHistoryTinta'
import { IncomeExpenseTinta } from '../tinta/IncomeExpenseTinta'
import { RecentTinta } from '../tinta/RecentTinta'
import { SaldoTinta } from '../tinta/SaldoTinta'
import { MonthPickerTinta } from '../tinta/MonthPickerTinta'

interface HomePageProps {
  setActiveTab?: (tab: Tab) => void
}

export function HomePage({ setActiveTab }: HomePageProps = {}) {
  const { expenses, categories, loading } = useFinance()
  const { openTransactionForm } = useTransactionForm()
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState<MonthFilter>(initialMonthFilter)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [mask, setMask] = useState(() => {
    const stored = localStorage.getItem('prisma:mask')
    if (stored !== null) return stored === '1'
    return getPrefs().maskByDefault
  })

  const toggleMask = () => {
    setMask((m) => {
      localStorage.setItem('prisma:mask', m ? '0' : '1')
      return !m
    })
  }

  const filtered = useMemo(
    () => expenses.filter((e) => matchesMonthFilter(e.date, selectedMonth)),
    [expenses, selectedMonth],
  )
  const totalIncome = useMemo(() => filtered.filter((e) => e.type === 'income').reduce((s, i) => s + i.amount, 0), [filtered])
  const totalExpense = useMemo(() => filtered.filter((e) => e.type === 'expense').reduce((s, i) => s + i.amount, 0), [filtered])
  const balance = totalIncome - totalExpense

  // Metas são locais (goalsService): o progresso é o gasto do período contra
  // a soma das metas. Reaparece no painel como célula da tira de KPIs.
  const goalTotal = useMemo(() => {
    const goals = getGoals()
    return Object.values(goals).reduce((s, g) => s + g.value, 0)
  }, [expenses])
  const goalPct = goalTotal > 0 ? Math.min(100, Math.round((totalExpense / goalTotal) * 100)) : 0

  const firstName = getPrefs().displayName.trim().split(' ')[0] || user?.name?.split(' ')[0] || 'por aqui'
  // Mês anterior, para o delta percentual dos KPIs.
  const previousMonth = useMemo<MonthFilter>(() => {
    if (selectedMonth.all) return { month: 0, year: 0, all: false }
    return selectedMonth.month === 0
      ? { month: 11, year: selectedMonth.year - 1, all: false }
      : { month: selectedMonth.month - 1, year: selectedMonth.year, all: false }
  }, [selectedMonth])

  const previousTotals = useMemo(() => {
    if (selectedMonth.all) return { income: 0, expense: 0 }
    const inPrev = expenses.filter((e) => matchesMonthFilter(e.date, previousMonth))
    return {
      income: inPrev.filter((e) => e.type === 'income').reduce((s, i) => s + i.amount, 0),
      expense: inPrev.filter((e) => e.type === 'expense').reduce((s, i) => s + i.amount, 0),
    }
  }, [expenses, previousMonth, selectedMonth.all])

  /** Variação percentual vs. mês anterior (null quando não há base). */
  const percentDelta = (current: number, previous: number): number | null => {
    if (selectedMonth.all || previous === 0) return null
    return Math.round(((current - previous) / Math.abs(previous)) * 100)
  }

  const todayLabel = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  const greeting = balance >= 0 || filtered.length === 0
    ? 'Tudo sob controle por aqui.'
    : 'Vamos recuperar esse saldo juntos.'

  const chartData = useMemo(() => {
    const byCat: Record<string, { value: number; color?: string }> = {}
    for (const e of filtered) {
      if (e.type !== 'expense') continue
      const cat = categories.find((c) => c.id === e.categoryId)
      const name = cat?.name || 'Sem categoria'
      if (!byCat[name]) byCat[name] = { value: 0, color: cat?.color }
      byCat[name].value += e.amount
    }
    return Object.entries(byCat).map(([name, d]) => ({ name, value: d.value, color: d.color }))
  }, [filtered, categories])

  return (
    <main className="bg-page-grid flex-1 overflow-y-auto px-4 pt-9 pb-10 sm:px-6 lg:px-10">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-2.5">
          <span className="text-[13px] font-medium text-fg-muted capitalize">{todayLabel}</span>
          <div className="flex items-center gap-4">
            <h1 className="font-display text-3xl leading-tight sm:text-5xl sm:leading-[52px] font-normal tracking-[-0.02em] text-fg">Olá, {firstName}</h1>
            <button
              type="button"
              onClick={toggleMask}
              className="flex size-8 items-center justify-center rounded-lg border border-edge text-fg-muted transition-colors duration-150 hover:border-brand/40 hover:text-fg"
              title={mask ? 'Mostrar valores' : 'Ocultar valores'}
              aria-label={mask ? 'Mostrar valores' : 'Ocultar valores'}
              aria-pressed={mask}
            >
              <motion.span
                className="flex items-center justify-center"
                animate={{ rotate: mask ? 90 : 0 }}
                transition={{ duration: DURATION.fast, ease: EASE }}
              >
                {mask ? <EyeOff className="size-4" strokeWidth={1.8} /> : <Eye className="size-4" strokeWidth={1.8} />}
              </motion.span>
            </button>
          </div>
          <p className="text-[15px] text-fg-muted">{greeting}</p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-stretch gap-3">
            <button
              type="button"
              onClick={() => openTransactionForm('income')}
              className="flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-brand-strong"
            >
              <Plus className="size-4" strokeWidth={2.2} /> Receita
            </button>
            <button
              type="button"
              onClick={() => openTransactionForm('expense')}
              className="flex items-center gap-2 rounded-lg border border-edge bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-fg transition-colors hover:border-brand/40 hover:bg-white/[0.06]"
            >
              <Plus className="size-4" strokeWidth={2.2} /> Despesa
            </button>
            <button
              type="button"
              onClick={() => setShowAdvanced(v => !v)}
              className="flex items-center gap-2 text-sm font-medium text-fg-muted hover:text-fg"
            >
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Filtros avançados
            </button>
          </div>
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <MonthPickerTinta value={selectedMonth} onChange={setSelectedMonth} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Saldo e histórico: o mesmo grupo dos números (mb-4). */}
      <section className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
        <div>
          <SaldoTinta total={balance} count={filtered.length} loading={loading} mask={mask} />
        </div>
        <BalanceHistoryTinta expenses={filtered} month={selectedMonth.month} year={selectedMonth.year} />
      </section>

      <div className="mb-7">
        <KpiStrip
          loading={loading}
          mask={mask}
          items={[
            { label: 'Receitas', value: totalIncome, icon: ArrowUpRight, tone: 'positive', delta: percentDelta(totalIncome, previousTotals.income) },
            { label: 'Gastos', value: totalExpense, icon: ArrowDownRight, tone: 'negative', delta: percentDelta(totalExpense, previousTotals.expense) },
            {
              label: 'Metas',
              value: totalExpense,
              icon: Target,
              tone: 'neutral',
              progress: goalTotal > 0
                ? { pct: goalPct, caption: `de ${formatBRL(goalTotal)}` }
                : { pct: 0, caption: 'Defina metas em Categorias', emptyText: 'Sem meta ainda' },
            },
          ]}
        />
      </div>

      <OrganizerFlow
        expenses={filtered}
        onNavigate={(tab) => setActiveTab?.(tab)}
      />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
        <div className="flex min-w-0 flex-col gap-6">
          <div>
            <CategoryDonutTinta data={chartData} loading={loading} />
          </div>
          <IncomeExpenseTinta expenses={expenses} />
        </div>
        <RecentTinta expenses={filtered} categories={categories} />
      </section>

      {setActiveTab && (
        <button type="button" onClick={() => setActiveTab('transactions')} className="mt-6 text-sm font-medium text-fg-subtle transition-colors hover:text-brand">
          Ver todas as transações
        </button>
      )}
    </main>
  )
}
