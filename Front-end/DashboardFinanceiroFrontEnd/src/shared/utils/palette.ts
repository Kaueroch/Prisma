/**
 * Prisma Finance palette — preto e branco (estilo Resend).
 *
 * Fonte única de verdade das cores de dado. O app tem três grupos:
 *
 *  - **Identidade**: preto + branco (`--color-brand` em `src/index.css`).
 *  - **Semântica**: verde = receita/entrada, rosa = despesa/saída.
 *    Usada por KPIs, legendas de gráfico e barras de meta.
 *  - **Categórica**: o conjunto de joias muted, uma cor por categoria.
 *    Uma categoria tem SEMPRE a mesma cor em qualquer tela (hash do nome),
 *    então o donut, a lista de transações e os cartões de categoria
 *    concordam entre si.
 *
 * O backend nunca guarda cor (CategoriaDTO não tem esse campo) — tudo aqui
 * é display-only e nunca entra em payload.
 */

/** Semântica de dados: entrada (verde) e saída (rosa). */
export const POSITIVE = '#6FD3A0';
export const NEGATIVE = '#D48A90';

/** Conjunto categórico de joias muted. */
export const DATA_PALETTE = [
  '#8578C8',
  '#8FBF9F',
  '#D48A90',
  '#C9A86A',
  '#7EA8D8',
  '#A89FD0',
] as const;

/** Cor reservada para o agregado "Outros" — nunca colide com uma categoria. */
export const OTHERS_COLOR = 'rgba(240,245,242,0.3)';

/** Cor categórica por índice (fallback quando a categoria não tem cor própria). */
export function paletteColor(index: number): string {
  return DATA_PALETTE[index % DATA_PALETTE.length];
}

/** Cor categórica estável derivada do nome da categoria. */
export function symbolicPaletteColor(name: string): string {
  const key = name.trim().toLowerCase() || '?';
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return DATA_PALETTE[hash % DATA_PALETTE.length];
}
