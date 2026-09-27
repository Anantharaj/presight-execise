import type { Database } from './db/connection';
import { HealthController } from './controllers/health.controller';
import { UserController } from './controllers/user.controller';
import { SqliteUserRepository } from './repositories/user.repository';
import { UserService } from './services/user.service';

/** Composition root: wires repositories → services → controllers. */
export function createContainer(db: Database) {
  const repositories = {
    user: new SqliteUserRepository(db),
  };
  const services = {
    user: new UserService(repositories.user),
  };
  const controllers = {
    health: new HealthController(db),
    user: new UserController(services.user),
  };
  return { repositories, services, controllers };
}

export type Container = ReturnType<typeof createContainer>;
