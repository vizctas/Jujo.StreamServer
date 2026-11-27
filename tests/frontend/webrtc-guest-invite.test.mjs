// Run: node --test tests/frontend/webrtc-guest-invite.test.mjs   (bundles invite.ts + access.ts with esbuild via npx)
// Guest codes from "#invite=..." / the sign-in field, the redeem result -> UI state mapping, and the launch gate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = mkdtempSync(join(tmpdir(), 'invite-'));
const bundle = (name) => {
  const out = join(dir, `${name}.mjs`);
  execFileSync('npx', ['--yes', 'esbuild@0.24.0', resolve(`web-src/webrtc/${name}.ts`), '--bundle', '--format=esm', `--outfile=${out}`], { shell: true, stdio: 'pipe' });
  return import(pathToFileURL(out).href);
};
const { normalizeCode, parseInviteFragment, redeemStep, waitOutcome, WAIT_MS } = await bundle('invite');
const { canLaunch } = await bundle('access');

test('normalizeCode accepts any case and separators, rejects wrong lengths', () => {
  assert.equal(normalizeCode('abcde-fghij'), 'ABCDE-FGHIJ');
  assert.equal(normalizeCode(' ab cde fghij '), 'ABCDE-FGHIJ');
  assert.equal(normalizeCode('ABCDE-FGHI'), undefined);
  assert.equal(normalizeCode('ABCDE-FGHIJK'), undefined);
  assert.equal(normalizeCode(''), undefined);
});

test('parseInviteFragment reads the invite from the fragment only', () => {
  assert.equal(parseInviteFragment('#invite=abcde-fghij'), 'ABCDE-FGHIJ');
  assert.equal(parseInviteFragment('#play&invite=ABCDEFGHIJ'), 'ABCDE-FGHIJ');
  assert.equal(parseInviteFragment('#invite=ABCDE%2DFGHIJ'), 'ABCDE-FGHIJ');
  assert.equal(parseInviteFragment('#play'), undefined);
  assert.equal(parseInviteFragment(''), undefined);
  assert.equal(parseInviteFragment('#invite=short'), undefined);
  assert.equal(parseInviteFragment('#invite=%E0%A4%A'), undefined);
});

test('redeemStep maps the RPC result to a UI state', () => {
  assert.deepEqual(redeemStep({ success: true, status: 'active', id: 'x' }), { kind: 'active' });
  assert.deepEqual(redeemStep({ success: true, status: 'requested', id: 'r1' }), { kind: 'waiting', id: 'r1' });
  for (const error of ['verify_email', 'invalid_or_expired', 'already_has_access']) {
    const s = redeemStep({ success: false, error });
    assert.equal(s.kind, 'error');
    assert.match(s.message, /^[A-ZÁÉÍÓÚ].*\.$/);
  }
  assert.notEqual(redeemStep({ success: false, error: 'verify_email' }).message, redeemStep({ success: false, error: 'invalid_or_expired' }).message);
  assert.equal(redeemStep({ success: false, error: 'something_new' }).kind, 'error');
  assert.equal(redeemStep({ success: true, status: 'requested' }).kind, 'error'); // no row id to poll or cancel
});

test('waitOutcome: active, declined, expired (status, vanished row or 10 min), else keep waiting', () => {
  assert.equal(waitOutcome('requested', 3000), 'waiting');
  assert.equal(waitOutcome('active', 3000), 'active');
  assert.equal(waitOutcome('active', WAIT_MS + 1), 'active');
  assert.equal(waitOutcome('declined', 3000), 'declined');
  assert.equal(waitOutcome('expired', 3000), 'expired');
  assert.equal(waitOutcome(undefined, 3000), 'expired');
  assert.equal(waitOutcome('requested', WAIT_MS), 'expired');
});

test('canLaunch follows permissions; older servers fall back to the guest role', () => {
  assert.equal(canLaunch({ permissions: ['admin'] }), true);
  assert.equal(canLaunch({ permissions: ['launch', 'guests'] }), true);
  assert.equal(canLaunch({ permissions: ['guests'], guestRole: 'operator' }), false);
  assert.equal(canLaunch({ permissions: [], guestRole: 'viewer' }), false);
  assert.equal(canLaunch({ guestRole: 'viewer' }), false);
  assert.equal(canLaunch({ guestRole: 'operator' }), true);
  assert.equal(canLaunch({}), true);
});
