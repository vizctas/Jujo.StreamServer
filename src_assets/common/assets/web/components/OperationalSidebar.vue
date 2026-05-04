<template>
  <aside :class="desktopAsideClass">
    <!-- Header: logo + collapse toggle -->
    <div class="mb-6 flex items-center" :class="sidebarCollapsed ? 'flex-col gap-3 px-0' : 'px-2'">
      <RouterLink
        to="/"
        class="flex min-w-0 flex-1 items-center gap-3"
        :class="sidebarCollapsed ? 'justify-center flex-none' : ''"
      >
        <img src="/images/logo-apollo-45.png" alt="Jujo.Stream Server" class="h-9 w-9 shrink-0" />
        <div v-if="!sidebarCollapsed" class="min-w-0">
          <p class="truncate text-sm font-semibold leading-tight">Jujo.Stream</p>
          <p class="truncate text-xs text-dark/60 dark:text-light/60">Server Console</p>
        </div>
      </RouterLink>
      <button
        type="button"
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-dark/50 transition-colors hover:bg-dark/8 hover:text-dark dark:text-light/50 dark:hover:bg-light/10 dark:hover:text-light"
        :aria-label="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="sidebarCollapsed = !sidebarCollapsed"
      >
        <LucideIcon :name="sidebarCollapsed ? 'fa-chevron-right' : 'fa-bars'" :size="15" />
      </button>
    </div>

    <nav class="space-y-1" aria-label="Primary navigation">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="linkClass(item.path)"
        v-bind="sidebarCollapsed ? { title: item.label } : {}"
      >
        <LucideIcon :name="item.icon" :size="17" />
        <span v-if="!sidebarCollapsed">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div
      class="mt-auto border-t border-dark/10 pt-4 dark:border-light/10"
      :class="sidebarCollapsed ? 'space-y-2' : 'space-y-3'"
    >
      <div v-if="!sidebarCollapsed" class="flex items-center justify-between px-2">
        <SavingStatus />
        <ThemeToggle />
      </div>
      <div v-else class="flex justify-center">
        <ThemeToggle />
      </div>
      <button
        type="button"
        :class="logoutBtnClass"
        v-bind="sidebarCollapsed ? { title: t('navbar.logout') } : {}"
        @click="$emit('logout')"
      >
        <LucideIcon name="fa-sign-out-alt" :size="17" />
        <span v-if="!sidebarCollapsed">{{ t('navbar.logout') }}</span>
      </button>
    </div>
  </aside>

  <header
    class="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-dark/10 bg-light/90 px-4 backdrop-blur dark:border-light/10 dark:bg-dark/90 lg:hidden"
  >
    <n-button quaternary circle aria-label="Open navigation" @click="mobileOpen = true">
      <LucideIcon name="fa-bars" :size="19" />
    </n-button>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-semibold">{{ currentLabel }}</p>
    </div>
    <SavingStatus />
    <ThemeToggle />
  </header>

  <n-drawer v-model:show="mobileOpen" placement="left" :width="304">
    <n-drawer-content body-content-style="padding: 0;">
      <div class="flex min-h-full flex-col bg-surface px-3 py-4 dark:bg-surface">
        <RouterLink to="/" class="mb-5 flex min-w-0 items-center gap-3 px-2" @click="mobileOpen = false">
          <img src="/images/logo-apollo-45.png" alt="Jujo.Stream Server" class="h-9 w-9" />
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold leading-tight">Jujo.Stream</p>
            <p class="truncate text-xs text-dark/60 dark:text-light/60">Server Console</p>
          </div>
        </RouterLink>
        <nav class="space-y-1" aria-label="Primary navigation">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :class="linkClass(item.path)"
            @click="mobileOpen = false"
          >
            <LucideIcon :name="item.icon" :size="17" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>
        <button type="button" class="mt-auto" :class="baseLinkClass + ' w-full text-dark/70 hover:bg-dark/5 hover:text-dark dark:text-light/70 dark:hover:bg-light/10 dark:hover:text-light'" @click="logoutFromDrawer">
          <LucideIcon name="fa-sign-out-alt" :size="17" />
          <span>{{ t('navbar.logout') }}</span>
        </button>
      </div>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { NButton, NDrawer, NDrawerContent } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import LucideIcon from '@/components/LucideIcon.vue';
import SavingStatus from '@/components/SavingStatus.vue';
import ThemeToggle from '@/ThemeToggle.vue';

const emit = defineEmits<{
  logout: [];
}>();

const route = useRoute();
const { t } = useI18n();
const mobileOpen = ref(false);
const sidebarCollapsed = ref(false);

const desktopAsideClass = computed(() => [
  'hidden h-screen shrink-0 border-r border-dark/10 bg-surface/90 py-4 dark:border-light/10 dark:bg-surface/95 lg:flex lg:flex-col transition-[width] duration-200 overflow-hidden',
  sidebarCollapsed.value ? 'w-14 px-2' : 'w-64 px-3',
]);

const navItems = computed(() => [
  { path: '/', label: 'Home', icon: 'fa-gauge' },
  { path: '/pairing', label: 'Pairing', icon: 'fa-link' },
  { path: '/library', label: 'Library', icon: 'fa-gamepad' },
  { path: '/game-sources', label: 'Game Sources', icon: 'fa-plug' },
  { path: '/clients', label: t('clients.nav'), icon: 'fa-users-cog' },
  { path: '/system', label: 'System', icon: 'fa-stethoscope' },
  { path: '/settings', label: t('navbar.configuration'), icon: 'fa-sliders' },
]);

const currentLabel = computed(() => {
  const current = navItems.value.find((item) => isActive(item.path));
  return current?.label || 'Jujo.Stream Server';
});

const baseLinkClass =
  'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors';
const baseLinkCollapsedClass =
  'flex min-h-11 items-center justify-center rounded-md text-sm font-medium transition-colors';
const logoutBtnClass = computed(() =>
  (sidebarCollapsed.value ? baseLinkCollapsedClass : baseLinkClass) +
  ' w-full text-dark/70 hover:bg-dark/5 hover:text-dark dark:text-light/70 dark:hover:bg-light/10 dark:hover:text-light',
);

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/';
  return route.path === path || route.path.startsWith(path + '/');
}

function linkClass(path: string): string {
  const base = sidebarCollapsed.value ? baseLinkCollapsedClass : baseLinkClass;
  if (isActive(path)) {
    return (
      base + ' bg-primary/12 text-primary shadow-[inset_3px_0_0_rgb(var(--color-primary))]'
    );
  }
  return (
    base +
    ' text-dark/70 hover:bg-dark/5 hover:text-dark dark:text-light/70 dark:hover:bg-light/10 dark:hover:text-light'
  );
}

function logoutFromDrawer(): void {
  mobileOpen.value = false;
  emit('logout');
}
</script>
