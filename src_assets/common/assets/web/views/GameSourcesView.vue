<template>
  <div class="mx-auto max-w-6xl space-y-6">
    <section class="page-surface p-5 md:p-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div class="max-w-2xl space-y-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-primary">Game Sources</p>
          <h1 class="text-2xl font-semibold tracking-tight">Connect your game libraries</h1>
          <p class="text-sm leading-6 text-dark/70 dark:text-light/70">
            Sign in to your platforms so Jujo.Stream can validate your library, detect installed games
            on this PC, and keep the streaming library current. Manual games remain available for
            anything outside a store.
          </p>
        </div>
        <RouterLink to="/library" custom v-slot="{ navigate, href }">
          <a :href="href" @click="navigate">
            <n-button tag="span" strong>
              <LucideIcon name="fa-gamepad" :size="16" />
              <span>Open Library</span>
            </n-button>
          </a>
        </RouterLink>
      </div>
    </section>

    <n-alert v-if="actionMessage" :type="actionMessage.type" :bordered="false" closable @close="actionMessage = null">
      {{ actionMessage.text }}
    </n-alert>

    <section class="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="source in sources" :key="source.id" class="source-card page-surface">
        <div class="source-banner" :aria-label="source.name + ' banner'">
          <div class="source-banner-media">
            <img
              v-if="source.logoUrl"
              :src="source.logoUrl"
              :alt="source.name + ' logo'"
              class="source-banner-img"
              :style="source.logoPosition ? { objectPosition: source.logoPosition } : {}"
            />
            <span v-else class="source-mark-text">{{ source.mark }}</span>
          </div>
        </div>

        <div class="source-body">
          <div class="min-w-0 space-y-4">
            <div class="space-y-1">
              <div class="flex min-h-[1.75rem] flex-wrap items-center gap-2">
                <h2 class="text-base font-semibold">{{ source.name }}</h2>
                <n-tag :type="source.statusType" :bordered="false" size="small">
                  {{ source.statusLabel }}
                </n-tag>
              </div>
              <p class="text-sm leading-6 text-dark/68 dark:text-light/68">
                {{ source.description }}
              </p>
            </div>

            <div class="space-y-2 text-xs text-dark/62 dark:text-light/62">
              <div class="grid grid-cols-2 gap-2 text-center">
                <div class="source-stat">
                  <span>{{ source.ownedGameCount }}</span>
                  <small>Owned</small>
                </div>
                <div class="source-stat">
                  <span>{{ source.installedGameCount }}</span>
                  <small>Installed</small>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <LucideIcon name="fa-shield-halved" :size="14" />
                <span>{{ source.security }}</span>
              </div>
              <div class="flex items-center gap-2">
                <LucideIcon name="fa-sync" :size="14" />
                <span>{{ source.sync }}</span>
              </div>
            </div>
          </div>

          <div class="source-actions">
            <details v-if="source.id === 'steam'" class="steam-fallback">
              <summary>
                <LucideIcon name="fa-key" :size="13" />
                <span>Private account fallback</span>
              </summary>
              <div class="steam-key-row">
                <input
                  v-model="steamApiKey"
                  type="password"
                  autocomplete="off"
                  spellcheck="false"
                  class="steam-key-input"
                  :placeholder="source.apiKeyConfigured ? 'Fallback key saved' : 'Optional Steam Web API key'"
                  @keydown.enter.prevent="saveSteamApiKey"
                />
                <n-button
                  secondary
                  strong
                  class="steam-key-save"
                  :disabled="!steamApiKey.trim()"
                  :loading="pendingAction === 'steam:connect'"
                  @click="saveSteamApiKey"
                >
                  <LucideIcon name="fa-save" :size="14" />
                  <span>Save</span>
                </n-button>
              </div>
            </details>
            <!-- Sync progress pipeline -->
            <div v-if="syncProgress[source.id]" class="sync-pipeline" :aria-label="'Syncing ' + source.name">
              <div
                v-for="step in syncProgress[source.id]"
                :key="step.id"
                class="sync-step"
                :class="'sync-step--' + step.state"
              >
                <span class="sync-step-dot">
                  <LucideIcon v-if="step.state === 'done'" name="fa-check" :size="10" />
                  <LucideIcon v-else-if="step.state === 'error'" name="fa-xmark" :size="10" />
                  <span v-else-if="step.state === 'active'" class="sync-step-spinner" />
                </span>
                <span class="sync-step-label">{{ step.label }}</span>
              </div>
            </div>

            <div class="source-actions-main">
              <!-- Store sources: show Connect or Disconnect depending on connection state -->
              <template v-if="source.id !== 'manual'">
                <n-button
                  v-if="!source.connected"
                  type="primary"
                  secondary
                  strong
                  class="source-connect"
                  :loading="pendingAction === source.id + ':connect'"
                  :aria-label="'Connect ' + source.name"
                  @click="connectSource(source.id)"
                >
                  <LucideIcon name="fa-plug" :size="15" />
                  <span>{{ source.id === 'playniteLegacy' ? 'Enable' : 'Connect' }}</span>
                </n-button>
                <n-button
                  v-else
                  type="error"
                  secondary
                  strong
                  class="source-connect"
                  :loading="pendingAction === source.id + ':disconnect'"
                  :aria-label="'Disconnect ' + source.name"
                  @click="disconnectSource(source.id)"
                >
                  <LucideIcon name="fa-link-slash" :size="15" />
                  <span>{{ source.id === 'playniteLegacy' ? 'Disable' : 'Disconnect' }}</span>
                </n-button>
              </template>
              <!-- Manual: open add game form -->
              <RouterLink v-else-if="source.id === 'manual'" to="/applications?add=1" custom v-slot="{ navigate, href }">
                <a :href="href" @click="navigate">
                  <n-button tag="span" type="primary" secondary strong class="source-connect">
                    <LucideIcon name="fa-plus" :size="15" />
                    <span>Add Game</span>
                  </n-button>
                </a>
              </RouterLink>
              <!-- Sync button: only when connected -->
              <n-button
                v-if="source.id !== 'manual' && source.id !== 'playniteLegacy' && source.connected"
                class="source-sync-btn"
                type="default"
                secondary
                strong
                :loading="pendingAction === source.id + ':sync'"
                :aria-label="'Sync ' + source.name"
                :title="'Sync ' + source.name"
                @click="syncSource(source.id)"
              >
                <LucideIcon name="fa-sync" :size="15" />
                <span>Sync</span>
              </n-button>
            </div>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { NAlert, NButton, NTag } from 'naive-ui';
