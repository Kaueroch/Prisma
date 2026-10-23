# Telegram Bot → Prisma Finance (frontend-only for now, backend later)

Status: **local simulation working, no Java changes.**

## What already works

- `src/telegram/TelegramInbox.ts` — `simulate({text, amount, categoryId})` writes to the same `localStorage` as `FinanceContext` (`finance_dashboard_expenses`) and fires the `window event prisma:telegram-expense`.
- `FinanceContext` listens to the event and prepends with no reload.
- `ProfilePage → Settings → Telegram` has "Link Telegram" (simulated link) + "Simulate a bot expense".
- Each simulated expense shows up in the Dashboard (Balance, KPIs, donut, history, recents).

Test: Settings → Simulate a bot expense → back to the Dashboard, see "Coffee 12" as newest (lime highlight).

## Why frontend-only?

You asked not to touch the backend. The Prisma Finance backend currently only has `User + Categoria` (no `TransacaoController`), so the bot has nowhere to write. The simulation proves the UI flow without blocking.

## Real bot path (whenever you want it)

Mirroring money-flow (which already has `POST /owner/telegram-invite` + audio parsing).
Below is the step-by-step grounded in your current Java code.

### 0. What blocks the backend today

- `domain/Transacao.java` has an empty constructor (it receives `valor, descricao, data, categoria` and assigns nothing), no getters/setters, no relation to `User`, and no validation being called. Fix this before the bot can write.
- There is no `TransacaoRepository` (only `CategoriaRepository` + `UserRepository`), and no `TransacaoController/Service`.
- `WebSecurityConfig.java` only allows `/api/v1/user/registrar` and `/login` — everything else requires JWT. The Telegram webhook has no JWT, so it needs a `permitAll` route + its own secret check (see item 3).

### 1. Fix the Transaction entity

- Complete the constructor (assign `this.valor/descricao/data/categoria`), add getters, and a `ManyToOne User` (today it only has `Categoria`). Without an owner, the bot does not know which account to write to.
- Minimal suggested columns: `vl_valor BigDecimal`, `ds_descricao`, `dt_data` (swap `String` for `LocalDate`; the `dd/MM/yyyy` parser already exists but is never called), `categoria_id FK`, `user_id FK`, `ds_origem` (`TELEGRAM`/`MANUAL`), `ds_status` (`PENDING`/`APPLIED` for the "scheduled" case).
- Create `TransacaoRepository extends JpaRepository<Transacao, Integer>` + finder `findAllByUser_Id(UUID)`.

### 2. Link Telegram account ↔ User (same as money-flow)

Money-flow does `POST /owner/telegram-invite` (ownerId comes from the JWT) and returns `t.me/...?start=<1min token>`. Replicate it:

- New table/entity `TelegramLink { token, userId, telegramChatId, expiresAt }`.
- `POST /api/v1/telegram/link` (authenticated, JWT) → generates a 1min token → returns `{ link }`. This is what the `ProfilePage` "Link Telegram" button will call instead of the simulated link.
- Bot: when the user opens the link and sends `/start <token>`, save `telegramChatId ↔ userId`.

### 3. Webhook that records the expense

- `POST /api/v1/telegram/webhook` — `permitAll` in `WebSecurityConfig`, but protected by a secret: validate the `X-Telegram-Bot-Api-Secret-Token` header against an env `TELEGRAM_WEBHOOK_SECRET` (set the secret in the Bot API `setWebhook` call).
- Telegram payload (`Update`): extract `message.chat.id` + `message.text` (or `voice` → Whisper later). Find the `userId` via the `chatId` from step 2. No link → reply "link first".
- MVP parse (no AI): regex `^(.*?)\s+([\d.,]+)$` — e.g. `Coffee 12` → `{ descricao: "Coffee", valor: 12 }`. Always store the raw text (audit trail for when parsing fails).
- Category: try a name match (`existsByNomeAndUser_Id` already exists); if nothing matches, use "Uncategorized" or create `PENDING` for confirmation in the frontend (see item 5).
- Save `Transacao` with `origem=TELEGRAM`, `status=APPLIED` (direct) or `PENDING` (scheduled).

Example contract (your `/api/v1/...` style):

```
POST /api/v1/telegram/link (JWT) -> { link: string }
POST /api/v1/telegram/webhook (secret header, Telegram Update body) -> 200 OK
GET  /api/v1/transacao/listar?userId={uuid}&startDate=yyyy-MM-dd&endDate=... (JWT) -> Transaction[]
POST /api/v1/transacao/criar (JWT) -> { id }
```

`Transaction` money-flow: `{id, description, amount, date, categoryDescription, operationType}`. Map to Prisma Finance `Expense {id, name, amount, date, categoryId, type}`. Use `BigDecimal` in Java (never `float`) — the frontend already sums with `float`, so the backend guards the cents.

### 4. Test without a real Telegram

1. Start `db + backend` (`docker compose up db backend`).
2. `curl POST /api/v1/telegram/webhook -H "X-Telegram-Bot-Api-Secret-Token: $SECRET"` with a fake `Update` → check `tb_transacoes`.
3. Only then configure the real `setWebhook` pointing to your public URL (Telegram requires HTTPS — see `SEGURANCA_HTTPS.md`).

### 5. Frontend: 3-line swap (once the backend exists)
   - `telegramInbox.simulate()` → `fetch(${VITE_API_URL}/telegram/inbox)` polling.
   - `ProfilePage.handleGenerate` → real `POST /telegram/link`.
   - `FinanceContext.loadData` → `GET /transactions` instead of `localStorage`.
3. **Scheduled:** if you want "show up in Prisma Finance as scheduled", add `status: PENDING | APPLIED` + `scheduledFor`. The bot creates `PENDING`, the frontend shows it in an "Inbox" for confirmation before applying (avoids wrong expenses from parsing).

## Contracts (your /api/v1 style, money-flow compatible)

```
POST /api/v1/telegram/link -> { link: string }
POST /api/v1/telegram/webhook (secret header + Update body) -> 200 OK
GET  /api/v1/transacao/listar?userId={uuid}&startDate=..&endDate=.. -> Transaction[]
POST /api/v1/transacao/criar -> { id }
GET  /api/v1/telegram/inbox?userId={uuid} -> [{ id, text, amount, categoryGuess, date, status }]
POST /api/v1/telegram/inbox/{id}/apply -> Transaction
```

`Transaction` money-flow: `{id, description, amount, date, categoryDescription, operationType}`. Map to Prisma Finance `Expense {id, name, amount, date, categoryId, type}`.
