// Run: node --test tests/frontend/webrtc-servers-host-fallback.test.mjs   (bundles servers.ts with esbuild via npx)
// When /api/apps fails (PC dozing, flaky link), Focus must still recognise this server from the last
// identity it learned, instead of inventing a server named after the domain.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = join(mkdtempSync(join(tmpdir(), 'servers-host-')), 'servers.mjs');
execFileSync('npx', ['--yes', 'esbuild@0.24.0', resolve('web-src/webrtc/servers.ts'), '--bundle', '--format=esm', '--loader:.css=empty', `--outfile=${out}`], { shell: true, stdio: 'pipe' });

test('uses the last known host identity when /api/apps fails', async () => {
  const mem = new Map();
  globalThis.window = globalThis;
  globalThis.localStorage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
  globalThis.location = { host: 'jujowebrtc.example.org', hostname: 'jujowebrtc.example.org', origin: 'https://jujowebrtc.example.org' };
  mem.set('jujo.webrtc.servers', JSON.stringify([
    { uuid: 'D9DB', name: 'JUJOPC', url: 'https://192.168.3.6:46990', streaming: false, kind: 'own' },
    { uuid: 'E3B9', name: 'JulyTower', url: 'https://192.168.3.30:47990', streaming: false, kind: 'own' },
  ]));
  let up = true;
  globalThis.fetch = async () => (up ? new Response(JSON.stringify({ apps: [], host_uuid: 'D9DB', host_name: 'JUJOPC' }), { status: 200 }) : Promise.reject(new TypeError('network')));
  const { getLibrary, serversForFocus } = await import(pathToFileURL(out).href);
  await getLibrary(true); // a good read teaches the identity
  up = false;
  await getLibrary(true); // the next read fails
  const list = await serversForFocus();
  assert.deepEqual(list.map((s) => s.name), ['JUJOPC', 'JulyTower']);
});
