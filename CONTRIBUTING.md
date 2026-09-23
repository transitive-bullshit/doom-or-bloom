# Contributing

Thanks for helping improve Doom or Bloom. Useful feedback includes misinterpreted answers, repetitive questions, missing perspectives, and stronger primary sources. Please avoid posting private assessment transcripts in public issues.

## Local development

Use Node.js 24 or newer and the pnpm version pinned in `package.json`.

```sh
pnpm install --frozen-lockfile
cp .env.example .env.development.local
pnpm dev
```

If `.env.development.local` already exists, edit it rather than overwriting credentials. Set `TYPESAFE_API_KEY` before submitting live answers, or choose fixture mode below. Keep secrets out of commits and screenshots.

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

These local connections use Postgres.app's local authentication policy. Do not relax authentication on a network-accessible server. Set the URLs in `.env.development.local` from `.env.example`, generate an auth secret with `openssl rand -base64 48`, and set the Portless origin. Keep `.env.development.local` private. Store production Neon connections in ignored `.env.production.local` as `DATABASE_URL` and `DATABASE_MIGRATION_URL`. Keep development `DATABASE_URL` and `TEST_DATABASE_URL` in `.env.development.local` pointing to Postgres.app.

```sh
pnpm db:migrate
pnpm db:migrate:test
pnpm db:seed
pnpm db:seed --test
pnpm db:test
pnpm db:test:repository
pnpm db:test:commit
pnpm db:test:lifecycle
pnpm db:test:personas
pnpm db:test:auth
```

Migrations are checked in under `drizzle/`; repeat application is a no-op. After schema changes run `pnpm db:generate` and review the SQL. Deferred circular pointers, immutable snapshot enforcement, and persona selection triggers live in the custom `0001` migration; preserve them when generating changes. `pnpm db:auth:generate` regenerates the pinned Better Auth schema. Integration tests use only `TEST_DATABASE_URL`, whose database name must end in `_test`, and remove their transient records. The persona suite leaves the repeatable curated seed in the test database.

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

`pnpm test` covers formatting, lint, types, unit tests, content validation, and unused code. If local development uses fixture mode, build with `ASSESSMENT_PROVIDER=live pnpm build`; production deliberately rejects fixture mode, and building does not run inference. The CI workflow installs native PostgreSQL, applies migrations twice, seeds curated fixtures and runs database/browser persistence checks without containers. Ordinary checks use fixtures and need no inference credentials. Browser tests use their own Portless hostname and build directory; consult `playwright.config.ts` when troubleshooting a local server collision.

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

`pnpm db:seed` imports only the curated public catalog from the existing recorded fixture, without inference. Repeat imports retain identical assessment IDs and never replace a newer selected run. Homepage, persona pages, comparisons and social images read selected runs from Postgres; seed the local database before browsing them.

`/user-journeys` is the development inspector. Source-grounded persona briefs drive simulated participants through the real engine, preserving answers, projections, and routing decisions for review. Published persona records are generated examples, never collected visitor sessions.

```sh
# Free, deterministic workflow regressions
pnpm journeys:mechanical:check
```

`pnpm journeys:generate` runs **live OpenAI and Jev inference and costs money**. Review [the journey workflow](docs/user-journeys.md) for persona selection and explicit request/cost bounds before running it. Live curated generation now saves a private generation record before inference, then atomically publishes its full engine snapshot and selects it on success. Failures retain private diagnostics and the previous selection. Generation is synchronous; no worker retries it. A new run (including an explicit resume) creates a new assessment. Runs that exceed the offline 30-minute commit deadline cannot publish. Existing persona cases are development regressions, not a blinded accuracy benchmark.

Other live evaluation commands also incur charges. Use the [evaluation protocol](docs/evaluation-protocol.md) to agree a small reviewed suite and budget before running them. Do not use live inference for ordinary UI or state-machine checks.

Runtime source matching and external fact-checking are currently paused. Source briefs ground the simulated personas; they do not validate visitor claims. Follow [source guidance](docs/SOURCES.md) for provenance and [authoring guidance](docs/AUTHORING.md) for review/versioning before changing content releases.

Deployment is a separate task from local development.

## Optional X login

