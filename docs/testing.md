# Testing guidelines

## Choosing and running tests

Use the cheapest layer that verifies meaningful behavior or a known regression. Keep unit tests focused on observable behavior; reserve browser, database and process tests for boundaries mocks cannot establish. Runner names are not cost labels: Vitest includes native image rendering, CSS compilation and file-store integration.

Run the checks for the affected area below. Once they pass, repeat or broaden testing only for new changes, failures or unresolved concerns. Temporary investigation tests can help reproduce a bug; retain them only when they provide useful lasting coverage. Simplify duplicate heavyweight scenarios while preserving their distinct failure cases.

For documentation-only edits, check formatting (`pnpm exec oxfmt --check <changed-files>`), local links/anchors, and any described commands or behavior against their implementation. Application suites are unnecessary unless executable content, fixtures, or code also changes.

## Expected diagnostics

Failure-path Vitest tests use `expectDiagnostics` from `tests/helpers/diagnostics.ts` inside the individual test. Declare the event, severity, relevant stage/status/error fields and exact count (one by default). The helper suppresses only matching structured messages up to that count and asserts every declared diagnostic occurred. Keep diagnostic privacy/correlation assertions on the returned captured strings where relevant.

Unmatched messages, malformed/plain text, different console levels and excess duplicates pass through with their original arguments. Do not use blanket console mocks, global event filters or silent test-runner settings to hide passing-test output. The helper uses console spies and is for non-concurrent tests only; Vitest restores mocks between tests. Browser/server and other process diagnostics remain untouched.

## GitHub Actions budget

