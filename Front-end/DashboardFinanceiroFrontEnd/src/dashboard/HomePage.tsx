import { useMemo, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Eye, EyeOff, Scale, Plus } from 'lucide-react'
import { useFinance } from '../finance/useFinance'
import { useTransactionForm } from '../finance/TransactionFormContext'
import { getCurrentMonth, isSameMonth } from '../shared/utils/formatters'
import type { Tab, MonthFilter } from '../shared/types'
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
  const [selectedMonth, setSelectedMonth] = useState<MonthFilter>(getCurrentMonth)
  const [mask, setMask] = useState(() => localStorage.getItem('prisma:mask') === '1')

  const toggleMask = () => {
    setMask((m) => {
      localStorage.setItem('prisma:mask', m ? '0' : '1')
      return !m
    })
  }

  const filtered = useMemo(
    () => expenses.filter((e) => isSameMonth(e.date, selectedMonth.month, selectedMonth.year)),
    [expenses, selectedMonth],
  )
  const totalIncome = useMemo(() => filtered.filter((e) => e.type === 'income').reduce((s, i) => s + i.amount, 0), [filtered])
  const totalExpense = useMemo(() => filtered.filter((e) => e.type === 'expense').reduce((s, i) => s + i.amount, 0), [filtered])
  const balance = totalIncome - totalExpense

  const chartData = useMemo(() => {
    const byCat: Record<string, number> = {}
    for (const e of filtered) {
      if (e.type !== 'expense') continue
      const cat = categories.find((c) => c.id === e.categoryId)
      const name = cat?.name || 'Uncategorized'
      byCat[name] = (byCat[name] ?? 0) + e.amount
    }
    return Object.entries(byCat).map(([name, value]) => ({ name, value }))
  }, [filtered, categories])

  return (
    <main className="bg-page-grid flex-1 overflow-y-auto px-10 pt-9 pb-10">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-2.5">
          <span className="eyebrow">Overview</span>
          <div className="flex items-center gap-4">
            <h1 className="font-display text-5xl leading-[52px] font-normal tracking-[-0.02em] text-fg">Dashboard</h1>
            <button
              type="button"
              onClick={toggleMask}
              className="flex size-8 items-center justify-center border border-edge text-fg-muted transition-colors duration-150 hover:border-white/30 hover:text-fg"
              title={mask ? 'Show values' : 'Hide values'}
              aria-label={mask ? 'Show values' : 'Hide values'}
            >
              {mask ? <EyeOff className="size-4" strokeWidth={1.8} /> : <Eye className="size-4" strokeWidth={1.8} />}
            </button>
          </div>
          <p className="text-[15px] text-fg-muted">Your finances organized in 5 seconds.</p>
        </div>
        <div className="flex flex-wrap items-stretch gap-3">
          <MonthPickerTinta value={selectedMonth} onChange={setSelectedMonth} />
          <button
            type="button"
            onClick={() => openTransactionForm('income')}
            className="flex items-center gap-2 bg-brand px-5 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" strokeWidth={2.2} /> Income
          </button>
          <button
            type="button"
            onClick={() => openTransactionForm('expense')}
            className="flex items-center gap-2 border border-edge px-5 py-2.5 text-sm font-medium text-fg transition-colors hover:border-white/30"
          >
            <Plus className="size-4" strokeWidth={2.2} /> Expense
          </button>
        </div>
      </header>

      <section className="mb-7 grid grid-cols-1 gap-6 xl:grid-cols-[400px_1fr]">
        <SaldoTinta total={balance} count={filtered.length} loading={loading} mask={mask} />
        <BalanceHistoryTinta expenses={filtered} month={selectedMonth.month} year={selectedMonth.year} />
      </section>

      <div className="mb-7">
        <KpiStrip
          loading={loading}
          mask={mask}
          items={[
            { label: 'Income', value: totalIncome, icon: ArrowUpRight, tone: 'data' },
            { label: 'Expense', value: totalExpense, icon: ArrowDownRight, tone: 'negative' },
            { label: 'Period balance', value: balance, icon: Scale, tone: balance < 0 ? 'negative' : 'neutral' },
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
        <button type="button" onClick={() => setActiveTab('transactions')} className="mt-6 font-mono text-xs text-fg-subtle hover:text-brand">
          View all transactions →
        </button>
      )}
    </main>
  )
}
