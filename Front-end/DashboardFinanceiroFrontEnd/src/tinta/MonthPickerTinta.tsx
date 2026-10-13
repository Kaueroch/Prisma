import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonthYear, type getCurrentMonth } from '../shared/utils/formatters'

type Month = ReturnType<typeof getCurrentMonth>

/** Month navigator in the Tinta PeriodPicker style. */
export function MonthPickerTinta({
  value,
  onChange,
}: {
  value: Month
  onChange: (m: Month) => void
}) {
  const prev = () => onChange(value.month === 0 ? { month: 11, year: value.year - 1 } : { month: value.month - 1, year: value.year })
  const next = () => onChange(value.month === 11 ? { month: 0, year: value.year + 1 } : { month: value.month + 1, year: value.year })

  return (
    <div className="flex items-center gap-2.5 border border-edge px-3.5 py-2.5">
      <Calendar className="size-3.5 text-fg-muted" strokeWidth={1.8} />
      <button type="button" onClick={prev} aria-label="Previous month" className="text-fg-muted hover:text-brand">
        <ChevronLeft className="size-3.5" strokeWidth={2.2} />
      </button>
      <span className="min-w-[130px] text-center font-mono text-xs text-fg capitalize">
        {formatMonthYear(value.month, value.year)}
      </span>
      <button type="button" onClick={next} aria-label="Next month" className="text-fg-muted hover:text-brand">
        <ChevronRight className="size-3.5" strokeWidth={2.2} />
      </button>
    </div>
  )
}