Keep routine GitHub Actions usage limited to the core test job. Heavyweight e2e and browser tests should not be run by GitHub Actions by default. The [IndexNow workflow](../.github/workflows/indexnow.yml) is not a test: it submits changed URLs after production deploys and daily ([MEASUREMENT.md](MEASUREMENT.md#search-engines)).

Continue running relevant heavyweight checks locally for changes and releases that need them, and record their commands, tested revision and results. Reduced automatic CI does not waive those checks. The authoritative command list is in `package.json`; `pnpm test` includes inexpensive integrations as well as formatting, lint, types, unit tests, content validation and unused-code checks.

The single Node 24 job installs the locked dependencies and runs `pnpm test`. It has a five-minute timeout and cancels superseded runs on the same branch. It needs no secrets, `.env.*` files, database, browser installation, Portless proxy, or application build. A timeout is a signal to inspect cost, not automatically raise the limit.

The [Codex repair workflow](../.github/workflows/codex-autofix.yml) responds to failed push CI for current, open Codex PRs on same-repository branches started by a user with repository write access. Codex provenance uses the `codex/` branch convention or an explicit `codex-autofix` label for a Codex-created PR on a custom branch. Apply that label only when the creating Codex chat is known; a shared human GitHub author or a Codex review is not provenance. `claude/` branches (case-insensitive) and PRs labeled `claude` or `claude-code` are always excluded, even with a Codex marker. Unmarked custom branches are skipped.

The workflow waits ten minutes to give local Codex the first opportunity to repair, then rechecks the PR head and provenance before starting paid inference. It uses the repository's `OPENAI_API_KEY` Actions secret through `openai/codex-action` in a read-only GitHub job, runs the same locked install and `pnpm test`, and uploads a patch only after validation passes. A separate job commits the patch directly to the original PR branch and explicitly dispatches core CI, since `GITHUB_TOKEN` pushes do not trigger it. It never creates a repair PR or merges the original PR. Forks, the default branch, obsolete commits, rerun attempts, and dispatched CI runs are skipped to bound paid API use and prevent repair loops. Workflow and agent-instruction changes are excluded. The publisher rechecks the PR head and provenance and only uses a normal fast-forward push; concurrent local work makes an obsolete repair fail safely.

When continuing a local PR chat, fetch the remote before editing or pushing. If CI has added a repair commit, fast-forward a clean checkout; preserve and reconcile local changes or commits before pushing. GitHub Actions cannot wake or message a local desktop chat through this workflow. Local Codex chats should follow CI through completion while actively working on a PR, as required by the agent instructions. The separately configured local chat follow-up checks this repository every five minutes while the app is running, applies the same Codex-only provenance gate, repairs the existing PR through the signed-in session, and synchronizes remote repair commits into the owning local chat. That schedule is stored in the desktop app rather than installed by cloning this repository.

## Local change and release gates

Use native PostgreSQL and the dedicated `TEST_DATABASE_URL` ending in `_test`; never production data. See [Contributing](../CONTRIBUTING.md) for setup and environment precedence. Install Chromium once with `pnpm exec playwright install chromium`.

`check:browser`, `check:persistence` and `check:analytics` validate the incoming configuration, seed the test database, and start separate Portless development servers. Their persona seed requires the ignored local journey collection described in [Contributing](../CONTRIBUTING.md#curated-persona-data); installing packages alone is insufficient on a fresh checkout. The browser and persistence suites override inference to fixtures only after validation, so an incoming `live` configuration still requires a nonempty `TYPESAFE_API_KEY`. A test-only fixture environment avoids that credential dependency; ordinary `pnpm dev` always forces live Jev.

Portless can serve these local test origins over HTTPS with a locally issued certificate. Each Playwright configuration allows that certificate in both `webServer.ignoreHTTPSErrors` (the readiness probe) and `use.ignoreHTTPSErrors` (browser and request contexts). A missing readiness setting can report a startup timeout even when Next is ready; use `DEBUG=pw:webserver` to distinguish certificate errors from a slow or failed server.

Analytics tests use live-mode configuration to exercise SDK initialization, but supply synthetic credentials, mock assessment evaluation and intercept analytics transport. The production prefetch/cache suites reuse a prior local build through `start:local`; they do not submit inference. None of these checks should call paid providers.

| Change | Required checks beyond `pnpm test` |
| --- | --- |
| Browser UI, navigation, clipboard, keyboard, rendering | Relevant files through `pnpm check:browser tests/browser/<file>.spec.ts`; review affected desktop/mobile rendering when appropriate |
| Locale routing, message catalogs, language selector or hreflang | `pnpm check:browser tests/browser/i18n.spec.ts tests/browser/i18n-assessment.spec.ts tests/browser/i18n-locales.spec.ts` (the second fails on missing messages in the Spanish interview, result, library, profiles, About and Privacy; the third opens every locale's home and interview); after routing or caching changes, `pnpm build:local` then `pnpm check:prefetch` (`tests/prefetch/locales.spec.ts` also models how Vercel routes RSC and segment prefetch requests, which `next start` cannot show) |
| Translations of messages or authored content | `pnpm test:content` (coverage, source hashes, placeholders and ICU arguments for every enabled locale) and `pnpm test` (message formatting, display lookups and card font coverage); after translating, read a sample back. Translating makes paid OpenAI calls ([INTERNATIONALIZATION.md](INTERNATIONALIZATION.md#translation-tooling)) |
| Titles, structured data, sitemap/llms.txt, the P(doom) hub or blog posts | `pnpm test` (JSON-LD shapes, post frontmatter, data files, feed and post card) and `pnpm check:browser tests/browser/seo.spec.ts tests/browser/breadcrumbs.spec.ts`; after routing or rendering changes, `pnpm build:local` (asserts every locale's hub, index and posts are prebuilt and the sitemap bundles the posts) then `pnpm check:prefetch` |
| Share cards, social images or card fonts | `pnpm test` (`lib/sharing/card-fonts.test.ts`, `png-export.test.ts`), then look at a card in each of hi, th, zh and ja; `pnpm build:local` checks the fonts are traced |
| Ownership, sessions, drafts, library, publication, forks | `pnpm check:persistence`; relevant `db:test:*` checks below |
| Share links or comparisons | `pnpm check:persistence tests/persistence/share-links.spec.ts`, `pnpm check:browser tests/browser/share-bar.spec.ts tests/browser/compare.spec.ts` and `pnpm check:analytics`; after caching changes, `pnpm build:local` then `pnpm check:public-cache` (`tests/public-cache/share-links.spec.ts`) |
| Schema or repository transactions | `pnpm db:migrate:test` twice, `pnpm db:test`, `pnpm db:test:repository`, `pnpm db:test:commit`, `pnpm db:test:lifecycle` |
| Jev spend budget, provider billing failures or the over-budget notice | `pnpm db:test:budget` (concurrent spend, signals, the TypeSafe hold and a saved answer through the real evaluator with a mocked TypeSafe) and `pnpm check:browser tests/browser/jev-budget.spec.ts` |
| Result feedback (self-placement, agreement) | `pnpm db:test:feedback` and `pnpm check:browser tests/browser/result-feedback.spec.ts` |
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

## Interview benchmark

`pnpm test` runs the `lib/benchmark/` unit tests, including an offline interview through the engine with fixture judgments. The [interview benchmark](benchmark.md) itself makes paid calls, so it is neither routine nor a release gate. After a rubric, prompt, question or estimator change, compare `core` runs before and after, and record both run IDs and the comparison with the change. `pnpm benchmark:run --dry-run` checks a plan without network access.

## Crash and uncertain-commit checks

`pnpm db:test:commit` injects failures immediately before and after real PostgreSQL COMMIT. It checks rollback, saved success after a lost acknowledgment, acceptance uncertainty and explicit retry without duplicate evaluation.

`pnpm db:test:restart` needs Chromium, the local persona collection and a native local role with database-creation permission. It defaults to `postgresql://localhost:5432/postgres`; use `POSTGRES_TEST_ADMIN_URL` for a different local admin/test role with CREATEDB. It rejects non-local hosts, creates a uniquely named disposable `_test` database, migrates/seeds twice, and starts an isolated Portless server. It kills that server's observed process tree while a POST is blocked before commit, then verifies browser recovery and retry after restart. The script accelerates the stopped operation's deadline and drops the disposable database afterward; normal app/test databases are not reset.

## Deterministic journey browser fixtures

`tests/browser/journeys.spec.ts` uses `tests/fixtures/journey-browser-data.ts` to generate an in-memory suite once per worker. The subprocess uses the real runner with a mocked evaluator and scripted participant, blocks network access, and never writes to `work/journeys`. Per-test response clones isolate diagnostic/progression overrides; API request validation still reaches the real endpoint. This keeps journey assertions independent of whichever live run is latest. The shared browser server still requires persona seed data.

## Why heavy checks run locally

The September 24 audit measured [CI run 35912500069](https://github.com/transitive-bullshit/doom-or-bloom/actions/runs/35912500069) at about 8m51s: core checks 31s, build 44s, browser suite 6m37s, plus setup. The audit retained important browser/database/privacy boundaries, removed duplicate rendering matrices, and kept inexpensive native integrations in Vitest. Local scheduling reduces recurring CI cost; it does not waive change or release gates.

Historical validation after that audit: core checks and all 55 retained browser scenarios passed; the retained lazy-draft ownership/history regression also passed. On September 26, deterministic journey fixtures resolved the three missing-record journey failures, with all six journey cases and core checks passing. These are checkpoint observations, not a claim that today's full release gates have run.
