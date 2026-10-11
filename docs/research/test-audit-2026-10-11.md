# Doom or Bloom test retention audit

Most of the suite provides useful regression protection. The strongest cleanup opportunities are tests of retired consumers, assertions that never exercise the behavior in their title, and duplicate checks of shared logic. Keep the consequential database, privacy, provider-budget, native-rendering, and production-cache checks.

This is an audit of revision `0b9895e9ea03cae5e61c65eb759bdacc4219a37b`, checked against freshly fetched `origin/main` on October 11, 2026. The checkout began clean and matched main. The initial audit left tests and application source unchanged. Its baseline and proposed dispositions below are historical; the implementation checkpoint records the subsequent repairs. Temporary mutations were restored byte for byte.

The [case ledger](test-audit-2026-10-11-cases.json) indexes every source declaration and expanded runner case against the audited Git revision, with file responsibilities and detailed assertion evidence, parameter definitions, dispositions and receiving owners for all candidates. Paths below are relative to the repository root. Decisions follow the invoked [testing-strategy skill](/Users/tfischer/dev/modules/skills/skills/testing-strategy/SKILL.md), its audit workflow, and the project's [testing contract](../testing.md).

## Scope and verification

| Scope                                            | Inspected |
| ------------------------------------------------ | --------: |
| Vitest files                                     |       121 |
| Playwright spec files across five configurations |        41 |
| Source test declarations                         |       759 |
| Expanded Vitest cases                            |       746 |
| Expanded Playwright cases                        |       143 |
| Native database and process entrypoints          |         9 |
| Content and production-artifact validators       |         2 |
| Mechanical baseline check command                |         1 |

Every case and its assertion path was reviewed, including generated test rows, in-case matrices, shared helpers, and nonroutine suites. The ledger includes 301 native `assert` calls in addition to the test-runner cases. This is a retention audit of existing tests, not a claim of complete application coverage.

`pnpm test` passed: formatting, lint, Next type generation, TypeScript, all 746 Vitest cases in 121 files, content validation, and unused-code checks. Vitest took 5.93 seconds in that baseline. A second Vitest run passed all 746 cases and supplied the expanded case inventory. After the probes, the restored graph, historical-result, and storage suites passed all 34 cases. Dependencies were installed from the frozen lockfile; the full core command needed permission to access Next's native SWC cache outside the workspace.

Playwright discovery listed 140 cases. Three additional cases in `tests/browser/persona-assessment.spec.ts` were inventoried from source: importing that module fails because this checkout lacks the ignored local journey collection. The other four configurations and the remaining 28 browser files listed successfully using synthetic configuration. Listing started no server and connected to no database.

The browser suites, nine database/process scripts, mechanical baseline command, and production build/cache checks were inspected but not executed. Their rendered behavior, runtime cost, and flakiness therefore remain unmeasured in this audit. No paid provider calls, migrations, deployments, or production operations ran. The conditional public-share prefetch test can skip when a build contains no public participant assessments; retain it, but report that skip when assessing release coverage.

The mechanical `journeys:mechanical:check` command was also inspected: it runs the real engine with controlled answers and compares selected observations against an explicit stored baseline. Retain it for mechanical routing/state regressions; it is not semantic validation.

The three paid diagnostic tools (`eval:smoke`, `eval:engine`, and `eval:smoke:languages`) were inspected separately. Retain them as bounded observation tools, not automated semantic regression tests. In particular, the language smoke tool can exit successfully with a non-usable disposition or a false language-propagation flag; those fields are reported for review rather than asserted. None of these tools ran.

## Proposed dispositions

| Disposition | Expanded cases | Meaning |
| --- | --: | --- |
| Keep | 856 | Useful independent or complementary protection; no retention change proposed |
| Repair | 21 | Preserve the contract and strengthen its proof or reduce maintenance friction |
| Combine | 8 | Move unique cases to the named owner before retiring duplicate or obsolete assertions |
| Remove | 4 | No current consumer of the tested helper; current responsibilities have surviving coverage |

These are case-level decisions. A repair often concerns one assertion inside a useful larger test. Counts are an inventory, not a deletion target. The findings below distinguish missing proof from optional maintenance improvements; none establishes a production defect.

## Findings to address first

### F01 Question graph modes can disappear while their suite stays green

**P2 · Repair · `lib/debug/relationships.test.ts:5`**

The shared-target assertion uses `shared.every(...)`, which succeeds for an empty graph. Novelty is tested only with a nonexistent selected ID, so it never exercises a positive novelty relationship. The current implementation can lose both graph modes without this suite noticing.

A controlled mutation added `if (relation !== 'transitions') return []` to `questionRelationships`. Both tests still passed. A separate behavioral probe confirmed that the original catalog produced 20 shared-target edges and a positive novelty edge, while the mutation returned zero for both modes. The browser inspector test checks the graph container and details, providing no independent exact-edge assertion for these modes.

Keep the corpus direction/type test. Repair the question test with a small authored catalog and exact expected transition, shared-target, and novelty edges, including disconnected and missing-ID cases. Derive those edges from the fixture's authored relationships, independently of the implementation.

### F02 Historical result parsing is never exercised

**P2 · Combine · `lib/assessment/worldview-experiment.test.ts:222`**

The entire test is `expect(resultSchema.shape.experiment.isOptional()).toBe(true)`. It proves a field property, but never parses a historical result. A root refinement can reject every result without an experiment while preserving that property.

