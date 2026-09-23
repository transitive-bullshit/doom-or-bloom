# Persistent assessments implementation plan

Prepared 2026-09-23. Product decisions are approved; implementation has not started. The latest user constraint is **no Docker**. This plan covers local development, with hosted-service setup recorded for later; it does not authorize deployment.

Read [PERSISTENCE.md](PERSISTENCE.md) for the accepted UX, relational model, ownership, snapshots, Workflow execution, and publication contracts. Use this file for ordered tasks, checks, commits, and blockers. It supersedes the database/account/public-URL exclusions and browser-authoritative architecture of [the original MVP plan](mvp-implementation-plan.md), whose completed checkpoints remain historical evidence.

## Execution rules

1. Execute checkpoints in order. Mark a task `[x]` only when its outcome exists and its relevant checks pass. Add validation evidence and remaining blockers to the checkpoint log in the same commit.
2. Commit coherent, passing units at the named boundaries; large checkpoints may use the suggested subcommits. Inspect the staged diff and stage explicit paths. Keep unrelated user changes intact.
3. Update affected canonical docs, visible copy, and contributor instructions alongside the feature that changes their truth. The approved target and currently shipped behavior must remain distinguishable during the transition.
4. Proceed autonomously through routine implementation, local database setup, migration generation/application to dedicated development/test databases, debugging, fixture checks, and commits. Do not wait for approval at each checkpoint. Optional review moments below are opportunities for feedback, not gates.
5. Ask for help only when an external account/credential or explicit business decision genuinely blocks progress. Continue independent work. Scope changes, destructive changes to an unrelated/existing database, deployment, and unbudgeted paid inference are not implied by this plan.
6. Follow repository conventions: pnpm, modern TypeScript, no semicolons, oxfmt, oxlint, and shadcn/ui primitives. Before application code changes, install the locked dependencies and read relevant guides in `node_modules/next/dist/docs/`. Before Workflow integration, read version-matched SDK docs and inspect the pinned world adapter's API. This worktree had no `node_modules` when the plan was written.
7. No Docker, Compose, or Testcontainers, including development and this project's integration tests. Use native Postgres.app, or a native PostgreSQL installation if Postgres.app becomes unavailable. Test databases are disposable and distinct from development data.

## Delivery sequence

| Checkpoint | Outcome | Dependency |
| --- | --- | --- |
| 0 | Recorded design, execution plan, and documentation pointers | Complete in this documentation change |
| 1 | Native Postgres, schema, anonymous auth, and a proven Workflow integration | Local tooling only |
| 2 | Durable submissions, authoritative state, replay-safe processing and recovery | Checkpoint 1 |
| 3 | One-click first run, assessment library, completion, forks, public pages and WebP previews | Checkpoint 2 |
| 4 | Database-backed personas and immutable regeneration | Checkpoints 1–3 |
| 5 | Integrated persistence milestone verified and documented | Checkpoints 1–4 |
| 6 | Optional X login and anonymous assessment transfer | Checkpoint 5; X application setup for live verification |

Checkpoints 1–5 are the persistence spike/milestone. Checkpoint 6 is the separate account spike. The first end-to-end assessment should work by checkpoint 2; avoid holding all integration until the end.

## Checkpoint 0 — agreed design and handoff

- [x] Record the core tables, immutable snapshots, anonymous ownership, first-run shortcut, fork budget, public resource, persona selection, and indefinite retention.
- [x] Select Workflow SDK for execution and its Postgres World with native Postgres.app for durable local development; document why the default in-memory local queue cannot establish restart recovery.
- [x] Record the task sequence, doc updates, meaningful tests, commit boundaries, optional review moments, and third-party setup needs.
- [x] Link this plan from the handoff and agent instructions and mark old persistence scope as superseded.

Commit: `docs: plan durable assessments and optional accounts`.

## Checkpoint 1 — local storage, ownership, and Workflow feasibility

### Native PostgreSQL and schema

