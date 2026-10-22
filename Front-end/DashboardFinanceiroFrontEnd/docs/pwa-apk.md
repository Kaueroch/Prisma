# Prisma — Diagnóstico e Plano: PWA + APK

> **Documento de referência para outra sessão do OpenCode.**
> Gerado a partir da inspeção do repositório em `/home/kauezao/Documents/Prisma/Front-end/DashboardFinanceiroFrontEnd`.
> Data da análise: 21/10/2026 · Branch: `main` (working tree **suja** — muitos arquivos modificados e não commitados).
>
> **Status: Fase 1 (PWA) IMPLEMENTADA e validada.** Ver §0. Fases 2 (deploy HTTPS) e 3 (APK) continuam pendentes.
>
> **Pergunta original:** "esse projeto tem responsividade? conseguiria colocar em um APK como PWA e distribuir como mobile?"
> **Resposta:** Sim, e sim. A responsividade já está pronta; falta só a camada de empacotamento (manifest + service worker + ícones + publicação HTTPS), que é mecânica e leva ~1 dia. O APK sai em seguida via TWA (Play Store) ou Capacitor (link direto).

---

## 0. Status da implementação (Fase 1 — feita em 21/10/2026)

**Arquivos alterados:**

| Arquivo | O que mudou |
|---|---|
| `package.json` / `package-lock.json` | `vite-plugin-pwa@^2.0.0` (devDependency) |
| `vite.config.ts` | plugin `VitePWA` com manifest inline + `workbox` (precache, `navigateFallback`, runtime cache de `/api/v1/`) |
| `index.html` | `viewport-fit=cover`, `theme-color`, `description`, `apple-touch-icon`, meta `apple-mobile-web-app-*`, `lang="pt-BR"` |
| `public/icons/` (novo) | `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` — "P" branca sobre `#0c0a08` |
| `src/main.tsx` | `registerSW({ immediate: true })` via `virtual:pwa-register` |
| `src/vite-env.d.ts` | `/// <reference types="vite-plugin-pwa/client" />` |
| `src/index.css` | variáveis `--safe-area-*` (env) + `min-height: 100dvh` |
| `src/App.tsx` | shell `h-[100dvh]`, `pt-[var(--safe-area-top)]`, `pb-[calc(4rem+var(--safe-area-bottom))]`, bottom nav com safe-area |
| `src/auth/AuthContext.tsx` | `purgeApiCache()` — limpa o cache do SW no login/logout (evita vazamento de dados entre usuários do mesmo aparelho) |

**Validações executadas (com evidência):**

- `npm run lint` → **passa** (`tsc --noEmit`, sem erros)
- `npm run build` → **passa**; `PWA v2.0.0 / mode generateSW / precache 24 entries (2154.68 KiB)`; gerados `dist/sw.js`, `dist/workbox-*.js`, `dist/manifest.webmanifest`
- `dist/manifest.webmanifest` → campos obrigatórios OK, `display: standalone`, `scope: /`, `start_url: /painel`, `theme_color: #0c0a08`, 3 ícones (incl. maskable)
- `dist/sw.js` → `node --check` OK; regra de runtime confirmada no bundle: `registerRoute(({url})=>url.pathname.startsWith("/api/v1/"), new NetworkFirst({cacheName:"api-v1", networkTimeoutSeconds:5, ...}))`
- `vite preview` (porta 4173) → `/` 200 html · `/painel` 200 html · `/transacoes` 200 html · `/manifest.webmanifest` 200 `application/manifest+json` · `/sw.js` 200 js · ícones 200 png
- Ícones conferidos visualmente (P branca sobre o canvas `#0c0a08`; maskable com o padding correto para corte circular do Android)

**Pendente de validação manual** (não automatizável neste ambiente — não há Chrome/Chromium headless): abrir no Chrome → DevTools → Application → Manifest (installability) e Service Workers; e instalar em aparelho real para conferir a bottom nav vs. indicador home do iPhone.

**Continua pendente:** Fase 2 (publicar o frontend com HTTPS) e Fase 3 (TWA ou Capacitor) — ver §5.