A controlled mutation added such a refinement. This targeted test still passed, while a behavioral probe confirmed a valid historical result changed from accepted to rejected. The existing legacy migration test at `lib/persistence/storage.test.ts:86` failed for that mutation with “Expected migrated assessment.” Historical parsing already has meaningful protection there; preserve it during F04. The finding concerns this redundant weak case, not a suite-wide absence of compatibility coverage.

Fold the assertion into behavioral compatibility coverage next to the assessment/result schemas, alongside the migrations transferred in F04. Parse a known historical payload with no experimental fields, verify preserved values and defaults, and retain meaningful invalid-payload cases. Delete the introspection-only case once that proof survives.

### F03 The invalid candidate branch promised by the title is absent

**P2 · Repair · `lib/assessment/worldview-experiment.test.ts:136`**

“Rejects uncertain or nonexistent candidate selections” supplies only the existing candidate `n0` with uncertain probability. It cannot detect acceptance of a confident nonexistent candidate.

Keep the uncertainty fixture. Add a separate confident invalid candidate with otherwise valid input, and assert no invented P(doom) or evidence. Ensure the invalid-ID condition, rather than the uncertainty guard, causes rejection.

### F04 Whole-assessment storage tests retain an adapter the application does not call

**P2 · Remove and combine · `lib/persistence/storage.test.ts:24`, `:41`, `:55`, `:66`, `:86`, `:189`**

`loadAssessment`, `saveAssessment`, and `StorageConflict` have no production consumers. The browser suite imports only `storageKey` to inject obsolete corrupt storage. The architecture explicitly describes this directory as legacy storage retained for compatibility tests; that explains its presence, but current draft and pending-request behavior belongs to `lib/assessments/client.ts` and `use-persistent-assessment.ts`.

Remove the adapter-only draft/conflict, corrupt-storage, and earlier-content round-trip cases. Current storage/error handling survives in `lib/assessments/client.test.ts`, `tests/browser/assessment.spec.ts`, and `tests/persistence/lazy-drafts.spec.ts`; pinned-version engine behavior survives in `lib/server/engine-paths.test.ts`.

Transfer the unique contracts first: the operation's 20,000-character boundary, schema-v1 answer/evidence migration, preservation of draft/version/historical-result values, and legacy paperclip recovery normalization. Their receiving owner should be a schema compatibility suite beside `lib/assessment/schema.ts`, with the current client owning long-draft round trips. Retire the unused adapter only after that comparison, then update the architecture's legacy-storage note. This is not a proposal to remove backward compatibility.

### F05 In-memory idempotency tests protect an unused helper

**P2 · Remove · `lib/server/limits.test.ts:3`**

`runLimited` has no production caller; its only consumers are this test. The application calls `limitAssessment`, and durable idempotency/concurrency belongs to the assessment repository.

Remove the `runLimited` case and consider retiring its unused implementation separately. Keep the bounded-body reader test in the same file. The receiving contract already has stronger real-Postgres proof in `scripts/test-assessment-repository.ts` and `scripts/test-assessment-commit.ts`: identical replay, different-input conflict, competing operations, lost acknowledgment, and no duplicate evaluation.

### F06 Transport privacy assertions describe a retired protocol

**P2 · Repair · `lib/assessment/transport.test.ts:6`; `lib/assessment/conversation.test.ts:54`**

`serverSnapshot` has only test consumers. The `requestSchema` parsed by the transport test is used by browser fixture helpers, not the HTTP submission route. The current route parses `submitSchema`, receives an operation and revision/request identifiers, and loads state on the server. Private stored snapshots can contain rejected interaction history under the current persistence contract.

Keep `restoreLocalInteraction` coverage for rejected text, draft restoration, language, and retry deduplication, plus the 25-reply conversation case. Remove only the `serverSnapshot` assertions and the claim that this legacy serializer establishes current server transport privacy. Assert the current submission allowlist through `submitSchema` and/or a client-request test. Keep projection-input and public/report serializer tests for their separate privacy boundaries.

### F07 Exhaustive translation enumeration has selective and vacuous assertions

**P2 · Repair · `lib/content/l10n.test.ts:30`**

The title promises every visible string, but the test checks selected prompt keys, a finding count, and `.every()` review flags on filtered arrays. Empty reask arrays pass. Resource fields, complete prompt/recovery keys, finding identities, and complete rubric level identities are not independently enumerated here.

Use one small release/rubric fixture containing every supported participant-visible field and assert its exact key/source/review triples. Keep the real committed-content validator: its extra-entry checks can catch omission of existing translated keys. Because that validator uses the same source enumerator, it cannot independently establish that a newly supported visible field was included in the first place.

### F08 Several normalization and retention cases check size instead of identity

**P2 · Repair · Five cases**

| Location | Weak proof | Required value assertion |
| --- | --- | --- |
| `lib/auth/urls.test.ts:41` | Optional and duplicate branch hosts each produce length 1 | Exact surviving deployment origin |
| `lib/content/loader.test.ts:103` | OpenAI/GPT-4 matches have length 2; one topic result merely ends in a year | Exact intended reference IDs, matched flags, and order where contractual |
| `lib/content/l10n.test.ts:82` | Scoped findings have one key | Exact requested finding ID |
| `lib/journeys/store.test.ts:84` | Concurrent partial saves produce two journeys | Both distinct saved persona records and source provenance |
| `lib/personas/mentions.test.ts:28` | First mention produces three parts | Exact text and correct linked slug, followed by the already asserted unlinked second mention |

