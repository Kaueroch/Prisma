// Prisma palette — roxo contido sobre preto, apoios dessaturados.
export const CHART = {
  income: '#5AB99A',
  expense: '#D48A90',
  brand: '#8578C8',
  grid: 'rgba(200,190,230,0.06)',
  axis: 'rgba(236,233,245,0.45)',
  surface: '#1A1628',
  edge: 'rgba(200,190,230,0.09)',
} as const

export const CATEGORY_PALETTE = [
  '#8578C8',
  '#8FBF9F',
  '#D48A90',
  '#C9A86A',
  '#7EA8D8',
  '#A89FD0',
  '#C78BB0',
] as const

export const OTHERS_COLOR = 'rgba(236,233,245,0.3)'

export function categoryColor(index: number): string {
  return CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]
}
