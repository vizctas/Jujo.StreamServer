<template>
  <n-config-provider :theme="isDark ? darkTheme : null" :theme-overrides="naiveOverrides">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider>
            <div class="min-h-screen bg-light text-dark dark:bg-dark dark:text-light lg:flex">
              <OperationalSidebar @logout="logout" />

              <div class="flex min-w-0 flex-1 flex-col">
                <!-- Content: single shared container around RouterView; width via route meta -->
                <main class="flex-1 overflow-auto">
                  <RouterView v-slot="{ Component, route: r }">
                    <div :class="containerClass(r)">
                      <Transition name="fade-fast" mode="out-in">
                        <component :is="Component" />
                      </Transition>
                    </div>
                  </RouterView>
                </main>
              </div>

              <!-- Immediate background for login modal (no transition delay) -->
              <div v-if="loginOverlay" class="fixed inset-0 z-[110] pointer-events-none">
                <div
                  class="absolute inset-0 bg-gradient-to-br from-white/95 via-white/92 to-white/95 dark:from-black/95 dark:via-black/92 dark:to-black/95 backdrop-blur-md"
                ></div>
              </div>
              <LoginModal />
              <OfflineOverlay />
              <transition name="fade-fast">
                <div v-if="loggedOut" class="fixed inset-0 z-[120] flex flex-col">
                  <div
                    class="absolute inset-0 bg-gradient-to-br from-white/70 via-white/60 to-white/70 dark:from-black/70 dark:via-black/60 dark:to-black/70 backdrop-blur-md"
                  ></div>
                  <div
                    class="relative flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto"
                  >
                    <div class="w-full max-w-md mx-auto text-center space-y-6">
                      <img
                        src="/images/logo-apollo-45.png"
                        alt="Vibepollo"
                        class="h-24 w-24 opacity-80 mx-auto select-none"
                      />
                      <div class="space-y-2">
                        <h2 class="text-2xl font-semibold tracking-tight">
                          {{ $t('auth.logout_success') }}
                        </h2>
                        <p class="text-sm opacity-80 leading-relaxed">
                          {{ $t('auth.logout_refresh_hint') }}
                        </p>
                      </div>
                      <div class="flex items-center justify-center pt-2">
                        <n-button type="primary" @click="refreshPage">
                          {{ $t('auth.logout_refresh_button') }}
                          <LucideIcon name="fa-rotate" :size="16" />
                        </n-button>
                      </div>
                      <p class="mt-8 text-xs opacity-60 select-none">
                        Vibepollo
                      </p>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>
<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import {
  NConfigProvider,
  NDialogProvider,
  NMessageProvider,
  NNotificationProvider,
  NLoadingBarProvider,
  darkTheme,
} from 'naive-ui';
import { useNaiveThemeOverrides, useDarkModeClassRef } from '@/naive-theme';
import { useRoute } from 'vue-router';
import LoginModal from '@/components/LoginModal.vue';
import OfflineOverlay from '@/components/OfflineOverlay.vue';
import LucideIcon from '@/components/LucideIcon.vue';
import OperationalSidebar from '@/components/OperationalSidebar.vue';
import { http, clearSessionTokens } from '@/http';
import { useAuthStore } from './stores/auth';
import { useConfigStore } from '@/stores/config';
import { storeToRefs } from 'pinia';
import { useConnectivityStore } from '@/stores/connectivity';

// Sync Naive theme to existing dark mode class and pick colors from CSS vars
const isDark = useDarkModeClassRef();
const naiveOverrides = useNaiveThemeOverrides();

const route = useRoute();


// Use config metadata as a fallback for container sizing when route meta isn't set
const cfgStore = useConfigStore();
const { metadata } = storeToRefs(cfgStore);

const loggedOut = ref(false);

// Mirror LoginModal visibility for instant background application
const authForOverlay = useAuthStore();
const loginOverlay = computed(
  () =>
    authForOverlay.ready &&
    authForOverlay.showLoginModal &&
    !authForOverlay.isAuthenticated &&
    !authForOverlay.logoutInitiated,
);

async function logout() {
  const authStore = useAuthStore();
  const connectivity = useConnectivityStore();
  try {
    await http.post('/api/auth/logout', {}, { validateStatus: () => true });
  } catch (e) {
    console.error('Logout failed:', e);
  }
  try {
    (authStore as any).logoutInitiated = true;
  } catch {}
  try {
    clearSessionTokens();
  } catch {}
  try {
    authStore.setAuthenticated(false);
  } catch {}
  // Stop background connectivity checks and any other background polling
  try {
    connectivity.stop();
  } catch {}
  loggedOut.value = true;
}

function refreshPage() {
  window.location.reload();
}

// Layout container sizing via route meta: { container: 'sm'|'md'|'lg'|'xl'|'full' }
const base = 'mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6';
const sizes: Record<string, string> = {
  sm: 'max-w-2xl',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-7xl',
  full: 'max-w-none px-0 sm:px-0 lg:px-0',
};
function containerClass(r: any) {
  const routeSize = r?.meta?.container;
  const size = routeSize ?? (metadata.value as any)?.container ?? 'lg';
  return `${base} ${sizes[size] || sizes['lg']}`;
}
</script>
