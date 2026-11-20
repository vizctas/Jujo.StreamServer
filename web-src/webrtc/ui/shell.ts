// Foundation shared by every screen: auth state, screen switching, element/icon helpers, status pill.
import type { CloudConfig } from '../cloud';
import './tokens.css';

export type Screen = 'signin' | 'focus' | 'launcher' | 'stream';

export interface AuthState {
  cloudRegistered: boolean;
  cloudTrusted: boolean;
  authenticated: boolean;
  serverPasswordRequired: boolean;
  /** This server's configured name (sunshine_name); empty when unset. */
  serverName?: string;
  /** members / Co-Op guests; undefined = the owner (admin). 'viewer' only joins what runs. */
  guestRole?: string;
  cloud?: CloudConfig;
}

/** What the launcher hands to the stream. appId undefined = desktop / whatever is running. */
export interface PlayTarget {
  appId?: number;
  title: string;
  cover?: string;
  live: boolean;
}

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isTouch = navigator.maxTouchPoints > 0;

export async function fetchAuth(): Promise<AuthState> {
  const res = await fetch('/api/auth/status', { credentials: 'same-origin' });
  const b = await res.json().catch(() => ({}));
  return {
    cloudRegistered: !!b.cloud_registered,
    cloudTrusted: !!b.cloud_trusted,
    authenticated: !!b.authenticated,
    serverPasswordRequired: !!b.server_password_required,
    serverName: b.server_name || undefined,
    guestRole: b.guest_role || undefined,
    cloud: b.cloud_url ? { url: b.cloud_url, key: b.cloud_key } : undefined,
  };
}

export function screenEl(name: Screen): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-screen="${name}"]`)!;
}

let current: Screen | undefined;
export const currentScreen = () => current;

/** Show one screen. Hidden screens are display:none, so their loops (gradient, waves) stop. */
export function go(name: Screen, update?: () => void): Promise<void> {
  const swap = () => {
    update?.();
    for (const el of document.querySelectorAll<HTMLElement>('[data-screen]')) el.hidden = el.dataset.screen !== name;
    current = name;
  };
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };
  // The stream never waits on a transition: it owns the GPU from its first frame.
  if (!doc.startViewTransition || current === undefined || name === 'stream' || current === 'stream') {
    swap();
    return Promise.resolve();
  }
  return doc.startViewTransition(swap).finished.catch(() => undefined);
}

type Attrs = Record<string, string | number | boolean | undefined | ((e: Event) => void)>;
/** h('button.btn.primary', { type: 'button', onclick: fn }, 'Jugar') */
export function h<K extends keyof HTMLElementTagNameMap>(tag: `${K}${string}`, attrs: Attrs = {}, ...kids: (Node | string | false | undefined)[]): HTMLElementTagNameMap[K] {
  const [name, ...classes] = tag.split('.');
  const el = document.createElement(name as K);
  if (classes.length) el.className = classes.join(' ');
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue;
    if (typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, String(v));
  }
  for (const kid of kids) if (kid) el.append(kid);
  return el;
}

/** Icon from the sprite in index.html (#i-<name>). */
export function icon(name: string): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#i-${name}`);
  svg.append(use);
  return svg;
}

/** "JUJO.Stream" wordmark with the hexagon. */
export function brand(): HTMLElement {
  return h('span.brand', {}, icon('hexagon'), h('span', {}, 'JUJO', h('b', {}, '.Stream')));
}

let sayTimer = 0;
export function say(msg: string, isError = false, holdMs = isError ? 12000 : 3500): void {
  const el = document.getElementById('status')!;
  window.clearTimeout(sayTimer);
  el.textContent = msg;
  el.classList.toggle('error', isError);
  if (msg) sayTimer = window.setTimeout(() => (el.textContent = ''), holdMs);
}