Set `X_CLIENT_ID` and `X_CLIENT_SECRET` in ignored `.env.development.local` for an X OAuth 2.0 **Web App** (confidential client). The library shows “Keep access with X” only when both are configured. Anonymous assessment creation, completion and publication stay available.

Register the exact callback `${BETTER_AUTH_URL}/api/auth/callback/twitter`; the current Portless callback is `http://doom-or-bloom.localhost:1355/api/auth/callback/twitter`. X must accept that URI in its console before a live test. If it rejects the local hostname, coordinate an approved reachable development origin and update the app origin and registered callback together. Do not silently switch hosts and lose the anonymous browser cookie. Hosted callback registration belongs to deployment.

The pinned Better Auth X provider uses `users.read tweet.read`, with its default email/offline scopes disabled. No posting or follower permissions are requested. Provider/account IDs establish identity, and email-based account linking is disabled. See [Better Auth’s X setup](https://better-auth.com/docs/authentication/twitter) and [X OAuth configuration and exact callback matching](https://docs.x.com/fundamentals/authentication/oauth-2-0/authorization-code). Provider access and acceptance of the local callback remain unverified until real credentials are configured.

`pnpm db:test:auth` exercises actual Better Auth handlers with mocked provider HTTP responses and native test Postgres. It covers initial claim, recovery with the same provider identity in a fresh browser, sign-out, merging into an existing account, an injected database transfer failure, retry and concurrent assessment processing. No requests reach X. Live login remains a separate setup-dependent check.

## Crash and uncertain-commit checks

`pnpm db:test:commit` injects driver failures immediately before and after real PostgreSQL COMMIT. It verifies rollback, saved success after a lost acknowledgment, acceptance uncertainty and explicit retry without duplicate evaluation.

`pnpm db:test:restart` requires Chromium (`pnpm exec playwright install chromium`) and native local PostgreSQL database-creation permission. It defaults to the current local role on `postgresql://localhost:5432/postgres`; optionally supply `POSTGRES_TEST_ADMIN_URL` for a local admin/test role with CREATEDB. The script rejects non-local hosts, creates a uniquely named `doom_bloom_recovery_*_test` database, applies migrations twice, seeds twice and launches a separate Portless development server. It kills only that server’s observed process tree while a real POST is blocked before snapshot commit, then reopens the assessment after restart and retries the saved submission in Chromium. It accelerates the stopped request’s deadline to avoid a two-minute sleep. The disposable database is dropped afterward; normal development/test databases are not reset.

For an actual interrupted submission, reopen its assessment, wait until the processing deadline has passed, then choose **Retry saved submission**. The prior committed snapshot remains authoritative. A lost response may already represent success, so use **Check submission** or refresh before creating a new request. No worker or restart-time automatic inference runs.

The browser regression suite now loads `.env.development.local`, requires `TEST_DATABASE_URL`, and seeds its dedicated native test database before starting `browser-tests.doom-or-bloom` through Portless. Migrated tests use the real saved-assessment API; specialized rendering fixtures commit synthetic evaluator responses through the repository in a server-conditioned subprocess so refreshes read the same immutable database state. These helpers are test-only. Auth/recovery acceptance uses the separate real-route persistence suite. All assessment fixtures now use saved state; consult the checkpoint log for the latest complete-suite validation. `pnpm check:analytics` also uses the dedicated test database and intercepts third-party analytics transport to verify payload privacy.

Use the same `X_CLIENT_ID` and `X_CLIENT_SECRET` names in ignored `.env.production.local` for the production X app. The production callback is `https://doom-or-bloom.com/api/auth/callback/twitter`. Development credentials remain in `.env.development.local`.

Next.js selects `.env.development.local` for `pnpm dev`, and `.env.production.local` for `pnpm build` / `pnpm start`. Host environment values take precedence over files. Both files are ignored and use identical variable names. Avoid a shared `.env.local` for environment-specific values.

Use `pnpm build:local` and `pnpm start:local` to check production mode against local Postgres and development OAuth. These explicitly preload development configuration; both commands select the live provider configuration; building does not run paid inference. Ordinary `pnpm build` / `pnpm start` can use Neon from the production file and are not the local acceptance commands. Migration and test scripts explicitly load `.env.development.local`; production migrations remain separately authorized work.
