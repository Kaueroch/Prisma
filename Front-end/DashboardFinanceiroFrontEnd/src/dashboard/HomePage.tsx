import { useMemo, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Eye, EyeOff, Scale, Plus } from 'lucide-react'
import { useFinance } from '../finance/useFinance'
import { useTransactionForm } from '../finance/TransactionFormContext'
import { useAuth } from '../auth/AuthContext'
import { isSameMonth, matchesMonthFilter } from '../shared/utils/formatters'
import { getPrefs, initialMonthFilter } from '../shared/services/prefsService'
import type { Tab, MonthFilter } from '../shared/types'
import { KpiStrip } from '../tinta/KpiStrip'
import { InsightBanner } from '../tinta/InsightBanner'
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

  const firstName = getPrefs().displayName.trim().split(' ')[0] || user?.name?.split(' ')[0] || 'por aqui'
  const todayLabel = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  const greeting = balance >= 0 || filtered.length === 0
    ? 'Tudo sob controle por aqui.'
    : 'Vamos recuperar esse saldo juntos.'

  const chartData = useMemo(() => {
    const byCat: Record<string, number> = {}
    for (const e of filtered) {
      if (e.type !== 'expense') continue
      const cat = categories.find((c) => c.id === e.categoryId)
      const name = cat?.name || 'Sem categoria'
      byCat[name] = (byCat[name] ?? 0) + e.amount
    }
    return Object.entries(byCat).map(([name, value]) => ({ name, value }))
  }, [filtered, categories])

  return (
    <main className="bg-page-grid flex-1 overflow-y-auto px-4 pt-9 pb-10 sm:px-6 lg:px-10">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-2.5">
          <span className="text-[13px] font-medium text-fg-muted capitalize">{todayLabel}</span>
          <div className="flex items-center gap-4">
            <h1 className="font-display text-5xl leading-[52px] font-normal tracking-[-0.02em] text-fg">Olá, {firstName}</h1>
            <button
              type="button"
              onClick={toggleMask}
              className="flex size-8 items-center justify-center rounded-lg border border-edge text-fg-muted transition-colors duration-150 hover:border-brand/40 hover:text-fg"
              title={mask ? 'Mostrar valores' : 'Ocultar valores'}
              aria-label={mask ? 'Mostrar valores' : 'Ocultar valores'}
            >
              {mask ? <EyeOff className="size-4" strokeWidth={1.8} /> : <Eye className="size-4" strokeWidth={1.8} />}
            </button>
          </div>
          <p className="text-[15px] text-fg-muted">{greeting}</p>
        </div>
        <div className="flex flex-wrap items-stretch gap-3">
          <MonthPickerTinta value={selectedMonth} onChange={setSelectedMonth} />
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
        </div>
      </header>

      <InsightBanner expenses={expenses} categories={categories} month={selectedMonth} />

      <section className="mb-7 grid grid-cols-1 gap-6 xl:grid-cols-[400px_1fr]">
        <SaldoTinta total={balance} count={filtered.length} loading={loading} mask={mask} />
        <BalanceHistoryTinta expenses={filtered} month={selectedMonth.month} year={selectedMonth.year} />
      </section>

      <div className="mb-7">
        <KpiStrip
          loading={loading}
          mask={mask}
          items={[
            { label: 'Receitas', value: totalIncome, icon: ArrowUpRight, tone: 'data' },
            { label: 'Gastos', value: totalExpense, icon: ArrowDownRight, tone: 'negative' },
            { label: 'Saldo do período', value: balance, icon: Scale, tone: balance < 0 ? 'negative' : 'neutral' },
          ]}
        />
      </div>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
        <div className="flex min-w-0 flex-col gap-6">
          <CategoryDonutTinta data={chartData} loading={loading} />
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
