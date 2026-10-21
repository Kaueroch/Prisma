import { NEGATIVE, POSITIVE } from '../shared/utils/palette';

/**
 * Cores dos gráficos — derives de `shared/utils/palette.ts` (fonte única).
 *
 * `brand` é o âmbar da identidade; `income`/`expense` são a semântica
 * verde/rosa, iguais a `--color-positive` / `--color-negative` do CSS.
 */
export const CHART = {
  income: POSITIVE,
  expense: NEGATIVE,
  brand: '#fbbf24',
  grid: 'rgba(251, 191, 36, 0.07)',
  axis: 'rgba(250, 250, 249, 0.42)',
  surface: '#161310',
  edge: 'rgba(251, 191, 36, 0.12)',
} as const;

export { DATA_PALETTE as CATEGORY_PALETTE, OTHERS_COLOR, paletteColor as categoryColor } from '../shared/utils/palette';
