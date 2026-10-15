import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Pencil, Plus, Target, Trash2 } from 'lucide-react'
import { useFinance } from '../finance/useFinance'
import { getGoals, setGoal, type GoalsMap } from '../shared/services/goalsService'
import { GoalModal, type GoalModalState } from './GoalModal'
import { formatBRL, formatMonthYear, isSameMonth } from '../shared/utils/formatters'
import type { MonthFilter } from '../shared/types'

/** Aba Metas: quanto cada categoria pode gastar no mês. Só front, sem backend. */
export function GoalsPage() {
  const { expenses, categories } = useFinance()
  const now = new Date()
  const [month, setMonth] = useState<MonthFilter>({ month: now.getMonth(), year: now.getFullYear() })
  const [goals, setGoalsState] = useState<GoalsMap>(() => getGoals())
  const [modal, setModal] = useState<GoalModalState | null>(null)

  const prevMonth = () =>
    setMonth((m) => (m.month === 0 ? { month: 11, year: m.year - 1 } : { month: m.month - 1, year: m.year }))
  const nextMonth = () =>
    setMonth((m) => (m.month === 11 ? { month: 0, year: m.year + 1 } : { month: m.month + 1, year: m.year }))

  const spentByCat = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of expenses) {
      if (e.type !== 'expense' || !isSameMonth(e.date, month.month, month.year)) continue
      map.set(e.categoryId, (map.get(e.categoryId) ?? 0) + e.amount)
    }
    return map
  }, [expenses, month])

  const rows = useMemo(
    () =>
      Object.entries(goals)
        .map(([id, g]) => ({
          id,
          goal: g.value,
          description: g.description,
          spent: spentByCat.get(id) ?? 0,
          cat: categories.find((c) => c.id === id),
        }))
        .filter((r) => r.cat)
        .sort((a, b) => b.spent / b.goal - a.spent / a.goal),
    [goals, spentByCat, categories],
  )

  const goalTotal = rows.reduce((s, r) => s + r.goal, 0)
  const spentTotal = rows.reduce((s, r) => s + Math.min(r.spent, r.goal), 0)
  const totalPct = goalTotal > 0 ? Math.min(100, Math.round((spentTotal / goalTotal) * 100)) : 0
  const over = rows.filter((r) => r.spent > r.goal).length
  const freeCats = categories.filter((c) => c.type === 'expense' && !(c.id in goals))

  const saveModal = (categoryId: string, value: number, description: string) => {
    setGoalsState(setGoal(categoryId, value, description))
  }

  const remove = (id: string, name: string) => {
    if (!window.confirm(`Excluir a meta de "${name}"? As transações ficam salvas.`)) return
    setGoalsState(setGoal(id, 0))
  }

  return (
    <main className="bg-page-grid flex-1 overflow-y-auto px-4 pt-9 pb-10 sm:px-6 lg:px-10">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-2.5">
          <span className="text-[13px] font-medium text-fg-muted">Planejamento</span>
          <h1 className="font-display text-5xl leading-[52px] font-normal tracking-[-0.02em] text-fg">Metas</h1>
          <p className="text-[15px] text-fg-muted">Quanto cada categoria pode gastar no mês.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-edge bg-surface p-1">
            <button type="button" onClick={prevMonth} aria-label="Mês anterior" className="flex size-8 items-center justify-center rounded-lg text-fg-muted transition-colors hover:text-fg">
              <ChevronLeft className="size-4" />
            </button>
            <span className="min-w-[120px] text-center text-xs text-fg-muted capitalize tabular-nums">
              {formatMonthYear(month.month, month.year)}
            </span>
            <button type="button" onClick={nextMonth} aria-label="Próximo mês" className="flex size-8 items-center justify-center rounded-lg text-fg-muted transition-colors hover:text-fg">
              <ChevronRight className="size-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setModal({ mode: 'create', categoryId: '', categoryName: '', value: '', description: '' })}
            disabled={freeCats.length === 0}
            className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="size-4" strokeWidth={2.2} />
            Nova meta
          </button>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-edge bg-surface/50 px-6 py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft">
            <Target className="size-6 text-brand" strokeWidth={1.8} />
          </span>
          <p className="font-display text-xl text-fg">Nenhuma meta ainda</p>
          <p className="max-w-xs text-sm text-fg-muted">Defina um teto de gastos por categoria e acompanhe o mês aqui.</p>
          {freeCats.length > 0 && (
            <button
              type="button"
              onClick={() => setModal({ mode: 'create', categoryId: '', categoryName: '', value: '', description: '' })}
              className="mt-1 flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              <Plus className="size-4" strokeWidth={2.2} />
              Criar primeira meta
            </button>
          )}
        </div>
      ) : (
        <>
          <section className="mb-6 flex flex-col gap-2 rounded-2xl border border-edge bg-surface p-6">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[13px] font-medium text-fg-muted">Resumo do mês</span>
              <span className="font-display text-2xl font-medium tabular-nums text-fg">
                {formatBRL(spentTotal)} <span className="text-sm font-normal text-fg-muted">de {formatBRL(goalTotal)}</span>
              </span>
            </div>
            <span className="h-2 overflow-hidden rounded-full bg-surface-raised">
              <span
                className={`block h-full rounded-full transition-all ${over > 0 ? 'bg-negative' : 'bg-brand'}`}
                style={{ width: `${totalPct}%` }}
              />
            </span>
            <p className="text-[13px] text-fg-muted">
              {over > 0
                ? `${over} ${over === 1 ? 'categoria estourou' : 'categorias estouraram'} a meta.`
                : 'Tudo dentro do planejado.'}
            </p>
          </section>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {rows.map(({ id, goal, description, spent, cat }) => {
              const pct = goal > 0 ? Math.min(100, Math.round((spent / goal) * 100)) : 0
              const isOver = spent > goal
              return (
                <div key={id} className="flex flex-col gap-3 rounded-2xl border border-edge bg-surface p-5">
                  <div className="flex items-center gap-3">
                    <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: cat!.color }} aria-hidden />
                    <span className="min-w-0 flex-1 truncate font-medium text-fg">{cat!.name}</span>                    <button
                      type="button"
                      onClick={() => setModal({ mode: 'edit', categoryId: id, categoryName: cat!.name, value: String(goal).replace('.', ','), description })}
                      aria-label={`Editar meta de ${cat!.name}`}
                      className="flex size-8 items-center justify-center rounded-lg text-fg-subtle transition-colors hover:text-brand"
                    >
                      <Pencil className="size-4" strokeWidth={1.8} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(id, cat!.name)}
                      aria-label={`Excluir meta de ${cat!.name}`}
                      className="flex size-8 items-center justify-center rounded-lg text-fg-subtle transition-colors hover:text-negative"
                    >
                      <Trash2 className="size-4" strokeWidth={1.8} />
                    </button>
                  </div>
                  {description && (
                    <p className="truncate text-[13px] text-fg-muted">{description}</p>
                  )}
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={`font-display text-xl font-medium tabular-nums ${isOver ? 'text-negative' : 'text-fg'}`}>
                      {formatBRL(spent)}
                    </span>
                    <span className="text-xs tabular-nums text-fg-muted">de {formatBRL(goal)}</span>
                  </div>
                  <span className="h-1.5 overflow-hidden rounded-full bg-surface-raised">
                    <span
                      className={`block h-full rounded-full ${isOver ? 'bg-negative' : 'bg-brand'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}

      <GoalModal
        state={modal}
        categories={categories}
        onClose={() => setModal(null)}
        onSave={saveModal}
      />
    </main>
  )
}
