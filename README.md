# Presight Directory

A full-stack user directory. You can search by name, filter by nationality and hobbies, sort, and scroll through a
virtualized, infinitely loading list. SQLite is the source of truth.

| Layer | Stack |
| --- | --- |
| Client | React 19, Vite 7, TypeScript, Tailwind CSS 4, TanStack Query 5, TanStack Virtual 3, React Router 7 |
| Server | Node.js 22+ (built-in `node:sqlite`), Express 5, Zod 4, Pino |
| Shared | `@presight/shared`: Zod schemas, constants and types used by both sides |
| Tooling | Yarn workspaces + Lerna, Vitest, Testing Library, Supertest, Storybook 9, ESLint 9, Prettier |
| Runtime | Docker: `nginx` (client + `/api` reverse proxy) and `node` (API) with a named volume for the DB |

The original brief is in [docs/EXERCISE.md](docs/EXERCISE.md).

---

## Quick start (local)

Requires **Node.js ≥ 22.13** (for the built-in `node:sqlite`) and **Yarn 1.x**.

```bash
yarn install
yarn dev
```

- Client: http://localhost:5173
- API: http://localhost:4000/api/health

On first start the server creates `server/data/presight.db`, runs the migrations and **auto-seeds 10,000 users**.
Vite proxies `/api` to the server.

### Database seeding

```bash
yarn db:seed                                   # recreate & reseed (deterministic, seed=42)
SEED_USER_COUNT=50000 yarn db:seed             # bigger dataset
SEED_RANDOM_SEED=7 yarn db:seed                # different deterministic dataset
```

Configuration lives in `server/.env` (copy it from [server/.env.example](server/.env.example)):

| Var | Default | Purpose |
| --- | --- | --- |
| `PORT` / `HOST` | `4000` / `0.0.0.0` | API bind address |
| `DB_PATH` | `data/presight.db` | SQLite file (relative to `server/`) |
| `SEED_ON_START` | `true` | Seed automatically when the DB is empty |
| `SEED_USER_COUNT` | `10000` | Number of users to generate |
| `SEED_RANDOM_SEED` | `42` | Faker seed, so the dataset is reproducible |
| `LOG_LEVEL` | `info` | Pino log level (`debug` also logs every SQL query with its duration) |
| `SLOW_QUERY_MS` | `200` | Queries at or above this duration are logged at `warn` |
| `CLIENT_LOGS_PER_MINUTE` | `60` | Per-IP rate limit for `POST /api/client-logs` |

The client reads `API_PROXY_TARGET` (dev proxy target) and `VITE_API_BASE_URL` (defaults to same-origin). See
[client/.env.example](client/.env.example).

---

## Docker Compose

```bash
docker compose up --build        # http://localhost:8080
CLIENT_PORT=3000 docker compose up --build   # use another host port
```

| Service | Image | Role |
| --- | --- | --- |
| `client` | `nginx-unprivileged` | Serves the built SPA (SPA fallback, cache headers, CSP) and proxies `/api/*` to `server:4000` |
| `server` | `node:24-alpine` | Self-contained API bundle (no `node_modules`), runs as non-root. The DB lives on the `db-data` volume |

The client starts only after the server's health check passes. Useful commands:

```bash
docker compose run --rm server node dist/seed.js   # reseed the volume
docker compose down -v                             # stop and delete the database volume
docker compose logs -f server
```

To add a service (e.g. a cache, or a second API), add it to `docker-compose.yml` and, if it is HTTP, add a
`location` block in [client/nginx/default.conf.template](client/nginx/default.conf.template).

---

## Scripts (repo root)

| Command | Description |
| --- | --- |
| `yarn dev` | Server (tsx watch) and client (Vite) in parallel |
| `yarn build` | Production builds of all workspaces |
| `yarn test` | Server (Supertest) and client (Testing Library) tests |
| `yarn typecheck` | `tsc` in every workspace |
| `yarn lint` / `yarn format` | ESLint / Prettier |
| `yarn storybook` | Component library and developer docs at http://localhost:6006 |
| `yarn db:seed` | Recreate and seed the SQLite database |

---

## API

| Endpoint | Description |
| --- | --- |
| `GET /api/users` | Paginated users. Params: `search`, `nationality` (repeatable), `hobby` (repeatable), `sortBy`, `sortOrder`, `limit`, `cursor` |
| `GET /api/users/facets` | Top 20 `hobbies` and `nationalities` as `{ value, count }` for the current `search` / `nationality` / `hobby` |
| `GET /api/health` | Liveness check plus a database check |
| `POST /api/client-logs` | Browser error and warning reports (`{ events: [...] }`), written to the server log stream. Zod-validated, 64 KB max, rate limited |

```bash
curl 'http://localhost:4000/api/users?search=an&nationality=Indian&nationality=German&hobby=Chess&sortBy=age&sortOrder=desc&limit=20'
curl 'http://localhost:4000/api/users/facets?hobby=Chess'
```

**Filter semantics**

- **Search:** case-insensitive substring match on `first_name + ' ' + last_name`. LIKE wildcards are escaped.
- **Nationalities:** a user matches **any** selected nationality (`IN`).
- **Hobbies:** a user must have **all** selected hobbies (`GROUP BY … HAVING COUNT = n`).
- Search, nationality and hobby filters apply together (AND).

