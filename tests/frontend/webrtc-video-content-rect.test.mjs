// Run: node --test tests/frontend/webrtc-video-content-rect.test.mjs   (bundles input.ts with esbuild via npx)
// Pointer -> host mapping must follow the video's object-fit (Ajustar / Rellenar / Estirar), or clicks land off target.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = join(mkdtempSync(join(tmpdir(), 'rect-')), 'input.mjs');
execFileSync('npx', ['--yes', 'esbuild@0.24.0', resolve('web-src/webrtc/input.ts'), '--bundle', '--format=esm', `--outfile=${out}`], { shell: true, stdio: 'pipe' });

globalThis.DOMRect = class { constructor(x, y, w, h) { Object.assign(this, { left: x, top: y, width: w, height: h }); } };
globalThis.window = globalThis;
globalThis.navigator ??= {};
const { videoContentRect } = await import(pathToFileURL(out).href);

// 1000x500 box, 1920x1080 (16:9) video.
const el = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 500 }) };
const video = (fit) => ({ videoWidth: 1920, videoHeight: 1080, style: { objectFit: fit } });
const r = (fit) => { const c = videoContentRect(el, video(fit)); return [c.left, c.top, c.width, c.height].map((v) => Math.round(v)); };

test('contain letterboxes inside the box', () => assert.deepEqual(r('contain'), [56, 0, 889, 500]));
test('cover overflows the box on one axis', () => assert.deepEqual(r('cover'), [0, -31, 1000, 563]));
test('fill is the box itself', () => assert.deepEqual(r('fill'), [0, 0, 1000, 500]));