---

## 1. TL;DR para quem vai executar

| Pergunta | Resposta |
|---|---|
| O app é responsivo? | **Sim**, de forma estrutural (Tailwind v4 + bottom nav mobile + sidebar adaptativa). |
| Dá para virar PWA? | **Sim.** Falta manifest, service worker, ícones e as meta tags. ~1 dia de trabalho. |
| Dá para virar APK? | **Sim**, em dois caminhos: TWA (Play Store) ou Capacitor (APK avulso). ~meio dia cada. |
| Dá para publicar na Play Store? | **Sim**, mas exige: HTTPS público, `assetlinks.json`, política de privacidade pública e passar no Lighthouse PWA. |
| Precisa refatorar a UI? | **Não.** Nenhuma mudança de layout é necessária. |
| Funciona offline? | Parcialmente e **já hoje**: os dados financeiros vivem em `localStorage` e há fallback automático quando o backend falha. Falta cachear o *app shell* (isso é papel do service worker). |

---

## 2. Estado atual do projeto

### 2.1 Stack (do `package.json`)

| Camada | Tecnologia |
|---|---|
| Framework | React 19 + TypeScript (~5.8) |
| Build | Vite 6 (`vite-plugin-react` + `@tailwindcss/vite`) |
| Estilo | Tailwind CSS 4 + shadcn/ui (`components/ui/`, `components.json`) |
| Ícones | `lucide-react` |
| Gráficos | `recharts` |
| Animações | `motion` (v12) |
| Fontes | `@fontsource-variable/geist`, `@fontsource-variable/space-grotesk` |
| Extras | `jspdf` + `jspdf-autotable` (export PDF), `cmdk`, `@base-ui/react` |

Node local: **v24.12.0** · npm **11.6.2** · Dockerfile usa `node:20-alpine`.

### 2.2 Estrutura de telas (`src/`)

```
src/
├── App.tsx                     ← shell, tabs, bottom nav mobile, public gate
├── main.tsx                    ← entrypoint React
├── index.css                   ← tokens Tailwind v4 + tema dark
├── auth/                       ← AuthPage (login/cadastro) + AuthContext (JWT)
├── landing/                    ← landing page pública
├── dashboard/HomePage.tsx      ← painel (saldo, KPIs, gráficos)
├── transactions/               ← lista + form de transações
├── categories/                 ← CRUD de categorias
├── goals/                      ← metas
├── profile/                    ← configurações
├── tinta/                      ← componentes visuais do painel (charts, KpiStrip)
├── telegram/TelegramInbox.ts   ← simulação de bot (escrita em localStorage)
├── finance/                    ← FinanceContext (estado + persistência)
├── shared/                     ← services (API clients), types, utils, motion
└── layout/                     ← AppSidebar, SiteHeader
```

### 2.3 O que JÁ está resolvido (não mexer)

**Responsividade / mobile**

| Item | Arquivo:linha |
|---|---|
| Viewport correto, **sem** `user-scalable=no` (zoom liberado) | `index.html:5` |
| Sidebar desktop some no mobile (`hidden md:flex`) | `src/App.tsx:129` |
| Bottom nav mobile com 5 abas (`md:hidden fixed bottom-0`) | `src/App.tsx:155-191` |
| Respiro do conteúdo para não ficar atrás da bottom nav (`pb-16 md:pb-0`) | `src/App.tsx:131` |
| Grid responsivo do painel (`xl:grid-cols-[400px_1fr]`) | `src/dashboard/HomePage.tsx:164` |
| Grade de transações 1→2→3 colunas | `src/transactions/TransactionsPage.tsx:204` |
| Cabeçalhos fluidos (`text-3xl` → `sm:text-5xl`) | `src/dashboard/HomePage.tsx:102` e outras telas |
| Hook de media query | `hooks/use-mobile.ts` |
| Layout app-shell (`h-screen` + scroll interno) | `src/App.tsx:128` |

**Infraestrutura**

