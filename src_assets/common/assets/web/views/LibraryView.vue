<template>
  <div class="mx-auto max-w-7xl space-y-5">
    <section class="page-surface p-5 md:p-6">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-2xl space-y-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-primary">Library</p>
          <h1 class="text-2xl font-semibold tracking-tight">Your game library</h1>
          <p class="text-sm leading-6 text-dark/68 dark:text-light/68">
            Owned, installed, and stream-ready games from connected platforms. Store connectors will
            enrich this view with posters and metadata as each provider is enabled.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[28rem]">
          <div class="library-metric">
            <span>{{ summary.ownedGameCount }}</span>
            <small>Owned</small>
          </div>
          <div class="library-metric">
            <span>{{ summary.installedGameCount }}</span>
            <small>Installed</small>
          </div>
          <div class="library-metric">
            <span>{{ summary.playableGameCount }}</span>
            <small>Playable</small>
          </div>
          <div class="library-metric">
            <span>{{ summary.posterAvailableCount }}</span>
            <small>Posters</small>
          </div>
        </div>
      </div>
    </section>

    <n-alert v-if="metadataNotice" type="info" :bordered="false">
      {{ metadataNotice }}
    </n-alert>

    <n-alert v-if="prefetchActive" type="info" :bordered="false">
      Downloading posters &amp; metadata in background — {{ prefetchDone }}/{{ prefetchTotal }} done. The library updates automatically.
    </n-alert>

    <n-alert v-if="actionMessage" :type="actionMessage.type" :bordered="false" closable @close="actionMessage = null">
      {{ actionMessage.text }}
    </n-alert>

    <section class="page-surface p-4">
      <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div class="relative w-full xl:max-w-sm">
          <LucideIcon
            name="fa-search"
            :size="15"
            class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-45"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by title, source, or developer..."
            class="h-10 w-full rounded-lg border border-dark/12 bg-transparent pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary/60 dark:border-light/14 dark:focus:border-primary/60"
          />
        </div>

        <div class="filter-bar">
          <button
            v-for="filter in sourceFilters"
            :key="filter.id"
            type="button"
            class="filter-chip"
            :class="{ active: sourceFilter === filter.id }"
            @click="sourceFilter = filter.id"
          >
            {{ filter.label }}
          </button>

          <span class="filter-bar-sep" aria-hidden="true" />

          <button
            v-for="filter in installFilters"
            :key="filter.id"
            type="button"
            class="filter-chip"
            :class="{ active: installFilter === filter.id }"
            @click="installFilter = filter.id"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>
    </section>

    <section v-if="filteredGames.length" class="library-grid">
      <article v-for="game in filteredGames" :key="game.id" class="game-card page-surface">
        <div class="game-poster">
          <img
            v-if="posterUrl(game)"
            :src="posterUrl(game) || ''"
            :alt="game.title"
            loading="lazy"
            class="game-poster-img"
            @error="onCoverError(game)"
          />
          <div v-else class="game-poster-empty">
            <LucideIcon name="fa-gamepad" :size="32" />
          </div>
          <div class="poster-topline">
            <span class="source-badge">{{ game.sourceName }}</span>
            <n-tag :type="game.playable ? 'success' : 'warning'" :bordered="false" size="small">
              {{ game.playable ? 'Ready' : 'Not installed' }}
            </n-tag>
          </div>
        </div>

        <div class="flex min-h-0 flex-1 flex-col gap-3 p-4">
          <div class="min-w-0 space-y-1">
            <h2 class="truncate text-sm font-semibold leading-snug">{{ game.title }}</h2>
            <p class="line-clamp-2 text-xs leading-5 text-dark/62 dark:text-light/62">
              {{ gameSubtitle(game) }}
            </p>
          </div>

          <div class="mt-auto flex items-center justify-between gap-2">
            <span class="text-xs text-dark/55 dark:text-light/55">{{ game.installState === 'installed' ? 'Local install detected' : 'Owned library item' }}</span>
            <n-button
              size="small"
              type="primary"
              secondary
              strong
              :disabled="!canRunOrAdd(game)"
              :loading="pendingLaunch === (game.uuid || game.id)"
              @click="launchGame(game)"
            >
              <LucideIcon :name="game.uuid ? 'fa-play' : 'fa-plus'" :size="13" />
              <span>{{ game.uuid ? 'Play' : 'Add' }}</span>
            </n-button>
          </div>
        </div>
      </article>
    </section>

    <section v-else-if="games.length" class="page-surface p-10 text-center">
      <div class="mx-auto flex max-w-sm flex-col items-center gap-3">
        <div class="empty-icon">
          <LucideIcon name="fa-search" :size="24" />
        </div>
        <div class="space-y-1">
          <h2 class="text-base font-semibold">No matching games</h2>
          <p class="text-sm text-dark/62 dark:text-light/62">Adjust filters or clear your search.</p>
        </div>
        <n-button size="small" secondary strong @click="clearFilters">Clear filters</n-button>
      </div>
    </section>

    <section v-else class="page-surface p-10 text-center">
      <div class="mx-auto flex max-w-md flex-col items-center gap-4">
        <div class="empty-icon">
          <LucideIcon name="fa-plug" :size="28" />
        </div>
        <div class="space-y-2">
          <h2 class="text-lg font-semibold">No library items yet</h2>
          <p class="text-sm leading-6 text-dark/65 dark:text-light/65">
            Connect Steam, Epic, GOG, Xbox, or add a manual game. Library items can be synced now
            and enriched with metadata once providers are configured.
          </p>
        </div>
        <RouterLink to="/game-sources" custom v-slot="{ navigate, href }">
          <a :href="href" @click="navigate">
            <n-button tag="span" type="primary" strong>
              <LucideIcon name="fa-plug" :size="16" />
              <span>Connect a library</span>
            </n-button>
          </a>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { NAlert, NButton, NTag } from 'naive-ui';
