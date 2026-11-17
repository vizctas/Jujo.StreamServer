// Signature surface: Hero layout (hero_theme.dart:585-809) with Classic focus tokens.
// Backdrop = the game's landscape hero art (server cache), the poster treatment when there is none.
// Tapping a game opens its actions (Jugar / Continuar / Cerrar juego / Ver detalles), as on Android.
import { getLibrary, type AppInfo } from '../servers';
import { serverAvatar } from './avatar';
import { go, h, icon, reducedMotion, say, screenEl, type AuthState, type PlayTarget } from './shell';
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
  hero?: string;
  description?: string;
  credits?: string;
}

/** Short revision of an app's art sources: art URLs change when the art does, so no browser or
 *  proxy keeps serving a stale image (an earlier build let a placeholder be cached for a day). */
function artRev(app: AppInfo): string {
  let x = 2166136261;
  for (const c of `${app['image-path'] ?? ''}|${app['image-path-hires'] ?? ''}|${app['hero-image-path'] ?? ''}|2`) x = Math.imul(x ^ c.charCodeAt(0), 16777619);
  return (x >>> 0).toString(36);
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
      cover: app.uuid ? `/api/apps/${encodeURIComponent(app.uuid)}/cover?r=${artRev(app)}` : undefined,
      hero: app.uuid ? `/api/apps/${encodeURIComponent(app.uuid)}/hero?r=${artRev(app)}` : undefined,
      live: !!app.uuid && app.uuid === lib.currentApp,
      genres: Array.isArray(app.genres) ? app.genres.filter((g): g is string => typeof g === 'string') : [],
      description: typeof app.description === 'string' ? app.description.trim() || undefined : undefined,
      credits:
        [app.developer, app.publisher !== app.developer ? app.publisher : undefined, app['release-date']?.slice(0, 4)]
          .filter((v): v is string => typeof v === 'string' && !!v)
          .join(' · ') || undefined,
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
      // Landscape hero art first (server, cached from the game's metadata); the poster treatment otherwise.
      const posterLayer = () => {
        next.classList.remove('hero');
        const key = h('img.lx-key', { src: art, alt: '', decoding: 'async' });
        key.addEventListener('load', () => requestAnimationFrame(reveal), { once: true });
        key.addEventListener('error', () => (next.replaceChildren(), next.classList.add('plain'), requestAnimationFrame(reveal)), { once: true });
        next.replaceChildren(h('img.lx-fill', { src: art, alt: '', decoding: 'async' }), key);
      };
      if (item.hero) {
        next.classList.add('hero');
        const hero = h('img.lx-key', { src: item.hero, alt: '', decoding: 'async' });
        hero.addEventListener('load', () => requestAnimationFrame(reveal), { once: true });
        hero.addEventListener('error', posterLayer, { once: true });
        next.append(hero);
      } else {
        posterLayer();
      }
    } else {
      next.classList.add('plain');
      requestAnimationFrame(reveal);
    }
    backdrop.insertBefore(next, scrim);
  };

  const title = h('h1.lx-title');
  const meta = h('div.lx-meta');
  // A viewer joins whatever runs: never send an appId (legacy parity). It keeps one hero button (no row).
  const join = h('button.btn.primary.lx-play', { type: 'button', onclick: () => opts.onPlay({ ...items[selected], appId: undefined }, serverName) }, icon('play'), 'Unirse');

  const renderHero = (item: Item) => {
    title.textContent = viewer && !item.live ? 'Unirse a la sesión' : item.title;
    const chips: HTMLElement[] = [];
    if (viewer) chips.push(h('span.pill.role', {}, 'Invitado: solo ver'));
    if (item.live) chips.push(h('span.pill.live', {}, 'En curso'));
    else if (item.appId === undefined) chips.push(h('span.pill', {}, 'Escritorio remoto'));
    for (const g of item.genres.slice(0, 2)) chips.push(h('span.pill', {}, g));
    meta.replaceChildren(...chips);
  };

  const sheet = actionSheet(opts, serverName, () => void showLauncher({ ...opts, refresh: true }));

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
        onclick: () => (select(i), sheet.open(items[i], btn)),
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
    h('main.lx-hero', {}, title, meta, ...(viewer ? [h('div.lx-actions', {}, join)] : [])),
    ...(viewer ? [] : [h('section.lx-row', {}, row)]),
    sheet.el,
  );
  select(selected, { scroll: false, immediate: true });
  await go('launcher');
  // Keyboard/gamepad land on the selected poster (it already wears the focus look); no ring flash for pointers.
  const first = viewer ? join : (row.children[selected]?.firstElementChild as HTMLElement);
  first.focus({ preventScroll: true, focusVisible: false } as FocusOptions);
  if (!viewer) row.children[selected]?.scrollIntoView({ inline: 'center', block: 'nearest' });
}

