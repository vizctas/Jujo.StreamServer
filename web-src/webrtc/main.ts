import { WebRtcHttpApi } from './api';
import { WebRtcClient } from './client';
import { attachInputCapture, applyGamepadFeedback, releaseKeyboardLock, requestKeyboardLock } from './input';
import type { EncodingType, InputMessage, StreamConfig, WebRtcStatsSnapshot } from './types';
import { CloudConfig, CloudError, signIn, signOut, verifyTotp } from './cloud';
import { attachSoftKeyboard, attachTouch, TouchMode } from './touch';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const cloudForm = $<HTMLFormElement>('cloud');
const totpForm = $<HTMLFormElement>('totp');
const loginForm = $<HTMLFormElement>('login');
const setupForm = $<HTMLFormElement>('setup');
const stage = $<HTMLDivElement>('stage');
const video = $<HTMLVideoElement>('video');
const hud = $<HTMLPreElement>('hud');
const statusEl = $<HTMLParagraphElement>('status');
const toolbar = $<HTMLDivElement>('toolbar');
const softKb = $<HTMLInputElement>('softkb');
const modeButton = $<HTMLButtonElement>('tb-mode');
const requirePassword = $<HTMLInputElement>('require-password');
const accountPasswordRow = $<HTMLLabelElement>('account-password-row');
const accountPassword = $<HTMLInputElement>('account-password');
const securityApply = $<HTMLButtonElement>('security-apply');
const appsEl = $<HTMLDivElement>('apps');
const guestNote = $<HTMLParagraphElement>('guest-note');
const setupTitle = $<HTMLHeadingElement>('setup-title');
const isTouch = navigator.maxTouchPoints > 0;
const authEl = $<HTMLElement>('auth');
const backdrop = $<HTMLDivElement>('backdrop');
const heroKicker = $<HTMLParagraphElement>('hero-kicker');
const heroMeta = $<HTMLDivElement>('hero-meta');
const playLabel = $<HTMLSpanElement>('play-label');
const libraryEl = $<HTMLElement>('library');
const settingsDialog = $<HTMLDialogElement>('settings');

const SETTINGS_KEY = 'jujo.webrtc.settings';
const TOUCH_MODE_KEY = 'jujo.webrtc.touchMode';
const INPUT_DROP_BYTES = 1024;

const client = new WebRtcClient(new WebRtcHttpApi());
let detachInput: (() => void) | undefined;
let lastStats: WebRtcStatsSnapshot = {};
let cloudCfg: CloudConfig | undefined;
let pendingCloud: { token: string; factorId: string } | undefined;
let appId: number | undefined; // undefined = desktop / whatever is running
let touchMode: TouchMode = 'trackpad';
try {
  if (localStorage.getItem(TOUCH_MODE_KEY) === 'direct') touchMode = 'direct';
} catch {
  /* storage blocked */
}

function say(msg: string, isError = false): void {
  statusEl.textContent = msg;
  statusEl.classList.toggle('error', isError);
}

type View = 'cloud' | 'totp' | 'login' | 'setup' | 'stage' | 'blocked';
function show(view: View): void {
  authEl.hidden = !['cloud', 'totp', 'login', 'blocked'].includes(view);
  cloudForm.hidden = view !== 'cloud';
  totpForm.hidden = view !== 'totp';
  loginForm.hidden = view !== 'login';
  setupForm.hidden = view !== 'setup';
  stage.hidden = view !== 'stage';
}

function decodable(codec: EncodingType): boolean {
  const mime = { h264: 'video/h264', hevc: 'video/h265', av1: 'video/av1' }[codec];
  return !!RTCRtpReceiver.getCapabilities?.('video')?.codecs.some((c) => c.mimeType.toLowerCase() === mime);
}

