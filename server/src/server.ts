import { createApp } from './app';
import { loadEnv } from './config/env';
import { createLogger } from './config/logger';
import { createContainer } from './container';
import { openDatabase } from './db/connection';
import { runMigrations } from './db/migrations';
import { isDatabaseEmpty, seedDatabase } from './db/seed/seeder';

const env = loadEnv();
const logger = createLogger(env);

const db = openDatabase(env.DB_PATH);
const applied = runMigrations(db);
if (applied.length) logger.info({ applied }, 'Applied database migrations');

if (env.SEED_ON_START && isDatabaseEmpty(db)) {
  logger.info({ users: env.SEED_USER_COUNT }, 'Database is empty, seeding…');
  seedDatabase(db, { userCount: env.SEED_USER_COUNT, randomSeed: env.SEED_RANDOM_SEED });
}

const app = createApp({ container: createContainer(db), logger });
const server = app.listen(env.PORT, env.HOST, () => {
  logger.info(`API listening on http://${env.HOST}:${env.PORT}`);
});

function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down');
  server.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
