import {
  API_ROUTES,
  MAX_CLIENT_LOG_BATCH,
  MAX_CLIENT_LOG_MESSAGE,
  MAX_CLIENT_LOG_STACK,
  type ClientLogEvent,
  type ClientLogLevel,
} from '@presight/shared';
import { env } from '@/config/env';

export type LogLevel = 'debug' | ClientLogLevel;
export type LogContext = NonNullable<ClientLogEvent['context']>;

export interface LogDetails {
  error?: unknown;
  /** Server request id of a failed API call. */
  requestId?: string;
  /** Flat, non-personal context such as `{ component: 'UserList' }`. */
  context?: LogContext;
}

export interface LogTransport {
  send(events: ClientLogEvent[]): void;
}

export interface Logger {
  debug(message: string, details?: LogDetails): void;
  info(message: string, details?: LogDetails): void;
  warn(message: string, details?: LogDetails): void;
  error(message: string, details?: LogDetails): void;
  /** Sends queued remote events immediately (e.g. when the page is hidden). */
  flush(): void;
}

export interface LoggerOptions {
  consoleLevel: LogLevel | 'silent';
  remoteLevel: ClientLogLevel | 'silent';
  transport?: LogTransport;
  flushIntervalMs?: number;
}

const RANK: Record<LogLevel | 'silent', number> = { debug: 10, info: 20, warn: 30, error: 40, silent: 99 };

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function toEvent(level: ClientLogLevel, message: string, details: LogDetails): ClientLogEvent {
  const { error, requestId, context } = details;
  const stack = error instanceof Error ? error.stack : undefined;
  const reason = error instanceof Error ? error.message : error === undefined ? '' : String(error);
  return {
    level,
    message: truncate(reason && reason !== message ? `${message}: ${reason}` : message, MAX_CLIENT_LOG_MESSAGE),
    timestamp: new Date().toISOString(),
    url: truncate(window.location.href, 2048),
    ...(stack && { stack: truncate(stack, MAX_CLIENT_LOG_STACK) }),
    ...(requestId && { requestId }),
    ...(context && { context }),
  };
}

/** Level-filtered logger: writes to the console and batches remote events to a transport. */
export function createLogger({
  consoleLevel,
  remoteLevel,
  transport,
  flushIntervalMs = 5_000,
}: LoggerOptions): Logger {
  let queue: ClientLogEvent[] = [];
  let timer: ReturnType<typeof setTimeout> | undefined;

  function flush() {
    clearTimeout(timer);
    timer = undefined;
    if (queue.length === 0 || !transport) return;
    const events = queue;
    queue = [];
    transport.send(events);
  }

  function log(level: LogLevel, message: string, details: LogDetails = {}) {
    if (RANK[level] >= RANK[consoleLevel]) {
      // The single place allowed to touch the console.
      // eslint-disable-next-line no-console
      console[level](`[${level}] ${message}`, details);
    }
    if (level === 'debug' || !transport || RANK[level] < RANK[remoteLevel]) return;

    queue.push(toEvent(level, message, details));
    if (queue.length >= MAX_CLIENT_LOG_BATCH) flush();
    else timer ??= setTimeout(flush, flushIntervalMs);
  }

  return {
    debug: (message, details) => log('debug', message, details),
    info: (message, details) => log('info', message, details),
    warn: (message, details) => log('warn', message, details),
    error: (message, details) => log('error', message, details),
    flush,
  };
}

/** Posts batches to the API; `sendBeacon` survives page unloads, `fetch` + keepalive is the fallback. */
export function beaconTransport(url = `${env.apiBaseUrl}${API_ROUTES.clientLogs}`): LogTransport {
  return {
    send(events) {
      const body = JSON.stringify({ events });
      // text/plain keeps the request "simple" (no CORS preflight) if the API is on another origin.
      const sent = navigator.sendBeacon?.(url, new Blob([body], { type: 'text/plain' }));
      if (!sent) {
        void fetch(url, {
          method: 'POST',
          body,
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
        }).catch(() => undefined);
      }
    },
  };
}

export const logger = createLogger({
  consoleLevel: import.meta.env.DEV ? 'debug' : 'error',
  remoteLevel: 'warn',
  transport: import.meta.env.MODE === 'test' ? undefined : beaconTransport(),
});