export function storage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function store(key: string, value: unknown): void {
  try {
    if (value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage blocked */
  }
}

// ── Gamepad navigation outside the stream (Android TV parity) ───────────────────────────────
// D-pad / left stick -> Arrow keys, A -> Enter (activates), B -> Escape (closes dialogs / goes back).
// Screens handle the keys they care about; unhandled arrows fall back to spatial focus movement.
const FOCUSABLE = 'button:not([disabled]):not([tabindex="-1"]), [href], input:not([disabled]), select, [tabindex="0"]';

function visible(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
}

function moveFocusSpatially(key: string): void {
  const from = document.activeElement as HTMLElement | null;
  const scope: ParentNode = document.querySelector('dialog[open]') ?? (current ? screenEl(current) : document);
  const all = [...scope.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(visible);
  if (!from || !all.includes(from)) return all[0]?.focus();
  const a = from.getBoundingClientRect();
  const ax = a.left + a.width / 2;
  const ay = a.top + a.height / 2;
  let best: HTMLElement | undefined;
  let bestScore = Infinity;
  for (const el of all) {
    if (el === from) continue;
    const b = el.getBoundingClientRect();
    const dx = b.left + b.width / 2 - ax;
    const dy = b.top + b.height / 2 - ay;
    const along = { ArrowRight: dx, ArrowLeft: -dx, ArrowDown: dy, ArrowUp: -dy }[key] ?? 0;
    if (along <= 4) continue;
    const across = key === 'ArrowLeft' || key === 'ArrowRight' ? Math.abs(dy) : Math.abs(dx);
    const score = along + across * 2.5;
    if (score < bestScore) (bestScore = score), (best = el);
  }
  best?.focus();
  best?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function pressKey(key: string): void {
  const target = (document.activeElement as HTMLElement | null) ?? document.body;
  const ev = new KeyboardEvent('keydown', { key, code: key, bubbles: true, cancelable: true });
  const handled = !target.dispatchEvent(ev);
  if (key === 'Enter' && !handled) target.click();
  else if (key === 'Escape' && !handled) document.querySelector<HTMLDialogElement>('dialog[open]')?.close();
  else if (key.startsWith('Arrow') && !handled) moveFocusSpatially(key);
}

export function startGamepadNav(): void {
  if (!('getGamepads' in navigator)) return;
  const held = new Map<string, number>(); // key -> next repeat time
  let raf = 0;
  const tick = (t: number) => {
    raf = 0;
    const pads = navigator.getGamepads().filter((p): p is Gamepad => !!p);
    if (!pads.length) return;
    if (current !== 'stream') {
      const down = new Set<string>();
      for (const p of pads) {
        const b = (i: number) => !!p.buttons[i]?.pressed;
        const [x = 0, y = 0] = p.axes;
        if (b(12) || y < -0.6) down.add('ArrowUp');
        if (b(13) || y > 0.6) down.add('ArrowDown');
        if (b(14) || x < -0.6) down.add('ArrowLeft');
        if (b(15) || x > 0.6) down.add('ArrowRight');
        if (b(0)) down.add('Enter');
        if (b(1)) down.add('Escape');
      }
      for (const key of [...held.keys()]) if (!down.has(key)) held.delete(key);
      for (const key of down) {
        const next = held.get(key);
        if (next === undefined) {
          pressKey(key);
          held.set(key, t + 380);
        } else if (key.startsWith('Arrow') && t >= next) {
          pressKey(key);
          held.set(key, t + 120);
        }
      }
    } else {
      held.clear();
    }
    raf = requestAnimationFrame(tick);
  };
  const start = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };
  window.addEventListener('gamepadconnected', start);
  start();
}

/** Close the host's running game. The /api/webrtc alias passes proxies that forward only the WebRTC
 *  surface; servers older than the alias answer 404 there, so fall back to the legacy route. */
export async function closeRunningApp(): Promise<boolean> {
  const post = (url: string) =>
    fetch(url, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => undefined);
  const res = await post('/api/webrtc/sessions/close-app');
  return !!(res?.status === 404 ? await post('/api/apps/close') : res)?.ok;
}