// Default to the viewer's physical screen so the host encodes exactly what will be shown (no scaler blur).
function defaults(): Record<string, string> {
  const dpr = window.devicePixelRatio || 1;
  let w = Math.max(screen.width, screen.height) * dpr;
  let h = Math.min(screen.width, screen.height) * dpr;
  if (isTouch && h > 1080) {
    w = (w * 1080) / h;
    h = 1080;
  }
  const even = (v: number) => Math.round(v / 2) * 2;
  const cellular = (navigator as Navigator & { connection?: { type?: string } }).connection?.type === 'cellular';
  return {
    resolution: `${even(w)}x${even(h)}`,
    fps: '60',
    bitrate: cellular ? '8000' : '20000',
    codec: decodable('hevc') ? 'hevc' : 'h264',
    pacing: 'latency',
  };
}

function loadSettings(): void {
  let saved: Record<string, string> = {};
  try {
    saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch {
    /* storage blocked */
  }
  const values = { ...defaults(), ...saved };
  for (const [k, v] of Object.entries(values)) {
    const el = setupForm.elements.namedItem(k) as HTMLInputElement | HTMLSelectElement | null;
    if (el instanceof HTMLSelectElement && ![...el.options].some((o) => o.value === v)) {
      el.add(new Option(v.replace('x', '×') + (k === 'resolution' ? ' (pantalla)' : ''), v), 0);
    }
    if (el) el.value = v;
  }
  for (const opt of setupForm.querySelectorAll<HTMLOptionElement>('select[name=codec] option')) {
    opt.disabled = !decodable(opt.value as EncodingType);
  }
}

function readSettings(): Record<string, string> {
  const out = Object.fromEntries(new FormData(setupForm)) as Record<string, string>;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(out));
  } catch {
    /* storage blocked */
  }
  return out;
}

function shouldDrop(payload: InputMessage): boolean {
  if ((client.inputChannelBufferedAmount ?? 0) <= INPUT_DROP_BYTES) return false;
  return payload.type === 'mouse_move' || payload.type === 'gamepad_state' || payload.type === 'gamepad_motion';
}

function renderHud(): void {
  const s = lastStats;
  const pair = s.candidatePair;
  const n = (v?: number, d = 0) => (v == null ? '-' : v.toFixed(d));
  hud.textContent =
    `${s.videoCodec ?? '?'} ${n(s.videoFps)}fps ${n((s.videoBitrateKbps ?? 0) / 1000, 1)}Mbps\n` +
    `rtt ${n(s.roundTripTimeMs)}ms  jb ${n(s.videoJitterBufferMs)}ms  dec ${n(s.videoDecodeMs, 1)}ms\n` +
    `lost ${n(s.packetsLost)}  drop ${n(s.videoFramesDropped)}  ${pair?.remoteType ?? ''}/${pair?.protocol ?? ''}`;
}

async function enterFullscreen(): Promise<void> {
  if (!document.fullscreenElement) {
    try {
      await stage.requestFullscreen({ navigationUI: 'hide' });
    } catch {
      /* user gesture missing or unsupported */
    }
  }
  // Keyboard Lock only works in fullscreen; lets Esc/Alt+Tab/Win reach the host.
  if (document.fullscreenElement) void requestKeyboardLock();
}

