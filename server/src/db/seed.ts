/**
 * CLI: (re)creates the SQLite database and seeds it.
 * Usage: `yarn db:seed` (dev) or `node dist/seed.js` (prod image).
 */
import { loadEnv } from '../config/env';
import { createLogger } from '../config/logger';
import { openDatabase } from './connection';
import { runMigrations } from './migrations';
import { seedDatabase } from './seed/seeder';

const env = loadEnv();
const logger = createLogger(env).child({ module: 'seed' });
const db = openDatabase(env.DB_PATH);

try {
  runMigrations(db);
  const started = performance.now();
  const users = seedDatabase(db, { userCount: env.SEED_USER_COUNT, randomSeed: env.SEED_RANDOM_SEED });
  logger.info(
    { users, dbPath: env.DB_PATH, durationMs: Math.round(performance.now() - started) },
    'Database seeded',
  );
} finally {
  db.close();
}
