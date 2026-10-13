import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatBRL } from '../shared/utils/formatters'

type Tone = 'data' | 'negative' | 'neutral'

export interface KpiItem {
  label: string
  value: number
  icon: LucideIcon
  tone?: Tone
}

const toneText: Record<Tone, string> = {
  data: 'text-data',
  negative: 'text-negative',
  neutral: 'text-fg',
}

const toneIcon: Record<Tone, string> = {
  data: 'text-data',
  negative: 'text-negative',
  neutral: 'text-fg-muted',
}

function Cross({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg
      aria-hidden
      width="9"
      height="9"
      viewBox="0 0 9 9"
      className={cn('pointer-events-none absolute -translate-x-1/2', className)}
      style={style}
    >
      <path d="M4.5 0v9M0 4.5h9" stroke="white" strokeOpacity="0.6" />
    </svg>
  )
}

/** Single KPI strip — signature detail of the Tinta system. */
export function KpiStrip({ items, loading = false, mask = false }: { items: KpiItem[]; loading?: boolean; mask?: boolean }) {
  const n = items.length
  return (
    <section className="relative flex flex-col border border-edge bg-surface/60 sm:flex-row">
      {items.map(({ label, value, icon: Icon, tone = 'neutral' }, i) => (
        <div
          key={label}
          className={cn(
            'flex min-h-[132px] flex-1 flex-col justify-between gap-4 px-6 py-5',
            i < n - 1 && 'border-b border-edge sm:border-b-0 sm:border-r',
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="label-mono text-fg-muted">{label}</span>
            <span className="flex size-7 shrink-0 items-center justify-center border border-edge">
              <Icon className={cn('size-4', toneIcon[tone])} strokeWidth={1.8} />
            </span>
          </div>
          {loading ? (
            <div className="h-10 w-44 animate-pulse bg-surface-raised" />
          ) : (
            <span
              className={cn(
                'font-display text-[34px] leading-10 font-medium tracking-[-0.02em] tabular-nums whitespace-nowrap',
                toneText[tone],
              )}
            >
              {mask ? '••••••' : formatBRL(value)}
            </span>
          )}
        </div>
      ))}
      {Array.from({ length: n + 1 }).map((_, i) => (
        <span key={i} className="hidden sm:contents">
          <Cross className="-top-[5px]" style={{ left: `${(i / n) * 100}%` }} />
          <Cross className="-bottom-[5px]" style={{ left: `${(i / n) * 100}%` }} />
        </span>
      ))}
    </section>
  )
}
