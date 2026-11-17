// Foundation shared by every screen: auth state, screen switching, element/icon helpers, status pill.
import type { CloudConfig } from '../cloud';
import './tokens.css';

export type Screen = 'signin' | 'focus' | 'launcher' | 'stream';

export interface AuthState {
  cloudRegistered: boolean;
  cloudTrusted: boolean;
  authenticated: boolean;
  serverPasswordRequired: boolean;
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
