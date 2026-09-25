# Testing guidelines

## Choosing permanent tests

Be relaxed about adding and keeping fast, isolated unit tests. A small, deterministic test of meaningful behavior, an edge case, or a regression can earn its place even for a reversible, low-impact change. Keep setup and assertions simple; tests that merely repeat implementation details or check arbitrary constants add little confidence.

Be more judicious with heavyweight integration and end-to-end tests. They are essential for behavior that depends on real browsers, builds, storage, process boundaries, or interactions between components, but impose greater runtime, CI, debugging, and maintenance costs. Each test should cover an important failure mode that cheaper tests cannot adequately catch. Prefer focused scenarios and representative combinations; expand theme, viewport, option, and lifecycle matrices when the combinations expose distinct risks.

Judge a test by its actual dependencies and cost, not its filename or runner. A test that launches a browser, builds packages, or starts a server is an integration test even if it runs under the unit command. Use the cheapest layer that gives credible coverage, retaining browser checks for rendering, native interaction, and extension lifecycle behavior that mocks cannot establish.

## Running and maintaining tests

Run tests appropriate to the change and complete required checks. Once those pass, broaden or repeat testing only when new changes, failures, or unresolved concerns justify it; otherwise, continue toward completing the task. These guidelines preserve the checks required by the affected area and release workflow.

When reviewing expensive tests, consider the unique failures they catch alongside measured runtime, flakiness, setup, and maintenance burden. Simplify duplicate scenarios and move suitable assertions to cheaper tests before removing valuable coverage. Keep critical user journeys and known regressions covered. Changing how often a heavyweight suite runs requires preserving its relevant change and release checks; do not silently skip required coverage.

## GitHub Actions budget

Keep routine GitHub Actions usage limited to the core test job. Heavyweight e2e and browser tests should not be run by GitHub Actions by default.

Continue running relevant heavyweight checks locally for changes and releases that need them, and record their commands, tested revision and results. Reduced automatic CI does not waive those checks. Budget the remaining job's actual commands: `pnpm test` includes integration tests as well as unit tests, formatting, lint and typechecks.

The single Node 24 job installs the locked dependencies and runs `pnpm test`. It has a five-minute timeout and cancels superseded runs on the same branch. It needs no secrets, `.env.*` files, database, browser installation, Portless proxy, or application build. A timeout is a signal to inspect cost, not automatically raise the limit.

## Temporary tests

Temporary tests may break these guidelines when they help validate an implementation or reproduce an issue. Before finishing, review tests added for the investigation for inclusion in the long-term, committed suite. Apply the relaxed bar to useful isolated unit tests and the higher bar to heavyweight tests; remove tests that only served the investigation.

## Local change and release gates

Use native PostgreSQL and the dedicated `TEST_DATABASE_URL` ending in `_test`; never production data. See [Contributing](../CONTRIBUTING.md) for setup. Browser commands load `.env.development.local`, validate configuration, seed the test database, and start an isolated Portless server. Install Chromium once with `pnpm exec playwright install chromium`. Test inference is synthetic; these commands do not call paid providers. Normal development still uses live Jev.

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
| Release | All above database commands, full `pnpm check:browser`, `pnpm check:persistence`, `pnpm check:analytics`, `pnpm db:test:restart`, and `pnpm build:local` |

Run suites sequentially: browser suites share the test database, and build/typegen can conflict over generated Next types. Do not add retries to hide deterministic failures. Preserve traces for failed browser scenarios and record unresolved failures explicitly. Paid Jev/OpenAI evaluations require their own agreed scope and budget; they are not routine test or release requirements.

Record validation in the PR or checkpoint log with the commit SHA (and whether the tree was dirty), commands, results/counts, elapsed time, and any blocked or omitted relevant checks. A passing core CI job alone does not establish release readiness.

## September 24 audit

