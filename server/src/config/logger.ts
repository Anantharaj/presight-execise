import { pino, type DestinationStream, type Logger, type LoggerOptions } from 'pino';
import type { Env } from './env';

export type { Logger };

export const SERVICE_NAME = 'presight-server';

/** Never let credentials reach the log stream, even if a future serializer includes headers. */
export const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  '*.password',
  '*.token',
  '*.secret',
];

export function createLogger(
  env: Pick<Env, 'LOG_LEVEL' | 'NODE_ENV'>,
  destination?: DestinationStream,
): Logger {
  const pretty = env.NODE_ENV === 'development' && !destination;
  const options: LoggerOptions = {
    level: env.LOG_LEVEL,
    base: { service: SERVICE_NAME, env: env.NODE_ENV },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: { paths: REDACT_PATHS, censor: '[REDACTED]' },
    ...(pretty
      ? { transport: { target: 'pino-pretty', options: { colorize: true, singleLine: true } } }
      : // Textual levels ("level":"info") are what log aggregators index; pino forbids this with transports.
        { formatters: { level: (label) => ({ level: label }) } }),
  };
  return destination ? pino(options, destination) : pino(options);
}