import { storeToRefs } from 'pinia';
import LucideIcon from '@/components/LucideIcon.vue';
import { http } from '@/http';
import { useAppsStore, type App } from '@/stores/apps';

type LibraryGame = {
  id: string;
  uuid?: string | null;
  providerGameId?: string;
  sourceId: string;
  sourceName: string;
  title: string;
  owned: boolean;
  installed: boolean;
  playable: boolean;
  installState: 'installed' | 'not_installed' | string;
  installPath?: string;
  executablePath?: string;
  posterUrl?: string;
  posterState?: string;
  metadataState?: string;
  metadata?: {
    description?: string;
    developer?: string;
    publisher?: string;
    releaseDate?: string;
    genres?: string[];
  };
};

type LibrarySummary = {
  ownedGameCount: number;
  installedGameCount: number;
  playableGameCount: number;
  posterAvailableCount: number;
  metadataAvailableCount: number;
};

type LibraryResponse = {
  status?: boolean;
  games?: LibraryGame[];
  summary?: Partial<LibrarySummary>;
  metadata?: {
    status?: string;
    message?: string;
  };
};

type ActionMessage = {
  type: 'success' | 'warning' | 'error' | 'info';
  text: string;
};

const appsStore = useAppsStore();
const { apps } = storeToRefs(appsStore);

const apiGames = ref<LibraryGame[] | null>(null);
const apiSummary = ref<Partial<LibrarySummary> | null>(null);
const metadataNotice = ref<string | null>(null);
const searchQuery = ref('');
const sourceFilter = ref('all');
const installFilter = ref('all');
const coverErrors = ref(new Set<string>());
const pendingLaunch = ref<string | null>(null);
const actionMessage = ref<ActionMessage | null>(null);

// Prefetch progress
const prefetchActive = ref(false);
const prefetchDone = ref(0);
const prefetchTotal = ref(0);
let prefetchPollTimer: ReturnType<typeof setInterval> | null = null;
let lastPrefetchDone = -1;

