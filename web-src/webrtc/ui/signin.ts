// Sign-in: Sky gradient drifting behind a bottom sheet (phone) / centered sheet (desktop >= 768 px).
// JUJO.CLOUD email + password -> TOTP -> /api/auth/cloud-login (servers synced, cloud session dropped)
// -> this server's password only when it asks.
import { CloudError, signIn, signOut, verifyTotp } from '../cloud';
import { syncServers } from '../servers';
import { brand, fetchAuth, go, h, icon, isTouch, reducedMotion, screenEl, storage, store, type AuthState } from './shell';
import './signin.css';

export interface SigninOptions {
  auth: AuthState;
  /** cloud = JUJO.CLOUD email+password then TOTP; server = this server's password only; blocked = server not on JUJO.CLOUD. */
  step: 'cloud' | 'server' | 'blocked';
  /** Re-sign-in only to refresh the server list (opened from focus mode); dismissible. */
  resync?: boolean;
  onDone(): void;
  onDismiss?(): void;
}

// Every message names the problem, then the way out, and ends with a period.
const cloudErrors: Record<string, string> = {
  totp_required: 'Falta la verificación en dos pasos. Inicia sesión otra vez y escribe el código.',
  not_paired: 'Tu cuenta no está vinculada con este servidor. Pide acceso al dueño del servidor o usa otra cuenta.',
  server_not_registered: 'El servidor no está registrado en JUJO.CLOUD. Regístralo en JUJO.CLOUD e inténtalo de nuevo.',
  too_many_attempts: 'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.',
};
const NET_CLOUD = 'No se pudo contactar JUJO.CLOUD. Revisa tu conexión e inténtalo de nuevo.';
const NET_SERVER = 'No se pudo contactar este servidor. Revisa tu conexión e inténtalo de nuevo.';
const RETRY = 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
const STILL_KEY = 'jujo.webrtc.signin.still';
const BUSY = 'Verificando…';

/** cloud.ts throws raw GoTrue text (English) or "HTTP nnn": only known cases map, the rest gets `fallback`. */
function cloudMsg(err: unknown, fallback: string): string {
  if (!(err instanceof CloudError)) return NET_CLOUD;
  const m = err.message;
  if (m.startsWith('Tu cuenta')) return m; // cloud.ts's own Spanish message (no TOTP factor)
  if (/invalid login|invalid_credentials/i.test(m)) return 'Correo o contraseña incorrectos. Revísalos e inténtalo de nuevo.';
  if (/not confirmed/i.test(m)) return 'Tu correo aún no está confirmado. Abre el enlace que te envió JUJO.CLOUD e inténtalo de nuevo.';
  if (/rate limit|too many|HTTP 429/i.test(m)) return RETRY;
  if (/HTTP 5\d\d/.test(m)) return 'JUJO.CLOUD no responde en este momento. Inténtalo de nuevo en unos minutos.';
  return fallback;
}
const FAIL_SIGNIN = 'JUJO.CLOUD no aceptó el inicio de sesión. Revisa tus datos e inténtalo de nuevo.';
const FAIL_CODE = 'Código incorrecto o vencido. Espera el siguiente código de tu app y escríbelo.';

/** Live regions announce changes, not content they were inserted with. */
const announce = (el: Element, text: string) => window.setTimeout(() => (el.textContent = text), 100);

let uid = 0;
let revealActive: (() => void) | undefined;
// interactive-widget=resizes-content: the keyboard shrinks the viewport; keep the focused field in view.
window.addEventListener('resize', () => revealActive?.());

