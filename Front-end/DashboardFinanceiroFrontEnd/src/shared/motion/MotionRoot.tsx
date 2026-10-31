import type { ReactNode } from 'react'
import { MotionConfig } from 'motion/react'
import { EASE } from './tokens'

/**
 * Raiz de motion da aplicação.
 *
 * `reducedMotion="never"`: o app anima mesmo com `prefers-reduced-motion`
 * ligado no sistema. Motivo e como reverter: `useReducedMotion.ts`.
 */
export function MotionRoot({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="never" transition={{ duration: 0.18, ease: EASE }}>
      {children}
    </MotionConfig>
  )
}