| Item | Arquivo:linha |
|---|---|
| Dockerfile multi-stage (build Vite → Nginx) | `Dockerfile:1-41` |
| Nginx com `try_files ... /index.html` (SPA routing) | `Dockerfile:27-35` |
| Routing por `pathname` + `pushState`/`popstate` | `src/App.tsx:26-42`, `src/App.tsx:103-117` |
| JWT em `localStorage` (`prisma_auth_token`) | `src/auth/AuthContext.tsx:22-23, 112` |
| Cliente HTTP com Bearer + tratamento de erro | `src/shared/services/transacoesApi.ts:100-161` |
| `.env.example` já documenta `VITE_API_URL` | `.env.example` |

---

## 3. Diagnóstico: o que falta

### 3.1 Bloqueadores duros (impedem gerar o APK)

| # | Lacuna | Situação atual | Onde resolver |
|---|---|---|---|
| B1 | `manifest.webmanifest` | ❌ não existe — `public/` contém **apenas** `favicon.png` | `public/manifest.webmanifest` (novo) |
| B2 | Service worker | ❌ zero referências a `sw.js` / `workbox` / `vite-plugin-pwa` em `src/` | `vite.config.ts` + `src/main.tsx` |
| B3 | Ícones de app | ❌ só `favicon.png` (precisa de 192, 512, maskable, apple-touch) | `public/icons/` (novo) |
| B4 | Frontend publicado com HTTPS | ❌ só o backend está no ar; `VITE_API_URL="http://localhost:8081"` no `.env` | deploy (Docker já pronto) |
| B5 | `VITE_API_URL` de produção | ❌ apontando para localhost | build de produção |
| B6 | CORS do backend Spring para a origem do app | ⚠️ não verificado | `WebSecurityConfig.java` (backend) |

### 3.2 Polimento para "sentir app de verdade"

| # | Lacuna | Impacto | Onde resolver |
|---|---|---|---|
| P1 | `theme-color` ausente | barra de status com cor errada no Android | `index.html` |
| P2 | `apple-mobile-web-app-capable` / `apple-touch-icon` / `apple-mobile-web-app-title` | iOS não abre em standalone, mostra barra do Safari | `index.html` |
| P3 | `viewport-fit=cover` ausente | `env(safe-area-inset-*)` fica 0 → bottom nav **atrás** da barra do iPhone | `index.html` + CSS |
| P4 | `h-screen` (`src/App.tsx:128`) e `min-height:100vh` (`src/index.css:38`) | com a barra de URL do browser, o conteúdo é cortado; em standalone iOS dá jump de URL bar | trocar por `dvh` |
| P5 | Sem tratamento de `safe-area-inset` | bottom nav colide com indicador home / barra de gestos | `src/index.css` + `src/App.tsx` |
| P6 | Sem `beforeinstallprompt` / botão de instalar | usuário não descobre que pode instalar | opcional |

### 3.3 Nota sobre requisitos do Chrome

Desde o Chrome 89 o **service worker deixou de ser requisito de instalabilidade** — mas continua sendo obrigatório para *offline* e para o TWA (Trusted Web Activity) funcionar bem. Portanto: implemente o SW mesmo que o objetivo imediato seja só o APK.

---

## 4. Decisões já tomadas com o dev

Registrado na sessão de diagnóstico:

- **Destino:** por enquanto apenas o diagnóstico; a implementação será decidida depois. O plano abaixo cobre os 3 caminhos.
- **Hospedagem:** só o backend está publicado → **o frontend precisa de uma etapa de deploy com HTTPS** (Fase 2 abaixo). O `Dockerfile` já está pronto para isso.
- **Offline:** "decidir depois" → a Fase 1 implementa infraestrutura de SW que **permite** adicionar cache depois sem reescrever nada (usar runtime caching configurável).

---

## 5. Plano de implementação

### Fase 1 — PWA (núcleo, ~1 dia)

#### 5.1 Dependências

```bash
npm i -D vite-plugin-pwa
npm i -D @vite-pwa/assets-generator   # gera ícones/splash a partir de um PNG
```

