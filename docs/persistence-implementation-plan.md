# Persistent assessments implementation plan

Prepared 2026-09-23. All local implementation checkpoints are complete, including integrated acceptance and real X login/recovery verification. Evidence and separate deployment limits are recorded below. The latest user decisions are **no Docker and no asynchronous workflows**: bounded assessment operations run in the main POST request. This plan covers local development, with hosted-service setup recorded for later; it does not authorize deployment.

Read [PERSISTENCE.md](PERSISTENCE.md) for the accepted UX, relational model, ownership, snapshots, synchronous operations, and publication contracts. Use this file for ordered tasks, checks, commits, and blockers. It supersedes the database/account/public-URL exclusions and browser-authoritative architecture of [the original MVP plan](mvp-implementation-plan.md), whose completed checkpoints remain historical evidence.

## Execution rules

1. Execute checkpoints in order. Mark a task `[x]` only when its outcome exists and its relevant checks pass. Add validation evidence and remaining blockers to the checkpoint log in the same commit.
2. Commit coherent, passing units at the named boundaries; large checkpoints may use the suggested subcommits. Inspect the staged diff and stage explicit paths. Keep unrelated user changes intact.
3. Update affected canonical docs, visible copy, and contributor instructions alongside the feature that changes their truth. The approved target and currently shipped behavior must remain distinguishable during the transition.
4. Proceed autonomously through routine implementation, local database setup, migration generation/application to dedicated development/test databases, debugging, fixture checks, and commits. Do not wait for approval at each checkpoint. Optional review moments below are opportunities for feedback, not gates.
5. Ask for help only when an external account/credential or explicit business decision genuinely blocks progress. Continue independent work. Scope changes, destructive changes to an unrelated/existing database, deployment, and unbudgeted paid inference are not implied by this plan.
6. Follow repository conventions: pnpm, modern TypeScript, no semicolons, oxfmt, oxlint, and shadcn/ui primitives. Before application code changes, install the locked dependencies and read relevant guides in `node_modules/next/dist/docs/`. This worktree had no `node_modules` when the plan was written.
7. No Docker, Compose, or Testcontainers, including development and this project's integration tests. Use native Postgres.app, or a native PostgreSQL installation if Postgres.app becomes unavailable. Test databases are disposable and distinct from development data.

## Delivery sequence

| Checkpoint | Outcome | Dependency |
| --- | --- | --- |
| 0 | Recorded design, execution plan, and documentation pointers | Complete in this documentation change |
| 1 | Native Postgres, schema, and anonymous auth | Local tooling only |
| 2 | Synchronous operations, atomic state commits, idempotency and explicit retry | Checkpoint 1 |
| 3 | One-click first run, assessment library, completion, forks, public pages and WebP previews | Checkpoint 2 |
| 4 | Database-backed personas and immutable regeneration | Checkpoints 1–3 |
| 5 | Integrated persistence milestone verified and documented | Checkpoints 1–4 |
| 6 | Optional X login and anonymous assessment transfer | Checkpoint 5; X application setup for live verification |

Checkpoints 1–5 are the persistence spike/milestone. Checkpoint 6 is the separate account spike. The first end-to-end assessment should work by checkpoint 2; avoid holding all integration until the end.

## Checkpoint 0 — agreed design and handoff

- [x] Record the core tables, immutable snapshots, anonymous ownership, first-run shortcut, fork budget, public resource, persona selection, and indefinite retention.
- [x] Select native Postgres.app and synchronous POST execution, retaining submitted input/failure status without introducing an asynchronous runtime.
- [x] Record the task sequence, doc updates, meaningful tests, commit boundaries, optional review moments, and third-party setup needs.
- [x] Link this plan from the handoff and agent instructions and mark old persistence scope as superseded.

Commit: `docs: plan durable assessments and optional accounts`.

## Checkpoint 1 — local storage and ownership

### Native PostgreSQL and schema

- [x] Inspect the running Postgres.app server/version and connectivity without changing existing databases. Create dedicated development and integration-test databases/roles with project-specific names. Document exact creation commands and connection strings using placeholders; never print credentials.
- [x] Add compatible pinned `drizzle-orm`, `drizzle-kit`, `pg`, `better-auth`, and required types/adapters. Use one PostgreSQL path locally and with Neon; avoid introducing a separate SQLite implementation.
- [x] Implement server-only database configuration, connection pooling, env validation, and checked-in schema/migrations for Better Auth and the application tables in PERSISTENCE.
- [x] Add documented pnpm commands for migration generation/application, curated persona seeding, and DB integration tests. Prefer migrations over untracked schema push. Apply to a fresh test database twice and show the second migration pass is a no-op.
- [x] Verify ownership FKs, snapshot membership/uniqueness, one active operation per assessment, idempotency keys/fingerprints, fork deletion semantics, and persona pointer constraints against real Postgres.
- [x] Extend `.env.example` with `DATABASE_URL`, optional direct migration URL, `TEST_DATABASE_URL`, and auth secret/base URL. Reuse the actual Portless origin. Add a native database setup section in CONTRIBUTING; keep secrets out of git.

### Anonymous sessions

- [x] Generate and integrate the pinned Better Auth anonymous schema and routes. Establish identity only on participant start, not public page views. Configure renewable cookie lifetime and document the observed expiry behavior.
- [x] Add one ownership boundary used by all private reads/mutations. Test separate browser owners, absent/expired cookies, forged IDs, cross-origin writes, and no auth material in serialized assessment state.
- [x] Disable unsafe anonymous-user cleanup until assessment transfer is implemented. Owner deletion must not accidentally cascade away indefinitely retained assessments.

Done when: a fresh native test setup migrates, schema constraints pass, and anonymous owners are isolated. Keep `pnpm dev` as the existing single Portless Next command; no worker or additional runtime is required.

Suggested commit: `feat: add postgres schema and anonymous ownership`.

Update: CONTRIBUTING, `.env.example`, PERSISTENCE schema details, TYPESAFE ownership boundary, and this checkpoint log. Optional review: schema/constraint diff; continue when checks pass.

## Checkpoint 2 — synchronous authoritative assessment operations

- [x] Extract a small server assessment repository/service around creation, authorized loading, operation submission, completion/publication, and deletion. Keep semantic evaluation in the existing engine.
- [x] Replace the full client-supplied state request with ID, expected revision, request key, and typed action. Load authoritative state server-side. Persist rejected interactions rather than relying on the old transport's removal of `interactionHistory`.
- [x] Save submitted input and `running` status/deadline in a short transaction before inference. Continue executing inside the same POST handler and return the final result/error; do not hand off to a background task. Retain the local draft if acceptance is uncertain or the database is unavailable.
- [x] Implement request-key/fingerprint idempotency. An identical replay returns the committed result/failure, or an explicit in-progress response without reevaluating. A changed payload under the same key is a conflict. Serialize concurrent mutations to the same assessment with a short database lock and one-running-operation constraint.
- [x] Evaluate the complete operation in memory outside a database transaction. Log a transient Jev failure and retry that call at most once; if it fails again, fail the whole operation. Permanent errors fail immediately. Audit lower-level SDK/engine retry and overflow-splitting behavior to enforce this limit rather than multiplying retry layers.
- [x] Keep the current aggregate 32-physical-request cap and bounded operation deadline. Use mocked maximum-history cases to verify batching, cancellation and runtime bounds. Intermediate results must never mutate the committed assessment snapshot.
- [x] Commit the new immutable snapshot, head revision, and operation success together. Check the exact operation's running status/deadline, base revision, and assessment existence/lifecycle at commit. If evaluation or commit fails, preserve the old snapshot and store failure information when the database permits it. Resolve an uncertain commit by reading the saved operation before retrying inference.
- [x] Support request-driven interruption handling: reads derive an expired running request as interrupted, and the next authorized mutation records that status before accepting replacement work. No startup recovery loop, scheduler, queue, worker, or automatic rerun. A late timed-out handler cannot commit.
- [x] Restore submitted text/status on refresh and distinguish success with a lost response from still-running, failed, and interrupted operations. Poll only to resolve an existing uncertain/in-flight request. Explicit Retry uses a new request key linked to the failed attempt after checking ownership and unchanged base revision; keep original-key retries for uncertain network outcomes.
- [x] Preserve local unsubmitted drafts per assessment. Remove the old single-assessment authority and migration path for participant browser state; no compatibility with previous completed browser assessments is required.
- [x] Verify finish/share/fork cannot race a live operation, and deletion makes a returning handler unable to recreate records. Client cancellation must not cause a false claim that the database rolled back a possibly completed commit.

