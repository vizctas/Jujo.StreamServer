<template>
  <div class="max-w-5xl mx-auto px-4 py-6 space-y-4 sm:px-6 sm:py-8 sm:space-y-5">
    <div
      class="flex flex-col gap-3 rounded-2xl border border-dark/10 bg-white/75 p-4 shadow-sm backdrop-blur dark:border-light/10 dark:bg-surface/70 sm:flex-row sm:items-center sm:justify-between sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none"
    >
      <div class="min-w-0 space-y-1">
        <h2 class="text-base font-semibold text-dark dark:text-light">
          Applications
        </h2>
        <p class="text-xs leading-relaxed opacity-65 sm:hidden">
          Add manual apps or connect Playnite to keep your library ready for streaming.
        </p>
      </div>

      <div class="flex items-center gap-2 sm:flex-wrap sm:justify-end sm:gap-4">
        <!-- Desktop: all actions visible -->
        <template v-if="isWindows" class="hidden sm:contents">
          <n-button
            v-if="playniteEnabled"
            size="medium"
            type="default"
            strong
            class="hidden sm:inline-flex h-10 rounded-md px-3"
            :loading="syncBusy"
            :disabled="syncBusy"
            @click="forceSync"
            aria-label="Force sync now"
          >
            <svg class="mr-2 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M21 12a9 9 0 11-3.2-6.6M21 3v6h-6" />
            </svg>
            {{ $t('playnite.force_sync') || 'Force Sync' }}
          </n-button>
          <n-button
            v-else
            size="medium"
            type="default"
            strong
            class="hidden sm:inline-flex h-10 rounded-md px-3"
            @click="gotoPlaynite"
          >
            <svg class="mr-2 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M12 3v3m0 12v3m9-9h-3M6 12H3m13.95 5.657l-2.121-2.121M8.172 8.172 6.05 6.05m11.9 0-2.121 2.121M8.172 15.828 6.05 17.95" />
            </svg>
            {{ $t('playnite.setup_integration') || 'Setup Playnite' }}
          </n-button>
        </template>

        <!-- Primary: Add (always visible) -->
        <n-button
          type="primary"
          size="medium"
          strong
          class="h-10 rounded-md px-4"
          @click="openAdd"
        >
          <svg class="mr-1.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M12 5v14M5 12h14" />
          </svg>
          Add
        </n-button>

        <!-- Mobile overflow: secondary actions in dropdown -->
        <n-dropdown
          v-if="isWindows"
          trigger="click"
          placement="bottom-end"
          class="sm:hidden"
          :options="mobileOverflowOptions"
          @select="handleMobileOverflow"
        >
          <n-button
            size="medium"
            type="default"
            class="sm:hidden h-10 w-10 rounded-md px-0"
            aria-label="More actions"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
            </svg>
          </n-button>
        </n-dropdown>
      </div>
    </div>

    <!-- Redesigned list view -->
    <div
      class="rounded-2xl overflow-hidden border border-dark/10 dark:border-light/10 bg-light/80 dark:bg-surface/80 backdrop-blur"
    >
      <div v-if="apps && apps.length" class="divide-y divide-black/5 dark:divide-white/10">
        <button
          v-for="(app, i) in apps"
          :key="appKey(app, i)"
          type="button"
          class="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          :aria-label="'Edit ' + (app.name || 'application')"
          @click="openEdit(app, i)"
          @keydown.enter.prevent="openEdit(app, i)"
          @keydown.space.prevent="openEdit(app, i)"
        >
          <div
            class="flex items-center justify-between px-6 py-4 min-h-[56px] hover:bg-dark/10 dark:hover:bg-light/10"
          >
            <div class="min-w-0 flex-1">
              <div class="text-sm font-semibold truncate flex items-center gap-2">
                <span class="truncate">{{ app.name || '(untitled)' }}</span>
                <!-- Playnite or Custom badges -->
                <template v-if="app['playnite-id']">
                  <n-tag
                    size="small"
                    class="!px-2 !py-0.5 text-xs bg-slate-700 border-none text-slate-200"
                    >Playnite</n-tag
                  >
                  <span v-if="app['playnite-managed'] === 'manual'" class="text-[10px] opacity-70"
                    >manual</span
                  >
                  <span v-else-if="app['playnite-source']" class="text-[10px] opacity-70">{{
                    String(app['playnite-source']).split('+').join(' + ')
                  }}</span>
                  <span v-else class="text-[10px] opacity-70">managed</span>
                </template>
                <template v-else>
                  <n-tag
                    size="small"
                    class="!px-2 !py-0.5 text-xs bg-slate-700/70 border-none text-slate-200"
                    >Custom</n-tag
                  >
                </template>
              </div>
              <div class="mt-0.5 text-xs opacity-80 truncate" v-if="app['working-dir']">
                {{ app['working-dir'] }}
              </div>
            </div>
            <div class="shrink-0 text-dark/50 dark:text-light/70">
              <svg
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.6"
                  d="M9 6l6 6-6 6"
                />
              </svg>
            </div>
          </div>
        </button>
      </div>
      <div v-else class="flex flex-col items-center gap-4 px-8 py-14 text-center">
        <!-- Empty state illustration -->
        <div class="rounded-2xl bg-primary/8 dark:bg-primary/12 p-5 mb-1">
          <svg class="w-10 h-10 text-primary opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
            <rect x="3" y="3" width="18" height="14" rx="3" stroke-width="1.5"/>
            <path d="M7 21h10M12 17v4" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M12 8v4m-2-2h4" stroke-width="1.75" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="space-y-1.5 max-w-xs">
          <p class="text-sm font-semibold text-dark dark:text-light">No applications yet</p>
          <p class="text-xs leading-relaxed opacity-60">
            Add a custom app or connect Playnite to build your streaming library.
          </p>
        </div>
        <n-button type="primary" size="medium" strong class="mt-2 rounded-xl" @click="openAdd">
          <svg class="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
            <path d="M12 5v14M5 12h14" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Add Application
        </n-button>
      </div>
    </div>

    <AppEditModal
      v-model="showModal"
      :app="currentApp"
      :index="currentIndex"
      :key="
        modalKey +
        '|' +
        (currentIndex ?? -1) +
        '|' +
        (currentApp?.uuid || currentApp?.name || 'new')
      "
      @saved="reload"
      @deleted="reload"
    />
    <!-- Playnite integration removed for now -->
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, watch, defineAsyncComponent } from 'vue';
import { useI18n } from 'vue-i18n';
// Lazy-load the modal when first opened
const AppEditModal = defineAsyncComponent(() => import('@/components/AppEditModal.vue'));
import { useAppsStore } from '@/stores/apps';
import { storeToRefs } from 'pinia';
import { NButton, NTag, NDropdown } from 'naive-ui';
import type { DropdownOption } from 'naive-ui';
import { useConfigStore } from '@/stores/config';
import { http } from '@/http';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { App } from '@/stores/apps';

