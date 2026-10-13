# Bot Telegram → Prisma (frontend-only agora, backend depois)

Status: **simulação local funcionando, sem mexer no Java.**

## O que já funciona

- `src/telegram/TelegramInbox.ts` — `simulate({text, amount, categoryId})` escreve no mesmo `localStorage` do `FinanceContext` (`finance_dashboard_expenses`) e dispara `window event prisma:telegram-expense`.
- `FinanceContext` escuta o evento e prepends sem reload.
- `ProfilePage → Configurações → Telegram` tem “Vincular Telegram” (link simulado) + “Simular gasto via bot”.
- Cada gasto simulado aparece no Dashboard (Saldo, KPIs, donut, histórico, recentes).

Teste: Configurações → Simular gasto via bot → volta pro Dashboard, vê “Café 12” como newest (destaque lime).

## Por que frontend-only?

Você pediu para não mexer no backend. O backend Prisma hoje só tem `User + Categoria` (sem `TransacaoController`), então não há onde o bot gravar. A simulação prova o fluxo de UI sem bloquear.

## Caminho do bot real (quando quiser)

Espelhando o money-flow (que já tem `POST /owner/telegram-invite` + parsing de áudio).
Abaixo o passo a passo grounded no seu Java atual.

### 0. O que trava hoje no seu backend

- `domain/Transacao.java` tem construtor vazio (recebe `valor, descricao, data, categoria` e não atribui nada), sem getters/setters, sem relação com `User` e sem validação chamada. Precisa arrumar antes do bot gravar.
- Não existe `TransacaoRepository` (só `CategoriaRepository` + `UserRepository`), nem `TransacaoController/Service`.
- `WebSecurityConfig.java` só libera `/api/v1/user/registrar` e `/login` — todo o resto exige JWT. O webhook do Telegram não tem JWT, então precisa de rota `permitAll` + checagem de segredo próprio (ver item 3).

### 1. Arrumar a entidade Transação

- Complete o construtor (atribuir `this.valor/descricao/data/categoria`), adicione getters, e um `ManyToOne User` (hoje só tem `Categoria`). Sem dono, o bot não sabe em qual conta gravar.
- Sugestão mínima de colunas: `vl_valor BigDecimal`, `ds_descricao`, `dt_data` (troque `String` por `LocalDate`, o parser `dd/MM/yyyy` já existe mas nunca é chamado), `categoria_id FK`, `user_id FK`, `ds_origem` (`TELEGRAM`/`MANUAL`), `ds_status` (`PENDING`/`APPLIED` para o “agendado”).
- Crie `TransacaoRepository extends JpaRepository<Transacao, Integer>` + finder `findAllByUser_Id(UUID)`.

### 2. Vincular conta Telegram ↔ User (igual ao money-flow)

O money-flow faz `POST /owner/telegram-invite` (ownerId sai do JWT) e devolve `t.me/...?start=<token 1min>`. Replique:

- Nova tabela/entidade `TelegramLink { token, userId, telegramChatId, expiresAt }`.
- `POST /api/v1/telegram/link` (autenticado, JWT) → gera token 1min → devolve `{ link }`. É o que o botão “Vincular Telegram” do `ProfilePage` vai chamar no lugar do link simulado.
- Bot: quando o usuário abre o link e dá `/start <token>`, salve `telegramChatId ↔ userId`.

### 3. Webhook que anota o gasto

- `POST /api/v1/telegram/webhook` — `permitAll` no `WebSecurityConfig`, mas protegida por segredo: valide o header `X-Telegram-Bot-Api-Secret-Token` contra uma env `TELEGRAM_WEBHOOK_SECRET` (configure o segredo no `setWebhook` do Bot API).
- Payload do Telegram (`Update`): extraia `message.chat.id` + `message.text` (ou `voice` → Whisper depois). Ache o `userId` pelo `chatId` da etapa 2. Sem vínculo → responda “vincule primeiro”.
- Parse MVP (sem IA): regex `^(.*?)\\s+([\\d.,]+)$` — ex. `Café 12` → `{ descricao: "Café", valor: 12 }`. Guarde o texto cru sempre (auditoria quando o parse errar).
- Categoria: tente match por nome (`existsByNomeAndUser_Id` já existe); se não achar, use “Sem categoria” ou crie `PENDING` para confirmar no front (ver item 5).
- Salve `Transacao` com `origem=TELEGRAM`, `status=APPLIED` (direto) ou `PENDING` (agendado).

Exemplo de contrato (seu padrão `/api/v1/...`):

```
POST /api/v1/telegram/link (JWT) -> { link: string }
POST /api/v1/telegram/webhook (secret header, corpo Update do Telegram) -> 200 OK
GET  /api/v1/transacao/listar?userId={uuid}&startDate=yyyy-MM-dd&endDate=... (JWT) -> Transaction[]
POST /api/v1/transacao/criar (JWT) -> { id }
```

`Transaction` money-flow: `{id, description, amount, date, categoryDescription, operationType}`. Mapeie para Prisma `Expense {id, name, amount, date, categoryId, type}`. Use `BigDecimal` no Java (nunca `float`) — o front já soma com `float`, então o backend é o guardião dos centavos.

### 4. Testar sem Telegram de verdade

1. Suba `db + backend` (`docker compose up db backend`).
2. `curl POST /api/v1/telegram/webhook -H "X-Telegram-Bot-Api-Secret-Token: $SECRET"` com um `Update` fake → confira `tb_transacoes`.
3. Só então configure `setWebhook` real apontando para sua URL pública (o Telegram exige HTTPS — ver `SEGURANCA_HTTPS.md`).

### 5. Frontend: troca de 3 linhas (quando o backend existir)
   - `telegramInbox.simulate()` → `fetch(${VITE_API_URL}/telegram/inbox)` polling.
   - `ProfilePage.handleGenerate` → `POST /telegram/link` real.
   - `FinanceContext.loadData` → `GET /transactions` em vez de `localStorage`.
3. **Agendado:** se quiser “aparecer no prisma agendado”, adicione `status: PENDING | APPLIED` + `scheduledFor`. O bot cria `PENDING`, o front mostra em “Caixa de entrada” para confirmar antes de aplicar (evita gasto errado do parse).

## Contratos (seu padrão /api/v1, compatíveis money-flow)

```
POST /api/v1/telegram/link -> { link: string }
POST /api/v1/telegram/webhook (secret header + corpo Update) -> 200 OK
GET  /api/v1/transacao/listar?userId={uuid}&startDate=..&endDate=.. -> Transaction[]
POST /api/v1/transacao/criar -> { id }
GET  /api/v1/telegram/inbox?userId={uuid} -> [{ id, text, amount, categoryGuess, date, status }]
POST /api/v1/telegram/inbox/{id}/apply -> Transaction
```

`Transaction` money-flow: `{id, description, amount, date, categoryDescription, operationType}`. Mapeie para Prisma `Expense {id, name, amount, date, categoryId, type}`.