Keep these tests. Their other assertions are useful. Existing neighboring exact-value cases provide complementary coverage but do not prove these particular inputs and branches.

## Consolidation and maintenance findings

### F09 One sample mean does not prove uniformity

**P3 · Repair · `lib/benchmark/metrics.test.ts:58`**

Seed 7 is sampled 1,000 times and checked for reproducibility, bounds, and a mean near 0.5. A stream concentrated around 0.5 can pass all three checks, so the title's uniformity claim exceeds the proof.

Keep deterministic seeds and exact bounds. Use a known-good generator sequence for algorithm correctness, or justified distribution bounds across representative fixed seeds if distribution is the intended contract. Otherwise narrow the title to the demonstrated invariants. Retain the independent bootstrap/scoring checks; this finding does not establish that the generator or benchmark is wrong.

### F10 Font claims and repeated PNG checks need clearer responsibilities

**P3 · Repair and combine · `lib/sharing/png-export.test.ts:51`; `tests/browser/i18n-locales.spec.ts:56`**

The native test says Hindi/Japanese cards render with registered fonts, but asserts only status and PNG dimensions. The browser case repeats a Hindi share-card PNG signature and checks a Japanese profile image. Neither assertion proves readable glyphs, shaping, or selection of the expected font. The coverage-manifest test is useful, but does not inspect the actual font binary's glyph coverage.

Retain a native renderer smoke test and cheap font registration/catalog checks. Narrow claims to PNG generation unless direct font/glyph evidence is added. Consolidate repeated share-card byte checks into `png-export.test.ts`, preserving one actual HTTP test of locale plumbing and the distinct Japanese profile endpoint. Keep the documented visual review of hi/th/zh/ja cards for legibility; do not replace that judgment with PNG metadata or add a large snapshot matrix merely to raise test counts.

### F11 Shared contracts have duplicate homes

**P3 · Combine · Two cases**

`lib/blog/blog.test.ts:513` directly renders a generic card and checks only PNG dimensions. The route response at line 471 already proves a real card is decodable at those dimensions. Fold any deliberate title/meta input into the retained route/render case, while preserving missing-slug/translation policy and the separate title-fit/long-word cases. The direct case's “each post” title also exceeds its single generic input.

`lib/p-doom/hub.test.ts:196` tests the generic `segments` parser, already owned by `lib/sources/citations.test.ts:19`. Move its adjacent/repeated-marker input into that shared parser case, then remove the duplicate home. Keep the hub's cross-section first-citation ordering and authored-source completeness checks; those protect different composition behavior.

### F12 Repeated paperclip journeys can share their common recovery proof

**P3 · Combine · `tests/browser/assessment.spec.ts:292`**

This case scripts `recordDisposition` through `mockEvaluation`, then repeats non-answer recovery, dismissal, reload, and exhaustion already exercised by `tests/browser/paperclips.spec.ts:5` through actual local phrases. Its mocked call count is not independent evidence of a production evaluation cap.

Use `paperclips.spec.ts` as the receiving browser owner for common dismissal/reload/exhaustion behavior. Preserve the distinction between evaluated semantic non-answers and local navigation/test phrases: retain a focused semantic-result UI case if needed, and keep real engine counter tests. Keep `interaction.spec.ts:138` for tab-conflict counter preservation, its reduced-motion keyboard case, and the clock-controlled animation/Escape test in `paperclips.spec.ts`; those are distinct failure paths. Do not delete the semantic path solely because the screens look similar.

### F13 Some scheduling checks still rely on wall time

**P3 · Repair · `tests/prefetch/personas.spec.ts:64`, `:235`, `:263`; `lib/server/upstream-fetch.test.ts:147`**

The prefetch cases use 300–500ms sleeps to infer quiet or settled request state. The upstream-body case measures a real 300ms deadline against an elapsed-time threshold of 1,500ms. These tests protect useful boundaries, but unrelated scheduling load can affect their results. No runtime flakiness was measured here.

Use controlled intent timers for negative prefetch windows, plus observable response/route completion for settlement and cache reuse. Preserve the actual Next integration and explain any bounded quiet window that cannot be controlled without changing the claim. For the upstream case, drive the diagnostic timer explicitly while retaining the real stream and caller-response assertions. Do not loosen budgets to obtain a pass.

### F14 The cohort curation test should assert featured identities

**P3 · Repair · `lib/journeys/persona-identity.test.ts:28`**

Keep the documented Independent 100 identity/alias rules, the three selected additions, and source requirements. The final global count of 47 featured people is a poor proxy for preservation: offsetting feature changes can retain the total, and legitimate unrelated additions touch a dated cohort test.

If the global selection is intentionally fixed, assert the intended featured identities from the accepted curation reference. Otherwise scope the selection expectation to the cohort and verify preservation of the original featured identities separately. Do not remove the curated identity/provenance test or its meaningful cohort count just because it contains literals.

### F15 One browser case bundles many independent inspector contracts

**P3 · Repair · `tests/browser/debug.spec.ts:78`**