import { storeToRefs } from 'pinia';
import LucideIcon from '@/components/LucideIcon.vue';
import { http } from '@/http';
import { useAppsStore } from '@/stores/apps';

type GameSourceContract = {
  id: string;
  name: string;
  kind?: string;
  connected?: boolean;
  connectionState?: string;
  syncState?: string;
  gamesCount?: number;
  playableGameCount?: number;
  ownedGameCount?: number;
  installedGameCount?: number;
  tokenEncrypted?: boolean;
  authAvailable?: boolean;
  statusMessage?: string;
  publicConfig?: Record<string, unknown>;
  disabled?: boolean;
};
type GameSourcesResponse = {
  status?: boolean;
  sources?: GameSourceContract[];
};
type GameSourceActionResponse = {
  status?: boolean;
  sourceId?: string;
  connectionState?: string;
  syncState?: string;
  action?: string;
  authUrl?: string | null;
  message?: string;
  error?: string;
  requirements?: string[];
  ownedGameCount?: number;
  installedGameCount?: number;
  playableGameCount?: number;
  importedGameCount?: number;
};
type ActionMessage = {
  type: 'success' | 'warning' | 'error' | 'info';
  text: string;
};

type SyncStep = {
  id: string;
  label: string;
  state: 'pending' | 'active' | 'done' | 'error';
};

const SYNC_STEPS: SyncStep[] = [
  { id: 'connect', label: 'Verifying connection', state: 'pending' },
  { id: 'fetch', label: 'Fetching owned library', state: 'pending' },
  { id: 'match', label: 'Matching installed games', state: 'pending' },
  { id: 'meta', label: 'Loading metadata & posters', state: 'pending' },
];

const appsStore = useAppsStore();
const { apps } = storeToRefs(appsStore);
const apiSources = ref<GameSourceContract[] | null>(null);
const pendingAction = ref<string | null>(null);
const actionMessage = ref<ActionMessage | null>(null);
const syncProgress = ref<Record<string, SyncStep[]>>({});
const steamApiKey = ref('');

onMounted(() => {
  void appsStore.loadApps(false);
  void loadGameSources();
});

async function loadGameSources() {
  try {
    const res = await http.get<GameSourcesResponse>('/api/game-sources', { validateStatus: () => true });
    if (res.status === 200 && res.data?.status && Array.isArray(res.data.sources)) {
      apiSources.value = res.data.sources;
    }
  } catch {
    apiSources.value = null;
  }
}

