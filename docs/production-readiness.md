# Persistence and account production readiness

Prepared September 24, 2026; updated after PR #2 merged and the hosted smoke pass. The preparation evidence below is historical; post-merge verification is recorded at the end.

## Production configuration

- Vercel project: `saasify/doom-or-bloom` (`prj_X1uPkNyyap8QfXeEaPsQIgRdqpAQ`). Production tracks `main`; PR #2 is merged and serving production.
- Canonical origin: `https://www.doom-or-bloom.com`. The bare domain redirects here. `BETTER_AUTH_URL` uses the canonical origin; the production X callback is `https://www.doom-or-bloom.com/api/auth/callback/twitter`.
- Production-only variables installed: pooled `DATABASE_URL`, independently generated `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `X_CLIENT_ID`, and `X_CLIENT_SECRET`. Credentials are sensitive Vercel variables. The auth secret and origin are also recorded in ignored `.env.production.local`, mode 0600.
- Existing Jev/model/provider and analytics variables were retained. Vercel masks their sensitive values, so presence was checked; their runtime behavior must be checked on the new deployment.
- Direct `DATABASE_MIGRATION_URL` stays in the ignored production env file for controlled migrations, rather than in the application runtime.
- Vercel already uses Node 24, Next.js, Fluid Compute, and region `iad1`. The assessment POST route declares `maxDuration = 150`, accommodating the bounded 120-second operation deadline.
- Preview environments were not connected to the production database. A functional preview needs its own database/auth configuration.

## Database preparation

The supplied Neon production database (`jolly-dew-73357244`, production branch, `neondb`) was inspected and empty before applying the six checked-in Drizzle migrations, 0000–0005. Verified through the pooled runtime connection: six migrations, 44 personas with valid selected public result snapshots, zero participant assessments, and zero OAuth accounts. Curated persona imports use the checked-in historical journey data and incur no inference calls. No local participant assessments or accounts are copied into production.

## Functional evidence

Fresh checks for this preparation:

- Repository: owner isolation, first-run races, durable request replay, competing submissions, failed operations, explicit retry, late writes, and deletion during inference.
- Commit recovery: rollback and lost acknowledgment without duplicate evaluation or snapshots.
- Lifecycle: 12/24/30-question budgets, published-owner forks, independent history after deletion, publication/revocation, frozen attribution, public serializer.
- Provider-mocked real Better Auth callback: anonymous claim, sign-out, and account recovery across browsers.
- All seven persistence browser cases, including lazy drafts, ownership checks, publication/forks/revocation, and database personas.
- Production-mode build against native local Postgres, including bundled portrait/tracing checks.

Real development X authorization, anonymous assessment claim, sign-out, and subsequent login recovery were previously verified. Automated provider mocking does not verify the production X callback.

## Remaining after deployment

- [x] Verify startup configuration, database connectivity and curated persona pages on the canonical HTTPS domain.
- [x] Complete one live Jev assessment: first answer persists, refresh restores it, results generate, and status becomes ready to publish.
- [x] Sign in through the production X application with an existing anonymous assessment; verify same-URL ownership transfer, avatar menu, logout, and recovery from another browser.
- [x] Publish, open without a session, inspect captured identity/date and comparisons, then fork and make private. Check anonymous denial after revocation for HTML, JSON and WebP.
- [ ] Delete a hosted test assessment. Deferred at the account holder's request to retain all three QA assessments for inspection; local deletion regressions passed.
- [x] Check effective production private-page no-store/noindex headers, public-page indexable metadata, and seven-day public image cache headers. Reload during a live submission and verify recovery without duplicate answers.
- [ ] Exercise the hosted function's deadline boundary. Successful live requests and disconnect recovery are verified; the full 120-second operation / 150-second function limits were not deliberately exhausted.
- [x] Verify an external preview fetcher can fetch the generated WebP preview. OpenGraph.xyz passed; actual X/Meta crawler cache behavior is not claimed. Previously cached third-party previews cannot be revoked.
- [x] Inspect production logs for unexpected configuration/provider/database errors after this smoke pass.

Production X consent was authorized by the account holder during the hosted smoke pass. No additional third-party account provisioning was needed.

## Post-merge verification — September 24, 2026

Baseline: clean merge commit `8d1490d` (PR #2). The merged application is serving production; the preparation-only status above is historical.

### Local workspace acceptance

- Copied development and production env files are mode 0600. Development uses native local `doom_bloom_dev` and dedicated `doom_bloom_test`; no production database is used by local gates.
- An inherited `X_CLIENT_ID` differs from the development file. Launch commands with `env -u X_CLIENT_ID` so the file's development credential wins. Replaced the old PR-workspace Portless process with this checkout at `http://doom-or-bloom.localhost:1355`.
- Locked dependency installation, development/test migrations, 44-persona seed, and environment preflight passed.
- `pnpm test`: 55 Vitest files / 270 tests plus format, lint, types, content and unused-code checks passed.
- `pnpm db:test`, `db:test:repository`, `db:test:commit`, `db:test:lifecycle`, `db:test:personas`, and `db:test:auth` passed.
- `pnpm check:persistence`: eight cases passed (47.5s). `pnpm check:browser`: 55 cases passed (2.4m). `pnpm check:analytics`: three cases passed (21.4s).
- `pnpm db:test:restart` passed with repeat migrations/seed, a killed real POST, restart and one explicit retry. `pnpm build:local` passed, including production trace/portrait checks.
- A synthetic live Jev assessment saved its first answer, generated results, restored them after refresh at the same URL, and published anonymously. This confirms runtime provider access in this workspace, separately from fixture-based gates.

### Production X callback correction

