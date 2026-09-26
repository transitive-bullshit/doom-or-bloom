# Contributing

Start with the [agent guide](AGENTS.md) and [project orientation](docs/README.md) for product intent and architecture. This page owns local setup and environment behavior; [testing](docs/testing.md) owns validation gates. Use generated examples when reporting bugs: assessment transcripts and diagnostic exports can contain private answers.

## Local setup

Use Node.js 24 or newer and the pnpm version pinned in `package.json`.

```sh
pnpm install --frozen-lockfile
```

If `.env.development.local` does not exist, create it with `cp .env.example .env.development.local`. Fill in the local database URLs, a real `TYPESAFE_API_KEY`, `BETTER_AUTH_URL`, and an auth secret generated with `openssl rand -base64 48`. [`.env.example`](.env.example) documents the remaining settings. Visitor assessments use Jev; `OPENAI_API_KEY` is needed only for live persona generation. Optional X login is described below.

### Native PostgreSQL

Use native PostgreSQL, with Postgres.app verified locally. No Docker or worker process is needed. With the server running, open `/Applications/Postgres.app/Contents/Versions/latest/bin/psql -d postgres` and create the dedicated local roles and databases once:

```sql
CREATE ROLE doom_bloom_dev LOGIN;
CREATE ROLE doom_bloom_test LOGIN;
CREATE DATABASE doom_bloom_dev OWNER doom_bloom_dev;
CREATE DATABASE doom_bloom_test OWNER doom_bloom_test;
```

The template URLs use Postgres.app's local authentication policy. Keep development and tests on local Postgres; preserve authentication on network-accessible servers. Then apply the checked-in migrations:

```sh
pnpm db:migrate
pnpm db:migrate:test
```

Repeated migration application is a no-op. After schema changes, run `pnpm db:generate` and review the SQL. Custom `drizzle/0001_*.sql` enforces immutable snapshots, deferred circular pointers and persona selection; preserve those constraints. `pnpm db:auth:generate` regenerates the pinned Better Auth schema.

### Curated persona data

The homepage, persona pages, comparisons and social images read selected runs from PostgreSQL. Populate them without inference:

```sh
pnpm db:seed
pnpm db:seed --test
```

