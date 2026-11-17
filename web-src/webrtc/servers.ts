// Account servers (own, shared, Co-Op) read from JUJO.CLOUD during the sign-in handshake and cached
// per origin: the browser signs out of Supabase right after, so this is the only moment it can read them.
import type { CloudConfig } from './cloud';
import { storage, store } from './ui/shell';

export type ServerKind = 'own' | 'shared' | 'coop';

export interface ServerEntry {
  uuid?: string;
  name: string;
  url: string; // LAN origin, e.g. https://192.168.1.10:47990
  external?: string; // WAN host:port
  lastSeen?: string;
  streaming: boolean;
  kind: ServerKind;
  role?: string; // member role for shared / Co-Op
  expiresAt?: string; // Co-Op invite end
  syncedAt?: string; // when lastSeen/streaming were read: status is a snapshot from then
}

export interface AppInfo {
  id?: string;
  uuid?: string;
  name?: string;
  genres?: string[];
  description?: string;
  developer?: string;
  publisher?: string;
  'release-date'?: string;
  'image-path'?: string;
  'image-path-hires'?: string;
  'hero-image-path'?: string;
}

export interface Library {
  apps: AppInfo[];
  currentApp?: string;
  hostUuid?: string;
  hostName?: string;
}

const KEY = 'jujo.webrtc.servers';
const SUB_KEY = 'jujo.webrtc.servers.sub'; // account the cache belongs to
const ONLINE_MS = 2 * 60 * 1000;

type Row = {
  server_url: string;
  server_name?: string | null;
  server_uuid?: string | null;
  external_address?: string | null;
  last_seen_at?: string | null;
  is_streaming?: boolean | null;
  role?: string | null;
  expires_at?: string | null;
};

