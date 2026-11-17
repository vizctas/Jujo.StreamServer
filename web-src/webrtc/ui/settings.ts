// Settings sheet: stream settings (saved on change), server security (owner only), account sign-out.
import { clearServers } from '../servers';
import type { EncodingType } from '../types';
import { h, icon, isTouch, say, storage, store, type AuthState } from './shell';
import './settings.css';

export interface SettingsOptions {
  auth: AuthState;
  onSignedOut(): void;
}

export interface StreamSettings {
  resolution: string;
  fps: string;
  bitrate: string;
  codec: string;
  pacing: string;
}

const KEY = 'jujo.webrtc.settings';
const BITRATE_MIN = 1000;
const BITRATE_MAX = 150000;

export function decodable(codec: EncodingType): boolean {
  const mime = { h264: 'video/h264', hevc: 'video/h265', av1: 'video/av1' }[codec];
  return !!RTCRtpReceiver.getCapabilities?.('video')?.codecs.some((c) => c.mimeType.toLowerCase() === mime);
}

// Default to the viewer's physical screen so the host encodes exactly what will be shown (no scaler blur).
function defaults(): StreamSettings {
  const dpr = window.devicePixelRatio || 1;
  let w = Math.max(screen.width, screen.height) * dpr;
  let ht = Math.min(screen.width, screen.height) * dpr;
  if (isTouch && ht > 1080) {
    w = (w * 1080) / ht;
    ht = 1080;
  }
  const even = (v: number) => Math.round(v / 2) * 2;
  const cellular = (navigator as Navigator & { connection?: { type?: string } }).connection?.type === 'cellular';
  return {
    resolution: `${even(w)}x${even(ht)}`,
    fps: '60',
    bitrate: cellular ? '8000' : '20000',
    codec: decodable('hevc') ? 'hevc' : 'h264',
    pacing: 'latency',
  };
}

const validBitrate = (v: unknown) => {
  const n = Number(v);
  return v !== '' && Number.isInteger(n) && n >= BITRATE_MIN && n <= BITRATE_MAX;
};

/** Saved values over device defaults; an empty or out-of-range bitrate falls back to the default. */
export function streamSettings(): StreamSettings {
  const d = defaults();
  const out = { ...d, ...storage<Partial<StreamSettings>>(KEY, {}) };
  if (!validBitrate(out.bitrate)) out.bitrate = d.bitrate;
  return out;
}

const cloudErrors: Record<string, string> = {
  totp_required: 'Falta la verificación en dos pasos.',
  not_paired: 'Tu cuenta no está pareada con este servidor.',
  server_not_registered: 'El servidor no está registrado en JUJO.CLOUD.',
  too_many_attempts: 'Demasiados intentos; espera 15 minutos.',
};

let dialog: HTMLDialogElement | undefined;
let current: SettingsOptions;
let sync: () => void;

export function openSettings(opts: SettingsOptions): void {
  current = opts;
  dialog ??= build();
  sync();
  dialog.showModal();
}

const RESOLUTIONS = ['1280x720', '1920x1080', '2560x1440', '3840x2160'];
const CODECS: [EncodingType, string][] = [['h264', 'H.264'], ['hevc', 'HEVC'], ['av1', 'AV1']];

function segmented(name: string, legend: string, options: [string, string][]): HTMLFieldSetElement {
  return h<'fieldset'>(
    'fieldset.sx-seg',
    {},
    h('legend', {}, legend),
    h('div.sx-seg-row', {}, ...options.map(([value, label]) => h('label', {}, h<'input'>('input', { type: 'radio', name, value }), h('span', {}, label)))),
  );
}

