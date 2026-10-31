import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useReducedMotion } from './useReducedMotion'
import { DURATION, EASE } from './tokens'

type CrossfadeVariant = 'slide' | 'fade'

interface CrossfadeProps {
  /** Chave que dispara a troca (ex.: `mask ? 'on' : 'off'`). */
  changeKey: string
  children: ReactNode
  className?: string
  /** `slide` desliza na vertical, `fade` só dissolve. */
  variant?: CrossfadeVariant
  /** Deslocamento vertical em pixels. */
  distance?: number
}

/**
 * Troca de conteúdo com crossfade.
 *
 * Usado onde o valor muda "no lugar" — máscara de valores, label de mês,
 * ícone de tendência — para o dado não saltar de um estado a outro.
 */
export function Crossfade({
  changeKey,
  children,
  className,
  variant = 'slide',
  distance = 4,
}: CrossfadeProps) {
  const reduce = useReducedMotion()
  const offset = variant === 'slide' && !reduce ? distance : 0

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={changeKey}
        className={className}
        initial={{ opacity: 0, y: -offset }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: offset }}
        transition={{ duration: reduce ? 0 : DURATION.fast, ease: EASE }}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  )
}