const hasManual = computed(() => apps.value.some((app) => !app['playnite-id']));
const hasPlaynite = computed(() => apps.value.some((app) => !!app['playnite-id']));

const fallbackSourceContracts = computed<GameSourceContract[]>(() => [
  { id: 'steam', name: 'Steam', connected: false, connectionState: 'requires_action', syncState: 'not_started' },
  { id: 'epic', name: 'Epic Games', connected: false, connectionState: 'requires_action', syncState: 'not_started' },
  { id: 'gog', name: 'GOG', connected: false, connectionState: 'requires_action', syncState: 'not_started' },
  { id: 'xbox', name: 'Xbox', connected: false, connectionState: 'requires_action', syncState: 'not_started' },
  { id: 'manual', name: 'Manual', connected: hasManual.value, connectionState: hasManual.value ? 'connected' : 'available', syncState: 'ready', ownedGameCount: apps.value.length, installedGameCount: apps.value.length, playableGameCount: apps.value.length },
]);

// Filter out the Playnite Legacy source — it is disabled; only show it if there are still
// Playnite-imported entries (so the user can purge them via the disconnect button).
const sources = computed(() =>
  (apiSources.value ?? fallbackSourceContracts.value)
    .filter((item) => {
      if (item.id === 'playniteLegacy') {
        // Show only when there are still Playnite-backed apps to allow the user to remove them.
        return hasPlaynite.value || (item.disabled !== true && item.connectionState !== 'disabled');
      }
      return true;
    })
    .map(source),
);

function source(item: GameSourceContract) {
  const connected = !!item.connected;
  const requiresAction = item.connectionState === 'requires_action';
  const disabled = item.connectionState === 'disabled' || item.disabled === true;
  return {
    id: item.id,
    name: item.name,
    connected,
    mark: sourceMark(item.id),
    logoUrl: sourceLogo(item.id),
    logoPosition: sourceBannerPosition(item.id),
    description: sourceDescription(item.id),
    ownedGameCount: item.ownedGameCount ?? item.gamesCount ?? 0,
    installedGameCount: item.installedGameCount ?? item.playableGameCount ?? 0,
    playableGameCount: item.playableGameCount ?? 0,
    apiKeyConfigured: item.publicConfig?.['apiKeyConfigured'] === true,
    statusLabel: disabled ? 'Disabled' : connected ? 'Connected' : requiresAction ? 'Setup needed' : item.id === 'manual' ? 'Available' : 'Not connected',
    statusType: connected ? ('success' as const) : requiresAction ? ('warning' as const) : item.id === 'manual' ? ('info' as const) : ('default' as const),
    security:
      item.id === 'manual'
        ? 'No account token required'
        : connected
          ? item.tokenEncrypted
            ? 'Account token is stored encrypted'
            : 'Connected token state requires encryption audit'
          : item.statusMessage ?? 'Provider account setup required before syncing owned games',
    sync: connected ? sourceSyncLabel(item) : 'Sync not started',
  };
}

async function connectSource(id: string) {
  await runSourceAction(id, 'connect');
}

async function saveSteamApiKey() {
  const apiKey = steamApiKey.value.trim();
  if (!apiKey) return;
  await runSourceAction('steam', 'connect', { apiKey });
  steamApiKey.value = '';
  await loadGameSources();
}

async function syncSource(id: string) {
  syncProgress.value[id] = SYNC_STEPS.map((s) => ({ ...s, state: 'pending' as const }));
  const steps = syncProgress.value[id];
  const advance = (stepId: string, state: SyncStep['state']) => {
    const s = steps.find((x) => x.id === stepId);
    if (s) s.state = state;
  };
  advance('connect', 'active');
  await new Promise((r) => setTimeout(r, 300));
  advance('connect', 'done');
  advance('fetch', 'active');
  if (id === 'steam') {
    const captured = await captureSteamWebLibrary();
    if (captured) {
      advance('fetch', 'done');
      advance('match', 'done');
      advance('meta', 'active');
      await new Promise((r) => setTimeout(r, 250));
      advance('meta', 'done');
      await loadGameSources();
      await appsStore.loadApps(false);
      await new Promise((r) => setTimeout(r, 800));
      delete syncProgress.value[id];
      return;
    }
    // Web library fetch failed (CORS restriction or user not logged into Steam in this browser).
    // Mark the step as errored and warn the user, then fall through to the local installed-games
    // detection path which does not require the Steam web session.
    advance('fetch', 'error');
    actionMessage.value = {
      type: 'warning',
      text: 'Could not fetch your Steam owned library from the web — ensure you are logged into Steam in this browser. Falling back to local installed game detection.',
    };
  }
  await new Promise((r) => setTimeout(r, 400));
  advance('fetch', 'done');
  advance('match', 'active');
  await runSourceAction(id, 'sync');
  advance('match', 'done');
  advance('meta', 'active');
  await new Promise((r) => setTimeout(r, 250));
  advance('meta', 'done');
  await new Promise((r) => setTimeout(r, 800));
  delete syncProgress.value[id];
}