**Facet counts**

- **Hobbies** apply every active filter, so they are the hobbies of the users currently listed.
- **Nationalities** apply search and hobbies but not the nationality selection itself (a disjunctive facet).
  Nationality uses OR logic, so this keeps other nationalities visible and selectable.

**Sorting and pagination**

- Keyset (cursor) pagination on `(sort_column, id)`. `id` is the final tie-breaker, so the order is deterministic.
  There are no duplicate or missing users between pages, and deep pages stay fast.
- Response: `{ data, pageInfo: { nextCursor, hasMore, total } }`.
- A cursor is tied to the sort it was issued for. Reusing it with a different sort returns `400 INVALID_CURSOR`.

Full reference: Storybook → **Docs / Server & API**.

---

## Project structure

```
shared/src/            constants, Zod schemas (query contracts), API/DTO types
server/src/
  config/              env (Zod-validated), logger
  db/                  connection, migrations/ (PRAGMA user_version), seed/
  models/              row types, mappers, whitelisted sort columns
  repositories/        SQL (implements an interface, so storage can be swapped)
  services/            business logic (cursor, facet policy)
  controllers/         HTTP adapters (validate → service → JSON)
  routes/              routers mounted at /api
  middlewares/         error handler, 404
  container.ts         composition root (dependency injection)
  app.ts / server.ts   Express app factory / process entry (graceful shutdown)
server/test/           Supertest API + pagination property tests
client/src/
  app/                 providers, router, query client
  pages/               route-level layouts
  containers/          smart components (URL state + queries)
  components/ui/       reusable, generic UI (each with stories)
  components/users/    domain presentational components (each with stories)
  queries/             TanStack Query hooks + key factory
  api/                 typed HTTP functions
  state/               URL ⇄ view-state (pure functions + hook)
  hooks/ lib/          generic hooks and utilities
  mocks/               fixtures and an in-memory mock API for Storybook
  docs/                Storybook MDX developer guides
```

## Client behavior

- **URL is the source of truth:** `?q=…&nationality=…&hobby=…&sort=…&order=…`. Reload, share, and
  Back/Forward all restore the view.
- Any change to search or filters refetches both the list and the facets. Previous results stay visible (dimmed)
  while new ones load. Changing the sort refetches only the list.
- `VirtualGrid` virtualizes rows of a responsive 1–N column grid and loads the next page before you reach the end.
- **States:** skeletons on first load; a spinner while updating; an empty state with "Clear filters"; error states
  with Retry for the list, for the next page, and for the facets.
- **Layout:** the sidebar sits on the left on desktop (≥ 1024 px) and becomes an accessible `<dialog>` drawer on
  mobile.

## Logging

All logs are **structured JSON on stdout** (12-factor). Docker collects them, and they can be shipped unchanged to
Loki, ELK, Datadog or CloudWatch.

| Source | Format | Contents |
| --- | --- | --- |
| nginx (`service: presight-client`) | JSON access log | `reqId`, method, URL, status, bytes, duration, upstream status and duration |
| API (`service: presight-server`) | Pino JSON | one access line per request (level by status: 5xx `error`, 4xx `warn`); startup, migrations and seeding; slow queries; unhandled errors with stack; `fatal` on crash |
| Browser (`source: client`) | via `POST /api/client-logs` | uncaught errors, unhandled rejections, failed API calls, route errors |

**Request correlation:**

1. nginx generates `$request_id` and forwards it as `X-Request-Id`.
2. The API reuses it, or generates a UUID when called directly.
3. The ID is returned in the `X-Request-Id` response header and in `error.requestId` of error bodies.
4. It is bound to every server log line of that request, including repository query logs, through
   `AsyncLocalStorage`.
5. The client attaches it to its API error reports.

```bash
docker compose logs -f server                      # JSON
docker compose logs server --no-log-prefix | grep <reqId>
LOG_LEVEL=debug yarn dev                           # pretty output locally, including SQL timings
```

**Privacy and safety:**
- Request headers are not logged. `authorization`, `cookie` and `set-cookie` are redacted as a safeguard.
- Client reports send only the query-key prefix (e.g. `users.list`), never the search text.

**Next step:** add OpenTelemetry tracing (`trace_id` / `span_id` on log lines).

## Testing

```bash
yarn test
```

- **Server:** filter semantics, tie-breaking, search escaping, facets (including the disjunctive nationality
  facet), validation errors, and a pagination walk over 400 seeded users for **every sort field and direction**
  (asserting no duplicates, no gaps, and correct order). Logging: request-ID generation and propagation,
  access-log levels, health-check suppression, header redaction, slow queries, and client-log ingestion, validation
  and rate limiting.
- **Client:** URL state round-trips, `SearchInput` debounce, `UserCard` `+n` logic, `FacetGroup` interactions, the
  logger's batching, levels and truncation, and `ApiError` request IDs.

## Contributing / AI assistants

- Human contributors: Storybook → **Docs / Contributing** and **Docs / Client Guide**.
- AI coding assistants: follow [AGENTS.md](AGENTS.md).
