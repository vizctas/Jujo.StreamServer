// Axios HTTP client with centralized auth handling
import axios, { AxiosResponse, AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth';

// ─────────────────────────────────────────────────────────────────────────────
// Session token store (in-memory + sessionStorage fallback)
// The backend uses __Host-prefixed cookies which require HTTPS.
// In HTTP dev mode (Vite proxy) we store the token in sessionStorage and
// inject it as  Authorization: Session <token>  on every request instead.
// ─────────────────────────────────────────────────────────────────────────────
const SESSION_KEY = '__jujo_session';
const REFRESH_KEY = '__jujo_refresh';
const REMEMBER_KEY = 'sunshine.auth.remember';

let _sessionToken: string | null = null;
let _refreshToken: string | null = null;

function loadTokens(): void {
  try {
    // Prefer sessionStorage (per-tab, secure); fall back to localStorage (persisted when remember_me=true)
    _sessionToken = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    _refreshToken = sessionStorage.getItem(REFRESH_KEY) || localStorage.getItem(REFRESH_KEY);
  } catch {
    /* storage blocked */
  }
}

function saveTokens(session: string | null, refresh?: string | null, remember = false): void {
  _sessionToken = session;
  if (refresh !== undefined) _refreshToken = refresh;
  try {
    if (session) {
      sessionStorage.setItem(SESSION_KEY, session);
      // When remember_me is active, also persist session to localStorage so it survives
      // tab/browser restarts (within the session TTL window).
      if (remember) {
        localStorage.setItem(SESSION_KEY, session);
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    } else {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
    }
    if (refresh !== undefined) {
      sessionStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(REFRESH_KEY);
      if (refresh) {
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(REFRESH_KEY, refresh);
      }
    }
    if (remember) {
      localStorage.setItem(REMEMBER_KEY, '1');
    } else if (refresh !== undefined) {
      localStorage.removeItem(REMEMBER_KEY);
    }
  } catch {
    /* storage blocked */
  }
}

export function clearSessionTokens(): void {
  saveTokens(null, null, false);
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  } catch {
    /* storage blocked */
  }
}

/**
 * Called after a successful login/refresh response.
 * Extracts token from the response body (preferred) or falls back to cookies.
 */
export function applyLoginResponse(data: any, rememberOverride?: boolean): void {
  const sessionToken: string | undefined = data?.token;
  const refreshToken: string | undefined = data?.refresh_token ?? undefined;
  const remember = rememberOverride ?? data?.remember_me === true;
  if (sessionToken) {
    saveTokens(sessionToken, refreshToken ?? null, remember);
  }
}

// Bootstrap: load any previously stored tokens
loadTokens();

// ─────────────────────────────────────────────────────────────────────────────
// Axios instance
// ─────────────────────────────────────────────────────────────────────────────
export const http = axios.create({
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

let authInitialized = false;
let refreshPromise: Promise<boolean> | null = null;

export async function refreshSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  const auth = useAuthStore();
  const cfg: any = {
    validateStatus: () => true,
    headers: {
      'X-Skip-Auth-Refresh': '1',
    },
  };
  cfg.__skipAuthRefresh = true;

  // Include refresh token as Authorization header if we have one stored
  if (_refreshToken) {
    cfg.headers['Authorization'] = `Refresh ${_refreshToken}`;
  }

  refreshPromise = http
    .post('/api/auth/refresh', {}, cfg)
    .then((res) => {
      if (res?.status === 200 && res.data && (res.data as any).status) {
        applyLoginResponse(res.data);
        auth.setAuthenticated(true);
        return true;
      }
      clearSessionTokens();
      auth.setAuthenticated(false);
      return false;
    })
    .catch(() => {
      clearSessionTokens();
      return false;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

function initAuthHandling(): void {
  if (authInitialized) return;
  authInitialized = true;
  const auth = useAuthStore();

  // ── Request interceptor ───────────────────────────────────────────────────
  // 1. Block unauthenticated requests (except public endpoints)
  // 2. Inject Authorization: Session <token> header when we have a stored token
  http.interceptors.request.use((config) => {
    try {
      const urlRaw = String(config.url || '');
      let path = urlRaw;
      try {
        const u = new URL(urlRaw, window.location.origin);
        path = u.pathname;
      } catch {}

      if ((auth as any).logoutInitiated) {
        const err: any = new Error('Request blocked: user logged out');
        err.code = 'ERR_CANCELED';
        return Promise.reject(err);
      }

      const allowWhenLoggedOut =
        /(\s*\/api\/auth\/(login|status|refresh)\b|\s*\/api\/password\b|\s*\/api\/configLocale\b)/.test(
          path,
        );
      const isCredentialExchange =
        /(\s*\/api\/auth\/(login|refresh)\b|\s*\/api\/password\b)/.test(path);
      const allowUnauthenticated = (config as any)?.__allowUnauthenticated === true;

      if (!auth.isAuthenticated && !allowWhenLoggedOut && !allowUnauthenticated && auth.serverResponded) {
        const err: any = new Error('Request blocked: unauthenticated');
        err.code = 'ERR_CANCELED';
        return Promise.reject(err);
      }

      // Inject stored session token as Authorization header
      // This bypasses __Host- cookie restrictions in HTTP dev mode
      if (_sessionToken && !isCredentialExchange) {
        config.headers = config.headers ?? {};
        // Only inject if not already set (don't overwrite explicit Bearer tokens)
        if (!config.headers['Authorization']) {
          config.headers['Authorization'] = `Session ${_sessionToken}`;
        }
      }

      return config;
    } catch {
      return config;
    }
  });

  function triggerLoginModal(): void {
    if (typeof window === 'undefined') return;
    try {
      auth.requireLogin({ bypassLogoutGuard: true });
    } catch {
      /* noop */
    }
  }

  // ── Response interceptor ─────────────────────────────────────────────────
  http.interceptors.response.use(
    async (response: AxiosResponse) => {
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sunshine:online'));
        }
      } catch {}
      return response;
    },
    async (error: AxiosError) => {
      try {
        if (typeof window !== 'undefined') {
          const isCanceled = (error as any)?.code === 'ERR_CANCELED';
          const auth = useAuthStore();
          const userLoggedOut = (auth as any).logoutInitiated === true;
          if (!error?.response) {
            if (!isCanceled && !userLoggedOut) {
              window.dispatchEvent(new CustomEvent('sunshine:offline'));
            }
          } else {
            window.dispatchEvent(new CustomEvent('sunshine:online'));
          }
        }
      } catch {}

      const status = error?.response?.status;
      const originalRequest: any = error.config || {};
      const skipAuthRetry =
        originalRequest?.__skipAuthRefresh === true ||
        (originalRequest?.headers && originalRequest.headers['X-Skip-Auth-Refresh']);
      const isAuthRequest = /\/api\/auth\/(login|refresh)\b/.test(
        String(originalRequest?.url || ''),
      );
      const userLoggedOut = (auth as any).logoutInitiated === true;

      if (status === 401) {
        // Grace period: 5s after login, suppress state mutations and modal
        const lastAuth = (auth as any)._lastAuthSuccess as number | undefined;
        const inGracePeriod = lastAuth ? Date.now() - lastAuth < 5000 : false;
        if (inGracePeriod) {
          if (!originalRequest.__graceRetry) {
            originalRequest.__graceRetry = true;
            await new Promise((r) => setTimeout(r, 400));
            return http(originalRequest);
          }
          if (import.meta.env.DEV) {
            console.warn(
              `[Auth] 401 suppressed (grace period): ${originalRequest?.url || 'unknown'}`,
            );
          }
          return Promise.reject(error);
        }

        // Outside grace period: try token refresh
        if (!skipAuthRetry && !isAuthRequest && !userLoggedOut) {
          const refreshed = await refreshSession();
          if (refreshed) {
            originalRequest.__skipAuthRefresh = true;
            originalRequest.__isRetryRequest = true;
            // Update Authorization header on the retry request
            if (_sessionToken) {
              originalRequest.headers = originalRequest.headers ?? {};
              originalRequest.headers['Authorization'] = `Session ${_sessionToken}`;
            }
            return http(originalRequest);
          }
        }

        clearSessionTokens();
        if (auth.isAuthenticated) auth.setAuthenticated(false);
        if (!userLoggedOut) triggerLoginModal();
      } else if (
        error?.response?.status === 400 &&
        error?.response?.data &&
        /Credentials not configured/i.test(JSON.stringify(error.response.data))
      ) {
        auth.setCredentialsConfigured(false);
        triggerLoginModal();
      }
      return Promise.reject(error);
    },
  );
}

// Called from main init after pinia is ready
export function initHttpLayer(): void {
  initAuthHandling();
}
