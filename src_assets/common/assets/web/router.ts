import { createRouter, createWebHistory, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// Route-level code splitting via dynamic imports
// Each view becomes a separate chunk loaded on demand
const DashboardView = () => import('@/views/DashboardView.vue');
const LibraryView = () => import('@/views/LibraryView.vue');
const GameSourcesView = () => import('@/views/GameSourcesView.vue');
const SystemView = () => import('@/views/SystemView.vue');
const SettingsView = () => import('@/views/SettingsView.vue');
const TroubleshootingView = () => import('@/views/TroubleshootingView.vue');
const ClientManagementView = () => import('@/views/ClientManagementView.vue');
const WebRtcClientView = () => import('@/views/WebRtcClientView.vue');

const routes = [
  { path: '/', component: DashboardView },
  { path: '/pairing', component: ClientManagementView },
  { path: '/library', component: LibraryView },
  { path: '/applications', component: () => import('@/views/ApplicationsView.vue') },
  { path: '/game-sources', component: GameSourcesView },
  { path: '/system', component: SystemView },
  { path: '/settings', component: SettingsView, meta: { container: 'lg' } },
  { path: '/logs', component: DashboardView },
  { path: '/troubleshooting', component: TroubleshootingView },
  { path: '/clients', component: ClientManagementView },
  { path: '/webrtc', component: WebRtcClientView, meta: { container: 'full' } },
  // Legacy/unknown routes → redirect to home
  { path: '/welcome', redirect: '/' },
  { path: '/login', redirect: '/' },
  { path: '/password', redirect: '/' },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const CHUNK_RELOAD_FLAG = 'sunshine:chunk-reload';
const chunkErrorPatterns = [
  'Failed to fetch dynamically imported module',
  'Importing a module script failed',
];

function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  if (typeof error === 'string') {
    return chunkErrorPatterns.some((pattern) => error.includes(pattern));
  }
  if (error instanceof Error) {
    const message = error.message ?? '';
    if (chunkErrorPatterns.some((pattern) => message.includes(pattern))) {
      return true;
    }
    if (error.name === 'ChunkLoadError') {
      return true;
    }
    if ('code' in error && typeof (error as { code?: unknown }).code === 'string') {
      const code = (error as { code?: string }).code ?? '';
      return code === 'ERR_MODULE_NOT_FOUND';
    }
  }
  return false;
}

export const router = createRouter({
  // Use HTML5 history mode (no # in URLs)
  history: createWebHistory('/'),
  routes,
});

// Lightweight guard: if navigating to a protected route and not authenticated,
// open login modal (in-memory redirect) but allow navigation so URL stays.
router.beforeEach(async (_to: RouteLocationNormalized) => {
  if (typeof window === 'undefined') return true;
  try {
    const auth = useAuthStore();
    // Ensure auth store initialized before route components mount
    if (!auth.ready && typeof auth.init === 'function') {
      try {
        await auth.init();
      } catch {
        /* ignore */
      }
    }
    // Only require login if the server actually responded (avoids blocking static previews)
    // Skip if already authenticated, actively logging in, or modal already visible
    if (
      auth.serverResponded &&
      !auth.isAuthenticated &&
      !auth.loggingIn &&
      !auth.showLoginModal
    ) {
      auth.requireLogin();
    }
  } catch {
    /* ignore */
  }
  // Always allow navigation so URL remains intact
  return true;
});

router.onError((error) => {
  if (typeof window === 'undefined') return;
  if (!isChunkLoadError(error)) return;
  try {
    const storage = window.sessionStorage;
    if (storage && !storage.getItem(CHUNK_RELOAD_FLAG)) {
      storage.setItem(CHUNK_RELOAD_FLAG, Date.now().toString());
      window.location.reload();
      return;
    }
    storage?.removeItem(CHUNK_RELOAD_FLAG);
  } catch {}
  window.location.replace(window.location.origin);
});
