<template>
  <div class="home-page mx-auto max-w-6xl space-y-6">
    <section class="page-surface p-5 md:p-6">
      <div class="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
        <div class="min-w-0 space-y-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-primary">Jujo.Stream Server</p>
          <h1 class="text-2xl font-semibold tracking-tight md:text-3xl">
            {{ setupComplete ? 'Server ready' : 'Finish setup when you are ready' }}
          </h1>
          <p class="max-w-2xl text-sm leading-6 text-dark/70 dark:text-light/70">
            {{
              setupComplete
                ? 'Your server has the essentials needed to start streaming.'
                : 'Pair a device, connect a game library, verify the host, and start from the library. You can skip any step and return later.'
            }}
          </p>
        </div>
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="metric-tile">
            <span class="metric-value">{{ pairedClientCount }}</span>
            <span class="metric-label">Clients</span>
          </div>
          <div class="metric-tile">
            <span class="metric-value">{{ connectedSourceCount }}</span>
            <span class="metric-label">Sources</span>
          </div>
          <div class="metric-tile">
            <span class="metric-value">{{ playableGameCount }}</span>
            <span class="metric-label">Games</span>
          </div>
        </div>
      </div>
    </section>

    <section v-if="!setupComplete" class="grid gap-4 lg:grid-cols-2">
      <article
        v-for="item in setupSteps"
        :key="item.id"
        class="page-surface setup-step p-4"
      >
        <div class="flex items-start gap-4">
          <span :class="['status-icon', statusClass(item.status)]">
            <LucideIcon :name="statusIcon(item.status)" :size="18" />
          </span>
          <div class="min-w-0 flex-1 space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-base font-semibold">{{ item.title }}</h2>
              <n-tag :type="tagType(item.status)" :bordered="false" size="small">
                {{ statusLabel(item.status) }}
              </n-tag>
            </div>
            <p class="text-sm leading-6 text-dark/70 dark:text-light/70">{{ item.description }}</p>
            <RouterLink :to="item.path" custom v-slot="{ navigate, href }">
              <a :href="href" @click="navigate">
                <n-button tag="span" type="primary" secondary strong>
                  <LucideIcon :name="item.icon" :size="16" />
                  <span>{{ item.action }}</span>
                </n-button>
              </a>
            </RouterLink>
          </div>
        </div>
      </article>
    </section>

    <section v-else class="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <div class="page-surface p-5">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold">Ready to stream</h2>
            <p class="text-sm text-dark/65 dark:text-light/65">Launch from your playable library.</p>
          </div>
          <RouterLink to="/library" custom v-slot="{ navigate, href }">
            <a :href="href" @click="navigate">
              <n-button tag="span" type="primary" strong>
                <LucideIcon name="fa-play" :size="16" />
                <span>Open Library</span>
              </n-button>
            </a>
          </RouterLink>
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <div v-for="(app, index) in featuredApps" :key="appKey(app, index)" class="library-shortcut">
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold">{{ app.name || 'Untitled game' }}</p>
              <p class="truncate text-xs text-dark/60 dark:text-light/60">
                {{ app['working-dir'] || 'Ready from local library' }}
              </p>
            </div>
            <LucideIcon name="fa-chevron-right" :size="16" class="text-dark/40 dark:text-light/40" />
          </div>
        </div>
      </div>

      <div class="page-surface p-5">
        <h2 class="mb-4 text-lg font-semibold">Readiness</h2>
        <div class="space-y-3">
          <div v-for="check in readinessChecks" :key="check.id" class="readiness-row">
            <LucideIcon :name="statusIcon(check.status)" :size="16" :class="statusTextClass(check.status)" />
            <span class="min-w-0 flex-1 text-sm">{{ check.label }}</span>
            <n-tag :type="tagType(check.status)" :bordered="false" size="small">
              {{ statusLabel(check.status) }}
            </n-tag>
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-4 lg:grid-cols-3">
      <RouterLink to="/game-sources" class="quick-card">
        <LucideIcon name="fa-plug" :size="20" />
        <span>Game Sources</span>
      </RouterLink>
      <RouterLink to="/system" class="quick-card">
        <LucideIcon name="fa-stethoscope" :size="20" />
        <span>System Readiness</span>
      </RouterLink>
      <RouterLink to="/pairing" class="quick-card">
        <LucideIcon name="fa-link" :size="20" />
        <span>Pairing</span>
      </RouterLink>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { NButton, NTag } from 'naive-ui';
