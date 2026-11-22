// Run: node --test tests/frontend/webrtc-servers-loopback.test.mjs   (bundles servers.ts with esbuild via npx)
// Old Admin builds pushed each PC's "https://localhost:<port>" profile to JUJO.CLOUD. From any other
// device that address is the device itself, so the server list must never show those rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = join(mkdtempSync(join(tmpdir(), 'servers-')), 'servers.mjs');
execFileSync('npx', ['--yes', 'esbuild@0.24.0', resolve('web-src/webrtc/servers.ts'), '--bundle', '--format=esm', '--loader:.css=empty', `--outfile=${out}`], { shell: true, stdio: 'pipe' });

test('drops loopback rows from the account server list', async () => {
  const mem = new Map();
  globalThis.window = globalThis;
  globalThis.localStorage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
  globalThis.document = { addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], documentElement: { classList: { toggle() {} } } };
  const rows = [
    { server_url: 'https://localhost:47990', server_name: 'Local Server', server_uuid: null },
    { server_url: 'https://127.0.0.1:46990', server_name: null, server_uuid: null },
    { server_url: 'https://192.168.3.6:46990', server_name: 'JUJOPC', server_uuid: 'D9DB' },
  ];
  globalThis.fetch = async (url) => new Response(JSON.stringify(String(url).includes('user_server_profiles') ? rows : []), { status: 200 });
  const { syncServers } = await import(pathToFileURL(out).href);
  const list = await syncServers({ url: 'https://cloud.example', key: 'k' }, 'a.e30.b');
  assert.deepEqual(list.map((s) => s.name), ['JUJOPC']);
});