- [ ] Inspect the running Postgres.app server/version and connectivity without changing existing databases. Create dedicated development, integration-test, and Workflow databases/roles with project-specific names. Document exact creation commands and connection strings using placeholders; never print credentials.
- [ ] Add compatible pinned `drizzle-orm`, `drizzle-kit`, `pg`, `better-auth`, and required types/adapters. Use one PostgreSQL path locally and with Neon; avoid introducing a separate SQLite implementation.
- [ ] Implement server-only database configuration, connection pooling, env validation, and checked-in schema/migrations for Better Auth and the application tables in PERSISTENCE. Keep Workflow's own bootstrap/schema under SDK ownership.
- [ ] Add documented pnpm commands for migration generation/application, curated persona seeding, and DB integration tests. Prefer migrations over untracked schema push. Apply to a fresh test database twice and show the second migration pass is a no-op.
- [ ] Verify ownership FKs, snapshot membership/uniqueness, one active operation per assessment, idempotency keys/fingerprints, fork deletion semantics, and persona pointer constraints against real Postgres.
- [ ] Extend `.env.example` with `DATABASE_URL`, optional direct migration URL, `TEST_DATABASE_URL`, auth secret/base URL, and Workflow variables. Reuse the actual Portless origin. Add a native database setup section in CONTRIBUTING; keep secrets out of git.

### Anonymous sessions

- [ ] Generate and integrate the pinned Better Auth anonymous schema and routes. Establish identity only on participant start, not public page views. Configure renewable cookie lifetime and document the observed expiry behavior.
- [ ] Add one ownership boundary used by all private reads/mutations. Test separate browser owners, absent/expired cookies, forged IDs, cross-origin writes, and no auth material in serialized assessment state.
- [ ] Disable unsafe anonymous-user cleanup until assessment transfer is implemented. Owner deletion must not accidentally cascade away indefinitely retained assessments.

### Workflow spike (required technical gate, no human approval required)

- [ ] Add compatible `workflow` and `@workflow/world-postgres`; wrap the existing Next config with `withWorkflow()` while preserving current configuration. Verify the repository's dev bundler and `next build --webpack` both work; document any necessary supported build adjustment.
- [ ] Bootstrap Postgres World against its dedicated native database with the installed package's pinned CLI. Start it from Node instrumentation as documented. Keep `pnpm dev` as the single Portless development command; do not add a custom inference-worker daemon.
- [ ] Validate workflow callback URLs, startup ordering, shutdown, concurrency limits, and hot reload with the actual Portless URL. Confirm internal execution routes cannot become an unauthenticated public inference endpoint.
- [ ] Use a credential-free workflow with database side effects: start, kill the app mid-step, restart, and demonstrate recovery plus one committed effect. Repeat with the database temporarily unavailable. Test both Turbopack development and the production build path.
- [ ] Record the installed SDK/world versions, migration/bootstrap process, retry defaults, run inspection/recovery API, idempotent-start support or absence, and Node version compatibility. If the integration genuinely fails, preserve evidence and propose the smallest native alternative; do not silently add Docker or a homegrown queue.

Done when: a fresh native test setup migrates, anonymous owners are isolated, and a real Workflow run recovers through the tested failure cases. Application inference is still fixture-based.

Suggested commits: `feat: add postgres schema and anonymous ownership`; `feat: integrate durable workflow execution locally`.

Update: CONTRIBUTING, `.env.example`, PERSISTENCE execution details, TYPESAFE ownership/execution boundary, and this checkpoint log. Optional review: schema/constraint diff and the recovery evidence; continue when checks pass.

## Checkpoint 2 — authoritative assessment operations

- [ ] Extract a small server assessment repository/service around creation, authorized loading, operation submission, completion/publication, and deletion. Keep semantic evaluation in the existing engine.
- [ ] Replace the full client-supplied state request with ID, expected revision, request key, and typed operation input. Load the authoritative snapshot server-side. Save rejected interactions server-side rather than relying on the old transport's removal of `interactionHistory`.
- [ ] Save each accepted submission and queued status transactionally before dispatch. Return an operation/status reference after persistence; retain the local draft if acceptance is uncertain or the database is unavailable. Reuse the same request key on uncertain retries.
- [ ] Implement the operation-to-Workflow dispatch/binding protocol in PERSISTENCE. Prove both failure windows: crash after DB commit but before start, and start succeeds but run-ID recording fails. Duplicate dispatch must not create a second state transition.
- [ ] Implement the evaluation-and-commit Workflow step with identifier-only arguments/results. Load the pinned base state internally; persist bounded attempt/status information. Commit snapshot, head revision, and operation success atomically.
- [ ] Keep SDK retries, engine retries, physical request reservations, deadlines, and cancellation consistent. Preserve the current `limits.providerAttempts = 32` as an aggregate operation bound, reconcile older 24-request documentation, and run maximum-history fixtures before changing bounds. Never truncate evidence or silently upgrade pinned inference semantics on recovery.
- [ ] Add a bounded reconciler shared by local startup, a periodic local trigger, and a one-shot maintenance entry point. Reconcile missing dispatches and terminal runtime failures while leaving healthy workflows alone. Document the hosted scheduler requirement separately.
- [ ] Add authorized operation status reads. The browser restores pending submitted text and processing status after reload; it polls until completion/failure and ignores stale responses. Browser disconnection cannot erase or cancel accepted work.
- [ ] Return explicit conflicts for changed request payloads, stale revisions, competing operations, or incompatible versions. Failure preserves the submitted text and prior snapshot; successful retries do not append duplicate turns.
- [ ] Preserve local unsubmitted drafts per assessment. Remove the old single-assessment authority and migration path for participant browser state; no compatibility with previous completed browser assessments is required.
- [ ] Ensure mutation retries cannot recreate deleted assessments. Validate cancellation/publication/finalization against operations already in progress.

