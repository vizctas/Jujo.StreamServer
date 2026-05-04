import { beforeEach, describe, expect, test, vi } from 'vitest';

describe('HTTP auth token storage', () => {
  beforeEach(() => {
    vi.resetModules();
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  test('stores refresh token in durable storage when remember me is enabled', async () => {
    const { applyLoginResponse } = await import('@web/http');

    applyLoginResponse(
      {
        token: 'session-token',
        refresh_token: 'refresh-token',
        remember_me: true,
      },
      true,
    );

    expect(window.sessionStorage.getItem('__jujo_session')).toBe('session-token');
    expect(window.localStorage.getItem('__jujo_refresh')).toBe('refresh-token');
    expect(window.localStorage.getItem('sunshine.auth.remember')).toBe('1');
  });

  test('keeps non-remembered refresh token in session storage only', async () => {
    const { applyLoginResponse } = await import('@web/http');

    applyLoginResponse(
      {
        token: 'session-token',
        refresh_token: 'refresh-token',
        remember_me: false,
      },
      false,
    );

    expect(window.sessionStorage.getItem('__jujo_session')).toBe('session-token');
    expect(window.sessionStorage.getItem('__jujo_refresh')).toBe('refresh-token');
    expect(window.localStorage.getItem('__jujo_refresh')).toBeNull();
    expect(window.localStorage.getItem('sunshine.auth.remember')).toBeNull();
  });
});
