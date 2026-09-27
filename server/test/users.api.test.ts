import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import type { PaginatedResponse, User, UserFacets } from '@presight/shared';
import { createTestDb, startTestServer, type FixtureUser } from './helpers';

const fixtures: FixtureUser[] = [
  { first_name: 'Alice', last_name: 'Smith', age: 30, nationality: 'American', hobbies: ['Chess', 'Hiking'] },
  { first_name: 'Bob', last_name: 'Jones', age: 25, nationality: 'British', hobbies: ['Chess'] },
  { first_name: 'Carol', last_name: 'Smith', age: 30, nationality: 'American', hobbies: ['Hiking'] },
  { first_name: 'Alice', last_name: 'Brown', age: 40, nationality: 'French', hobbies: ['Chess', 'Hiking', 'Reading'] },
  { first_name: 'Dave', last_name: 'O%Neil', age: 50, nationality: 'British', hobbies: [] },
  { first_name: 'Eve', last_name: 'Smith', age: 30, nationality: 'French', hobbies: ['Chess', 'Hiking'] },
];

const db = createTestDb(fixtures);
const app = startTestServer(db);
afterAll(() => {
  app.close();
  db.close();
});

async function list(query: Record<string, unknown> = {}) {
  const res = await request(app).get('/api/users').query(query);
  return { status: res.status, body: res.body as PaginatedResponse<User> };
}

const ids = (body: PaginatedResponse<User>) => body.data.map((u) => u.id);

describe('GET /api/health', () => {
  it('reports ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /api/users', () => {
  it('returns users with hobbies and pagination metadata', async () => {
    const { status, body } = await list();
    expect(status).toBe(200);
    expect(body.pageInfo).toEqual({ total: 6, hasMore: false, nextCursor: null });
    expect(body.data.find((u) => u.id === 4)?.hobbies).toEqual(['Chess', 'Hiking', 'Reading']);
    expect(body.data.find((u) => u.id === 5)?.hobbies).toEqual([]);
  });

  it('uses id as the tie-breaker for equal sort values', async () => {
    const asc = await list({ sortBy: 'age', sortOrder: 'asc' });
    expect(ids(asc.body)).toEqual([2, 1, 3, 6, 4, 5]);
    const desc = await list({ sortBy: 'age', sortOrder: 'desc' });
    expect(ids(desc.body)).toEqual([5, 4, 6, 3, 1, 2]);
  });

  it('searches first and last name case-insensitively', async () => {
    expect(ids((await list({ search: 'smith' })).body)).toEqual([1, 3, 6]);
    expect(ids((await list({ search: 'ALICE' })).body)).toEqual([1, 4]);
    expect(ids((await list({ search: 'alice sm' })).body)).toEqual([1]);
  });

  it('treats LIKE wildcards in search literally', async () => {
    expect(ids((await list({ search: '%' })).body)).toEqual([5]);
    expect(ids((await list({ search: '_' })).body)).toEqual([]);
  });

  it('matches ANY selected nationality', async () => {
    const { body } = await list({ nationality: ['American', 'French'], sortBy: 'age' });
    expect(ids(body)).toEqual([1, 3, 6, 4]);
  });

  it('matches ALL selected hobbies', async () => {
    const { body } = await list({ hobby: ['Chess', 'Hiking'] });
    expect(ids(body).sort()).toEqual([1, 4, 6]);
  });

  it('combines search, nationality and hobby filters', async () => {
    const { body } = await list({ search: 'smith', nationality: 'French', hobby: 'Chess' });
    expect(ids(body)).toEqual([6]);
    expect(body.pageInfo.total).toBe(1);
  });

  it('paginates with a cursor', async () => {
    const first = await list({ limit: 4, sortBy: 'age' });
    expect(ids(first.body)).toEqual([2, 1, 3, 6]);
    expect(first.body.pageInfo.hasMore).toBe(true);

    const second = await list({ limit: 4, sortBy: 'age', cursor: first.body.pageInfo.nextCursor });
    expect(ids(second.body)).toEqual([4, 5]);
    expect(second.body.pageInfo).toMatchObject({ hasMore: false, nextCursor: null, total: 6 });
  });

  it.each([
    [{ sortBy: 'nope' }],
    [{ sortOrder: 'up' }],
    [{ limit: 0 }],
    [{ limit: 1000 }],
    [{ search: 'x'.repeat(101) }],
  ])('rejects invalid params %o', async (query) => {
    const res = await list(query);
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
  });

  it('rejects malformed cursors and cursors from another sort', async () => {
    expect((await list({ cursor: 'garbage' })).body).toMatchObject({ error: { code: 'INVALID_CURSOR' } });

    const { body } = await list({ limit: 1, sortBy: 'age' });
    const res = await list({ limit: 1, sortBy: 'last_name', cursor: body.pageInfo.nextCursor });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: { code: 'INVALID_CURSOR' } });
  });
});

describe('GET /api/users/facets', () => {
  async function facets(query: Record<string, unknown> = {}) {
    const res = await request(app).get('/api/users/facets').query(query);
    expect(res.status).toBe(200);
    return res.body as UserFacets;
  }

  it('returns global counts sorted by count desc then value', async () => {
    const body = await facets();
    expect(body.hobbies).toEqual([
      { value: 'Chess', count: 4 },
      { value: 'Hiking', count: 4 },
      { value: 'Reading', count: 1 },
    ]);
    expect(body.nationalities).toEqual([
      { value: 'American', count: 2 },
      { value: 'British', count: 2 },
      { value: 'French', count: 2 },
    ]);
  });

  it('reflects search and all selected filters in hobby counts', async () => {
    const body = await facets({ search: 'smith', nationality: 'American' });
    expect(body.hobbies).toEqual([
      { value: 'Hiking', count: 2 },
      { value: 'Chess', count: 1 },
    ]);
  });

  it('ignores the nationality selection for nationality counts (disjunctive facet)', async () => {
    const body = await facets({ nationality: 'British', hobby: 'Chess' });
    expect(body.nationalities).toEqual([
      { value: 'French', count: 2 },
      { value: 'American', count: 1 },
      { value: 'British', count: 1 },
    ]);
    expect(body.hobbies).toEqual([{ value: 'Chess', count: 1 }]);
  });
});

describe('unknown routes', () => {
  it('returns a JSON 404', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: { code: 'NOT_FOUND' } });
  });
});