**A fresh checkout does not contain the full seed data.** Seeding reads successful curated records from ignored `work/journeys/`; the committed two-person sample is only for unit tests. Import an existing saved collection with `pnpm journeys:migrate --file=<saved-suite.json>` before seeding. If no collection is available, report this setup dependency; `pnpm journeys:generate` is paid live generation, not a routine seed repair. See [journey storage and imports](docs/user-journeys.md#budgets-and-storage).

Repeat seeding retains identical assessment IDs and preserves newer selected runs. Database and browser suites that seed personas also need the local collection.

### Start the app

```sh
pnpm dev
```

The launcher validates configuration, forces live Jev and starts Next through Portless. It reports invalid variable names without printing credentials. Open the printed URL. For the root checkout, resolve it later with `pnpm exec portless get doom-or-bloom --no-worktree`; linked worktrees use their printed branch-prefixed URL. Set `BETTER_AUTH_URL` and the registered development X callback to the exact origin used by that checkout. Isolated browser tests and admin inspection use separate names.

Use [local debugging](docs/local-debugging.md) for saved operations and recorded Jev exchanges, [local admin](docs/admin.md) for read-only database inspection, and [remote testing](docs/remote-testing.md) for Tailscale or a temporary tunnel. Takumi's native image renderer is installed with the dependencies.

## Environment boundaries

Keep `.env.development.local` and `.env.production.local` private. Use identical variable names in each, with native Postgres/development OAuth in the former and hosted credentials in the latter. Avoid a shared `.env.local` for environment-specific values.

| Command | Configuration and precedence |
| --- | --- |
| `pnpm dev`, `pnpm dev:tailscale`, `pnpm admin:*` | `scripts/dev.ts` reads `.env.development.local`; values in that file override inherited shell/editor values. It then forces development mode and live Jev. Restart after file changes. Admin uses a separate target-specific inspection connection; see [admin](docs/admin.md). |
| `pnpm build:local`, `pnpm start:local` | Preload `.env.development.local` and force live Jev. Existing shell values take precedence. Use these for production-mode checks against local settings. Building does not call inference. |
| Database scripts and development Playwright commands | Explicitly load `.env.development.local` with Node's `--env-file`; inherited shell values take precedence. Browser/persistence suites select fixture inference for their isolated servers. See [test setup](docs/testing.md#local-change-and-release-gates) for exceptions. |
| `pnpm build`, `pnpm start` | Standard Next production environment loading, including `.env.production.local`; existing shell values take precedence. These can connect to the hosted database and are not local acceptance commands. |

When diagnosing a mismatch, inspect the launcher and parse the intended env file directly. Printing `process.env` after `--env-file` can still show an inherited value. The development launcher deliberately differs from the other commands; removing an exported variable will not override a value saved in its file.

Analytics are off by default and disabled in fixture mode. Enabling analytics requires the PostHog settings and confirmed IP disposal validated by `lib/server/validate-env.ts`; see [measurement](docs/MEASUREMENT.md) for the privacy contract.

## Development checks

Use modern TypeScript without semicolons, oxfmt (`pnpm fix:format`) and oxlint (`pnpm fix:lint`). Reuse shadcn/ui primitives. Follow the installed Next.js docs as directed by [AGENTS.md](AGENTS.md).

Run `pnpm test` for formatting, lint, types, Vitest, content validation and unused-code checks. It needs no local secrets, database or live generation. GitHub Actions runs this core command only. Run the additional checks required by the [change and release gates](docs/testing.md#local-change-and-release-gates); browser/database checks and production builds remain local responsibilities.

For production-mode verification use `pnpm build:local` and `pnpm start:local`. Run build and type generation sequentially because they share generated Next files. Deployment and production migrations are separate work.

## Persona simulations and live evaluation

`/user-journeys` inspects recorded source-grounded simulations through the real assessment engine. Public persona records are generated examples, not collected visitor sessions. Use `pnpm journeys:mechanical:check` for free deterministic engine regressions.

`pnpm journeys:generate` uses **live OpenAI and Jev and costs money**. Follow [the journey workflow](docs/user-journeys.md) for selection, request/cost bounds, saved runs and publication. Other live evaluation commands follow the [evaluation protocol](docs/evaluation-protocol.md). Use synthetic inference for ordinary UI and state-machine checks.

Runtime corpus grounding is paused. Persona source briefs ground the simulated participant; they do not fact-check visitor claims. Follow [source guidance](docs/SOURCES.md) and [authoring](docs/AUTHORING.md) before changing content releases.

## Optional X login

Set both `X_CLIENT_ID` and `X_CLIENT_SECRET` for an X OAuth 2.0 **Web App** (confidential client). The library then offers “Keep access with X”; anonymous assessment creation, results and publication remain available.

Register exactly `${BETTER_AUTH_URL}/api/auth/callback/twitter` in the X app. Use the resolved Portless origin for development; preserve the origin when testing an anonymous ownership claim because cookies belong to it. The canonical production callback is `https://www.doom-or-bloom.com/api/auth/callback/twitter`; a bare-domain redirect does not make callback URLs interchangeable. Production credentials belong in `.env.production.local`.

The pinned Better Auth provider requests `users.read tweet.read`, with email/offline scopes disabled. Provider/account IDs establish identity; email-based linking is disabled. `pnpm db:test:auth` verifies real auth handlers against mocked X HTTP and native test Postgres, including claim, recovery, transfer failure and retry. Use an actual provider smoke test when changing OAuth configuration. For ownership semantics, see [persistence](docs/PERSISTENCE.md).