/** Designed fallback when a poster fails: the title on a Sunset card, never a broken box. */
function titleCard(name: string): HTMLElement {
  return h('span.lx-titlecard', {}, icon('hexagon'), h('span', {}, name));
}

/** What to do with a game: bottom sheet on phones, centered card on desktop (native dialog: Esc closes). */
function actionSheet(opts: LauncherOptions, serverName: string, onClosed: () => void) {
  const art = h('span.lx-sheet-art');
  const title = h('h2.lx-sheet-title', { id: 'lx-sheet-title' });
  const sub = h('p.lx-sheet-sub');
  const details = h('div.lx-details', { hidden: true });
  const actions = h('div.lx-sheet-actions');
  const status = h('p.lx-sheet-status', { role: 'status' });
  const el = h('dialog.lx-sheet', { 'aria-labelledby': 'lx-sheet-title' }, h('div.lx-sheet-head', {}, art, h('div', {}, title, sub)), details, actions, status) as HTMLDialogElement;
  el.addEventListener('click', (e) => e.target === el && el.close()); // tap on the scrim
  let returnTo: HTMLElement | undefined;
  el.addEventListener('close', () => returnTo?.focus({ preventScroll: true }));

  const button = (label: string, iconName: string, cls: string, onclick: () => void) => {
    const b = h('button.btn', { type: 'button', onclick }, icon(iconName), h('span', {}, label));
    if (cls) b.classList.add(cls);
    return b;
  };

  const open = (item: Item, from: HTMLElement) => {
    returnTo = from;
    art.replaceChildren(item.cover ? h('img', { src: item.cover, alt: '', decoding: 'async' }) : icon('desktop'));
    art.classList.toggle('desk', !item.cover);
    title.textContent = item.title;
    sub.textContent = item.live
      ? `En curso en ${serverName}`
      : item.appId === undefined
        ? `Escritorio remoto de ${serverName}`
        : item.genres.slice(0, 3).join(' · ');
    details.hidden = true;
    details.replaceChildren(
      h('p.lx-details-text', {}, item.description ?? 'Este juego no tiene descripción.'),
      ...(item.credits ? [h('p.lx-details-credits', {}, item.credits)] : []),
    );
    status.textContent = '';
    const play = () => (el.close(), opts.onPlay(item, serverName));
    const close = async () => {
      status.textContent = 'Cerrando el juego…';
      const res = await fetch('/api/apps/close', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }).catch(() => undefined);
      if (res?.ok) {
        el.close();
        say('Juego cerrado.');
        onClosed();
      } else {
        status.textContent = 'No se pudo cerrar el juego. Vuelve a intentarlo.';
      }
    };
    const list: HTMLElement[] = item.live
      ? [button('Continuar', 'play', 'primary', play), button('Cerrar juego', 'close', '', () => void close())]
      : [button(item.appId === undefined ? 'Conectar' : 'Jugar', 'play', 'primary', play)];
    if (item.appId !== undefined) {
      const more = button('Ver detalles', 'chevron-right', 'ghost', () => {
        details.hidden = !details.hidden;
        more.lastElementChild!.textContent = details.hidden ? 'Ver detalles' : 'Ocultar detalles';
      });
      list.push(more);
    }
    actions.replaceChildren(...list);
    el.showModal();
    list[0].focus({ preventScroll: true });
  };
  return { el, open };
}
