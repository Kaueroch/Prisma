# RULES_IA — Prisma Finance Frontend (legacy)

> **Documento legado.** Escrito para um app Angular/zinc que não existe mais.
> A fonte da verdade é [`RULES_AI.md`](./RULES_AI.md) — leia só ela.
> Este arquivo fica aqui apenas por histórico.

## O que mudou (leia antes de usar qualquer coisa abaixo)

| Regra antiga (errada) | Regra atual |
|---|---|
| Angular standalone components | React 19 + TypeScript + Vite 6 |
| `bg-zinc-950` / `bg-zinc-900` / `border-zinc-800` | `bg-surface` / `bg-raised` / `border-edge` (`src/index.css` `@theme`) |
| `text-zinc-400` / `text-zinc-500` para texto secundário | `text-fg-muted` (62%) / `text-fg-subtle` (42%) |
| Verde/roxo/laranja neon para acentos | Preto e âmbar: `bg-brand` `#fbbf24`, `text-positive` `#6fd3a0`, `text-negative` `#d48a90` |
| Interface em US English | Interface em **português do Brasil** |
| `rounded-2xl` em cards e modais | `rounded-xl` no máximo (ações/inputs `rounded-lg`) |

## Systemic rules (still valid, condensed)

- Dark mode apenas. Nunca fundo branco.
- Tokens vivem em `src/index.css` (`@theme`). Não hardcodeie `#a3e635 #3b82f6 #f97316` nem variantes Tailwind de cor.
- Fonte única da paleta categórica: `src/shared/utils/palette.ts` (joias muted `#8578C8 #8FBF9F #D48A90 #C9A86A #7EA8D8 #A89FD0`).
- Ícones: Lucide React. Símbolo de categoria vem de `shared/components/CategorySymbol.tsx` (12 opções).
- Bordas `border-edge`, sem sombras, hover `hover:border-brand/40`, transições `150-200ms`.
- Sem `alert()` / `window.confirm()`: use `shared/components/ConfirmDialog.tsx` e `shared/components/Toast.tsx`.
- Entrada única por tela, com `MotionRoot` (`src/App.tsx`) e os primitivos de `src/shared/motion/`.

## Onde encontrar o detalhe

Tudo acima está resumido aqui; as regras completas, o contrato de API e o checklist de verificação estão em [`RULES_AI.md`](./RULES_AI.md).
