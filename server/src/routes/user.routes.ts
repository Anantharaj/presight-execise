import { Router } from 'express';
import type { UserController } from '../controllers/user.controller';

export function createUserRoutes(controller: UserController): Router {
  const router = Router();
  router.get('/', controller.list);
  router.get('/facets', controller.facets);
  return router;
}
