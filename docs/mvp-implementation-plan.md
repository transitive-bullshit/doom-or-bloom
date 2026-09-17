# Local MVP implementation plan

Status: implementation in progress; see checkboxes and checkpoint log for evidence. Prepared 2026-09-17 after reading all seven handoff documents and inspecting the repository and installed Next.js guides.

## 1. Outcome and source of truth

Build a locally runnable assessment at `/`: a restrained, centered page with a chronological question-and-answer thread and one active authored prompt/answer field. Use the browser's page scrollbar. Preserve previous submitted replies and make longer answers compact by default with exact-text disclosure. After three substantive answers, offer a useful, potentially provisional result. Most paths should take 6–8 prompts. Results expose the map, a richer fingerprint, evidence-supported findings, curated resources, correction, report download, and share-card download. Resume from local storage without an account.

The [handoff index](README.md) links the authoritative product, assessment, TypeSafe, authoring, measurement, and vocabulary contracts. This plan adds implementation choices; it does not silently replace their semantics. New user decisions take precedence and must be recorded here and in any affected canonical document.

Local scope includes the whole experience, real Jev integration, authored assets, and evaluation. Production deployment, Vercel configuration, domain setup, distributed rate limiting, accounts, databases, live news retrieval, and public assessment URLs are outside this plan. Optional sound and native file sharing can wait.

## 2. How implementation agents must use this plan

1. Read the relevant canonical docs before changing that area. Read the installed Next.js guide for the API being used, as required by root `AGENTS.md`.
2. Execute the numbered milestones in dependency order. Each task below uses `- [ ]`; change it to `- [x]` only when its stated outcome exists and its relevant checks pass. Keep incomplete and blocked tasks unchecked.
3. Update this file in the same checkpoint commit as the work. Add brief evidence, commands/results, deviations, and unresolved blockers to the checkpoint log. Partial completion must remain visible.
4. Commit at every passing milestone, and within a large milestone after coherent units such as a validated corpus batch or independently working module. Aim for reviewable commits rather than one final application dump. Stage explicit paths and inspect the staged diff; preserve unrelated work.
5. At each commit run formatting, linting, and the checks relevant to the changed code. Once the app scaffold exists, keep the existing `pnpm test` and `pnpm build` checks passing at integration checkpoints. Live API evaluation is separate from ordinary tests.
6. Human editorial review gates apply to assets and assessment semantics, not routine implementation. Continue independent engineering while review is pending. Record actual reviewer feedback; never self-label an agent draft as human-reviewed.

The repository currently has no commits and the supplied skeleton is untracked. At implementation start, inspect status again and make a clearly identified baseline commit of the supplied project files before feature work, excluding local artifacts and secrets. Do not reset or discard the supplied files. If the initial skeleton cannot yet pass tests/build because the app is absent, record that baseline exception and establish passing checks in milestone 1.

If multiple agents are assigned later, use the ownership boundaries in section 10. This plan does not require multiple agents.

## 3. Confirmed scope and editorial decisions

### Confirmed

