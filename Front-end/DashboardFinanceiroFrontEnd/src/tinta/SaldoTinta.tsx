import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { formatBRL } from '../shared/utils/formatters'
import { AnimatedNumber } from '../shared/motion/AnimatedNumber'
import { Crossfade } from '../shared/motion/Crossfade'
import { cn } from '@/lib/utils'
import { DURATION, EASE } from '../shared/motion/tokens'

/** Running balance — Prisma Finance version without accounts API (all local transactions). */
export function SaldoTinta({ total, count, loading = false, mask = false }: { total: number; count: number; loading?: boolean; mask?: boolean }) {
  const reduce = useReducedMotion()
  const previousSign = useRef(total < 0 ? -1 : 1)
  const [flash, setFlash] = useState(false)

  // Pulso de 1 ciclo quando o saldo muda de sinal (entrou abaixo de zero).
  useEffect(() => {
    const sign = total < 0 ? -1 : 1
    if (sign !== previousSign.current) {
      previousSign.current = sign
      setFlash(true)
      const timer = setTimeout(() => setFlash(false), 600)
      return () => clearTimeout(timer)
    }
  }, [total])

  return (
    <section className="flex h-full min-h-[300px] flex-col justify-between gap-6 rounded-none border border-edge bg-surface p-6">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[13px] font-medium text-fg-muted">Saldo atual</span>
        <span className="text-xs text-fg-subtle">
          {count} {count === 1 ? 'transação' : 'transações'}
        </span>
      </div>
      {loading ? (
        <div className="flex flex-col gap-3">
          <div className="h-11 w-56 animate-shimmer bg-surface-raised" />
          <div className="h-4 w-44 animate-shimmer bg-surface-raised" />
        </div>
      ) : (
        <motion.div
          className="flex flex-col gap-2"
          animate={flash && !reduce ? { scale: [1, 1.015, 1] } : { scale: 1 }}
          transition={{ duration: DURATION.slow, ease: EASE }}
        >
          <Crossfade
            changeKey={mask ? 'masked' : 'value'}
            variant="fade"
            className={cn('font-display text-[44px] leading-[48px] font-medium tracking-[-0.02em] tabular-nums whitespace-nowrap', total < 0 ? 'text-negative' : 'text-fg')}
          >
            <AnimatedNumber value={total} format={formatBRL} mask={mask} />
          </Crossfade>
          <span className="truncate text-[13px] text-fg-subtle">Receitas menos gastos no período</span>
        </motion.div>
      )}
    </section>
  )
}