export async function showSignin(opts: SigninOptions): Promise<void> {
  const root = screenEl('signin');
  const cfg = opts.auth.cloud;
  let pending: { token: string; factorId: string } | undefined;
  let lastEmail = '';

  const dropPending = () => {
    if (cfg && pending) void signOut(cfg, pending.token);
    pending = undefined;
  };

  // ── Steps ────────────────────────────────────────────────────────────
  const panel = (ic: string, title: string, sub: string | HTMLElement, ...body: (Node | false)[]) =>
    h(
      'div.si-step',
      { tabindex: '-1' },
      h(`span.si-tile${ic === 'alert' ? '.warn' : ''}`, { 'aria-hidden': 'true' }, icon(ic)),
      h('h1.si-title', {}, title),
      typeof sub === 'string' ? h('p.si-sub', {}, sub) : sub,
      ...body,
    );

  const field = (label: string, ic: string | undefined, attrs: Record<string, string | boolean>) => {
    const id = `si-f${++uid}`;
    const input = h<'input'>('input', { id, ...attrs, oninput: () => input.removeAttribute('aria-invalid') });
    const box = h('div.si-box', {}, ic && icon(ic), input);
    if (attrs.type === 'password') {
      const eye: HTMLButtonElement = h<'button'>(
        'button.si-eye',
        {
          type: 'button',
          'aria-label': 'Mostrar contraseña',
          'aria-pressed': 'false',
          onclick: () => {
            const reveal = input.type === 'password';
            input.type = reveal ? 'text' : 'password';
            eye.setAttribute('aria-pressed', String(reveal));
            eye.replaceChildren(icon(reveal ? 'eye-off' : 'eye'));
          },
        },
        icon('eye'),
      );
      box.append(eye);
    }
    return { el: h('div.field.si-field', {}, h('label', { for: id }, label), box), input };
  };

  /** Form with an inline calm error and a busy primary. submit() reports problems through fail(). */
  const makeForm = (primary: string, submit: (fail: (msg: string, input?: HTMLInputElement) => void) => Promise<void>, ...kids: HTMLElement[]) => {
    const errId = `si-e${++uid}`;
    const err = h('p.si-error', { id: errId, role: 'alert' });
    const label = h('span', {}, primary);
    const btn = h<'button'>('button.btn.primary.si-primary', { type: 'submit' }, label);
    const form = h<'form'>('form.si-form', { novalidate: true }, ...kids, err, btn);
    for (const i of form.querySelectorAll('input')) i.setAttribute('aria-describedby', errId);
    const fail = (msg: string, input?: HTMLInputElement) => {
      err.textContent = msg;
      input?.setAttribute('aria-invalid', 'true');
      input?.focus();
    };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (btn.disabled) return;
      const empty = [...form.querySelectorAll('input')].find((i) => !i.value.trim());
      if (empty) return fail('Falta un dato. Completa este campo para continuar.', empty);
      err.textContent = '';
      btn.disabled = true;
      label.textContent = BUSY;
      try {
        await submit(fail);
      } finally {
        btn.disabled = false;
        label.textContent = primary;
      }
    });
    return form;
  };

  const cloudStep = (msg?: string): HTMLElement => {
    if (!cfg) return noConfigStep();
    const email = field('Correo', 'mail', { name: 'email', type: 'email', autocomplete: 'username', inputmode: 'email', autocapitalize: 'none', spellcheck: 'false', required: true });
    const pass = field('Contraseña', 'lock', { name: 'password', type: 'password', autocomplete: 'current-password', required: true });
    email.input.value = lastEmail;
    const form = makeForm(
      'Iniciar sesión',
      async (fail) => {
        lastEmail = email.input.value.trim();
        try {
          pending = await signIn(cfg, lastEmail, pass.input.value);
          show(totpStep());
        } catch (e) {
          fail(cloudMsg(e, FAIL_SIGNIN), pass.input);
        } finally {
          pass.input.value = '';
        }
      },
      email.el,
      pass.el,
    );
    const step = opts.resync
      ? panel('cloud', 'Actualiza tus servidores', 'Inicia sesión en JUJO.CLOUD para leer otra vez tu lista de servidores.', form)
      : panel('cloud', 'Inicia sesión en JUJO.CLOUD', 'Usa tu cuenta para entrar a este servidor.', form);
    if (msg) announce(form.querySelector('.si-error')!, msg);
    return step;
  };

  const totpStep = (): HTMLElement => {
    const code = field('Código de 6 dígitos', undefined, {
      name: 'code', type: 'text', inputmode: 'numeric', autocomplete: 'one-time-code', pattern: '[0-9]{6}', spellcheck: 'false', required: true,
    });
    code.input.classList.add('si-code');
    const form = makeForm('Verificar', async (fail) => {
      if (!cfg || !pending) return void show(cloudStep());
      let aal2: string;
      try {
        aal2 = await verifyTotp(cfg, pending.token, pending.factorId, code.input.value);
      } catch (e) {
        code.input.value = '';
        return fail(cloudMsg(e, FAIL_CODE), code.input);
      }
      pending = undefined;
      let error: string | undefined;
      try {
        const res = await fetch('/api/auth/cloud-login', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: aal2 }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) error = cloudErrors[body.error] ?? 'JUJO.CLOUD rechazó el acceso. Inicia sesión otra vez.';
        else {
          show(syncStep());
          await syncServers(cfg, aal2);
        }
      } catch {
        error = NET_SERVER;
      } finally {
        // The server keeps its own trust now; the browser never keeps a cloud session.
        await signOut(cfg, aal2);
      }
      if (error) return void show(cloudStep(error));
      await finish();
    }, code.el);
    code.input.addEventListener('input', () => {
      code.input.value = code.input.value.replace(/\D/g, '').slice(0, 6);
      if (code.input.value.length === 6) form.requestSubmit();
    });
    return panel(
      'shield',
      'Verificación en dos pasos',
      'Escribe el código de 6 dígitos de tu app de autenticación.',
      form,
      h('button.btn.ghost.si-secondary', { type: 'button', onclick: () => (dropPending(), show(cloudStep())) }, icon('chevron-left'), 'Volver'),
    );
  };

  const syncStep = () => {
    const status = h('p.si-sub', { role: 'status' });
    announce(status, 'Leyendo tus servidores, los compartidos y los de Co-Op.');
    return panel('servers', 'Sincronizando servidores', status, h('div.si-progress', { role: 'progressbar', 'aria-label': 'Sincronizando servidores' }));
  };

  const serverStep = (): HTMLElement => {
    const user = field('Usuario', 'users', { name: 'username', type: 'text', autocomplete: 'username', autocapitalize: 'none', spellcheck: 'false', required: true });
    const pass = field('Contraseña', 'lock', { name: 'password', type: 'password', autocomplete: 'current-password', required: true });
    const form = makeForm(
      'Entrar',
      async (fail) => {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user.input.value.trim(), password: pass.input.value, remember_me: true }),
        }).catch(() => undefined);
        pass.input.value = '';
        if (!res) return fail(NET_SERVER);
        if (res.status === 403) return void show(cloudStep('Este dispositivo aún no tiene acceso de JUJO.CLOUD. Inicia sesión con tu cuenta.'));
        if (res.status === 429) return fail(cloudErrors.too_many_attempts);
        if (!res.ok) return fail('Usuario o contraseña incorrectos. Revísalos e inténtalo de nuevo.', pass.input);
        opts.onDone();
      },
      user.el,
      pass.el,
    );
    return panel('lock', 'Contraseña del servidor', 'Este servidor pide su propia cuenta además de JUJO.CLOUD.', form);
  };

  const blockedStep = () =>
    panel(
      'alert',
      'Este servidor no está en JUJO.CLOUD',
      'El acceso desde el navegador está desactivado hasta que el servidor se registre en JUJO.CLOUD.',
      h('button.btn.si-primary', { type: 'button', onclick: () => opts.onDone() }, icon('refresh'), 'Comprobar de nuevo'),
    );

  function noConfigStep(): HTMLElement {
    return panel(
      'alert',
      'No se pudo cargar JUJO.CLOUD',
      'Este servidor no envió la configuración de la cuenta. Recarga la página para intentar de nuevo.',
      h('button.btn.si-primary', { type: 'button', onclick: () => location.reload() }, icon('refresh'), 'Recargar'),
    );
  }

  const finish = async () => {
    if (opts.resync) return opts.onDone();
    const auth = await fetchAuth().catch(() => undefined);
    if (auth && !auth.authenticated && auth.serverPasswordRequired) return void show(serverStep());
    opts.onDone();
  };

  // ── Step switching: old fades + .98, new rises 10 px; the surface glides between heights ──
  const surface = h('div.si-surface', { 'aria-hidden': 'true' });
  const stage = h('div.si-stage');
  // The sheet scrolls inside itself when the viewport shrinks (soft keyboard, landscape).
  const sheet = h('div.si-sheet', {}, surface, h('div.si-scroll', {}, stage));
  let current: HTMLElement | undefined;
  const css = (name: string) => getComputedStyle(root).getPropertyValue(name).trim();
  const focusFirst = (el: HTMLElement) => (el.querySelector<HTMLElement>('input, .si-primary') ?? el).focus({ preventScroll: true });
  const reveal = () => {
    const el = document.activeElement;
    if (!(el instanceof HTMLInputElement) || !stage.contains(el)) return;
    // Instant: a second smooth scroll would cancel the first one.
    el.closest('.si-field')!.scrollIntoView({ block: 'center' });
    el.form?.querySelector('.si-primary')?.scrollIntoView({ block: 'nearest' });
  };
  revealActive = reveal;
  stage.addEventListener('focusin', reveal);

  function show(next: HTMLElement, focus = true): void {
    const old = current;
    current = next;
    if (!old) {
      stage.replaceChildren(next);
      return;
    }
    const before = sheet.offsetHeight;
    for (const leaving of stage.querySelectorAll('.si-out')) leaving.remove();
    old.classList.add('si-out');
    old.inert = true;
    next.classList.add('si-in');
    stage.append(next);
    const after = sheet.offsetHeight;
    const ms = parseFloat(css('--t-step')) || 280;
    if (!reducedMotion() && before && after && before !== after) {
      surface.animate([{ transform: `scaleY(${before / after})` }, { transform: 'none' }], { duration: ms, easing: css('--ease') || 'ease-out' });
    }
    window.setTimeout(() => old.remove(), ms + 40);
    if (focus) focusFirst(next);
  }

  // ── Background drift + pause control (WCAG 2.2.2) ──
  let still = storage<boolean>(STILL_KEY, false);
  const stillBtn = h('button.iconbtn.si-still', { type: 'button', onclick: () => setStill(!still) });
  const setStill = (v: boolean) => {
    still = v;
    store(STILL_KEY, v || undefined);
    root.classList.toggle('still', v);
    stillBtn.setAttribute('aria-label', v ? 'Reanudar el movimiento del fondo' : 'Pausar el movimiento del fondo');
    stillBtn.replaceChildren(icon(v ? 'play' : 'pause'));
  };

  const dismiss = () => {
    dropPending();
    opts.onDismiss?.();
  };
  const tools = h(
    'div.si-tools',
    {},
    stillBtn,
    opts.resync && opts.onDismiss && h('button.iconbtn', { type: 'button', 'aria-label': 'Cerrar', onclick: dismiss }, icon('close')),
  );
  root.onkeydown = opts.resync && opts.onDismiss ? (e) => e.key === 'Escape' && dismiss() : null;

  root.className = 'signin';
  root.replaceChildren(
    h('div.si-bg', { 'aria-hidden': 'true' }, h('i.si-blob'), h('i.si-blob'), h('i.si-blob'), h('i.si-blob')),
    h('header.si-top', {}, brand(), tools),
    sheet,
  );
  setStill(still);
  show(opts.step === 'blocked' ? blockedStep() : opts.step === 'server' ? serverStep() : cloudStep(), false);
  await go('signin');
  // On phones the keyboard would cover the sheet before the person chose to type.
  if (!isTouch && current) focusFirst(current);
}
