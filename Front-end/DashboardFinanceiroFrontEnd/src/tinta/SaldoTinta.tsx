import { formatBRL } from '../shared/utils/formatters'
import { cn } from '@/lib/utils'

/** Running balance — Prisma version without accounts API (all local transactions). */
export function SaldoTinta({ total, count, loading = false, mask = false }: { total: number; count: number; loading?: boolean; mask?: boolean }) {
  return (
    <section className="flex h-full min-h-[300px] flex-col justify-between gap-6 border border-edge bg-surface p-6">
      <div className="flex items-center justify-between gap-4">
        <span className="eyebrow">Running balance</span>
        <span className="font-mono text-[11px] text-fg-subtle">
          {count} {count === 1 ? 'transaction' : 'transactions'}
        </span>
      </div>
      {loading ? (
        <div className="flex flex-col gap-3">
          <div className="h-11 w-56 animate-pulse bg-surface-raised" />
          <div className="h-4 w-44 animate-pulse bg-surface-raised" />
        </div>
      ) : (
        <div className="flex flex-col gap-2 animate-[fadeInUp_400ms_ease]">
          <span className={cn('font-display text-[44px] leading-[48px] font-medium tracking-[-0.02em] tabular-nums whitespace-nowrap', total < 0 ? 'text-negative' : 'text-fg')}>
            {mask ? '••••••' : formatBRL(total)}
          </span>
          <span className="truncate font-mono text-xs text-fg-subtle">•••• 0000 / All local activity</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <span className="border border-brand bg-brand px-3 py-1.5 text-[13px] font-semibold text-black">All</span>
        <span className="border border-edge px-3 py-1.5 text-[13px] text-fg-muted">Bot accounts coming soon</span>
      </div>
    </section>
  )
}