import { storeToRefs } from 'pinia';
import LucideIcon from '@/components/LucideIcon.vue';
import { http } from '@/http';
import { useAppsStore, type App } from '@/stores/apps';
import { useAuthStore } from '@/stores/auth';

type SetupStatus = 'ready' | 'warning' | 'pending';
type SetupStep = {
  id: string;
  title: string;
  description: string;
  action: string;
  path: string;
  icon: string;
  status: SetupStatus;
};
type ReadinessCheck = {
  id: string;
  label: string;
  status: SetupStatus;
};
type SetupStatusResponse = {
  status?: boolean;
  setupComplete?: boolean;
  pairedClientCount?: number;
  connectedSourceCount?: number;
  playableGameCount?: number;
  steps?: SetupStep[];
  readiness?: {
    checks?: ReadinessCheck[];
  };
};

const appsStore = useAppsStore();
const authStore = useAuthStore();
const { apps } = storeToRefs(appsStore);
const { sessions } = storeToRefs(authStore);
const setupStatus = ref<SetupStatusResponse | null>(null);

onMounted(() => {
  void appsStore.loadApps(false);
  void authStore.fetchSessions();
  void loadSetupStatus();
});

async function loadSetupStatus() {
  try {
    const res = await http.get<SetupStatusResponse>('/api/setup/status', { validateStatus: () => true });
    if (res.status === 200 && res.data?.status) {
      setupStatus.value = res.data;
    }
  } catch {
    setupStatus.value = null;
  }
}

const fallbackPairedClientCount = computed(() => sessions.value.length);
const fallbackConnectedSourceCount = computed(() => {
  const sources = new Set<string>();
  for (const app of apps.value) {
    if (app['playnite-id']) sources.add('playniteLegacy');
    else sources.add('manual');
  }
  return sources.size;
});
const fallbackPlayableGameCount = computed(() => apps.value.length);

const pairedClientCount = computed(() => setupStatus.value?.pairedClientCount ?? fallbackPairedClientCount.value);
const connectedSourceCount = computed(() => setupStatus.value?.connectedSourceCount ?? fallbackConnectedSourceCount.value);
const playableGameCount = computed(() => setupStatus.value?.playableGameCount ?? fallbackPlayableGameCount.value);
const setupComplete = computed(
  () =>
    setupStatus.value?.setupComplete ??
    (pairedClientCount.value > 0 &&
      connectedSourceCount.value > 0 &&
      playableGameCount.value > 0),
);

const fallbackReadinessChecks = computed<ReadinessCheck[]>(() => [
  {
    id: 'client',
    label: 'Client paired',
    status: pairedClientCount.value > 0 ? 'ready' : 'pending',
  },
  {
    id: 'game',
    label: 'Playable game available',
    status: playableGameCount.value > 0 ? 'ready' : 'pending',
  },
  { id: 'encoder', label: 'Encoder ready', status: 'warning' },
  { id: 'capture', label: 'Display capture ready', status: 'warning' },
  { id: 'network', label: 'Network reachable', status: 'warning' },
] satisfies ReadinessCheck[]);

const readinessChecks = computed(() => setupStatus.value?.readiness?.checks ?? fallbackReadinessChecks.value);

