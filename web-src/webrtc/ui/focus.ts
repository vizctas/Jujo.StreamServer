// Focus mode (focus_mode_screen.dart): the account's servers, one centered, neighbours peeking.
// This server first; another server is another origin, so choosing it navigates there.
import { isOnline, serversForFocus, webrtcUrl, type ServerEntry } from '../servers';
import { serverAvatar } from './avatar';
import { brand, go, h, icon, reducedMotion, screenEl, type AuthState } from './shell';
import './focus.css';

export interface FocusOptions {
  auth: AuthState;
  /** The centered server is this one: open its launcher. */
  onEnter(): void;
  /** Sign in to JUJO.CLOUD again to refresh the server list. */
  onResync(): void;
  onSettings(): void;
}

const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
const until = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function ago(iso: string): string {
  const min = (Date.parse(iso) - Date.now()) / 60000;
  if (Number.isNaN(min)) return '';
  const steps: [number, Intl.RelativeTimeFormatUnit][] = [[60, 'minute'], [24, 'hour'], [30, 'day'], [12, 'month']];
  let v = min;
  for (const [size, unit] of steps) {
    if (Math.abs(v) < size) return rtf.format(Math.round(v), unit);
    v /= size;
  }
  return rtf.format(Math.round(v), 'year');
}

interface View {
  s: ServerEntry;
  here: boolean;
  tone: 'ok' | 'warn' | 'err';
  addr: string;
  status: string;
  role?: string;
}

/** Other servers' status is a snapshot from the last sync, and the copy says so. */
function view(s: ServerEntry, thisServer: ServerEntry, guestRole?: string): View {
  const here = s === thisServer;
  const online = here || isOnline(s);
  const tone = !online ? 'err' : !here && s.streaming ? 'warn' : 'ok';
  const seen = s.lastSeen ? ago(s.lastSeen) : '';
  const status = here
    ? 'Este servidor · En línea'
    : tone === 'warn'
      ? 'En uso al sincronizar'
      : online
        ? 'En línea al sincronizar'
        : seen
          ? `Sin conexión · visto ${seen}`
          : 'Sin conexión';
  const expires = s.expiresAt && !Number.isNaN(Date.parse(s.expiresAt)) ? ` hasta ${until.format(new Date(s.expiresAt))}` : '';
  const role = s.kind === 'coop' ? `Co-Op${expires}` : s.kind === 'shared' || (here && guestRole) ? 'Invitado' : undefined;
  return { s, here, tone, addr: here ? location.hostname : new URL(webrtcUrl(s, thisServer)).hostname, status, role };
}