async function pollPrefetchProgress() {
  try {
    const res = await http.get<{ status: boolean; active: boolean; done: number; total: number }>(
      '/api/library/steam/prefetch-progress',
      { validateStatus: () => true },
    );
    if (res.status === 200 && res.data?.status) {
      prefetchActive.value = res.data.active;
      prefetchDone.value = res.data.done;
      prefetchTotal.value = res.data.total;
      // Refresh library when new items finish (new titles/posters available)
      if (res.data.done > lastPrefetchDone && lastPrefetchDone >= 0) {
        void loadLibrary();
      }
      lastPrefetchDone = res.data.done;
      if (!res.data.active) {
        stopPrefetchPoll();
      }
    }
  } catch {
    // ignore transient errors
  }
}

function startPrefetchPoll() {
  if (prefetchPollTimer !== null) return;
  prefetchPollTimer = setInterval(() => {
    void pollPrefetchProgress();
  }, 5000);
  void pollPrefetchProgress();
}

function stopPrefetchPoll() {
  if (prefetchPollTimer !== null) {
    clearInterval(prefetchPollTimer);
    prefetchPollTimer = null;
  }
}

const installFilters = [
  { id: 'all', label: 'All' },
  { id: 'installed', label: 'Installed' },
  { id: 'not_installed', label: 'Not installed' },
];

onMounted(() => {
  void appsStore.loadApps(false);
  void loadLibrary();
  startPrefetchPoll();
});

onUnmounted(() => {
  stopPrefetchPoll();
});

// Re-fetch the library from the API whenever the apps store is refreshed
// (e.g. after Playnite is disabled), so the view reflects the latest state
// without requiring a full page navigation.
watch(
  () => apps.value.length,
  () => {
    void loadLibrary();
  },
);

async function loadLibrary() {
  try {
    const res = await http.get<LibraryResponse>('/api/library/games', { validateStatus: () => true });
    if (res.status === 200 && res.data?.status && Array.isArray(res.data.games)) {
      apiGames.value = res.data.games;
      apiSummary.value = res.data.summary ?? null;
      metadataNotice.value = res.data.metadata?.status === 'pending_configuration'
        ? res.data.metadata.message ?? 'Metadata providers are not configured yet.'
        : null;
      return;
    }
  } catch {
    // Fallback keeps this route usable against older server builds.
  }
  apiGames.value = null;
  apiSummary.value = null;
  metadataNotice.value = null;
}

const fallbackGames = computed<LibraryGame[]>(() =>
  // Only show apps that have a meaningful name or command — skip bare/unnamed entries
  apps.value
    .filter((app) => {
      const name = app.name?.trim();
      const cmd = Array.isArray(app.cmd) ? app.cmd.join('') : (app.cmd ?? '');
      return !!(name || cmd.trim());
    })
    .map((app, index) => appToLibraryGame(app, index)),
);
const games = computed(() => apiGames.value ?? fallbackGames.value);

const summary = computed<LibrarySummary>(() => {
  if (apiSummary.value) {
    return {
      ownedGameCount: apiSummary.value.ownedGameCount ?? games.value.length,
      installedGameCount: apiSummary.value.installedGameCount ?? games.value.filter((game) => game.installed).length,
      playableGameCount: apiSummary.value.playableGameCount ?? games.value.filter((game) => game.playable).length,
      posterAvailableCount: apiSummary.value.posterAvailableCount ?? games.value.filter((game) => !!game.posterUrl).length,
      metadataAvailableCount: apiSummary.value.metadataAvailableCount ?? games.value.filter((game) => game.metadataState === 'available').length,
    };
  }
  return {
    ownedGameCount: games.value.length,
    installedGameCount: games.value.filter((game) => game.installed).length,
    playableGameCount: games.value.filter((game) => game.playable).length,
    posterAvailableCount: games.value.filter((game) => !!game.posterUrl).length,
    metadataAvailableCount: games.value.filter((game) => game.metadataState === 'available').length,
  };
});

