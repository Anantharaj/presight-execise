import compression from 'compression';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import type { Logger } from './config/logger';
import type { Container } from './container';
import { errorHandler } from './middlewares/error-handler.middleware';
import { notFoundHandler } from './middlewares/not-found.middleware';
import { createApiRouter } from './routes';

export interface AppDependencies {
  container: Container;
  logger: Logger;
}

export function createApp({ container, logger }: AppDependencies): Express {
  const app = express();

  app.disable('x-powered-by');
  // Runs behind the nginx reverse proxy.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(compression());
  app.use(pinoHttp({ logger }));
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', createApiRouter(container));

  app.use(notFoundHandler);
  app.use(errorHandler(logger));

  return app;
}
