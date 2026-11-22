// Run: node --test tests/frontend/webrtc-ice-sse-fallback.test.mjs   (bundles api.ts with esbuild via npx)
// A reverse proxy that buffers text/event-stream never fires EventSource.onerror, so the client
// must fall back to polling /ice on its own when no candidate arrives.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = join(mkdtempSync(join(tmpdir(), 'ice-sse-')), 'api.mjs');
execFileSync('npx', ['--yes', 'esbuild@0.24.0', resolve('web-src/webrtc/api.ts'), '--bundle', '--format=esm', `--outfile=${out}`], { shell: true, stdio: 'pipe' });

test('polls /ice when the SSE stream stays silent', async () => {
  const polls = [];
  globalThis.window = globalThis;
  globalThis.EventSource = class { addEventListener() {} close() {} };
  globalThis.fetch = async (url) => {
    polls.push(String(url));
    return new Response(JSON.stringify({ status: true, candidates: [{ sdpMid: '0', sdpMLineIndex: 0, candidate: 'candidate:1 1 udp 1 1.2.3.4 5 typ host', index: 1 }], next_since: 1 }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const { WebRtcHttpApi } = await import(pathToFileURL(out).href);
  const got = [];
  const stop = new WebRtcHttpApi().subscribeRemoteCandidates('sid', (c) => got.push(c));
  await new Promise((r) => setTimeout(r, 4500));
  stop();
  assert.ok(polls.some((u) => u.includes('/ice?') && !u.includes('/ice/stream')), `no /ice poll, saw: ${polls}`);
  assert.equal(got.length >= 1, true);
});
