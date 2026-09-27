import type { Server } from 'node:http';
import { pino } from 'pino';
import { createApp } from '../src/app';
import { createContainer } from '../src/container';
import { openDatabase, transaction, type Database } from '../src/db/connection';
import { runMigrations } from '../src/db/migrations';

export interface FixtureUser {
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
  hobbies: string[];
}

export function createTestDb(users: FixtureUser[] = []): Database {
  const db = openDatabase(':memory:');
  runMigrations(db);
  insertUsers(db, users);
  return db;
}

export function insertUsers(db: Database, users: FixtureUser[]) {
  const hobbyIds = new Map<string, number>();
  const insertHobby = db.prepare('INSERT INTO hobbies (name) VALUES (?)');
  const insertUser = db.prepare(
    'INSERT INTO users (avatar, first_name, last_name, age, nationality) VALUES (?, ?, ?, ?, ?)',
  );
  const link = db.prepare('INSERT INTO user_hobbies (user_id, hobby_id) VALUES (?, ?)');

  transaction(db, () => {
    for (const u of users) {
      const { lastInsertRowid } = insertUser.run('a.svg', u.first_name, u.last_name, u.age, u.nationality);
      for (const hobby of u.hobbies) {
        if (!hobbyIds.has(hobby)) {
          hobbyIds.set(hobby, Number(insertHobby.run(hobby).lastInsertRowid));
        }
        link.run(lastInsertRowid, hobbyIds.get(hobby)!);
      }
    }
  });
}

export function createTestApp(db: Database) {
  return createApp({ container: createContainer(db), logger: pino({ level: 'silent' }) });
}

/** One loopback server per suite avoids supertest's per-request ephemeral-port collisions. */
export function startTestServer(db: Database): Server {
  return createTestApp(db).listen(0, '127.0.0.1');
}
