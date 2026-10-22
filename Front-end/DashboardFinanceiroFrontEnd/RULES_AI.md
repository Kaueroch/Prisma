# RULES_AI — Prisma Frontend

Source of truth for AI coding in `Front-end/DashboardFinanceiroFrontEnd`.
Supersedes `RULES_IA.md` and `Skills.md` where they conflict (those still mention Angular/zinc — outdated).

## 1. Stack (do not change)
- React 19 + TypeScript + Vite 6 (`npm run dev` :3000, `npm run build`, `npm run lint` = `tsc --noEmit`).
- Tailwind CSS 4 + shadcn/ui (`@/components/ui`), Lucide icons, Recharts, Motion.
- Fonts only: `Geist Variable` (UI/body) + `Space Grotesk Variable` (display/numbers). No Plus Jakarta, no Space Mono. Numbers use `tabular-nums`, never mono-uppercase labels.
- All user-facing text in US English. BRL formatting via `shared/utils/formatters.ts`.

## 2. Visual identity — black/amber, never aggressive
- Canvas `#0c0a08`, surface `#161310`, raised `#201d19`, edge `rgba(251,191,36,0.1)`, brand `#fbbf24` (amber), brand-strong `#f59e0b`, brand-soft `rgba(251,191,36,0.12)`, fg `#fafaf9`, muted 62%, subtle 42%.
- Semantics: `--color-positive` `#6fd3a0` (entrada/receita) and `--color-negative` `#d48a90` (saída/despesa). Destructive (erro, sair, excluir) uses the shadcn `destructive` token, never `negative`.
- Tokens live in `src/index.css` `@theme`. Do not hardcode violet/emerald/orange Tailwinds; use `bg-brand text-positive text-negative text-destructive border-edge bg-surface`.
- Background glows max `0.05` opacity, `white/[0.02]` for secondary blurs. No gradients as decoration, no acid neon.
- Single source of truth for the categorical palette: `src/shared/utils/palette.ts` (muted jewel set `#8578C8 #8FBF9F #D48A90 #C9A86A #7EA8D8 #A89FD0`). `tinta/chartColors.ts` and `shared/utils/categoryColor.ts` both derive from it. Never pure `#a3e635 #3b82f6 #f97316`.
- Category color is symbolic and automatic (name hash → palette), so the same category keeps the same color in the donut, the transaction list and the category cards. Backend has no color field, so color is display-only and never part of any payload.
- Category symbol is user-chosen from `shared/components/CategorySymbol.tsx` (12 Lucide options). Stored as `CategoryInfo.icon` (frontend-only, never sent). Render via `CategorySymbol` or `resolveSymbol`, never the raw initial letter.
- Radius: ledger/strips/cards `rounded-none` or `rounded-xl` max; actions/inputs `rounded-lg`; only modals may use `rounded-xl`. Never `rounded-2xl` for new code.
- Borders `border-edge`, no shadows, hover `hover:border-brand/40`, transitions `150-200ms`.
- Layout: left-aligned, `px-4 sm:px-6 lg:px-10`, `max-w-6xl` landing. No centered hero, no `eyebrow` uppercase, no `font-mono uppercase tracking`, no `·` meta strings, no `→` on links. Labels sentence case 12-13px (`text-fg-muted`/`text-fg-subtle`).
- Motion: one entrance max (hero/balance). State changes (expand/confirm/save) `~180-200ms`. No particles/typewriter/rotating logos on new screens. Auth particle count stays ≤8.
- Motion primitives live in `src/shared/motion/` and are mounted once via `<MotionRoot>` (`src/App.tsx`). Use them instead of hand-rolling animation:
  - `tokens.ts` — shared durations/easings (`DURATION`, `EASE`).
  - `AnimatedNumber` — count-up for money/percentages. Writes to the DOM via ref; do NOT pass a `MotionValue` as children (Framer Motion memoizes the child's initial value and the text freezes).
  - `AnimatedProgress` — progress bar that animates from 0.
  - `Crossfade` — swap content in place (mask toggle, month label, trend icon).
- `MotionRoot` sets `reducedMotion="user"`, so Motion animations respect `prefers-reduced-motion` globally. The CSS rule in `index.css` only covers CSS animations — check `useReducedMotion()` for anything JS-driven.
- Sliding indicators (sidebar, mobile nav, segmented controls) use `layoutId` + `LayoutGroup`-free `motion.span`. Keep them `absolute inset-0` behind the label — a negative z-index would hide the pill behind the panel background.
- `shared/components/ConfirmDialog.tsx` replaces native `alert()`/`window.confirm()`, which block the thread and break the design system.

## 3. Backend is untouchable in style tasks
Style task = only `className`, tokens, copy in `landing/content.ts`, mock visuals in `DashboardMockup/Features`.

NEVER touch in a style task:
- `src/finance/*` (contexts, hooks)
- `src/shared/services/*` (`api`, `categoriesApi`, `transacoesApi`, `financeService`)
- `src/shared/types/*`, `src/shared/utils/token.ts`, `src/shared/utils/backendError.ts`
- Payload shapes: `{nome, tipoCategoria, userId}`, `{id, nome, tipoCategoria}`, `?id={cd_id}`, `{valor, descricao, data: dd/MM/yyyy, categoria_id}`
- `handleAdd/handleSaveEdit/handleDelete/handleSubmit/onAdd` logic.

Existing guard (do not remove): non-integer ids (`food`, UUID) update/delete locally only, never send `?id=NaN` (`FinanceContext.tsx`).

### 3.1 API contract
- `shared/services/api.ts` is the ONLY place with `API_URL`, the token and `authHeaders()`. Never re-declare them in a service — that duplication is how the port drifted from the back-end.
- The back-end port is **8080** (`server.port`, `docker-compose` `8080:8080`, README). `VITE_API_URL` and every fallback point to 8080.
- `POST /api/v1/transacao/criar` → `201` with `{ id }` (the `cd_id` from the database). The front uses that id — never a locally invented counter.
- `GET /api/v1/transacao/listar` → the transactions of the authenticated user. The back-end is the source of truth; `localStorage` is only a cache for when the API is down.
- A transaction's `id` in the front IS the database `cd_id`. Same for `categoria_id` — it is `tb_categorias.cd_id`, so it must be numeric.

## 4. Forms / backend bridge (bug-fix tasks only)
- Minimal diff, no field renames, no endpoint changes. Validate before fetch (`Number.isInteger`, amount > 0, non-blank).
- Errors surface inline + toast via `extractErrorMessage`, dialog stays open on failure. No `alert()` in new code.
- Never render debug payload JSON in UI. `console.log` payload only temporarily, remove before commit.

## 5. Structure
- `landing/` copy in `content.ts`, components in `components/`. `dashboard/`, `transactions/`, `categories/`, `profile/`, `tinta/` widgets, `shared/` (components/motion/palette/types/services/constants/utils), `layout/`, `auth/`, `finance/`.
- Reuse `Button`, `Input`, `Card`, `Dialog`, `Toast`, `ConfirmDialog`. No new CSS files unless token change in `index.css`.
- This project has no `@types/react` in `node_modules`, so `key` on a **local function component** fails `tsc`. Put the `key` on a `motion.*` wrapper instead (see `shared/components/Toast.tsx`).
- `dashboard/components/OrganizerFlow.tsx` explains how the app models money (Lançamentos → Categorias → Gráfico → Metas). It reads the user's real data, so it is a diagnostic, not a task list — and it hides itself once all four are in place.

## 6. Verification (mandatory)
1. `npm run lint` must pass.
2. `npm run build` must pass.
3. Cite changed files as `path:line`. No emojis in UI or commits unless asked.