Required DB/fixture checks: repeated POST with the same key; same key/different payload; two competing tabs; one transient provider failure then success; second failure leaving all assessment state unchanged; later-stage failure after an earlier successful call; process death before commit; success before response loss; uncertain commit acknowledgment; explicit retry after interruption; stale timed-out response; deletion during inference; rejected reply with no scoring effect. Run real Postgres with mocked evaluator calls, not only repository mocks.

Done when: the POST handler returns the complete successful operation or a failure without partial assessment changes. A crash preserves submitted input for an explicit retry after restart, and duplicate requests cannot append duplicate answers. No live API key is needed to verify this.

Suggested commits: `feat: persist synchronous assessment operations and snapshots`; `refactor: make server assessments authoritative`.

Update: TYPESAFE, MEASUREMENT, local-debugging, CONTRIBUTING, API/transport documentation, and this log. Optional review: demonstrate failure leaving the prior result intact and an explicit retry succeeding; continue without awaiting approval.

## Checkpoint 3 — participant UX, forks, and sharing

- [x] Implement the main CTA routing table in PERSISTENCE: zero assessments goes directly through creation to `/assessments/<id>`; any existing assessments goes to `/assessments`. Establish session and record without a second click. Serialize simultaneous empty-library starts; reuse request keys on retry. No GET/prefetch creates records.
- [x] Add the owner library with resume/view, New assessment, delete, and public/private management. Use existing UI primitives. Creation preserves prior work; deletion is explicit. Keep `/assessment` links usable as an entry surface.
- [x] Add owner detail loading and modest pending/error states. Existing submitted text is read-only; preserve keyboard focus, draft recovery, and the current single-page conversation layout.
- [x] Keep result preview open; Done completes privately; Share completes and publishes. Explain whole-conversation publication in the sharing action. Avoid a lifecycle wizard or mandatory title/account prompt. Serialize finish/share with in-flight processing.
- [x] Implement owner-only final-snapshot forks for completed participant assessments. Copy state independently, preserve versions/provenance, reset transient state, and create new private identity/URL. Continue or targeted clarification happens in the new assessment. No historical editing, public remixes, or earlier branching.
- [x] Implement 12 initial prompts, up to 12 new prompts per fork, and 30 total including inherited questions. Update schema limits, routing, readiness/cap UI, clone logic, inference-size checks, and fixtures together. Verify 12 → 24 → 30, forks from earlier completion, warnings, skipped/clarification prompts, and no unusable fork at 30.
- [x] Implement server-rendered public assessment pages and explicit public serialization. Render the complete frozen conversation and inferred state. Mark participant pages noindex and exclude them from sitemap/directory; keep public reads session-free.
- [x] Extend the existing Takumi social renderer for participant results. Serve 1200 × 630 WebP at a public visibility-checked route, with absolute Open Graph/X metadata URLs, MIME type, dimensions, and useful alt text. Preserve existing PNG downloads and persona simulation labeling.
- [x] Check visibility on public HTML, metadata, exports, and social-image requests. Initially avoid shared caches for revocable participant content. Private/deleted IDs return no assessment content or personalized image, including on a previously used image URL.
- [x] Make fork/source deletion independent. Preserve fork markers for analysis even if a parent was deleted. Keep private drafts and operational traces outside public payloads.
- [x] Update privacy/About/interview/README copy before this checkpoint is considered complete: server storage, indefinite retention, operator access, full public transcript, optional future recovery, and external preview-cache limits. Keep raw text and new private URLs out of analytics payloads.

Browser checks: fresh context gets first prompt after one CTA; zero double-created records on retry; one/multiple existing drafts and completed-only history go to library; old links work; refresh while processing; two isolated owners; completion/fork/publication/private/delete; public HTML contains the intended full assessment only. Render and inspect WebP cards for long titles, unplaced results, normal participant results, and personas. Verify file signature/dimensions/metadata and private-image denial.

Done when: the fresh-user path is as short as before and the complete ownership/share/fork flow is usable without accounts. Public reads never run inference.

Suggested commits: `feat: add assessment library and first-run shortcut`; `feat: freeze and fork completed assessments`; `feat: publish assessments with webp social previews`.

Update: PRODUCT, ASSESSMENT, CONTEXT, MEASUREMENT, README, app copy, sharing/export docs, and this log. Optional review: a short browser walkthrough at this point; do not block subsequent work awaiting it.

## Checkpoint 4 — dynamic curated personas

- [x] Create the noninteractive simulation owner and idempotent persona seed. Derive the public allowlist from the current curated catalog; do not publish all development journeys simply because they share a bundle.
- [x] Import existing recorded public journeys under a historical payload format. Preserve exact questions/answers, step results/projection inputs, source snapshots, provenance, original dates, and sourced P(doom) overrides. Do not fabricate a resumable Assessment or rerun paid inference.
- [x] Make seed reruns harmless: stable seed keys, input-digest checks, mutable profile/source upserts, and insert-only snapshots. A seed rerun must not revert a newer selected live run.
- [x] Update generation to persist full engine snapshots while available, create a new assessment per run, and publish/select only after successful validation. Failures retain diagnostic state and the last successful public selection. Fence late completion of an older run from overwriting a newer selection.
- [x] Load homepage, `/users/<slug>`, persona social images, and nearest-persona comparisons from the selected database runs. Preserve source-change disclosures, third-person framing, exact excerpts, and simulated-person labeling.
- [x] Replace build-time static/persona assumptions with database-compatible runtime reads where needed. Keep repository-authored briefs/config as generation inputs. Eliminate duplicated runtime sources of truth without deleting historical evaluation evidence.
- [x] Test repeated seed, unlisted development journey exclusion, failed generation, retry of the same run, out-of-order generation completion, new selection with old public URL stability, and complete source/override preservation using fixtures.

Done when: the seeded map and persona pages match existing visible data, public profiles come from Postgres, and fixture regeneration advances their shared selected pointer without modifying historical results.

Suggested commits: `feat: seed public personas and recorded assessments`; `refactor: serve persona results from postgres`; `feat: persist immutable persona generation runs`.

Update: AUTHORING, user-journeys, PRODUCT, ASSESSMENT comparison behavior, README, PERSISTENCE, and this log. No new paid generation is necessary to pass this checkpoint.

## Checkpoint 5 — integrated persistence acceptance

- [x] Run relevant formatting/lint/type/unit/content checks and the new real-Postgres integration suite. Run `pnpm test` and `pnpm build:local` once integration is ready (the production build with local settings); use the existing required project checks and adjust CI for native PostgreSQL without containers.
- [x] Run the focused browser suite through `pnpm dev` and its resolved Portless URL. Verify production build/start with database reads and bounded POST handlers; development success alone is insufficient.
- [x] Recreate disposable application test databases from documented steps and migrations. Seed twice, interrupt a POST, restart, and verify saved input plus an explicit retry. Never reset the developer's persistent database as a test fixture.
- [x] Audit authorization, all public surfaces, raw-text analytics exclusion, HTTP cache behavior, operation diagnostic payloads, and destructive-action races. Add tests only where they verify actual failure or access boundaries.
- [x] Reconcile canonical docs and visible copy: remove implemented transition banners, preserve historical checkpoint notes, replace obsolete one-browser/stateless/no-database claims, and document real commands and env values. Keep X login marked pending until checkpoint 6.
- [x] Record actual validation commands/results, known limits, native setup and interrupted-request retry procedure, and external setup still outstanding. Keep unmet acceptance checks unchecked rather than labeling the spike complete.

Done when: the persistence milestone meets the approved behavior with atomic request-driven operations, no asynchronous runtime, no Docker, no mandatory account, and no documentation claiming behavior that has not shipped.

Commit: `test: verify persistent assessment lifecycle and recovery` (or smaller coherent integration commits).

## Checkpoint 6 — X login and recovery across browsers

- [x] Configure Better Auth's X provider behind server-only credentials and a clear optional sign-in entry. Starting, completing, and sharing assessments remain available anonymously.
- [x] Register callback URLs for the actual local Portless origin and later hosted environments. Verify X's current callback restrictions and granted scopes; use an approved reachable dev origin only if necessary. Avoid requesting posting/follower permissions for authentication.
- [x] Implement retry-safe ownership transfer from the current anonymous identity to a new or existing authenticated user. Preserve assessment IDs, visibility, snapshots, and provenance. Keep the anonymous identity/data intact if transfer fails, then retire/revoke anonymous sessions after success.
- [x] Exercise actual library callback timing/failure behavior with the pinned version. Verify account linking against provider ID/account ID rather than assuming email availability or matching identities by display name.
- [x] Test interrupted/repeated callbacks, login to an existing account that already owns assessments, sign-out, expired sessions, failed transfer, cross-browser recovery, and concurrent processing during transfer. Login must not expose account identity on previously anonymous public assessments.
- [x] Run provider-mocked integration/browser checks without credentials. When the user has configured X, perform one local login smoke check and record the result. Keep that check explicitly pending if setup is unavailable.
- [x] Update auth/privacy/recovery copy, MEASUREMENT, PRODUCT, CONTEXT, CONTRIBUTING, env documentation, and this log. Run the relevant integration/build checks before committing completion.