const fallbackSetupSteps = computed<SetupStep[]>(() => [
  {
    id: 'pair',
    title: 'Pair a device',
    description: 'Connect a Jujo or Moonlight-compatible client to this host.',
    action: 'Open Pairing',
    path: '/pairing',
    icon: 'fa-link',
    status: pairedClientCount.value > 0 ? 'ready' : 'pending',
  },
  {
    id: 'sources',
    title: 'Connect a library',
    description: 'Sign in to Steam, Epic Games, GOG, or Xbox, or add games manually.',
    action: 'Open Game Sources',
    path: '/game-sources',
    icon: 'fa-plug',
    status: connectedSourceCount.value > 0 ? 'ready' : 'pending',
  },
  {
    id: 'readiness',
    title: 'Verify readiness',
    description: 'Review encoder, display capture, network, and Windows-specific checks.',
    action: 'Open System',
    path: '/system',
    icon: 'fa-stethoscope',
    status: setupComplete.value ? 'ready' : 'warning',
  },
  {
    id: 'play',
    title: 'Start streaming',
    description: 'Open the library when at least one game is playable.',
    action: 'Open Library',
    path: '/library',
    icon: 'fa-play',
    status: playableGameCount.value > 0 ? 'ready' : 'pending',
  },
] satisfies SetupStep[]);

const setupSteps = computed(() => setupStatus.value?.steps ?? fallbackSetupSteps.value);

const featuredApps = computed<App[]>(() => apps.value.slice(0, 4));

function appKey(app: App, index: number): string {
  return app.uuid || app.name || `app-${index}`;
}

function statusIcon(status: SetupStatus): string {
  if (status === 'ready') return 'fa-check-circle';
  if (status === 'warning') return 'fa-exclamation-triangle';
  return 'fa-circle-info';
}

function statusLabel(status: SetupStatus): string {
  if (status === 'ready') return 'Ready';
  if (status === 'warning') return 'Review';
  return 'Not set';
}

function tagType(status: SetupStatus): 'success' | 'warning' | 'info' {
  if (status === 'ready') return 'success';
  if (status === 'warning') return 'warning';
  return 'info';
}

function statusClass(status: SetupStatus): string {
  if (status === 'ready') return 'bg-success/12 text-success';
  if (status === 'warning') return 'bg-warning/14 text-warning';
  return 'bg-primary/10 text-primary';
}

function statusTextClass(status: SetupStatus): string {
  if (status === 'ready') return 'text-success';
  if (status === 'warning') return 'text-warning';
  return 'text-primary';
}
</script>

<style scoped>
.metric-tile,
.library-shortcut,
.quick-card {
  border: 1px solid rgb(var(--color-dark) / 0.08);
  background: rgb(var(--color-light) / 0.48);
}

.dark .metric-tile,
.dark .library-shortcut,
.dark .quick-card {
  border-color: rgb(var(--color-light) / 0.1);
  background: rgb(var(--color-dark) / 0.24);
}

.metric-tile {
  display: flex;
  min-width: 5rem;
  flex-direction: column;
  gap: 0.1rem;
  border-radius: 0.5rem;
  padding: 0.75rem 0.9rem;
}

.metric-value {
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1;
}

.metric-label {
  font-size: 0.72rem;
  color: rgb(var(--color-dark) / 0.62);
}

.dark .metric-label {
  color: rgb(var(--color-light) / 0.62);
}

.setup-step,
.library-shortcut,
.readiness-row,
.quick-card {
  transition:
    border-color 150ms ease,
    background-color 150ms ease,
    transform 150ms ease;
}

.setup-step:hover,
.library-shortcut:hover,
.quick-card:hover {
  border-color: rgb(var(--color-primary) / 0.26);
}

.status-icon {
  display: inline-flex;
  height: 2.5rem;
  width: 2.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
}

.library-shortcut,
.readiness-row,
.quick-card {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.75rem;
  border-radius: 0.5rem;
  padding: 0.85rem 0.95rem;
}

.quick-card {
  color: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
}
</style>
