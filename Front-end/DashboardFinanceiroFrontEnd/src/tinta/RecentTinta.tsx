import { useMemo } from 'react'
import { ArrowLeftRight, ArrowUpRight, ShoppingBag, ReceiptText, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatBRL, formatDateBR } from '../shared/utils/formatters'
import { useTransactionForm } from '../finance/TransactionFormContext'
import type { Expense } from '../shared/types'
import type { CategoryInfo } from '../shared/types'

const ICON = {
  income: ArrowUpRight,
  expense: ShoppingBag,
} as const

export function RecentTinta({
  expenses,
  categories,
  limit = 12,
}: {
  expenses: Expense[]
  categories: CategoryInfo[]
  limit?: number
}) {
  const groups = useMemo(() => {
    const visible = [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
    const map = new Map<string, { day: string; items: Expense[] }>()
    for (const tx of visible) {
      const key = tx.date.slice(0, 10)
      if (!map.has(key)) map.set(key, { day: key, items: [] })
      map.get(key)!.items.push(tx)
    }
    return [...map.values()]
  }, [expenses, limit])

  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])
  const newestId = groups[0]?.items[0]?.id
  const { openTransactionForm } = useTransactionForm()

  return (
    <section className="flex h-full flex-col border border-edge bg-surface">
      <div className="flex items-end justify-between gap-4 px-6 pt-6 pb-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-fg-muted">Movimento</span>
          <h2 className="font-display text-2xl font-normal tracking-[-0.02em] text-fg">Transações recentes</h2>
        </div>
        {expenses.length > 0 && (
          <span className="text-[12px] text-fg-subtle tabular-nums">
            {Math.min(limit, expenses.length)} de {expenses.length}
          </span>
        )}
      </div>
      {groups.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft">
            <ReceiptText className="size-6 text-brand" strokeWidth={1.8} />
          </span>
          <p className="font-display text-lg text-fg">Nenhuma transação neste mês</p>
          <p className="max-w-[240px] text-sm text-fg-muted">Registre a primeira e ela aparece aqui embaixo.</p>
          <button
            type="button"
            onClick={() => openTransactionForm()}
            className="mt-1 flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-[13px] font-semibold text-black transition-colors hover:bg-brand-strong"
          >
            <Plus className="size-4" strokeWidth={2.2} />
            Registrar
          </button>
        </div>
      ) : (
        <div className="flex flex-col">
          {groups.map((group) => (
            <div key={group.day} className="flex flex-col">
              <div className="flex h-9 items-center justify-between border-y border-white/8 bg-white/[0.02] px-6">
                <span className="text-[12px] text-fg-muted">{formatDateBR(group.day)}</span>
              </div>
              <ul className="flex flex-col">
                {group.items.map((tx) => {
                  const Icon = tx.type === 'income' ? ICON.income : ICON.expense
                  const isIncome = tx.type === 'income'
                  const isNew = tx.id === newestId
                  const cat = catById.get(tx.categoryId)
                  return (
                    <li
                      key={tx.id}
                      className={cn(
                        'flex h-[60px] items-center gap-3 px-6 transition-colors duration-150',
                        isNew
                          ? '-mt-px border-y border-brand/50 bg-brand-soft'
                          : 'border-b border-white/8 last:border-b-0 hover:bg-white/[0.03]',
                      )}
                    >
                      <span className={cn('flex size-8 shrink-0 items-center justify-center border', isNew ? 'border-brand/50' : 'border-edge')}>
                        <Icon className={cn('size-4', isNew ? 'text-brand' : isIncome ? 'text-data' : 'text-fg-muted')} strokeWidth={1.8} />
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-sm font-semibold text-fg first-letter:uppercase">{tx.name}</span>
                        <span className="truncate text-[12px] text-fg-subtle">{cat?.name ?? 'Sem categoria'}</span>
                      </div>
                      <span className={cn('shrink-0 font-display text-[15px] font-medium tabular-nums whitespace-nowrap', isIncome ? 'text-data' : 'text-fg')}>
                        {isIncome ? '+' : '−'}
                        {formatBRL(tx.amount)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
          <div className="hidden">
            <ArrowLeftRight className="size-4" />
          </div>
        </div>
      )}
    </section>
  )
}
