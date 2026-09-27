# AGENTS.md: Instructions for AI coding assistants

These rules apply to any AI tool working in this repository (GitHub Copilot, Claude, Cursor, Codex and others).
Read this file fully before making changes. If a rule conflicts with a direct user request, follow the user and say
so explicitly.

## 1. Project at a glance

- Yarn 1 workspaces + Lerna monorepo: `shared/` (contracts), `server/` (Express 5 + `node:sqlite`),
  `client/` (React 19 + Vite + Tailwind 4 + TanStack Query/Virtual).
- The SQLite database is the single source of truth for user data.
- The client's URL query string is the single source of truth for view state.
- Read `README.md` for setup, and the Storybook MDX docs in `client/src/docs/` for the architecture.

## 2. Commands (run from the repo root)

```bash
yarn install
yarn dev          # server :4000 + client :5173
yarn test         # must pass before you finish
yarn typecheck    # must pass before you finish
yarn lint
yarn storybook
yarn db:seed
docker compose up --build
```

Run `yarn typecheck && yarn test` after any change and report the result. Never claim success without running them.

## 3. Architecture rules (do not violate)

### Shared contracts

- API request schemas, constants and response types live **only** in `shared/src`. Never redefine them in
  `client/` or `server/`.
- `shared` exports TypeScript source (no build step). Keep it free of Node-only or DOM-only APIs.

### Server layering: `routes → controllers → services → repositories → db`

| Layer | Allowed | Forbidden |
| --- | --- | --- |
| `routes/` | map paths to controller methods | logic |
| `controllers/` | parse input with a shared Zod schema, call a service, `res.json` | SQL, business rules |
| `services/` | business rules, cursors, composition | `req`/`res`, SQL |
| `repositories/` | SQL via `db.prepare(...)` with `?` params | HTTP, business rules |
| `models/` | row types, mappers, whitelists | I/O |

- Wire new classes in `server/src/container.ts`. Never instantiate dependencies inside other classes.
- Services depend on repository **interfaces** (e.g. `UserRepository`), not on concrete classes.
- Throw `HttpError` for expected failures. Let `ZodError` bubble up to the error middleware. Never send errors
  directly from services.
- Schema changes: add a **new** migration file (`db/migrations/00N_name.ts`) and append it to the array.
  Never edit an existing migration.
- Express 5 forwards async errors automatically. Do not add `try/catch` just to call `next(err)`.

### Client layering: `pages → containers → components → ui`

| Folder | Role | May import |
| --- | --- | --- |
| `pages/` | layout composition | containers, ui |
| `containers/` | read `useUserViewState`, call query hooks, pass props | queries, state, components |
| `components/users/` | domain presentational (props in, callbacks out) | `components/ui`, shared types |
| `components/ui/` | generic presentational | `lib/`, hooks. **No** domain types, queries or URL state |
| `queries/` | TanStack Query hooks + `userKeys` | `api/` |
| `api/` | typed fetch functions over `lib/http.ts` | shared |
| `state/` | URL view state (pure functions + hook) | shared |

- Presentational components must **never** fetch data or read the URL.
- Every component lives in `components/<category>/<Name>/` with `Name.tsx`, `Name.stories.tsx`, `index.ts`, and
  `Name.test.tsx` if it has logic. Re-export it from the category `index.ts` barrel.
- Import with the `@/` alias (`@/components/ui`), not with deep relative paths across folders.
- Style with Tailwind utilities and `cn()`. Accept a `className` prop. Use the design tokens in `src/index.css`
  (`brand-*`).
- Any new view state must be added to the URL: extend `UserViewState`, `URL_KEYS`, `parseViewState` and
  `serializeViewState`, and add tests to `user-view-state.test.ts`.
- Query keys must come from the key factory in `queries/`. Do not inline arrays.

## 4. Behavioral invariants (covered by tests; keep them green)

1. Nationality filter = **OR**. Hobby filter = **AND**. Search / nationality / hobby combine with **AND**.
2. Search is a case-insensitive substring match on `first_name || ' ' || last_name`, with LIKE wildcards escaped.
3. Sorting always ends with `id` as the tie-breaker. Pagination is **keyset** on `(column, id)`. Never switch to OFFSET.
4. Hobby facets apply all filters. Nationality facets ignore the nationality selection (disjunctive). Both return the
   top 20, sorted by `count DESC, value ASC`.
5. When search or filters change, the client refetches both the list and the facets. A sort change refetches only
   the list.
6. The list must stay virtualized (`VirtualGrid`). Never render the full result set.

## 5. Security requirements

- SQL: bind every value with `?`. Identifiers (columns, sort directions) come only from whitelists such as
  `USER_SORT_COLUMNS`. Never interpolate user input into SQL.
- Validate all external input with Zod at the boundary (controllers, env). Keep size limits (`MAX_*` constants).
- Do not log secrets or full request bodies. Do not disable `helmet` or the nginx CSP. Extend them if a new
  origin is needed.
- Do not add dependencies with known vulnerabilities. Prefer the platform (`node:sqlite`, `fetch`, `<dialog>`)
  over new packages.

## 6. Code style

- TypeScript `strict` + `noUncheckedIndexedAccess`. No `any`. No non-null `!` unless the invariant is obvious.
- `import type` for type-only imports (lint-enforced).
- File names: `PascalCase.tsx` for components, `camelCase` hooks (`useX.ts`), `kebab.role.ts` on the server
  (`user.service.ts`).
- Comments explain *why*, in one short line. No commented-out code. No change-log comments.
- Keep functions small. Don't add abstractions, options or error handling for cases that can't happen.

## 7. Testing requirements

- Server behavior change → add or adjust a Supertest case in `server/test/`. Use `createTestDb(fixtures)` and
  `startTestServer(db)` from `test/helpers.ts`.
- Client pure logic → a Vitest unit test next to the file. Interactive components → a Testing Library test that
  queries by role or label.
- New or changed component → update its stories to cover every visual state (loading, empty, error, edge cases).
  Use `tags: ['autodocs']` and `fn()` for callbacks.

## 8. Documentation requirements

- Update `README.md` when setup, scripts, env vars or API behavior change.
- Update the relevant MDX page in `client/src/docs/` when architecture or conventions change.
- Do not create extra markdown files unless asked.

## 9. Workflow for AI agents

1. Read the relevant files before editing. Search for existing utilities before writing new ones.
2. Make the smallest change that fully solves the task, and follow the layering above.
3. Run `yarn typecheck && yarn test` (and `yarn lint` if you touched many files).
4. Summarize what changed and why, and name any trade-offs or follow-ups.
5. Ask before destructive actions: deleting files, `docker compose down -v`, rewriting git history, or
   changing shipped migrations.