Required DB/fixture checks: duplicate request and different-input same-key; two competing tabs; missing dispatch; lost start response; process death during evaluation; successful commit before response loss; old generation returning after recovery; persistent failure exhausting retries; deleted assessment returning from inference; stored rejected reply with no scoring effect. Execute these with real Postgres and Workflow plus mocked evaluator calls, not just repository mocks.

Done when: an anonymous participant can start, submit, reload during processing, recover after app restart, and see exactly one committed answer/result transition. No live API key is required for this verification.

Suggested commits: `feat: persist assessment operations and immutable snapshots`; `feat: recover interrupted assessment workflows`; `refactor: make server assessments authoritative`.

Update: TYPESAFE, MEASUREMENT, local-debugging, CONTRIBUTING, API/transport documentation, and this log. Optional review: show the interrupted-submission recovery, rather than introducing a blocking approval step.

## Checkpoint 3 — participant UX, forks, and sharing

- [ ] Implement the main CTA routing table in PERSISTENCE: zero assessments goes directly through creation to `/assessment/<id>`; any existing assessments goes to `/assessments`. Establish session and record without a second click. Serialize simultaneous empty-library starts; reuse request keys on retry. No GET/prefetch creates records.
- [ ] Add the owner library with resume/view, New assessment, delete, and public/private management. Use existing UI primitives. Creation preserves prior work; deletion is explicit. Keep `/assessment` links usable as an entry surface.
- [ ] Add owner detail loading and modest pending/error states. Existing submitted text is read-only; preserve keyboard focus, draft recovery, and the current single-page conversation layout.
- [ ] Keep result preview open; Done completes privately; Share completes and publishes. Explain whole-conversation publication in the sharing action. Avoid a lifecycle wizard or mandatory title/account prompt. Serialize finish/share with in-flight processing.
- [ ] Implement owner-only final-snapshot forks for completed participant assessments. Copy state independently, preserve versions/provenance, reset transient state, and create new private identity/URL. Continue or targeted clarification happens in the new assessment. No historical editing, public remixes, or earlier branching.
- [ ] Implement 12 initial prompts, up to 12 new prompts per fork, and 30 total including inherited questions. Update schema limits, routing, readiness/cap UI, clone logic, inference-size checks, and fixtures together. Verify 12 → 24 → 30, forks from earlier completion, warnings, skipped/clarification prompts, and no unusable fork at 30.
- [ ] Implement server-rendered public assessment pages and explicit public serialization. Render the complete frozen conversation and inferred state. Mark participant pages noindex and exclude them from sitemap/directory; keep public reads session-free.
- [ ] Extend the existing Takumi social renderer for participant results. Serve 1200 × 630 WebP at a public visibility-checked route, with absolute Open Graph/X metadata URLs, MIME type, dimensions, and useful alt text. Preserve existing PNG downloads and persona simulation labeling.
- [ ] Check visibility on public HTML, metadata, exports, and social-image requests. Initially avoid shared caches for revocable participant content. Private/deleted IDs return no assessment content or personalized image, including on a previously used image URL.
- [ ] Make fork/source deletion independent. Preserve fork markers for analysis even if a parent was deleted. Keep private drafts and operational traces outside public payloads.
- [ ] Update privacy/About/interview/README copy before this checkpoint is considered complete: server storage, indefinite retention, operator access, full public transcript, optional future recovery, and external preview-cache limits. Keep raw text and new private URLs out of analytics payloads.

Browser checks: fresh context gets first prompt after one CTA; zero double-created records on retry; one/multiple existing drafts and completed-only history go to library; old links work; refresh while processing; two isolated owners; completion/fork/publication/private/delete; public HTML contains the intended full assessment only. Render and inspect WebP cards for long titles, unplaced results, normal participant results, and personas. Verify file signature/dimensions/metadata and private-image denial.

Done when: the fresh-user path is as short as before and the complete ownership/share/fork flow is usable without accounts. Public reads never run inference.