function steamAccountIdFromSteamId(steamId: unknown): string | null {
  if (typeof steamId !== 'string' || !/^\d+$/.test(steamId)) return null;
  try {
    return (BigInt(steamId) - 76561197960265728n).toString();
  } catch {
    return null;
  }
}

async function captureSteamWebLibrary(): Promise<boolean> {
  const steam = apiSources.value?.find((x) => x.id === 'steam');
  const accountId = steamAccountIdFromSteamId(steam?.publicConfig?.['steamId']);
  if (!accountId) return false;

  try {
    const url = new URL('https://store.steampowered.com/dynamicstore/userdata/');
    url.searchParams.set('id', accountId);
    url.searchParams.set('l', 'english');
    url.searchParams.set('origin', window.location.origin);
    url.searchParams.set('v', String(Date.now()));

    const steamRes = await fetch(url.toString(), {
      credentials: 'include',
      mode: 'cors',
      cache: 'no-store',
    });
    if (!steamRes.ok) return false;
    const data = await steamRes.json();
    const ownedAppIds = Array.isArray(data?.rgOwnedApps) ? data.rgOwnedApps : [];
    if (ownedAppIds.length === 0) return false;

    const importRes = await http.post<GameSourceActionResponse>(
      '/api/game-sources/steam/web-library',
      { ownedAppIds },
      { validateStatus: () => true },
    );
    if (importRes.status < 200 || importRes.status >= 300 || importRes.data?.status === false) {
      return false;
    }
    const count = importRes.data.ownedGameCount ?? ownedAppIds.length;
    actionMessage.value = {
      type: 'success',
      text: `Steam web library synced: ${count} owned, ${importRes.data.installedGameCount ?? 0} installed.`,
    };
    return true;
  } catch {
    // CORS failure or network error — show guidance to the user
    actionMessage.value = {
      type: 'info',
      text: 'To import your full Steam library, open store.steampowered.com in this browser, sign in, then click Sync again. Your profile can remain private.',
    };
    return false;
  }
}

async function disconnectSource(id: string) {
  await runSourceAction(id, 'disconnect');
  // After disabling Playnite, force-refresh the apps store so LibraryView's
  // fallback and any other consumer reflect the updated (filtered) list immediately.
  if (id === 'playniteLegacy') {
    await appsStore.loadApps(false);
  }
}

async function runSourceAction(id: string, action: 'connect' | 'sync' | 'disconnect', payload: Record<string, unknown> = {}) {
  pendingAction.value = `${id}:${action}`;
  actionMessage.value = null;
  try {
    const res = await http.post<GameSourceActionResponse>(
      `/api/game-sources/${encodeURIComponent(id)}/${action}`,
      payload,
      { validateStatus: () => true },
    );
    const body = res.data ?? {};
    if (res.status >= 200 && res.status < 300 && body.status !== false) {
      if (body.authUrl) {
        // Open auth popup — no noopener so postMessage can reach this window.
        const popup = window.open(body.authUrl, '_blank', 'width=980,height=760');
        if (popup) {
          // Primary signal: postMessage from the callback page.
          const onMessage = async (e: MessageEvent) => {
            if (e.data?.type === 'sunshine:source-connected') {
              window.removeEventListener('message', onMessage);
              clearInterval(pollTimer);
              await loadGameSources();
              if (e.data.sourceId) {
                await syncSource(e.data.sourceId);
              }
            }
          };
          window.addEventListener('message', onMessage);
          // Fallback: poll every 1.5 s. Refreshes server state each tick so the
          // UI updates as soon as the callback saves the connection even when COOP
          // or other browser policies prevent popup.closed from ever turning true.
          let pollCount = 0;
          const pollTimer = setInterval(async () => {
            pollCount++;
            await loadGameSources();
            if (popup.closed || pollCount > 80) {
              clearInterval(pollTimer);
              window.removeEventListener('message', onMessage);
              const s = apiSources.value?.find((x) => x.id === id);
              if (s?.connected && s.syncState === 'not_started') {
                await syncSource(id);
              }
            }
          }, 1500);
        }
      }
      const requirements = Array.isArray(body.requirements) && body.requirements.length
        ? ` Requirements: ${body.requirements.join(', ')}.`
        : '';
      actionMessage.value = {
        type: body.connectionState === 'requires_action' || body.syncState === 'requires_connection' ? 'warning' : 'success',
        text: `${body.message || 'Source action completed.'}${requirements}`,
      };
      await loadGameSources();
      return;
    }
    actionMessage.value = {
      type: 'error',
      text: body.error || `Source action failed (${res.status}).`,
    };
  } catch (error) {
    actionMessage.value = {
      type: 'error',
      text: error instanceof Error ? error.message : 'Source action failed.',
    };
  } finally {
    pendingAction.value = null;
  }
}

