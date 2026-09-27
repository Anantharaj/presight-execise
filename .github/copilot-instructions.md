# Copilot instructions

Follow every rule in [AGENTS.md](../AGENTS.md) at the repository root. It is the single source of truth for
architecture, layering, security, testing and workflow rules in this project.

Key reminders:

- Contracts (schemas, constants, types) live only in `shared/src`.
- Server: `routes → controllers → services → repositories`; parameterized SQL only; keyset pagination with `id` as the tie-breaker.
- Client: `pages → containers → components/users → components/ui`; presentational components never fetch or read the URL; the URL is the source of truth for view state.
- Every component has stories; run `yarn typecheck && yarn test` before finishing.