const sourceFilters = computed(() => {
  const seen = new Map<string, string>();
  for (const game of games.value) {
    seen.set(game.sourceId, game.sourceName);
  }
  return [
    { id: 'all', label: 'All sources' },
    ...Array.from(seen.entries()).map(([id, label]) => ({ id, label })),
  ];
});

const filteredGames = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return games.value.filter((game) => {
    if (sourceFilter.value !== 'all' && game.sourceId !== sourceFilter.value) return false;
    if (installFilter.value === 'installed' && !game.installed) return false;
    if (installFilter.value === 'not_installed' && game.installed) return false;
    if (!q) return true;
    return [
      game.title,
      game.sourceName,
      game.metadata?.developer,
      game.metadata?.publisher,
      game.metadata?.description,
    ].some((value) => String(value || '').toLowerCase().includes(q));
  });
});

function appToLibraryGame(app: App, index: number): LibraryGame {
  const uuid = app.uuid ?? null;
  const sourceId = app['playnite-id'] ? 'playniteLegacy' : 'manual';
  const playable = !!(app.name || app.cmd || app['playnite-id']);
  const game: LibraryGame = {
    id: uuid || app['playnite-id'] || `local:${index}`,
    uuid,
    sourceId,
    sourceName: sourceId === 'playniteLegacy' ? 'Playnite Legacy' : 'Manual',
    title: app.name || 'Untitled game',
    owned: true,
    installed: playable,
    playable,
    installState: playable ? 'installed' : 'not_installed',
    posterState: uuid && (app['image-path'] || app['playnite-id']) ? 'available' : 'missing',
    metadataState: 'partial',
    metadata: {},
  };
  if (app['working-dir']) {
    game.installPath = app['working-dir'];
  }
  if (typeof app.cmd === 'string' && app.cmd.length > 0) {
    game.executablePath = app.cmd;
  }
  if (uuid && (app['image-path'] || app['playnite-id'])) {
    game.posterUrl = `/api/apps/${encodeURIComponent(uuid)}/cover`;
  }
  return game;
}

function posterUrl(game: LibraryGame): string | undefined {
  if (!game.posterUrl || coverErrors.value.has(game.id)) return undefined;
  return game.posterUrl;
}

function onCoverError(game: LibraryGame) {
  coverErrors.value.add(game.id);
}

function gameSubtitle(game: LibraryGame): string {
  const description = game.metadata?.description?.trim();
  if (description) return description;
  const developer = game.metadata?.developer?.trim();
  if (developer) return developer;
  if (game.installPath) return game.installPath;
  return game.installed ? 'Ready from local configuration' : 'Available after install detection';
}

async function launchGame(game: LibraryGame) {
  if (!game.uuid) {
    await addProviderGame(game);
    return;
  }
  if (!game.playable) return;
  pendingLaunch.value = game.uuid;
  actionMessage.value = null;
  const result = await appsStore.launchApp(game.uuid);
  pendingLaunch.value = null;
  actionMessage.value = result.ok
    ? { type: 'success', text: `Starting ${game.title}.` }
    : { type: 'error', text: result.error || `Could not start ${game.title}.` };
}

function canRunOrAdd(game: LibraryGame): boolean {
  if (game.uuid) return game.playable;
  return (game.sourceId === 'steam' || game.sourceId === 'epic') && game.installed && !!game.providerGameId;
}

async function addProviderGame(game: LibraryGame) {
  if ((game.sourceId !== 'steam' && game.sourceId !== 'epic') || !game.providerGameId) return;
  const command = game.sourceId === 'steam'
    ? `cmd /c start "" "steam://rungameid/${game.providerGameId}"`
    : `cmd /c start "" "com.epicgames.launcher://apps/${game.providerGameId}?action=launch&silent=true"`;
  pendingLaunch.value = game.id;
  actionMessage.value = null;
  try {
    const response = await http.post<{ status?: boolean; error?: string }>(
      '/api/apps',
      {
        index: -1,
        name: game.title,
        cmd: command,
        'working-dir': game.installPath || '',
        'source-id': game.sourceId,
        'provider-game-id': game.providerGameId,
        'auto-detach': true,
      },
      { validateStatus: () => true },
    );
    if (response.status === 200 && response.data?.status) {
      actionMessage.value = { type: 'success', text: `${game.title} was added to the server library.` };
      await appsStore.loadApps(true);
      await loadLibrary();
      return;
    }
    actionMessage.value = {
      type: 'error',
      text: response.data?.error || `Could not add ${game.title}.`,
    };
  } catch (error) {
    actionMessage.value = {
      type: 'error',
      text: error instanceof Error ? error.message : `Could not add ${game.title}.`,
    };
  } finally {
    pendingLaunch.value = null;
  }
}