async function connect(): Promise<void> {
  const s = readSettings();
  const [width, height] = s.resolution.split('x').map(Number);
  const fps = Number(s.fps);
  const config: StreamConfig = {
    width,
    height,
    fps,
    encoding: s.codec as EncodingType,
    bitrateKbps: Number(s.bitrate),
    audioChannels: 2,
    audioCodec: 'opus',
    muteHostAudio: true,
    clientName: 'Browser',
    ...(appId !== undefined ? { appId } : {}),
    videoPacingMode: s.pacing as StreamConfig['videoPacingMode'],
    // 1 frame of host-side queue age: stale frames get dropped instead of adding latency.
    videoMaxFrameAgeFrames: s.pacing === 'latency' ? 1 : 3,
  };

  show('stage');
  toolbar.hidden = !isTouch;
  renderModeButton();
  say('Conectando…');
  await enterFullscreen();
  client.setAudioLatencyTargets(20, 20);
  client.setVideoLatencyTarget(0);

  try {
    await client.connect(
      config,
      {
        onRemoteStream: (stream) => {
          video.srcObject = stream;
          void video.play().catch(() => say('Toca la pantalla para activar audio'));
        },
        onConnectionState: (state) => {
          say(state);
          if (state === 'failed' || state === 'closed') void disconnect(`Conexión ${state}`);
        },
        onStats: (stats) => {
          lastStats = stats;
          if (!hud.hidden) renderHud();
        },
        onInputMessage: applyGamepadFeedback,
        onNegotiatedEncoding: (enc) => say(`Codec: ${enc}`),
        onWarning: (w) => say(w),
        onError: (e) => say(e.message, true),
      },
      { inputPriority: 'high' },
    );
  } catch (e) {
    await disconnect((e as Error).message);
    return;
  }

  const send = (payload: string | ArrayBuffer) => client.sendInput(payload);
  const detachMouseKb = attachInputCapture(stage, send, { video, shouldDrop });
  const detachTouch = attachTouch(stage, video, send, () => touchMode);
  const detachSoftKb = attachSoftKeyboard(softKb, send);
  // Liveness: the host closes the session (and restores its display) after 15 s without input traffic.
  const ping = window.setInterval(() => client.sendInput(JSON.stringify({ type: 'ping' })), 2000);
  detachInput = () => {
    window.clearInterval(ping);
    detachMouseKb();
    detachTouch();
    detachSoftKb();
  };
  // Keyboard goes to the host right away, without a first click.
  stage.focus();
}

async function disconnect(reason?: string): Promise<void> {
  detachInput?.();
  detachInput = undefined;
  releaseKeyboardLock();
  if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
  video.srcObject = null;
  await client.disconnect().catch(() => undefined);
  show('setup');
  say(reason ?? 'Desconectado', !!reason);
}

async function checkAuth(triedRefresh = false): Promise<void> {
  const res = await fetch('/api/auth/status', { credentials: 'same-origin' });
  const body = await res.json().catch(() => ({}));
  if (!body.cloud_registered) {
    show('blocked');
    say('Este servidor no está registrado en JUJO.CLOUD; el acceso por browser está deshabilitado.', true);
    return;
  }
  cloudCfg = { url: body.cloud_url, key: body.cloud_key };
  if (!body.cloud_trusted) {
    show('cloud');
    return;
  }
  if (!body.authenticated) {
    // Device already trusted: a still-valid refresh cookie avoids asking anything again.
    if (!triedRefresh && (await fetch('/api/auth/refresh', { method: 'POST', credentials: 'same-origin' })).ok) {
      return checkAuth(true);
    }
    show(body.server_password_required ? 'login' : 'cloud');
    return;
  }
  requirePassword.checked = !!body.server_password_required;
  resetSecurityEditor();
  // Guests (members / Co-Op) authenticate with the cloud trust alone and never manage security.
  const role: string | undefined = body.guest_role;
  requirePassword.closest('label')!.hidden = !!role;
  guestNote.hidden = !role;
  guestNote.textContent = role === 'viewer' ? 'Invitado: te unes a lo que se está ejecutando en este servidor.' : role ? 'Invitado con control.' : '';
  loadSettings();
  show('setup');
  await loadApps(role === 'viewer');
}

type App = { id?: string; uuid?: string; name?: string };

function icon(name: string): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#i-${name}`);
  svg.append(use);
  return svg;
}

/** Hero = Classic launcher's reading column: title, meta, art as the full-bleed backdrop. */
function selectApp(label: string, id: number | undefined, coverUrl: string | undefined, live: boolean): void {
  appId = id;
  setupTitle.textContent = label;
  heroKicker.textContent = live ? 'En curso en este equipo' : id === undefined ? 'Control remoto' : 'Listo para jugar';
  const meta = document.createElement('span');
  meta.className = live ? 'pill live' : 'pill';
  meta.textContent = live ? 'En curso' : id === undefined ? 'Escritorio de Windows' : 'Juego';
  heroMeta.replaceChildren(meta);
  playLabel.textContent = live ? 'Continuar' : id === undefined ? 'Conectar' : 'Jugar';
  backdrop.style.backgroundImage = coverUrl ? `url("${coverUrl}")` : '';
}