The case spans more than 400 lines and covers exchange separation, schema folds, sorting, syntax, tooltips, copying, scrolling, layout, navigation, theme, and locale behavior. An early failure prevents unrelated later assertions from running, and diagnosis requires locating one failure inside a broad scenario.

Split it into a few focused browser cases using the same controlled fixture. Keep rendered folding, clipboard, focus/layout, and navigation proofs. The detailed sort matrix already has a pure owner in `lib/debug/answer-order.test.ts`; the browser can retain representative ordering and unchanged displayed JSON. This is a diagnosis/maintenance improvement, not a reason to discard the browser coverage. Measure setup cost before selecting the final split.

### F16 Small retained-scaffolding and assertion repairs

**P3 · Repair · Three cases**

- `lib/sharing/assessment-card-parity.test.ts:34`: keep the real native pixel comparison, route statuses, and headers. Remove the unconditional fixed-name `/tmp/unified-assessment-*.png` writes, or make them explicit opt-in diagnostics. No assertion consumes those files.
- `lib/landing/portrait-entrance.test.ts:12`: the final-transform regex permits any pair of rotation angles, so it does not establish “flat.” Assert that the rotations cancel or inspect the final net transform, preserving the exact landing position, opacity, and sharpness checks.
- `i18n/config.test.ts:85`: the loop appends pt/zh/hi/th/ja even though they are already in `locales`. Iterate enabled locales once; preserve canonical tags and the exact URL/endonym contracts.

## Coverage worth retaining

The nine native database/process checks earn their higher setup cost. They cover actual PostgreSQL constraints and transactions, driver acknowledgment loss, claim rollback, concurrent spend/feedback, immutable simulations, publication/fork lifecycle, and restart recovery after killing a real server. Mocked SQL stores or pure helpers cannot establish those contracts. Provider HTTP is mocked in the relevant scripts while repository, auth, evaluator, SDK, and database paths remain real.

Keep production cache/prefetch and trace checks. An unreachable database proves that pregenerated routes do not silently fall back to runtime reads; publication tests prove immediate revocation of warmed HTML/RSC/images. Real build traces prove packaging of fonts, portraits, translated releases, and blog files. Source-only unit checks cannot replace this evidence.

Keep the analytics SDK transport checks and exact privacy canaries. They verify emitted payloads beyond the pure event allowlist. Likewise, native PNG parity, font registration, committed artwork decoding, real CSS compilation, and approval-artifact integrity protect different boundaries despite running under Vitest.

Keep focused schema/runtime-input tests. Their rejection behavior goes beyond TypeScript guarantees. Keep independent numeric worked examples, exact source/provenance preservation, pinned historical versions, distinct locale scripts, both responsive breakpoint sides, and controlled provider retry/request-budget matrices. A boolean, count, mock, literal, or overlapping layer is not by itself evidence that a test should go.

The English P(doom) reference parser is an explicit known-good regression reference, which the guidance permits. Replacing it with literal golden rows could reduce duplicate parser upkeep, but it is not an automatic removal candidate. The current native-rendering checks are inexpensive enough that runtime alone does not justify a broad purge.

## Applying the audit

Start with F01–F08. Repair or transfer one contract at a time, falsify the strengthened assertion, and compare old assertions with the receiving suite before deletion. Retire test-only hooks only after verifying consumers again. Update the legacy-storage architecture note when that adapter is retired.

For F09–F16, retain the unique platform or authored-data proof while narrowing claims and consolidating ownership. Run the affected native/browser/database checks whenever their fixtures or assertions change, even though they are outside routine CI. The audit's source review and passing core suite do not substitute for those checks after implementation.

## Implementation checkpoint

All F01–F16 findings are addressed. The inventory below remains a record of the audited base, rather than a generated snapshot to update after every test edit.

| Finding | Completed change and surviving proof |
| --- | --- |
| F01 | Small authored question graph checks exact forward/backward transitions, wildcard routing, root exclusion, shared targets and positive novelty, plus empty/missing selections. Corpus direction checks remain. |
| F02–F04 | `lib/assessment/schema.test.ts` owns actual historical-result parsing/defaults, the exact answer bound, v1 evidence migration and draft/version/result preservation. Current client draft storage owns the over-limit round trip and prompt/assessment isolation. Removed the unused whole-assessment adapter and its adapter-only tests. |
| F03 | Invalid candidate input now includes a successful independent verification judgment and a valid-candidate control, so it reaches the missing-ID guard. Renamed the existing case to unverified selection: choice-probability concentration is not the production acceptance contract. |
| F04 | Historical paperclip normalization recognizes the raw `paused` status before status decoding. Tests preserve later semantic `recovery` states for both algorithm 0.6.0 and 0.7.5. Current transient effects retain their behavior. |
| F05 | Removed the unused in-memory request helper/test; bounded-body handling remains. Real repository and COMMIT checks retain durable replay, conflict, rollback and lost-acknowledgement coverage. |
| F06 | Removed the unused snapshot serializer. Current submission schema rejects client-supplied state, draft and rejected history; interaction restoration and exact retention of 25 replies remain. Projection/public/report privacy checks remain. |
| F07–F08 | Exact translation key/source/review triples, optional resource fields, reference identities and topic ordering in a small dated fixture, surviving auth origins, finding IDs, saved journey records/provenance and mention fragments replace selective/count assertions. |
| F09 | Seeded-generator claim now states reproducibility, seed dependence and bounds; removed the unsupported single-mean uniformity claim. Independent bootstrap/scoring checks remain. |
| F10 | Native renderer checks claim PNG generation. Actual HTTP compares fixed identical card inputs under English/Hindi locales and retains the distinct Japanese profile PNG endpoint. Font registration/catalog checks and visual review remain separate evidence. |
| F11 | Generic citation edge input moved verbatim to its shared owner. Removed the redundant direct blog PNG case; actual route decoding, translation/missing-post policy and title fit remain. Its renderer is now private to its module. |
| F12 | Semantic non-answer UI case asserts evaluated attempt flags and actual saved recovery/exhaustion state. Common dismissal/reload/exhaustion proof stays in `paperclips.spec.ts`; real engine and tab-conflict cases remain. |
| F13 | Prefetch negative windows use a paused browser clock; positive warming awaits the complete actual RSC response and retains click-time cache reuse. The real diagnostic stream is driven to 299/300 ms and preserves the caller body. |
| F14 | Cohort identity/provenance rules remain. A separate homepage curation case asserts the exact accepted featured identities instead of their global count. |
| F15 | Three focused debug cases share one fixture: folds/copy/syntax; sorting/help/layout/theme; stored operation history/navigation. All original rendered assertions remain. |
| F16 | Removed unconditional PNG artifact writes, proved the final portrait rotations cancel, and iterated enabled locales once. |