> Conferir compatibilidade de `vite-plugin-pwa` com **Vite 6** (peer deps) antes de fixar a versão. Se houver conflito, usar a branch/variante compatível ou escrever o SW à mão.

#### 5.2 Manifest — **implementado inline no plugin** (fonte única)

> **Decisão tomada na implementação:** o manifest fica **inline no `vite.config.ts`** (opção `manifest:` do `VitePWA`). O plugin o gera em `dist/manifest.webmanifest` e **injeta `<link rel="manifest">` no `index.html` automaticamente**.
> Portanto **NÃO** existe `public/manifest.webmanifest` (criá-lo causaria conflito — ver armadilha A1) e **não** se deve adicionar o `<link rel="manifest">` manualmente no `index.html`.

Conteúdo efetivo do bloco `manifest:` em `vite.config.ts`:

```ts
manifest: {
  name: 'Prisma — Painel Financeiro',
  short_name: 'Prisma',
  description: 'Painel financeiro pessoal: entradas, saídas, categorias e metas.',
  lang: 'pt-BR',
  dir: 'ltr',
  start_url: '/painel',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#0c0a08',
  theme_color: '#0c0a08',
  categories: ['finance', 'productivity'],
  icons: [
    {src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any'},
    {src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any'},
    {src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
  ],
},
```

Notas:
- `start_url: "/painel"` — se não houver sessão, `PublicGate` redireciona para `/#/login` (`src/App.tsx:47-49`). `/` também funciona e cai no painel quando logado.
- Cores: `#0c0a08` (canvas) e `#fbbf24` (brand âmbar) — extrair de `src/index.css:14-26`.
- Se a Fase 3 for TWA, `display: "standalone"` é obrigatório.

#### 5.3 Ícones (gerado — **feito**)

Os ícones foram gerados a partir de `public/favicon.png` (letra "P" branca, 392×309) com ImageMagick, que já está disponível no ambiente:

```bash
mkdir -p public/icons
# 512 com o logo a ~80% (ícone "any")
convert public/favicon.png -background none -resize 410x410 -gravity center -extent 512x512 -background '#0c0a08' -flatten public/icons/icon-512.png
convert public/icons/icon-512.png -resize 192x192 public/icons/icon-192.png
# maskable: logo a ~60% (conteúdo dentro dos 80% centrais, senão o Android recorta em círculo)
convert public/favicon.png -background none -resize 300x300 -gravity center -extent 512x512 -background '#0c0a08' -flatten public/icons/icon-maskable-512.png
# iOS: 180x180, fundo opaco (o iOS não aceita transparência no apple-touch-icon)
convert public/favicon.png -background none -resize 130x130 -gravity center -extent 180x180 -background '#0c0a08' -flatten public/icons/apple-touch-icon.png
```

Arquivos resultantes em `public/icons/`: `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`.
(Alternativa: `npx assets-generator --icon public/favicon.png --output public --background "#0c0a08"` — não foi usado porque o ImageMagick já resolvia e o favicon tem proporção não quadrada.)

#### 5.4 `index.html` — meta tags (**feito**)

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <!-- viewport-fit=cover habilita env(safe-area-inset-*) no iOS (barra de status/home indicator) -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="description" content="Prisma — painel financeiro pessoal: entradas, saídas, categorias e metas." />

    <!-- PWA -->
    <meta name="theme-color" content="#0c0a08" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Prisma" />

    <title>Prisma — Painel Financeiro</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

> O `<link rel="manifest" href="/manifest.webmanifest">` **não** aparece aqui: o plugin injeta sozinho no build.
> `lang` foi trocado de `en` → `pt-BR` (a UI do app é toda em português).