function build(): HTMLDialogElement {
  const dlg = h<'dialog'>('dialog.settings', { 'aria-labelledby': 'sx-title' });
  const close = () => dlg.close();

  // The modal covers the page's status pill: the sheet reports in its own line.
  const status = h('p.sx-status', { role: 'status' });
  const tell = (msg: string, isError = false) => {
    status.textContent = msg;
    status.classList.toggle('error', isError);
    status.setAttribute('role', isError ? 'alert' : 'status');
  };

  // Transmisión: every named control here is a stream setting; nothing else lives in this form.
  const device = defaults().resolution;
  const resolution = h<'select'>('select', { name: 'resolution' });
  for (const r of new Set([...RESOLUTIONS, device])) {
    resolution.add(new Option(r.replace('x', '×') + (r === device ? ' (pantalla)' : ''), r));
  }
  const codec = h<'select'>('select', { name: 'codec' });
  for (const [value, label] of CODECS) {
    const o = new Option(decodable(value) ? label : `${label} (no compatible)`, value);
    o.disabled = !decodable(value);
    codec.add(o);
  }
  const bitrateError = h('span.sx-error', { id: 'sx-bitrate-error', hidden: true }, `Entre ${BITRATE_MIN} y ${BITRATE_MAX} kbps.`);
  const bitrate = h<'input'>('input', {
    name: 'bitrate',
    type: 'number',
    min: BITRATE_MIN,
    max: BITRATE_MAX,
    step: 1000,
    inputmode: 'numeric',
    required: true,
    'aria-describedby': 'sx-bitrate-error',
  });
  const form = h<'form'>(
    'form.sx-section.sx-stream',
    { onsubmit: (e: Event) => e.preventDefault() },
    h('h3', {}, 'Transmisión'),
    h('div.sx-grid', {}, h('label.field', {}, 'Resolución', resolution), h('label.field', {}, 'Códec', codec)),
    segmented('fps', 'FPS', [['30', '30'], ['60', '60'], ['90', '90'], ['120', '120']]),
    h('label.field', {}, 'Bitrate (kbps)', bitrate, bitrateError),
    segmented('pacing', 'Modo de envío', [['latency', 'Latencia'], ['balanced', 'Equilibrado'], ['smoothness', 'Fluidez']]),
  );
  form.addEventListener('change', () => {
    const ok = validBitrate(bitrate.value);
    bitrateError.hidden = ok;
    bitrate.setAttribute('aria-invalid', String(!ok));
    // Never persist an empty or out-of-range bitrate: the last valid one stays.
    const values = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (!ok) values.bitrate = streamSettings().bitrate;
    store(KEY, values);
  });

  // Seguridad (owner): lowering security needs the account password; nothing changes until it is confirmed.
  const requirePassword = h<'input'>('input', { type: 'checkbox', role: 'switch', 'aria-describedby': 'sx-switch-hint' });
  const accountPassword = h<'input'>('input', { type: 'password', autocomplete: 'current-password', required: true });
  const apply = h<'button'>('button.btn.primary', { type: 'submit' }, 'Confirmar');
  /** Hide the editor, clear the password, show the server's real state. */
  const resetEditor = () => {
    confirm.hidden = true;
    accountPassword.value = '';
    requirePassword.checked = current.auth.serverPasswordRequired;
  };
  const applySecurity = async (require: boolean) => {
    apply.disabled = requirePassword.disabled = true;
    try {
      const res = await fetch('/api/webrtc/security', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ require_server_password: require, account_password: accountPassword.value }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        tell(body.error === 'invalid_account_password' ? 'Contraseña de la cuenta incorrecta.' : cloudErrors[body.error] ?? 'No se pudo cambiar. Vuelve a intentarlo.', true);
      } else {
        current.auth.serverPasswordRequired = !!body.server_password_required;
        tell(body.server_password_required ? 'Se pedirá la contraseña del servidor.' : 'Contraseña del servidor desactivada.');
      }
    } catch {
      tell('No se pudo contactar el servidor. Vuelve a intentarlo.', true);
    }
    apply.disabled = requirePassword.disabled = false;
    resetEditor();
  };
  const confirm = h<'form'>(
    'form.sx-confirm',
    {
      hidden: true,
      onsubmit: (e: Event) => {
        e.preventDefault();
        void applySecurity(false);
      },
    },
    h('label.field', {}, 'Contraseña de tu cuenta JUJO.CLOUD (necesaria para desactivarla)', accountPassword),
    h(
      'div.sx-confirm-actions',
      {},
      h('button.btn.ghost', { type: 'button', onclick: () => (resetEditor(), requirePassword.focus()) }, 'Cancelar'),
      apply,
    ),
  );
  requirePassword.addEventListener('change', () => {
    tell('');
    if (requirePassword.checked) {
      confirm.hidden = true;
      accountPassword.value = '';
      void applySecurity(true);
      return;
    }
    confirm.hidden = false;
    accountPassword.focus();
  });
  const security = h(
    'section.sx-section',
    {},
    h('h3', {}, 'Seguridad'),
    h(
      'label.sx-switch',
      {},
      h('span', {}, 'Pedir contraseña del servidor', h('small', { id: 'sx-switch-hint' }, 'Segundo paso para controlar este equipo')),
      requirePassword,
    ),
    confirm,
  );

  const signout = h<'button'>(
    'button.btn.sx-signout',
    {
      type: 'button',
      onclick: async () => {
        signout.disabled = true;
        await fetch('/api/auth/cloud-login', { method: 'DELETE', credentials: 'same-origin' }).catch(() => undefined);
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => undefined);
        clearServers();
        signout.disabled = false;
        close();
        say('Sesión cerrada');
        current.onSignedOut();
      },
    },
    icon('signout'),
    'Cerrar sesión en este dispositivo',
  );

  // Sesión (owner / operator): close whatever runs on the PC, like the Android client.
  const closeGame = h<'button'>(
    'button.btn.sx-secondary',
    {
      type: 'button',
      onclick: async () => {
        closeGame.disabled = true;
        const ok = await fetch('/api/apps/close', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{}' })
          .then((r) => r.ok)
          .catch(() => false);
        closeGame.disabled = false;
        tell(ok ? 'Juego cerrado.' : 'No se pudo cerrar el juego. Vuelve a intentarlo.', !ok);
      },
    },
    'Cerrar el juego en curso',
  );
  const session = h('section.sx-section', {}, h('h3', {}, 'Sesión'), closeGame);

  const kbd = (k: string) => h('kbd', {}, k);
  dlg.append(
    h(
      'div.sx-sheet',
      {},
      h(
        'header.sx-head',
        {},
        h('span.sx-grab', { 'aria-hidden': 'true' }),
        h('h2', { id: 'sx-title' }, 'Ajustes'),
        h('button.iconbtn', { type: 'button', 'aria-label': 'Cerrar', onclick: close }, icon('close')),
      ),
      status,
      form,
      security,
      session,
      h('section.sx-section', {}, h('h3', {}, 'Cuenta'), signout),
      h('p.sx-hint', {}, 'Durante la transmisión: ', kbd('Ctrl'), '+', kbd('Alt'), '+', kbd('Shift'), '+', kbd('Q'), ' salir, ', kbd('S'), ' estadísticas, ', kbd('F'), ' pantalla completa'),
    ),
  );
  // Tap on the scrim (the dialog box itself, outside the sheet) closes.
  dlg.addEventListener('click', (e) => e.target === dlg && close());
  dlg.addEventListener('close', () => (resetEditor(), tell('')));

  sync = () => {
    const st = streamSettings();
    if (![...resolution.options].some((o) => o.value === st.resolution)) resolution.add(new Option(st.resolution.replace('x', '×'), st.resolution), 0);
    resolution.value = st.resolution;
    codec.value = st.codec;
    bitrate.value = st.bitrate;
    bitrateError.hidden = true;
    bitrate.removeAttribute('aria-invalid');
    for (const k of ['fps', 'pacing'] as const) {
      for (const r of form.querySelectorAll<HTMLInputElement>(`input[name=${k}]`)) r.checked = r.value === st[k];
    }
    security.hidden = !!current.auth.guestRole;
    session.hidden = current.auth.guestRole === 'viewer';
    tell('');
    resetEditor();
  };
  document.body.append(dlg);
  return dlg;
}