Suggested commits: `feat: add assessment library and first-run shortcut`; `feat: freeze and fork completed assessments`; `feat: publish assessments with webp social previews`.

Update: PRODUCT, ASSESSMENT, CONTEXT, MEASUREMENT, README, app copy, sharing/export docs, and this log. Optional review: a short browser walkthrough at this point; do not block subsequent work awaiting it.

## Checkpoint 4 — dynamic curated personas

- [ ] Create the noninteractive simulation owner and idempotent persona seed. Derive the public allowlist from the current curated catalog; do not publish all development journeys simply because they share a bundle.
- [ ] Import existing recorded public journeys under a historical payload format. Preserve exact questions/answers, step results/projection inputs, source snapshots, provenance, original dates, and sourced P(doom) overrides. Do not fabricate a resumable Assessment or rerun paid inference.
- [ ] Make seed reruns harmless: stable seed keys, input-digest checks, mutable profile/source upserts, and insert-only snapshots. A seed rerun must not revert a newer selected live run.
- [ ] Update generation to persist full engine snapshots while available, create a new assessment per run, and publish/select only after successful validation. Failures retain diagnostic state and the last successful public selection. Fence late completion of an older run from overwriting a newer selection.
- [ ] Load homepage, `/users/<slug>`, persona social images, and nearest-persona comparisons from the selected database runs. Preserve source-change disclosures, third-person framing, exact excerpts, and simulated-person labeling.
- [ ] Replace build-time static/persona assumptions with database-compatible runtime reads where needed. Keep repository-authored briefs/config as generation inputs. Eliminate duplicated runtime sources of truth without deleting historical evaluation evidence.
- [ ] Test repeated seed, unlisted development journey exclusion, failed generation, retry of the same run, out-of-order generation completion, new selection with old public URL stability, and complete source/override preservation using fixtures.

Done when: the seeded map and persona pages match existing visible data, public profiles come from Postgres, and fixture regeneration advances their shared selected pointer without modifying historical results.

Suggested commits: `feat: seed public personas and recorded assessments`; `refactor: serve persona results from postgres`; `feat: persist immutable persona generation runs`.

Update: AUTHORING, user-journeys, PRODUCT, ASSESSMENT comparison behavior, README, PERSISTENCE, and this log. No new paid generation is necessary to pass this checkpoint.

## Checkpoint 5 — integrated persistence acceptance

- [ ] Run relevant formatting/lint/type/unit/content checks and the new real-Postgres integration suite. Run `pnpm test` and `pnpm build` once integration is ready; use the existing required project checks and adjust CI for native PostgreSQL without containers.
- [ ] Run the focused browser suite through `pnpm dev` and its resolved Portless URL. Verify production build/start with database reads and the SDK backend; development success alone is insufficient.
- [ ] Recreate disposable application and Workflow test databases from documented steps and migrations. Seed twice, restart, and repeat a queued/in-flight recovery test. Never reset the developer's persistent database as a test fixture.
- [ ] Audit authorization, all public surfaces, raw-text analytics exclusion, HTTP cache behavior, Workflow log payloads, and destructive-action races. Add tests only where they verify actual failure or access boundaries.
- [ ] Reconcile canonical docs and visible copy: remove implemented transition banners, preserve historical checkpoint notes, replace obsolete one-browser/stateless/no-database claims, and document real commands and env values. Keep X login marked pending until checkpoint 6.
- [ ] Record actual validation commands/results, known limits, SDK versions, native startup/recovery procedure, and external setup still outstanding. Keep unmet acceptance checks unchecked rather than labeling the spike complete.

Done when: the persistence milestone meets the approved behavior with recoverable operations, no Docker, no mandatory account, and no documentation claiming behavior that has not shipped.

Commit: `test: verify persistent assessment lifecycle and recovery` (or smaller coherent integration commits).

## Checkpoint 6 — X login and recovery across browsers

- [ ] Configure Better Auth's X provider behind server-only credentials and a clear optional sign-in entry. Starting, completing, and sharing assessments remain available anonymously.
- [ ] Register callback URLs for the actual local Portless origin and later hosted environments. Verify X's current callback restrictions and granted scopes; use an approved reachable dev origin only if necessary. Avoid requesting posting/follower permissions for authentication.
- [ ] Implement retry-safe ownership transfer from the current anonymous identity to a new or existing authenticated user. Preserve assessment IDs, visibility, snapshots, and provenance. Keep the anonymous identity/data intact if transfer fails, then retire/revoke anonymous sessions after success.
- [ ] Exercise actual library callback timing/failure behavior with the pinned version. Verify account linking against provider ID/account ID rather than assuming email availability or matching identities by display name.
- [ ] Test interrupted/repeated callbacks, login to an existing account that already owns assessments, sign-out, expired sessions, failed transfer, cross-browser recovery, and concurrent processing during transfer. Login must not expose account identity on previously anonymous public assessments.
- [ ] Run provider-mocked integration/browser checks without credentials. When the user has configured X, perform one local login smoke check and record the result. Keep that check explicitly pending if setup is unavailable.
- [ ] Update auth/privacy/recovery copy, MEASUREMENT, PRODUCT, CONTEXT, CONTRIBUTING, env documentation, and this log. Run the relevant integration/build checks before committing completion.

