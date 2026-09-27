import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_CLIENT_LOG_BATCH, MAX_CLIENT_LOG_MESSAGE, type ClientLogEvent } from '@presight/shared';
import { createLogger } from './logger';

function setup(options: Partial<Parameters<typeof createLogger>[0]> = {}) {
  const batches: ClientLogEvent[][] = [];
  const logger = createLogger({
    consoleLevel: 'silent',
    remoteLevel: 'warn',
    transport: { send: (events) => batches.push(events) },
    flushIntervalMs: 1_000,
    ...options,
  });
  return { logger, batches };
}

describe('client logger', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('only sends events at or above the remote level, batched on an interval', () => {
    const { logger, batches } = setup();
    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e', { requestId: 'req-12345678', context: { component: 'List' } });
    expect(batches).toHaveLength(0);

    vi.advanceTimersByTime(1_000);
    expect(batches).toHaveLength(1);
    expect(batches[0]!.map((e) => e.level)).toEqual(['warn', 'error']);
    expect(batches[0]![1]).toMatchObject({ requestId: 'req-12345678', context: { component: 'List' } });
  });

  it('flushes immediately when the batch is full', () => {
    const { logger, batches } = setup();
    for (let i = 0; i < MAX_CLIENT_LOG_BATCH; i++) logger.error(`e${i}`);
    expect(batches).toHaveLength(1);
    expect(batches[0]).toHaveLength(MAX_CLIENT_LOG_BATCH);
  });

  it('captures error messages and stacks and truncates long messages', () => {
    const { logger, batches } = setup();
    logger.error('Render failed', { error: new TypeError('x is undefined') });
    logger.error('y'.repeat(MAX_CLIENT_LOG_MESSAGE + 50));
    logger.flush();

    const [withError, long] = batches[0]!;
    expect(withError!.message).toBe('Render failed: x is undefined');
    expect(withError!.stack).toContain('TypeError');
    expect(long!.message).toHaveLength(MAX_CLIENT_LOG_MESSAGE);
  });

  it('writes to the console at or above the console level', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { logger } = setup({ consoleLevel: 'warn', transport: undefined });
    logger.info('hidden');
    logger.warn('shown');
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });
});
