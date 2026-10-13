// Port do money-flow (Opus 5) — paleta derivada dos tokens Tinta.
// Mantém contraste no fundo escuro e reaproveita a identidade.
export const CHART = {
  income: '#3DDC84',
  expense: '#FF7A6B',
  brand: '#E2FF2E',
  grid: 'rgba(255,255,255,0.06)',
  axis: 'rgba(255,255,255,0.45)',
  surface: '#1D212B',
  edge: 'rgba(255,255,255,0.12)',
} as const

export const CATEGORY_PALETTE = [
  '#E2FF2E',
  '#3DDC84',
  '#7C83FF',
  '#FF7A6B',
  '#FFC24B',
  '#5FD4F4',
  '#C9A7FF',
] as const

export const OTHERS_COLOR = 'rgba(255,255,255,0.35)'

export function categoryColor(index: number): string {
  return CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]
}
