// Stream: designed connecting layer, then the video stage with its overlay toolbar and HUD.
import { WebRtcHttpApi } from '../api';
import { WebRtcClient } from '../client';
import { applyGamepadFeedback, attachInputCapture, releaseKeyboardLock, requestKeyboardLock } from '../input';
import { attachSoftKeyboard, attachTouch, type TouchMode } from '../touch';
import type { EncodingType, InputMessage, StreamConfig, WebRtcStatsSnapshot } from '../types';
import { streamSettings, type StreamSettings } from './settings';
import { go, h, icon, isTouch, say, screenEl, type PlayTarget } from './shell';
import './stream.css';

export interface StreamOptions {
  target: PlayTarget;
  serverName: string;
  /** Back to the launcher; reason = an error to show (undefined = the user left). */
  onExit(reason?: string): void;
  /** auth.guestRole: 'viewer' cannot close the running game. */
  guestRole?: string;
}

/** Internal: a reconnect attempt (quiet layer, its one automatic retry already spent). */
interface Attempt extends StreamOptions {
  reconnect?: boolean;
}

const TOUCH_MODE_KEY = 'jujo.webrtc.touchMode';
const INPUT_DROP_BYTES = 1024;
const BAR_HIDE_MS = 2500;
const BAR_ZONE_PX = 96; // fine pointers: moving into the top band brings the toolbar back
const DISCONNECTED_GRACE_MS = 3000; // 'disconnected' often heals by itself; 'failed' never does
const CODEC_LABEL: Record<string, string> = { h264: 'H.264', hevc: 'HEVC', h265: 'HEVC', av1: 'AV1' };

const RETRY = 'No se pudo iniciar la transmisión. Vuelve a intentarlo.';
const CODEC_FAIL = 'Este navegador no puede decodificar el códec elegido. Cambia el códec en Ajustes y vuelve a intentarlo.';
/** Engine errors are English and technical: the user gets Spanish with a way forward. */
function errorText(raw: string): string {
  if (/codec|SDP|HDR requires/i.test(raw)) return CODEC_FAIL;
  if (/answer|offer/i.test(raw)) return 'El servidor no respondió a tiempo. Vuelve a intentarlo.';
  return RETRY;
}
function warningText(raw: string): string | undefined {
  if (/^AV1 is selected/.test(raw)) return 'Puede que este navegador no decodifique AV1. Si la pantalla queda negra, cambia a HEVC o H.264.';
  if (/^HDR is enabled/.test(raw)) return 'Puede que el HDR no funcione en este navegador. Si la pantalla queda negra, desactívalo o cambia el códec.';
  const fallback = /trying (AV1|HEVC)|falling back to (?:SDR )?(H\.264)/.exec(raw);
  if (fallback) return `El códec elegido no se pudo negociar; se intenta con ${fallback[1] ?? fallback[2]}.`;
  return undefined; // unknown engine warning: console only
}

const client = new WebRtcClient(new WebRtcHttpApi());
let latestSession = 0; // the client is shared: a stale attempt must never disconnect a newer one

function readTouchMode(): TouchMode {
  try {
    return localStorage.getItem(TOUCH_MODE_KEY) === 'direct' ? 'direct' : 'trackpad';
  } catch {
    return 'trackpad';
  }
}

function shouldDrop(payload: InputMessage): boolean {
  if ((client.inputChannelBufferedAmount ?? 0) <= INPUT_DROP_BYTES) return false;
  return payload.type === 'mouse_move' || payload.type === 'gamepad_state' || payload.type === 'gamepad_motion';
}

async function enterFullscreen(): Promise<void> {
  if (!document.fullscreenElement) {
    try {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    } catch {
      /* user gesture missing or unsupported */
    }
  }
  // Keyboard Lock only works in fullscreen; lets Esc/Alt+Tab/Win reach the host.
  if (document.fullscreenElement) void requestKeyboardLock();
}

const mbps = (kbps: string) => `${(Number(kbps) / 1000).toLocaleString('es', { maximumFractionDigits: 1 })} Mbps`;
const stepMs = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--t-step')) || 280;

/** Connecting layer (contract STORY 5): blurred art, poster, server, settings summary, real progress.
 *  Quiet variant (reconnect): only the line, the progress and Cancelar over a scrim. */
