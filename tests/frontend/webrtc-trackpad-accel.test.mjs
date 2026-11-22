// Run: node --test tests/frontend/webrtc-trackpad-accel.test.mjs   (bundles touch.ts with esbuild via npx)
// Slow drags keep the base gain (precision); quick flicks multiply it, capped, so one swipe crosses the screen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = join(mkdtempSync(join(tmpdir(), 'accel-')), 'touch.mjs');
execFileSync('npx', ['--yes', 'esbuild@0.24.0', resolve('web-src/webrtc/touch.ts'), '--bundle', '--format=esm', `--outfile=${out}`], { shell: true, stdio: 'pipe' });
globalThis.window = globalThis;
const { trackpadAccel } = await import(pathToFileURL(out).href);

test('slow drags keep the base gain', () => assert.equal(trackpadAccel(0.1), 1));
test('speed raises the gain monotonically', () => assert.ok(trackpadAccel(0.6) > 1 && trackpadAccel(1.2) > trackpadAccel(0.6)));
test('fast flicks are capped at 3.5x', () => assert.equal(trackpadAccel(50), 3.5));
