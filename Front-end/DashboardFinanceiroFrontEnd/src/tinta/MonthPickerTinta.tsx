import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonthYear, formatMonthFilter, getCurrentMonth } from '../shared/utils/formatters'
import type { MonthFilter } from '../shared/types'

type Month = MonthFilter

/** Month navigator in the Tinta PeriodPicker style. */
export function MonthPickerTinta({
  value,
  onChange,
}: {
  value: Month
  onChange: (m: Month) => void
}) {
  const now = getCurrentMonth()
  const prev = () => onChange(value.month === 0 ? { month: 11, year: value.year - 1, all: false } : { month: value.month - 1, year: value.year, all: false })
  const next = () => onChange(value.month === 11 ? { month: 0, year: value.year + 1, all: false } : { month: value.month + 1, year: value.year, all: false })

  if (value.all) {
    return (
      <div className="flex items-center gap-2.5 border border-edge px-3.5 py-2.5">
        <Calendar className="size-3.5 text-fg-muted" strokeWidth={1.8} />
        <span className="min-w-[130px] text-center text-[13px] text-fg capitalize tabular-nums">Todos os meses</span>
        <button
          type="button"
          onClick={() => onChange({ month: now.month, year: now.year, all: false })}
          className="rounded-lg border border-brand bg-brand-soft px-3 py-1.5 text-[11px] font-semibold text-brand transition-colors hover:bg-brand/20"
        >
          Por mês
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2.5 border border-edge px-3.5 py-2.5">
      <Calendar className="size-3.5 text-fg-muted" strokeWidth={1.8} />
      <button type="button" onClick={prev} aria-label="Mês anterior" className="text-fg-muted hover:text-brand">
        <ChevronLeft className="size-3.5" strokeWidth={2.2} />
      </button>
      <span className="min-w-[130px] text-center text-[13px] text-fg capitalize tabular-nums">
        {formatMonthYear(value.month, value.year)}
      </span>
      <button type="button" onClick={next} aria-label="Próximo mês" className="text-fg-muted hover:text-brand">
        <ChevronRight className="size-3.5" strokeWidth={2.2} />
      </button>
      <button
        type="button"
        onClick={() => onChange({ ...value, all: true })}
        className="rounded-lg border border-edge bg-transparent px-3 py-1.5 text-[11px] font-semibold text-fg-muted transition-colors hover:border-brand/40 hover:text-fg"
      >
        Todos
      </button>
    </div>
  )
}