import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { SORT_FIELDS, SORT_ORDERS, type PaginatedResponse, type User } from '@presight/shared';
import { createTestDb, startTestServer } from './helpers';
import { seedDatabase } from '../src/db/seed/seeder';

const USER_COUNT = 400;
const db = createTestDb();
seedDatabase(db, { userCount: USER_COUNT, randomSeed: 7 });
const app = startTestServer(db);
afterAll(() => {
  app.close();
  db.close();
});

async function fetchAll(query: Record<string, unknown>, limit: number): Promise<User[]> {
  const users: User[] = [];
  let cursor: string | null | undefined;
  do {
    const res = await request(app)
      .get('/api/users')
      .query({ ...query, limit, ...(cursor && { cursor }) });
    expect(res.status).toBe(200);
    const body = res.body as PaginatedResponse<User>;
    users.push(...body.data);
    cursor = body.pageInfo.nextCursor;
  } while (cursor);
  return users;
}

function compare(a: string | number, b: string | number) {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0;
}

describe('keyset pagination over seeded data', () => {
  const combos = SORT_FIELDS.flatMap((sortBy) => SORT_ORDERS.map((sortOrder) => ({ sortBy, sortOrder })));

  it.each(combos)('walks every user exactly once in order ($sortBy $sortOrder)', async ({ sortBy, sortOrder }) => {
    const users = await fetchAll({ sortBy, sortOrder }, 37);
    expect(users).toHaveLength(USER_COUNT);
    expect(new Set(users.map((u) => u.id)).size).toBe(USER_COUNT);

    const sign = sortOrder === 'asc' ? 1 : -1;
    for (let i = 1; i < users.length; i++) {
      const prev = users[i - 1]!;
      const curr = users[i]!;
      const order = compare(prev[sortBy], curr[sortBy]) || prev.id - curr.id;
      expect(sign * order).toBeLessThan(0);
    }
  });

  it('keeps totals consistent with filtered pages', async () => {
    const query = { hobby: ['Reading'], sortBy: 'nationality', sortOrder: 'desc' };
    const first = await request(app).get('/api/users').query({ ...query, limit: 10 });
    const all = await fetchAll(query, 10);
    expect(all).toHaveLength(first.body.pageInfo.total);
    expect(all.every((u) => u.hobbies.includes('Reading'))).toBe(true);
  });

  it('generates 0-10 hobbies per user', async () => {
    const users = await fetchAll({}, 100);
    expect(users.every((u) => u.hobbies.length >= 0 && u.hobbies.length <= 10)).toBe(true);
  });
});
