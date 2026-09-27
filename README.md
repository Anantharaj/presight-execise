# Presight Directory

A full-stack user directory. You can search people by name, narrow the list by nationality and hobbies, sort it, and
scroll through thousands of users in a virtualized, infinitely loading list. The sidebar shows live counts for the
current results. **SQLite** stores the data, and the **URL** stores the view state, so every view can be shared.

The original exercise brief is in [docs/EXERCISE.md](docs/EXERCISE.md).

## Contents

1. [Tech stack](#1-tech-stack)
2. [Prerequisites](#2-prerequisites)
3. [Run it locally (step by step)](#3-run-it-locally-step-by-step)
4. [Run it with Docker](#4-run-it-with-docker)
5. [Using the application](#5-using-the-application)
6. [Everyday commands](#6-everyday-commands)
7. [Configuration](#7-configuration)
8. [Database](#8-database)
9. [API](#9-api)
10. [Codebase tour for new developers](#10-codebase-tour-for-new-developers)
11. [Making your first change](#11-making-your-first-change)
12. [Logging](#12-logging)
13. [Testing](#13-testing)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Tech stack

| Layer   | Stack                                                                                                       |
| ------- | ----------------------------------------------------------------------------------------------------------- |
| Client  | React 19, Vite 7, TypeScript, Tailwind CSS 4, TanStack Query 5, TanStack Virtual 3, React Router 7          |
| Server  | Node.js 22+ (built-in `node:sqlite`), Express 5, Zod 4, Pino                                                |
| Shared  | `@presight/shared`: Zod schemas, constants and types used by both client and server                         |
| Tooling | Yarn workspaces + Lerna, Vitest, Testing Library, Supertest, Storybook 9, ESLint 9, Prettier                |
| Runtime | Docker: `nginx` (serves the client and proxies `/api`) and `node` (the API), with a volume for the database |

---

## 2. Prerequisites

| Tool           | Version                      | Check           | Notes                                                                                   |
| -------------- | ---------------------------- | --------------- | --------------------------------------------------------------------------------------- |
| Node.js        | **≥ 22.13** (24 recommended) | `node -v`       | Needed for the built-in `node:sqlite`. With nvm, run `nvm use` (reads [.nvmrc](.nvmrc)) |
| Yarn           | **1.x** (classic)            | `yarn -v`       | Install with `npm install -g yarn`                                                      |
| Git            | any                          | `git --version` |                                                                                         |
| Docker Desktop | optional                     | `docker -v`     | Only needed for the Docker setup                                                        |

No database server is needed. SQLite is built into Node, and the database file is created automatically.

---

## 3. Run it locally (step by step)

```bash
# 1. Get the code
git clone https://github.com/Anantharaj/presight-execise.git
cd presight-execise

# 2. Use the right Node version (if you use nvm)
nvm use

# 3. Install dependencies for all workspaces (shared, server, client)
yarn install

# 4. (Optional) create local config files. The defaults work without them.
cp server/.env.example server/.env
cp client/.env.example client/.env

# 5. Start the API and the web app together
yarn dev
```

On the first start the server **creates the database, runs the migrations and seeds 10,000 users**. You should see:

```
@presight/server: INFO: Applied database migrations {"applied":[1]}
@presight/server: INFO: Database is empty, seeding… {"users":10000}
@presight/server: INFO: API listening {"host":"0.0.0.0","port":4000}
@presight/client:   ➜  Local:   http://localhost:5173/
```

| Open                             | What it is                                           |
| -------------------------------- | ---------------------------------------------------- |
| http://localhost:5173            | The application                                      |
| http://localhost:4000/api/health | API health check (should return `{"status":"ok",…}`) |

Stop everything with `Ctrl + C`. The data stays in `server/data/presight.db` for the next run.

> In development, the Vite dev server forwards every `/api/*` request to the API on port 4000, so the browser only
> talks to one origin.

---

## 4. Run it with Docker

```bash
docker compose up --build        # then open http://localhost:8080
```

| Service  | Image                | Role                                                                                                                                           |
| -------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `client` | `nginx-unprivileged` | Serves the built app (SPA fallback, cache headers, CSP) and proxies `/api/*` to `server:4000`                                                  |
| `server` | `node:24-alpine`     | Self-contained API bundle (no `node_modules`), runs as a non-root user. The database lives on the `db-data` volume and is seeded on first boot |

The client container starts only after the server's health check passes.

```bash
CLIENT_PORT=3000 docker compose up --build         # use another host port
docker compose logs -f server                      # follow API logs
docker compose run --rm server node dist/seed.js   # reseed the database volume
docker compose down                                # stop (keeps data)
docker compose down -v                             # stop AND delete the database volume
```

To add another service (a cache, a second API, …), add it to [docker-compose.yml](docker-compose.yml). If it serves
HTTP, also add a `location` block in [client/nginx/default.conf.template](client/nginx/default.conf.template).

---

## 5. Using the application

| Feature                | How to use it                                                                       | Behavior                                                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Search**             | Type in the search box at the top                                                   | Case-insensitive match on first and last name. Runs 300 ms after you stop typing                                    |
| **Nationality filter** | Tick one or more nationalities in the sidebar                                       | Shows users from **any** selected nationality                                                                       |
| **Hobby filter**       | Tick one or more hobbies                                                            | Shows users who have **all** selected hobbies                                                                       |
| **Live counts**        | Look at the numbers next to each option                                             | The top 20 hobbies and nationalities **for the current results**. They update with every search or filter change    |
| **Sort**               | Choose a field (first name, last name, age, nationality), then use the arrow button | Toggles ascending/descending. Users with the same value are ordered by id, so the order never changes between loads |
| **Infinite scroll**    | Just scroll                                                                         | The next page loads before you reach the end. Only visible cards are rendered, so it stays smooth                   |
| **Active filters**     | Chips above the list                                                                | Click × on a chip to remove it, or **Clear all**                                                                    |
| **Share or restore**   | Copy the address bar                                                                | Search, filters and sort live in the URL. Reload, share, and Back/Forward restore the same view                     |
| **Mobile**             | Narrow the window below 1024 px                                                     | The sidebar moves into a **Filters** drawer                                                                         |

The app also shows skeletons while loading, an empty state with **Clear filters**, and error messages with a
**Retry** button.

Try these URLs (replace the port with `8080` when running in Docker):

- http://localhost:5173/?hobby=Chess&hobby=Reading: users who have _both_ hobbies
- http://localhost:5173/?nationality=Indian&nationality=German&sort=age&order=desc: Indian _or_ German, oldest first
- http://localhost:5173/?q=smith: name search

**Card layout:** avatar · full name · nationality · age · up to 2 hobbies · `+n` for the rest.

---

## 6. Everyday commands

Run all commands from the **repository root**.

| Command          | Description                                                 |
| ---------------- | ----------------------------------------------------------- |
| `yarn dev`       | Server (auto-restart on change) + client (hot reload)       |
| `yarn test`      | All tests (server + client)                                 |
| `yarn typecheck` | TypeScript check in every workspace                         |
| `yarn lint`      | ESLint                                                      |
| `yarn format`    | Prettier (writes changes)                                   |
| `yarn storybook` | Component library + developer docs at http://localhost:6006 |
| `yarn db:seed`   | Recreate and reseed the local database                      |
| `yarn build`     | Production builds (server bundle + client assets)           |

**Before pushing:** `yarn typecheck && yarn lint && yarn test`

---

## 7. Configuration

All settings have working defaults. To override them, create `server/.env` or `client/.env` from the `.env.example`
files, or set environment variables inline (e.g. `LOG_LEVEL=debug yarn dev`).

**Server** ([server/.env.example](server/.env.example))

| Variable                 | Default            | Purpose                                                                |
| ------------------------ | ------------------ | ---------------------------------------------------------------------- |
| `PORT` / `HOST`          | `4000` / `0.0.0.0` | API bind address                                                       |
| `DB_PATH`                | `data/presight.db` | SQLite file (relative to `server/`)                                    |
| `SEED_ON_START`          | `true`             | Seed automatically when the database is empty                          |
| `SEED_USER_COUNT`        | `10000`            | Number of users to generate                                            |
| `SEED_RANDOM_SEED`       | `42`               | Faker seed, so the dataset is identical on every machine               |
| `LOG_LEVEL`              | `info`             | `fatal` … `trace`. `debug` also logs every SQL query with its duration |
| `SLOW_QUERY_MS`          | `200`              | Queries at or above this duration are logged as warnings               |
| `CLIENT_LOGS_PER_MINUTE` | `60`               | Per-IP rate limit for browser error reports                            |

**Client** ([client/.env.example](client/.env.example))

| Variable            | Default                 | Purpose                                           |
| ------------------- | ----------------------- | ------------------------------------------------- |
| `API_PROXY_TARGET`  | `http://localhost:4000` | Where the Vite dev server forwards `/api`         |
| `VITE_API_BASE_URL` | _(empty = same origin)_ | Set this only if the API is on a different domain |

---

## 8. Database

The database is a single SQLite file: `server/data/presight.db` locally, or the `db-data` volume in Docker.

```sql
users        (id, avatar, first_name, last_name, age, nationality)
hobbies      (id, name UNIQUE)
user_hobbies (user_id, hobby_id)   -- many-to-many, 0–10 hobbies per user
```

```bash
yarn db:seed                         # wipe and reseed (same data every time)
SEED_USER_COUNT=50000 yarn db:seed   # a bigger dataset
SEED_RANDOM_SEED=7 yarn db:seed      # a different, but still reproducible, dataset
sqlite3 server/data/presight.db "SELECT nationality, COUNT(*) FROM users GROUP BY 1 ORDER BY 2 DESC LIMIT 5;" # needs the sqlite3 CLI
```

**Schema changes:** add a new file `server/src/db/migrations/00N_name.ts` and append it to the list in
`migrations/index.ts`. Migrations run automatically on startup. Never edit a migration that has already been
committed.

---

## 9. API

| Endpoint                | Description                                                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/users`        | Paginated users. Params: `search`, `nationality` (repeatable), `hobby` (repeatable), `sortBy`, `sortOrder`, `limit`, `cursor` |
| `GET /api/users/facets` | Top 20 `hobbies` and `nationalities` as `{ value, count }` for the current `search` / `nationality` / `hobby`                 |
| `GET /api/health`       | Liveness check plus a database check                                                                                          |
| `POST /api/client-logs` | Browser error and warning reports (`{ events: [...] }`), written to the server log. Validated, 64 KB max, rate limited        |

```bash
curl 'http://localhost:4000/api/users?search=an&nationality=Indian&nationality=German&hobby=Chess&sortBy=age&sortOrder=desc&limit=20'
curl 'http://localhost:4000/api/users/facets?hobby=Chess'
```

**Filters**

- **Search:** case-insensitive substring match on `first_name + ' ' + last_name`. `%` and `_` are treated as
  literal characters.
- **Nationalities:** a user matches **any** selected nationality.
- **Hobbies:** a user must have **all** selected hobbies.
- Search, nationality and hobby filters apply together (AND).

**Facet counts**

- **Hobbies** apply every active filter.
- **Nationalities** apply search and hobbies but not the nationality selection itself. Nationality uses OR logic, so
  this keeps the other nationalities visible and selectable.

**Sorting and pagination**

- Keyset (cursor) pagination on `(sort_column, id)`, with `id` as the tie-breaker. There are no duplicate or missing
  users between pages, and deep pages stay fast.
- Response: `{ data, pageInfo: { nextCursor, hasMore, total } }`. Pass `nextCursor` back as `cursor` to get the next
  page.
- A cursor only works with the sort it was issued for. Using it with a different sort returns `400 INVALID_CURSOR`.

**Errors:** every error has the same shape, `{ "error": { "code", "message", "details?", "requestId" } }`.

Full reference: Storybook → **Docs / Server & API**.

---

## 10. Codebase tour for new developers

### Folder map

```
shared/src/            API contracts: constants, Zod schemas, TypeScript types (used by BOTH sides)
server/src/
  config/              env (validated with Zod), logger
  db/                  connection, migrations/, seed/
  models/              row types, row → DTO mappers, whitelisted sort columns
  repositories/        SQL only (behind an interface, so storage can be swapped)
  services/            business logic (pagination cursor, facet rules)
  controllers/         HTTP adapters: validate input → call a service → send JSON
  routes/              URL → controller mapping, mounted at /api
  middlewares/         error handler, 404, rate limiting
  logging/             request logger, request id, request-scoped context
  container.ts         wires everything together (dependency injection)
  app.ts / server.ts   Express app factory / process entry point
server/test/           API tests (Supertest)
client/src/
  app/                 providers, router, query client, error reporting
  pages/               route-level layouts
  containers/          "smart" components: read URL state, run queries
  components/ui/       reusable generic UI (Button, Chip, VirtualGrid, …)
  components/users/    user-specific presentational UI (UserCard, FacetGroup, …)
  queries/             TanStack Query hooks + query keys
  api/                 typed HTTP functions
  state/               URL ⇄ view state
  hooks/ lib/          generic hooks and utilities (cn, http, logger, format)
  mocks/               test fixtures and an in-memory mock API for Storybook
  docs/                Storybook developer guides (MDX)
```

### How one request flows

```
User ticks "Chess"
  → FacetGroup (component) calls onToggle
  → FilterSidebarContainer calls toggleHobby()  → URL becomes ?hobby=Chess
  → useUsersInfiniteQuery / useUserFacetsQuery see a new query key
  → api/users.api.ts → GET /api/users?hobby=Chess  (+ /api/users/facets)
  → [server] routes → UserController (Zod) → UserService (cursor) → SqliteUserRepository (SQL)
  → JSON back → VirtualGrid renders only the visible UserCards
```

### Suggested reading order (about an hour)

1. [shared/src/constants.ts](shared/src/constants.ts) and [shared/src/schemas/user-query.schema.ts](shared/src/schemas/user-query.schema.ts): what the API accepts.
2. [server/src/container.ts](server/src/container.ts), then follow `UserController` → `UserService` → `SqliteUserRepository`.
3. [server/test/users.api.test.ts](server/test/users.api.test.ts): the expected behavior, written as tests.
4. [client/src/pages/UserDirectoryPage.tsx](client/src/pages/UserDirectoryPage.tsx), then each container it uses.
5. [client/src/state/user-view-state.ts](client/src/state/user-view-state.ts) and [client/src/queries/users.queries.ts](client/src/queries/users.queries.ts).
6. Run `yarn storybook` and browse **Docs / Architecture** and **Docs / Client Guide**, then the **UI** and
   **Users** components.

### Key rules

- **Client and server share one contract:** if you change a request or response, change it in `shared/` first.
- **Server layers only call downwards:** routes → controllers → services → repositories. There is no SQL outside
  repositories and no `req`/`res` outside controllers.
- **Client components never fetch data or read the URL.** Containers do that and pass props down.
- **Every component** has its own folder with `Name.tsx`, `Name.stories.tsx` and `index.ts`, plus `Name.test.tsx`
  if it has logic.
- **No `console.*`**: use the loggers (see [Logging](#12-logging)).

The full rules are in [AGENTS.md](AGENTS.md). They apply to humans too.

---

## 11. Making your first change

**Workflow**

1. Create a branch: `git checkout -b feat/short-description`.
2. Make the change, following the folder and layering rules above.
3. Add or update tests, and stories for UI.
4. Run `yarn typecheck && yarn lint && yarn test`.
5. Commit using [Conventional Commits](https://www.conventionalcommits.org/), for example:
   - `feat(client): add age range filter`
   - `fix(server): escape underscore in search`
   - `docs: explain reseeding`
   - `test(server): cover empty hobby list`
   - Other types: `chore`, `refactor`, `build`.
6. Open a pull request.

**Common recipes.** Step-by-step versions are in Storybook → **Docs / Client Guide** and **Docs / Server & API**.

| I want to…                    | Where                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| Add a reusable UI component   | `client/src/components/ui/<Name>/` + export it from `components/ui/index.ts`                           |
| Add a user-specific component | `client/src/components/users/<Name>/`                                                                  |
| Add a new filter end to end   | `shared` schema → server repository fragment + test → client `state/` + `api/` → component + container |
| Add an API endpoint           | `shared` types → repository → service → controller → `routes/` → `container.ts` → test                 |
| Add a page                    | `client/src/pages/` + register it in `app/router.tsx`                                                  |
| Change the schema             | New migration file in `server/src/db/migrations/`                                                      |

---

## 12. Logging

All logs are **structured JSON on stdout**, and are pretty-printed in `yarn dev`.

| Source                             | Contents                                                                                                                                           |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| nginx (`service: presight-client`) | JSON access log: `reqId`, method, URL, status, bytes, duration, upstream timing                                                                    |
| API (`service: presight-server`)   | One line per request (5xx `error`, 4xx `warn`), plus startup, migrations, seeding, slow queries, unhandled errors with stack, and `fatal` on crash |
| Browser (`source: client`)         | Uncaught errors, unhandled rejections, failed API calls and render errors, sent via `POST /api/client-logs`                                        |

**Following one request:**

1. nginx creates a request id.
2. The API reuses it, or creates one when called directly.
3. The id is returned in the `X-Request-Id` header and in `error.requestId`.
4. It is attached to every server log line for that request.

```bash
docker compose logs server --no-log-prefix | grep <reqId>
LOG_LEVEL=debug yarn dev          # also shows each SQL query and its duration
```

**How to log in code:**

- **Server:** use `req.log`, or `getLogger(fallback)` from `server/src/logging/request-context.ts`.
- **Client:** use `logger` from `client/src/lib/logger.ts`.
- Pass structured fields, e.g. `log.warn({ durationMs }, 'Slow query')`.
- **Never log** secrets, cookies or personal data such as search text.

---

## 13. Testing

```bash
yarn test                                   # everything
yarn workspace @presight/server test        # server only
yarn workspace @presight/client test:watch  # client in watch mode
```

- **Server:**
  - Filter rules and search escaping.
  - Tie-breaking and facet counts, including the nationality rule.
  - Validation errors.
  - A pagination walk over 400 seeded users for **every sort field and direction** (no duplicates, no gaps, correct
    order).
  - Logging: request ids, log levels, redaction, slow queries, and client-log validation and rate limiting.
- **Client:**
  - URL state round-trips and the `SearchInput` debounce.
  - `UserCard` `+n` logic and `FacetGroup` interactions.
  - Logger batching and truncation, and request ids on `ApiError`.

---

## 14. Troubleshooting

| Problem                                                  | Fix                                                                                                |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `No such built-in module: node:sqlite`                   | Your Node is older than 22.13. Run `nvm use` or install Node 24                                    |
| `ExperimentalWarning: SQLite is an experimental feature` | Harmless. Node prints it for `node:sqlite`, and the Docker image hides it                          |
| `EADDRINUSE` / port 4000 already in use                  | Another app is using the port. Run `PORT=4010 API_PROXY_TARGET=http://localhost:4010 yarn dev`     |
| Port 5173 in use                                         | Vite picks the next free port automatically. Check the terminal output                             |
| Port 8080 in use (Docker)                                | `CLIENT_PORT=3000 docker compose up --build`                                                       |
| List is empty or looks outdated                          | Run `yarn db:seed` (or delete `server/data/presight.db` and restart)                               |
| Docker still shows old data                              | `docker compose down -v && docker compose up --build`. **This deletes the Docker database volume** |
| Avatars show initials                                    | The avatars load from `api.dicebear.com`. When offline, initials are shown instead                 |
| `yarn install` fails                                     | Make sure you use Yarn **1.x** (`yarn -v`), then delete `node_modules` and retry                   |
| Tests fail after pulling                                 | Run `yarn install` again, because dependencies may have changed                                    |

Still stuck? Run `yarn typecheck`. The error usually points to the exact file and line.