function connectingLayer(opts: Attempt, s: StreamSettings, cancel: () => void, retry: () => void) {
  const { target } = opts;
  const bg = h('div.st-bg', { 'aria-hidden': 'true' });
  const art = h(target.appId === undefined ? 'div.st-art.desk' : 'div.st-art');
  const titleCard = () => h('span.st-titlecard', {}, icon('hexagon'), h('span', {}, target.title));
  if (target.appId === undefined) {
    art.append(icon('desktop'));
  } else if (target.cover) {
    const img = h('img', { src: target.cover, alt: '', decoding: 'async' });
    img.addEventListener('load', () => (art.classList.add('loaded'), bg.append(h('img', { src: target.cover!, alt: '' }))), { once: true });
    img.addEventListener('error', () => art.replaceChildren(titleCard()), { once: true });
    art.append(img);
  } else {
    art.append(titleCard());
  }
  const title = h('h1.st-title', {}, target.title);
  const line = h('p.st-line', {}, opts.reconnect ? `Reconectando con ${opts.serverName}…` : `Conectando con ${opts.serverName}`);
  const codec = h('span', {}, CODEC_LABEL[s.codec] ?? s.codec.toUpperCase());
  const meta = h('p.st-meta', {}, `${s.resolution.replace('x', '×')} · ${s.fps} fps · `, codec, ` · ${mbps(s.bitrate)}`);
  const progress = h('div.st-progress', { role: 'progressbar', 'aria-label': 'Conectando' }, h('i'));
  const cancelBtn = h<'button'>('button.btn', { type: 'button', onclick: cancel }, 'Cancelar');
  const retryBtn = h<'button'>('button.btn.primary', { type: 'button', hidden: true, onclick: retry }, icon('refresh'), 'Reintentar');
  const back = h<'button'>('button.btn', { type: 'button', hidden: true, onclick: () => opts.onExit() }, 'Volver');
  const mark = h('span.st-failmark', { hidden: true, 'aria-hidden': 'true' }, icon('alert'));
  const el = h(
    opts.reconnect ? 'div.st-connect.quiet' : 'div.st-connect',
    { 'aria-live': 'polite' },
    bg,
    h('div.st-body', {}, art, h('div.st-text', {}, mark, title, line, meta, progress, h('div.st-actions', {}, cancelBtn, retryBtn, back))),
  );
  // Its taps are UI, never remote input.
  for (const t of ['pointerdown', 'pointerup', 'pointermove', 'wheel', 'contextmenu']) el.addEventListener(t, (e) => e.stopPropagation());
  let revealed = false;
  return {
    el,
    cancelBtn,
    get revealed() {
      return revealed;
    },
    say: (msg: string) => (line.textContent = msg),
    codec: (enc: string) => (codec.textContent = CODEC_LABEL[enc.toLowerCase()] ?? enc.toUpperCase()),
    /** First frame: fade out in --t-step, then leave the DOM so no loop survives into the stream. */
    reveal() {
      if (revealed) return;
      revealed = true;
      const remove = () => !el.classList.contains('failed') && el.remove();
      el.addEventListener('transitionend', (e) => e.target === el && remove());
      window.setTimeout(remove, stepMs() + 50);
      el.classList.add('out');
    },
    /** Failure screen: its own weight (mark, title, reason, Reintentar first), never a connecting look-alike. */
    fail(root: HTMLElement, msg: string, raw?: string) {
      el.classList.remove('out', 'quiet');
      el.classList.add('failed');
      if (!el.isConnected) root.append(el);
      mark.hidden = false;
      title.textContent = 'No se pudo conectar';
      line.textContent = msg;
      meta.textContent = `${target.title} · ${opts.serverName}`;
      progress.replaceWith(raw ? h('details.st-tech', {}, h('summary', {}, 'Detalle técnico'), h('code', {}, raw)) : '');
      cancelBtn.hidden = true;
      retryBtn.hidden = back.hidden = false;
      retryBtn.focus({ preventScroll: true });
    },
  };
}

export function startStream(opts: StreamOptions): Promise<void> {
  return attempt(opts);
}