Done when: an anonymous participant can claim their assessments with X and recover them in another browser without losing data or changing public URLs. No additional provider, admin dashboard, or account-profile product is included.

Suggested commits: `feat: add optional x authentication`; `feat: claim anonymous assessments on sign-in`.

## External setup and dependencies

| Dependency | When needed | Agent work | User help potentially needed |
| --- | --- | --- | --- |
| Native Postgres.app | Checkpoint 1 | Verify the installed server, create dedicated local databases, apply migrations/bootstrap, document connection variables. | Start/authorize the application only if local permissions prevent setup. No Docker and no hosted account required. |
| Better Auth | Checkpoint 1 | Integrate the library and generate a local secret; configure local origin/cookies. | None for anonymous auth; no separate Better Auth SaaS account. |
| Workflow SDK + Postgres World | Checkpoints 1–2 | Install/pin packages, bootstrap local SDK tables, configure Next/Portless, verify restart recovery. | None for local execution. |
| TypeSafe | Existing runtime | Reuse existing server configuration; use fixture inference for checks. | Existing API key only if a live participant smoke test is desired. |
| Neon | Hosted follow-up | Prepare compatible migrations/env template and seed process. | Select/create project, region, database/role and provide runtime/migration connection secrets securely. No Neon setup blocks local work. |
| Vercel Workflows | Hosted follow-up | Prepare managed-backend configuration, env separation and recovery-scheduler requirements. | Project/team access and service/billing setup if not already available. Actual deployment and hosted cost choices remain separate. |
| X developer application | Checkpoint 6 live verification | Supply exact callback URLs, minimal scope requirements and env names. | Create/configure OAuth application and client ID/secret, authorize a test login. Current provider access requirements must be checked then. |
| Takumi | Checkpoint 3 | Reuse installed local renderer. | None; no media-hosting account. |

Store supplied secrets in ignored local environment files or the authorized host's secret settings, not chat, docs, committed SQL, or tool output. OpenAI credentials remain relevant only to existing live persona generation, which this plan does not need to rerun.

## Review and stop conditions

The schema/recovery demonstration after checkpoints 1–2 and first-run/share walkthrough after checkpoint 3 are useful optional review moments. Post an update with concrete evidence and continue; they are not approval gates. Technical acceptance checks are mandatory.

Pause only the dependent work when credentials or external configuration are unavailable. Ask before changing approved product semantics, launching a paid regeneration, touching unrelated database contents, or deploying. The Workflow feasibility gate may change implementation details within the accepted design; an actual incompatible backend requires a documented alternative, not silent scope expansion.

## Checkpoint log

### 2026-09-23 — planning baseline

- Agreed: server authority, indefinite retention, whole-assessment opt-in publication, immutable completion, owner-only forks, 30 total prompt ceiling, anonymous Better Auth first, optional X later, dynamic curated personas, and normal Postgres inspection only.
- Latest additions: main CTA skips the library only for an owner with no assessments; durable pending-operation capture and recovery; local native Postgres; dynamic Takumi WebP public previews; no Docker.
- Inspected current browser storage, stateless API, engine/result/cap behavior, persona artifacts/generation, privacy docs, and existing WebP renderer. No application changes, database creation, live inference, or deployment performed during planning.
- Native `psql` is available from Postgres.app. Local server connectivity remains to be checked in checkpoint 1. Workflow SDK's documented Local World uses an in-memory queue, so the plan selects its official Postgres World for local restart durability and the managed Vercel World for future hosting.
- Validation: oxfmt passed on the 14 changed Markdown files using the original checkout’s installed formatter and identical config. `pnpm fix:format` first attempted automatic dependency installation in this dependency-free worktree; network resolution failed, so that attempt was stopped and the existing formatter was reused. Local link resolution and `git diff --check` are checked before the planning commit. No application tests are needed for this documentation-only checkpoint. Subsequent checkpoints must append their own executed commands and outcomes.