Done when: an anonymous participant can claim their assessments with X and recover them in another browser without losing data or changing public URLs. No additional provider, admin dashboard, or account-profile product is included.

Suggested commits: `feat: add optional x authentication`; `feat: claim anonymous assessments on sign-in`.

## External setup and dependencies

| Dependency | When needed | Agent work | User help potentially needed |
| --- | --- | --- | --- |
| Native Postgres.app | Checkpoint 1 | Verify the installed server, create dedicated local databases, apply migrations, document connection variables. | Start/authorize the application only if local permissions prevent setup. No Docker and no hosted account required. |
| Better Auth | Checkpoint 1 | Integrate the library and generate a local secret; configure local origin/cookies. | None for anonymous auth; no separate Better Auth SaaS account. |
| TypeSafe | Existing runtime | Reuse existing server configuration; use fixture inference for checks. | Existing API key only if a live participant smoke test is desired. |
| Neon | Prepared; application deployment pending | Production project `jolly-dew-73357244`, branch `production`, database `neondb`. Pooled runtime and direct migration credentials are saved in ignored `.env.production.local` as `DATABASE_URL` and `DATABASE_MIGRATION_URL` and verified read-only. Use explicitly only for authorized production work. | No further credential setup needed in this worktree. Production variables, migrations and 44 persona imports are complete; see production-readiness.md. Local development continues against Postgres.app. |
| X developer application | Provisioned and locally verified | Development app `33462727` and production app `33462739` have their respective callback URLs and confidential Web App configuration. Local login, claim and recovery passed with `users.read tweet.read`. | User supplied both credential pairs and authorized the development app. Production login awaits the separately authorized deployment. |
| Takumi | Checkpoint 3 | Reuse installed local renderer. | None; no media-hosting account. |

Store supplied secrets in ignored local environment files or the authorized host's secret settings, not chat, docs, committed SQL, or tool output. OpenAI credentials remain relevant only to existing live persona generation, which this plan does not need to rerun.

## Review and stop conditions

The schema/atomic-operation demonstration after checkpoints 1–2 and first-run/share walkthrough after checkpoint 3 are useful optional review moments. Post an update with concrete evidence and continue; they are not approval gates. Technical acceptance checks are mandatory.

Pause only the dependent work when credentials or external configuration are unavailable. Ask before changing approved product semantics, launching a paid regeneration, touching unrelated database contents, or deploying.

## Checkpoint log

### 2026-09-23 — planning baseline

- Agreed: server authority, indefinite retention, whole-assessment opt-in publication, immutable completion, owner-only forks, 30 total prompt ceiling, anonymous Better Auth first, optional X later, dynamic curated personas, and normal Postgres inspection only.
- Latest additions: main CTA skips the library only for an owner with no assessments; durable submission/failure records with explicit retry; local native Postgres; dynamic Takumi WebP public previews; no Docker.
- Inspected current browser storage, stateless API, engine/result/cap behavior, persona artifacts/generation, privacy docs, and existing WebP renderer. No application changes, database creation, live inference, or deployment performed during planning.
- Native `psql` is available from Postgres.app. Local server connectivity remains to be checked in checkpoint 1. Local and hosted execution both use ordinary bounded POST handlers; no Workflow service is required.
- Validation: oxfmt passed on the 14 changed Markdown files using the original checkout’s installed formatter and identical config. `pnpm fix:format` first attempted automatic dependency installation in this dependency-free worktree; network resolution failed, so that attempt was stopped and the existing formatter was reused. Local link resolution and `git diff --check` are checked before the planning commit. No application tests are needed for this documentation-only checkpoint. Subsequent checkpoints must append their own executed commands and outcomes.

### 2026-09-23 — simplify execution to synchronous POSTs

- User removed asynchronous workflows as unnecessary for bounded assessment operations. This supersedes the Workflow selection in planning commit `a5d12a4`.
- Removed Workflow packages, extra databases, worker/runtime setup, dispatch/outbox logic, automatic crash replay, runtime attempt tables, reconciliation jobs, and hosted Workflow setup from the active plan.
- Keep a small operation record for submitted input, deadline/status, idempotency, and bounded failures. Retry each transient Jev call once; fail the full assessment operation on a second failure. Only the final assessment snapshot/head update commits atomically; input/failure records intentionally survive.
- Interrupted requests can be retried explicitly. Their expiration and late-write protection are checked during normal API access, without a scheduler. No application behavior changed in this documentation revision.
- Validation: documentation formatting, local Markdown links/anchors, removal of active Workflow requirements, and `git diff --check` verified before committing this revision.

### 2026-09-23 — production Neon credentials available

- User provisioned Neon project `jolly-dew-73357244` (`doom-or-bloom`), branch `production`, database `neondb`, role `neondb_owner`. Retrieved the pooled and direct connections from the supplied authenticated console.
- Stored `DATABASE_URL` and `DATABASE_MIGRATION_URL` in `.env.neon.local` with file mode 0600 and an explicit git-ignore rule. This file is local to this worktree and is not automatically loaded by Next.js; credentials must not be copied into local development/test configuration. Never commit its contents.
- Both connections passed a read-only query of database/user identity with `transaction_read_only=on`. No production schema changes, migrations, seeds, or deployment were performed.
- Neon credential provisioning is complete. Application integration, native local database setup, and hosted configuration remain at their existing unchecked checkpoints.

### 2026-09-23 — database and auth foundation

- Installed locked dependencies and read the installed Next.js route-handler/cookie/auth guides. Pinned Drizzle ORM 0.45.3, Kit 0.31.11, pg 8.23.0, Better Auth and its schema generator 1.7.5.
- Verified native Postgres.app 17.4 and created dedicated `doom_bloom_dev` and `doom_bloom_test` roles/databases. No existing or production databases changed. Local configuration uses the resolved Portless origin and a generated private secret.
- Generated Better Auth anonymous tables and added application tables, deferred snapshot membership pointers, insert-only snapshot enforcement, public-result/selected-persona constraints, and one-running-operation uniqueness. Added lazy pooled server access, anonymous auth handlers, and explicit origin validation for browser POSTs.
- Applied migrations to development and test; repeated test migration succeeded without new work. `pnpm db:test` passed real-Postgres checks for snapshot immutability, owner retention, head membership, public lifecycle, active-operation exclusion, cascading assessment deletion, anonymous session isolation, forged/missing/expired sessions, cookie flags, 365-day expiry, and cross-origin rejection.
- Checkpoint 1 remains open: repository-level private authorization, broader fork/persona constraints, session renewal verification, and curated seed command are still pending. Participant UI still uses the original browser state until checkpoint 2 integration.

### 2026-09-23 — durable operation repository and API

- Added a Drizzle repository with serialized first-run creation, private owner reads, immutable snapshots, synchronous accepted operations, durable request-key fingerprints, expiry/late-write protection, explicit retry, completion/publication primitives, and deletion. A returning evaluator cannot recreate a deleted assessment; a failed evaluator leaves the previous snapshot intact. Commit uncertainty rereads the operation before reporting failure.
- Added authenticated `/api/assessments`, `/api/assessments/<id>`, and operation lookup endpoints. Input is ID/revision/key/action, never replacement client state. Mutations require the configured origin; private responses use `private, no-store`. Server evaluation uses the pinned snapshot bundle/model and retains bounded call diagnostics separately from snapshot payloads.
- Audited TypeSafe SDK 0.6.0 retry behavior. Reduced SDK retries from two to one and removed recursive overflow splitting. Preplanned batching, full evidence, cancellation/deadlines, and the aggregate 32-call bound remain intact. Updated obsolete overflow documentation and fixtures.
- Validation: `pnpm db:test:repository` passed real-Postgres ownership, empty-library creation races, duplicate/conflicting keys, competing tabs, failed input retention, unchanged snapshots, explicit retry, deadline/late writes, and deletion during evaluation. All 251 unit tests across 52 files passed. `pnpm test:types` and focused oxlint passed.
- Started `pnpm dev` at the resolved Portless origin. An HTTP smoke check passed anonymous sign-in, absent-session denial, foreign-origin denial, private cache headers, a fixture answer committed to PostgreSQL, and identical replay; its assessment was deleted afterward. No paid inference or production writes.
- Checkpoint 2 remains open: the participant client still uses its old endpoint; draft recovery/polling UI and full acceptance cases (including injected uncertain commit acknowledgment) remain to be integrated. Checkpoints are not marked complete from repository checks alone.