Reproduced “Something went wrong / You weren’t able to give access to the App” on X before the callback. The deployed client ID matched production app `33462739`, and its request used `https://www.doom-or-bloom.com/api/auth/callback/twitter`. X's saved callback allowed only `https://doom-or-bloom.com/api/auth/callback/twitter`.

Updated the production X app's callback to the exact canonical `www` URL. The account holder also confirmed the website URL is `https://www.doom-or-bloom.com`. A fresh sign-in reached the expected consent screen with `users.read tweet.read`; the account holder authorized it, and production returned to the signed-in library with the account menu and Travis Fischer profile. No credentials, scopes, application code, or deployment changed. Corrected the stale callback example in `CONTRIBUTING.md`; historical app-setup entries retain the original configuration for provenance.

### Hosted smoke evidence

- Canonical `/`, `/about`, `/privacy`, `/users/tszzl`, `/assessments`, `/sitemap.xml`, `/robots.txt`, and `/llms.txt` returned 200. The bare domain returned 308 to `www`. Development-only `/questions`, `/corpus`, and `/user-journeys` returned 404.
- Signed-in QA assessment `69551940-a65f-48f7-a3d4-55aff60fa5b0`: live answer/results, same-URL refresh recovery, explicit publication, captured profile/date, and three persona comparisons passed. Fork `e4be9b9c-31f1-4f34-b1a6-a2da8941ed9b` preserved its inherited answer at a new private URL with a next question. Original publication was revoked; fresh anonymous HTML, JSON, and WebP requests returned 404.
- Anonymous QA assessment `1e29beaa-3e30-4d4c-a761-468090f48e9e`: reloaded while the live POST was processing; the page recovered results, and public JSON confirmed exactly one answer at revision 1. Anonymous publication omitted publisher identity. Returning X login recovered the earlier account assessments and claimed this assessment at the same URL. Its public serializer retained `publisher: null` after claim. Revoked this publication after verification.
- Logout returned the in-app browser to an empty anonymous library. Returning X login restored account access. Separate Chrome was already signed in and could open the claimed assessment at its original URL with the saved answer and owner publication control; no claim is made that Chrome started with fresh cookies.
- Unauthenticated private API read returned 401. Private HTML had `noindex, nofollow` and `private, no-cache, no-store, max-age=0, must-revalidate`; published HTML had `index, follow`. Public JSON was no-store/noindex. Public WebP returned 200 with `public, max-age=604800, must-revalidate`, including a Twitterbot user-agent probe. Previously cached previews can remain after revocation.
- Vercel's last-30-minute error-level log filter showed PostgreSQL connection-string SSL-mode deprecation warnings on successful requests, with no other messages in the inspected entries. These warn that a future pg major changes `sslmode=require` semantics; the current version treats it as certificate-verifying `verify-full`. Explicit `verify-full` is a configuration follow-up, not an observed connection failure.
- OpenGraph.xyz independently fetched the published fork and reported zero metadata errors, a successfully loaded 37 KB WebP at 1200×630, and a valid `summary_large_image` X card. Its only warning suggested marketing CTA text in the image, not a fetch/render failure. This verifies an external fetcher, not every social platform's cache.
- The account holder requested keeping all three synthetic production assessments for inspection. The original and claimed anonymous assessment are private; the fork remains published. Hosted deletion was therefore intentionally not executed.

## Simulated-user import — September 25, 2026 (PR #4)

- [x] Confirm no schema changes: production already has all six migrations, 0000–0005. This PR requires a persona data import, not another SQL migration.
- [x] Import the locally selected, already evaluated simulations into production: 97 new personas and seven newer results for existing personas. Production now has 141 selected public simulations, with the original 44 featured and 97 unfeatured.
- [x] Verify every imported payload, profile metadata record and source brief against the local export using PostgreSQL JSONB checksums. Verify that all prior simulation snapshots and all 12 participant assessments, participant snapshots, account/auth tables and operations remain unchanged. Production homepage returned 200 during the import.
- [x] Retain private local backup and verification artifacts under ignored `work/hosted-persona-sync/`. No participant content or account credentials were exported. The import made no inference calls.
- [x] Import and verify the same 141 personas in the separate Neon preview project, `doom-or-bloom-preview` (`jolly-frog-41412992`, branch `main`, database `doom_bloom_preview`): 97 additions, seven updated simulations and 44 featured. All six migrations were already applied. Every payload, metadata record and source brief matched the local export; previous simulation snapshots and account/operation tables were unchanged, with zero participant assessments. The user-approved temporary database credential and transfer key were deleted after verification.

Production and preview data preparation are complete before merge. The new directory, portrait assets and presentation changes still require deploying this PR. Generated simulations are intentionally ignored by Git: merging or deploying alone does not seed them into another database. Do not copy the local participant database; import only curated persona profiles and their selected simulation results through the persona repository, preserving published historical snapshots and generation ordering.

## Joscha Bach and Vittorio import — September 26, 2026

- [x] Import only the two locally validated `simulation_v1` payloads through the persona repository, without inference or schema changes. Production now has 143 selected profiles, retaining 44 featured users. Both additions are unfeatured.
- [x] Verify metadata, source briefs and complete selected payload fingerprints against the local exports; repeat publication with the same keys to verify idempotency.
- [x] Confirm checksums of all 141 prior profile rows, 163 prior assessment rows and 199 prior immutable snapshot rows are unchanged. No participant or authentication data was imported.

Selected production assessments: Joscha Bach (`plinz`) `2858e363-047e-42cc-af79-935549b82704`; Vittorio (`iterintellectus`) `60be698f-765b-4b32-ba45-21dbb79f3cac`. Private verification artifacts remain under ignored `work/research/bach-vittorio/`. The Git deployment supplies portraits/source artwork and rebuilds the directory after this data import. Preview database was outside this requested production import.
