import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createCapturingLogger, createTestDb, startTestServer, type LogLine } from './helpers';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const db = createTestDb([
  { first_name: 'Ada', last_name: 'Lovelace', age: 36, nationality: 'British', hobbies: ['Chess'] },
]);
const { logger, lines } = createCapturingLogger();
const app = startTestServer(db, { logger, slowQueryMs: 0, clientLogsPerMinute: 3 });
afterAll(() => {
  app.close();
  db.close();
});
beforeEach(() => {
  lines.length = 0;
});

const accessLogs = () => lines.filter((l) => 'res' in l);
const validEvent = {
  level: 'error',
  message: 'TypeError: x is undefined',
  timestamp: new Date().toISOString(),
  url: 'http://localhost/?q=a',
  stack: 'TypeError: x is undefined\n    at App (App.tsx:1:1)',
  requestId: 'abc12345-0000',
  context: { component: 'UserList' },
};

describe('request ids', () => {
  it('generates an id, echoes it and tags every log line of the request', async () => {
    const res = await request(app).get('/api/users');
    const id = res.headers['x-request-id'];
    expect(id).toMatch(UUID);

    const [access] = accessLogs();
    expect(access).toMatchObject({ level: 'info', reqId: id, msg: 'GET /api/users 200' });
    expect(access).toHaveProperty('durationMs');
    // Repository logs inherit the request id through AsyncLocalStorage.
    expect(lines.some((l) => l.query === 'users.findPage' && l.reqId === id)).toBe(true);
  });

  it('reuses a valid incoming id (e.g. from nginx) and replaces an invalid one', async () => {
    const reused = await request(app).get('/api/users').set('X-Request-Id', 'edge-1234abcd');
    expect(reused.headers['x-request-id']).toBe('edge-1234abcd');

    const replaced = await request(app).get('/api/users').set('X-Request-Id', 'bad id <script>');
    expect(replaced.headers['x-request-id']).toMatch(UUID);
  });

  it('includes the request id in error bodies', async () => {
    const res = await request(app).get('/api/users?sortBy=nope');
    expect(res.body.error.requestId).toBe(res.headers['x-request-id']);
  });
});

describe('access log', () => {
  it('logs 4xx at warn and does not log health checks', async () => {
    await request(app).get('/api/health');
    await request(app).get('/api/nope');
    const logs = accessLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({ level: 'warn', msg: 'GET /api/nope 404' });
  });

  it('logs compact request data without headers and adds service metadata', async () => {
    await request(app).get('/api/users').set('Cookie', 'session=secret').set('Authorization', 'Bearer t');
    const [access] = accessLogs() as [LogLine & { req: Record<string, unknown> }];
    expect(access.service).toBe('presight-server');
    expect(access.req).toEqual(
      expect.objectContaining({ method: 'GET', url: '/api/users' }),
    );
    expect(access.req).not.toHaveProperty('headers');
    expect(JSON.stringify(lines)).not.toContain('secret');
  });

  it('warns about slow queries', async () => {
    await request(app).get('/api/users/facets');
    expect(lines.some((l) => l.msg === 'Slow query' && l.level === 'warn')).toBe(true);
  });
});

describe('POST /api/client-logs', () => {
  it('writes client events into the server log stream', async () => {
    const res = await request(app).post('/api/client-logs').send({ events: [validEvent] });
    expect(res.status).toBe(204);

    const entry = lines.find((l) => l.source === 'client');
    expect(entry).toMatchObject({
      level: 'error',
      msg: validEvent.message,
      requestId: validEvent.requestId,
      context: { component: 'UserList' },
    });
  });

  it('accepts text/plain bodies sent by navigator.sendBeacon', async () => {
    const res = await request(app)
      .post('/api/client-logs')
      .set('Content-Type', 'text/plain')
      .send(JSON.stringify({ events: [validEvent] }));
    expect(res.status).toBe(204);
  });

  it('rejects invalid batches and then rate limits', async () => {
    const invalid = await request(app).post('/api/client-logs').send({ events: [{ level: 'panic' }] });
    expect(invalid.status).toBe(400);

    // Limit is 3/min for this suite and three requests were already made.
    const limited = await request(app).post('/api/client-logs').send({ events: [validEvent] });
    expect(limited.status).toBe(429);
    expect(limited.body.error.code).toBe('RATE_LIMITED');
  });
});
