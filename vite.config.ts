import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'node:url';
import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * Runs the same Web-standard handlers from `api/` that Vercel deploys, so local
 * dev needs neither `vercel dev` nor a linked project.
 */
function devApiRoutes(): Plugin {
  return {
    name: 'yomiq-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        const url = req.url ?? '';
        if (!url.startsWith('/api/')) return next();

        const route = url.split('?')[0].replace(/^\/api\//, '').replace(/\/$/, '');
        const method = (req.method ?? 'GET').toUpperCase();

        try {
          const mod = await server.ssrLoadModule(`/api/${route}.ts`);
          const handler = mod[method] ?? mod.default?.fetch;
          if (typeof handler !== 'function') {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: `No ${method} handler for /api/${route}` }));
            return;
          }

          const response: Response = await handler(await toWebRequest(req));
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          server.ssrFixStacktrace(error as Error);
          console.error(`[api] ${method} ${url} failed`, error);
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: (error as Error).message }));
        }
      });
    },
  };
}

async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const body = Buffer.concat(chunks);

  return new Request(`http://localhost${req.url}`, {
    method: req.method,
    headers: req.headers as Record<string, string>,
    body: body.length ? body : undefined,
  });
}

export default defineConfig(({ mode }) => {
  // Secrets stay server-side: envPrefix keeps everything unprefixed out of the
  // client bundle, but the dev API middleware still needs them on process.env.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    plugins: [
      react(),
      tailwindcss(),
      devApiRoutes(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
        manifest: {
          name: 'Yomiq — счётчик калорий',
          short_name: 'Yomiq',
          description: 'Считай калории по фото, голосом или текстом',
          lang: 'ru',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#0A0C0B',
          theme_color: '#0A0C0B',
          categories: ['health', 'fitness', 'lifestyle'],
          icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            { urlPattern: /^\/api\//, handler: 'NetworkOnly', method: 'POST' },
          ],
        },
      }),
    ],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: { port: 3000, host: true },
  };
});
