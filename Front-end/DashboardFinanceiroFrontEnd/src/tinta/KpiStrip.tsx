import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatBRL } from '../shared/utils/formatters'
import { AnimatedNumber } from '../shared/motion/AnimatedNumber'

type Tone = 'positive' | 'negative' | 'neutral'

export interface KpiItem {
  label: string
  value: number
  icon: LucideIcon
  tone?: Tone
  /** Variação percentual vs. mês anterior (null quando não há base de comparação). */
  delta?: number | null
}

const toneText: Record<Tone, string> = {
  positive: 'text-positive',
  negative: 'text-negative',
  neutral: 'text-fg',
}

const toneIcon: Record<Tone, string> = {
  positive: 'text-positive',
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
      {items.map(({ label, value, icon: Icon, tone = 'neutral', delta }, i) => {
        const hasDelta = typeof delta === 'number' && Number.isFinite(delta)
        const deltaUp = hasDelta && (delta as number) > 0
        const DeltaIcon = deltaUp ? ArrowUpRight : ArrowDownRight
        // Para gastos, subir é ruim; para receitas e saldo, subir é bom.
        const deltaTone = tone === 'negative' ? (deltaUp ? 'text-negative' : 'text-positive') : (deltaUp ? 'text-positive' : 'text-negative')

        return (
          <div
            key={label}
            className={cn(
              // min-w-0: sem isso a célula não encolhe abaixo do conteúdo e a
              // tira estoura a largura da tela entre 640px e 900px.
              'group flex min-h-[132px] min-w-0 flex-1 flex-col justify-between gap-4 px-6 py-5 transition-colors duration-150 hover:bg-white/[0.02]',
              i < n - 1 && 'border-b border-edge sm:border-b-0 sm:border-r',
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="min-w-0 truncate text-[13px] font-medium text-fg-muted">{label}</span>
              <span className="flex shrink-0 items-center gap-2">
                {hasDelta && (
                  <span
                    className={cn(
                      'flex items-center gap-0.5 text-[12px] font-medium tabular-nums opacity-0 transition-opacity duration-150 group-hover:opacity-100',
                      deltaTone,
                    )}
                  >
                    <DeltaIcon className="size-3.5" strokeWidth={2} />
                    {Math.abs(delta as number)}%
                  </span>
                )}
                <span className="flex size-7 shrink-0 items-center justify-center border border-edge">
                  <Icon className={cn('size-4', toneIcon[tone])} strokeWidth={1.8} />
                </span>
              </span>
            </div>
            {loading ? (
              <div className="h-10 w-44 animate-shimmer bg-surface-raised" />
            ) : (
              <span
                className={cn(
                  // truncate + tamanho responsivo: o número é o item mais largo
                  // da célula e, em tela estreita, encolhe em vez de vazar.
                  'font-display text-[26px] leading-8 font-medium tracking-[-0.02em] tabular-nums truncate sm:text-[28px] sm:leading-9 xl:text-[34px] xl:leading-10',
                  toneText[tone],
                )}
              >
                <AnimatedNumber value={value} format={formatBRL} mask={mask} />
              </span>
            )}
          </div>
        )
      })}
      {Array.from({ length: n + 1 }).map((_, i) => (
        <span key={i} className="hidden sm:contents">
          <Cross className="-top-[5px]" style={{ left: `${(i / n) * 100}%` }} />
          <Cross className="-bottom-[5px]" style={{ left: `${(i / n) * 100}%` }} />
        </span>
      ))}
    </section>
  )
}
