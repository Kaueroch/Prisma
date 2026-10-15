import { useMemo } from 'react'
import { TrendingDown, TrendingUp, Crown, Target, Plus } from 'lucide-react'
import { useTransactionForm } from '../finance/TransactionFormContext'
import { isSameMonth, formatBRL, formatMonthYear } from '../shared/utils/formatters'
import { getGoals } from '../shared/services/goalsService'
import type { CategoryInfo, Expense, MonthFilter } from '../shared/types'

interface InsightBannerProps {
  expenses: Expense[]
  categories: CategoryInfo[]
  month: MonthFilter
}

/** Faixa de destaques do mês: maior categoria, comparativo e metas. */
export function InsightBanner({ expenses, categories, month }: InsightBannerProps) {
  const { openTransactionForm } = useTransactionForm()

  const data = useMemo(() => {
    const inMonth = expenses.filter((e) => isSameMonth(e.date, month.month, month.year))
    const prev = month.month === 0 ? { month: 11, year: month.year - 1 } : { month: month.month - 1, year: month.year }
    const inPrev = expenses.filter((e) => isSameMonth(e.date, prev.month, prev.year))

    const spent = inMonth.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
    const spentPrev = inPrev.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)

    const byCat = new Map<string, number>()
    for (const e of inMonth) {
      if (e.type !== 'expense') continue
      byCat.set(e.categoryId, (byCat.get(e.categoryId) ?? 0) + e.amount)
    }
    let topId: string | null = null
    let topValue = 0
    for (const [id, v] of byCat) {
      if (v > topValue) {
        topValue = v
        topId = id
      }
    }
    const topName = topId ? categories.find((c) => c.id === topId)?.name ?? 'Categoria' : null

    const goals = getGoals()
    const goalTotal = Object.values(goals).reduce((s, g) => s + g.value, 0)

    return {
      hasAny: expenses.length > 0,
      spent,
      spentPrev,
      prevLabel: formatMonthYear(prev.month, prev.year),
      topName,
      topShare: spent > 0 ? Math.round((topValue / spent) * 100) : 0,
      goalTotal,
    }
  }, [expenses, categories, month])

  if (!data.hasAny) {
    return (
      <section className="mb-7 flex flex-col items-start gap-3 rounded-2xl border border-edge bg-surface p-6 sm:flex-row sm:items-center">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft">
          <Target className="size-5 text-brand" strokeWidth={1.9} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="font-display text-lg text-fg">Comece por uma transação</p>
          <p className="text-sm text-fg-muted">Leva 5 segundos. Seus números aparecem aqui depois disso.</p>
        </div>
        <button
          type="button"
          onClick={() => openTransactionForm()}
          className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
        >
          <Plus className="size-4" strokeWidth={2.2} />
          Registrar
        </button>
      </section>
    )
  }

  const delta = data.spentPrev > 0 ? Math.round(((data.spent - data.spentPrev) / data.spentPrev) * 100) : null
  const goalPct = data.goalTotal > 0 ? Math.min(100, Math.round((data.spent / data.goalTotal) * 100)) : null

  return (
    <section aria-label="Destaques do mês" className="mb-7 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-edge bg-edge sm:grid-cols-2">
      <div className="flex items-center gap-3 bg-surface p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft">
          {delta !== null && delta > 0 ? (
            <TrendingUp className="size-5 text-negative" strokeWidth={1.9} />
          ) : (
            <TrendingDown className="size-5 text-data" strokeWidth={1.9} />
          )}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-display text-lg leading-6 text-fg">
            {data.topName ? `${data.topName} lidera (${data.topShare}%)` : 'Sem gastos no mês'}
          </span>
          <span className="truncate text-[13px] text-fg-muted">
            {delta === null
              ? `primeiro mês com movimento`
              : `${Math.abs(delta)}% ${delta > 0 ? 'a mais' : 'a menos'} que em ${data.prevLabel}`}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 bg-surface p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft">
          {goalPct !== null && goalPct >= 100 ? (
            <Crown className="size-5 text-brand" strokeWidth={1.9} />
          ) : (
            <Target className="size-5 text-brand" strokeWidth={1.9} />
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {goalPct === null ? (
            <>
              <span className="font-display text-lg leading-6 text-fg">Sem meta ainda</span>
              <span className="truncate text-[13px] text-fg-muted">Defina metas em Categorias</span>
            </>
          ) : (
            <>
              <span className="font-display text-lg leading-6 text-fg tabular-nums">
                {formatBRL(data.spent)} <span className="text-sm font-normal text-fg-muted">de {formatBRL(data.goalTotal)}</span>
              </span>
              <span className="h-1.5 overflow-hidden rounded-full bg-surface-raised">
                <span
                  className={`block h-full rounded-full ${goalPct >= 100 ? 'bg-negative' : 'bg-brand'}`}
                  style={{ width: `${goalPct}%` }}
                />
              </span>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