async function attempt(opts: Attempt): Promise<void> {
  const s = streamSettings();
  const [width, height] = s.resolution.split('x').map(Number);
  const config: StreamConfig = {
    width,
    height,
    fps: Number(s.fps),
    encoding: s.codec as EncodingType,
    bitrateKbps: Number(s.bitrate),
    audioChannels: 2,
    audioCodec: 'opus',
    muteHostAudio: true,
    clientName: 'Browser',
    ...(opts.target.appId !== undefined ? { appId: opts.target.appId } : {}),
    videoPacingMode: s.pacing as StreamConfig['videoPacingMode'],
    // 1 frame of host-side queue age: stale frames get dropped instead of adding latency.
    videoMaxFrameAgeFrames: s.pacing === 'latency' ? 1 : 3,
  };

  const root = screenEl('stream');
  const session = ++latestSession;
  const disconnectIfCurrent = () => (session === latestSession ? client.disconnect().catch(() => undefined) : undefined);
  const ac = new AbortController(); // every listener of this session goes with it
  const on = { signal: ac.signal };
  let ended = false;
  let detachInput: (() => void) | undefined;
  let lastStats: WebRtcStatsSnapshot = {};
  let touchMode = readTouchMode();
  let hideTimer = 0;
  let graceTimer = 0;
  let wake: WakeLockSentinel | undefined;

  const video = h<'video'>('video.st-video', { autoplay: true, playsinline: true, disablepictureinpicture: true });
  const hud = h('pre.st-hud', { hidden: true });
  const softKb = h<'input'>('input.st-softkb', { type: 'text', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', 'aria-label': 'Teclado remoto' });
  const reconnecting = h('div.st-reconnect', { hidden: true, role: 'status' }, h('p', {}, 'Reconectando…'), h('div.st-progress', { 'aria-hidden': 'true' }, h('i')));
  // Input capture forwards keys only while the stage has focus (fullscreen is the document, not the stage).
  const refocus = () => document.activeElement !== softKb && root.focus({ preventScroll: true });
  // Keep the screen on while streaming; the lock drops when the tab hides, so it is taken again on return.
  const lockWake = async () => {
    try {
      if (!ended && document.visibilityState === 'visible') wake = await navigator.wakeLock?.request('screen');
    } catch {
      /* unsupported or refused */
    }
  };

  const renderHud = () => {
    const st = lastStats;
    const pair = st.candidatePair;
    const n = (v?: number, d = 0) => (v == null ? '—' : v.toFixed(d)); // no sample yet: a dash, never "?" or "-fps"
    const route = pair?.remoteType ? `${pair.remoteType}/${pair.protocol ?? '—'}` : '—';
    hud.textContent =
      `${st.videoCodec ?? '—'}  ${n(st.videoFps)} fps  ${n(st.videoBitrateKbps == null ? undefined : st.videoBitrateKbps / 1000, 1)} Mbps\n` +
      `rtt ${n(st.roundTripTimeMs)} ms  jb ${n(st.videoJitterBufferMs)} ms  dec ${n(st.videoDecodeMs, 1)} ms\n` +
      `lost ${n(st.packetsLost)}  drop ${n(st.videoFramesDropped)}  ${route}`;
  };
  const toggleHud = () => {
    hud.hidden = !hud.hidden;
    statsBtn.setAttribute('aria-pressed', String(!hud.hidden));
    renderHud();
  };

  // Toolbar: touch = always there; fine pointer = hides after 2.5 s, returns at the top edge.
  const tool = (name: string, label: string, onclick: () => void, keepFocus = false) =>
    h<'button'>('button.st-tool', { type: 'button', 'aria-label': label, title: label, onclick: () => (onclick(), keepFocus || refocus()) }, icon(name));
  let kbWasOpen = false;
  const kbBtn = tool(
    'keyboard',
    'Teclado',
    () => {
      if (kbWasOpen) root.focus({ preventScroll: true });
      else softKb.focus();
      kbWasOpen = false;
    },
    true,
  );
  kbBtn.addEventListener('pointerdown', () => (kbWasOpen = document.activeElement === softKb));
  const modeBtn = tool('trackpad', '', () => {
    touchMode = touchMode === 'trackpad' ? 'direct' : 'trackpad';
    renderMode();
    try {
      localStorage.setItem(TOUCH_MODE_KEY, touchMode);
    } catch {
      /* storage blocked */
    }
  });
  const renderMode = () => {
    const label = touchMode === 'trackpad' ? 'Modo táctil: trackpad' : 'Modo táctil: directo';
    modeBtn.replaceChildren(icon(touchMode === 'trackpad' ? 'trackpad' : 'touch'));
    modeBtn.setAttribute('aria-label', label);
    modeBtn.title = label;
  };
  renderMode();
  const statsBtn = tool('stats', 'Estadísticas', toggleHud);
  statsBtn.setAttribute('aria-pressed', 'false');
  const exitBtn = tool('close', 'Salir', () => openExit(), true);
  exitBtn.classList.add('exit');
  const bar = h(isTouch ? 'div.st-bar.touch' : 'div.st-bar', { role: 'toolbar', 'aria-label': 'Controles de la transmisión' }, ...(isTouch ? [kbBtn, modeBtn] : []), statsBtn, exitBtn);
  // Keep toolbar taps out of the remote touch / mouse handlers.
  for (const t of ['pointerdown', 'pointerup']) bar.addEventListener(t, (e) => e.stopPropagation());

  // Exit choice (Android parity): leave the game running, close it, or keep playing. A UI layer: while open,
  // focus sits in it (keys are not forwarded) and its pointer events never reach the remote handlers.
  const exitStatus = h('p.st-exit-status', { role: 'alert' });
  const keepPlaying = h<'button'>('button.btn.ghost', { type: 'button', onclick: () => closeExit() }, 'Seguir jugando');
  const closeGame = h<'button'>(
    'button.btn.st-exit-close',
    {
      type: 'button',
      hidden: opts.guestRole === 'viewer',
      onclick: async () => {
        closeGame.disabled = true;
        exitStatus.textContent = '';
        const ok = await fetch('/api/apps/close', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{}' })
          .then((r) => r.ok)
          .catch(() => false);
        closeGame.disabled = false;
        if (ok) void end();
        else exitStatus.textContent = 'No se pudo cerrar el juego. Vuelve a intentarlo.';
      },
    },
    'Cerrar juego y desconectar',
  );
  const exitSheet = h(
    'div.st-exit',
    { hidden: true, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'st-exit-title' },
    h(
      'div.st-exit-card',
      {},
      h('h2', { id: 'st-exit-title' }, 'Salir de la sesión'),
      h('p.st-exit-text', {}, `Si solo te desconectas, ${opts.target.title} sigue abierto en ${opts.serverName}.`),
      exitStatus,
      h('div.st-exit-actions', {}, h('button.btn.primary', { type: 'button', onclick: () => void end() }, 'Desconectar'), closeGame, keepPlaying),
    ),
  );
  for (const t of ['pointerdown', 'pointerup', 'pointermove', 'wheel', 'contextmenu']) exitSheet.addEventListener(t, (e) => e.stopPropagation());
  exitSheet.addEventListener('click', (e) => (e.stopPropagation(), e.target === exitSheet && closeExit()));
  exitSheet.addEventListener('keydown', (e) => (e as KeyboardEvent).key === 'Escape' && (e.preventDefault(), closeExit()));
  const openExit = () => {
    if (!layer.revealed) return void end(); // still connecting: leaving is just cancelling
    exitStatus.textContent = '';
    exitSheet.hidden = false;
    bar.inert = true;
    keepPlaying.focus({ preventScroll: true });
  };
  const closeExit = () => {
    exitSheet.hidden = true;
    bar.inert = false;
    root.focus({ preventScroll: true });
  };

  const hideBar = () => (bar.matches(':hover, :focus-within') ? showBar() : bar.classList.add('away'));
  const showBar = () => {
    bar.classList.remove('away');
    window.clearTimeout(hideTimer);
    if (!isTouch) hideTimer = window.setTimeout(hideBar, BAR_HIDE_MS);
  };

  /** reason: Spanish message with what to do (shows the failure screen); raw: the engine's text.
   *  keepScreen: a reconnect follows, so fullscreen and keyboard lock stay (no gesture to get them back). */
  const end = async (reason?: string, raw?: string, keepScreen = false) => {
    if (ended) return;
    ended = true;
    ac.abort();
    window.clearTimeout(hideTimer);
    window.clearTimeout(graceTimer);
    void wake?.release().catch(() => undefined);
    detachInput?.();
    detachInput = undefined;
    if (!keepScreen) {
      releaseKeyboardLock();
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
    }
    video.srcObject = null;
    await disconnectIfCurrent();
    if (keepScreen) return;
    if (reason) {
      bar.hidden = hud.hidden = reconnecting.hidden = exitSheet.hidden = true;
      return layer.fail(root, reason, raw);
    }
    if (layer.revealed) say('Desconectado');
    opts.onExit();
  };

  /** Mid-stream loss: one automatic reconnect of the same target; a failed reconnect shows the failure screen. */
  const recover = async (reason: string) => {
    if (ended) return;
    // A reconnect already spent the retry, and a hidden tab cannot be watched: show Reintentar instead.
    if (opts.reconnect || document.visibilityState !== 'visible') return void end(reason);
    await end(undefined, undefined, true);
    if (session === latestSession) void attempt({ ...opts, reconnect: true });
  };

  const layer = connectingLayer(
    opts,
    s,
    () => void end(),
    () => void startStream({ target: opts.target, serverName: opts.serverName, onExit: opts.onExit, guestRole: opts.guestRole }),
  );

  root.className = 'stream';
  root.tabIndex = -1;
  root.replaceChildren(video, hud, bar, softKb, reconnecting, exitSheet, layer.el);

  // Ctrl+Alt+Shift: Q = exit choice, S = stats, F = fullscreen. Registered before input capture, capture phase.
  window.addEventListener(
    'keydown',
    (e) => {
      if (!(e.ctrlKey && e.altKey && e.shiftKey)) return;
      const action = ({ KeyQ: () => (exitSheet.hidden ? openExit() : closeExit()), KeyS: toggleHud, KeyF: enterFullscreen } as Record<string, () => unknown>)[e.code];
      if (!action) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      void action();
    },
    { capture: true, signal: ac.signal },
  );
  root.addEventListener('click', () => video.paused && void video.play(), on);
  root.addEventListener('pointerup', () => layer.revealed && refocus(), on); // toolbar + layers stop theirs
  root.addEventListener('pointermove', (e) => e.pointerType === 'mouse' && e.clientY < BAR_ZONE_PX && showBar(), on);
  document.addEventListener('fullscreenchange', () => !document.fullscreenElement && releaseKeyboardLock(), on);
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.visibilityState !== 'visible') return;
      void lockWake();
      // The session died while the tab was away: offer Reintentar instead of a frozen frame.
      const st = client.connectionState;
      if (layer.revealed && (!st || st === 'failed' || st === 'closed')) void end(`Se perdió la conexión con ${opts.serverName}. Vuelve a intentarlo.`);
    },
    on,
  );
  window.addEventListener('pagehide', () => void client.disconnect({ keepalive: true }), on);
  video.addEventListener('playing', () => (layer.reveal(), showBar(), refocus()), { once: true, signal: ac.signal });

  await go('stream');
  layer.cancelBtn.focus({ preventScroll: true });
  await enterFullscreen();
  if (ended) return; // cancelled before the attempt: never open a session
  void lockWake();
  client.setAudioLatencyTargets(20, 20);
  client.setVideoLatencyTarget(0);

  try {
    await client.connect(
      config,
      {
        onRemoteStream: (stream) => {
          video.srcObject = stream;
          void video.play().catch(() => {
            say('Toca la pantalla para activar el audio.');
            layer.say('Toca la pantalla para empezar');
          });
        },
        onConnectionState: (state) => {
          if (ended) return;
          const lost = `Se perdió la conexión con ${opts.serverName}. Revisa la red y vuelve a intentarlo.`;
          if (state === 'connected') {
            window.clearTimeout(graceTimer);
            reconnecting.hidden = true;
          } else if (!layer.revealed) {
            if (state === 'failed') void end(lost);
            else if (state === 'closed') void end(`${opts.serverName} cerró la transmisión. Vuelve a intentarlo.`);
          } else if (state === 'disconnected') {
            reconnecting.hidden = false;
            window.clearTimeout(graceTimer);
            graceTimer = window.setTimeout(() => void recover(lost), DISCONNECTED_GRACE_MS);
          } else if (state === 'failed') {
            reconnecting.hidden = false;
            void recover(lost);
          } else if (state === 'closed') {
            void end(`${opts.serverName} cerró la transmisión. Vuelve a intentarlo.`);
          }
        },
        onStats: (stats) => {
          lastStats = stats;
          if (!hud.hidden) renderHud();
        },
        onInputMessage: applyGamepadFeedback,
        onNegotiatedEncoding: (enc) => layer.codec(enc),
        onWarning: (w) => {
          const text = warningText(w);
          if (text) say(text);
        },
        // Before the first frame the layer shows it; after it, a failure ends the stream with its own message.
        onError: (e) => layer.revealed && say(errorText(e.message), true),
      },
      { inputPriority: 'high' },
    );
  } catch (e) {
    const raw = (e as Error).message || '';
    await end(errorText(raw), raw);
    return;
  }
  if (ended) {
    // Cancelled while connecting: the session the attempt just opened must not outlive it.
    await disconnectIfCurrent();
    return;
  }

  const send = (payload: string | ArrayBuffer) => client.sendInput(payload);
  const detachMouseKb = attachInputCapture(root, send, { video, shouldDrop });
  const detachTouch = attachTouch(root, video, send, () => touchMode);
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
  root.focus({ preventScroll: true });
}