// Minimal shape used for rendering items returned by the backend
// Use shared App type from store for consistency

const appsStore = useAppsStore();
const { apps } = storeToRefs(appsStore);
const configStore = useConfigStore();
const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const syncBusy = ref(false);
const isWindows = computed(
  () => (configStore.metadata?.platform || '').toLowerCase() === 'windows',
);

const playniteInstalled = ref(false);
const playniteStatusReady = ref(false);
const playniteEnabled = computed(() => playniteInstalled.value);

const showModal = ref(false);
const modalKey = ref(0);
const currentApp = ref<App | null>(null);
const currentIndex = ref<number>(-1);

async function reload(): Promise<void> {
  await appsStore.loadApps(true);
}

function openAdd(): void {
  currentApp.value = null;
  currentIndex.value = -1;
  showModal.value = true;
}

function openEdit(app: App, i: number): void {
  currentApp.value = app;
  currentIndex.value = i;
  showModal.value = true;
}
function appKey(app: App | null | undefined, index: number) {
  const id = app?.uuid || '';
  return `${app?.name || 'app'}|${id}|${index}`;
}

async function forceSync(): Promise<void> {
  syncBusy.value = true;
  try {
    await http.post('./api/playnite/force_sync', {}, { validateStatus: () => true });
    await reload();
  } catch {
  } finally {
    syncBusy.value = false;
  }
}

function gotoPlaynite(): void {
  try {
    router.push({ path: '/settings', query: { sec: 'playnite' } });
  } catch {
    // ignore navigation errors
  }
}

async function fetchPlayniteStatus(): Promise<void> {
  // Only attempt when authenticated; http layer blocks otherwise
  if (!auth.isAuthenticated) return;
  try {
    const r = await http.get('/api/playnite/status', { validateStatus: () => true });
    if (
      r.status === 200 &&
      r.data &&
      typeof r.data === 'object' &&
      r.data !== null &&
      'installed' in (r.data as Record<string, unknown>)
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = r.data as any;
      playniteInstalled.value = data.installed === true || data.active === true;
    }
  } catch {
    // ignore; will retry on next auth change
  } finally {
    playniteStatusReady.value = true;
  }
}

onMounted(async () => {
  // Ensure metadata/config present for platform + playnite detection
  try {
    await configStore.fetchConfig?.();
  } catch {}
  // Defer Playnite status until authenticated to avoid 401/canceled requests
  if (auth.isAuthenticated) {
    void fetchPlayniteStatus();
  } else {
    playniteStatusReady.value = false; // not ready yet
  }
  // Also load apps list (safe if already loaded by bootstrap)
  try {
    await appsStore.loadApps(true);
  } catch {}
  // Auto-open Add modal when navigated here with ?add=1 (e.g. from Manual card)
  if (route.query['add'] === '1') {
    openAdd();
  }
});

// When user logs in while this view is mounted, refresh Playnite status
auth.onLogin(() => {
  playniteStatusReady.value = false;
  void fetchPlayniteStatus();
});

// Mobile overflow dropdown options
const mobileOverflowOptions = computed<DropdownOption[]>(() => {
  if (!isWindows.value) return [];
  if (playniteEnabled.value) {
    return [
      {
        label: syncBusy.value ? 'Syncing…' : (t('playnite.force_sync') || 'Force Sync'),
        key: 'force-sync',
        disabled: syncBusy.value,
      },
    ];
  }
  return [
    {
      label: t('playnite.setup_integration') || 'Setup Playnite',
      key: 'setup-playnite',
    },
  ];
});

function handleMobileOverflow(key: string): void {
  if (key === 'force-sync') void forceSync();
  else if (key === 'setup-playnite') gotoPlaynite();
}
</script>
<style scoped>
.main-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(253, 184, 19, 0.9);
  color: #212121;
  font-size: 11px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
}

.main-btn:hover {
  background: #fdb813;
}

.dark .main-btn {
  background: rgba(77, 163, 255, 0.85);
  color: #050b1e;
}

.dark .main-btn:hover {
  background: #4da3ff;
}
/* Row chevron styling adapts via text color set inline */
</style>
