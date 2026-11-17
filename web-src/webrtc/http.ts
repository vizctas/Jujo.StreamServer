// Minimal axios-shaped fetch shim for api.ts (only what it uses: params + non-throwing status).
type Cfg = { params?: Record<string, string | number> };
export interface HttpResponse<T> {
  status: number;
  data: T;
}

async function request<T>(method: string, url: string, body?: unknown, cfg: Cfg = {}): Promise<HttpResponse<T>> {
  const q = cfg.params ? '?' + new URLSearchParams(Object.entries(cfg.params).map(([k, v]) => [k, String(v)])) : '';
  const res = await fetch(url + q, {
    method,
    credentials: 'same-origin',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401) window.dispatchEvent(new Event('jujo-unauthorized'));
  const text = await res.text();
  let data: unknown = text;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    /* non-JSON body */
  }
  return { status: res.status, data: data as T };
}

export const http = {
  get: <T = any>(url: string, cfg?: Cfg) => request<T>('GET', url, undefined, cfg),
  post: <T = any>(url: string, body?: unknown, cfg?: Cfg) => request<T>('POST', url, body ?? {}, cfg),
  delete: <T = any>(url: string, cfg?: Cfg) => request<T>('DELETE', url, undefined, cfg),
};