Independent coverage comparison found no unresolved losses. It caught a normalization rule that would have rewritten legitimate semantic recovery; the final decoder preserves the raw historical-status distinction. The reviewer independently passed 51 cases across seven files.

Nine temporary mutations were detected for the intended assertions: graph modes removed; historical results requiring experiments; horizon migration removed; nonexistent selections falling back to real evidence; a visible translation field omitted; legacy pause normalization removed; normalization wrongly applied to current recovery; the diagnostic deadline shortened; and final portrait rotations failing to cancel. Each production source was restored byte for byte afterward. The probes and rendering helpers are disposable and are absent from the retained suite.

Validation on the repaired branch based on `0b9895e9`:

- `pnpm test`: 747 cases across 122 files, plus formatting, lint, Next type generation, TypeScript, content validation and unused-code checks. The final core run passed; Vitest took 7.78 seconds.
- `pnpm check:browser tests/browser/debug.spec.ts tests/browser/assessment.spec.ts tests/browser/paperclips.spec.ts tests/browser/i18n-locales.spec.ts`: all 28 distinct cases passed. Two cases were rerun with isolated output after a concurrent runner removed their trace directory; the historical-version and semantic recovery cases passed again against the final decoder. This was an artifact collision, not a relaxed assertion or retry policy.
- `pnpm build:local`: compiled and validated 214 pregenerated profiles, two cached public assessments, route traces, card fonts/portraits, locale routing and admin exclusion.
- `pnpm check:prefetch tests/prefetch/personas.spec.ts`: all six cases passed against the final build with an unreachable database, including the two built public shares; no conditional skip.
- `pnpm db:migrate:test` twice, `pnpm db:test`, `pnpm db:test:repository`, `pnpm db:test:commit`, and `pnpm db:test:lifecycle`: passed against native `doom_bloom_test`, including real durable retries and COMMIT acknowledgement loss.
- Visual inspection: native hi/th/zh/ja cards had visible glyphs without clipping or replacement boxes; debug field help and mobile dark layout were inspected. This is a visual rendering check, not native-speaker approval of translations.

The original monolithic debug scenario took 12.5 seconds. Its three focused replacements took 2.04, 3.64 and 5.12 seconds (10.8 seconds combined) in the affected browser run. These local observations show the split did not introduce material setup cost; they are not a performance budget.

Verification used synthetic provider/OAuth settings and copied existing immutable local persona records into ignored worktree data. The shared Portless proxy advertised HTTPS but its TLS handshake failed; checks used separate local HTTP proxies through `PORTLESS_STATE_DIR`, `PORTLESS_PORT` and `PORTLESS_HTTPS=0`, with isolated trace output for reruns. No shared proxy settings, paid inference, production migrations, deployment or production data changed.

## Complete suite inventory

The following table is a file-level index. The linked case ledger supplies the individual assertions, parameter rows, receiving owners, and dispositions. Mixed decisions apply only to the cited cases; other cases in those files remain retained.

