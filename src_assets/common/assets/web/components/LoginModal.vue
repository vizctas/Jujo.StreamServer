<template>
  <n-modal :show="visible" :mask-closable="false" :close-on-esc="false">
    <n-config-provider :theme="isDark ? darkTheme : null" :theme-overrides="naiveOverrides">
    <div class="login-modal-shell" role="dialog" aria-modal="true" :aria-label="panelTitle">
      <!-- Theme toggle: top-left corner -->
      <button
        type="button"
        class="login-theme-toggle"
        :title="'Theme: ' + themeMode"
        :aria-label="'Switch theme, current: ' + themeMode"
        @click="cycleTheme"
      >
        <LucideIcon :name="themeOptions.find(o => o.value === themeMode)?.icon ?? 'fa-circle-half-stroke'" :size="15" />
      </button>

      <!-- Left: image panel -->
      <div class="login-panel-left" aria-hidden="true">
        <div class="login-panel-left-content">
          <div class="login-panel-logo">
            <LucideIcon name="fa-satellite-dish" :size="26" />
          </div>
          <div class="login-panel-tagline">
            <h2>{{ isSignUp ? 'Create your account' : 'Welcome Back!' }}</h2>
            <p>{{ isSignUp ? 'Set up your Jujo.Stream admin credentials.' : 'Sign in to manage your stream server.' }}</p>
          </div>
        </div>
      </div>

      <!-- Right: form panel -->
      <div class="login-panel-right">
        <div class="login-form-wrap">
          <div class="login-form-header">
            <h1 class="login-form-title">{{ panelTitle }}</h1>
            <p class="login-form-subtitle">{{ panelSubtitle }}</p>
          </div>

          <form
            id="loginForm"
            class="login-form-body"
            novalidate
            @submit.prevent="submit"
            @keydown.ctrl.enter.stop.prevent="submit"
          >
            <!-- Username -->
            <div class="lf-field">
              <label class="lf-label" for="lf-username">{{ t('auth.username') }}</label>
              <n-input
                id="lf-username"
                v-model:value="username"
                autocomplete="username"
                :placeholder="isSignUp ? 'Choose a username' : 'Enter your username'"
                size="large"
              />
            </div>

            <!-- Password (login only) -->
            <div v-if="!isSignUp" class="lf-field">
              <label class="lf-label" for="lf-password">{{ t('auth.password') }}</label>
              <n-input
                id="lf-password"
                v-model:value="password"
                type="password"
                show-password-on="click"
                autocomplete="current-password"
                placeholder="Enter your password"
                size="large"
              />
            </div>

            <!-- New + Confirm password (sign-up) -->
            <template v-if="isSignUp">
              <div class="lf-field">
                <label class="lf-label" for="lf-newpw">{{ t('auth.new_password') }}</label>
                <n-input
                  id="lf-newpw"
                  v-model:value="newPassword"
                  type="password"
                  show-password-on="click"
                  autocomplete="new-password"
                  placeholder="Create a password"
                  size="large"
                />
              </div>
              <div class="lf-field">
                <label class="lf-label" for="lf-confirmpw">{{ t('auth.confirm_new_password') }}</label>
                <n-input
                  id="lf-confirmpw"
                  v-model:value="confirmNewPassword"
                  type="password"
                  show-password-on="click"
                  autocomplete="new-password"
                  placeholder="Repeat your password"
                  size="large"
                />
              </div>
            </template>

            <!-- Remember me + Forgot (login only) -->
            <div v-if="!isSignUp" class="lf-remember-row">
              <n-checkbox v-model:checked="rememberMe" size="small">
                {{ t('auth.remember_me_label') }}
              </n-checkbox>
            </div>

            <!-- Feedback -->
            <div v-if="error || success" class="lf-feedback">
              <n-alert v-if="error" type="error" :show-icon="true" size="small">{{ error }}</n-alert>
              <n-alert v-else-if="success" type="success" :show-icon="true" size="small">{{ success }}</n-alert>
            </div>

            <!-- Primary action -->
            <n-button
              type="primary"
              attr-type="submit"
              :disabled="submitting"
              :loading="submitting"
              size="large"
              class="lf-submit-btn"
              block
            >
              {{ submitLabel }}
            </n-button>
          </form>

          <!-- Toggle sign-in / sign-up (only when credentials already exist) -->
          <div v-if="credentialsConfigured" class="lf-toggle-row">
            <span class="lf-toggle-text">
              {{ isSignUp ? 'Already have an account?' : 'New User?' }}
            </span>
            <button type="button" class="lf-toggle-btn" @click="toggleMode">
              {{ isSignUp ? 'Sign In' : 'Sign Up' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    </n-config-provider>
  </n-modal>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { http, applyLoginResponse } from '@/http';
import { useI18n } from 'vue-i18n';
import LucideIcon from '@/components/LucideIcon.vue';
import { NModal, NInput, NAlert, NButton, NCheckbox, NConfigProvider, darkTheme } from 'naive-ui';
import { useNaiveThemeOverrides, useDarkModeClassRef } from '@/naive-theme';
import { getPreferredTheme, setTheme, setStoredTheme } from '@/theme';

const isDark = useDarkModeClassRef();
const naiveOverrides = useNaiveThemeOverrides();

type ThemeMode = 'light' | 'dark' | 'auto';
const themeMode = ref<ThemeMode>(getPreferredTheme());
const themeOptions: { value: ThemeMode; icon: string; label: string }[] = [
  { value: 'light', icon: 'fa-sun', label: 'Light' },
  { value: 'dark', icon: 'fa-moon', label: 'Dark' },
  { value: 'auto', icon: 'fa-circle-half-stroke', label: 'Auto' },
];
function cycleTheme() {
  const order: ThemeMode[] = ['light', 'dark', 'auto'];
  const idx = order.indexOf(themeMode.value);
  const next: ThemeMode = (order[(idx >= 0 ? idx + 1 : 1) % order.length]) ?? 'auto';
  themeMode.value = next;
  setStoredTheme(next);
  setTheme(next);
}

const auth = useAuthStore();
const { t } = useI18n();

// Show modal only when auth layer is ready, it has requested login,
// and the user is not already authenticated. This prevents the modal
// from flashing or appearing for non-auth errors.
const visible = computed(
  () => auth.ready && auth.showLoginModal && !auth.isAuthenticated && !auth.logoutInitiated,
);
const credentialsConfigured = computed(() => auth.credentialsConfigured);

// When no credentials exist we always show the create-first-user (sign-up) form
const isSignUp = ref(false);
const effectiveSignUp = computed(() => isSignUp.value || !credentialsConfigured.value);

const panelTitle = computed(() => {
  if (!credentialsConfigured.value) return t('auth.create_first_user');
  return effectiveSignUp.value ? 'Create Account' : t('auth.login_title');
});

const panelSubtitle = computed(() => {
  if (!credentialsConfigured.value) return t('auth.first_user_subtitle');
  return effectiveSignUp.value
    ? 'Fill in the details below to register.'
    : 'Welcome back! Please sign in to continue.';
});

const submitLabel = computed(() => {
  if (submitting.value) {
    return effectiveSignUp.value ? t('auth.creating_user') : t('auth.login_loading');
  }
  return effectiveSignUp.value ? t('auth.create_user') : t('auth.login_sign_in');
});

const username = ref('');
const password = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');
const error = ref('');
const success = ref('');
const submitting = ref(false);
const rememberMe = ref(false);

watch(visible, (v) => {
  if (v) reset();
});

function reset() {
  username.value = '';
  password.value = '';
  newPassword.value = '';
  confirmNewPassword.value = '';
  error.value = '';
  success.value = '';
  rememberMe.value = false;
  isSignUp.value = false;
}

function toggleMode() {
  isSignUp.value = !isSignUp.value;
  error.value = '';
  success.value = '';
}

async function submit() {
  const MIN_LOGIN_DELAY_MS = 1000;
  const start = Date.now();
  error.value = '';
  success.value = '';
  if (submitting.value) return;
  submitting.value = true;
  // Toggle store logging state — Pinia unwraps refs so direct assignment works
  const setLogging = (state: boolean) => {
    try {
      (auth as any).loggingIn = state;
    } catch {
      // noop
    }
  };
  setLogging(true);
  try {
    // Capture whether this is the first-user flow before we potentially flip the flag
    const firstUserFlow = effectiveSignUp.value;
    if (firstUserFlow) {
      if (!newPassword.value || newPassword.value !== confirmNewPassword.value) {
        error.value = t('auth.password_mismatch');
        return;
      }
      // Use password save endpoint to create first credentials (no auth required when none configured)
      const res = await http.post(
        '/api/password',
        {
          currentUsername: username.value,
          // Server ignores current* when none exist
          currentPassword: newPassword.value,
          newUsername: username.value,
          newPassword: newPassword.value,
          confirmNewPassword: confirmNewPassword.value,
        },
        { validateStatus: () => true },
      );
      if (res.status !== 200 || !res.data || !res.data.status) {
        error.value = res.data && res.data.error ? res.data.error : t('auth.create_user_failed');
        return;
      }
      auth.setCredentialsConfigured(true);
      success.value = t('auth.user_created');
      // Auto attempt login after slight delay
      await new Promise((r) => setTimeout(r, 250));
    }
    // Perform login (if first-time, use the newly created password explicitly)
    const loginRes = await http.post(
      '/api/auth/login',
      {
        username: username.value,
        password: firstUserFlow ? newPassword.value : password.value,
        remember_me: rememberMe.value,
      },
      { validateStatus: () => true },
    );
    if (loginRes.status === 200 && loginRes.data && loginRes.data.status) {
      // Store session token for Authorization header injection (bypasses __Host- cookie restriction in HTTP dev)
      applyLoginResponse(loginRes.data, rememberMe.value);
      // Ensure the login feels deliberate: keep the loading state at least MIN_LOGIN_DELAY_MS
      const elapsed = Date.now() - start;
      if (elapsed < MIN_LOGIN_DELAY_MS) {
        await new Promise((r) => setTimeout(r, MIN_LOGIN_DELAY_MS - elapsed));
      }
      auth.setAuthenticated(true);
      success.value = t('auth.login_success');
      setTimeout(() => {
        auth.hideLogin();
      }, 400);
    } else {
      error.value =
        loginRes.data && loginRes.data.error ? loginRes.data.error : t('auth.login_failed');
    }
  } catch (e) {
    error.value = t('auth.login_network_error');
  } finally {
    submitting.value = false;
    setLogging(false);
  }
}
// Backdrop and Esc are disabled via NModal props (mask-closable=false, close-on-esc=false)
</script>
<style scoped>
/* ── Theme toggle ── */
.login-theme-toggle {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: rgb(0 0 0 / 0.18);
  backdrop-filter: blur(6px);
  border: 1px solid rgb(255 255 255 / 0.18);
  color: #fff;
  cursor: pointer;
  transition: background 150ms ease, transform 150ms ease;
}

.login-theme-toggle:hover {
  background: rgb(0 0 0 / 0.32);
  transform: scale(1.08);
}

/* ── Shell ── */
.login-modal-shell {
  position: relative;
  display: flex;
  width: min(58rem, 96vw);
  min-height: 31rem;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 2rem 5rem rgb(0 0 0 / 0.22);
  background: #fff;
}

/* ── Left gradient panel ── */
.login-panel-left {
  position: relative;
  width: 42%;
  min-height: 100%;
  background: url('/images/login-bg.jpg') center center / cover no-repeat;
  overflow: hidden;
  flex-shrink: 0;
}

/* Scrim over image so text stays legible */
.login-panel-left::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, rgb(0 0 0 / 0.18) 0%, rgb(0 0 0 / 0.52) 100%);
  z-index: 0;
}