Baseline: `a512ced`. [CI run 35912500069](https://github.com/transitive-bullshit/doom-or-bloom/actions/runs/35912500069) took about 8m51s: core `pnpm test` 31s, build 44s, browser suite 6m37s (58 passed, four failed), plus PostgreSQL and browser setup. Later suites were skipped after the failure. Removing their scheduling does not mean those failures were fixed.

The audit covers all 55 `lib/**/*.test.ts` files, the browser/persistence/analytics suites, seven database test scripts, content validation, and production trace checks. No unit-test quota: the 270 existing Vitest cases passed locally before edits. Test-body timings below exclude imports/transform/setup and overlap across workers; use complete command time when budgeting CI.

| Suite / dependencies | Decision and coverage |
| --- | --- |
| `lib/assessment/*`, `lib/assessments/client`, `lib/persistence/storage` | Keep fast behavior tests: routing, readiness, projection math, recovery, revisions, storage failures and safe client errors. Versioned-content coverage remains in content/storage tests plus one representative browser version. |
| `lib/server/*` | Keep engine, request-origin, environment, retry, provider, evidence and safe-error tests. Provider calls are mocked; no HTTP server or paid inference is launched. |
| `lib/analytics`, `lib/evaluation`, `lib/authoring`, `lib/landing` | Keep allowlisted payloads, cost bounds, input validation and collision geometry; cheap meaningful edge cases. |
| `lib/content/*`, `test:content` | Keep schema, relationships, provenance and release-review gates. Remove exact corpus sizes and the current count of unreviewed originals; retain release-specific source membership and actual validation failures. |
| `lib/debug/*` | Keep pure diagnostic/access tests. `styles.test.ts` uses the real native Next CSS compiler to catch a prior compiler panic, not exact CSS declarations; retain this inexpensive integration. |
| `lib/journeys/*` | Keep fixture-driven engine regressions, source/identity contracts and temporary-file store/experiment integration. Slowest measured test file: store 2.67s; mechanical runner 1.75s. No live generation. |
| `lib/sharing/*` | Keep reports, URLs, cached previews and native image integrations. PNG export, social cards and public/download parity each took 0.25–0.41s; resource preview decoding 0.93s. These are integrations despite running under `test:unit`; their low cost and export/security coverage justify core inclusion. |
| Browser `typography` | Remove the font-size/weight/column-width matrix and investigation screenshots. Review typography visually for relevant changes. |
| Browser `assessment-history` | Remove redundant scenario. `tests/persistence/lazy-drafts.spec.ts` retains actual Back/Forward, draft recovery, first-write and ownership checks; participant tests cover homepage entry. |
| Browser `bookmarks`, `landing` | Remove duplicate assessment bookmark rendering/subprocess setup, exact 720px layout assertions, and repeated new-persona catalog page loops. Keep actual overflow/fade behavior, representative persona rendering, source links, exports, anchor navigation, mobile layout and hover regressions. Catalog/identity/source validation remains in cheap tests. |
| Browser `header-account`, `paperclips` | Replace header page × viewport matrix with representative desktop/mobile cases; remove exact CTA height, sprite counts and investigation screenshots. Keep keyboard/logout failures, automatic dismissal, Escape and reduced-motion behavior. |
| Browser `assessment`, `conversation` | Use one earlier-content version for the browser journey; keep all versions in cheap storage/content coverage. Hide the unanswered replaced question per current UX; preserve draft/recovery checks. Retain long input, two-tab conflicts, uncertain responses, report download and question-cap behavior. |
| Browser `content-review`, `debug`, `journeys`, `diagnostic-report` | Retain local inspector interactions, no-inference guards, storage failure and diagnostic/report coverage. Hydration errors remain failures, not suppressed warnings. |
| Browser `breadcrumbs`, `not-found`, `shortcuts`, `interaction` | Retain real navigation, accessible errors, native keyboard/composition and responsive interactions. |
| Browser `map`, `persona-assessment`, `early-result`, `tweet-sources` | Retain unplaced-result rendering, transcript disclosure, readiness and external embed fallback. These need a browser; run locally for relevant changes. |
| `tests/persistence/*` | Keep participant, library, lazy-draft, persona and auth scenarios locally. Real cookies, database ownership, publication/revocation and exports are critical boundaries. |
| `tests/analytics/privacy.spec.ts` | Keep real SDK payload/initialization privacy checks locally. Unit payload tests cannot prove what the SDK transmits. |
| Seven `scripts/test-*.ts` database checks | Keep native DB/schema, repository, commit, lifecycle, persona and auth checks; restart additionally launches/kills a server and Chromium. All local gates, none in routine GitHub Actions. |
| Build and `scripts/check-production-traces.mjs` | Keep local change/release packaging gate. Core typegen is not a substitute for a production build. |

Other manual tools (`scripts/audit-seo.ts`, mechanical journey generation, and paid semantic evaluation) remain focused audit tools, not additions to default CI.

Validation on `a512ced` plus this testing-policy diff (September 24): `pnpm test` passed, including 55 Vitest files / 270 cases (Vitest command 5.13s locally). After removing corpus-count assertions, `pnpm exec vitest run lib/content/loader.test.ts lib/content/release.test.ts` passed all five cases. `pnpm check:browser` passed all 55 retained scenarios in 2.0 minutes locally. The prior content-inspector hydration error did not reproduce; its page-error assertion remains enabled. These local timings are not a prediction of hosted-runner performance. No database implementation, deployment, or production data was changed.

`pnpm check:persistence tests/persistence/lazy-drafts.spec.ts` also passed (one case, 7.9s), verifying the retained history/ownership regression before removing its duplicate. Full database, analytics, restart, and production-build gates were not rerun for this test-policy-only change; they remain required for relevant changes and releases.
