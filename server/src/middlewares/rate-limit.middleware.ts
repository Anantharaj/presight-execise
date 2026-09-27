import type { RequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';
import { HttpError } from '../utils/http-error';

/** Per-IP fixed window limiter (in memory; swap the store for Redis when running several replicas). */
export function rateLimiter({ limit, windowMs = 60_000 }: { limit: number; windowMs?: number }): RequestHandler {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) => next(new HttpError(429, 'RATE_LIMITED', 'Too many requests')),
  });
}
