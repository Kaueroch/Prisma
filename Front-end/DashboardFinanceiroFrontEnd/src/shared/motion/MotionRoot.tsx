import type { ReactNode } from 'react'
import { MotionConfig } from 'motion/react'
import { EASE } from './tokens'

/**
 * Raiz de motion da aplicação.
 *
 * `reducedMotion="user"` faz o Motion respeitar `prefers-reduced-motion`
 * globalmente: com a preferência ativada, animações de transform/layout são
 * desligadas e só o opacity/opacity-related continua. Isso fecha a lacuna
 * que existia antes, onde a regra CSS em `index.css` zerava apenas
 * animações CSS e deixavam as animações JS rodando.
 */
export function MotionRoot({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.18, ease: EASE }}>
      {children}
    </MotionConfig>
  )
}
