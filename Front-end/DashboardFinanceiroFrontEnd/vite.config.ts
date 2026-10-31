import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // force restart
  return {
    // Pré-empacota o React explicitamente. Também muda o código de versão das
    // dependências, o que força o navegador a largar arquivos antigos do cache.
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-dom/client'],
    },
    plugins: [
      react(),
      tailwindcss(),
      // PWA: gera o manifest, o service worker e injeta <link rel="manifest"> no index.html.
      // O SW só existe em build/preview (dev fica de fora por padrão).
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Prisma Finance — Painel Financeiro',
          short_name: 'Prisma Finance',
          description: 'Painel financeiro pessoal: entradas, saídas, categorias e metas.',
          lang: 'pt-BR',
          dir: 'ltr',
          start_url: '/painel',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#000000',
          theme_color: '#000000',
          categories: ['finance', 'productivity'],
          icons: [
            {src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any'},
            {src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any'},
            {src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
          ],
        },
        workbox: {
          // App shell: HTML/CSS/JS/fontes/ícones entram no precache (app abre offline).
          globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
          // Rotas SPA (/painel, /transacoes, ...) caem no index.html.
          navigateFallback: '/index.html',
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              // Só GET é cacheado (POST /transacao/criar continua exigindo rede).
              // Vale tanto para API same-origin quanto cross-origin (VITE_API_URL).
              urlPattern: ({url}) => url.pathname.startsWith('/api/v1/'),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-v1',
                networkTimeoutSeconds: 5,
                expiration: {maxEntries: 80, maxAgeSeconds: 60 * 60 * 24},
                cacheableResponse: {statuses: [0, 200]},
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