#### 5.5 Service worker — `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig(() => ({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'icons/*.png'],
      manifest: {
        name: 'Prisma — Painel Financeiro',
        short_name: 'Prisma',
        description: 'Painel financeiro pessoal: entradas, saídas, categorias e metas.',
        lang: 'pt-BR',
        start_url: '/painel',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0c0a08',
        theme_color: '#0c0a08',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',        // SPA routes /painel, /transacoes...
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-v1',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
}));
```

> Se preferir manter o manifest como arquivo estático (`public/manifest.webmanifest`), remova o bloco `manifest:` do plugin — ele **sobrescreve** o arquivo. Escolha **um** dos dois, não os dois.

**Sobre cachear `/api/v1/`:** o SW só cacheia **GET** por padrão (POST nunca é cacheado), então o `POST /api/v1/transacao/criar` continua falhando offline. É aceitável na Fase 1 — os dados já têm fallback em `localStorage` (`src/finance/FinanceContext.tsx:50-67`). Cachear respostas de API guarda dado financeiro sensível no dispositivo: decidir conscientemente (ver §7, armadilha A4).

#### 5.6 Registrar o SW — `src/main.tsx`

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

E em `src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
```

#### 5.7 Safe area + `dvh` (iOS/Android)

`src/index.css` — adicionar junto do bloco `body` (linha 34-42):

```css
:root {
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-right: env(safe-area-inset-right, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-left: env(safe-area-inset-left, 0px);
}

html {
  color-scheme: dark;
}

body {
  /* ... existentes ... */
  min-height: 100vh;   /* fallback */
  min-height: 100dvh;  /* altura dinâmica real */
}
```

`src/App.tsx`:

- linha 128: `className="flex h-screen bg-[#0c0a08] ..."` → `className="flex h-[100dvh] bg-[#0c0a08] ..."`
- linha 131: `className="flex-1 relative z-10 overflow-hidden flex flex-col pb-16 md:pb-0"` →
  `className="flex-1 relative z-10 overflow-hidden flex flex-col pb-[calc(4rem+var(--safe-area-bottom))] md:pb-0"`
- linha 155 (bottom nav): `className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-edge bg-[#0c0a08]/95 backdrop-blur px-2 py-2"` →
  adicionar `style={{ paddingBottom: 'calc(0.5rem + var(--safe-area-bottom))' }}` e `paddingTop: 'calc(0.5rem + var(--safe-area-top))'`.

> `viewport-fit=cover` (passo 5.4) é obrigatório para `env(safe-area-inset-*)` ter valor != 0 no iOS.

#### 5.8 (Opcional) Prompt de instalação

Adicionar um hook que capture `beforeinstallprompt` e mostre um CTA no painel:

```ts
// src/hooks/useInstallPrompt.ts
export function useInstallPrompt() {
  const [prompt, setPrompt] = useState<BBeforeInstallPromptEvent | null>(null);
  useEffect(() => {
    const onPrompt = (e: Event) => { e.preventDefault(); setPrompt(e as never); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);
  const install = async () => { await prompt?.prompt(); setPrompt(null); };
  return { canInstall: !!prompt, install };
}
```

Não há tipo nativo para `BeforeInstallPromptEvent` no TS — declarar em `src/vite-env.d.ts` ou usar `any` controlado.

#### 5.9 Checagem da Fase 1

```bash
npm run build
npm run preview          # serve dist com SPA fallback
```

- Chrome DevTools → Application → **Manifest**: deve aparecer "Installability" sem erros.
- Application → **Service Workers**: registro ativo.
- Emulate → "Add to Home Screen" / instalar e abrir em standalone: bottom nav não pode ficar atrás da barra do iPhone.
- Lighthouse → categoria **PWA** (o Chrome ainda mostra a categoria PWA em auditorias; se sumiu, checar manualmente os critérios de installability).

---

### Fase 2 — Publicar o frontend com HTTPS (~meio dia)

O `Dockerfile` já está pronto (build Vite → Nginx com `try_files`).

**Build com a URL real do backend** (Vite **inlina** `VITE_API_URL` no build — não é runtime):

```bash
cd Front-end/DashboardFinanceiroFrontEnd
docker build \
  --build-arg VITE_API_URL="https://api.seudominio.com" \
  -t prisma-frontend:latest .
```

Ajustar o `Dockerfile` para receber o ARG:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build
```

**Opções de hospedagem**
1. **Cloud Run** (o projeto já menciona Cloud Run no `.env.example`):
   ```bash
   gcloud run deploy prisma-frontend \
     --image gcr.io/PROJETO/prisma-frontend:latest \
     --platform managed --region us-central1 \
     --allow-unauthenticated
   ```
   URL padrão: `https://prisma-frontend-xxxxx-uc.a.run.app` — **o domínio precisa ser estável** para TWA/Digital Asset Links (não use a URL de preview).
2. **VPS + Nginx + certbot** — reaproveitar o `Dockerfile` e o `nginx.conf` embutido.

**CORS no backend (Spring Boot)** — em `WebSecurityConfig.java` do backend (`Back-end/Sistema para controle Financeiro/.../config/WebSecurityConfig.java`):

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration cfg = new CorsConfiguration();
    cfg.setAllowedOrigins(List.of(
        "https://prisma.seudominio.com",
        "https://localhost:5173",
        "capacitor://localhost",
        "https://localhost"          // origem do Capacitor/WebView
    ));
    cfg.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
    cfg.setAllowedHeaders(List.of("*"));
    cfg.setAllowCredentials(true);
    ...
}
```

Não esquecer de permitir o preflight `OPTIONS` no `SecurityFilterChain`.

**HTTPS da API:** o backend precisa estar em https (ou o app em dev usará mixed content). Ver `SEGURANCA_HTTPS.md` na raiz do repo — já existe esse documento.

---

### Fase 3 — APK (escolher **um**)

#### 3A. TWA / Bubblewrap → APK para Play Store (recomendado se for publicar)

**Pré-requisitos:** Fase 1 completa, frontend no ar com HTTPS, PWA passando no Lighthouse.

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://prisma.seudominio.com/manifest.webmanifest
# edite bubblewrap.config.json: packageId, name, displayVersionCode, icon URLs, splash
bubblewrap build
```

**Digital Asset Links** — servir em `https://prisma.seudominio.com/.well-known/assetlinks.json`:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.prisma.painelfinanceiro",
      "sha256_cert_fingerprints": ["AA:BB:CC:...:FF"]
    }
  }
]
```

Gerar o fingerprint da chave de upload:

```bash
keytool -list -v -keystore upload-keystore.jks -alias upload | grep SHA256
```

> O fingerprint do `assetlinks.json` deve ser o da **chave de upload do Play Console** (a que assina o app distribuído).

**Alternativa sem CLI:** [PWABuilder](https://www.pwa-builder.com/) → cole a URL do PWA → gera APK/AAB assinado.

**Requisitos da Play Store (verificar os vigentes na data do upload):**
- target API 35 (Android 15) para apps novos;
- URL de **política de privacidade** pública (pode ser uma página estática no próprio domínio);
- formulário "Data safety" preenchido;
- AAB (não APK) para upload;
- limite de tamanho (~128 MB por APK / base module do AAB) — TWA costuma ter poucos MB;
- conta de desenvolvedor ($25 única vez) + verificação de identidade.

**Cuidado com a camada de autenticação:** a TWA abre no WebView com a origem do seu domínio, então **o JWT em `localStorage` funciona igual** e o CORS atual (mesma origem de API já liberada) segue válido.

#### 3B. Capacitor → APK avulso (sem Play, distribuir por link)

```bash
npm i -D @capacitor/cli @capacitor/core @capacitor/android
npm i @capacitor/status-bar @capacitor/keyboard @capacitor/push-notifications

