import { createApp } from './app';
import { loadEnv } from './config/env';
import { createLogger } from './config/logger';
import { createContainer } from './container';
import { openDatabase } from './db/connection';
import { runMigrations } from './db/migrations';
import { isDatabaseEmpty, seedDatabase } from './db/seed/seeder';

const env = loadEnv();
const logger = createLogger(env);

// Log crashes as structured `fatal` events, then exit so the orchestrator restarts a clean process.
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'Unhandled promise rejection');
  process.exit(1);
});

const db = openDatabase(env.DB_PATH);
const applied = runMigrations(db);
if (applied.length) logger.info({ applied }, 'Applied database migrations');

if (env.SEED_ON_START && isDatabaseEmpty(db)) {
  logger.info({ users: env.SEED_USER_COUNT }, 'Database is empty, seeding…');
  const started = performance.now();
  seedDatabase(db, { userCount: env.SEED_USER_COUNT, randomSeed: env.SEED_RANDOM_SEED });
  logger.info({ durationMs: Math.round(performance.now() - started) }, 'Database seeded');
}

const container = createContainer(db, {
  logger,
  slowQueryMs: env.SLOW_QUERY_MS,
  clientLogsPerMinute: env.CLIENT_LOGS_PER_MINUTE,
});
const app = createApp({ container });
const server = app.listen(env.PORT, env.HOST, () => {
  logger.info({ host: env.HOST, port: env.PORT, logLevel: env.LOG_LEVEL }, 'API listening');
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
