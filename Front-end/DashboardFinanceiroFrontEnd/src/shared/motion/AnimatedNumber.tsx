import { useCallback, useEffect, useRef } from 'react'
import { animate, useMotionValue, useMotionValueEvent } from 'motion/react'
import { useReducedMotion } from './useReducedMotion'
import { DURATION, EASE } from './tokens'

interface AnimatedNumberProps {
  /** Valor alvo. */
  value: number
  /** Formata o número para exibição (default: valor bruto). */
  format?: (value: number) => string
  /** Quando true, exibe o placeholder de máscara e não anima. */
  mask?: boolean
  /** Placeholder usado no modo máscara. */
  maskText?: string
  /** Duração do count-up em segundos. */
  duration?: number
  className?: string
}

/**
 * Número que conta até o valor alvo.
 *
 * Na montagem ele sobe de zero até o valor; nas trocas de valor (mês, filtro,
 * novo lançamento) ele transita a partir do valor atual. Com
 * `prefers-reduced-motion` o valor final é aplicado direto, sem animação.
 *
 * O texto é escrito direto no DOM via ref, em vez de via state: assim o
 * count-up não dispara um re-render por quadro. Passar um `MotionValue`
 * como children não resolveria — o Framer Motion memoiza o valor inicial
 * do child e o texto ficaria congelado.
 */
export function AnimatedNumber({
  value,
  format,
  mask = false,
  maskText = '••••••',
  duration = DURATION.slow,
  className,
}: AnimatedNumberProps) {
  const reduce = useReducedMotion()
  const count = useMotionValue(0)
  const ref = useRef<HTMLSpanElement>(null)

  // O formatador fica num ref: se fosse dependência do effect, uma função
  // nova a cada render reiniciaria a animação sem parar.
  const formatRef = useRef(format)
  useEffect(() => {
    formatRef.current = format
  }, [format])

  const render = useCallback((latest: number) => {
    const fn = formatRef.current
    return fn ? fn(latest) : String(latest)
  }, [])

  // Escreve o valor atual no DOM a cada quadro da animação.
  useMotionValueEvent(count, 'change', (latest) => {
    if (ref.current) ref.current.textContent = render(latest)
  })

  useEffect(() => {
    if (mask) {
      // Mantém o valor interno sincronizado enquanto mascarado, para o
      // count-up ao revelar partir do lugar certo.
      count.set(value)
      return
    }

    if (reduce) {
      count.set(value)
      if (ref.current) ref.current.textContent = render(value)
      return
    }

    const controls = animate(count, value, { duration, ease: EASE })
    return () => controls.stop()
  }, [count, value, duration, reduce, mask, render])

  if (mask) {
    return <span className={className}>{maskText}</span>
  }

  return (
    <span ref={ref} className={className}>
      {render(count.get())}
    </span>
  )
}