npx cap init "Prisma" "com.prisma.painelfinanceiro" --web-dir=dist
npx cap add android
npx cap sync
npx cap open android     # abre no Android Studio
```

Gerar o APK pela CLI (sem abrir o Studio):

```bash
cd android && ./gradlew assembleDebug
# saída: android/app/build/outputs/apk/debug/app-debug.apk
```

Requisitos: **JDK 17**, Android Studio + **SDK 34/35**.

Diferenças em relação à TWA:
- A origem do WebView passa a ser `https://localhost` → **o CORS do backend precisa aceitar essa origem** (ver 5.x / Fase 2) ou usar o plugin `CapacitorHttp`, que faz as requisições nativamente e ignora CORS.
- `android/app/src/main/AndroidManifest.xml` precisa de `android:usesCleartextTraffic="true"` **apenas** se a API ainda for http (não recomendado em produção).
- Vantagens: bridge nativa (push notifications, status bar, share sheet), sem depender do service worker, APK distribuível por link sem passar por loja.
- `npx cap copy` precisa rodar **depois de cada `npm run build`** (ou usar `npm run build && npx cap copy` no script).

#### 3C. Alternativa mais simples (menos controle): "Add to Home Screen"

Sem APK: o Chrome/Edge/Safari instalam o PWA como um app (ícone na tela inicial, sem barra de URL). Custo zero, já coberto pela Fase 1. Vale como entrega mínima antes de partir para APK.

