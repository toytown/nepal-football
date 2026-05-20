import type { ApiError } from '@nepal-football/shared';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch (err) {
    throw new ApiClientError(0, 'NETWORK', err instanceof Error ? err.message : 'Network error');
  }

  const text = await res.text();
  let body: unknown = undefined;
  if (text.length > 0) {
    try { body = JSON.parse(text); } catch { /* leave undefined */ }
  }

  if (!res.ok) {
    const apiErr = body as ApiError | undefined;
    const code = apiErr?.error?.code ?? `HTTP_${res.status}`;
    const message = apiErr?.error?.message ?? res.statusText;
    throw new ApiClientError(res.status, code, message);
  }

  return body as T;
}