| Suite | Declarations | Expanded cases | Decision | Findings |
| --- | --: | --: | --- | --- |
| `i18n/config.test.ts` | 7 | 7 | keep, repair | F16 |
| `i18n/messages.test.ts` | 3 | 20 | keep | — |
| `i18n/next-routes.test.ts` | 8 | 8 | keep | — |
| `lib/about/methodology.test.ts` | 6 | 6 | keep | — |
| `lib/admin/access.test.ts` | 4 | 4 | keep | — |
| `lib/admin/guard.test.ts` | 2 | 2 | keep | — |
| `lib/admin/launcher.test.ts` | 1 | 1 | keep | — |
| `lib/analytics/events.test.ts` | 7 | 7 | keep | — |
| `lib/assessment/conversation.test.ts` | 2 | 2 | keep, repair | F06 |
| `lib/assessment/display-text.test.ts` | 7 | 7 | keep | — |
| `lib/assessment/facets.test.ts` | 3 | 3 | keep | — |
| `lib/assessment/local-reply.test.ts` | 1 | 1 | keep | — |
| `lib/assessment/map-ladder.test.ts` | 4 | 4 | keep | — |
| `lib/assessment/pdoom.test.ts` | 5 | 53 | keep | — |
| `lib/assessment/persona-matches.test.ts` | 7 | 7 | keep | — |
| `lib/assessment/present-result.test.ts` | 7 | 7 | keep | — |
| `lib/assessment/presentation.test.ts` | 5 | 5 | keep | — |
| `lib/assessment/projections.test.ts` | 9 | 9 | keep | — |
| `lib/assessment/readiness.test.ts` | 6 | 6 | keep | — |
| `lib/assessment/routing.test.ts` | 9 | 9 | keep | — |
| `lib/assessment/self-placement.test.ts` | 3 | 3 | keep | — |
| `lib/assessment/state.test.ts` | 7 | 7 | keep | — |
| `lib/assessment/tension.test.ts` | 1 | 1 | keep | — |
| `lib/assessment/transport.test.ts` | 2 | 2 | repair, keep | F06 |
| `lib/assessment/worldview-experiment.test.ts` | 20 | 26 | keep, repair, combine | F03, F02 |
| `lib/assessments/client.test.ts` | 5 | 8 | keep | — |
| `lib/assessments/feedback.test.ts` | 7 | 7 | keep | — |
| `lib/assessments/operation-failure.test.ts` | 4 | 8 | keep | — |
| `lib/attribution/first-touch.test.ts` | 11 | 11 | keep | — |
| `lib/auth/route-logging.test.ts` | 2 | 2 | keep | — |
| `lib/auth/urls.test.ts` | 5 | 9 | keep, repair | F08 |
| `lib/authoring/bookmark-title-card.test.ts` | 1 | 1 | keep | — |
| `lib/authoring/preview-images.test.ts` | 5 | 5 | keep | — |
| `lib/benchmark/feedback-audit.test.ts` | 4 | 4 | keep | — |
| `lib/benchmark/interview.test.ts` | 4 | 4 | keep | — |
| `lib/benchmark/metrics.test.ts` | 7 | 7 | keep, repair | F09 |
| `lib/benchmark/references.test.ts` | 6 | 6 | keep | — |
| `lib/benchmark/run.test.ts` | 2 | 2 | keep | — |
| `lib/benchmark/score.test.ts` | 5 | 5 | keep | — |
| `lib/benchmark/shown.test.ts` | 1 | 1 | keep | — |
| `lib/blog/blog.test.ts` | 22 | 22 | keep, combine | F11 |
| `lib/blog/citations.test.ts` | 5 | 5 | keep | — |
| `lib/blog/footer-posts.test.ts` | 2 | 2 | keep | — |
| `lib/blog/research-charts.test.ts` | 19 | 19 | keep | — |
| `lib/blog/statement-charts.test.ts` | 6 | 6 | keep | — |
| `lib/content/l10n.test.ts` | 3 | 3 | repair, keep | F07, F08 |
| `lib/content/loader.test.ts` | 4 | 4 | keep, repair | F08 |
| `lib/content/release.test.ts` | 1 | 1 | keep | — |
| `lib/db/config.test.ts` | 3 | 10 | keep | — |
| `lib/db/pool-logging.test.ts` | 2 | 2 | keep | — |
| `lib/debug/answer-order.test.ts` | 4 | 4 | keep | — |
| `lib/debug/json-help.test.ts` | 3 | 3 | keep | — |
| `lib/debug/local-access.test.ts` | 2 | 2 | keep | — |
| `lib/debug/relationships.test.ts` | 2 | 2 | repair, keep | F01 |
| `lib/debug/styles.test.ts` | 1 | 1 | keep | — |
| `lib/docs/contract-rules.test.ts` | 4 | 4 | keep | — |
| `lib/evaluation/budget.test.ts` | 5 | 5 | keep | — |
| `lib/journeys/catalog.test.ts` | 3 | 3 | keep | — |
| `lib/journeys/experiments.test.ts` | 1 | 1 | keep | — |
| `lib/journeys/failure.test.ts` | 1 | 1 | keep | — |
| `lib/journeys/fixed.test.ts` | 2 | 2 | keep | — |
| `lib/journeys/mechanical/runner.test.ts` | 12 | 23 | keep | — |
| `lib/journeys/merge.test.ts` | 1 | 1 | keep | — |
| `lib/journeys/participant.test.ts` | 7 | 7 | keep | — |
| `lib/journeys/persona-assessment.test.ts` | 1 | 1 | keep | — |
| `lib/journeys/persona-identity.test.ts` | 3 | 3 | keep, repair | F14 |
| `lib/journeys/public-pdoom.test.ts` | 3 | 3 | keep | — |
| `lib/journeys/store.test.ts` | 3 | 3 | keep, repair | F08 |
| `lib/jsonl.test.ts` | 4 | 4 | keep | — |
| `lib/landing/portrait-entrance.test.ts` | 5 | 5 | repair, keep | F16 |
| `lib/landing/portrait-layout.test.ts` | 5 | 5 | keep | — |
| `lib/landing/prefetch-intent.test.ts` | 7 | 7 | keep | — |
| `lib/p-doom/hub.test.ts` | 15 | 15 | keep, combine | F11 |
| `lib/persistence/storage.test.ts` | 6 | 6 | remove, combine | F04 |
| `lib/personas/comparison-cache.test.ts` | 2 | 2 | keep | — |
| `lib/personas/directory-sort.test.ts` | 6 | 6 | keep | — |
| `lib/personas/mentions.test.ts` | 5 | 5 | keep, repair | F08 |
| `lib/personas/one-liner-rules.test.ts` | 4 | 4 | keep | — |
| `lib/personas/public-statements.test.ts` | 6 | 6 | keep | — |
| `lib/personas/usable-rows.test.ts` | 3 | 3 | keep | — |
| `lib/seo/ai-citations.test.ts` | 16 | 16 | keep | — |
| `lib/seo/indexnow.test.ts` | 5 | 5 | keep | — |
| `lib/seo/json-ld.test.ts` | 10 | 10 | keep | — |
| `lib/seo/person-identities.test.ts` | 2 | 2 | keep | — |
| `lib/seo/profile-titles.test.ts` | 12 | 12 | keep | — |
| `lib/seo/result-titles.test.ts` | 9 | 9 | keep | — |
| `lib/server/api-error-reporting.test.ts` | 4 | 4 | keep | — |
| `lib/server/correction.test.ts` | 4 | 7 | keep | — |
| `lib/server/dev-launcher.test.ts` | 1 | 1 | keep | — |
| `lib/server/diagnostic-context.test.ts` | 1 | 1 | keep | — |
| `lib/server/early-result.test.ts` | 9 | 14 | keep | — |
| `lib/server/engine-paths.test.ts` | 5 | 6 | keep | — |
| `lib/server/engine.test.ts` | 18 | 18 | keep | — |
| `lib/server/env.test.ts` | 3 | 3 | keep | — |
| `lib/server/error-reporting.test.ts` | 3 | 3 | keep | — |
| `lib/server/evidence-regression.test.ts` | 9 | 10 | keep | — |
| `lib/server/jev-budget-store.test.ts` | 6 | 7 | keep | — |
| `lib/server/jev-budget.test.ts` | 10 | 10 | keep | — |
| `lib/server/limits.test.ts` | 2 | 2 | remove, keep | F05 |
| `lib/server/live-provider.test.ts` | 20 | 20 | keep | — |
| `lib/server/projection-input.test.ts` | 3 | 3 | keep | — |
| `lib/server/request-country.test.ts` | 2 | 2 | keep | — |
| `lib/server/request-origin.test.ts` | 6 | 6 | keep | — |
| `lib/server/upstream-fetch.test.ts` | 6 | 6 | keep, repair | F13 |
| `lib/server/validate-env.test.ts` | 6 | 9 | keep | — |
| `lib/sharing/assessment-card-parity.test.ts` | 1 | 1 | repair | F16 |
| `lib/sharing/card-fonts.test.ts` | 4 | 4 | keep | — |
| `lib/sharing/compare.test.ts` | 8 | 8 | keep | — |
| `lib/sharing/png-export.test.ts` | 5 | 5 | keep, repair | F10 |
| `lib/sharing/public-card.test.ts` | 1 | 1 | keep | — |
| `lib/sharing/report.test.ts` | 2 | 2 | keep | — |
| `lib/sharing/resource-previews.test.ts` | 2 | 2 | keep | — |
| `lib/sharing/share-caption.test.ts` | 7 | 7 | keep | — |
| `lib/sharing/share-links.test.ts` | 3 | 3 | keep | — |
| `lib/sharing/site-social-card.test.ts` | 8 | 8 | keep | — |
| `lib/sharing/site-social-review.test.ts` | 6 | 9 | keep | — |
| `lib/sharing/social-card.test.ts` | 3 | 3 | keep | — |
| `lib/sharing/text-fit.test.ts` | 3 | 3 | keep | — |
| `lib/sharing/tweet-url.test.ts` | 1 | 1 | keep | — |
| `lib/sources/citations.test.ts` | 3 | 3 | keep | — |
| `tests/analytics/privacy.spec.ts` | 4 | 4 | keep | — |
| `tests/browser/admin.spec.ts` | 1 | 1 | keep | — |
| `tests/browser/assessment-start.spec.ts` | 1 | 1 | keep | — |
| `tests/browser/assessment.spec.ts` | 12 | 12 | keep, combine | F12 |
| `tests/browser/bookmarks.spec.ts` | 2 | 2 | keep | — |
| `tests/browser/breadcrumbs.spec.ts` | 1 | 1 | keep | — |
| `tests/browser/compare.spec.ts` | 2 | 2 | keep | — |
| `tests/browser/content-review.spec.ts` | 1 | 1 | keep | — |
| `tests/browser/conversation.spec.ts` | 3 | 3 | keep | — |
| `tests/browser/css-interactions.spec.ts` | 7 | 7 | keep | — |
| `tests/browser/debug.spec.ts` | 2 | 2 | keep, repair | F15 |
| `tests/browser/diagnostic-report.spec.ts` | 1 | 1 | keep | — |
| `tests/browser/early-result.spec.ts` | 1 | 1 | keep | — |
| `tests/browser/header-account.spec.ts` | 5 | 5 | keep | — |
| `tests/browser/i18n-assessment.spec.ts` | 3 | 3 | keep | — |
| `tests/browser/i18n-locales.spec.ts` | 2 | 10 | keep, combine | F10 |
| `tests/browser/i18n.spec.ts` | 6 | 6 | keep | — |
| `tests/browser/interaction.spec.ts` | 4 | 4 | keep | — |
| `tests/browser/jev-budget.spec.ts` | 2 | 3 | keep | — |
| `tests/browser/journeys.spec.ts` | 6 | 6 | keep | — |
| `tests/browser/landing.spec.ts` | 14 | 14 | keep | — |
| `tests/browser/map.spec.ts` | 2 | 4 | keep | — |
| `tests/browser/not-found.spec.ts` | 2 | 3 | keep | — |
| `tests/browser/paperclips.spec.ts` | 2 | 2 | keep | — |
| `tests/browser/persona-assessment.spec.ts` | 3 | 3 | keep | — |
| `tests/browser/result-feedback.spec.ts` | 2 | 2 | keep | — |
| `tests/browser/seo.spec.ts` | 11 | 11 | keep | — |
| `tests/browser/share-bar.spec.ts` | 2 | 2 | keep | — |
| `tests/browser/shortcuts.spec.ts` | 1 | 1 | keep | — |
| `tests/browser/tweet-sources.spec.ts` | 2 | 2 | keep | — |
| `tests/helpers/diagnostics.test.ts` | 2 | 2 | keep | — |
| `tests/persistence/auth.spec.ts` | 1 | 1 | keep | — |
| `tests/persistence/lazy-drafts.spec.ts` | 1 | 1 | keep | — |
| `tests/persistence/library.spec.ts` | 1 | 1 | keep | — |
| `tests/persistence/participant.spec.ts` | 4 | 4 | keep | — |
| `tests/persistence/personas.spec.ts` | 1 | 1 | keep | — |
| `tests/persistence/share-links.spec.ts` | 1 | 1 | keep | — |
| `tests/prefetch/locales.spec.ts` | 5 | 5 | keep | — |
| `tests/prefetch/personas.spec.ts` | 6 | 6 | keep, repair | F13 |
| `tests/prefetch/profile-portrait.spec.ts` | 1 | 2 | keep | — |
| `tests/public-cache/publication.spec.ts` | 1 | 1 | keep | — |
| `tests/public-cache/share-links.spec.ts` | 1 | 1 | keep | — |