### 2026-09-23 — participant server-state transition

- Replaced the interview's single browser-authoritative state with private `/assessment/<id>` loading and authenticated ID/revision/action submissions. Unsubmitted drafts and uncertain request keys are scoped to each assessment; rejected replies come from immutable server history. Retired `/api/assessment` returns 410 without evaluation.
- The main CTA establishes an anonymous session only on click, then skips straight to a new assessment for an empty owner. Returning owners go to `/assessments`. Web Locks serialize cross-tab anonymous starts; database locking serializes empty-owner creation. `/assessment` remains an explicit start surface without GET creation. New assessment preserves existing records.
- Added the owner library, resume/view and confirmed deletion. Added private completion, processing restoration, failed/interrupted retry, refresh, and same-key recovery after lost responses. Browser session refresh runs through the auth endpoint to renew its cookie. Full publication/fork controls remain next.
- Updated participant privacy/About/README copy to describe server retention, operator inspection and anonymous access loss. Excluded assessment routes from Vercel page analytics, including its retained client-navigation callback. PostHog remains allowlisted. Diagnostic details stay outside public state.
- Chromium checks passed first-run navigation, per-prompt draft refresh, answer persistence, returning CTA/library, session isolation, and a deliberately dropped successful response followed by reload with exactly one saved answer. Added `pnpm check:persistence` against the dedicated native test database; no Docker or paid calls. All 249 unit tests passed after replacing obsolete legacy-endpoint tests with a retirement check. Typecheck, focused lint, and real-Postgres repository regressions passed.
- Still pending: full API diagnostics/failure injection acceptance, processing crash/restart browser checks, completion/fork/publication UI, schema 30-prompt ceiling, dynamic personas, and account recovery. Existing broader browser tests still encode the previous local-only flow and must be migrated during integrated acceptance.

### 2026-09-23 — immutable forks and opt-in publication

- Added owner-only, idempotent final-snapshot forks. Each fork is private, self-contained, keeps pinned versions and inherited history, resets execution bookkeeping, and continues through an explicit POST. Parent unpublishing/deletion leaves the fork intact; nullable source pointers and persistent fork markers behave correctly in Postgres.
- Added per-assessment prompt ceilings: 12 initially, `min(inherited + 12, 30)` for forks. Engine routing, validation, schema bounds, warning/cap UI, and continuation controls use the ceiling. Prior answers remain read-only. Thirty-question conversations offer new assessments rather than unusable forks.
- Added explicit whole-assessment publication confirmation, private/public management, stable owner and public URLs, public SSR transcript/results/data, noindex metadata, and visibility-checked 1200×630 Takumi WebP previews. Public serialization allowlists snapshot fields and excludes drafts, ownership, auth and operation diagnostics. Public reads create no session and run no inference. Library supports making published records private.
- Validation: `pnpm db:test:lifecycle` passed 12→24→30 progression, owner/completion restrictions, replayed fork keys, deletion-independent lineage, publication/revocation and public field exclusions. Chromium passed publish/fork/revoke, SSR answer content, session-free public access, frozen JSON, WebP RIFF/MIME/dimensions/cache headers, image/data denial after unpublishing and surviving fork after parent deletion. Unit tests cover maximum thirty-answer multibyte batching without evidence truncation, state budgets, and long-title/unplaced images.
- Visually inspected normal and long-title/unplaced WebP previews. Fixed long-title overflow and unplaced-label contrast. Typecheck and focused lint passed. Canonical budget/lifecycle docs and public privacy copy were updated alongside the implementation.
- Remaining checkpoint work includes comprehensive failure/race/browser acceptance, rebuilding production mode, and dynamic persona migration. No production writes or paid inference.

- Header audit: Next 16 development deliberately rewrites HTML cache headers to `no-cache, must-revalidate` (`base-server.js`), while image/data handlers retain explicit no-store. Configured `private, no-store` for assessment page routes; production build/start verification must confirm the effective production header. The development browser assertion requires revalidation instead of incorrectly claiming production header proof.

### 2026-09-23 — database-backed curated simulations

- Added repeatable curated-only import under a noninteractive owner. Historical snapshots preserve all public steps, projection inputs, source snapshots and overrides with original per-run provenance. Homepage, persona profiles, comparisons, sitemap and social cards now read selected database runs; production tracing no longer bundles the historical journey JSON.
- New live generation/resume reserves private input and operation records before inference, captures the full engine result snapshot while available, then atomically publishes/selects successful runs. Failed/expired generations cannot replace the selected result. There is no background execution; an offline run has a 30-minute commit window. Explicit resume/new generation creates another assessment.
- `pnpm db:test:personas` passed native-Postgres exact import preservation, 44-person allowlist, seed replay, conflicting keys, private failed input retention, full snapshot publication, repeat completion, expiry, older completion ordering and stable old URLs. `pnpm test:types`, `pnpm test:lint`, and all 252 unit tests passed. PNG renderer tests now supply fixture persona metadata at the database-read boundary. No paid inference or production database writes.
- Chromium passed all four persistence cases, including selected persona SSR, public simulation JSON/WebP, sitemap inclusion of curated profiles only and session-free public reads. Broader integrated acceptance and production build/cache/tracing verification remain pending.

### 2026-09-23 — integrated build and tooling verification

- `pnpm test` now passes all formatting, lint, types, 252 unit tests, content validation and unused-code checks. Removed obsolete link-only CTA/auth/debug helpers and registered the new tool/test entry points. Drizzle schema inspection can run without connection credentials; actual migrations still validate their URL.
- `ASSESSMENT_PROVIDER=live pnpm build` passed, including production tracing: historical journey JSON is excluded and required portrait assets are included. The initial build correctly rejected local fixture configuration; production verification explicitly selected live-provider configuration without running inference.
- Started the built app locally. Homepage and curated profile returned 200 from native Postgres; public simulation HTML, JSON and WebP each returned 200 with `Cache-Control: private, no-store` and no session cookie. Stopped the temporary production server after verification.
- CI now installs/starts native PostgreSQL, creates a disposable test database, applies migrations twice, seeds and runs real-Postgres and Chromium persistence checks. Hosted CI execution itself is not yet verified.
- Still outstanding: remaining failure/race acceptance, disposable database recreation/restart exercise, older browser-suite migration, docs reconciliation and optional X auth. No production migrations, deployment or paid inference.

### 2026-09-23 — optional X authentication and transactional claims

- Added credential-gated X login/sign-out to the library, leaving first-run assessment creation unchanged. Restricted scopes to `users.read tweet.read`; disabled email-based account linking. Added ignored-env setup instructions and requested developer-app configuration for a real login check.
- Added atomic ownership transfer, namespaced creation keys, anonymous-session revocation and anonymous-owner retirement. Assessment IDs, snapshots and publication remain stable. A failed claim strips prepared destination cookies and redirects to a recoverable library error; the anonymous session remains valid.
- `pnpm db:test:auth` passes with real Better Auth callbacks and mocked X token/profile responses: new and existing account login, sign-out, fresh-browser recovery, injected transfer rollback, successful retry, revoked old owner access and an operation committing across login. No real X calls or credentials are used by this test.
- Consumed OAuth callback replay is rejected without duplicate ownership changes. Chromium passed the optional login entry, exact callback/read scopes and recoverable error messages; the four existing persistence cases also passed. `pnpm test` and the production build passed; final focused lint/types passed after adding the browser checks. Live login and expanded expiry/restart acceptance remain open. Canonical docs distinguish implemented provider-mocked behavior from live setup verification.

### 2026-09-23 — commit uncertainty and real process-death recovery