#### 5.10 Purga do cache de API entre sessões (**feito**) — `src/auth/AuthContext.tsx`

O runtime cache `api-v1` guarda respostas de `/api/v1/`. Sem cuidado, um segundo usuário que logar no **mesmo aparelho** (e o backend estiver fora do ar) veria os dados do usuário anterior.

```ts
// Nome do cache de runtime do service worker (ver vite.config.ts → workbox).
const API_CACHE_NAME = 'api-v1';

// O cache do SW guarda respostas de /api/v1. Limpar no login impede que o
// próximo usuário do mesmo aparelho leia dados do usuário anterior.
async function purgeApiCache() {
  if (typeof caches === 'undefined') return;
  try {
    await caches.delete(API_CACHE_NAME);
  } catch {
    // Limpeza é best-effort: se falhar, o login continua.
  }
}
```

Chamada `await purgeApiCache();` logo após gravar o token no `login()`, e `void purgeApiCache();` no `logout()` (antes do reload — pode ser abortado, mas a chamada do login cobre o caso).

---

## 6. Verificação final (checklist)

**PWA**
- [x] `manifest.webmanifest` gerado no build e servido (`dist/manifest.webmanifest`, 200 `application/manifest+json`)
- [x] Ícones 192, 512, maskable e apple-touch presentes em `public/icons/` (e copiados para `dist/icons/`)
- [x] `index.html` com `theme-color`, `apple-*` e `viewport-fit=cover`
- [x] Service worker gerado (`dist/sw.js`, `node --check` OK) e precache com 24 entradas
- [x] Rotas SPA respondem 200 em `vite preview` (`/painel`, `/transacoes`)
- [ ] **Manual**: DevTools → Application → Manifest (installability) e Service Workers
- [ ] **Manual**: instalar pelo Chrome e abrir em standalone → bottom nav sem colidir com o indicador home
- [ ] **Manual**: navegar para `/painel` offline (após a 1ª visita) → o app shell abre
- [ ] Lighthouse PWA sem erros

**Deploy**
- [ ] Frontend publicado em https com domínio estável
- [ ] `VITE_API_URL` de produção embutido no build (verificar em `dist/assets/*.js`)
- [ ] CORS do backend aceita a origem do frontend; preflight `OPTIONS` liberado
- [ ] Login, criar transação e listar categorias funcionam no domínio novo

**APK**
- [ ] `assetlinks.json` servido e correto (TWA) **ou** `npx cap sync` ok (Capacitor)
- [ ] APK instalado em aparelho real, abre em tela cheia
- [ ] Login funciona dentro do APK (localStorage persistente)
- [ ] Build de release assinado (`upload-keystore.jks`) — guarde a chave em lugar seguro

---

## 7. Armadilhas conhecidas

