import fs from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import Components from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import vue from '@vitejs/plugin-vue';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import { fileURLToPath } from 'url';

// Resolve directory of this config file (works even if the folder was moved)
const CONFIG_DIR = fileURLToPath(new URL('.', import.meta.url));

// Find the repo root by walking up until a CMakeLists.txt is found (best-effort, capped depth)
function findRepoRoot(startDir: string): string {
  let dir = startDir;
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(resolve(dir, 'CMakeLists.txt'))) return dir;
    const parent = resolve(dir, '..');
    if (parent === dir) break;
    dir = parent;
  }
  return startDir;
}

// Resolve source assets directory, supporting legacy env override and new layouts
function resolveAssetsSrcPath(): string {
  let src = CONFIG_DIR; // default to the folder containing this config

  if (!process.env['SUNSHINE_BUILD_HOMEBREW'] && process.env['SUNSHINE_SOURCE_ASSETS_DIR']) {
    const override = fs.realpathSync(process.env['SUNSHINE_SOURCE_ASSETS_DIR'] as string);
    // If override points directly to a folder with index.html, use it
    if (fs.existsSync(resolve(override, 'index.html'))) {
      src = override;
    } else if (fs.existsSync(resolve(override, 'common/assets/web/index.html'))) {
      // Backward-compat with original layout where override was repo/src_assets root
      src = resolve(override, 'common/assets/web');
    } else if (fs.existsSync(resolve(override, 'assets/web/index.html'))) {
      // Alternate layout where override is repo root
      src = resolve(override, 'assets/web');
    } else {
      // Fallback to override itself if it exists
      src = override;
    }
  }

  return src;
}

// Resolve destination assets directory; defaults to <repoRoot>/build/assets/web
function resolveAssetsDstPath(): string {
  const repoRoot = findRepoRoot(CONFIG_DIR);
  let dst = resolve(repoRoot, 'build/assets/web');

  if (!process.env['SUNSHINE_BUILD_HOMEBREW'] && process.env['SUNSHINE_ASSETS_DIR']) {
    // Keep legacy behavior: env points to install root, append assets/web
    dst = resolve(fs.realpathSync(process.env['SUNSHINE_ASSETS_DIR'] as string), 'assets/web');
  }

  return dst;
}

const assetsSrcPath = resolveAssetsSrcPath();
const assetsDstPath = resolveAssetsDstPath();

const header = fs.readFileSync(resolve(assetsSrcPath, 'template_header.html'), 'utf-8');

function getManualChunk(id: string): string | undefined {
  const normalized = id.replace(/\\/g, '/');
  const nodeModulesMarker = '/node_modules/';
  const markerIndex = normalized.indexOf(nodeModulesMarker);
  if (markerIndex === -1) {
    return undefined;
  }

  const packagePath = normalized.slice(markerIndex + nodeModulesMarker.length);
  const packageName = packagePath.startsWith('@')
    ? packagePath.split('/').slice(0, 2).join('/')
    : packagePath.split('/')[0]!;

  if (
    packageName === 'vue' ||
    packageName === 'pinia' ||
    packageName === 'vue-router' ||
    packageName === 'vue-i18n' ||
    packageName.startsWith('@vue/') ||
    packageName.startsWith('@intlify/')
  ) {
    return 'vue-core';
  }

  if (
    packageName === 'naive-ui' ||
    packageName === 'vueuc' ||
    packageName === 'vooks' ||
    packageName === 'css-render' ||
    packageName === 'seemly' ||
    packageName === 'evtd'
  ) {
    // Keep the Naive UI stack in the general vendor chunk. Splitting it into its
    // own manual chunk can create a circular import with the remaining vendor
    // bundle in release builds, which prevents the app from mounting at all.
    return 'vendor';
  }

  return 'vendor';
}