export async function showFocus(opts: FocusOptions): Promise<void> {
  const root = screenEl('focus');
  const list = await serversForFocus(opts.auth.guestRole);
  const views = list.map((s) => view(s, list[0], opts.auth.guestRole));
  let current = 0;

  const enter = (i: number) => (views[i].here ? opts.onEnter() : location.assign(webrtcUrl(views[i].s, list[0])));

  const slides = views.map((v, i) =>
    h(
      `div.fx-slide.${v.tone}`,
      { role: 'group', 'aria-roledescription': 'servidor', 'aria-label': `${i + 1} de ${views.length}: ${v.s.name}`, onclick: () => (i === current ? enter(i) : select(i)) },
      h(
        'span.fx-float',
        {},
        h(`span.fx-av${v.here ? '.here' : ''}`, {}, serverAvatar(v.s.name)),
      ),
      h(
        'div.fx-meta',
        {},
        h('h2.fx-name', {}, v.s.name),
        h('p.fx-addr', {}, v.addr),
        h('p.fx-status', {}, v.status),
        v.role && h('span.pill.role', {}, v.role),
      ),
    ),
  );

  const track = h(
    'div.fx-track',
    { tabindex: 0, role: 'group', 'aria-roledescription': 'carrusel', 'aria-label': 'Tus servidores. Usa las flechas para cambiar y Enter para abrir' },
    ...slides,
  );
  const live = h('p.sr-only', { 'aria-live': 'polite' });
  const label = h('span');
  const primary = h('button.btn.fx-go', { type: 'button', onclick: () => enter(current) }, label);
  const hint = h('p.fx-hint');
  const prev = h('button.iconbtn.fx-nav.prev', { type: 'button', 'aria-label': 'Servidor anterior', tabindex: -1, onclick: () => select(current - 1) }, icon('chevron-left')) as HTMLButtonElement;
  const next = h('button.iconbtn.fx-nav.next', { type: 'button', 'aria-label': 'Servidor siguiente', tabindex: -1, onclick: () => select(current + 1) }, icon('chevron-right')) as HTMLButtonElement;
  const pill = h('span.fx-pill', { 'aria-hidden': 'true' });
  const dots = views.map((v, i) => h('button.fx-dot', { type: 'button', tabindex: -1, 'aria-label': v.s.name, onclick: () => select(i) }, h('span')));

  const mark = (i: number) => {
    current = i;
    const v = views[i];
    slides.forEach((s, j) => s.classList.toggle('is-current', j === i));
    dots.forEach((d, j) => d.setAttribute('aria-current', String(j === i)));
    pill.style.transform = `translateX(${i * 44}px)`;
    prev.classList.toggle('off', i === 0);
    next.classList.toggle('off', i === views.length - 1);
    live.textContent = `${v.s.name}, ${v.status}`;
    const verb = v.here ? 'Entrar' : v.tone === 'err' ? 'Intentar abrir' : 'Abrir';
    label.textContent = verb;
    primary.setAttribute('aria-label', v.here ? `Entrar a ${v.s.name}` : `${verb} ${v.s.name}`);
    primary.classList.toggle('primary', v.here || v.tone !== 'err');
    hint.textContent = v.here ? '' : 'La primera vez, ese servidor te pide iniciar sesión en este dispositivo.';
  };
  // While select() scrolls, the scroll handler stays out: no flicker through middle slides.
  let steering = false;
  let steerTimer = 0;
  const steer = (on: boolean) => {
    steering = on;
    window.clearTimeout(steerTimer);
    if (on) steerTimer = window.setTimeout(() => (steering = false), 900);
  };
  track.addEventListener('scrollend', () => steer(false));
  function select(i: number) {
    if (i < 0 || i >= views.length || i === current) return;
    mark(i);
    steer(true);
    slides[i].scrollIntoView({ inline: 'center', block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
  }

  // The slide nearest the track's center is the current one (swipe, wheel, snap).
  let raf = 0;
  track.addEventListener(
    'scroll',
    () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (steering) return;
        const mid = track.scrollLeft + track.clientWidth / 2;
        let best = current;
        let dist = Infinity;
        slides.forEach((s, j) => {
          const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid);
          if (d < dist) (dist = d), (best = j);
        });
        if (best !== current) mark(best);
      });
    },
    { passive: true },
  );
  track.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter') enter(current);
  });
  root.onkeydown = (e) => {
    const step = ({ ArrowLeft: -1, ArrowRight: 1 } as Record<string, number>)[e.key];
    if (!step || (e.target as HTMLElement).closest('input, select, textarea')) return;
    e.preventDefault();
    select(current + step);
  };

  const many = views.length > 1;
  root.className = 'focus-mode';
  root.replaceChildren(
    // Gas: pre-blurred sky blobs drifting on long, out-of-phase loops (transform only).
    h('div.fx-gas', { 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i')),
    h(
      'main.fx-main',
      {},
      h('section.fx-stage', {}, track, many && prev, many && next),
      h(
        'div.fx-action',
        {},
        primary,
        hint,
      ),
      live,
    ),
    h('footer.fx-foot', {}, many && h('div.fx-dots', {}, pill, ...dots)),
    // Last in the DOM so Tab runs track -> primary -> tools; the grid draws it on top.
    h(
      'header.fx-top',
      {},
      brand(),
      h(
        'div.fx-tools',
        {},
        h('button.iconbtn', { type: 'button', 'aria-label': 'Actualizar lista de servidores', onclick: opts.onResync }, icon('refresh')),
        h('button.iconbtn', { type: 'button', 'aria-label': 'Ajustes', onclick: opts.onSettings }, icon('gear')),
      ),
    ),
  );
  mark(0);
  await go('focus');
  track.focus({ preventScroll: true });
}
