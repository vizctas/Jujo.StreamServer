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
}

const TOUCH_MODE_KEY = 'jujo.webrtc.touchMode';
const INPUT_DROP_BYTES = 1024;
const BAR_HIDE_MS = 2500;
const BAR_ZONE_PX = 96; // fine pointers: moving into the top band brings the toolbar back
const EXIT_CONFIRM_MS = 3000;
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

/** Connecting layer (contract STORY 5): blurred art, poster, server, settings summary, real progress. */
function connectingLayer(opts: StreamOptions, s: StreamSettings, cancel: () => void) {
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
  const line = h('p.st-line', {}, `Conectando con ${opts.serverName}`);
  const codecChip = h('span.pill', {}, CODEC_LABEL[s.codec] ?? s.codec.toUpperCase());
  const progress = h('div.st-progress', { role: 'progressbar', 'aria-label': 'Conectando' }, h('i'));
  const cancelBtn = h<'button'>('button.btn', { type: 'button', onclick: cancel }, 'Cancelar');
  const back = h<'button'>('button.btn.primary', { type: 'button', hidden: true, onclick: () => opts.onExit() }, icon('chevron-left'), 'Volver');
  const el = h(
    'div.st-connect',
    { 'aria-live': 'polite' },
    bg,
    h(
      'div.st-body',
      {},
      art,
      h(
        'div.st-text',
        {},
        h('h1.st-title', {}, target.title),
        line,
        h('div.st-chips', {}, h('span.pill', {}, s.resolution.replace('x', '×')), h('span.pill', {}, `${s.fps} fps`), codecChip, h('span.pill', {}, mbps(s.bitrate))),
        progress,
        h('div.st-actions', {}, cancelBtn, back),
      ),
    ),
  );
  // Its taps are UI, never remote input.
  for (const t of ['pointerdown', 'pointerup']) el.addEventListener(t, (e) => e.stopPropagation());
  let revealed = false;
  return {
    el,
    cancelBtn,
    get revealed() {
      return revealed;
    },
    say: (msg: string) => (line.textContent = msg),
    codec: (enc: string) => (codecChip.textContent = CODEC_LABEL[enc.toLowerCase()] ?? enc.toUpperCase()),
    /** First frame: fade out in --t-step, then leave the DOM so no loop survives into the stream. */
    reveal() {
      if (revealed) return;
      revealed = true;
      const remove = () => el.remove();
      el.addEventListener('transitionend', (e) => e.target === el && remove());
      window.setTimeout(remove, stepMs() + 50);
      el.classList.add('out');
    },
    /** Before the first frame an error stays here, calm, with a way back. */
    fail(msg: string, raw?: string) {
      el.classList.add('failed');
      line.replaceChildren(icon('alert'), h('span', {}, msg));
      progress.replaceWith(raw ? h('details.st-tech', {}, h('summary', {}, 'Detalle técnico'), h('code', {}, raw)) : '');
      cancelBtn.hidden = true;
      back.hidden = false;
      back.focus();
    },
  };
}

export async function startStream(opts: StreamOptions): Promise<void> {
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
  let exitTimer = 0;

  const video = h<'video'>('video.st-video', { autoplay: true, playsinline: true, disablepictureinpicture: true });
  const hud = h('pre.st-hud', { hidden: true });
  const softKb = h<'input'>('input.st-softkb', { type: 'text', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', 'aria-label': 'Teclado remoto' });
  // Input capture forwards keys only while the stage has focus (fullscreen is the document, not the stage).
  const refocus = () => document.activeElement !== softKb && root.focus({ preventScroll: true });

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
  // Touch: two taps to leave (first one arms "¿Salir?" for 3 s), so a stray tap never ends the game.
  const exitLabel = h('span.st-exit-label', {}, '¿Salir?');
  const exitBtn = tool('close', 'Salir', () => {
    if (!isTouch || exitBtn.classList.contains('armed')) return void end();
    exitBtn.classList.add('armed');
    exitBtn.setAttribute('aria-label', '¿Salir? Toca otra vez para salir');
    window.clearTimeout(exitTimer);
    exitTimer = window.setTimeout(() => (exitBtn.classList.remove('armed'), exitBtn.setAttribute('aria-label', 'Salir')), EXIT_CONFIRM_MS);
  });
  exitBtn.classList.add('exit');
  exitBtn.append(exitLabel);
  const bar = h(isTouch ? 'div.st-bar.touch' : 'div.st-bar', { role: 'toolbar', 'aria-label': 'Controles de la transmisión' }, ...(isTouch ? [kbBtn, modeBtn] : []), statsBtn, exitBtn);
  // Keep toolbar taps out of the remote touch / mouse handlers.
  for (const t of ['pointerdown', 'pointerup']) bar.addEventListener(t, (e) => e.stopPropagation());

  const hideBar = () => (bar.matches(':hover, :focus-within') ? showBar() : bar.classList.add('away'));
  const showBar = () => {
    bar.classList.remove('away');
    window.clearTimeout(hideTimer);
    if (!isTouch) hideTimer = window.setTimeout(hideBar, BAR_HIDE_MS);
  };

  /** reason: Spanish message with what to do; raw: the engine's text for the technical line. */
  const end = async (reason?: string, raw?: string) => {
    if (ended) return;
    ended = true;
    ac.abort();
    window.clearTimeout(hideTimer);
    window.clearTimeout(exitTimer);
    detachInput?.();
    detachInput = undefined;
    releaseKeyboardLock();
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
    video.srcObject = null;
    await disconnectIfCurrent();
    if (reason && !layer.revealed) return layer.fail(reason, raw);
    if (!reason && layer.revealed) say('Desconectado');
    opts.onExit(reason);
  };

  const layer = connectingLayer(opts, s, () => void end());

  root.className = 'stream';
  root.tabIndex = -1;
  root.replaceChildren(video, hud, bar, softKb, layer.el);

  // Ctrl+Alt+Shift: Q = disconnect, S = stats, F = fullscreen. Registered before input capture, capture phase.
  window.addEventListener(
    'keydown',
    (e) => {
      if (!(e.ctrlKey && e.altKey && e.shiftKey)) return;
      const action = ({ KeyQ: () => end(), KeyS: toggleHud, KeyF: enterFullscreen } as Record<string, () => unknown>)[e.code];
      if (!action) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      void action();
    },
    { capture: true, signal: ac.signal },
  );
  root.addEventListener('click', () => video.paused && void video.play(), on);
  root.addEventListener('pointerup', () => layer.revealed && refocus(), on); // toolbar + layer stop theirs
  root.addEventListener('pointermove', (e) => e.pointerType === 'mouse' && e.clientY < BAR_ZONE_PX && showBar(), on);
  document.addEventListener('fullscreenchange', () => !document.fullscreenElement && releaseKeyboardLock(), on);
  window.addEventListener('pagehide', () => void client.disconnect({ keepalive: true }), on);
  video.addEventListener('playing', () => (layer.reveal(), showBar(), refocus()), { once: true, signal: ac.signal });

  await go('stream');
  layer.cancelBtn.focus({ preventScroll: true });
  await enterFullscreen();
  if (ended) return; // cancelled before the attempt: never open a session
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
          if (state === 'failed') void end(`Se perdió la conexión con ${opts.serverName}. Revisa la red y vuelve a intentarlo.`);
          else if (state === 'closed') void end(`${opts.serverName} cerró la transmisión. Vuelve a intentarlo.`);
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