| # | Armadilha | Como evitar |
|---|---|---|
| A1 | **Manifest duplicado**: `public/manifest.webmanifest` **e** o bloco `manifest:` do plugin → o plugin sobrescreve o arquivo (ou vice-versa) | use só um dos dois |
| A2 | `vite-plugin-pwa` em dev: o SW só funciona em `build`+`preview` (ou `devOptions.enabled: true`) | testar sempre com `npm run build && npm run preview` |
| A3 | `navigateFallback` + Nginx `try_files` podem conflitar em rotas SPA | manter `try_files $uri $uri/ /index.html` e `navigateFallback: '/index.html'` |
| A4 | **Cache de API guarda dado financeiro sensível no dispositivo**; `NetworkFirst` pode devolver resposta velha silenciosamente | cachear só GETs, definir `expiration` curto, ou não cachear `/api/` (o app já tem fallback em `localStorage`) |
| A5 | iOS sem `apple-mobile-web-app-capable` abre no Safari em vez do standalone | meta tag `apple-mobile-web-app-capable` |
| A6 | `100vh` no iOS corta o conteúdo quando a barra do browser encolhe/expande | `100dvh` (com fallback `100vh`) |
| A7 | Capacitor muda a origem para `https://localhost` → CORS | liberar a origem no backend ou usar `CapacitorHttp` |
| A8 | `VITE_API_URL` é **build-time**; trocar a URL exige **rebuild**, não só restart | passar por `--build-arg` no Docker ou `.env.production` |
| A9 | TWA exige **domínio estável** (não URL de preview/ephemeral) | fixar um domínio (ex.: `app.seudominio.com`) antes de gerar o APK |
| A10 | Chave de assinatura do Play: perder a `upload-keystore.jks` = **impossível** publicar atualizações | backup seguro + registrar a senha no keystore do Play |
| A11 | `maskable` icon sem padding é recortado em círculo no Android | conteúdo dentro dos 80% centrais |
| A12 | A TWA não tem cache próprio: se o SW falhar, o app abre em branco | garantir SW ativo + `navigateFallback` antes de gerar o APK |

---

## 8. Ordem de execução recomendada

```
Fase 1 (PWA)          →  já dá app instalável pelo navegador
   ↓
Fase 2 (deploy HTTPS) →  pré-requisito de qualquer APK
   ↓
Fase 3A (TWA)  ou  3B (Capacitor)
```

Estimativa: Fase 1 ≈ 1 dia · Fase 2 ≈ 0,5 dia · Fase 3 ≈ 0,5 dia.

**Decisão pendente para a próxima sessão:** Play Store (3A) ou APK por link (3B)? E "offline full" (fila de escritas) entra no escopo ou fica só o shell cacheado?

---

## 9. Como retomar em outra sessão do OpenCode

Prompt sugerido:

> "Leia o documento `/home/kauezao/.opencode/plan/pwa-apk-prisma.md` e implemente a **Fase 1 (PWA)** do plano no repositório `Front-end/DashboardFinanceiroFrontEnd`. O diagnóstico já está feito — não precisa re-investigar. Comece pela Fase 1 e valide com `npm run build && npm run preview`. Não avance para as Fases 2 e 3 sem eu confirmar."

Arquivos-chave para a próxima sessão ler antes de editar:

- `Front-end/DashboardFinanceiroFrontEnd/vite.config.ts`
- `Front-end/DashboardFinanceiroFrontEnd/index.html`
- `Front-end/DashboardFinanceiroFrontEnd/src/main.tsx`
- `Front-end/DashboardFinanceiroFrontEnd/src/index.css` (linhas 34-50: body/html)
- `Front-end/DashboardFinanceiroFrontEnd/src/App.tsx` (linhas 125-135: shell; 155-191: bottom nav)
- `Front-end/DashboardFinanceiroFrontEnd/Dockerfile`
- `Back-end/Sistema para controle Financeiro/Sistema-para-controle-Financeiro/src/main/java/com/KeepFlow/Sistema/para/controle/Financeiro/config/WebSecurityConfig.java` (CORS)
- `SEGURANCA_HTTPS.md` (raiz do repo)

> Observação: este documento está fora do repositório (`~/.opencode/plan/`) porque foi gerado em modo de planejamento. Se preferir versioná-lo no repo, mova para `Front-end/DashboardFinanceiroFrontEnd/docs/` ou para a pasta de specs do fluxo SDD (`specs/`) e comite junto.
