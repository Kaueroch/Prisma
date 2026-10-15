// Prisma palette — verde sobre preto, apoios dessaturados.
export const CHART = {
  income: '#6FD3A0',
  expense: '#D48A90',
  brand: '#3DA56F',
  grid: 'rgba(240,245,242,0.06)',
  axis: 'rgba(240,245,242,0.4)',
  surface: '#18201C',
  edge: 'rgba(143,214,174,0.1)',
} as const

export const CATEGORY_PALETTE = [
  '#3DA56F',
  '#6FD3A0',
  '#D48A90',
  '#D9B45F',
  '#6AA5D2',
  '#8FD6AE',
  '#D28BB0',
] as const

export const OTHERS_COLOR = 'rgba(240,245,242,0.3)'

export function categoryColor(index: number): string {
  return CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]
}
