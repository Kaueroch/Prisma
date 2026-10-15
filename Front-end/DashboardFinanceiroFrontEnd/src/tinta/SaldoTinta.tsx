import { formatBRL } from '../shared/utils/formatters'
import { cn } from '@/lib/utils'

/** Running balance — Prisma version without accounts API (all local transactions). */
export function SaldoTinta({ total, count, loading = false, mask = false }: { total: number; count: number; loading?: boolean; mask?: boolean }) {
  return (
    <section className="flex h-full min-h-[300px] flex-col justify-between gap-6 rounded-xl border border-edge bg-surface p-6">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[13px] font-medium text-fg-muted">Saldo atual</span>
        <span className="text-xs text-fg-subtle">
          {count} {count === 1 ? 'transação' : 'transações'}
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
          <span className="truncate text-[13px] text-fg-subtle">All local activity</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-edge bg-brand-soft px-4 py-1.5 text-[13px] font-semibold text-fg">Todas</span>
        <span className="rounded-full border border-edge bg-white/[0.03] px-4 py-1.5 text-[13px] text-fg-muted">Contas de bots em breve</span>
      </div>
    </section>
  )
}
