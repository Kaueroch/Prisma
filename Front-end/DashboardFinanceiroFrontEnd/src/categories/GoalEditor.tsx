import { useState } from 'react'
import { Target, Pencil } from 'lucide-react'
import { getGoals, setGoal, type GoalsMap } from '../shared/services/goalsService'
import { isSameMonth, formatBRL } from '../shared/utils/formatters'
import type { Expense } from '../shared/types'

/** Meta mensal da categoria: define, acompanha e edita. Persiste em localStorage. */
export function GoalEditor({ categoryId, expenses }: { categoryId: string; expenses: Expense[] }) {
  const [goals, setGoals] = useState<GoalsMap>(() => getGoals())
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const now = new Date()
  const spent = expenses
    .filter(
      (e) =>
        e.type === 'expense' &&
        e.categoryId === categoryId &&
        isSameMonth(e.date, now.getMonth(), now.getFullYear()),
    )
    .reduce((s, e) => s + e.amount, 0)

  const goal = goals[categoryId]?.value
  const goalDescription = goals[categoryId]?.description
  const pct = goal ? Math.min(100, Math.round((spent / goal) * 100)) : 0

  const save = () => {
    const value = parseFloat(draft.replace(/\./g, '').replace(',', '.'))
    setGoals(setGoal(categoryId, value))
    setEditing(false)
    setDraft('')
  }

  if (!goal && !editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex w-full items-center gap-2.5 rounded-xl border border-dashed border-edge px-4 py-3 text-sm text-fg-muted transition-colors hover:border-brand/40 hover:text-fg"
      >
        <Target className="size-4 shrink-0" strokeWidth={1.8} />
        Definir meta de gastos do mês
      </button>
    )
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-fg-subtle">R$</span>
          <input
            autoFocus
            inputMode="decimal"
            placeholder="300,00"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            className="h-10 w-full rounded-xl border border-edge bg-surface-raised pl-9 pr-3 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-brand/60"
          />
        </div>
        <button
          type="button"
          onClick={save}
          className="h-10 shrink-0 rounded-xl bg-brand px-4 text-sm font-semibold text-black transition-colors hover:bg-brand-strong"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false)
            setDraft('')
          }}
          className="h-10 shrink-0 rounded-xl border border-edge px-4 text-sm text-fg-muted transition-colors hover:text-fg"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-edge bg-surface-raised/50 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs text-fg-muted">
          <Target className="size-3.5" strokeWidth={1.8} />
          Meta do mês
        </span>        <button
          type="button"
          onClick={() => {
            setDraft(String(goal).replace('.', ','))
            setEditing(true)
          }}
          aria-label="Editar meta"
          className="flex items-center gap-1 text-xs text-fg-subtle transition-colors hover:text-brand"
        >
          <Pencil className="size-3" strokeWidth={1.8} />
          Editar
        </button>
      </div>
      {goalDescription && (
        <p className="truncate text-[13px] text-fg-muted">{goalDescription}</p>
      )}
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-display text-lg font-medium tabular-nums text-fg">{formatBRL(spent)}</span>
        <span className="text-xs tabular-nums text-fg-muted">de {formatBRL(goal)}</span>
      </div>
      <span className="h-1.5 overflow-hidden rounded-full bg-surface-raised">
        <span
          className={`block h-full rounded-full transition-all ${pct >= 100 ? 'bg-negative' : 'bg-brand'}`}
          style={{ width: `${pct}%` }}
        />
      </span>
    </div>
  )
}