- Added `pnpm db:test:commit` at the real PostgreSQL driver boundary. Passed failures before COMMIT (unchanged prior snapshot), after COMMIT (saved success returned without rerunning), and after acceptance COMMIT (saved input/running status followed by explicit retry). Snapshot counts and evaluator counts prove no duplicate successful revision.
- Added `pnpm db:test:restart` with a uniquely named disposable native database. Fresh migrations applied twice without changes; curated seeds returned identical IDs twice. The actual Next POST was blocked before snapshot insertion, its observed process tree was killed, and PostgreSQL retained revision zero plus the submitted input. After restarting the app and reopening the same browser session, Chromium restored the answer and completed one explicit retry linked to the interrupted operation. The database and server were removed after the check. The deadline is advanced only for the stopped test request.
- The initial harness killed the launcher but missed a Next child; corrected it to terminate the observed descendant tree and removed the verified leftover test processes. Reopening a tab after restart avoids unrelated development HMR reload races. The final full restart check passed.
- Repository regressions also passed explicit completion/fork rejection during processing, publication exclusion and deletion during evaluation. CI now includes commit and restart checks using native PostgreSQL CREATEDB permission on its disposable runner. Hosted CI execution remains unverified.
- Checked off the corresponding schema/ownership/idempotency/recovery/UX items based on the existing tests and these additional results. Remaining acceptance includes migration of older browser tests, some auth expiry cases and final docs consistency. Live X verification still awaits external setup.

- Final checkpoint checks: `pnpm test` passed all formatting, lint, types, 252 unit tests, content validation and unused-code checks. The typed commit-fault harness passed again after lint cleanup.

### 2026-09-23 — browser regression migration, first batch

- Updated keyboard shortcuts, paperclip recovery, landing navigation/CTA behavior, bookmark layout, first-answer results and diagnostic-report browser tests to use saved assessments. New-assessment tests preserve previous work rather than expect destructive restart. Returning homepage CTAs now verify the library path before resuming the exact saved assessment.
- Added native-test-DB browser configuration and per-session record cleanup. Synthetic rendering tests read authenticated saved state, run their fixture engine, and commit through the repository; reload/report assertions therefore use persisted snapshots. Fixture engine parsing now includes complete saved interaction history.
- Fixed a reduced-motion hydration mismatch in the new CTA: tap handling stays present with neutral scale under reduced motion. Chromium verified CTA keyboard/hover behavior and no hydration errors. Updated stale layout/copy expectations against current component source (624px bookmarks and 30px persona-map headings).
- All 19 tests across these six migrated spec files passed across focused runs, including complete diagnostic ZIP export and historical result recovery. No paid calls. Remaining older assessment/conversation/debug/interaction/map fixtures still need migration; this is not a claim that the entire broad browser suite passes.

- Standard verification: formatting, lint, types, all 252 unit tests and content validation passed. The unused-code check passed after registering all browser/analytics entry points without executing environment-dependent configuration.

### 2026-09-23 — saved conversation and debug browser regressions

- Migrated conversation and debug fixtures to owned database assessments, with a native test-database-only seed helper. Conversation disclosure/copying does not submit inference; creating a new assessment preserves the previous transcript and its browser debug records.
- All four conversation/debug cases passed across focused runs. Verified reload recovery with unavailable IndexedDB, recorded exchange navigation, JSON help by key hover and keyboard focus, mobile layout and saved debug history. Updated the storage warning assertion to the current server-persistence copy.
- Formatting, TypeScript, lint, unused-code and diff checks passed. Remaining broad-browser migration and live X verification remain pending. Neon credentials remain ignored and separate from local test configuration; no production writes.

### 2026-09-23 — saved map and interaction browser regressions

- Migrated all three map fixtures to owned immutable database snapshots. Verified unplaced/partial results, result-resource rendering, PNG download/clipboard, failed social-card feedback, mobile layouts and light/dark contrast without inference requests.
- Migrated four interaction cases to real saved-assessment operations. Keyboard navigation and share-dialog focus restoration pass; reduced-motion paperclips remain keyboard accessible. A stale tab receives HTTP 409 and explicitly refreshes the authoritative recovery counters, which survive another tab reload and still exhaust the original allowance. Catastrophic-risk clarification preserves the quoted claim.
- All seven cases passed across focused runs. Fixed stale test assumptions about a removed restart dialog, current review-button copy, server-rendered CSS whitespace and the existing paperclip recovery allowance. Formatting, types and lint passed. Main assessment fixtures, remaining broad acceptance and live X setup are still outstanding.

### 2026-09-23 — main assessment browser acceptance

- Migrated the main assessment browser suite to server-owned records and immutable fixture snapshots. Verified pinned content versions, long draft recovery and the 20,000-character submission boundary, full report/image exports, clarification, bounded recovery, stale-tab HTTP 409, unavailable-response draft retention, the 12-prompt cap and first-answer result readiness.
- The lost-response test now verifies the actual idempotent protocol: Check submission repeats the original request key, returns the committed outcome and leaves exactly one evaluated attempt and answer. It does not assume a read-only request or automatic rollback.
- Found and fixed two unavailable-storage problems: the optional Agentation development widget could crash the page, and refresh could erase in-memory typing when browser draft storage was unavailable. The widget is omitted when storage cannot be read; same-prompt refresh preserves in-memory typing. Chromium verifies explicit refresh followed by successful server submission and reload while localStorage access throws.
- `pnpm check:browser assessment.spec.ts` passed all 13 matching assessment/persona-assessment cases together. Formatting, lint, TypeScript, unused-code and diff checks passed. Broader browser/analytics acceptance, final documentation audit and live X verification remain outstanding.

### 2026-09-23 — X developer apps and consolidated local environment

- Created development X app `33462727` and saved confidential Web App authentication with read-only permissions, no email request, and callback `http://doom-or-bloom.localhost:1355/api/auth/callback/twitter`. User saved the OAuth 2.0 credentials in `.env.local`; live login verification remains pending.
- Created production X app `33462739` under the same Test / Pay Per Use project with Production environment. Production confidential Web App authentication is saved with read-only permissions, no email request, and callback `https://doom-or-bloom.com/api/auth/callback/twitter`. The one-time OAuth 2.0 secret dialog is left open for the user to save; no deployment performed.
- At user request, moved Neon connections into `.env.local` as `NEON_DATABASE_URL` and `NEON_DATABASE_MIGRATION_URL`, verified the values were preserved without printing them, and removed `.env.neon.local`. Local database variables are unchanged, and the consolidated file retains mode 0600. This supersedes the earlier separate-file setup.

### 2026-09-23 — environment-specific files

- User prefers identical variable names in `.env.local` and `.env.production`, and saved production OAuth credentials accordingly. Added `.env.production` to gitignore immediately, moved the Neon values there under `DATABASE_URL` / `DATABASE_MIGRATION_URL`, and removed the reserved production-name convention. Both files have mode 0600; no secrets were printed or committed.
- Documented installed Next.js precedence: `.env.local` overrides `.env.production`; host environment variables override both. Local migration scripts still explicitly load `.env.local`. This supersedes the earlier consolidated-file and prefixed-variable decisions. No production connection or mutation was performed.

### 2026-09-23 — Next.js environment-specific local files

- Renamed private configuration to `.env.development.local` and `.env.production.local`, preserving values and mode 0600. Updated active commands, setup docs, provider guidance and CI; historical log entries describe superseded decisions.
- Added `build:local` / `start:local` to explicitly preload development settings for production-mode checks against local Postgres. CI uses `build:local`. Normal Next production commands now select the production file; no production build, database connection or migration was run for this rename.
- Verified Next's installed environment loader in separate development/production processes: development selected localhost, production selected Neon, and both had OAuth credentials. `pnpm test:types`, `pnpm test:lint`, and `pnpm db:test` passed with the renamed development file. No credential values were emitted.

### 2026-09-23 — broad browser and analytics acceptance

- Full broad browser run passed 51/52 cases; the remaining tweet-resource case still used browser-only assessment fixtures. Migrated that fixture and updated read-only inference guards to match the new endpoints; all nine resource/editorial/journey cases then passed. All 52 broad cases have passed across these runs; a final unified run remains to be recorded.
- All three analytics checks passed against a dedicated native database with the real PostHog SDK transport intercepted: raw answers, canaries and private assessment paths are absent; reload does not duplicate the start event; editorial pages send no analytics/inference; missing live provider configuration retains input without a committed semantic attempt. The known localhost feedback companion is mocked separately from third-party traffic.
- Rechecked all 15 provider-boundary cases: one transient retry, permanent overflow without recursive splitting, physical budget, cancellation/deadline, thirty multibyte answers and sanitized diagnostics. Checked off corresponding bounded-operation requirements after reviewing the shared engine budget and HTTP-failure logging.
- Standard checks passed formatting, lint, types, all 252 unit tests and content validation. The unused-code check passed after registering the analytics config entry for its explicit Node invocation. CI now includes the broad browser and analytics suites; hosted execution remains unverified.

### 2026-09-23 — unified browser and production-mode acceptance