.login-panel-left-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2rem 1.75rem;
  color: #fff;
  gap: 1rem;
}

.login-panel-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  background: rgb(255 255 255 / 0.22);
  backdrop-filter: blur(6px);
  flex-shrink: 0;
}

.login-panel-tagline {
  margin-top: auto;
  padding-bottom: 1.5rem;
}

.login-panel-tagline h2 {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.15;
  margin: 0 0 0.5rem;
}

.login-panel-tagline p {
  font-size: 0.85rem;
  opacity: 0.88;
  line-height: 1.5;
  margin: 0;
}

/* ── Right form panel ── */
.login-panel-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 2.25rem;
  background: #fff;
}

.login-form-wrap {
  width: 100%;
  max-width: 22rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.login-form-header {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.login-form-title {
  font-size: 1.65rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
  line-height: 1.2;
}

.login-form-subtitle {
  font-size: 0.82rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.login-form-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ── Field ── */
.lf-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.lf-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.01em;
}

/* ── Remember row ── */
.lf-remember-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ── Feedback ── */
.lf-feedback {
  margin-top: -0.25rem;
}

/* ── Submit ── */
.lf-submit-btn {
  margin-top: 0.25rem;
}

/* ── Toggle ── */
.lf-toggle-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  font-size: 0.82rem;
}

.lf-toggle-text {
  color: #6b7280;
}

.lf-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;
  color: #7c3aed;
  padding: 0;
  transition: color 150ms ease;
}