function appButton(label: string, id: number | undefined, coverUrl: string | undefined, live: boolean): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'poster';
  b.setAttribute('aria-pressed', String(id === appId));
  const art = document.createElement('span');
  art.className = 'art';
  if (coverUrl) art.style.backgroundImage = `url("${coverUrl}")`;
  else art.append(icon('desktop'));
  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = label;
  b.append(art, name);
  b.addEventListener('click', () => {
    for (const other of appsEl.querySelectorAll('button')) other.setAttribute('aria-pressed', String(other === b));
    selectApp(label, id, coverUrl, live);
  });
  return b;
}

/** App library (Android app_view parity). Viewers cannot launch, so they only get "join". */
async function loadApps(viewer: boolean): Promise<void> {
  appId = undefined;
  appsEl.replaceChildren();
  libraryEl.hidden = viewer;
  selectApp(viewer ? 'Unirse a la sesión' : 'Escritorio', undefined, undefined, false);
  if (viewer) {
    playLabel.textContent = 'Unirse';
    return;
  }
  const res = await fetch('/api/apps', { credentials: 'same-origin' }).catch(() => undefined);
  const body = res?.ok ? await res.json().catch(() => ({})) : {};
  const apps: App[] = Array.isArray(body.apps) ? body.apps : [];
  appsEl.append(appButton('Escritorio', undefined, undefined, false));
  for (const app of apps) {
    const id = Number(app.id);
    if (!app.name || !Number.isInteger(id) || id <= 0 || app.name === 'Desktop') continue;
    const cover = app.uuid ? `/api/apps/${encodeURIComponent(app.uuid)}/cover` : undefined;
    const live = !!app.uuid && app.uuid === body.current_app;
    appsEl.append(appButton(app.name, id, cover, live));
    if (live) appsEl.lastElementChild?.dispatchEvent(new Event('click'));
  }
}

function renderModeButton(): void {
  modeButton.replaceChildren(icon(touchMode === 'trackpad' ? 'trackpad' : 'touch'));
  modeButton.setAttribute('aria-label', touchMode === 'trackpad' ? 'Modo táctil: trackpad' : 'Modo táctil: directo');
}

$<HTMLButtonElement>('open-settings').addEventListener('click', () => settingsDialog.showModal());
$<HTMLButtonElement>('close-settings').addEventListener('click', () => settingsDialog.close());

const cloudErrors: Record<string, string> = {
  totp_required: 'Falta la verificación en dos pasos.',
  not_paired: 'Tu cuenta no está pareada con este servidor.',
  server_not_registered: 'El servidor no está registrado en JUJO.CLOUD.',
  too_many_attempts: 'Demasiados intentos; espera 15 minutos.',
};

cloudForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!cloudCfg) return;
  const data = Object.fromEntries(new FormData(cloudForm)) as Record<string, string>;
  try {
    say('Verificando…');
    pendingCloud = await signIn(cloudCfg, data.email, data.password);
    cloudForm.reset();
    say('');
    show('totp');
    (totpForm.elements.namedItem('code') as HTMLInputElement).focus();
  } catch (err) {
    say(err instanceof CloudError ? err.message : 'No se pudo contactar JUJO.CLOUD', true);
  }
});

totpForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!cloudCfg || !pendingCloud) return show('cloud');
  const code = (totpForm.elements.namedItem('code') as HTMLInputElement).value.trim();
  let aal2: string;
  try {
    aal2 = await verifyTotp(cloudCfg, pendingCloud.token, pendingCloud.factorId, code);
  } catch (err) {
    say(err instanceof CloudError ? 'Código incorrecto o vencido' : 'No se pudo contactar JUJO.CLOUD', true);
    return;
  }
  const res = await fetch('/api/auth/cloud-login', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: aal2 }),
  });
  const body = await res.json().catch(() => ({}));
  // The server keeps its own trust now; drop the browser's cloud session.
  await signOut(cloudCfg, aal2);
  pendingCloud = undefined;
  totpForm.reset();
  if (!res.ok) {
    say(cloudErrors[body.error] ?? 'JUJO.CLOUD rechazó el acceso', true);
    show('cloud');
    return;
  }
  say('');
  await checkAuth();
});

function resetSecurityEditor(): void {
  accountPasswordRow.hidden = true;
  securityApply.hidden = true;
  accountPassword.value = '';
}

async function applySecurity(require: boolean): Promise<void> {
  const res = await fetch('/api/webrtc/security', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ require_server_password: require, account_password: accountPassword.value }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    requirePassword.checked = true;
    say(body.error === 'invalid_account_password' ? 'Contraseña de la cuenta incorrecta' : cloudErrors[body.error] ?? 'No se pudo cambiar', true);
  } else {
    requirePassword.checked = !!body.server_password_required;
    say(body.server_password_required ? 'Se pedirá la contraseña del servidor' : 'Contraseña del servidor desactivada');
  }
  resetSecurityEditor();
}

requirePassword.addEventListener('change', () => {
  if (requirePassword.checked) {
    resetSecurityEditor();
    void applySecurity(true);
    return;
  }
  // Lowering security needs the account password; nothing changes until it is confirmed.
  accountPasswordRow.hidden = false;
  securityApply.hidden = false;
  accountPassword.focus();
});
securityApply.addEventListener('click', () => void applySecurity(false));

$<HTMLButtonElement>('signout').addEventListener('click', async () => {
  await fetch('/api/auth/cloud-login', { method: 'DELETE', credentials: 'same-origin' });
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
  say('Sesión cerrada');
  await checkAuth();
});

// Touch toolbar: keep its taps out of the remote-touch handler.
toolbar.addEventListener('pointerdown', (e) => e.stopPropagation());
$<HTMLButtonElement>('tb-keyboard').addEventListener('click', () => {
  if (document.activeElement === softKb) softKb.blur();
  else softKb.focus();
});
modeButton.addEventListener('click', () => {
  touchMode = touchMode === 'trackpad' ? 'direct' : 'trackpad';
  renderModeButton();
  try {
    localStorage.setItem(TOUCH_MODE_KEY, touchMode);
  } catch {
    /* storage blocked */
  }
});
$<HTMLButtonElement>('tb-stats').addEventListener('click', () => {
  hud.hidden = !hud.hidden;
  renderHud();
});
$<HTMLButtonElement>('tb-exit').addEventListener('click', () => void disconnect());

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(loginForm));
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, remember_me: true }),
  });
  if (res.status === 403) {
    say('Primero inicia sesión en JUJO.CLOUD', true);
    show('cloud');
    return;
  }
  if (!res.ok) {
    say(res.status === 429 ? 'Demasiados intentos; espera 15 minutos' : 'Usuario o contraseña incorrectos', true);
    return;
  }
  say('');
  await checkAuth();
});

setupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  void connect();
});

// Ctrl+Alt+Shift: Q = disconnect, S = stats, F = fullscreen. Captured before input forwarding.
window.addEventListener(
  'keydown',
  (e) => {
    if (!(e.ctrlKey && e.altKey && e.shiftKey) || stage.hidden) return;
    const action = { KeyQ: () => disconnect(), KeyS: () => ((hud.hidden = !hud.hidden), renderHud()), KeyF: enterFullscreen }[e.code];
    if (!action) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    void action();
  },
  true,
);

stage.addEventListener('click', () => {
  if (video.paused) void video.play();
});
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) releaseKeyboardLock();
});
window.addEventListener('jujo-unauthorized', () => {
  if (stage.hidden) void checkAuth();
});
window.addEventListener('pagehide', () => void client.disconnect({ keepalive: true }));

void checkAuth();
