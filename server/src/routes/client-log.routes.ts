import express, { Router } from 'express';
import type { ClientLogController } from '../controllers/client-log.controller';
import { rateLimiter } from '../middlewares/rate-limit.middleware';

export function createClientLogRoutes(controller: ClientLogController, perMinute: number): Router {
  const router = Router();
  // sendBeacon may post as text/plain, so accept both content types.
  router.post(
    '/',
    rateLimiter({ limit: perMinute }),
    express.json({ limit: '64kb', type: ['application/json', 'text/plain'] }),
    controller.ingest,
  );
  return router;
}
