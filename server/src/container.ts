import type { Logger } from './config/logger';
import type { Database } from './db/connection';
import { ClientLogController } from './controllers/client-log.controller';
import { HealthController } from './controllers/health.controller';
import { UserController } from './controllers/user.controller';
import { SqliteUserRepository } from './repositories/user.repository';
import { ClientLogService } from './services/client-log.service';
import { UserService } from './services/user.service';

export interface ContainerOptions {
  logger: Logger;
  slowQueryMs: number;
  clientLogsPerMinute: number;
}

/** Composition root: wires repositories → services → controllers. */
export function createContainer(db: Database, { logger, slowQueryMs, clientLogsPerMinute }: ContainerOptions) {
  const repositories = {
    user: new SqliteUserRepository(db, logger, slowQueryMs),
  };
  const services = {
    user: new UserService(repositories.user),
    clientLog: new ClientLogService(logger),
  };
  const controllers = {
    health: new HealthController(db),
    user: new UserController(services.user),
    clientLog: new ClientLogController(services.clientLog),
  };
  return { logger, config: { clientLogsPerMinute }, repositories, services, controllers };
}

export type Container = ReturnType<typeof createContainer>;
