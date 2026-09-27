/**
 * CLI: (re)creates the SQLite database and seeds it.
 * Usage: `yarn db:seed` (dev) or `node dist/seed.js` (prod image).
 */
import { loadEnv } from '../config/env';
import { openDatabase } from './connection';
import { runMigrations } from './migrations';
import { seedDatabase } from './seed/seeder';

const env = loadEnv();
const db = openDatabase(env.DB_PATH);

try {
  runMigrations(db);
  const started = performance.now();
  const count = seedDatabase(db, { userCount: env.SEED_USER_COUNT, randomSeed: env.SEED_RANDOM_SEED });
  const ms = Math.round(performance.now() - started);
  console.log(`Seeded ${count} users into ${env.DB_PATH} in ${ms}ms`);
} finally {
  db.close();
}
