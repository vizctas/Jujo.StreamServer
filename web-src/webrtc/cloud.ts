// JUJO.CLOUD (Supabase Auth REST) sign-in with TOTP. Tokens live only in memory for the
// duration of the handshake; the server then keeps an HttpOnly device-trust cookie.
export interface CloudConfig {
  url: string;
  key: string;
}

export class CloudError extends Error {}

async function call<T>(cfg: CloudConfig, path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const headers: Record<string, string> = { apikey: cfg.key, 'Content-Type': 'application/json' };
  if (init.token) headers.Authorization = `Bearer ${init.token}`;
  const res = await fetch(cfg.url + path, { ...init, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new CloudError(body.msg || body.error_description || body.message || `HTTP ${res.status}`);
  return body as T;
}

/** Step 1: email + password → aal1 token and the verified TOTP factor to challenge. */
export async function signIn(cfg: CloudConfig, email: string, password: string): Promise<{ token: string; factorId: string }> {
  const session = await call<{ access_token: string; user: { factors?: { id: string; factor_type: string; status: string }[] } }>(
    cfg,
    '/auth/v1/token?grant_type=password',
    { method: 'POST', body: JSON.stringify({ email, password }) },
  );
  const factor = session.user.factors?.find((f) => f.factor_type === 'totp' && f.status === 'verified');
  if (!factor) {
    await signOut(cfg, session.access_token);
    throw new CloudError('Tu cuenta JUJO.CLOUD no tiene TOTP activo. Actívalo en la app y vuelve a intentar.');
  }
  return { token: session.access_token, factorId: factor.id };
}

/** Step 2: TOTP code → aal2 access token. */
export async function verifyTotp(cfg: CloudConfig, token: string, factorId: string, code: string): Promise<string> {
  const challenge = await call<{ id: string }>(cfg, `/auth/v1/factors/${factorId}/challenge`, { method: 'POST', token, body: '{}' });
  const verified = await call<{ access_token: string }>(cfg, `/auth/v1/factors/${factorId}/verify`, {
    method: 'POST',
    token,
    body: JSON.stringify({ challenge_id: challenge.id, code }),
  });
  return verified.access_token;
}

/** Revoke the browser's Supabase refresh token; the server already holds its own trust. */
export async function signOut(cfg: CloudConfig, token: string): Promise<void> {
  await fetch(`${cfg.url}/auth/v1/logout`, { method: 'POST', headers: { apikey: cfg.key, Authorization: `Bearer ${token}` } }).catch(() => undefined);
}
