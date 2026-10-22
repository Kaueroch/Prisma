/**
 * Tokens de motion compartilhados.
 *
 * Alinhado ao design system: mudança de estado entre 150-220ms, entrada
 * única por tela e nada acima de 300ms (exceto count-up de números, que
 * precisa de tempo para ser lido).
 */

/** Durações em segundos (unidade do Motion). */
export const DURATION = {
  /** Hover, foco, crossfade de texto. */
  fast: 0.15,
  /** Padrão: expansão de painel, troca de estado. */
  base: 0.18,
  /** Count-up de valores e barras de progresso. */
  slow: 0.22,
} as const;

/** Easing padrão: decelerada, sem bounce. */
export const EASE = [0.16, 1, 0.3, 1] as const;

/** Easing de entrada (usado em slides). */
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

/** Transição padrão compartilhada. */
export const TRANSITION = { duration: DURATION.base, ease: EASE } as const;

/** Transição padrão para count-up de números. */
export const VALUE_TRANSITION = { duration: DURATION.slow, ease: EASE } as const;