- Use Next.js App Router, modern TypeScript, pnpm, oxfmt, oxlint, and the existing CI skeleton.
- Local development URLs use Portless. Start the app with `pnpm dev`, resolve its URL with `pnpm exec portless get doom-or-bloom`, and reuse the user's existing proxy configuration. Browser checks also use named routes; linked worktrees retain Portless's branch prefix.
- Use shadcn/ui for recurring controls and next-themes for light/dark mode. Preserve the existing neutral `new-york` configuration unless deliberately changed.
- Keep all issued questions and submitted replies in one page-scroll thread, including earlier recovery/navigation replies stored locally. Use bounded answer disclosures, one active composer and read-only previous turns. Do not add an internal transcript scrollbar or inference on disclosure actions.
- Include an explicit debug-mode boolean that reveals clearly labeled Jev and control-flow details in the local UI, without changing assessment behavior.
- Handle off-topic/nonsense replies as an expected recovery path, with bounded re-asks and a one-time paperclip interlude. Canonical dispositions and limits live in [ASSESSMENT.md](ASSESSMENT.md#answer-relevance-and-bounded-recovery); participant-facing behavior lives in [PRODUCT.md](PRODUCT.md#answer-recovery-and-paperclip-interlude).
- TypeSafe is the sole runtime inference API. Jev selects or evaluates authored options; code owns the workflow. Runtime participant-facing prose is authored text plus exact copied evidence.
- Start with **20–30 reviewed reference snapshots**, then incorporate every required source and achieve balanced reviewed topical coverage before declaring the documented MVP complete. The later source-library decision supersedes the original approximately 100/100/100 count target; follow [SOURCES.md](SOURCES.md). A working seed demo is an intermediate milestone.
- Keep deployment separate. Analytics can be implemented and verified locally without transmitting events or requiring analytics accounts.
- Current bounds: 12 lifetime prompts, warning at 10, at most two resolved references per answer and 16 physical inference attempts per operation across stages. Use fixtures for boundary checks; paid pressure testing is excluded. A future paid semantic suite requires reviewed examples and an explicit cost budget.
- The user supplied acceleration/slowdown argument maps and risk/concept tables. Follow [JOURNEYS.md](JOURNEYS.md) for opinion coverage and terminology, and [SOURCES.md](SOURCES.md) for current required-source intake. The expanded historical seed was returned for revision, not approved.

### Editorial review packet

Confirmed by the user: draft a representative batch first, review it with the user, then expand. Bring a concrete packet for review; independent engineering can continue while editorial feedback is pending.

The first packet should contain:

- The fixed root plus 10–12 example follow-ups spanning optimistic, pessimistic, mixed, uncertain, and low-transformation answers; include worked 3-answer and 6–8-prompt paths.
- Full rubric examples for causal clarity, grounded understanding, and an outlook component, showing what each category means and when evidence is insufficient.
- A proposed horizontal projection rule and vertical weights, illustrated on the same example profiles. Show how uncertainty, missing evidence, action posture, and continuity values affect the result.
- Six researched reference entries (two of each kind), two findings, and two resource recommendations with their eligibility rules.
- Expected interpretations and routing for the examples, including at least one correction and one misunderstood reference.
- Recovery examples, including nonsense versus relevant humor, ambiguous relevance, a successful retry, and the paperclip pause with its exit actions.

The key decisions are **which distinctions the assessment can express**, **what evidence justifies each judgment**, and **how those judgments become the map**. Numerical weights, exact prompt wording, confidence thresholds, and snapshot selections are authored assets still to be evaluated. Do not treat the handoff's closed product frontier as proof that these assets already exist or are validated.

The illustrative incident in `AUTHORING.md` is a schema example, not a sourced factual entry. Research every proposed reference independently; never import an example's `reviewed` status or factual claims.

## 4. Repository architecture

### Existing foundation

Inspected versions: Next.js 16.3.5, React 19.3.0, TypeScript 7, Tailwind 4, Zod 4, Vitest 5, and `takumi-js` 2.14.0. `package.json` declares Node >=24 and pnpm 11.24.0. Versions are observations, not instructions to upgrade; use the lockfile.

There is no `app/` or installed UI component source yet. `components.json` already points to `app/globals.css`, `components/ui`, and `lib/utils.ts`; the latter exports `cn` from the existing `cn` package. CI already installs with a frozen lockfile, runs `pnpm test`, and builds. Preserve this setup.

Proposed module layout:

```text
app/
  layout.tsx, page.tsx, globals.css
  about/page.tsx, privacy/page.tsx
  api/assessment/route.ts       # typed advance/project/clarify operations
  api/share-card/route.ts       # POST minimal display data -> PNG
components/
  assessment/                  # interview, progress, results, evidence, correction
  debug/                       # labeled, collapsible Jev/control-flow diagnostics
  ui/                          # shadcn-owned recurring primitives
lib/
  assessment/                  # schemas, reducer, ledger, coverage, routing, projections
  content/                     # asset schemas, validated loader, local retrieval
  server/                      # server-only Jev adapter, orchestration, limits, env
  persistence/                 # browser storage, migrations, conflicts
  analytics/                   # typed events, allowlist, disabled/real sinks
  sharing/                     # report serializer, card view model and renderer
content/
  releases/<content-version>/  # frozen prompts, references, findings, resources
  rubrics/<rubric-version>/    # criteria, thresholds, routing/projection configuration
  manifest.json                # compatible versions, hashes, model policy
eval/
  development/, holdout/       # reviewed conversations and expected behavior
scripts/                       # content validation and opt-in live evaluation
```

Use typed JSON for prompts, graph rules, findings, and resource metadata; Markdown with structured front matter for each reference snapshot. Validate both with Zod. Prefer a small bounded declarative condition vocabulary over a general rule engine or executable strings. Centralize IDs and validate references. A runtime bundle is a generated view of the canonical assets, not a second hand-maintained source.

### Client/server boundary and persistence

- Server Components provide page shells, metadata, About, and privacy. A focused Client Component owns assessment interaction, reducer state, local storage, and theme controls.
- Node-runtime Route Handlers own TypeSafe access and Takumi rendering. Mark server-only modules accordingly. Load only the client-safe prompt/result data needed for the current screen; keep the full corpus and rubric orchestration out of the client bundle.
- Use a single `POST /api/assessment` endpoint with a discriminated operation schema. Browser sends the versioned assessment snapshot, operation, assessment ID, revision, and request ID. Server validates the bounded snapshot, resolves authored prompt IDs, and returns a typed state update plus safe display data. It does not accept arbitrary client-supplied Jev questions, rubric text, model URLs, or content paths.
- The browser is the durable store. The server is stateless for assessment persistence; transient request deduplication and cost limiting can use bounded process memory. Validate all client-provided state and counters; this local architecture does not claim tamper-proof public scoring or durable exactly-once inference billing.
- Every response identifies its assessment ID, base revision, request ID, and versions. Commit an update only if they match the active local operation. Cancel and ignore stale work after restart or supersession.
- Persist draft text before submitting and the committed snapshot after success. Keep the last valid snapshot if storage or inference fails. Read storage after hydration; catch unavailable storage, corrupt JSON, quota failures, and incompatible schemas with recoverable UI.
- Keep one active assessment per browser. Detect newer revisions from another tab and reload or pause the older tab before submitting; avoid silent last-write-wins loss. Resume the same displayed prompt rather than allocating a new one on refresh.
- Store workflow schema version separately from the four semantic versions in the handoff. Preserve supported old bundles. If a pinned bundle/model is unavailable, allow viewing/export of the saved result and offer an explicit restart; never silently re-score it under newer rules.

### State and evidence contract

Define these contracts before splitting implementation work:

| Record | Minimum responsibility |
| --- | --- |
| Assessment | ID, revision, versions, status, issued prompts, answers, current draft, ledger, coverage, unresolved items, result revision, event markers |
| Prompt instance | Stable instance ID, authored prompt/variant ID, exact rendered text, source evidence IDs, lifetime ordinal, clarification target if any |
| Answer | Stable ID, prompt instance ID, original text, exact source spans, processing status, substantive judgment; explicit uncertainty may be substantive |
| Submission attempt | Stable ID, prompt instance/variant, disposition/distribution, successful-evaluation status, recovery ordinal; rejected text stays in local conversation history outside evidence and server transport |
| Recovery state | Per-prompt evaluated-attempt count, consecutive clear-miss count, active recovery/pause reason, remaining actions, persisted paperclip-shown marker |
| Evidence entry | Answer/span IDs, vector/claim ID, stated/implied/inferred/disputed status, horizon, assumptions, participant conviction, reference provenance, judgment IDs |
| Judgment | Rubric/question ID and version, primitive, options/levels, returned distribution/value, interpretation confidence when supplied, source evidence, model and usage metadata |
| Coverage | Per-vector assessed/unassessed/ambiguous status and supporting evidence; distinct from score and confidence |
| Result | Derived coordinates/ranges, assessed mask, fingerprint, central inferred claims, selected findings/resources, provisional/capped/completion status and provenance |
| Debug trace | Bounded operation/stage diagnostics, input evidence IDs, authored questions, normalized outputs, routing/projection breakdowns, timings and usage; separate from assessment evidence |

Keep raw answers immutable after commitment. A correction adds an answer and marks affected interpretations superseded or disputed; it does not erase the original evidence or treat both interpretations as independent corroboration. Allow draft editing and retry before commitment. General editing of historical answers is unnecessary for MVP; correction and restart cover that need.

### Budget semantics: proposed precise interpretation

Count **issued participant prompt instances**, including root and clarification, up to 12. Increment once when a new prompt is persisted for display. Rerender, refresh, double-click, API retry, and retrying a non-answer on that same prompt do not issue another instance. Keep submission attempts and API attempts in separate bounded counters. Empty input is rejected locally/server-side before inference; off-topic or navigational input cannot unlock results.

Implement the [canonical recovery policy](ASSESSMENT.md#answer-relevance-and-bounded-recovery) before ordinary routing. Persist its counters across refresh and use request deduplication to prevent double increments. Same-goal rephrasing retains the prompt instance and records the presentation variant; choosing a different authored question consumes another lifetime prompt. Only one accepted substantive answer per prompt instance counts toward result eligibility. Rejected attempts are excluded from profile evidence, result calculations, and exported report text by default; local debug may inspect the latest attempt under the existing trace rules. An explicit stop pauses without inventing a result or clearing progress.

At prompt 10 show the warning. Prompt 12 may still be answered; process it and finalize without issuing prompt 13. An eligible participant may stop before answering it. If the cap is reached with fewer than three substantive answers, show a capped insufficient-evidence result with unassessed regions rather than inventing coordinates or trapping the participant. Forced finalization forbids additional prompts, not retrying a failed projection request.

At three substantive answers, always unlock the result action independently of readiness. After 6–8 prompts, prominently offer results; low scores must never be a reason to keep interviewing. Clarification and voluntary continuation consume the same lifetime budget. If eligible candidates are exhausted, offer the available provisional result; before eligibility, use an authored general clarification fallback with the same budget controls.

## 5. Prompt topology, Jev stages, and authored scoring

### An adaptive graph, not a fixed three-question tree

The fixed root is the only universal question. Represent the remaining graph as a pool of authored nodes with explicit eligibility/transition rules. A node specifies the fields in `AUTHORING.md`, permitted source states/families, maximum uses, novelty group, and allowed evidence slots. Code first filters nodes, then ranks eligible candidates. A high-priority ambiguity can interrupt another branch; the participant does not become permanently assigned to an ideological path.

Start with roughly **30–40 authored prompt variants**, not 300 prompts. This is a planning estimate, not a locked quota. Cover every worldview and epistemic vector through the families below and add variants only when evaluations reveal a distinct need. A 12-prompt ceiling does not imply that everyone must consume 12 unique generic prompts; repetition controls and honest early completion matter more.

| Family | Elicitation goal and routing condition |
| --- | --- |
| Concretization | The root is vague or uses an undefined outcome; ask for one concrete scenario |
| Horizon/calibration | Timing or capability trajectory is missing; establish the participant's own horizon and later their conviction without imposing a date |
| Mechanism | A consequential expected outcome lacks a causal account |
| Grounding | A material claim invokes evidence whose identity, attribution, or fit is unclear |
| Control | Technical controllability would change the outlook and is unassessed |
| Governance | Institutional responses matter to the claim; keep action preference separate from expected impact |
| Upside/risk | A neglected side is consequential to this participant's account; not a mandatory opposing-view exercise |
| Transition/agency | Takeoff dynamics, warning time, distribution, or human continuity is a material unexamined assumption |
| Countercase/crux | Probe a serious alternative or what would change a consequential view |
| Clarification | Resolve a specific disputed inference or apparent tension, including changed assumptions or beliefs |
| Answer recovery | Handle an unusable/unclear submission before ordinary ranking; re-show authored guidance or pause, and use a deterministic alternative-question fallback when no usable evidence exists |

Prefer horizon calibration early when it is missing, while allowing material ambiguity to take priority. The three-answer promise cannot depend on answering a fixed horizon question. Track unknown timing/conviction explicitly when not yet elicited.

Illustrative authored continuation: “AI will probably cure diseases, but labs may race too quickly” could lead to a horizon prompt, a mechanism prompt, or an institutional-dependency prompt depending on what the answer already explains. Jev judges those gaps; the router selects an existing prompt. A risk-heavy answer is not automatically sent to an upside prompt.

### Staged inference contract

Distinguish **participant prompts** from **Jev questions**: one participant answer may need many narrow independent judgments. Track ordinary operation sizes and serial dependency depth locally; do not equate the three-answer promise with three API calls. Use conservative bounds and fixtures, without paid pressure tests.

| Stage | Code supplies | Jev evaluates | Code commits |
| --- | --- | --- | --- |
| A. Interpret | Current prompt/answer, relevant usable history, pre-segmented spans, context, alias candidates | Response disposition, substantiveness, expressed worldview distinctions, epistemic evidence, ambiguity, topic families, candidate reference identity | Gate recovery first; only usable answers contribute validated judgments/evidence |
| B. Resolve references, conditional | Shortlisted IDs/labels, then selected reviewed reference summaries and claim spans | Identity when topic widening was needed; attribution, evidentiary fit, uncertainty, materiality | Separate mentioned references from contextual retrieval; grounding evidence with provenance |
| C. Route | Updated evidence/coverage, eligible authored candidates, effort and novelty metadata | Independent candidate usefulness judgments | Weighted deterministic ranking, exclusions, stable tie-break, one next prompt |
| D. Project, on request | Complete raw evidence and ledger, selected reference context, labeled derived judgments, versions | Independent output-vector judgments against authored rubrics | Normalized projections, interpretation ranges, evidence-backed claims, findings and resource selection |

Stage B may need an identity-selection request before loading details; stage C depends on the updated evidence. Independent questions within a stage can run together, but no question can consume another answer from the same request. This follows TypeSafe's [batching model](https://docs.typesafe.ai/patterns/fan-out).

If stage A selects recovery, skip B–D for that attempt and discard any speculative profile judgments already returned. Code chooses authored re-ask/pause actions from the versioned recovery configuration, without another Jev call. Explicit requests to switch questions or view an eligible result may subsequently use prior usable evidence; rejected text never becomes their scoring context. The paperclip effect itself makes no inference request. Test that an existing result remains unchanged after nonsense, and that valid sarcastic or uncertain answers still enter the ordinary path.

Pre-segment answers into stable offset-backed spans. For claims and citations, Jev chooses candidate span IDs or authored claim categories, then code copies original text. Explicit dates/probabilities can use deterministic candidate extraction plus semantic selection, preserving units, event, and horizon. Ambiguous numerical language remains quoted evidence rather than an invented normalized forecast.

Multiple references can occur in one answer: use span-scoped identification or independent candidate-presence judgments instead of forcing the entire answer into one reference Choice. Bound candidates and resolved entries per turn; if coverage is incomplete, retain an unresolved-reference marker and offer clarification. Unknown references and uncited plain-language reasoning must not automatically lower epistemic quality.

For each judgment distinguish “is this evidenced?” from “where on the scale does this evidence fall?” Use a presence/status Choice with unsupported outcomes, and consume a parallel Score only on the supported branch. `not_expressed` is not the bottom rung of a quality scale. Model question IDs are application bookkeeping; include the full judgment meaning in instructions and criteria. [Choice guidance](https://docs.typesafe.ai/primitives/choice).

### Rubrics and map composition

Preserve all eight worldview vectors and seven epistemic vectors from `ASSESSMENT.md`. Several worldview vectors need subfields: “risk landscape” cannot be reduced to a single probability, and timing, conviction, and anticipated capability are different facts. The initial fingerprint emphasizes the five dimensions named in `PRODUCT.md`; unsupported dimensions remain visible as unassessed.

Author an explicit projection configuration before implementing coordinate math:

- **Horizontal:** candidate design for review is separate judgments of expected beneficial impact, expected adverse impact, and human agency/continuity implications. Define non-overlapping contributions, qualitative likelihood/severity/distribution semantics, signs, and weights using worked profiles. Controllability and institutional expectations provide causal context; action posture contributes no direct coordinate weight. Do not average unrelated worldview axes or equate the coordinate with `1 − P(doom)`. The exact horizontal formula is an editorial decision in milestone 2, not an already agreed formula.
- **Vertical:** candidate starting point is equal weights across the seven demonstrated-reasoning components, with an explicit mapping to the visible Epistemic Quality definition. Review whether causal clarity/scope/counterargument handling need grouping to avoid accidental overweighting. Vocabulary, name recognition, brevity, and ideological moderation contribute no quality bonus.
- **Unknowns:** exclude unsupported components from an observed-only point estimate and retain full possible contribution bounds for missing components. If the remaining evidence cannot support a meaningful coordinate, render that axis as unplaced with a range; never manufacture a midpoint. Coverage affects the range and provisional label, not the participant's demonstrated quality.
- **Ranges:** preserve categorical distributions. A proposed starting convention is the 10th–90th percentile range per supported component, expanded by missingness and material ambiguity, then propagated through the authored projection. Version and test the precise rule. Do not multiply correlated probabilities, shrink uncertainty just because the same claim is repeated, or label this a confidence interval. If a composite interval uses weighted endpoints, describe it as a display convention, not a calibrated probability bound.
- **Scales:** normalize ordered scores by their maximum index before composition; use self-contained behavioral descriptions for every level. A Score's probability-weighted value and distribution describe positions on the authored rubric. [Score reference](https://docs.typesafe.ai/primitives/score).
- **Confidence:** interpretation confidence, participant conviction, coverage, and readiness remain separate fields. Confidence is not a multiplier that pushes low-confidence answers toward low quality. [Confidence reference](https://docs.typesafe.ai/confidence).

Document selected formulas, readiness thresholds, routing weights, and worked examples next to the rubric assets. Keep them marked experimental until reviewed evaluation supports them. Final projection is requested when a participant opens/recomputes results; reuse a saved result for an unchanged evidence revision.

### Corpus and content release

Build a local alias/topic index from validated Markdown snapshots. Normalize aliases, retain collisions for disambiguation, and retrieve a small set of candidates; add topic-family widening for indirect references. Load only selected summaries into Jev state. No embedding service, vector database, runtime scraping, or live search is needed.

Each frozen release includes prompts, graph, findings, resources, references, provenance, review status, changelog, and content hashes. Rubrics/configuration have an independent version. Store requested and returned model identifiers with each inference and result. Preserve the underlying evidence across revisions.

Draft content can run in explicitly labeled local authoring mode. The normal reviewed bundle includes only reviewed assets. Release validation fails on unknown IDs, invalid transitions, missing sources, unreviewed entries, or broken evidence-slot contracts. The approximate 100/100/100 target is coverage work, not permission to pad the corpus with weakly sourced entries.

### Debug mode: make the control flow inspectable

Use one application boolean, `debugMode`, defaulting to false and initialized from `NEXT_PUBLIC_ASSESSMENT_DEBUG`. The local UI can expose a small toggle for this same boolean. When enabled, show a visible **Debug mode** indicator and a separate, collapsible **Jev / assessment debugging details** area beneath the normal prompt or result. Use shadcn disclosure/table primitives; keep the answer field primary.

Expose a bounded trace of the latest operation and the provenance already attached to the saved assessment:

- **Control flow:** operation ID/revision, stages executed or skipped and why, current prompt/variant, prompt/substantive/attempt counters, coverage changes, readiness and result-eligibility reasons.
- **Answer recovery:** disposition and confidence threshold, clear-miss streak, remaining attempts, paused/active state, paperclip eligibility, and discarded speculative judgments. Show observable decisions, not labels about participant intent.
- **Jev inputs and outputs:** authored question IDs, full instructions and criteria, primitive types, selected source spans, relevant state sent for that stage, returned options/scores/distributions, model IDs, and unsupported/unused speculative judgments. Label participant conviction, interpretation confidence, and coverage separately.
- **Reference resolution:** alias/topic candidates, selected references, mentioned-versus-contextual status, and any unresolved or excluded candidates.
- **Routing:** eligible and excluded prompt IDs with reasons, component benefits, weights, effort/repetition penalties, final priority and tie-break. For results, expose component contributions, missingness, and range calculation.
- **Operations:** per-stage elapsed time, request/response sizes, actual token usage, attempts/retries, and sanitized failures. Show unavailable measurements as unavailable; distinguish logical stages from physical requests and retries.

Capture diagnostics from the operations already being performed. Toggling the UI must not make extra Jev requests, recompute a result, change ranking, or add evidence. Debug responses use a typed allowlisted DTO, not raw SDK objects, headers, or errors. Show only state actually sent/returned and deterministic decisions; never suggest this is Jev's hidden reasoning.

Detailed input-state traces may contain the current participant's answers, so keep them transient in the local UI, bounded to the latest operation, and clear them on restart. Do not automatically send them to console logging, analytics, cards, report exports, or remote storage. The server may return expanded traces only when local debug support is enabled and the operation requests them. A request flag alone cannot enable server diagnostics. Existing saved judgments remain inspectable after reload, but expired transient traces need not be reconstructed. Tests must prove debug on/off preserves the same provider calls, decisions, and results, and never exposes credentials.

## 6. Local dependencies, credentials, and limits

### Dependencies

Add `@typesafe-ai/sdk`, `server-only`, `next-themes`, and only the shadcn primitives needed for the app. Add a front-matter parser and `posthog-js` when their milestones need them. Keep existing Zod, Vitest, Takumi, Vercel Analytics, and Tailwind. Add browser-test tooling only to cover the critical browser flows; avoid a general infrastructure rewrite.

Before adding shadcn components, run `pnpm dlx shadcn@latest info --json`, inspect the installed components, then retrieve current docs for the selected primitives. Buttons, textarea, form fields, alerts, dialogs, badges, and disclosure controls should use the existing configuration and official shadcn primitives. Do not reinitialize the project or replace its utility setup without a concrete compatibility need.

The verified JavaScript integration uses `@typesafe-ai/sdk`, `TypeSafeClient`, and `client.systemOne(...)`; the SDK reads `TYPESAFE_API_KEY`. Check the installed SDK's signatures before writing the adapter. [JavaScript SDK](https://docs.typesafe.ai/sdk/javascript).

The API is `POST https://api.typesafe.ai/v1/systemone`; requests contain `state`, `model`, and named `questions`, and responses contain `answers`, `model`, and `usage`. Validate response keys, primitive types, allowed categories, numeric bounds, and distribution normalization at the adapter boundary. [API reference](https://docs.typesafe.ai/api).

The model page currently lists `jev-1.13.0`. Prefer an explicit available version and record what the API actually returns; verify account access before pinning. A moving alias alone is insufficient reproducibility. [Model reference](https://docs.typesafe.ai/models). The documentation index did not load during planning; the directly linked SDK/API/primitive pages were available.

### Environment contract to implement

Commit a documented `.env.example`; keep real values in ignored `.env.local`. Except `TYPESAFE_API_KEY`, the names below are proposed application configuration, not assertions about SDK-required names.

| Variable | Local behavior |
| --- | --- |
| `TYPESAFE_API_KEY` | Only required external secret for real assessments; server-only, obtained from the TypeSafe console |
| `TYPESAFE_MODEL` | Explicit configured model passed by the adapter; initial verified candidate `jev-1.13.0` |
| `ASSESSMENT_PROVIDER` | `live` by default; explicit `fixture` for tests/local development, visibly labeled and restricted to test/development |
| `NEXT_PUBLIC_ASSESSMENT_DEBUG` | Default `false`; initializes the non-secret UI debug boolean and enables local server diagnostic support; parse strictly as a boolean |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | Default `false`; gate both analytics integrations |
| `NEXT_PUBLIC_POSTHOG_KEY` | Optional public project token when analytics is explicitly enabled |
| `NEXT_PUBLIC_POSTHOG_HOST` | Optional matching project ingestion host; no guessed region |
| `POSTHOG_IP_DISPOSAL_CONFIRMED` | Defaults false; set true only after configuring project-level discard of IP data before real PostHog collection |

No database URL, OpenAI key, embedding key, image-storage key, Vercel token, or authoring-model key is required to run the app. Header social links and optional tip URL can be ordinary site configuration; leave unknown links out until supplied. Use the local request origin for local links and a generic share URL from site configuration; do not put assessment data into URLs.

Instantiate/validate the live provider when used, so builds, static pages, and fixture tests run without secrets. Missing credentials produce a clear development setup error, never a fabricated result or silent fixture fallback. Offline evaluation scripts must load local environment explicitly (Next's `@next/env` is an available approach) and must not print secrets or answer text by default.

### Bounded local operation

Set explicit server-side limits for submitted answer length, total transcript size, request bytes, reference candidates, Jev questions per stage, concurrent operations, and inference attempts. Keep values in one tested config and verify them locally with fixtures, without paid pressure tests. The current answer submission cap is 20,000 characters, with conservative 12-prompt/24-reference bounds. Never apply an input `maxlength` or truncate dictation/paste: retain longer editable drafts and persist them intact. Display the counter and excess only above the cap, and disable Continue while over it. Do not infer on an over-limit draft or consume a recovery attempt. Return actionable size errors and preserve drafts when provider context is exceeded.

Include recovery attempts in storage, request-size, and inference-cost limits: rejected submissions still cost a stage-A evaluation, even though they add no scoring evidence. Keep prior rejected text client-local; send bounded counter/disposition metadata when validating subsequent operations. Rate limits apply across explicit resume/skip actions as well as normal submissions; neither a recovery button nor the Easter egg resets them.

Use bounded SDK retries for 429/529 with backoff, retry-after handling, cancellation, and an overall operation deadline; avoid multiplying SDK and application retry loops. Do not retry authentication/schema failures as transient failures. SDK request logs can include bodies at debug level, so configure sanitized logging explicitly. [SDK client source](https://github.com/typesafe-ai/typesafe-sdk-js/blob/v0.6.0/src/client.ts).

Use a bounded process-local limiter and in-flight/completed request cache for local development. Enforce limits before calling the provider; clear request content from the cache on expiry. Reusing a request ID with a different payload is an error. Process restart may still cause a repeated provider call, so never claim billing idempotency. Distributed enforcement is a later hosting concern.

Long transcripts are an early feasibility gate. Preserve all raw evidence locally and ensure the final projection can consider the complete evidence within verified limits. Do not silently truncate, substitute generated summaries, or treat prior derived scores as replacement evidence. If the proposed maximum cannot fit, revise input limits or design and review an evidence-preserving decomposition before shipping the flow.

## 7. Implementation milestones

### Milestone 1 — Local scaffold and domain contracts

Depends on: repository inspection. Commit: `chore: establish local assessment scaffold`.

- [x] Recheck repository status and establish the baseline commit described in section 2. Read installed Next.js installation, Server/Client Components, Route Handler, environment, and testing guides as relevant.
- [x] Add minimal App Router layout/page/styles, theme provider, and required shadcn primitives while preserving current aliases and `cn`. Verify installed component dependencies and generated source.
- [x] Define Zod/TypeScript schemas for the records in section 4, operation requests/responses, and content assets. Keep deterministic domain modules independent of Next.js and provider SDK types.
- [x] Implement the pure reducer and prompt/substantive/attempt counters with tests for refresh/retry, result eligibility, restart, clarification, and 10/12 boundaries.
- [x] Model bounded answer recovery and paused states using the canonical policy: same-prompt retries, explicit alternate prompts, accepted/ambiguous-answer streak resets, navigation, persisted one-time paperclip state, and cap precedence.
- [x] Add `.env.example`, lazy server-only env validation, and a provider interface with an explicit fixture implementation. A shell page and fixture tests run without credentials.
- [x] Define the debug boolean and typed trace contract, with a clearly marked collapsible UI shell. Debug state is separate from assessment evidence and analytics.
- [x] Establish passing `pnpm test` and `pnpm build`; verify generated Next types are included by the actual tsconfig. Record any necessary scaffold adjustments.

Done when: the local app boots, contracts and budget behavior are testable, and CI checks have a real passing baseline. Update checkboxes and commit.

### Milestone 2 — Representative assets and live feasibility

Depends on: milestone 1 contracts. Commit: `feat: define reviewed assessment content and Jev contract` (split draft/review/integration work if needed).

- [x] Draft the representative review packet from section 3 and label all assets as drafts. Include the horizontal formula, vertical weighting, missingness/range rule, substantive-answer rule, readiness rule, and deterministic routing tie-break.
- [x] Review paired examples of usable humor/uncertainty versus non-answers, authored recovery copy, and the paperclip interlude. Set and version the clear-non-answer confidence threshold from those examples, with ambiguous cases routed to neutral clarification.
- [x] Create content validation and a frozen manifest format. Validate ID uniqueness, references, graph reachability, root uniqueness, coverage targets, rule types, evidence slots, source metadata, and release review status.
- [x] Implement the live TypeSafe adapter behind the provider interface, with validated typed responses, version/usage capture, cancellation, bounded retries, and sanitized errors/logs.
- [x] With a locally configured key, run opt-in smoke cases for Choice, Score, Noul, source-span selection, unsupported evidence, and independent batching. Record requested/returned model IDs and installed SDK version.
- [x] Verify staged reference handling within conservative local bounds using fixtures. Do not pressure-test Jev or spend on synthetic maximum-context requests. Preserve prior measurements as historical evidence.
- [x] Review the packet with the user according to their chosen timing. Record accepted semantics and requested changes; implement them in the assets and tests before treating the bundle as reviewed. If review is pending, continue scaffold/UI/provider work using labeled fixtures.

Done when: an agreed representative content contract works with real Jev, operational limits are concrete, and unresolved semantic concerns are visible. A missing key blocks live evidence only, not unrelated implementation. Update checkboxes and commit.

### Milestone 3 — Seed content and offline content pipeline

Depends on: milestone 2 content contracts. Commit: `feat: add seed assessment assets and local reference retrieval`.

- [ ] Expand the seed to 20–30 sourced references across all three kinds, including direct/indirect/ambiguous aliases, differing interpretations, primary-source links, access dates, and documented review.
- [ ] Author the initial prompt graph, approximately 30–40 variants as needed, covering all vectors/families and novice/expert wording where diagnostically useful. Include neutral tension, non-answer, and disputed-inference fallback prompts.
- [ ] Add compatible same-goal recovery variants, exhausted-attempt copy, and deterministic alternate-question fallbacks; validate IDs and preserve the fixed root wording. Include recovery assets in the reviewed content release.
- [x] Author versioned rubric questions for each stage, projection components, and routing benefits, with explicit unsupported outcomes and narrow, complete criteria. Keep weights/thresholds in reviewed configuration.
- [ ] Author a small complete findings/resource library (planning target: 12–20 of each) with required evidence, exclusions, reading effort, learning purpose, and compatible conditions. No invented links or automatic opposing-view assignments.
- [x] Implement deterministic alias/topic indexing, candidate caps, collision handling, selected-entry loading, and a client-safe content view. Add fixture tests for indirect references, unknown references, and multiple references.
- [ ] Add development and held-out evaluation fixtures with expected vectors, source evidence, acceptable follow-ups, and false-error/tension cases. Holdout labels must receive human review and remain separate from tuning.

Done when: the validated seed bundle covers an end-to-end assessment without runtime prose generation; every factual entry has provenance and review status. Update checkboxes and commit.

### Milestone 4 — End-to-end assessment engine

Depends on: milestones 1–3. Commit: `feat: implement adaptive assessment and evidence ledger`.

- [x] Implement stages A–C, immutable answer/span storage, judgment provenance, reference materiality checks, coverage updates, and unresolved items. Track participant conviction and horizon separately from inference confidence.
- [x] Gate ordinary processing on response disposition. Short-circuit B–D for rejected/ambiguous attempts, discard speculative scores, preserve usable evidence, and render bounded re-asks/pause actions. Navigation and failed provider requests must not be mistaken for non-answer strikes.
- [x] Implement candidate eligibility, benefit composition, effort/repetition penalties, deterministic tie-breaking, and fallback behavior. Test that changing action posture alone does not force a Doom/Bloom branch or coordinate.
- [x] Implement the operation Route Handler with request validation, authored-content resolution, revision checks, transient deduplication, request/cost limits, and safe error responses. Set private assessment responses to `no-store` and keep evidence out of URLs/logs.
- [x] Instrument actual stages and render the debug panel's inputs, questions, judgments, reference candidates, routing breakdown, counters, timing, usage, and sanitized errors. Bound transient trace size and clear it on restart; debug mode causes no additional inference calls.
- [x] Implement browser persistence, draft survival, hydration, incompatible-version recovery, storage-unavailable behavior, and cross-tab conflict detection. Keep an old saved result viewable when recomputation is unavailable.
- [x] Wire the single-prompt interface with loading, retry, substantive-answer feedback, result unlock, continue, restart, and cap states. Use honest progress counts, not a percentage of understanding.
- [x] Implement the brief, dismissible paperclip background and recovery controls from `PRODUCT.md`, with static reduced-motion treatment, unobscured keyboard controls, no inference on dismiss, and no replay after reload. This participant-facing recovery works with debug off.
- [x] Verify one complete three-answer path and one adaptive 6–8-prompt path with fixtures, then smoke-test real Jev with synthetic inputs. Capture routing decisions without storing private participant text in general logs.

Done when: a participant can start, resume, continue, recover from failure, and reach a valid result request; repeat/stale requests cannot corrupt their assessment. Update checkboxes and commit.

### Milestone 5 — Projections, results, and corrections

Depends on: milestone 4 and reviewed projection rules. Commit: `feat: add evidence-backed results and clarification`.

- [x] Implement stage D and pure projection functions with normalization, missingness, ranges, assessed masks, and readiness/provisional metadata. Reuse an unchanged result instead of paying for another projection.
- [x] Extend debug details to projection contributions, range propagation, selected finding/resource conditions, and correction invalidation. Verify the trace explains the displayed result without inventing model reasoning.
- [x] Render the Doom–Bloom × Epistemic Quality map with accessible textual equivalents and compact interpretation ranges; show the five-part fingerprint and unassessed components. Avoid false precision and ideological labels.
- [x] Select a few findings and resources using authored conditions, disqualifiers, relevance, and diversity of learning purpose. Every displayed claim links to exact evidence and a versioned interpretation.
- [x] Add “That’s not quite my view” on central inferred claims. Select a claim, show an authored clarification, accept natural-language correction, supersede affected interpretations, and recompute. Disable new clarification at the lifetime cap.
- [x] Implement voluntary completion and continued exploration on the same assessment, with a new result revision when evidence changes. Cap finalization can still yield an insufficient-evidence result.
- [ ] Test coherent extreme views, weak moderate views, unknown dimensions, jargon/verbosity paraphrases, repeated evidence, changed assumptions, and corrections. Verify correction can change only implicated interpretations while dependent results are recomputed.

Done when: results can be traced to evidence and corrected without direct score editing, and uncertainty survives the entire path into the visible map. Update checkboxes and commit.

### Milestone 6 — Reports, sharing, and supporting pages

Depends on: milestone 5 result view model. Commit: `feat: add report exports and share cards`.

- [x] Build a readable Markdown full-report download, with optional structured JSON export from the same serializer. Include expanded profile, coverage/ranges, evidence, relevant typed judgments, versions, sources, and methodology. Exclude credentials, hidden reasoning, and raw transport dumps.
- [x] Inspect installed `takumi-js` docs/types and implement on-demand PNG rendering in the Node Route Handler. Use a minimal validated display payload, local assets/fonts, deterministic layout, and no persistent image storage.
- [x] Add separate “Download card” and “Post on X” actions. The latter only opens a web intent with safe authored summary/link; explain manual image attachment. No raw answers, assessment ID, or evidence payload enters the URL/card by default.
- [x] Add a generic social preview and About/methodology/privacy pages, including model/content versions, experimental status, framing bias, uncertainty semantics, local persistence, and actual TypeSafe data transmission. Do not claim answers never leave the device or assert unverified provider retention policies.
- [x] Add header GitHub/X/theme actions and footer links using verified project/user URLs. Keep the main page centered and concise; long methodology lives on About and in the report.
- [x] Visually verify mobile/desktop, both themes, keyboard flow, focus after prompt/result transitions, form labels, live loading/error announcements, reduced motion, map text alternatives, and downloaded image/report content.

Done when: the full local journey and downloads work without a hosted store, and public sharing exposes only the intended summary. Update checkboxes and commit.

### Milestone 7 — Privacy-preserving event instrumentation

Depends on: stable engine/result events. Commit: `feat: add explicit assessment event instrumentation`.

- [x] Implement every event in `MEASUREMENT.md` using a typed allowlisted payload and a disabled/local test sink by default. Derive emission from committed state transitions; avoid duplicate events on rerender, resume, retry, or repeated result display.
- [x] Verify recovery/pause/interlude events before the first substantive answer do not emit `assessment_started` or `assessment_completed`; same-prompt re-asks do not count as new routed questions. Keep rejection/recovery properties enumerated and exclude rejected text.
- [x] Emit `assessment_started` once, when the first substantive answer is confirmed; count unlock, cap, completion, correction, and restart at their defined transitions. Use the assessment ID for pseudonymous event linkage and rotate it on restart.
- [x] Implement optional PostHog and Vercel Analytics adapters behind the environment flag. Before enabling an adapter, check current official configuration docs. Disable replay, autocapture, heatmaps, person profiles, and automatic exception collection; strip URL queries/hashes and free-form properties.
- [x] Test captured outbound payloads with canary answer text, excerpts, clarification text, and query strings. None may escape into analytics, SDK error payloads, or share links. Verify the disabled default makes no analytics requests.
- [x] Verify debug on/off produces identical decisions and provider-call counts; trace fields never leak into analytics, reports, cards, logs, or unrelated assessments.
- [x] Record PostHog project-level IP-data disposal as a prerequisite for enabling real telemetry. No project/account provisioning or production enablement is required for this local milestone.

Done when: event behavior and payload privacy are verified locally, while live collection remains optional and disabled. Update checkboxes and commit.

### Milestone 8 — Full corpus, evaluation, and local MVP acceptance

Depends on: seed validated in the working experience; content expansion can overlap milestones 4–7 after the initial review.

- [ ] Incorporate every source marked required in source intake into researched, human-reviewed snapshots and achieve balanced topical coverage. Treat the former 100/100/100 target as a guide; record actual totals, overlaps, optional exclusions and required-source blockers. Commit each validated batch.
- [x] Attach scoped research notes to every required URL and draft a first contemporary reference batch outside the runtime bundle. Preserve partial/blocked access; this does not complete source incorporation or editorial review.
- [x] Preserve all five user-authored risk families and 69 safety concepts with linked-source provenance; draft 20 common-opinion development journeys.
- [ ] Human-review the journeys and terminology boundaries; add 6–8-prompt continuations, paraphrase pairs and scoped corrections. Keep expected impact, catastrophic risk, values, policy and reasoning separate.
- [ ] Complete human review and freeze the content/rubric release with hashes and a changelog. Draft assets and invented or unverified references cannot satisfy this milestone.
- [ ] Run deterministic regression and held-out live evaluation across the `TYPESAFE.md`/`MEASUREMENT.md` cases. Compare interpretation, evidence provenance, reference attribution, false factual errors/tensions, routing usefulness, and map stability across matched viewpoints/writing styles.
- [x] Before running holdout, record provisional numerical tolerances and adjudication rules for metrics that allow them (for example paraphrase coordinate drift). [evaluation-protocol.md](evaluation-protocol.md) defines these criteria. Evaluate without retuning on holdout; inspect and document subgroup failures. Do not claim validation based only on synthetic cases or agreeable results. The reviewed holdout and run remain open under the preceding task.
- [x] Verify 3-answer, 8-prompt, reference-heavy, correction and 12-prompt cap behavior with local fixtures. No paid stress requests. Keep dated measurements already collected; any future paid semantic evaluation must use a small reviewed suite with an explicit cost budget.
- [x] Add/run browser regressions for draft reload, three-answer results, clarification, restart during in-flight inference, two-tab conflicts, unavailable/corrupt storage, missing key, provider failure, card download, and forced cap. Fixture-mode browser tests must never call the live provider.
- [x] Add recovery regressions for first miss, two consecutive clear misses, exhausted attempts, repeated ambiguity without paperclips, recovery after pause, explicit skip, relevant humor/uncertainty, failed/duplicate requests, reload/cross-tab counters, and cap precedence. Assert bounded provider calls, unchanged prior scores, no eligibility gain from rejected attempts, and accessible effect dismissal. Local injected dispositions verify control flow; semantic rejection accuracy remains a reviewed-evaluation gate.
- [ ] Run `pnpm fix:format`, `pnpm fix:lint`, inspect changes, then `pnpm test` and `pnpm build`. Verify ordinary tests/build need no external credentials and do not make inference calls.
- [x] Write the root README with local setup, environment options, fixture/live behavior, content/evaluation commands, and recovery instructions.
- [ ] Add a final checkpoint entry with test/evaluation evidence and remaining limitations; commit the completed local MVP.

Done when: the entire local product contract works, the full reviewed corpus is present, live behavior has been evaluated, and no required checkboxes remain incomplete. Missing credentials, human review, or failed quality checks must be reported as outstanding work rather than counted as completion. Production deployment remains a separate task.

## 8. Verification priorities

Test behavior where errors would change a participant's interpretation or lose their work. Avoid tests that merely repeat static copy or component internals.

| Layer | Required evidence |
| --- | --- |
| Deterministic unit tests | Budget boundaries, recovery limits/streaks/cap precedence, eligibility vs readiness, score normalization, missingness, range propagation, candidate exclusions, reference collisions, stale revision rejection, correction provenance |
| Content validation | Complete schemas, valid IDs/edges, reachable families, supported evidence slots, source/review metadata, frozen release integrity |
| Provider contract tests | Choice/Score/Noul shapes, invalid distributions, missing/extra answers, timeout/retry/cancellation, unknown versions, no confidence field assumed for Noul |
| Integration tests | End-to-end staged dependencies, persistence/recovery, non-answer behavior, provisional results, cap/insufficient-evidence handling, output/event sanitization, debug parity and trace isolation |
| Browser verification | One-prompt flow, keyboard/mobile/themes, resume/restart/correction, downloads, readable ranges, no hydration errors |
| Opt-in live evaluation | Semantic accuracy and bias, false non-answer rejection on humor/uncertainty/writing styles, full-context feasibility, real latency/tokens, quality on held-out reviewed conversations |

CI should retain its current test/build entrypoints; integrate deterministic content validation through those scripts. Keep paid/networked evaluations behind an explicit command such as `pnpm eval:live`, with synthetic or explicitly consented inputs. Never add ordinary participants' answers to fixtures automatically.

## 9. Acceptance decisions still requiring evidence

These are concrete authoring/evaluation work, not reasons to reopen the agreed product concept:

| Item | Proposed direction | Resolve by |
| --- | --- | --- |
| Editorial review | Representative packet before expansion, confirmed by user; review the actual draft assets | Milestone 2 |
| Exact map formulas and thresholds | Separate impact judgments, explicit weights, missingness-aware ranges; worked profiles | Milestone 2 editorial packet |
| Recovery classifier and tone | Bounded recovery policy is specified; evaluate the clear-miss threshold and review re-ask/interlude copy | Milestone 2 editorial packet |
| Prompt-count interpretation | Issued instances, answer the 12th before forced finalization, retries separate | Milestones 1–2 examples/tests |
| Model and context limits | Available explicit version; preserve full evidence within measured limits | Milestone 2 live spike |
| Complete content selections | Revised recent seed, every required source, balanced reviewed coverage; source intake and argument journeys | Milestones 3 and 8 |
| Quality and latency acceptance | Predeclared tolerances, real measurements, inspect asymmetric failures | Before milestone 8 holdout run |

If a measured limitation forces a product change, show the failing case and propose a concrete alternative before changing canonical semantics. Continue independent tasks while that decision is pending.

## 10. Optional parallel implementation ownership

One agent can execute the whole plan. If the user assigns several, establish schemas and review the representative packet first, then divide work as follows:

| Owner | Files/responsibility | Dependencies |
| --- | --- | --- |
| Engine/integration | `lib/assessment`, `lib/server`, assessment route, provider tests | Shared schemas and reviewed rubrics |
| Content/evaluation | `content`, `eval`, content loader/validation scripts | Agreed schemas and review packet; separate corpus subdirectories if subdivided |
| Interface/exports | Assessment components, pages, persistence UI, `lib/sharing`, share-card route | Shared operation/result contracts; fixtures unblock initial UI |
| Integrator | Root config, dependencies/lockfile, analytics, browser tests, this plan | Coordinate changes from all owners |

Assign a single owner to shared schemas, dependency installation, and plan checkbox updates at a time. Workers report task IDs/files/checks; the integrator marks completion only after merged checks pass. Keep intermediate commits attributable and reviewable. Parallelism does not remove editorial review or live evaluation gates.

## 11. Checkpoint log

Append one entry per implementation checkpoint:

```text
Date / milestone / owner:
Completed checkbox items:
Files or content release:
Checks and results:
Editorial decisions or deviations:
Remaining blockers and next step:
Commit reference (record in the following checkpoint if needed):
```

Planning baseline: all seven handoff docs read; root agent pointers added; installed Next.js guides and current TypeSafe API/SDK references checked. The user confirmed seed-first/full-corpus MVP scope and representative editorial review before expansion, and requested an explicit debug mode for inspecting Jev/control flow. No app code, content assets, provider measurements, or implementation checks have been completed by this planning task.

Planning addition: expected off-topic/nonsense behavior now has a canonical bounded recovery policy, authored re-asks, and a one-time paperclip interlude with accessible exit actions. Product, assessment, TypeSafe, authoring, and measurement docs are aligned; implementation tasks remain unchecked.

### 2026-09-17 — Milestone 1 / Codex

- Baseline: `2986124` records supplied files, excluding ignored secrets/artifacts. The supplied app had no routes/tests, so baseline build/test checks were deferred to this scaffold.
- Added App Router/theme/shadcn scaffold, strict assessment/content/operation schemas, pure budget/recovery state transitions, explicit fixture provider, environment contract, and debug panel shell.
- Checks: formatting/lint/type/unit checks and production build pass. State tests cover unique substantive answers, recovery limits, one-time interlude marker, ambiguous replies, cap and stale responses.
- Dependencies: TypeSafe SDK 0.6.0 installed; core-js postinstall deliberately disabled (optional informational script), and missing shadcn cva/lucide imports explicitly installed.
- Live evidence: `eval/live-smoke.json` records a successful synthetic three-primitive request, pinned/returned `jev-1.13.0`, 437 input tokens, 1,006 ms, one attempt. This is API feasibility evidence, not assessment validation.
- Next: validate representative draft assets and bring the editorial packet for review; build the engine/UI independently while review is pending.

### 2026-09-17 — Engine and interface checkpoint / Codex

- Implemented staged interpretation/reference handling, authored candidate ranking with a 24-candidate/96-question ceiling, pure missingness-aware projections, bounded recovery, revisions, request deduplication/rate limits, and private response caching policy.
- Added draft persistence/resume, recoverable corrupt/unavailable storage, tab-conflict protection, result/evidence/correction UI, and a keyboard-accessible decorative paperclip interlude. Corrected answers supersede the selected vector’s evidence and trigger recomputation; other evidence remains intact.
- Retain latest routing/projection judgments rather than accumulating redundant passes. Local snapshot transport allows 8 MB; full 50-prompt provider-context feasibility remains unchecked and will be measured separately.
- Checks: 22 deterministic tests pass, content validation passes for the labeled six-entry draft, and production build passes. Browser and complete live-path verification remain outstanding.
- Editorial decision: Travis approved `editorial-review-packet.md` with “this looks good.” Expansion may proceed; future assets/holdout labels are not implicitly reviewed. PostHog environment values are supplied locally; instrumentation is next, with collection disabled by default.
- Previous checkpoint: `99ee468`. Next: live engine paths, supporting pages/downloads, explicit analytics, and researched seed expansion.

### 2026-09-17 — Supporting experience and analytics / Codex

- Added About/privacy, theme and verified social links, on-demand Takumi PNG cards, generic social preview, and explicit analytics derived from committed transitions. PostHog is dynamically loaded only when enabled and its IP-disposal prerequisite is confirmed; automatic collection, replay, profiles, and SDK enrichment are disabled/stripped.
- Checks: 27 tests, format/lint/types/content validation, and production build pass. Canary tests exclude text, excerpts, clarification, URL queries/hashes and SDK properties. Correction regression preserves unrelated ledger entries and supersedes the disputed vector before recomputation.
- Real Jev: `eval/live-engine.json` records a synthetic three-answer result, eight-prompt continuation, reference stages, correction, two-clear-miss paperclip pause, and accepted relevant humor. 35 physical requests total, 245,099 input/66,508 output tokens. This is development evidence, not held-out validation; pricing is not assumed.
- Browser: manually verified submitted answers, draft reload on the same prompt, three-answer result unlock, result focus, and dark theme. Generated 1200×630 PNG visually inspected. Full browser regressions and mobile acceptance remain outstanding.
- Previous checkpoint: `fbec59b`. Next: expand the sourced seed, richer fingerprint/source display, complete-context benchmarks, and browser regression coverage.

### 2026-09-17 — Seed candidate and resilience checkpoint / Codex

- Expanded the researched seed to 24 snapshots (8 each kind), the prompt pool to 34 variants, and findings/resources to 14 each. The original representative approval is recorded on its assets; additions remain drafts, listed in `seed-review-packet.md` for the requested human review. The expanded seed milestone remains unchecked until that review.
- Added first-class exact reference claims, expressed horizon/conviction/assumption context, familiarity gates independent of quality, explicit unknown-position guards, a separate catastrophic-risk fingerprint, source links, and a readable evidence/source report. Narrow Jev question templates now live in the rubric release.
- Content validation checks graph reachability, contradictory rules, coverage, template slots/types, provenance and every frozen asset hash. The freeze command refuses unreviewed assets; it has not been run to publish a draft.
- Browser regressions cover recovery, correction, report/PNG download, reload, tab conflicts, corrupt/unavailable storage, restart during requests, forced cap and lost-response request-ID reuse. Found and fixed Takumi’s native loader failing under Turbopack by keeping the package external.
- Client-only rejected interaction history is bounded to 20 entries and removed from transport; only the active submitted answer reaches interpretation. Uncertain network retries reuse identical payload/ID; definitive failures can be retried normally.
- Checks: final format/lint/types/content checks and 32 unit tests pass; production build passes; 7 isolated fixture browser regressions pass, including PNG download after the native-loader fix.
- Blocker: the synthetic 50 × 2,000-character projection plus 750 evidence entries and 200 reference claims gets HTTP 400 with a token-limit error. Lossless short IDs reduce request size from 702,808 to 327,496 bytes, but the case still fails. No transcript truncation or generated summary substitutes have been introduced. Context feasibility remains unchecked and must be resolved.
- Previous checkpoint: `fd86f4a`. Next: finish context-budget feasibility, human seed review, held-out fixtures and full-corpus expansion. PostHog values are supplied; collection stays off until its explicit privacy prerequisites are confirmed.

### 2026-09-17 — Conservative bounds and source-context checkpoint / Codex

- Travis stopped paid pressure testing. No live Jev calls were made after that instruction. Removed the pressure-test command/script. The former 50-prompt context acceptance requirement is superseded by 12 lifetime prompts, warning at 10, two resolved references per answer, and a shared 16-physical-request ceiling per operation. Assessment version is now `0.2.0`; older saved results are not silently re-scored.
- Added fixture checks for physical retry ceilings, shared stage budgets, cancellation/deadlines, one oversized-batch fallback and full raw-evidence/provenance preservation. Final projection sends full usable answers and relevant source summaries with lossless IDs, removing redundant bookkeeping.
- Findings require supporting evidence, threshold-compatible ranges and no unresolved implicated tension. Resources now rank relevance and diversify learning purposes. Familiarity remains independent of quality and expert wording is not demoted by a later generic answer.
- Actual SDK transport exposed a PostHog ingestion requirement: retain its configured public project identifier after sanitization. Intercepted dummy-endpoint checks now pass while excluding canary answers and query/referrer/session details. Real collection remains disabled; no real analytics events were sent.
- The expanded historical seed was returned for revision. Added source guidance with recency/genre/date boundaries and a reassessment inventory; all 114 required source URLs are preserved. The argument maps and complete structured tables add five risk families, 69 concepts and 247 distinct candidate URLs. Twenty draft development conversations cover common opinions, policy/risk inversions, uncertainty, criticism, humor and recovery. These are neither reviewed labels nor a blinded holdout.
- Checks: `pnpm test` passes 44 tests plus format/lint/types/content checks; `pnpm check:browser` passes seven fixture regressions; `pnpm check:analytics` passes two intercepted transport/missing-key regressions; `pnpm build` passes. Ordinary checks use no inference credentials or calls. Contemporary research notes and separate background drafts remain unreviewed.
- Previous checkpoint: `5dca9a5`. Next: finish required-source reading/access reconciliation, convert contemporary research into concise snapshots, revise recommendations, obtain editorial review, and build a separate reviewed semantic suite with an explicit small cost budget. Required corpus coverage, review, holdout and visual acceptance remain unchecked.

### 2026-09-17 — Contemporary source drafts and editorial checkpoint / Codex

- All 114 required source records link to scoped research notes; 96 are research drafts, 17 have partial access and the Reuters article remains blocked. Twenty-three required URLs map to existing or separate draft snapshots. Full reading, required-source incorporation and human review remain incomplete.
- Converted 18 contemporary reports/programs/scenarios/datasets into seven-section draft snapshots outside the runtime bundle. Historical expansion is paused; 36 earlier publication drafts remain separate optional background. No new asset has been marked human reviewed or frozen.
- Added `current-context-review-packet.md` for the revised recent seed direction, 20 common-opinion journeys and terminology boundaries. Editorial response is pending; the previous representative approval does not cover this batch.
- Content validation includes separate drafts, risk/concept terminology, journey prompt references and source-to-snapshot/research pointers. `pnpm test` passes format/lint/types, 44 unit tests and content validation: 34 prompts, 24 active references, 54 separate drafts, 14 findings/resources, five risk families, 69 concepts, 20 journeys and 361 intake records. Ordinary checks make no inference calls. Prior passing browser/build checks remain applicable because runtime behavior is unchanged.
- Previous checkpoint: `267b876`. Next: obtain editorial direction, resolve source access, re-curate current recommendations, and continue fixture/visual acceptance without paid pressure tests or real telemetry.

### 2026-09-17 — Scoped correction and interaction acceptance / Codex

- Correcting catastrophic risk now quotes that selected claim and preserves ordinary-harm evidence. Projection carries the explicit correction scope and selects catastrophe support from the usable correction onward. Assessment version is `0.2.1`; older snapshots are not silently re-scored.
- Added mobile light/dark screenshots and keyboard checks for prompt/result focus, form submission, dialog cancellation, expanded debug layout and reduced-motion paperclip dismissal. Inspected mobile/desktop result layouts. Recovery checks cover retained profiles, counters across reload/tab conflicts, exhausted retries, failed requests and lost-response deduplication. Export regression checks report contents as well as its filename.
- `pnpm test` passes 46 tests plus format/lint/types/content validation; 11 fixture browser checks pass. `pnpm build` passes.
- Travis approved the revised authoring direction and asked to prioritize an end-to-end demo before further reassessment. This authorizes demo expansion using labeled drafts, not individual factual/semantic review or a frozen release. Next: activate the contemporary demo bundle and current recommendations, then present the local experience.
- Previous checkpoint: `2682426`. Full required-source incorporation, individual review and held-out semantics remain open; no paid inference or real telemetry was used for this checkpoint.

### 2026-09-17 — Current end-to-end demo content / Codex

- Activated content `0.2.0-draft`: 18 contemporary snapshots plus 24 named actor/concept/historical references (42 total), 34 prompts, 14 findings and 14 current recommendations. Kept the prior bundle for provenance. The demo exceeds the initial seed planning count to retain named background; it does not satisfy full required-source incorporation or review.
- Contemporary snapshots remain drafts. The direction approval authorizes this demo; no new snapshot, recommendation or expected semantic label was marked reviewed or frozen. Topic retrieval favors known publication/event dates among equally relevant candidates, while explicit aliases retain priority. Entity access dates and undated hubs do not become publication dates.
- Recommendations combine eligible relevance, familiarity, authored curation priority and purpose diversity. Default eligible suggestions include current economic scenarios, independent investigation and operating guidance rather than historical task demonstrations. Findings and scoring formulas are unchanged.
- Economics access reconciliation preserves exact NBER blockers and accessible related primary versions: November 2025 work-pattern revision, June 2026 teamwork publication and March 2026 labor-market revision. Sample counts, causal designs and observation horizons are kept version-specific; full methods remain unreviewed.
- `pnpm test` passes format/lint/types, 46 unit tests and content validation (42 active references, 36 separate background drafts, 34 prompts, 14 findings/resources, five families, 69 concepts and 20 journeys). All 11 fixture browser regressions and `pnpm build` pass. Background drafts validate against their actual source release rather than being silently re-versioned. Previous checkpoint: `70d6a9c`. Next: present the local demo for experience feedback; full source incorporation, individual review and held-out evaluation remain open. No paid inference or real telemetry was used.

### 2026-09-17 — Development journeys and evaluation safeguards / Codex

- Kept the current live demo available at `http://127.0.0.1:3000` for experience feedback. Opening it makes no inference call; submitting an answer uses Jev. No programmatic live assessment was submitted.
- Expanded six draft conversations to 7–8 turns; added seven matched wording/conclusion/support variants and three corrections scoped to technical control, conditional policy and catastrophic risk. All remain draft development examples outside runtime scoring, rather than human-reviewed labels or a blinded holdout. Validation checks variant indices, duplicate IDs, correction targets and the lifetime limit.
- Both opt-in paid evaluation commands now require explicit paid authorization flags and a 1–24 physical-request ceiling across the entire run. A shared reservation covers batches, retries, concurrent stages and unknown failure costs. New run reports preserve historical measurements. No paid request was made to test these safeguards.
- Credential-free projection regressions verify equal reasoning scores for coherent extreme injected profiles, lower demonstrated reasoning for a weak moderate, independent policy/catastrophe judgments, and deduplicated evidence provenance. These do not validate Jev's semantic interpretation of the authored text.
- Follow-up research inspected current selected Anthropic/OpenAI/DeepMind cards and accessible economics methods. Preserved induced/simulated behavior, checkpoint and inherited-assessment limits, exact-original access blockers and study disclosures. The teamwork journal's 791 completers include 776 complete surveys; counts alone do not establish sample expansion.
- `pnpm test` passes format/lint/types, 53 unit tests and content validation. An isolated build without `.env.local` passes using the installed dependencies; the live demo remains reachable (HTTP 200). Current runtime assets remain 42 references, 34 prompts and 14 findings/resources; 36 background drafts remain separate. Previous checkpoint: `4e4470b`. Human review/freeze, full required-source incorporation and held-out semantics remain open.

### 2026-09-17 — Required perspective snapshot batch / Codex

- Authored 25 separate required-source drafts from the scoped essay/scenario research: 16 verified 2026 publication dates, eight older influential/conceptual sources and one undated scenario with an explicitly separate current changelog. Preserved conditional forecasts, first-person testimony, vendor/security observations, philosophical arguments and uncertain transfer limits. The blocked SAGE chapter and limited-preview Noah Smith essay remain unresolved rather than receiving invented summaries.
- Required-source mappings now cover 48 of 114 URLs across active or separate draft snapshots. The current demo remains 42 references; separate drafts total 61. No new asset is marked reviewed or activated, and no release was frozen.
- Formatting and content validation pass: all 25 new snapshots have seven required sections, valid source-release dependencies and existing related IDs; the complete intake and development context also validate. Runtime code and the previously passing isolated build are unchanged.
- Previous checkpoint: `274113f`. Full required-source incorporation, editorial review and held-out semantics remain open. No paid inference or real telemetry was used.

### 2026-09-17 — Named local development URLs / Codex

- [x] Applied Travis's Portless requirement to the running demo, `pnpm dev`, setup guidance and agent instructions. The main route is `doom-or-bloom.localhost`; its currently configured proxy URL is `http://doom-or-bloom.localhost:1355`. Reused the existing proxy and its other project routes.
- Stopped only the previously owned direct-port demo process and restarted with `pnpm dev`, debug enabled and analytics off. Portless assigns the upstream port automatically. The home page returns HTTP 200 with `X-Portless: 1`; opening it makes no Jev request. Saved browser progress remains tied to its original origin.
- [x] Browser and intercepted analytics configurations resolve `browser.doom-or-bloom` and `analytics.doom-or-bloom` through the installed `portless get` command, including protocol, proxy port and worktree prefix. Removed fixed test ports and origin assumptions; local test contexts support either configured HTTP or HTTPS. Graceful shutdown stops the detached Next child and releases the development lock.
- [x] Both assessment and share-card endpoints accept the exact browser-facing `PORTLESS_URL` supplied by the development process, preserving the origin guard through the proxy. Forwarded headers cannot choose an allowed origin; production ignores development proxy configuration. Five local regression tests cover these boundaries, and the full browser flow verifies both endpoints through Portless.
- `pnpm test` passes formatting/lint/types, 59 unit tests and content validation; 12 fixture browser regressions and two intercepted analytics checks pass. The isolated production build passes without `.env.local`. The main named demo was restarted and verified HTTP 200 after checks. Previous checkpoint: `778f6fd`. Required corpus review, freeze and held-out semantics remain open.

### 2026-09-17 — Preserve long dictated answers / Codex

- [x] Increased the shared submitted-answer limit from 2,000 to 20,000 characters. Removed the textarea's hard `maxlength`; dictated, pasted and typed input remains intact and editable above the submission limit.
- [x] Show a visible count and an accessible over-limit message with the amount to shorten. Disable Continue and guard form submission while over the limit, without consuming an inference request or recovery attempt. Let the long field grow in the page so the page scrollbar reaches the controls.
- [x] Removed the character bound from unsubmitted local drafts so they survive reload without truncation or an invalid-storage warning. Submitted answer, excerpt and interaction-history schemas retain the shared 20,000-character bound; unsubmitted drafts remain outside server/inference context.
- [x] Added browser coverage for native insertion beyond the limit, complete draft resume, blocked submission and an intact 20,000-character submission through the real fixture endpoint. Added storage/schema coverage for larger drafts and exact submitted-answer boundaries. Updated product, assessment, TypeSafe and setup guidance.
- Verification is shared with the named-URL checkpoint above. The demo uses live assessment mode with debug enabled and analytics off; checks used fixtures or a missing-key guard, with no paid Jev requests or real telemetry. Larger cumulative transcripts may still reach provider context limits; the existing bounded failure path preserves the draft without silently discarding evidence.

### 2026-09-17 — Writing affordances / Codex

- [x] Enabled buttons, including dialog close controls, use a pointer cursor through the shared base styles.
- [x] Hide the answer counter at or below 20,000 characters; show the count and shortening guidance only above the cap. Keep accessible descriptions aligned with visible help and preserve the existing full draft/submission behavior. Updated canonical guidance and the browser regression.
- Formatting/lint/types, 59 unit tests and content validation pass. A separate browser verified the live UI’s ordinary, over-limit and exact-boundary states plus enabled-button/dialog-close cursors with all API requests blocked. The running named demo stayed available. Previous checkpoint: `94c08ae`.

### 2026-09-17 — Conversation review and native page scrolling / Codex

- [x] Keep every issued question and submitted reply in a chronological thread with one active composer. Previous turns remain available above results and during corrections. Use shadcn Message/Bubble primitives with semantic question articles.
- [x] Show short replies fully and collapse longer replies to compact exact-text previews. Accessible disclosures reveal the complete answer in the page; opening or closing them performs no inference request. The conversation and expanded answers use native page scrolling without a separate transcript or answer viewport.
- [x] Retain local earlier recovery/navigation replies without arbitrary history eviction. Keep these replies and unsubmitted drafts outside server transport, evidence, scoring and report text. Reload preserves the complete conversation/draft while resetting disclosures closed; restart clears the thread.
- Formatting, lint and type checks, 61 unit tests, content validation, an isolated production build and all 13 credential-free fixture browser regressions pass. The new browser regression verifies document-height growth, absence of internal transcript scrollbars, full answer preservation, mobile width, reload and restart with all API calls blocked. The running Portless demo remained available throughout verification.
- Previous checkpoint: `477f2a4`. Full required-source incorporation, individual review/freeze and held-out semantic evaluation remain open. No paid inference or real telemetry was used.

### 2026-09-17 — Remove remaining nested content scrolling / Codex

- [x] Remove the active answer box's height cap and manual resize affordance so the existing content sizing grows it within the page. Expanded debugging details also grow in the page without a capped internal viewport.
- [x] Extend the conversation browser regression to verify long draft preservation, document-height growth, absence of answer-box overflow and absence of nested scroll areas with debugging details expanded on mobile.
- Formatting, lint, types and the isolated credential-free conversation browser regression pass. The current demo also reports a scrollable document with no nested content scroll areas. All assessment API calls were blocked during the regression; no Jev requests were made. Previous checkpoint: `428aada`.

### 2026-09-17 — Longer fixture paths and evaluation protocol / Codex

- [x] Add an eight-answer adaptive engine regression with 16 distinct grounded sources, a three-mention overflow, per-answer grounding limits and exact complete transcript/source-summary projection inputs. Add a sequential 12-answer regression that forces a final result and refuses further continuation before another provider call.
- [x] Record prospective numerical agreement/stability tolerances, evidence and scope gates, case blinding, human adjudication, subgroup reporting and retuning rules in [evaluation-protocol.md](evaluation-protocol.md). Current paid-evaluation authorization remains zero; a future small reviewed run needs an exact approved monetary/request budget.
- Formatting, lint, types, all 63 unit tests and complete content validation pass. Existing three-answer, correction and insufficient-cap regressions remain green. No live inference, real analytics collection, new asset approval or release activation occurred. Human-reviewed source incorporation, freeze and held-out semantic execution remain open. Previous checkpoint: `952d56e`.

### 2026-09-17 — Required measurement and disclosure drafts / Codex

- [x] Author 15 separate scoped drafts for required evaluation reports, quantitative dashboards, organizational disclosures and three developer hubs with pinned September cards. Preserve original hub URLs, publication/evidence windows, success-rate meanings, induced conditions, inherited assessments and unverified dates. These assets remain outside the current demo with no reviewer.
- [x] Map 12 additional required URLs: 60 of 114 required sources now have active or separate draft snapshots. Separate drafts total 76; runtime remains 42 references, 34 prompts and 14 findings/resources. No release was activated or frozen.
- [x] Add targeted primary workforce methods/version research for Stanford indicators, the August Canaries revision and a related Jagged Frontier journal version. Preserve descriptive versus causal estimands, percentage versus percentage-point distinctions, private sampling and the exact working-paper access blocker. Link each intake record to its precise research heading and scope.
- Formatting and complete content validation pass, including every new snapshot’s required sections, dependencies and source mapping. Runtime tests/build are unchanged by this corpus checkpoint; the preceding interface checkpoint also passed two intercepted dummy analytics checks. No paid inference or real telemetry was used.
- Previous checkpoint: `c4dabe3`. Next: continue remaining required-source authoring/access reconciliation alongside demo feedback. Individual editorial review/freeze and held-out semantic evaluation remain open.

### 2026-09-17 — Required workforce snapshot checkpoint / Codex

- [x] Author six separate workforce/measurement snapshots from targeted primary methods research, pinning accessible author/journal versions and original required links. Distinguish observational exposure from randomized treatment, assignment ITT from instrumented-use effects, hiring from earnings/hours, percentages from percentage points and recent publication from older model/evidence vintages.
- [x] Map six more required URLs: 66 of 114 now have active or separate draft mappings; separate drafts total 82. Four new mappings preserve partial access for the exact HBS/NBER originals. Runtime remains at 42 references, with no new individual review, activation or freeze.
- [x] Record a bounded follow-up for the SAGE chapter and Noah Smith essay. Neither access blocker changed; no unread argument was reconstructed or later source substituted.
- Formatting and complete content validation pass for all six snapshots, related IDs, original mappings, research headings and current release dependencies. Runtime is unchanged, and no inference or telemetry was used.
- Previous checkpoint: `d5088a6`. Continue remaining required-source drafts and keep access/review/held-out gates open.

### 2026-09-17 — Required conceptual snapshot checkpoint / Codex

- [x] Author 13 separate required conceptual/wiki/abstract/publisher-scope drafts, retaining different mechanisms, conditional assumptions and read limits. Keep historical arguments separate from contemporary model evidence; the paperclip interlude remains unrelated to assessment quality or participant intent.
- [x] Preserve unknown wiki origins, regional edition dates, deposit/revision history, subjective forecast vintages, marketing attribution and unread continuations. Reuse the existing Off-Switch identity rather than duplicate it; retain three partial-access statuses.
- [x] Required mappings now total 79 of 114 URLs, with 95 separate draft snapshots. Runtime remains 42 references; no individual approval, activation or freeze was introduced.
- Formatting and complete content validation pass for all 13 snapshots, source mappings, related IDs, required sections and release dependencies. Runtime code is unchanged. No paid inference or real telemetry was used.
- Previous checkpoint: `350bdcf`. Continue the remaining required sources; human review, access reconciliation and held-out semantic validation remain open.

### 2026-09-17 — Required governance and source-attribution drafts / Codex

- [x] Author 11 separate governance/control/scenario drafts, pinning the scoped abstracts, indexes, descriptions and targeted RSP v3.4 PDF. Preserve publication versus input dates, unassigned scenario probabilities, conditional policy provisions, procedure versus outcome review and two exact-artifact access limits.
- [x] Author all nine supplied social/video references as scoped publications. Retain verified roots/edits/quotes and selected official caption segments while excluding unreviewed threads, images and video portions. Do not turn forecasts, retellings, commercial assertions or captions into independently verified incidents/evaluations.
- [x] Required mappings now total 99 of 114 URLs, with 115 separate draft snapshots. Runtime remains at 42 references; no individual approval, activation or freeze occurred.
- Formatting and complete content validation pass for all 20 snapshots, required sections, related IDs, mapped originals, exact research headings and release dependencies. Runtime is unchanged; no paid inference or real telemetry was used.
- Previous checkpoint: `9eeff87`. Continue remaining perspective/discovery sources and preserve access, editorial and held-out gates.

### 2026-09-17 — Required perspectives and discovery checkpoint / Codex

- [x] Author 12 separate scoped perspective/discovery snapshots, preserving adoption versus capability, historical conditional theory, publisher/interviewee attribution, named examples, century-scale horizons and four partial-access statuses. Reuse the existing Learned Optimization and Concrete Problems identities.
- [x] Refine subject tags on this batch and the governance/social drafts so energy, science, human agency, cyber, forecasts and conceptual mechanisms reflect actual subject matter. These tags do not assign ideological scoring priors.
- [x] Reconcile already mapped researched sources to intake `draft` status while retaining every partial/blocked status. Required mappings now total 111 of 114 URLs, with 127 separate draft snapshots and the unchanged 42-reference demo. No asset was individually approved, activated or frozen.
- [x] Record the three unmapped requirements explicitly: Reuters article, unread SAGE chapter and preview-only Noah Smith essay. Fifteen other partial-access records have scoped mappings, rather than cleared access gates.
- Formatting and complete content validation pass for the 12 new drafts and refined metadata, including source mappings, related IDs, seven sections and release compatibility. Runtime is unchanged. No paid inference or real telemetry was used.
- Previous checkpoint: `556f646`. Next: audit corpus coverage/remaining access and prepare review/evaluation deliverables while retaining all required-source and human-review gates.
