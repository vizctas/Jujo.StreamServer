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

const even = (v: number) => Math.round(v / 2) * 2;
/** The viewer's physical screen (so the host encodes exactly what is shown), optionally capped in height. */
function screenRes(cap = Infinity): string {
  const dpr = window.devicePixelRatio || 1;
  let w = Math.max(screen.width, screen.height) * dpr;
  let ht = Math.min(screen.width, screen.height) * dpr;
  if (ht > cap) {
    w = (w * cap) / ht;
    ht = cap;
  }
  return `${even(w)}x${even(ht)}`;
}

let refreshHz = 60; // sampled when the sheet opens: Máxima asks for 120 fps only on a fast display

type Preset = 'mobile' | 'wifi' | 'max';
type PresetValues = Pick<StreamSettings, 'resolution' | 'fps' | 'bitrate'>;
const PRESETS: [Preset, string][] = [['mobile', 'Datos móviles'], ['wifi', 'Wi\u2011Fi'], ['max', 'Máxima']];
function preset(p: Preset): PresetValues {
  if (p === 'mobile') return { resolution: screenRes(720), fps: '60', bitrate: '6000' };
  if (p === 'wifi') return { resolution: screenRes(isTouch ? 1080 : Infinity), fps: '60', bitrate: '20000' };
  return { resolution: screenRes(), fps: refreshHz > 100 ? '120' : '60', bitrate: '40000' };
}
const presetOf = (v: PresetValues): Preset | undefined =>
  PRESETS.map(([id]) => id).find((id) => {
    const p = preset(id);
    return p.resolution === v.resolution && p.fps === v.fps && p.bitrate === v.bitrate;
  });

function slowLink(): boolean {
  const c = (navigator as Navigator & { connection?: { type?: string; effectiveType?: string } }).connection;
  return c?.type === 'cellular' || /2g|3g/.test(c?.effectiveType ?? '');
}

function defaults(): StreamSettings {
  return { ...preset(slowLink() ? 'mobile' : 'wifi'), codec: decodable('hevc') ? 'hevc' : 'h264', pacing: 'latency' };
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

  // Transmisión: a preset on top, the raw fields under "Avanzado". Values are read explicitly (never FormData).
  const device = screenRes();
  const resolution = h<'select'>('select', {});
  for (const r of new Set([...RESOLUTIONS, device])) {
    resolution.add(new Option(r.replace('x', '×') + (r === device ? ' (pantalla)' : ''), r));
  }
  const setResolution = (v: string) => {
    if (![...resolution.options].some((o) => o.value === v)) resolution.add(new Option(v.replace('x', '×'), v), 0);
    resolution.value = v;
  };
  const codec = h<'select'>('select', {});
  for (const [value, label] of CODECS) {
    const o = new Option(decodable(value) ? label : `${label} (no compatible)`, value);
    o.disabled = !decodable(value);
    codec.add(o);
  }
  const bitrateError = h('span.sx-error', { id: 'sx-bitrate-error', hidden: true }, 'Entre 1 y 150 Mbps.');
  const bitrate = h<'input'>('input', {
    type: 'number',
    min: BITRATE_MIN / 1000,
    max: BITRATE_MAX / 1000,
    step: 0.5,
    inputmode: 'decimal',
    required: true,
    'aria-describedby': 'sx-bitrate-error',
  });
  const presets = segmented('preset', 'Calidad', PRESETS);
  const summary = h('p.sx-summary', { 'aria-live': 'polite' });
  const fps = segmented('fps', 'FPS', [['30', '30'], ['60', '60'], ['90', '90'], ['120', '120']]);
  const pacing = segmented('pacing', 'Modo de envío', [['latency', 'Latencia'], ['balanced', 'Equilibrado'], ['smoothness', 'Fluidez']]);
  const advanced = h<'details'>(
    'details.sx-adv',
    {},
    h('summary', {}, h('span', {}, 'Avanzado'), icon('chevron-right')),
    h(
      'div.sx-adv-body',
      {},
      h('div.sx-grid', {}, h('label.field', {}, 'Resolución', resolution), h('label.field', {}, 'Códec', codec)),
      fps,
      h('label.field', {}, 'Bitrate (Mbps)', bitrate, bitrateError),
      pacing,
    ),
  );
  const form = h<'form'>('form.sx-section.sx-stream', { onsubmit: (e: Event) => e.preventDefault() }, h('h3', {}, 'Transmisión'), presets, summary, advanced);

  const radio = (group: HTMLElement, value?: string) => {
    for (const r of group.querySelectorAll<HTMLInputElement>('input')) r.checked = r.value === value;
  };
  const radioValue = (group: HTMLElement) => group.querySelector<HTMLInputElement>('input:checked')?.value;
  const kbps = () => String(Math.round(Number(bitrate.value) * 1000));
  const fill = (st: StreamSettings) => {
    setResolution(st.resolution);
    codec.value = st.codec;
    bitrate.value = String(Number(st.bitrate) / 1000);
    radio(fps, st.fps);
    radio(pacing, st.pacing);
    bitrateError.hidden = true;
    bitrate.removeAttribute('aria-invalid');
  };
  /** Preset segment follows the fields; none checked = "Personalizado" (said in the summary line). */
  const showPreset = () => {
    const st = streamSettings();
    const id = presetOf(st);
    radio(presets, id);
    summary.textContent = `${id ? '' : 'Personalizado · '}${st.resolution.replace('x', '×')} · ${st.fps} fps · ${Number(st.bitrate) / 1000} Mbps`;
  };
  form.addEventListener('change', (e) => {
    const saved = streamSettings();
    const chosen = (e.target as HTMLInputElement).name === 'preset' ? (e.target as HTMLInputElement).value : undefined;
    if (chosen) {
      store(KEY, { ...saved, ...preset(chosen as Preset) });
      fill(streamSettings());
    } else {
      const ok = validBitrate(kbps());
      bitrateError.hidden = ok;
      bitrate.setAttribute('aria-invalid', String(!ok));
      // Never persist an empty or out-of-range bitrate: the last valid one stays.
      store(KEY, {
        resolution: resolution.value,
        fps: radioValue(fps) ?? saved.fps,
        bitrate: ok ? kbps() : saved.bitrate,
        codec: codec.value,
        pacing: radioValue(pacing) ?? saved.pacing,
      });
    }
    showPreset();
  });
  // Display refresh, sampled once over ~20 frames.
  let frames = 0;
  const t0 = performance.now();
  const sample = () => {
    if (++frames < 20) return void requestAnimationFrame(sample);
    refreshHz = (frames * 1000) / (performance.now() - t0);
    showPreset();
  };
  requestAnimationFrame(sample);

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
      h('section.sx-section', {}, h('h3', {}, 'Cuenta'), signout),
      h('p.sx-hint', {}, 'Durante la transmisión: ', kbd('Ctrl'), '+', kbd('Alt'), '+', kbd('Shift'), '+', kbd('Q'), ' salir, ', kbd('S'), ' estadísticas, ', kbd('F'), ' pantalla completa'),
    ),
  );
  // Tap on the scrim (the dialog box itself, outside the sheet) closes.
  dlg.addEventListener('click', (e) => e.target === dlg && close());
  dlg.addEventListener('close', () => (resetEditor(), tell('')));

  sync = () => {
    fill(streamSettings());
    showPreset();
    advanced.open = false;
    security.hidden = !!current.auth.guestRole;
    tell('');
    resetEditor();
  };
  document.body.append(dlg);
  return dlg;
}

