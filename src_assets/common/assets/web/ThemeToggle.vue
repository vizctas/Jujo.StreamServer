<script setup lang="ts">
import { ref, onMounted, computed, h } from 'vue';
import { useI18n } from 'vue-i18n';
import { NDropdown, NButton } from 'naive-ui';
import LucideIcon from '@/components/LucideIcon.vue';
import {
  loadAutoTheme,
  setupThemeToggleListener,
  getPreferredTheme,
  setStoredTheme,
  setTheme,
} from '@/theme';

const { t } = useI18n();

const open = ref(false);
const current = ref('auto');

const options = computed(() => [
  {
    key: 'light',
    label: t('navbar.theme_light'),
    icon: () => h(LucideIcon, { name: 'fa-sun', size: 14 }),
  },
  { key: 'dark', label: t('navbar.theme_dark'), icon: () => h(LucideIcon, { name: 'fa-moon', size: 14 }) },
  {
    key: 'auto',
    label: t('navbar.theme_auto'),
    icon: () => h(LucideIcon, { name: 'fa-circle-half-stroke', size: 14 }),
  },
]);

const activeIcon = computed(() => {
  const m: Record<ThemeKey, string> = {
    light: 'fa-sun',
    dark: 'fa-moon',
    auto: 'fa-circle-half-stroke',
  };
  return current.value === 'light' || current.value === 'dark' ? m[current.value] : m.auto;
});

type ThemeKey = 'light' | 'dark' | 'auto';

interface ThemeOption {
  key: ThemeKey;
  label: string;
  icon: () => ReturnType<typeof h>;
}

function onSelect(key: string | number): void {
  const v = String(key) as ThemeKey;
  setStoredTheme(v);
  setTheme(v);
  current.value = v;
  open.value = false;
}

onMounted(() => {
  loadAutoTheme();
  setupThemeToggleListener();
  current.value = getPreferredTheme();
});
</script>

<template>
  <n-dropdown trigger="click" :options="options" @select="onSelect">
    <n-button
      tertiary
      size="small"
      class="flex items-center gap-2 bg-transparent border-0 shadow-none hover:bg-transparent focus:outline-none"
    >
      <span class="theme-icon-active"><LucideIcon :name="activeIcon" :size="14" /></span>
      <span>{{ $t('navbar.toggle_theme') }}</span>
    </n-button>
  </n-dropdown>
</template>

<style scoped></style>
