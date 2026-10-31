/**
 * Decide se o app reduz animações.
 *
 * O app NÃO segue o `prefers-reduced-motion` do sistema: no Pop!_OS, desligar
 * as animações do desktop (para deixar o PC mais leve) faz o navegador pedir
 * movimento reduzido, e o painel perdia todas as micro-interações.
 * Para voltar a respeitar o sistema, troque por:
 *   export { useReducedMotion } from 'motion/react'
 */
export function useReducedMotion(): boolean {
  return false
}
