import { NEGATIVE, POSITIVE } from '../shared/utils/palette';

/**
 * Cores dos gráficos — derives de `shared/utils/palette.ts` (fonte única).
 *
 * `brand` é o branco da identidade; `income`/`expense` são a semântica
 * verde/rosa, iguais a `--color-positive` / `--color-negative` do CSS.
 */
export const CHART = {
  income: POSITIVE,
  expense: NEGATIVE,
  brand: '#fafafa',
  grid: 'rgba(255, 255, 255, 0.06)',
  axis: 'rgba(250, 250, 249, 0.42)',
  surface: '#0a0a0a',
  edge: 'rgba(255, 255, 255, 0.1)',
} as const;

export { DATA_PALETTE as CATEGORY_PALETTE, OTHERS_COLOR, paletteColor as categoryColor } from '../shared/utils/palette';
