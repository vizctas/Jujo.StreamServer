// Signature surface: Hero layout (hero_theme.dart:585-809) with Classic focus tokens.
// Backdrop = the focused game's poster (sharp key art over a blurred fill) until a hero endpoint exists.
import { getLibrary, type AppInfo } from '../servers';
import { serverAvatar } from './avatar';
import { go, h, icon, reducedMotion, screenEl, type AuthState, type PlayTarget } from './shell';
import './launcher.css';

export interface LauncherOptions {
  auth: AuthState;
  /** Re-read /api/apps (after a stream: current_app changed). */
  refresh?: boolean;
  onServers(): void;
  onSettings(): void;
  onPlay(target: PlayTarget, serverName: string): void;
}

const SETTLE_MS = 200; // hero_theme.dart:229-234: the backdrop follows focus only once it rests

interface Item extends PlayTarget {
  genres: string[];
}

export async function showLauncher(opts: LauncherOptions): Promise<void> {
  const root = screenEl('launcher');
  const lib = await getLibrary(opts.refresh);
  const viewer = opts.auth.guestRole === 'viewer';
  const serverName = lib.hostName || location.hostname;

  const items: Item[] = [{ title: 'Escritorio', live: false, genres: [] }];
  for (const app of lib.apps as AppInfo[]) {
    const id = Number(app.id);
    if (!app.name || !Number.isInteger(id) || id <= 0 || app.name === 'Desktop') continue;
    items.push({
      appId: id,
      title: app.name,
      cover: app.uuid ? `/api/apps/${encodeURIComponent(app.uuid)}/cover` : undefined,
      live: !!app.uuid && app.uuid === lib.currentApp,
      genres: Array.isArray(app.genres) ? app.genres.filter((g): g is string => typeof g === 'string').slice(0, 3) : [],
    });
  }
  let selected = Math.max(0, items.findIndex((i) => i.live));

  // Backdrop: each new art fades in OVER the current one (no dip to the ground); covered layers are dropped.
  const scrim = h('div.lx-scrim');
  const backdrop = h('div.lx-backdrop', { 'aria-hidden': 'true' }, scrim);
  let shownArt: string | undefined = '\u0000';
  const paintBackdrop = (item: Item) => {
    const art = item.cover;
    if (art === shownArt) return;
    shownArt = art;
    const next = h('div.lx-layer');
    const reveal = () => {
      next.classList.add('on');
      const drop = () => {
        for (let old = next.previousElementSibling; old; old = next.previousElementSibling) old.remove();
      };
      next.addEventListener('transitionend', drop, { once: true });
      window.setTimeout(drop, 400);
    };
    if (art) {
      const key = h('img.lx-key', { src: art, alt: '', decoding: 'async' });
      key.addEventListener('load', () => requestAnimationFrame(reveal), { once: true });
      key.addEventListener('error', () => (next.replaceChildren(), next.classList.add('plain'), requestAnimationFrame(reveal)), { once: true });
      next.append(h('img.lx-fill', { src: art, alt: '', decoding: 'async' }), key);
    } else {
      next.classList.add('plain');
      requestAnimationFrame(reveal);
    }
    backdrop.insertBefore(next, scrim);
  };

  const title = h('h1.lx-title');
  const meta = h('div.lx-meta');
  const playLabel = h('span');
  // A viewer joins whatever runs: never send an appId (legacy parity).
  const target = () => (viewer ? { ...items[selected], appId: undefined } : items[selected]);
  const play = h('button.btn.primary.lx-play', { type: 'button', onclick: () => opts.onPlay(target(), serverName) }, icon('play'), playLabel);

  const renderHero = (item: Item) => {
    title.textContent = viewer && !item.live ? 'Unirse a la sesión' : item.title;
    const chips: HTMLElement[] = [];
    if (viewer) chips.push(h('span.pill.role', {}, 'Invitado: solo ver'));
    if (item.live) chips.push(h('span.pill.live', {}, 'En curso'));
    else if (item.appId === undefined) chips.push(h('span.pill', {}, 'Escritorio remoto'));
    for (const g of item.genres) chips.push(h('span.pill', {}, g));
    meta.replaceChildren(...chips);
    playLabel.textContent = viewer ? 'Unirse' : item.live ? 'Continuar' : item.appId === undefined ? 'Conectar' : 'Jugar';
  };

  // Poster row (Classic): focus or hover = scale 1.06 + 3 px ring with 2 px gap, 130 ms.
  const row = h('div.lx-posters', { role: 'list', 'aria-label': 'Juegos' });
  let settle = 0;
  const select = (i: number, { scroll = true, immediate = false } = {}) => {
    selected = i;
    for (const [j, b] of [...row.children].entries()) {
      b.firstElementChild!.setAttribute('aria-current', String(j === i));
      b.firstElementChild!.setAttribute('tabindex', j === i ? '0' : '-1');
    }
    renderHero(items[i]);
    window.clearTimeout(settle);
    if (immediate) paintBackdrop(items[i]);
    else settle = window.setTimeout(() => paintBackdrop(items[i]), SETTLE_MS);
    if (scroll) row.children[i]?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
  };

  items.forEach((item, i) => {
    const art = h('span.lx-cover');
    if (item.cover) {
      const img = h('img', { src: item.cover, alt: '', loading: i < 8 ? 'eager' : 'lazy', decoding: 'async' });
      img.addEventListener('load', () => art.classList.add('loaded'), { once: true });
      img.addEventListener('error', () => art.replaceChildren(titleCard(item.title)), { once: true });
      art.append(img);
    } else {
      art.classList.add('desk');
      art.append(icon('desktop'), h('span.lx-desk-label', {}, item.title));
    }
    if (item.live) art.append(h('span.lx-live', { 'aria-hidden': 'true' }));
    const btn = h(
      'button.lx-poster',
      {
        type: 'button',
        'aria-label': item.live ? `${item.title}, en curso` : item.title,
        onclick: () => (selected === i ? play.click() : select(i)),
        onfocus: () => selected !== i && select(i, { scroll: false }),
      },
      art,
    );
    row.append(h('div', { role: 'listitem' }, btn));
  });

  // Mouse wheels scroll the row sideways (it has no visible scrollbar).
  row.addEventListener(
    'wheel',
    (ev) => {
      const e = ev as WheelEvent;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      row.scrollLeft += e.deltaY;
      e.preventDefault();
    },
    { passive: false },
  );

  row.addEventListener('keydown', (ev) => {
    const e = ev as KeyboardEvent;
    const step = ({ ArrowRight: 1, ArrowLeft: -1, Home: -Infinity, End: Infinity } as Record<string, number>)[e.key];
    if (step === undefined) return;
    e.preventDefault();
    const i = Math.min(items.length - 1, Math.max(0, selected + step));
    (row.children[i].firstElementChild as HTMLElement).focus();
    select(i);
  });

  const avatar = h('span.lx-avatar', {}, serverAvatar(serverName));
  const seal = h(
    'button.lx-seal',
    { type: 'button', onclick: opts.onServers, 'aria-label': `${serverName}. Cambiar de servidor` },
    avatar,
    h('span.lx-server', {}, h('span.lx-server-name', {}, serverName), h('span.lx-server-hint', {}, 'Tus servidores')),
    icon('chevron-right'),
  );

  root.className = viewer ? 'launcher viewer' : 'launcher';
  root.onkeydown = (e) => {
    if (e.key === 'Escape' && !document.querySelector('dialog[open]')) opts.onServers();
  };
  root.replaceChildren(
    backdrop,
    h('header.lx-top', {}, seal, h('button.iconbtn', { type: 'button', 'aria-label': 'Ajustes', onclick: opts.onSettings }, icon('gear'))),
    h('main.lx-hero', {}, title, meta, h('div.lx-actions', {}, play)),
    ...(viewer ? [] : [h('section.lx-row', {}, row)]),
  );
  select(selected, { scroll: false, immediate: true });
  await go('launcher');
  // Keyboard/gamepad land on the selected poster (it already wears the focus look); no ring flash for pointers.
  const first = viewer ? play : (row.children[selected]?.firstElementChild as HTMLElement);
  first.focus({ preventScroll: true, focusVisible: false } as FocusOptions);
  if (!viewer) row.children[selected]?.scrollIntoView({ inline: 'center', block: 'nearest' });
}

/** Designed fallback when a poster fails: the title on a Sunset card, never a broken box. */
function titleCard(name: string): HTMLElement {
  return h('span.lx-titlecard', {}, icon('hexagon'), h('span', {}, name));
}
