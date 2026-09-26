# Testing guidelines

## Choosing and running tests

Use the cheapest layer that verifies meaningful behavior or a known regression. Keep unit tests focused on observable behavior; reserve browser, database and process tests for boundaries mocks cannot establish. Runner names are not cost labels: Vitest includes native image rendering, CSS compilation and file-store integration.

Run the checks for the affected area below. Once they pass, repeat or broaden testing only for new changes, failures or unresolved concerns. Temporary investigation tests can help reproduce a bug; retain them only when they provide useful lasting coverage. Simplify duplicate heavyweight scenarios while preserving their distinct failure cases.

For documentation-only edits, check formatting (`pnpm exec oxfmt --check <changed-files>`), local links/anchors, and any described commands or behavior against their implementation. Application suites are unnecessary unless executable content, fixtures, or code also changes.

## Expected diagnostics

Failure-path Vitest tests use `expectDiagnostics` from `tests/helpers/diagnostics.ts` inside the individual test. Declare the event, severity, relevant stage/status/error fields and exact count (one by default). The helper suppresses only matching structured messages up to that count and asserts every declared diagnostic occurred. Keep diagnostic privacy/correlation assertions on the returned captured strings where relevant.

Unmatched messages, malformed/plain text, different console levels and excess duplicates pass through with their original arguments. Do not use blanket console mocks, global event filters or silent test-runner settings to hide passing-test output. The helper uses console spies and is for non-concurrent tests only; Vitest restores mocks between tests. Browser/server and other process diagnostics remain untouched.

## GitHub Actions budget

Keep routine GitHub Actions usage limited to the core test job. Heavyweight e2e and browser tests should not be run by GitHub Actions by default.

Continue running relevant heavyweight checks locally for changes and releases that need them, and record their commands, tested revision and results. Reduced automatic CI does not waive those checks. The authoritative command list is in `package.json`; `pnpm test` includes inexpensive integrations as well as formatting, lint, types, unit tests, content validation and unused-code checks.

The single Node 24 job installs the locked dependencies and runs `pnpm test`. It has a five-minute timeout and cancels superseded runs on the same branch. It needs no secrets, `.env.*` files, database, browser installation, Portless proxy, or application build. A timeout is a signal to inspect cost, not automatically raise the limit.

## Local change and release gates

Use native PostgreSQL and the dedicated `TEST_DATABASE_URL` ending in `_test`; never production data. See [Contributing](../CONTRIBUTING.md) for setup and environment precedence. Install Chromium once with `pnpm exec playwright install chromium`.

`check:browser`, `check:persistence` and `check:analytics` validate the incoming configuration, seed the test database, and start separate Portless development servers. Their persona seed requires the ignored local journey collection described in [Contributing](../CONTRIBUTING.md#curated-persona-data); installing packages alone is insufficient on a fresh checkout. The browser and persistence suites override inference to fixtures only after validation, so an incoming `live` configuration still requires a nonempty `TYPESAFE_API_KEY`. A test-only fixture environment avoids that credential dependency; ordinary `pnpm dev` always forces live Jev.

Analytics tests use live-mode configuration to exercise SDK initialization, but supply synthetic credentials, mock assessment evaluation and intercept analytics transport. The production prefetch/cache suites reuse a prior local build through `start:local`; they do not submit inference. None of these checks should call paid providers.

| Change | Required checks beyond `pnpm test` |
| --- | --- |
| Browser UI, navigation, clipboard, keyboard, rendering | Relevant files through `pnpm check:browser tests/browser/<file>.spec.ts`; review affected desktop/mobile rendering when appropriate |
| Ownership, sessions, drafts, library, publication, forks | `pnpm check:persistence`; relevant `db:test:*` checks below |
| Schema or repository transactions | `pnpm db:migrate:test` twice, `pnpm db:test`, `pnpm db:test:repository`, `pnpm db:test:commit`, `pnpm db:test:lifecycle` |
| Persona persistence or selected runs | `pnpm db:test:personas` and `pnpm check:persistence tests/persistence/personas.spec.ts` |
| Authentication or anonymous claim | `pnpm db:test:auth` and `pnpm check:persistence tests/persistence/auth.spec.ts`; actual provider smoke test when OAuth configuration changes |
| Interrupted operations or restart recovery | `pnpm db:test:commit`, `pnpm db:test:restart` |
| Analytics or privacy boundaries | `pnpm check:analytics` |
| Packaging, Next config, assets, server routes | `pnpm build:local` (includes production trace/asset checks) |
| Simulated-profile static rendering or map prefetching | `pnpm build:local` then `pnpm check:prefetch`; production-only prefetch checks run with an unreachable database |
| Public assessment rendering or cache invalidation | `pnpm build:local`, then `pnpm check:public-cache` and `pnpm check:prefetch`; verify publication warmup, immediate HTML/RSC revocation, and built shares with an unreachable database |
| Release | All above database commands, full `pnpm check:browser`, `pnpm check:persistence`, `pnpm check:analytics`, `pnpm db:test:restart`, and `pnpm build:local`; include the prefetch/cache checks when their affected areas changed |

Run suites sequentially: browser suites share the test database, and build/typegen can conflict over generated Next types. Do not add retries to hide deterministic failures. Preserve traces for failed browser scenarios and record unresolved failures explicitly. Paid Jev/OpenAI evaluations require their own agreed scope and budget; they are not routine test or release requirements.

Record validation in the PR or checkpoint log with the commit SHA (and whether the tree was dirty), commands, results/counts, elapsed time, and any blocked or omitted relevant checks. A passing core CI job alone does not establish release readiness.

## Crash and uncertain-commit checks

`pnpm db:test:commit` injects failures immediately before and after real PostgreSQL COMMIT. It checks rollback, saved success after a lost acknowledgment, acceptance uncertainty and explicit retry without duplicate evaluation.

`pnpm db:test:restart` needs Chromium, the local persona collection and a native local role with database-creation permission. It defaults to `postgresql://localhost:5432/postgres`; use `POSTGRES_TEST_ADMIN_URL` for a different local admin/test role with CREATEDB. It rejects non-local hosts, creates a uniquely named disposable `_test` database, migrates/seeds twice, and starts an isolated Portless server. It kills that server's observed process tree while a POST is blocked before commit, then verifies browser recovery and retry after restart. The script accelerates the stopped operation's deadline and drops the disposable database afterward; normal app/test databases are not reset.

## Deterministic journey browser fixtures

`tests/browser/journeys.spec.ts` uses `tests/fixtures/journey-browser-data.ts` to generate an in-memory suite once per worker. The subprocess uses the real runner with a mocked evaluator and scripted participant, blocks network access, and never writes to `work/journeys`. Per-test response clones isolate diagnostic/progression overrides; API request validation still reaches the real endpoint. This keeps journey assertions independent of whichever live run is latest. The shared browser server still requires persona seed data.

## Why heavy checks run locally

The September 24 audit measured [CI run 35912500069](https://github.com/transitive-bullshit/doom-or-bloom/actions/runs/35912500069) at about 8m51s: core checks 31s, build 44s, browser suite 6m37s, plus setup. The audit retained important browser/database/privacy boundaries, removed duplicate rendering matrices, and kept inexpensive native integrations in Vitest. Local scheduling reduces recurring CI cost; it does not waive change or release gates.

Historical validation after that audit: core checks and all 55 retained browser scenarios passed; the retained lazy-draft ownership/history regression also passed. On September 26, deterministic journey fixtures resolved the three missing-record journey failures, with all six journey cases and core checks passing. These are checkpoint observations, not a claim that today's full release gates have run.
