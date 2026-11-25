// Run: node --test tests/frontend/webrtc-stats-deltas.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = join(mkdtempSync(join(tmpdir(), 'webrtc-stats-')), 'client.mjs');
execFileSync('npx', ['--yes', 'esbuild@0.24.0', resolve('web-src/webrtc/client.ts'), '--bundle', '--format=esm', `--outfile=${out}`], { shell: true, stdio: 'pipe' });

test('reports native jitter-buffer, dropped-frame and freeze counter deltas; handles reset and stream replacement', async () => {
  const { WebRtcClient } = await import(pathToFileURL(out).href);
  const client = Object.create(WebRtcClient.prototype);
  client.statsState = {};
  const sample = (id, delay, emitted, dropped, freezeCount) => {
    const inbound = { type: 'inbound-rtp', kind: 'video', id, jitterBufferDelay: delay, jitterBufferEmittedCount: emitted, framesDropped: dropped, freezeCount, framesDecoded: 10, totalDecodeTime: 0.1 };
    const entries = [inbound];
    return { forEach: (fn) => entries.forEach(fn), get: () => undefined };
  };
  const first = client.extractStats(sample('v1', 1, 10, 2, 1));
  assert.equal(first.videoJitterBufferMs, undefined);
  assert.equal(first.videoFramesDroppedDelta, undefined);
  assert.equal(first.videoFreezeCountDelta, undefined);
  const next = client.extractStats(sample('v1', 1.6, 20, 5, 2));
  assert.ok(Math.abs(next.videoJitterBufferMs - 60) < 0.001);
  assert.equal(next.videoFramesDroppedDelta, 3);
  assert.equal(next.videoFreezeCountDelta, 1);
  const reset = client.extractStats(sample('v1', 0.1, 1, 0, 0));
  assert.equal(reset.videoJitterBufferMs, undefined);
  assert.equal(reset.videoFramesDroppedDelta, undefined);
  assert.equal(reset.videoFreezeCountDelta, undefined);
  const changed = client.extractStats(sample('v2', 0.5, 5, 4, 3));
  assert.equal(changed.videoJitterBufferMs, undefined);
  assert.equal(changed.videoFramesDroppedDelta, undefined);
  assert.equal(changed.videoFreezeCountDelta, undefined);
});