- `pnpm check:browser` passed all 52 cases together. `pnpm build:local` passed production compilation and persona bundle/portrait tracing.
- Fixed the local Next launcher after build workers rejected Node CLI `--env-file` in inherited `NODE_OPTIONS`: load the file in a parent process and spawn Next with clean exec arguments. Both local build/start commands select live-provider configuration because fixture mode is intentionally forbidden in production.
- Started the production build locally against Postgres.app, then verified anonymous sign-in, creation, owned reads, a synchronous exact-placeholder POST with no paid inference, identical-key replay without a new revision, private/no-store HTML and API headers, and unauthenticated denial. Deleted the smoke assessment and stopped the temporary server. No Neon connection or deployment.
- Removed the obsolete AUTHORING banner claiming persona database persistence was unimplemented. Launcher formatting, lint and unused-code checks passed. Final canonical-copy/auth acceptance and actual X login remain open.

### Acceptance follow-up (2026-09-23)

- Expanded `pnpm db:test:auth` to verify abandoned provider redirects preserve anonymous ownership, expired authenticated sessions return no session, and a fresh X login recovers the existing account and both assessments. The native Postgres check passes, including the existing repeated-callback rejection, failed-transfer rollback, and concurrent-operation cases.
- Corrected MEASUREMENT and privacy copy: new assessments/forks get new event identities without erasing previous records; readiness determines result eligibility; fork budgets include the 30-question ceiling; downloadable cards and revocable public social previews are distinct. `pnpm test` passes after these changes.
- Real local X login remains **unverified**: created private smoke assessment `6fdbc1e8-0177-4c07-9eac-806ad36d6fbb`, clicked Keep access with X, and received X’s “You weren’t able to give access to the App” error before callback. The running server’s outgoing client ID matches `.env.development.local`, redirect is exactly `http://doom-or-bloom.localhost:1355/api/auth/callback/twitter`, requested scopes are `users.read tweet.read`, and PKCE is S256. No credential values were printed. Check provider app configuration/error before treating auth acceptance as complete.

### Final auth and documentation audit (2026-09-23)