export default defineConfig(({ mode }) => {
  const isDebug = mode === 'debug';
  // 'serve'      → Vite dev server with stub API (no backend needed)
  // 'serve-live' → Vite dev server proxying to real Sunshine backend
  const isServe = mode === 'serve' || mode === 'serve-live';
  const isStubMode = mode === 'serve';

  return {
    root: resolve(assetsSrcPath),
    base: isServe ? '/' : './',
    appType: isServe ? 'spa' : 'custom',
    resolve: {
      alias: { '@': resolve(assetsSrcPath) },
    },
    // Compile-time Vue feature flags
    // - Keep Options API off
    // - Enable Vue devtools in production when building Debug bundles
    define: {
      __VUE_OPTIONS_API__: false,
      __VUE_PROD_DEVTOOLS__: isDebug,
    },
    plugins: [
      vue(),
      Components({
        // Auto-import only used Naive UI components to minimize bundle
        resolvers: [NaiveUiResolver()],
        dts: false,
      }),
      ViteEjsPlugin({ header }),
      // Allow importing locale JSON from public/ as a JS module.
      // Vite blocks importing from public/ and vite:json matches any ID ending with .json.
      // We use a virtual ID that ends with .locale-data so vite:json's transform skips it.
      {
        name: 'locale-public-import-shim',
        enforce: 'pre' as const,
        resolveId(id: string): string | undefined {
          if (id.includes('public/assets/locale/') && id.endsWith('.json')) {
            const filePath = id.replace('@/', assetsSrcPath + '/');
            // Use .locale-data extension so vite:json (/.json$/) does not match
            return '\0' + filePath.replace(/\.json$/, '.locale-data');
          }
          return undefined;
        },
        load(id: string): string | undefined {
          if (id.startsWith('\0') && id.endsWith('.locale-data')) {
            const jsonPath = id.slice(1).replace(/\.locale-data$/, '.json');
            return `export default ${fs.readFileSync(jsonPath, 'utf-8')};`;
          }
          return undefined;
        },
      },
      // Dev-only: stub API responses so the UI works without a running backend.
      // Only active in 'serve' mode (npm run dev). In 'serve-live' (npm run dev:live)
      // all /api calls proxy straight to the real Sunshine backend.
      ...(isStubMode ? [{
        name: 'dev-api-stubs',
        configureServer(server: any) {
          // Mutable stub state so disconnect/connect actually change what /api/game-sources returns
          const stubSourceStates: Record<string, any> = {
            steam:        { id: 'steam',         name: 'Steam',          connected: false, connectionState: 'requires_action', syncState: 'not_started', owned: 0,  installed: 0,  playable: 0 },
            epic:         { id: 'epic',          name: 'Epic Games',     connected: false, connectionState: 'requires_action', syncState: 'not_started', owned: 0,  installed: 0,  playable: 0 },
            gog:          { id: 'gog',           name: 'GOG',            connected: false, connectionState: 'requires_action', syncState: 'not_started', owned: 0,  installed: 0,  playable: 0 },
            xbox:         { id: 'xbox',          name: 'Xbox',           connected: false, connectionState: 'requires_action', syncState: 'not_started', owned: 0,  installed: 0,  playable: 0 },
            playniteLegacy:{ id: 'playniteLegacy',name: 'Playnite Legacy',connected: false, connectionState: 'not_connected',  syncState: 'not_started', owned: 0,  installed: 0,  playable: 0 },
            manual:       { id: 'manual',        name: 'Manual',         connected: true,  connectionState: 'available',       syncState: 'ready',       owned: 0,  installed: 0,  playable: 0 },
          };

          server.middlewares.use((req: any, res: any, next: any) => {
            if (!req.url?.startsWith('/api/')) return next();

            const json = (data: unknown) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            };

            const url: string = req.url.split('?')[0];

            if (url === '/api/auth/status') {
              return json({ status: true, authenticated: false, login_required: false, credentials_configured: false });
            }
            if (url === '/api/auth/sessions') {
              return json({ status: true, sessions: [] });
            }
            if (url === '/api/config' && (req.method === 'GET' || req.method === undefined)) {
              return json({ status: true, config: {} });
            }
            if (url === '/api/configLocale') {
              return json({ status: true, locale: 'en' });
            }
            if (url === '/api/metadata') {
              return json({ status: true, version: 'dev', branch: 'main', build: 'stub', platform: 'windows' });
            }
            if (url === '/api/setup/status') {
              return json({ status: true, setup_complete: true, credentials_configured: true });
            }
            if (url === '/api/apps') {
              return json({ status: true, apps: [
                { uuid: 'uuid-steam-1', name: 'Cyberpunk 2077', 'image-path': '', cmd: '', index: 0 },
                { uuid: 'uuid-steam-2', name: 'Elden Ring', 'image-path': '', cmd: '', index: 1 },
                { uuid: 'uuid-epic-1', name: 'Fortnite', 'image-path': '', cmd: '', index: 2 },
                { uuid: 'uuid-manual-1', name: 'Notepad', 'image-path': '', cmd: 'notepad.exe', index: 3 },
              ]});
            }
            if (url === '/api/game-sources') {
              return json({ status: true, sources: Object.values(stubSourceStates) });
            }
            if (url === '/api/library/games') {
              // Build library from currently connected stub sources so connect/disconnect is reflected.
              const games: any[] = [];
              const steamState = stubSourceStates['steam'];
              const epicState  = stubSourceStates['epic'];
              if (steamState?.connected) {
                games.push(
                  { id: 'g1', uuid: 'uuid-steam-1', sourceId: 'steam', sourceName: 'Steam', title: 'Cyberpunk 2077', owned: true, installed: true,  playable: true,  installState: 'installed',     posterUrl: null, posterState: 'missing', metadata: {} },
                  { id: 'g2', uuid: 'uuid-steam-2', sourceId: 'steam', sourceName: 'Steam', title: 'Elden Ring',    owned: true, installed: true,  playable: true,  installState: 'installed',     posterUrl: null, posterState: 'missing', metadata: {} },
                  { id: 'g3', uuid: null,           sourceId: 'steam', sourceName: 'Steam', title: 'Red Dead Redemption 2', owned: true, installed: false, playable: false, installState: 'not_installed', posterUrl: null, posterState: 'missing', providerGameId: '1174180', metadata: {} },
                  { id: 'g4', uuid: null,           sourceId: 'steam', sourceName: 'Steam', title: 'The Witcher 3', owned: true, installed: true,  playable: false, installState: 'installed',     posterUrl: null, posterState: 'missing', providerGameId: '292030', metadata: {} },
                );
              }
              if (epicState?.connected) {
                games.push(
                  { id: 'g5', uuid: 'uuid-epic-1', sourceId: 'epic', sourceName: 'Epic Games', title: 'Fortnite', owned: true, installed: true, playable: true, installState: 'installed', posterUrl: null, posterState: 'missing', metadata: {} },
                  { id: 'g6', uuid: null,           sourceId: 'epic', sourceName: 'Epic Games', title: 'Alan Wake 2', owned: true, installed: false, playable: false, installState: 'not_installed', posterUrl: null, posterState: 'missing', providerGameId: 'AlanWake2', metadata: {} },
                );
              }
              const installed = games.filter((g) => g.installed).length;
              const playable  = games.filter((g) => g.playable).length;
              return json({ status: true, games, summary: { ownedGameCount: games.length, installedGameCount: installed, playableGameCount: playable, posterAvailableCount: 0 }, sources: Object.keys(stubSourceStates).filter((k) => stubSourceStates[k]?.connected), metadata: { status: 'pending_configuration' } });
            }
            if (/^\/api\/game-sources\/[^/]+\/connect$/.test(url) && req.method === 'POST') {
              const sourceId = url.split('/')[3]!;
              // Stub mode has no real backend — simulate a successful connection instantly.
              // Real OAuth (Steam popup, Epic login, etc.) only works in dev:live mode with
              // the Sunshine backend running at https://localhost:47984.
              const fakeCounts: Record<string, { owned: number; installed: number; playable: number }> = {
                steam: { owned: 312, installed: 47, playable: 47 },
                epic:  { owned: 89,  installed: 12, playable: 12 },
                gog:   { owned: 54,  installed: 8,  playable: 8  },
                xbox:  { owned: 120, installed: 15, playable: 15 },
              };
              if (sourceId && stubSourceStates[sourceId]) {
                const counts = fakeCounts[sourceId] ?? { owned: 10, installed: 5, playable: 5 };
                stubSourceStates[sourceId]!.connected = true;
                stubSourceStates[sourceId]!.connectionState = 'connected';
                stubSourceStates[sourceId]!.owned = counts.owned;
                stubSourceStates[sourceId]!.installed = counts.installed;
                stubSourceStates[sourceId]!.playable = counts.playable;
              }
              return json({ status: true, sourceId, connectionState: 'connected', message: `${sourceId} connected (stub mode — use dev:live for real auth).` });
            }
            if (/^\/api\/game-sources\/[^/]+\/sync$/.test(url) && req.method === 'POST') {
              const sourceId = url.split('/')[3]!;
              if (sourceId && stubSourceStates[sourceId] && stubSourceStates[sourceId]!.connected) {
                stubSourceStates[sourceId]!.syncState = 'completed';
              }
              return json({ status: true, sourceId, syncState: 'completed', message: 'Sync completed successfully.' });
            }
            if (/^\/api\/game-sources\/[^/]+\/disconnect$/.test(url) && req.method === 'POST') {
              const sourceId = url.split('/')[3]!;
              // Update stub state for disconnect
              if (sourceId && stubSourceStates[sourceId]) {
                stubSourceStates[sourceId]!.connected = false;
                stubSourceStates[sourceId]!.connectionState = 'not_connected';
                stubSourceStates[sourceId]!.owned = 0;
                stubSourceStates[sourceId]!.installed = 0;
                stubSourceStates[sourceId]!.playable = 0;
              }
              return json({ status: true, sourceId, connectionState: 'not_connected', message: 'Provider disconnected. All stored tokens have been removed.' });
            }
            if (url === '/api/apps/launch' && req.method === 'POST') {
              return json({ status: true, message: 'Game launched.' });
            }
            if (url === '/api/apps' && req.method === 'POST') {
              return json({ status: true, uuid: 'uuid-new-' + Date.now(), message: 'App added.' });
            }
            // Fall through anything else to the proxy
            next();
          });
        },
      }] : []),
    ],
    css: {
      // Include CSS sources in sourcemaps during debug
      devSourcemap: isDebug,
    },
    server: isServe ? {
      host: '0.0.0.0',
      port: 5173,
      strictPort: false,
      proxy: {
        '/api': {
          // VITE_SUNSHINE_PORT lets the dev script pass the real backend port
          // (e.g. 4921 for an installed Apollo/Sunshine with base port 4920).
          // Falls back to 47990 which is the default for the dev-build binary.
          target: `https://127.0.0.1:${process.env['VITE_SUNSHINE_PORT'] ?? '47990'}`,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            // Strip the Secure flag from Set-Cookie headers so session cookies
            // set by the HTTPS backend are accepted by the HTTP dev server.
            proxy.on('proxyRes', (proxyRes) => {
              // Strip WWW-Authenticate to prevent native browser login prompts (we use a custom UI)
              if (proxyRes.headers['www-authenticate']) {
                delete proxyRes.headers['www-authenticate'];
              }

              const raw = proxyRes.headers['set-cookie'];
              if (raw) {
                proxyRes.headers['set-cookie'] = raw.map((c: string) => {
                  let cookie = c;
                  // Remove Secure flag (backend is HTTPS, dev server is HTTP)
                  cookie = cookie.replace(/;\s*Secure/gi, '');
                  // Normalise any SameSite value to Lax so the browser sends
                  // the cookie on same-origin proxied requests
                  cookie = cookie.replace(/;\s*SameSite=\w+/gi, '; SameSite=Lax');
                  // Strip Domain attribute – lets the cookie bind to localhost
                  // rather than 127.0.0.1 (which the browser would reject)
                  cookie = cookie.replace(/;\s*Domain=[^;]*/gi, '');
                  return cookie;
                });
              }
            });
            // Prevent Vite dev server from crashing when the backend is unreachable
            proxy.on('error', (_err, _req, res: any) => {
              if (res && !res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: false, error: 'Backend unreachable' }));
              }
            });
          },
        },
      },
      // Open browser automatically
      open: '/',
    } : {},
    build: {
      sourcemap: isDebug ? 'inline' : false,
      emptyOutDir: true,
      chunkSizeWarningLimit: 600,
      minify: isDebug ? false : 'esbuild',
      rollupOptions: {
        input: { index: resolve(assetsSrcPath, 'index.html') },
        output: {
          manualChunks: getManualChunk,
        },
      },
    },
  };
});