function clearFilters() {
  searchQuery.value = '';
  sourceFilter.value = 'all';
  installFilter.value = 'all';
}
</script>

<style scoped>
.library-metric {
  border-radius: 0.55rem;
  background: rgb(var(--color-dark) / 0.045);
  padding: 0.65rem 0.75rem;
}

.library-metric span,
.library-metric small {
  display: block;
}

.library-metric span {
  font-size: 1.05rem;
  font-weight: 750;
  color: rgb(var(--color-dark) / 0.86);
}

.library-metric small {
  margin-top: 0.1rem;
  font-size: 0.72rem;
  color: rgb(var(--color-dark) / 0.58);
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem;
}

.filter-bar-sep {
  display: block;
  width: 1px;
  height: 1.25rem;
  border-radius: 9999px;
  background: rgb(var(--color-dark) / 0.14);
  flex-shrink: 0;
  margin: 0 0.125rem;
}

.dark .filter-bar-sep {
  background: rgb(var(--color-light) / 0.14);
}

.filter-chip {
  height: 2.125rem;
  border: 1px solid rgb(var(--color-dark) / 0.1);
  border-radius: 0.55rem;
  background: transparent;
  padding: 0 0.75rem;
  font-size: 0.78rem;
  font-weight: 650;
  white-space: nowrap;
  color: rgb(var(--color-dark) / 0.66);
  transition: border-color 140ms ease, background-color 140ms ease, color 140ms ease;
}

.filter-chip:hover,
.filter-chip.active {
  border-color: rgb(var(--color-primary) / 0.35);
  background: rgb(var(--color-primary) / 0.1);
  color: rgb(var(--color-primary));
}

.library-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(13.5rem, 1fr));
  gap: 1rem;
}

.game-card {
  display: flex;
  min-height: 20rem;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 150ms ease-out, transform 150ms ease-out;
}

.game-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 0.45rem 1.5rem rgb(var(--color-dark) / 0.1);
}

.game-poster {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background:
    linear-gradient(145deg, rgb(var(--color-primary) / 0.12), transparent 58%),
    rgb(var(--color-dark) / 0.045);
}

.game-poster-img {
  display: block;
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.game-poster-empty {
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  color: rgb(var(--color-primary));
}

.poster-topline {
  position: absolute;
  left: 0.5rem;
  right: 0.5rem;
  top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.source-badge {
  max-width: 8.5rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgb(var(--color-dark) / 0.62);
  color: rgb(var(--color-light) / 0.94);
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  backdrop-filter: blur(6px);
}

.empty-icon {
  display: inline-flex;
  height: 3.5rem;
  width: 3.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.875rem;
  background: rgb(var(--color-primary) / 0.1);
  color: rgb(var(--color-primary));
}

.dark .library-metric,
.dark .game-poster {
  background:
    linear-gradient(145deg, rgb(var(--color-primary) / 0.14), transparent 58%),
    rgb(var(--color-light) / 0.055);
}

.dark .library-metric span {
  color: rgb(var(--color-light) / 0.86);
}

.dark .library-metric small {
  color: rgb(var(--color-light) / 0.58);
}

.dark .filter-chip {
  border-color: rgb(var(--color-light) / 0.12);
  color: rgb(var(--color-light) / 0.66);
}

.dark .game-card:hover {
  box-shadow: 0 0.45rem 1.5rem rgb(0 0 0 / 0.28);
}
</style>