- Real X smoke check passed after the user authorized **Doom or Bloom Development** (`33462727`). The anonymous private assessment `6fdbc1e8-0177-4c07-9eac-806ad36d6fbb` remained accessible at the same URL after claim. Signing out removed library access; signing back in with the same approved scopes recovered the same record. The production app is named **Doom or Bloom** (`33462739`); hosted login remains outside this local implementation scope.
- Corrected the earlier credential diagnosis: direct parsing proved the development and production env files contain distinct IDs, with development matching its console app. A stale inherited `X_CLIENT_ID` overrode Next.js/Node env-file loading and caused X’s initial rejection. Restarted only this worktree’s dev server with `env -u X_CLIENT_ID pnpm dev`; outgoing ID then matched the development file and X displayed the expected consent. Credential files did not need changes.
- Verified the exact local callback in the console and at runtime. [X’s OAuth reference](https://docs.x.com/fundamentals/authentication/oauth-2-0/authorization-code) requires an exact registered redirect and describes S256 PKCE and scopes. Actual consent requested only profile/post read access; no write, email, follower or offline scope. Production callback registration was verified during app setup; external production callback execution and crawler previews require deployment.
- `pnpm db:test:auth` now also publishes an anonymous fixture before claim and compares the entire public response afterward. Content, visibility and public identity remain unchanged. Expired session, abandoned redirect, callback replay, existing account merge, transfer failure/retry and in-flight commit checks pass through actual Better Auth handlers with mocked X transport.
- Removed obsolete local-only persistence/sharing claims from PRODUCT, stale implementation banners from local-debugging, and destructive-restart wording from debugging/authoring docs. Updated env guidance, privacy/measurement semantics and local production-check commands. Removed unreachable interview conflict UI; the real 409/refresh path remains in the persistent-state hook.
- Authorization audit: private route handlers use the shared session and exact-origin boundary; repository ownership filters apply to every owner read/mutation. Public HTML/metadata, JSON and WebP load current publication state through `loadPublished`/`publicLoad`, with no session creation or inference. Public serialization omits owners, browser drafts, event markers and operations. Owner operation views exclude bounded SQL diagnostics. POST commit locks/deadline checks and deletion races are exercised against real Postgres.
- Verification repeated after the audit: `pnpm db:test`, `pnpm db:test:repository`, `pnpm db:test:commit`, `pnpm db:test:lifecycle`, `pnpm db:test:personas`, `pnpm db:test:auth`, and `pnpm test` pass (252 unit tests across 52 files). Earlier complete browser (52), analytics transport (3), disposable crash/restart, WebP visual, and local production build/start evidence remains above. Final build/persistence-browser results follow below.

- Final `pnpm build:local` passes, including runtime portrait tracing; final `pnpm check:persistence` passes all five browser cases. All local implementation checkboxes are complete. The actual user-facing library shows the claimed assessment after sign-out and repeat login.

### Completion evidence and remaining deployment work

| Requirement | Authoritative implementation and verification |
| --- | --- |
| Native Postgres, Drizzle schema, anonymous ownership | Checked-in migrations and DB constraints; `db:test`, fresh disposable migrations twice, anonymous session/origin tests. |
| Bounded synchronous atomic operations and recovery | Repository acceptance/commit transactions; provider retry/deadline unit checks; `db:test:repository`, `db:test:commit`, real process-death `db:test:restart`. No workflow/worker dependency or Docker setup. |
| One-click entry, multiple assessments, drafts and immutable answers | Saved-state interview/library and CTA; complete 52-case browser suite plus five focused persistence cases. |
| Completion, independent private forks, 12/24/30 budgets | Lifecycle repository/state checks, cap unit/browser checks and publication/fork/revocation browser case. |
| Full opt-in public resources and social images | Explicit serializer and visibility reads; HTML/JSON/WebP denial checks, noindex/no-session assertions, image dimensions and visual inspection; production start/cache verification. |
| Curated database personas and immutable generations | Persona seed/payload/repository/generation hooks; exact preservation, repeated seed, failure, ordering and stable historical URL checks in `db:test:personas`; public persona browser test. |
| Optional X recovery and private account identity | Actual Better Auth callback integration tests and real local X claim/sign-out/relogin; unchanged public response tested across ownership transfer. |
| Privacy, docs, tooling and checkpoint commits | Updated canonical docs and visible copy, native PostgreSQL CI configuration, env split and setup/retry instructions; format/lint/types/unit/content/unused checks and production build. |

Production preparation was subsequently authorized and completed on September 24: Neon schema/seed and hosted production secrets are installed, and request-duration configuration is verified. Remaining work is to deploy the app, then verify the production OAuth callback and external social crawlers; see [production readiness](production-readiness.md). Hosted CI execution is not claimed; its native-Postgres workflow is checked in and the same local commands passed. Paid persona regeneration and semantic evaluation were not needed or run. Assessment interpretation remains an experimental draft, independent of persistence correctness.

### Owner route and detail navigation follow-up (2026-09-23)

- Owner detail URLs now use `/assessments/<id>` consistently across creation, library links and forks. Singular `/assessment/<id>` URLs redirect to the canonical route. Public URLs remain `/public/assessments/<id>`.
- Removed the New assessment button from assessment detail; creation remains in My assessments. Updated the existing navigation/recovery browser checks to use that library action.
- The fixture badge identifies development/test mode with synthetic evaluator output and no Jev calls. This change does not switch the configured provider.
- Simplified the interview privacy sentence to the user’s requested wording; server retention, operator access and unsubmitted-draft behavior remain documented on Privacy/About.
- Verification: `pnpm test` passed; production compilation and the updated trace verifier passed; all five persistence browser cases and all affected browser cases passed. The general browser run passed 49 cases; two navigation-wait assertions and a parallel trace-output collision were corrected, then the affected 19-case group passed. Manual browser inspection verified the canonical route, old-link redirect and absent detail creation button.

### Reliable CTA navigation and live development (2026-09-23)

- Reproduced the homepage remaining in place when `/api/auth/get-session` returned an empty body: the CTA awaited auth/creation before navigating, and the API helper parsed every non-204 response as JSON. The regression and focused client tests failed before the fix.
- The homepage and other Map your own worldview CTAs are now real links to `/assessments?start=1`. Returning owners are redirected to their library; for empty libraries, a mounted destination component creates the assessment once, with an inline retry on setup failure. Prefetch and server GET rendering never create records. New assessment remains an explicit library action.
- Empty successful session responses represent no session; empty or non-JSON error responses produce a safe API error rather than leaking JSON parse exceptions.
- User preference: development assessments always use live Jev. Updated the private development env and `pnpm dev`/`dev:tailscale` to select `ASSESSMENT_PROVIDER=live`. Controlled synthetic responses remain confined to automated tests.
- Use Portless’s explicit app name for normal dev, keeping the registered OAuth origin stable across branch changes. Tests retain isolated named servers.
- Verification: `pnpm test` passed (254 unit tests); all six persistence browser cases and 14 affected landing/persona browser cases passed. `pnpm build:local` passed, including production trace validation. Manually verified the homepage link opens the existing owner library and confirmed the stable Portless origin.

### Account presentation and eager environment validation (2026-09-23)

- My assessments displays the authenticated profile portrait and name, with an avatar fallback. Sign in/out copy is provider-neutral and the redundant account-linking sentence is removed. Profile identity remains private to the owner library.
- Diagnosed immediate live-answer 503s: the environment-file split left the existing Jev key in the original checkout, absent from this worktree’s development file. Restored the local key without displaying or committing it. A temporary live assessment successfully saved an answer (HTTP 200, revision 1) and was deleted.
- Central startup validation rejects missing/invalid database and auth settings, missing live Jev credentials, partial OAuth configuration, malformed booleans, and incomplete enabled analytics settings. Next config and instrumentation enforce validation at server startup; `pnpm dev` checks before launching Next. Playwright validates the incoming local configuration before fixture overrides, including TEST_DATABASE_URL. CI explicitly declares fixture mode. Errors disclose variable names only.
- Verified missing-key `pnpm dev`, direct Next startup, and E2E preflight all exit 1; the configured auth browser test passes.
- Final checks: `pnpm test` passed (262 tests), local production build/trace checks passed, and configured development preflight passed.
- Avatar follow-up: upgrade X thumbnail URLs to their 400×400 profile variant when rendering the owner library; preserve other provider URLs. Allow only HTTPS `pbs.twimg.com/profile_images/**` in Next image remote patterns. Verified the authenticated profile’s larger image returns HTTP 200 at 400×400; `pnpm test` passed.

### Results presentation and sharing follow-up (2026-09-23)

- Removed the Done button. Show sharing only in the results view, and reject public visibility through the API while the snapshot is still interviewing, even when an intermediate projection exists.
- Moved assessment heading defaults into the CSS base layer so component text sizes take precedence. More details uses 18px; lower section/card titles use 16px. Bookmark titles are isolated 14px divs, not headings.
- Verification: `pnpm test` passed; the publication/fork/revocation browser regression passed with a new assertion that premature publication returns 409. All four interaction browser tests passed; inspected the updated desktop results screenshot.

### Shared detail-page typography (2026-09-23)

- Confirmed persona sources and participant resources reuse ResourceList/ResourceBookmark; private and public participant results reuse ResultView, while all result surfaces reuse ExperimentalResults/WorldviewDetails.
- Moved the owner-only heading stylesheet to a shared AssessmentPage wrapper used by private assessments, public participant/simulation assessments, and persona detail routes. Component text utilities retain precedence over shared defaults.
- Verification: `pnpm test` and all six persona/assessment interaction browser cases passed.

- Expected transformation now uses the same Card/Header/Title/Content structure and two-column detail grid as Expected capabilities. It stacks on mobile. `pnpm test` and the existing desktop/mobile results interaction check passed.

### Results disclosures (2026-09-23)

- Removed the explanatory subtitle under Results and the standalone image-download action between the visualization and details. The existing footer actions remain.
- Grouped the fingerprint grid under Insights and findings under A few things that stood out. Both use the same reusable disclosure, closed by default, with accessible buttons and expanded state. Private and public results share the implementation.
- Verification: `pnpm test` passed; all 17 matching assessment/persona/interaction browser cases passed, including default-closed disclosures, toggling, and footer image/report downloads.

### Simplified assessment status and on-demand results (2026-09-23)

- [x] Derive library status from current meaningful results and visibility: In progress, Ready to publish, Published. Remove the open/completed lifecycle and completion operation. Keep interview/recovery mechanics separate; normalize historical completed/paused snapshot values on read.
- [x] Generate full results only for explicit requests, automatic results decisions, clarification results, or the question cap. Routing uses targeted overall-outlook and central-basis judgments alongside candidate selection, without constructing results. Debug mode records actual inference only. Offline persona generation explicitly requests its journey snapshots.
- [x] Invalidate results when new accepted evidence arrives. Viewing pages or reopening saved results performs no assessment mutation. Private assessments with current results remain publishable regardless of interview display mode.
- [x] Freeze public assessment content. Continuing publicly shared content creates a private fork; unpublishing permits edits to the original. Preserve public URL revocation and independent fork ownership.
- [x] Migrate local development and test databases, remove lifecycle constraints, and update pointer/persona constraints. Exclude legacy background projections from readiness metadata without rewriting snapshot payloads. Production migration remains a deployment task.
- [x] Update domain, persistence, inference, debugging, and journey docs. Bump the algorithm to 0.6.1 and regenerate the mechanical journey baseline for changed routing.
- [x] Verify: 262 unit tests plus formatting, lint, types, content, and unused-code checks; local production build; lifecycle, repository, commit, and persona database suites; six persistence browser cases, then four participant cases after adding saved-result read-only coverage. The full 52-case browser run exposed five stale assertions; all affected files passed on rerun (12 cases). A temporary live Jev assessment saved an answer without creating results and was deleted.

### Public assessment presentation (2026-09-23)

- [x] Reuse ConversationHistory and its answer disclosures on public participant pages, with shared answer navigation linking results to the conversation.
- [x] Remove the public introduction, redundant Results heading, review disclosure, full-report download, and raw JSON disclosures/download links. Keep the public data endpoint and image download. Use the centered WorldviewCtaCard below the conversation.
- [x] Verify public long answers start collapsed, expand/collapse correctly, and fit a mobile viewport. Inspect the desktop screenshot and verify owner-page controls through the existing interaction suite.

### Sharing failure diagnosis and participant error audit (2026-09-23)

- [x] Traced reported Make private failures to Postgres logs at 16:37–16:39 UTC: the obsolete assessment_lifecycle constraint rejected clearing the published snapshot pointer. Migration 0002 removes that constraint. Verified the affected row through a rollback-only repository operation, and verified publish/unpublish through the running local HTTP server with a temporary assessment, deleted afterward.
- [x] Replace direct server-error rendering with controlled error-code messages at both HTTP and browser boundaries. Expected conflicts retain actionable copy; unknown/network failures use action-specific fallback messages. Cover sharing, deletion, forks, loading, answer submission, and image/report downloads. Authentication already catches failures with fixed copy. Keep technical details in explicit debug tools and server diagnostics.
- [x] Preserve uncertain-submission recovery on network errors. Never discard the saved submission merely because a normalized network error has status zero.
- [x] Include SQLSTATE codes in redacted server diagnostics without logging SQL, row contents, or exception messages.
- [x] Add regressions for raw error-body/network-message leakage, both Make private buttons, safe sharing-failure toasts, and successful retries.

### Public publisher headers (2026-09-24)

- [x] Capture the signed-in publisher’s display name, high-resolution profile photo, and X profile link on explicit publication. Keep anonymous publications anonymous across login and repeated publish requests. Clear attribution on unpublish; republication captures the current profile.
- [x] Extract ProfileHeader from the persona header and reuse its visual layout for attributed public participant pages. Anonymous pages use “Your AI worldview”; the centered CTA card remains below the conversation.
- [x] Add migration 0003 to local development/test databases. Leave existing publications unattributed because publication-time authentication was not recorded; no production migration or identity backfill.
- [x] Update privacy copy and domain/persistence docs. Verify the anonymous-to-authenticated publication boundary, frozen profile data, higher-resolution image URL, and profile link through repository and browser tests.

### Global heading scale (2026-09-24)

- [x] Replace assessment-specific and landing-page heading scales with global h1–h6 styles: 30/24/20/18/16/14px, weight 600, line-height 1.4, and balanced wrapping across breakpoints.
- [x] Remove individual heading typography utilities throughout pages, shared components, local tools, and dialog titles. Preserve layout classes and independent non-heading labels; minor result sections use smaller heading levels.
- [x] Document the shared scale and usage rules in PRODUCT.md; AssessmentPage now owns layout only.
- [x] Verify 269 unit tests and repository checks, final type checking, 20 landing/persona/interaction/typography browser cases, and public publication flow. Computed sizes agree across desktop/mobile routes; inspected both assessment screenshots.

### Public comparisons and homepage heading follow-up (2026-09-24)

- [x] Reproduced the missing public persona matches: PublishedResult passed an empty comparison list while the private page loaded selected personas. Both routes now use loadPersonaComparisons and the same ranking/rendering components. A browser regression fails before the fix and passes afterward, checking the same three links in the same order.
- [x] Restore the homepage hero's original fluid desktop size and 36px mobile size as an explicit display-heading exception. Keep the shared h1–h6 scale on other pages and verify both viewport sizes.

### Persona profile and timeline polish (2026-09-24)

- [x] X persona profile links display only @username. Shared experimental results omit the milestone timeline card when no current milestone evidence is available.
- [x] Verify repository checks and all three persona-detail browser cases, including @tszzl and the absent empty timeline.

### Shared reading-column width (2026-09-24)

- [x] Centralize the 624px reading area in content-column (672px outer width with 24px gutters). Apply it to participant owner/public routes, persona routes, library, About, Privacy, and the assessment entry page.
- [x] Preserve wide maps/result grids through the shared breakout layout on persona pages.
- [x] Verify repository checks, five persona/typography browser cases across desktop/mobile, and the public publication flow with an explicit 624px conversation-width assertion.

### Remove participant review/clarification UI (2026-09-24)

- [x] Remove the Review & clarify my results disclosure, its per-claim correction actions, and the reference-snapshot panel it contained. Keep result insights, supporting answers, resources, downloads, and Continue answering questions.
- [x] Update the current product contract while retaining historical clarification data and engine compatibility.
- [x] Verify repository checks and all four interaction browser tests, including absent correction controls and successful continued answering.

### Wider content and tweet masonry (2026-09-24)

- [x] Increase the shared reading area from 624px to 700px (748px including gutters). Bookmarks and CTA cards use the same content-width token.
- [x] Let multi-tweet masonry break out to a centered 1152px maximum with two desktop columns. Single tweets and mobile layouts remain within the reading column.
- [x] Verify repository checks, six bookmark/tweet/typography browser cases, and the public publication flow. Assert desktop masonry is wider than its 700px parent, centered, and within its cap; mobile has no horizontal overflow.

### Shared breadcrumbs and 720px reading column (2026-09-24)

- [x] Add shared shadcn breadcrumbs before page content on all routes except the homepage and public assessments. Replace redundant back links; assessment details link to My assessments.
- [x] Rename the published-result fork action to “Fork & continue answering.”
- [x] Increase the shared reading area to 720px (768px including gutters), preserving wide tweet masonry and result breakouts.
- [x] Verify repository checks, seven browser cases for breadcrumbs/typography/bookmarks/tweets, and the publication/fork/revoke flow. Confirm public pages omit breadcrumbs and inspect desktop assessment layout.

### Lazy assessment drafts and profile header spacing (2026-09-24)

- [x] Reserve stable owner-bound draft URLs using signed, path-scoped browser cookies without inserting assessment, snapshot, operation, or reservation rows. Keep unsubmitted drafts out of the library.
- [x] Persist the assessment, initial snapshot, spent UUID marker, and first submitted operation in one transaction. Preserve synchronous processing/retry semantics; prevent old tickets from resurrecting deleted records.
- [x] Preserve local typing and the same URL across reload and Back/Forward; explicit library creation pushes browser history. Keep first-run entry as a replacement navigation.
- [x] Apply the spent-draft-ID migration to native local development and test Postgres only. Update the persistence/product contracts and browser test persistence seam.
- [x] Center profile CTAs alongside avatar/name/profile link, above the description. Remove redundant top margin from the shared persona/public header.
- [x] Verify repository checks and 21 targeted browser cases covering draft storage/history, authorization, lost responses, publication/forks/revocation, interviews/conversations, report downloads, and persona header alignment. Refresh an older report-flow test that still expected the previously removed clarification and standalone social-download controls.

### Publication-time X handles (2026-09-24)

- [x] Save the X provider’s username on initial/returning OAuth sign-in; reject handle writes outside the verified X callback. Better Auth's input:false also filters provider mappings, so database hooks enforce this boundary instead.
- [x] Freeze the latest known username on explicit publication and render @username while preserving the stable X user-ID profile URL. Older snapshots without handles use Profile; they require sign-in and explicit republication to capture a handle.
- [x] Apply the user-column migration to native local development/test databases. Verify repository checks, provider-mocked OAuth capture/refresh/spoof rejection, frozen publication attribution, and the publication browser flow.
- [x] Recheck the reported public assessment's worldview card using server HTML and a fresh browser. Both show Dwarkesh Patel, Dario Amodei, and Roon; the user confirmed it is working. No matching-logic change was needed.

### Unified assessment social images (2026-09-24)

- [x] Share result-to-card data preparation and the full ShareCard rendering/portrait-loading path between public WebP previews and downloaded PNGs. Remove the obsolete separate participant preview template.
- [x] Keep WebP previews at 1200×630 and PNG downloads at 2400×1260. Preserve current-publication checks, revocation, no-store/noindex headers, and simulation labeling.
- [x] Verify repository checks (270 unit tests), including actual endpoint image parity within compression/rasterization tolerance, unknown coordinates, and matching portraits. Visually inspect the shared template and verify the publication/fork/revocation browser flow.

### Production infrastructure preparation (2026-09-24)

The user explicitly authorized preparing production Vercel and Neon, superseding the earlier local-only boundary for infrastructure. Application deployment is still separate.

- [x] Inspect the existing Vercel project and canonical domain; preserve existing Jev/analytics configuration and production branch.
- [x] Install production-only pooled database URL, auth origin, independently generated auth secret, and supplied production X credentials. Keep direct migration access local and preview environments separate.
- [x] Apply migrations 0000–0005 to the previously empty Neon database and import all 44 curated persona assessments without inference.
- [x] Refresh repository, commit-recovery, lifecycle and provider-mocked account checks; all seven persistence browser cases and the local production build pass.
- [x] Deploy the reviewed application after PR #2 merged and run the [production smoke checklist](production-readiness.md#remaining-after-deployment). Real X authorization, live assessments, anonymous claim, publication/revocation, cross-browser access and an external WebP preview fetch passed. Hosted deletion is deferred by the user's request to retain QA records; the full hosted deadline boundary remains untested.

See [production readiness](production-readiness.md) for configuration boundaries and verification details. No production application deployment was triggered.

Post-merge follow-up (September 24): the paragraph above describes infrastructure preparation only. Production now serves the merged app. Corrected X app `33462739`'s bare-domain callback to the canonical `https://www.doom-or-bloom.com/api/auth/callback/twitter`, resolving the reproduced pre-callback authorization error. Account-holder consent and returning login passed. The new workspace passed all documented local release gates; hosted smoke evidence and explicit remaining limits are recorded in production readiness.

### Public SEO and image caching — September 24, 2026

- [x] Public assessments use indexable canonical/Open Graph/Twitter metadata; full answers and result disclosures are present in server-rendered HTML. Hydration supplies interactions. Private pages remain noindex.
- [x] Public participant and persona Takumi previews use seven-day browser/CDN caching. Cached image access for up to seven days after revocation is explicitly accepted; origin visibility checks and uncached HTML/JSON remain in place. This supersedes the initial no-store/noindex preview policy recorded above. Private PNG POST downloads and error responses stay uncached.
- [x] Remove the blanket private cache header from image routes and update privacy copy to match indexing and caching behavior.

### Discovery and metadata synchronization — September 24, 2026

- [x] sitemap.xml and llms.txt enumerate only static public pages and selected curated persona profiles. Participant assessments remain indexable by public link but are not listed in either directory.
- [x] robots.txt excludes private owner routes, APIs, the legacy start entry, and public JSON exports; public HTML and social images remain crawlable.
- [x] Privacy metadata and llms.txt describe server persistence, anonymous ownership, optional X recovery, immutable snapshots, publication, forks, and seven-day public image caching. Corrected stale route and noindex claims in current docs; historical implementation evidence remains dated.
- [x] SEO audit discovers current persona paths from the generated sitemap instead of the old authored fixture catalog. Browser checks cover discovery files, private/published assessment exclusion, and privacy metadata.

## Testing policy update — September 24, 2026

- [x] Replace the historical PostgreSQL/build/browser GitHub workflow described above with one core `pnpm test` job. No CI secrets, local env files, proxy, browser, or database setup.
- [x] Audit test dependencies and prune duplicate browser scenarios and exact cosmetic assertions. Keep fast meaningful unit and native integration coverage.
- [x] Document required local change/release gates and validation evidence in [testing guidelines](testing.md). Earlier references to CI running database/browser checks are historical; these checks remain local release requirements.
