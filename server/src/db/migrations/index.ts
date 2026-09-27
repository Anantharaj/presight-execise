import { transaction, type Database } from '../connection';
import { initialSchema } from './001_initial_schema';
import type { Migration } from './types';

/** Append new migrations here; never edit one that has already shipped. */
export const migrations: Migration[] = [initialSchema];

export function runMigrations(db: Database, list: Migration[] = migrations): number[] {
  const { user_version: current } = db.prepare('PRAGMA user_version').get() as {
    user_version: number;
  };

  const pending = list.filter((m) => m.version > current).sort((a, b) => a.version - b.version);

  for (const migration of pending) {
    transaction(db, () => {
      db.exec(migration.up);
      db.exec(`PRAGMA user_version = ${migration.version}`);
    });
  }
  return pending.map((m) => m.version);
}
