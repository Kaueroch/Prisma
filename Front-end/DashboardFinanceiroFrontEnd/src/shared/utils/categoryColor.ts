/**
 * Symbolic category color — deterministic, no free color picker.
 * Same muted jewel family as the charts, so categories stay harmonious
 * with the purple/black identity. The backend never stores color
 * (CategoriaDTO has no color field), so this is display-only.
 */

export const SYMBOLIC_CATEGORY_PALETTE = [
  '#8578C8',
  '#8FBF9F',
  '#D48A90',
  '#C9A86A',
  '#7EA8D8',
  '#A88CC8',
] as const

/** Stable color derived from the category name (order-independent). */
export function symbolicCategoryColor(name: string): string {
  const key = name.trim().toLowerCase() || '?'
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  }
  return SYMBOLIC_CATEGORY_PALETTE[hash % SYMBOLIC_CATEGORY_PALETTE.length]
}
