import { faker } from '@faker-js/faker';
import { transaction, type Database } from '../connection';
import { HOBBIES, NATIONALITIES } from './seed-data';

export interface SeedOptions {
  userCount: number;
  randomSeed: number;
}

export const MAX_HOBBIES_PER_USER = 10;

/** Linearly decreasing weights so facet counts are varied rather than uniform. */
function weighted<T>(values: readonly T[]) {
  return values.map((value, index) => ({ value, weight: values.length - index }));
}

export function avatarUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(seed)}`;
}

export function isDatabaseEmpty(db: Database): boolean {
  const row = db.prepare('SELECT EXISTS (SELECT 1 FROM users) AS present').get() as {
    present: number;
  };
  return row.present === 0;
}

/** Replaces all user data with a deterministic dataset. Returns the number of users inserted. */
export function seedDatabase(db: Database, { userCount, randomSeed }: SeedOptions): number {
  faker.seed(randomSeed);
  const nationalityWeights = weighted(NATIONALITIES);

  return transaction(db, () => {
    db.exec('DELETE FROM user_hobbies; DELETE FROM users; DELETE FROM hobbies;');

    const insertHobby = db.prepare('INSERT INTO hobbies (name) VALUES (?)');
    const hobbyWeights = weighted(
      HOBBIES.map((name) => Number(insertHobby.run(name).lastInsertRowid)),
    );

    const insertUser = db.prepare(
      'INSERT INTO users (avatar, first_name, last_name, age, nationality) VALUES (?, ?, ?, ?, ?)',
    );
    const insertUserHobby = db.prepare(
      'INSERT INTO user_hobbies (user_id, hobby_id) VALUES (?, ?)',
    );

    for (let i = 0; i < userCount; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const { lastInsertRowid: userId } = insertUser.run(
        avatarUrl(`${firstName}-${lastName}-${i}`),
        firstName,
        lastName,
        faker.number.int({ min: 18, max: 80 }),
        faker.helpers.weightedArrayElement(nationalityWeights),
      );

      const hobbyCount = faker.number.int({ min: 0, max: MAX_HOBBIES_PER_USER });
      const hobbyIds = new Set<number>();
      while (hobbyIds.size < hobbyCount) {
        hobbyIds.add(faker.helpers.weightedArrayElement(hobbyWeights));
      }
      for (const hobbyId of hobbyIds) insertUserHobby.run(userId, hobbyId);
    }

    return userCount;
  });
}
