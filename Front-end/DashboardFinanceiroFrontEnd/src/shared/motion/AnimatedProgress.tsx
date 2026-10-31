import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { useReducedMotion } from './useReducedMotion'
import { DURATION, EASE } from './tokens'

interface AnimatedProgressProps {
  /** Percentual já calculado (0-100). */
  value: number
  /** Classe da barra (cor). */
  barClassName?: string
  /** Classe do trilho. */
  className?: string
  /** Rótulo acessível describing o progresso. */
  label?: string
}

/**
 * Barra de progresso que anima de 0 até o valor.
 *
 * Na montagem preenche a partir de zero; quando o valor muda, transita a
 * partir do valor anterior. Com `prefers-reduced-motion` o largura final é
 * aplicada direto.
 */
export function AnimatedProgress({
  value,
  barClassName = 'bg-brand',
  className = 'h-1.5 overflow-hidden rounded-full bg-surface-raised',
  label,
}: AnimatedProgressProps) {
  const reduce = useReducedMotion()
  const clamped = Math.max(0, Math.min(100, value))
  const previous = useRef(0)

  useEffect(() => {
    if (reduce) previous.current = clamped
  }, [clamped, reduce])

  return (
    <span className={className} role="progressbar" aria-valuenow={Math.round(clamped)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <motion.span
        className={`block h-full rounded-full ${barClassName}`}
        initial={reduce ? { width: `${clamped}%` } : { width: '0%' }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: reduce ? 0 : DURATION.slow, ease: EASE }}
        style={{ willChange: 'width' }}
      />
    </span>
  )
}
