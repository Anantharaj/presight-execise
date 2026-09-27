import type { ApiErrorBody } from '@presight/shared';
import { env } from '@/config/env';

export type QueryValue = string | number | boolean | null | undefined | readonly string[];

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Arrays become repeated keys (`?hobby=a&hobby=b`); empty values are omitted. */
export function toSearchParams(query: Record<string, QueryValue>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
    else params.set(key, String(value));
  }
  return params;
}

export async function httpGet<T>(
  path: string,
  query: Record<string, QueryValue> = {},
  signal?: AbortSignal,
): Promise<T> {
  const qs = toSearchParams(query).toString();
  const url = `${env.apiBaseUrl}${path}${qs ? `?${qs}` : ''}`;

  let response: Response;
  try {
    response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(0, 'NETWORK_ERROR', 'Unable to reach the server. Check your connection.');
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(
      response.status,
      body?.error.code ?? 'HTTP_ERROR',
      body?.error.message ?? `Request failed with status ${response.status}`,
    );
  }
  return (await response.json()) as T;
}