async function rest<T>(cfg: CloudConfig, token: string, path: string, rpc = false): Promise<T> {
  const res = await fetch(cfg.url + path, {
    method: rpc ? 'POST' : 'GET',
    headers: { apikey: cfg.key, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: rpc ? '{}' : undefined,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

const parseUrl = (u: string) => {
  try {
    return new URL(u);
  } catch {
    return undefined;
  }
};
/** "ip:port" -> URL-safe host (IPv6 gets brackets). */
const normalizeExternal = (e?: string | null) => {
  if (!e) return undefined;
  const m = /^\[?([0-9a-f:]+)\]?:(\d+)$/i.exec(e);
  return m && m[1].includes(':') ? `[${m[1]}]:${m[2]}` : e;
};
const hostOf = (hostPort?: string) => hostPort?.replace(/:\d+$/, '');

const entry = (r: Row, kind: ServerKind, syncedAt: string): ServerEntry | undefined => {
  const url = parseUrl(r.server_url);
  if (!url || !/^https?:$/.test(url.protocol)) return undefined; // one malformed row must not hide the rest
  return {
  uuid: r.server_uuid ?? undefined,
  name: r.server_name || url.hostname,
  url: url.origin,
  external: normalizeExternal(r.external_address),
  lastSeen: r.last_seen_at ?? undefined,
  streaming: !!r.is_streaming,
  kind,
  role: kind === 'own' ? undefined : r.role ?? undefined,
  expiresAt: r.expires_at ?? undefined,
  syncedAt,
  };
};

function jwtSub(token: string): string | undefined {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).sub;
  } catch {
    return undefined;
  }
}

/** Called with the aal2 token before the browser signs out of Supabase. Never throws: a failed
 *  read keeps the previous cache, and the focus mode still shows this server. */
export async function syncServers(cfg: CloudConfig, token: string): Promise<ServerEntry[]> {
  const cols = 'server_url,server_name,server_uuid,external_address,last_seen_at,is_streaming';
  const [own, shared, coop] = await Promise.all([
    rest<Row[]>(cfg, token, `/rest/v1/user_server_profiles?select=${cols}&order=display_order.asc`).catch(() => undefined),
    rest<Row[]>(cfg, token, '/rest/v1/rpc/shared_server_profiles', true).catch(() => undefined),
    rest<Row[]>(cfg, token, '/rest/v1/rpc/active_coop_shared_servers', true).catch(() => undefined),
  ]);
  // Another account on this browser: never show the previous account's servers.
  const sub = jwtSub(token);
  if (sub && storage<string | undefined>(SUB_KEY, undefined) !== sub) clearServers();
  if (sub) store(SUB_KEY, sub);
  if (!own && !shared && !coop) return cachedServers();
  const syncedAt = new Date().toISOString();
  const seen = new Set<string>();
  const list: ServerEntry[] = [];
  for (const [rows, kind] of [[own, 'own'], [shared, 'shared'], [coop, 'coop']] as const) {
    for (const r of rows ?? []) {
      const id = r.server_uuid || r.server_url;
      const e = r.server_url && !seen.has(id) ? entry(r, kind, syncedAt) : undefined;
      if (!e) continue;
      seen.add(id);
      list.push(e);
    }
  }
  store(KEY, list);
  return list;
}

export const cachedServers = (): ServerEntry[] => storage<ServerEntry[]>(KEY, []);
export const clearServers = () => store(KEY, undefined);

/** Online at sync time (lastSeen within 2 min of the read). A snapshot, never a live probe. */
export function isOnline(s: ServerEntry): boolean {
  const ref = s.syncedAt ? Date.parse(s.syncedAt) : Date.now();
  return !!s.lastSeen && ref - Date.parse(s.lastSeen) < ONLINE_MS;
}

const isPrivateHost = (host: string) =>
  /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[::1\]|\[f[cd])/i.test(host) || host.endsWith('.local');

/** Where server s's /webrtc lives as seen from here (here = this server, index 0 of the focus list).
 *  LAN origin only when we are on a LAN and s sits behind the same NAT as this server (same public IP);
 *  a shared server on someone else's network always goes through its external address.
 *  '#play' tells that page to open its launcher straight away (the server was already chosen here). */
export function webrtcUrl(s: ServerEntry, here?: ServerEntry): string {
  const sameNat = !!s.external && hostOf(s.external) === hostOf(here?.external);
  const lan = !s.external || (isPrivateHost(location.hostname) && (sameNat || (!here?.external && s.kind === 'own')));
  return `${lan ? s.url : `https://${s.external}`}/webrtc#play`;
}

let library: Promise<Library> | undefined;
/** /api/apps, fetched once per page (refresh = true after a stream, to pick up current_app). */
export function getLibrary(refresh = false): Promise<Library> {
  if (!library || refresh) {
    const req = fetch('/api/apps', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((b: any) => ({
        apps: Array.isArray(b.apps) ? b.apps : [],
        currentApp: b.current_app || undefined,
        hostUuid: b.host_uuid || undefined,
        hostName: b.host_name || undefined,
      }));
    // A failed read is not cached: the next screen asks again.
    library = req.catch(() => ((library = undefined), { apps: [] }));
  }
  return library;
}

/** This server first (index 0), then the rest in account order. Adds this server when the cache lacks it. */
export async function serversForFocus(guestRole?: string): Promise<ServerEntry[]> {
  const lib = await getLibrary();
  const list = cachedServers();
  const i = list.findIndex((s) => (lib.hostUuid && s.uuid === lib.hostUuid) || parseUrl(s.url)?.host === location.host || s.external === location.host);
  const here: ServerEntry =
    i >= 0
      ? list.splice(i, 1)[0]
      : { name: lib.hostName || location.hostname, url: location.origin, streaming: false, kind: guestRole ? 'shared' : 'own', role: guestRole, uuid: lib.hostUuid };
  here.lastSeen = here.syncedAt = new Date().toISOString(); // we are talking to it right now
  return [here, ...list];
}