function sourceLogo(id: string): string | null {
  const base = import.meta.env.BASE_URL;
  const logos: Record<string, string> = {
    steam: `${base}images/platforms/steam.jpg`,
    epic: `${base}images/platforms/epic.jpg`,
    gog: `${base}images/platforms/gog.jpg`,
    xbox: `${base}images/platforms/xbox.jpg`,
    playniteLegacy: `${base}images/platforms/playnite.jpg`,
  };
  return logos[id] ?? null;
}

function sourceBannerPosition(id: string): string | null {
  const positions: Record<string, string> = {
    xbox: 'center 60%',
  };
  return positions[id] ?? null;
}

function sourceMark(id: string): string {
  const marks: Record<string, string> = {
    steam: 'ST',
    epic: 'EP',
    gog: 'GOG',
    xbox: 'XB',
    manual: '+',
    playniteLegacy: 'PL',
  };
  return marks[id] ?? id.slice(0, 2).toUpperCase();
}

function sourceDescription(id: string): string {
  const descriptions: Record<string, string> = {
    steam: 'Web login imports your Steam library, then local manifests mark installed titles.',
    epic: 'Connect Epic Games and detect installed launcher titles.',
    gog: 'Connect GOG/Galaxy ownership and local installs.',
    xbox: 'Connect Microsoft/Xbox libraries and PC Game Pass installs.',
    manual: 'Add a game by executable path when it is not tied to a connected store.',
    playniteLegacy: 'Import existing Playnite-backed entries as a compatibility path.',
  };
  return descriptions[id] ?? 'Connect and sync this source.';
}

function sourceSyncLabel(item: GameSourceContract): string {
  const count = item.playableGameCount ?? item.gamesCount ?? 0;
  if (count > 0) return `${count} playable game${count === 1 ? '' : 's'} detected`;
  return item.syncState === 'ready' ? 'Connected, no playable games detected' : 'Local entries found in current library';
}
</script>

<style scoped>
.source-card {
  display: flex;
  min-height: 25rem;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 0.45rem 1.4rem rgb(var(--color-dark) / 0.08);
  transition: box-shadow 160ms ease, transform 160ms ease;
}

.source-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 0.7rem 1.8rem rgb(var(--color-dark) / 0.12);
}

.source-banner {
  position: relative;
  height: 7.6rem;
  overflow: hidden;
  background:
    linear-gradient(145deg, rgb(var(--color-primary) / 0.12), transparent 62%),
    rgb(var(--color-dark) / 0.045);
}

.source-banner::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(180deg, transparent 30%, rgb(var(--color-dark) / 0.55) 100%),
    linear-gradient(145deg, rgb(var(--color-primary) / 0.08), transparent 60%);
  mix-blend-mode: multiply;
}

.source-banner-media {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--color-dark) / 0.78);
}

.source-banner-img {
  display: block;
  height: 100%;
  width: 100%;
  object-fit: cover;
  object-position: center;
  filter: saturate(0.85) brightness(0.95);
  transition: filter 200ms ease;
}

.source-card:hover .source-banner-img {
  filter: saturate(1) brightness(1);
}

.source-mark-text {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.source-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.source-actions {
  margin-top: auto;
  padding-top: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.steam-key-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.5rem;
}

.steam-fallback {
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-dark) / 0.08);
  background: rgb(var(--color-dark) / 0.025);
  padding: 0.55rem 0.65rem;
}

.steam-fallback summary {
  display: flex;
  cursor: pointer;
  list-style: none;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 650;
  color: rgb(var(--color-dark) / 0.68);
}

