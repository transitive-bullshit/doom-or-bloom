# Contributing

Thanks for helping improve Doom or Bloom. Useful feedback includes misinterpreted answers, repetitive questions, missing perspectives, and stronger primary sources. Please avoid posting private assessment transcripts in public issues.

## Local development

Use Node.js 24 or newer and the pnpm version pinned in `package.json`.

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

If `.env.local` already exists, edit it rather than overwriting credentials. Set `TYPESAFE_API_KEY` before submitting live answers, or choose fixture mode below. Keep secrets out of commits and screenshots.

Development runs through [Portless](https://portless.sh). Open the URL printed by `pnpm dev`; linked worktrees may receive a hostname prefix. Resolve the current URL with:

```sh
pnpm exec portless get doom-or-bloom
```

Reuse that origin for browser sessions and set `BETTER_AUTH_URL` to it. Provision native PostgreSQL as described below. PNG generation uses Takumi’s native backend, installed with the project dependencies.

## Native PostgreSQL

Use Postgres.app (verified with PostgreSQL 17.4). No Docker or background worker is needed. With the native server running, create dedicated roles and databases once:

```sh
/Applications/Postgres.app/Contents/Versions/latest/bin/psql -d postgres
```

```sql
CREATE ROLE doom_bloom_dev LOGIN;
CREATE ROLE doom_bloom_test LOGIN;
CREATE DATABASE doom_bloom_dev OWNER doom_bloom_dev;
CREATE DATABASE doom_bloom_test OWNER doom_bloom_test;
```

These local connections use Postgres.app's local authentication policy. Do not relax authentication on a network-accessible server. Set the URLs in `.env.local` from `.env.example`, generate an auth secret with `openssl rand -base64 48`, and set the Portless origin. Keep `.env.local` private. The ignored `.env.neon.local` is production-only and is never automatically loaded.

```sh
pnpm db:migrate
pnpm db:migrate:test
pnpm db:test
pnpm db:test:repository
```

Migrations are checked in under `drizzle/`; repeat application is a no-op. After schema changes run `pnpm db:generate` and review the SQL. Deferred circular pointers, immutable snapshot enforcement, and persona selection triggers live in the custom `0001` migration; preserve them when generating changes. `pnpm db:auth:generate` regenerates the pinned Better Auth schema. Integration tests use only `TEST_DATABASE_URL`, whose database name must end in `_test`, and remove their own records.

Participant assessments use database-backed ownership and snapshots. Anonymous sessions have a 365-day server lifetime, refreshed after a day of activity by Better Auth's session endpoint. Browser cookie policies can shorten access. Anonymous cleanup is disabled; assessments restrict owner deletion. Public page reads must not sign in visitors.

## Environment variables

[`.env.example`](.env.example) is the configuration template.

| Variable | Purpose |
| --- | --- |
| `TYPESAFE_API_KEY` | Server-only key required for live Jev assessments. |
| `TYPESAFE_MODEL` | Model override; defaults to `jev-1.13.0`. |
| `ASSESSMENT_PROVIDER` | `live` by default; `fixture` uses synthetic judgments without inference calls, in development/tests only. |
| `NEXT_PUBLIC_ASSESSMENT_DEBUG` | Enables assessment debugging; set to `true` to inspect recorded requests, responses, and routing decisions. |
| `OPENAI_API_KEY` | Only needed for generating live simulated persona answers. Visitor assessments do not use OpenAI. |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | Optional analytics, off by default and disabled in fixture mode. |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | Optional PostHog configuration. |
| `POSTHOG_IP_DISPOSAL_CONFIRMED` | Set `true` only after enabling IP-data disposal in the PostHog project. |

Analytics being enabled permits Vercel page analytics independently of PostHog. Assessment events use allowlisted identifiers and coarse buckets, excluding answers and excerpts. See the [measurement contract](docs/MEASUREMENT.md).

## Checks

```sh
pnpm fix
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm check:browser
pnpm check:persistence
```

`pnpm test` covers formatting, lint, types, unit tests, content validation, and unused code. Ordinary checks use fixtures and need no inference credentials. Browser tests use their own Portless hostname and build directory; consult `playwright.config.ts` when troubleshooting a local server collision.

Use modern TypeScript without semicolons, oxfmt for formatting, and oxlint for linting. Reuse shadcn/ui primitives. Read the repository’s [agent conventions](AGENTS.md) and the installed Next.js documentation before changing framework behavior.

## Understanding the engine

Start with the [handoff index](docs/README.md). The most useful deeper references are:

- [Assessment semantics](docs/ASSESSMENT.md): evidence, readiness, recovery, routing, and map projections.
- [Jev integration](docs/TYPESAFE.md): typed judgments, shared state, batching, and inference boundaries.
- [Debugging](docs/local-debugging.md): inspect exact inputs, outputs, and decisions without new inference calls.
- [Authoring](docs/AUTHORING.md): versioned questions, rubrics, findings, and sources.

Keep participant questions and result prose authored. Missing evidence must not become a low score, and a model’s interpretation confidence must not become a forecast probability. Changes to persisted data should preserve answers, drafts, and their original version metadata.

Submitted progress lives in PostgreSQL. Only unsubmitted drafts and uncertain request keys live in localStorage, separately per assessment. Historical browser debug traces live separately in IndexedDB. They can contain complete answers; use generated examples for bug reports and screenshots.

## Persona simulations and regression work

`/user-journeys` is the development inspector. Source-grounded persona briefs drive simulated participants through the real engine, preserving answers, projections, and routing decisions for review. Published persona records are generated examples, never collected visitor sessions.

```sh
# Free, deterministic workflow regressions
pnpm journeys:mechanical:check
```

`pnpm journeys:generate` runs **live OpenAI and Jev inference and costs money**. Review [the journey workflow](docs/user-journeys.md) for persona selection and explicit request/cost bounds before running it. Existing persona cases are development regressions, not a blinded accuracy benchmark.

Other live evaluation commands also incur charges. Use the [evaluation protocol](docs/evaluation-protocol.md) to agree a small reviewed suite and budget before running them. Do not use live inference for ordinary UI or state-machine checks.

Runtime source matching and external fact-checking are currently paused. Source briefs ground the simulated personas; they do not validate visitor claims. Follow [source guidance](docs/SOURCES.md) for provenance and [authoring guidance](docs/AUTHORING.md) for review/versioning before changing content releases.

Deployment is a separate task from local development.