## Nonroutine checks

| Entrypoint | Decision | Protected boundary |
| --- | --- | --- |
| `scripts/test-db.ts` | Keep | Auth/session isolation and expiry; immutable snapshots; owner retention; foreign keys; one active operation; cascades. Real pg driver and auth handlers, no fake SQL store. |
| `scripts/test-assessment-repository.ts` | Keep | First-create race; exact countries; owner hiding; idempotency/input conflict; active-operation exclusion; rollback; expired/late completion; deletion during inference; private error redaction. Evaluator is controlled, repository and SQL remain real. |
| `scripts/test-assessment-commit.ts` | Keep | Driver-boundary failures before/after actual COMMIT; saved acceptance loss; replay without duplicate evaluation; exact snapshot counts; deadline/retry recovery. |
| `scripts/test-assessment-lifecycle.ts` | Keep | Publication/frozen attribution; owner-only forks; independent lineage; 12/24/30 prompt ceilings; idempotency; revocation; source deletion; public allowlist. |
| `scripts/test-persona-persistence.ts` | Keep | Exact curated import and compact/full read parity; immutable provenance; failed/old/wrong-persona publication; generation input and completion fences; selected run ordering; metadata-only sync; frozen sources; expired generation. |
| `scripts/test-auth-claim.ts` | Keep | Real Better Auth handlers and SQL claim/merge with only X HTTP mocked; interrupted login; running operation handoff; username integrity; callback replay; rollback from real trigger fault; attribution merge; recovery after sign-out/expiry. |
| `scripts/test-assessment-restart.ts` | Keep | Fresh disposable native DB; repeat migration/seed; real POST blocked on a PostgreSQL advisory lock; kill actual server; verify no partial commit; restart and retry with original input. Unique protection beyond in-process repository probes. |
| `scripts/test-jev-budget.ts` | Keep | 200 concurrent SQL spends with exact tokens/cost; threshold signals; provider hold races; saved participant answer through real evaluator/SDK and mocked billing HTTP; blocked/recovered calls and recorded spend. Dedicated test DB reset is deliberate and suites run sequentially. |
| `scripts/test-assessment-feedback.ts` | Keep | Owner/revision checks; placed values computed from stored result; immutable first guess and racing writes; agreement upsert; database constraints; cascades; real auth/session route handlers with private cache/error responses. |
| `scripts/generate-mechanical-journeys.ts` | Keep | Credential-free real-engine runs compared with an explicit stored mechanical baseline via compareJourneys. Keep the baseline check for routing/state observations; it is not semantic model validation and writes only local generated artifacts. |
| `scripts/validate-content.ts` | Keep | Real committed bundle graphs/hashes, source-intake references, one-liners, public statements, supported translation files/messages, blog provenance/privacy/citations, and contract-doc placement. Full-input validation complements focused unit error fixtures. |
| `scripts/check-production-traces.mjs` | Keep | Actual Next artifacts: ISR/fallback, pregenerated pages and image bodies, runtime trace exclusion of fixtures, portrait/font/content/blog bundling, admin rewrite, and cookie-free static locale routing. This is a packaging contract; source mocks cannot replace it. |
