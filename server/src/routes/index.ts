import { Router } from 'express';
import type { Container } from '../container';
import { createClientLogRoutes } from './client-log.routes';
import { createUserRoutes } from './user.routes';

/** Mounted at `/api`. Register new resource routers here. */
export function createApiRouter(container: Container): Router {
  const router = Router();
  router.get('/health', container.controllers.health.check);
  router.use('/users', createUserRoutes(container.controllers.user));
  router.use(
    '/client-logs',
    createClientLogRoutes(container.controllers.clientLog, container.config.clientLogsPerMinute),
  );
  return router;
}