.steam-fallback summary::-webkit-details-marker {
  display: none;
}

.steam-fallback[open] summary {
  margin-bottom: 0.55rem;
}

.steam-key-input {
  min-width: 0;
  height: 2.35rem;
  border-radius: 0.45rem;
  border: 1px solid rgb(var(--color-dark) / 0.12);
  background: rgb(var(--color-light) / 0.72);
  padding: 0 0.7rem;
  font-size: 0.78rem;
  color: rgb(var(--color-dark) / 0.82);
  outline: none;
}

.steam-key-input:focus {
  border-color: rgb(var(--color-primary) / 0.55);
  box-shadow: 0 0 0 2px rgb(var(--color-primary) / 0.16);
}

.steam-key-save {
  min-width: 6.8rem;
}

.source-actions-main {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
  width: 100%;
}

.source-connect {
  flex: 1 1 0;
  min-width: 7.5rem;
  white-space: nowrap;
}

.source-sync-btn {
  flex: 0 0 6rem;
  min-width: 6rem;
}

/* Sync pipeline */
.sync-pipeline {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.6rem 0.75rem;
  background: rgb(var(--color-dark) / 0.035);
  border-radius: 0.5rem;
  border: 1px solid rgb(var(--color-dark) / 0.07);
}

.dark .sync-pipeline {
  background: rgb(var(--color-light) / 0.05);
  border-color: rgb(var(--color-light) / 0.08);
}

.sync-step {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.72rem;
  color: rgb(var(--color-dark) / 0.45);
  transition: color 180ms ease;
}

.dark .sync-step {
  color: rgb(var(--color-light) / 0.4);
}

.sync-step--active {
  color: rgb(var(--color-primary));
  font-weight: 600;
}

.sync-step--done {
  color: rgb(var(--color-dark) / 0.62);
}

.dark .sync-step--done {
  color: rgb(var(--color-light) / 0.58);
}

.sync-step--error {
  color: #ef4444;
}

.sync-step-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1.5px solid currentColor;
}

.sync-step--done .sync-step-dot {
  background: #22c55e;
  border-color: #22c55e;
  color: #fff;
}

.sync-step--error .sync-step-dot {
  background: #ef4444;
  border-color: #ef4444;
  color: #fff;
}

.sync-step-spinner {
  display: block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  border: 1.5px solid currentColor;
  border-top-color: transparent;
  animation: spin-step 0.7s linear infinite;
}

@keyframes spin-step {
  to { transform: rotate(360deg); }
}

.sync-step-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.source-stat {
  border-radius: 0.45rem;
  background: rgb(var(--color-dark) / 0.04);
  padding: 0.45rem 0.35rem;
}

.source-stat span,
.source-stat small {
  display: block;
}

.source-stat span {
  font-size: 0.9rem;
  font-weight: 700;
  color: rgb(var(--color-dark) / 0.82);
}

.source-stat small {
  margin-top: 0.1rem;
  font-size: 0.68rem;
  color: rgb(var(--color-dark) / 0.56);
}

.dark .source-stat {
  background: rgb(var(--color-light) / 0.06);
}

.dark .source-stat span {
  color: rgb(var(--color-light) / 0.82);
}

.dark .source-stat small {
  color: rgb(var(--color-light) / 0.56);
}

.dark .source-card {
  box-shadow: 0 0.55rem 1.5rem rgb(0 0 0 / 0.26);
}

.dark .steam-key-input {
  border-color: rgb(var(--color-light) / 0.12);
  background: rgb(var(--color-light) / 0.06);
  color: rgb(var(--color-light) / 0.88);
}

.dark .steam-fallback {
  border-color: rgb(var(--color-light) / 0.08);
  background: rgb(var(--color-light) / 0.04);
}

.dark .steam-fallback summary {
  color: rgb(var(--color-light) / 0.66);
}

.dark .source-card:hover {
  box-shadow: 0 0.8rem 2rem rgb(0 0 0 / 0.34);
}

.dark .source-banner {
  background:
    linear-gradient(145deg, rgb(var(--color-primary) / 0.14), transparent 62%),
    rgb(var(--color-light) / 0.05);
}

.dark .source-banner::after {
  background:
    linear-gradient(180deg, transparent 25%, rgb(0 0 0 / 0.6) 100%),
    linear-gradient(145deg, rgb(var(--color-primary) / 0.1), transparent 60%);
}

.dark .source-banner-media {
  color: rgb(var(--color-light) / 0.78);
}
</style>
