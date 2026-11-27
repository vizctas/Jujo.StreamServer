// Guest codes: redeemed against JUJO.CLOUD with the aal2 session, before the browser signs out of it.
// "requested" waits for the host to accept; only then does /api/auth/cloud-login pair this browser.
import { call, type CloudConfig } from './cloud';

export const POLL_MS = 3000;
export const WAIT_MS = 10 * 60 * 1000; // a request lapses after 10 minutes

/** "xxxxx-xxxxx" / "XXXXXXXXXX" -> "XXXXX-XXXXX"; undefined when it is not a 10-character code. */
export function normalizeCode(raw: string): string | undefined {
  const c = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return c.length === 10 ? `${c.slice(0, 5)}-${c.slice(5)}` : undefined;
}

/** The code in a "#invite=XXXXX-XXXXX" fragment (a fragment never reaches the proxy's path allowlist). */
export function parseInviteFragment(hash: string): string | undefined {
  const m = /(?:^#|&)invite=([^&]*)/.exec(hash);
  if (!m) return undefined;
  try {
    return normalizeCode(decodeURIComponent(m[1]));
  } catch {
    return undefined;
  }
}

let code: string | undefined;
export const getInvite = () => code;
/** Holds the code until it is used; clearing it also removes it from the address bar. */
export function setInvite(next?: string): void {
  code = next;
  if (!next && /[#&]invite=/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
}

export const BAD_CODE = 'Ese código no es válido. Debe tener 10 caracteres, como XXXXX-XXXXX.';
export const DECLINED = 'El anfitrión rechazó la solicitud.';
export const EXPIRED = 'La solicitud venció sin respuesta. Pídele un código nuevo al anfitrión.';
export const CANCELLED = 'Solicitud cancelada.';
const REDEEM_ERRORS: Record<string, string> = {
  verify_email: 'Confirma tu correo en JUJO.CLOUD para usar un código de invitado.',
  invalid_or_expired: 'El código no es válido o ya venció. Pídele uno nuevo al anfitrión.',
  already_has_access: 'Ya tienes acceso a este servidor. Inicia sesión sin el código.',
};

export interface RedeemResult {
  success?: boolean;
  error?: string;
  id?: string;
  status?: string;
}
export type RedeemStep = { kind: 'active' } | { kind: 'waiting'; id: string } | { kind: 'error'; message: string };

export function redeemStep(r: RedeemResult): RedeemStep {
  if (r.success && r.status === 'active') return { kind: 'active' };
  if (r.success && r.status === 'requested' && r.id) return { kind: 'waiting', id: r.id };
  return { kind: 'error', message: (r.error && REDEEM_ERRORS[r.error]) || 'No se pudo usar el código. Inténtalo de nuevo.' };
}

/** One poll of the request row. A vanished row (undefined) lapsed or was removed. */
export function waitOutcome(status: string | undefined, elapsedMs: number): 'active' | 'declined' | 'expired' | 'waiting' {
  if (status === 'active') return 'active';
  if (status === 'declined') return 'declined';
  return status === undefined || status === 'expired' || elapsedMs >= WAIT_MS ? 'expired' : 'waiting';
}

export const redeemGuestLink = (cfg: CloudConfig, token: string, p_code: string) =>
  call<RedeemResult>(cfg, '/rest/v1/rpc/redeem_guest_link', { method: 'POST', token, body: JSON.stringify({ p_code }) });

export const inviteStatus = async (cfg: CloudConfig, token: string, id: string) =>
  (await call<{ status: string }[]>(cfg, `/rest/v1/coop_session_invites?select=status&id=eq.${encodeURIComponent(id)}`, { token }))[0]?.status;

export const cancelInvite = (cfg: CloudConfig, token: string, id: string) =>
  call<unknown>(cfg, `/rest/v1/coop_session_invites?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', token });
