import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, httpGet, toSearchParams } from './http';

afterEach(() => vi.unstubAllGlobals());

describe('toSearchParams', () => {
  it('repeats array keys and omits empty values', () => {
    expect(toSearchParams({ a: ['x', 'y'], b: '', c: undefined, d: 1 }).toString()).toBe('a=x&a=y&d=1');
  });
});

describe('httpGet', () => {
  it('throws an ApiError carrying the server code and request id', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Invalid' } },
          { status: 400, headers: { 'X-Request-Id': 'req-abcdef12' } },
        ),
      ),
    );
    const error = await httpGet('/api/users').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 400, code: 'VALIDATION_ERROR', requestId: 'req-abcdef12' });
  });

  it('maps network failures to NETWORK_ERROR', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(httpGet('/api/users')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' });
  });
});
