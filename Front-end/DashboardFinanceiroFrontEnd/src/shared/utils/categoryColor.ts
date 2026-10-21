/**
 * Symbolic category color — deterministic, no free color picker.
 *
 * Delegates to the shared palette (`shared/utils/palette.ts`) so a category
 * keeps the same color everywhere: donut, lista de transações e cartões.
 * The backend never stores color (CategoriaDTO has no color field), so this
 * is display-only.
 */
import { symbolicPaletteColor } from './palette';

export { DATA_PALETTE as SYMBOLIC_CATEGORY_PALETTE } from './palette';

/** Stable color derived from the category name (order-independent). */
export function symbolicCategoryColor(name: string): string {
  return symbolicPaletteColor(name);
}
