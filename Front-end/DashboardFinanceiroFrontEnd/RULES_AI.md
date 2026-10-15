# RULES_AI — Prisma Frontend

Source of truth for AI coding in `Front-end/DashboardFinanceiroFrontEnd`.
Supersedes `RULES_IA.md` and `Skills.md` where they conflict (those still mention Angular/zinc — outdated).

## 1. Stack (do not change)
- React 19 + TypeScript + Vite 6 (`npm run dev` :3000, `npm run build`, `npm run lint` = `tsc --noEmit`).
- Tailwind CSS 4 + shadcn/ui (`@/components/ui`), Lucide icons, Recharts, Motion.
- Fonts only: `Geist Variable` (UI/body) + `Space Grotesk Variable` (display/numbers). No Plus Jakarta, no Space Mono. Numbers use `tabular-nums`, never mono-uppercase labels.
- All user-facing text in US English. BRL formatting via `shared/utils/formatters.ts`.

## 2. Visual identity — purple/black, never aggressive
- Canvas `#0c0a13`, surface `#14111f`, raised `#1a1628`, edge `rgba(200,190,230,0.09)`, brand `#8578c8`, brand-strong `#7568bd`, brand-soft `rgba(133,120,200,0.10)`, income `#5ab99a`, expense `#d48a90`, fg `#ece9f5`, muted 64%, subtle 45%.
- Tokens live in `src/index.css` `@theme`. Do not hardcode violet/emerald/orange Tailwinds; use `bg-brand text-data text-negative border-edge bg-surface`.
- Background glows max `0.05` opacity, `white/[0.02]` for secondary blurs. No gradients as decoration, no acid neon.
- Category/data palette: `chartColors.ts` + muted jewel set `#8578C8 #8FBF9F #D48A90 #C9A86A #7EA8D8 #A89FD0`. Never pure `#a3e635 #3b82f6 #f97316`.
- No free color picker (`input[type=color]` is banned). Category color is symbolic and automatic via `shared/utils/categoryColor.ts` (name hash → palette). Backend has no color field, so color is display-only and never part of any payload.
- Category symbol is user-chosen from `shared/components/CategorySymbol.tsx` (12 Lucide options). Stored as `CategoryInfo.icon` (frontend-only, never sent). Render via `CategorySymbol` or `resolveSymbol`, never the raw initial letter.
- Radius: ledger/strips/cards `rounded-none` or `rounded-xl` max; actions/inputs `rounded-lg`; only modals may use `rounded-xl`. Never `rounded-2xl` for new code.
- Borders `border-edge`, no shadows, hover `hover:border-brand/40`, transitions `150-200ms`.
- Layout: left-aligned, `px-4 sm:px-6 lg:px-10`, `max-w-6xl` landing. No centered hero, no `eyebrow` uppercase, no `font-mono uppercase tracking`, no `·` meta strings, no `→` on links. Labels sentence case 12-13px (`text-fg-muted`/`text-fg-subtle`).
- Motion: one entrance max (hero/balance). State changes (expand/confirm/save) `~180-200ms`. Respect `prefers-reduced-motion` in `index.css`. No particles/typewriter/rotating logos on new screens. Auth particle count stays ≤8.

## 3. Backend is untouchable in style tasks
Style task = only `className`, tokens, copy in `landing/content.ts`, mock visuals in `DashboardMockup/Features`.

NEVER touch in a style task:
- `src/finance/*` (contexts, hooks)
- `src/shared/services/*` (`categoriesApi`, `transacoesApi`, `financeService`)
- `src/shared/types/*`, `src/shared/utils/token.ts`, `src/shared/utils/backendError.ts`
- Payload shapes: `{nome, tipoCategoria, userId}`, `{id, nome, tipoCategoria}`, `?id={cd_id}`, `{valor, descricao, data: dd/MM/yyyy, categoria_id}`
- `handleAdd/handleSaveEdit/handleDelete/handleSubmit/onAdd` logic.

Existing guard (do not remove): non-integer ids (`food`, UUID) update/delete locally only, never send `?id=NaN` (`FinanceContext.tsx`).

## 4. Forms / backend bridge (bug-fix tasks only)
- Minimal diff, no field renames, no endpoint changes. Validate before fetch (`Number.isInteger`, amount > 0, non-blank).
- Errors surface inline + toast via `extractErrorMessage`, dialog stays open on failure. No `alert()` in new code.
- Never render debug payload JSON in UI. `console.log` payload only temporarily, remove before commit.

## 5. Structure
- `landing/` copy in `content.ts`, components in `components/`. `dashboard/`, `transactions/`, `categories/`, `profile/`, `tinta/` widgets, `shared/` (components/types/services/constants/utils), `layout/`, `auth/`, `finance/`.
- Reuse `Button`, `Input`, `Card`, `Dialog`, `Toast`. No new CSS files unless token change in `index.css`.

## 6. Verification (mandatory)
1. `npm run lint` must pass.
2. `npm run build` must pass.
3. Cite changed files as `path:line`. No emojis in UI or commits unless asked.
