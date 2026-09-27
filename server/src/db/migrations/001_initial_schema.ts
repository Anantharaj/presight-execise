import type { Migration } from './types';

export const initialSchema: Migration = {
  version: 1,
  name: 'initial_schema',
  up: `
    CREATE TABLE users (
      id          INTEGER PRIMARY KEY,
      avatar      TEXT    NOT NULL,
      first_name  TEXT    NOT NULL,
      last_name   TEXT    NOT NULL,
      age         INTEGER NOT NULL CHECK (age >= 0),
      nationality TEXT    NOT NULL
    );

    CREATE TABLE hobbies (
      id   INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE user_hobbies (
      user_id  INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
      hobby_id INTEGER NOT NULL REFERENCES hobbies (id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, hobby_id)
    ) WITHOUT ROWID;

    -- (column, id) indexes back keyset pagination for every sortable field.
    CREATE INDEX idx_users_first_name  ON users (first_name, id);
    CREATE INDEX idx_users_last_name   ON users (last_name, id);
    CREATE INDEX idx_users_age         ON users (age, id);
    CREATE INDEX idx_users_nationality ON users (nationality, id);
    CREATE INDEX idx_user_hobbies_hobby ON user_hobbies (hobby_id, user_id);
  `,
};
