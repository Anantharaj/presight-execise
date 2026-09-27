import compression from 'compression';
import express, { type Express } from 'express';
import helmet from 'helmet';
import type { Container } from './container';
import { httpLogger, requestContextMiddleware } from './logging/http-logger';
import { errorHandler } from './middlewares/error-handler.middleware';
import { notFoundHandler } from './middlewares/not-found.middleware';
import { createApiRouter } from './routes';

export interface AppDependencies {
  container: Container;
}

export function createApp({ container }: AppDependencies): Express {
  const app = express();

  app.disable('x-powered-by');
  // Runs behind the nginx reverse proxy.
  app.set('trust proxy', 1);

  app.use(httpLogger(container.logger));
  app.use(requestContextMiddleware);
  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', createApiRouter(container));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
