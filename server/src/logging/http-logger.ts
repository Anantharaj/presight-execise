import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { RequestHandler } from 'express';
import { pinoHttp } from 'pino-http';
import { API_ROUTES, REQUEST_ID_HEADER } from '@presight/shared';
import type { Logger } from '../config/logger';
import { requestContext } from './request-context';

// Reject arbitrary client input so ids stay safe to log and echo.
const VALID_REQUEST_ID = /^[A-Za-z0-9._-]{8,128}$/;

export function resolveRequestId(incoming: string | string[] | undefined): string {
  return typeof incoming === 'string' && VALID_REQUEST_ID.test(incoming) ? incoming : randomUUID();
}

// Express rewrites req.url inside mounted routers; originalUrl keeps the full path.
function originalUrl(req: IncomingMessage): string | undefined {
  return (req as IncomingMessage & { originalUrl?: string }).originalUrl ?? req.url;
}

/** One access-log line per request, with a correlation id and a status-based level. */
export function httpLogger(logger: Logger): RequestHandler {
  return pinoHttp({
    logger,
    genReqId: (req: IncomingMessage, res: ServerResponse) => {
      const id = resolveRequestId(req.headers[REQUEST_ID_HEADER]);
      res.setHeader(REQUEST_ID_HEADER, id);
      return id;
    },
    customAttributeKeys: { reqId: 'reqId', responseTime: 'durationMs' },
    // Binds `reqId` onto req.log so every line logged during the request carries it.
    quietReqLogger: true,
    autoLogging: { ignore: (req) => req.url === API_ROUTES.health },
    customLogLevel: (_req, res, err) =>
      err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
    customSuccessMessage: (req, res) => `${req.method} ${originalUrl(req)} ${res.statusCode}`,
    customErrorMessage: (req, res) => `${req.method} ${originalUrl(req)} ${res.statusCode}`,
    // Compact shapes instead of full headers: less noise and no accidental secrets.
    serializers: {
      req: (req: { method: string; url: string; remoteAddress?: string; headers: Record<string, unknown>; raw?: { ip?: string } }) => ({
        method: req.method,
        url: req.url,
        // Express's req.ip honours `trust proxy`, so this is the real client, not nginx.
        remoteAddress: req.raw?.ip ?? req.remoteAddress,
        userAgent: req.headers['user-agent'],
      }),
      res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
    },
  });
}

/** Exposes the request-scoped logger to services and repositories via AsyncLocalStorage. */
export const requestContextMiddleware: RequestHandler = (req, _res, next) => {
  requestContext.run({ requestId: String(req.id), logger: req.log }, next);
};