.lf-toggle-btn:hover {
  color: #a855f7;
  text-decoration: underline;
}

/* ── Light mode: keep NaiveUI default (no override needed) ── */

/* ── Dark mode overrides ── */
.dark .login-modal-shell {
  background: #18181b;
}

.dark .login-panel-right {
  background: #18181b;
}

.dark :deep(.n-input) {
  --n-color: rgb(255 255 255 / 0.06) !important;
  --n-color-focus: rgb(255 255 255 / 0.08) !important;
  --n-text-color: #f4f4f5 !important;
  --n-placeholder-color: rgb(255 255 255 / 0.32) !important;
  --n-border: 1px solid rgb(255 255 255 / 0.1) !important;
  --n-border-focus: 1px solid #7c3aed !important;
  --n-border-hover: 1px solid rgb(255 255 255 / 0.2) !important;
  --n-caret-color: #a78bfa !important;
}

.dark .login-form-title {
  color: #f4f4f5;
}

.dark .login-form-subtitle {
  color: #a1a1aa;
}

.dark .lf-label {
  color: #d4d4d8;
}

.dark .lf-toggle-text {
  color: #a1a1aa;
}

/* ── Responsive: hide left panel on very small screens ── */
@media (max-width: 36rem) {
  .login-panel-left {
    display: none;
  }
  .login-modal-shell {
    width: min(26rem, 96vw);
  }
}
</style>
