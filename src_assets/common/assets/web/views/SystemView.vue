<template>
  <div class="mx-auto max-w-6xl space-y-6">
    <section class="page-surface p-5 md:p-6">
      <p class="text-xs font-semibold uppercase tracking-wide text-primary">System</p>
      <h1 class="mt-2 text-2xl font-semibold tracking-tight">Streaming readiness</h1>
      <p class="mt-2 max-w-2xl text-sm leading-6 text-dark/70 dark:text-light/70">
        Review the host requirements that affect first stream success.
      </p>
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <article v-for="check in checks" :key="check.id" class="page-surface p-4">
        <div class="flex items-start gap-4">
          <span :class="['check-icon', check.iconClass]">
            <LucideIcon :name="check.icon" :size="18" />
          </span>
          <div class="min-w-0 flex-1 space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-base font-semibold">{{ check.label }}</h2>
              <n-tag :type="check.tagType" :bordered="false" size="small">{{ check.state }}</n-tag>
            </div>
            <p class="text-sm leading-6 text-dark/68 dark:text-light/68">{{ check.description }}</p>
            <RouterLink v-if="check.path" :to="check.path" custom v-slot="{ navigate, href }">
              <a :href="href" @click="navigate">
                <n-button tag="span" secondary strong size="small">
                  <LucideIcon name="fa-chevron-right" :size="14" />
                  <span>{{ check.action }}</span>
                </n-button>
              </a>
            </RouterLink>
          </div>
        </div>
      </article>
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
import { useAppsStore } from '@/stores/apps';
import { useAuthStore } from '@/stores/auth';

type ReadinessStatus = 'ready' | 'warning' | 'pending';
type ReadinessContract = {
  id: string;
  label: string;
  status: ReadinessStatus;
  summary?: string;
  action?: string;
  path?: string;
};
type SystemReadinessResponse = {
  status?: boolean;
  overall?: string;
  checks?: ReadinessContract[];
};

const appsStore = useAppsStore();
const authStore = useAuthStore();
const { apps } = storeToRefs(appsStore);
const { sessions } = storeToRefs(authStore);
const apiChecks = ref<ReadinessContract[] | null>(null);

onMounted(() => {
  void appsStore.loadApps(false);
  void authStore.fetchSessions();
  void loadSystemReadiness();
});

async function loadSystemReadiness() {
  try {
    const res = await http.get<SystemReadinessResponse>('/api/system/readiness', { validateStatus: () => true });
    if (res.status === 200 && res.data?.status && Array.isArray(res.data.checks)) {
      apiChecks.value = res.data.checks;
    }
  } catch {
    apiChecks.value = null;
  }
}

const fallbackChecks = computed<ReadinessContract[]>(() => [
  readyCheck(
    'client',
    'Client paired',
    sessions.value.length > 0,
    'Pair at least one client before launching a stream.',
    '/pairing',
    'Open Pairing',
  ),
  readyCheck(
    'game',
    'Playable game available',
    apps.value.length > 0,
    'Add a manual game or connect a source so the client has something to launch.',
    '/game-sources',
    'Open Game Sources',
  ),
  reviewCheck('encoder', 'Encoder ready', 'Backend readiness endpoint pending. This will report NVENC/AMF/QSV/software availability.'),
  reviewCheck('capture', 'Display capture ready', 'Backend readiness endpoint pending. This will validate WGC/DXGI/display-helper state.'),
  reviewCheck('network', 'Network reachable', 'Backend readiness endpoint pending. This will validate discovery, bind address, and ports.'),
  reviewCheck('controller', 'Controller driver ready', 'Windows check pending. This will validate ViGEm or replacement controller routing.'),
  reviewCheck('virtualDisplay', 'Virtual display ready', 'Windows check pending. This will validate virtual display driver state when configured.'),
]);

const checks = computed(() => (apiChecks.value ?? fallbackChecks.value).map(mapReadinessCheck));

function readyCheck(
  id: string,
  label: string,
  ready: boolean,
  description: string,
  path: string,
  action: string,
) {
  return {
    id,
    label,
    summary: description,
    path,
    action,
    status: ready ? ('ready' as const) : ('pending' as const),
  };
}

function reviewCheck(id: string, label: string, description: string) {
  return {
    id,
    label,
    summary: description,
    path: '/settings',
    action: 'Open Settings',
    status: 'warning' as const,
  };
}

function mapReadinessCheck(check: ReadinessContract) {
  return {
    id: check.id,
    label: check.label,
    description: check.summary ?? '',
    path: check.path,
    action: check.action ?? 'Open Settings',
    state: statusLabel(check.status),
    tagType: tagType(check.status),
    icon: statusIcon(check.status),
    iconClass: iconClass(check.status),
  };
}

function statusLabel(status: ReadinessStatus): string {
  if (status === 'ready') return 'Ready';
  if (status === 'warning') return 'Review';
  return 'Not set';
}

function tagType(status: ReadinessStatus): 'success' | 'warning' | 'info' {
  if (status === 'ready') return 'success';
  if (status === 'warning') return 'warning';
  return 'info';
}

function statusIcon(status: ReadinessStatus): string {
  if (status === 'ready') return 'fa-check-circle';
  if (status === 'warning') return 'fa-exclamation-triangle';
  return 'fa-circle-info';
}

function iconClass(status: ReadinessStatus): string {
  if (status === 'ready') return 'bg-success/12 text-success';
  if (status === 'warning') return 'bg-warning/14 text-warning';
  return 'bg-primary/10 text-primary';
}
</script>

<style scoped>
.check-icon {
  display: inline-flex;
  height: 2.5rem;
  width: 2.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
}
</style>
