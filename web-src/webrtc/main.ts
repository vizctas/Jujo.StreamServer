// Router: sign-in -> focus mode (account servers) -> launcher (this server's library) -> stream.
import { fetchAuth, say, startGamepadNav, type AuthState } from './ui/shell';
import { showSignin } from './ui/signin';
import { showFocus } from './ui/focus';
import { showLauncher } from './ui/launcher';
import { startStream } from './ui/stream';
import { openSettings } from './ui/settings';

// Arriving from another server's focus mode: the server is already chosen, open its launcher.
let wantLauncher = location.hash === '#play';
if (wantLauncher) history.replaceState(null, '', location.pathname + location.search);

/** Every entry point goes through here: a failing screen shows a message instead of an unhandled rejection. */
function route(triedRefresh = false): Promise<void> {
  return routeInner(triedRefresh).catch(() => say('Algo falló al cargar esta pantalla. Recarga la página para intentarlo de nuevo.', true));
}

async function routeInner(triedRefresh: boolean): Promise<void> {
  let auth: AuthState;
  try {
    auth = await fetchAuth();
  } catch {
    say('No se pudo contactar este servidor', true);
    return;
  }
  if (!auth.cloudRegistered) return showSignin({ auth, step: 'blocked', onDone: () => route() });
  if (!auth.cloudTrusted || !auth.authenticated) {
    // Device already trusted: a still-valid refresh cookie avoids asking anything again.
    if (auth.cloudTrusted && !triedRefresh && (await fetch('/api/auth/refresh', { method: 'POST', credentials: 'same-origin' }).catch(() => undefined))?.ok) {
      return route(true);
    }
    return showSignin({ auth, step: auth.cloudTrusted && auth.serverPasswordRequired ? 'server' : 'cloud', onDone: () => route() });
  }
  if (wantLauncher) {
    wantLauncher = false;
    return launcher(auth);
  }
  return focus(auth);
}

function focus(auth: AuthState): Promise<void> {
  return showFocus({
    auth,
    onEnter: () => launcher(auth),
    onResync: () => showSignin({ auth, step: 'cloud', resync: true, onDone: () => focus(auth), onDismiss: () => focus(auth) }),
    onSettings: () => settings(auth),
  });
}

function launcher(auth: AuthState, refresh = false): Promise<void> {
  return showLauncher({
    auth,
    refresh,
    onServers: () => focus(auth),
    onSettings: () => settings(auth),
    onPlay: (target, serverName) =>
      startStream({
        target,
        serverName,
        guestRole: auth.guestRole,
        onExit: (reason) => {
          void launcher(auth, true);
          if (reason) say(reason, true);
        },
      }),
  });
}

function settings(auth: AuthState): void {
  openSettings({ auth, onSignedOut: () => route() });
}

window.addEventListener('jujo-unauthorized', () => {
  if (document.querySelector<HTMLElement>('[data-screen="stream"]')?.hidden !== false) void route();
});

startGamepadNav();
void route();
