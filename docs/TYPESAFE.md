# TypeSafe / Jev Composition Specification

> [PERSISTENCE.md](PERSISTENCE.md#synchronous-execution-and-idempotency) defines server-authoritative snapshots and synchronous atomic operations. This document defines Jev’s semantic role; application code owns idempotency, budgets, recovery and atomic commits. Start in `lib/server/engine.ts` for orchestration, `lib/server/live-provider.ts` for SDK calls, and `lib/assessment/` for deterministic state and scoring.

## Runtime assessments and persona excerpts

End-user assessments use complete answers and whole-answer support only. They do not generate excerpt pools, select or verify passages, or issue quoted tension-pair clarifications. Since algorithm `0.7.0` they do extract a percentage the participant typed: when the transcript contains percentage tokens, projection selects one and a dependent pass verifies it (Noul ≥ 0.75), exactly as in persona mode. Since `0.7.2` that includes a bare answer such as “30%”: the minimum sentence length applies to excerpts only. Before it, 40 of the 45 production results with such an answer showed an inferred value instead ([engine design review](research/engine-design-review-2026-09-29.md#typed-numbers-were-being-dropped)). The server defaults to runtime mode; only the pre-built persona runner opts into excerpt processing. Existing historical records remain readable.

See [PRODUCT.md](PRODUCT.md#results) for the participant presentation and [ASSESSMENT.md](ASSESSMENT.md#corrections-and-clarification) for retained claim-specific correction semantics. Excerpt and quote-verification behavior below applies only to personas.

## Role and boundaries

Jev performs narrow semantic judgments over participant evidence and authored definitions. It returns Choice, Score and Noul outputs, distributions and interpretation confidence. Code owns state transitions, calculations, eligibility, routing, persistence, versioning and rendering. Jev does not write participant questions, generate result prose or expose hidden reasoning.

Live responses are validated strictly. The one tolerance: a Score value may differ from its distribution’s expected level by up to 0.35 because of rounding. Code then uses the expected level, rather than failing the operation.

Independent questions in a batch cannot consume one another’s outputs. Later stages receive earlier results only through code. Question IDs are application bookkeeping: supply the actual dimension meaning in instructions/criteria or named shared state. Never equate a category probability with the participant’s event probability, or interpretation confidence with forecast correctness.

## Current local workflow — algorithm 0.7.4

### Participant language

Since algorithm `0.7.4`, every stage's shared state carries one neutral line when the interview runs outside English: `participantLanguage`, for example “The participant is using the interview in Spanish; answers may be written in any language. Judge meaning, not fluency or language.” The language comes from the locale submitted with the reply, else the latest saved reply's. Prompts, choices, rubric definitions and question instructions stay canonical English, and answers are passed as written, never machine-translated. English interviews, persona runs and replies saved before `0.7.4` add nothing, so their inputs are unchanged. Each accepted answer and each rejected reply records its `displayLocale` for provenance ([INTERNATIONALIZATION.md](INTERNATIONALIZATION.md#jev-and-the-participants-language)). There is no per-language gating or probe; accuracy analysis by language waits for real data.

### A. Interpret the reply

Supply the current authored prompt and complete submitted reply once, prior usable answers, unresolved scopes with their source-answer IDs, and the correction target. Runtime evaluates 20 independent base judgments; personas add tension existence and location for 22: disposition, reading familiarity, 15 dimension-presence classifications, horizon presence, explicitly unknown horizon, participant-conviction presence, tension existence and tension location. Add one resolution judgment for each dimension with an unresolved ambiguity or tension, up to 35 runtime judgments (37 for personas). Missing evidence and demonstrated low-quality reasoning are distinct.

Every dimension question includes its human-readable label and its full authored meaning. Worldview describes expectations/values/policy; reasoning describes the supplied explanation. Missing evidence is not a low score. Presence of an explicit unknown does not establish a directional position. Familiarity is a wording/resource signal, not quality.

Consume disposition first. Only usable replies contribute evidence. Ambiguous or clearly irrelevant replies enter the bounded recovery policy in [ASSESSMENT.md](ASSESSMENT.md#answer-relevance-and-bounded-recovery); discard speculative profile judgments for them. Never judge sincerity. Exact standalone `test`, `test again`, `paperclips`, `show me paperclips` and `show paperclips` use the documented deterministic recovery/interlude policy without Jev calls. Rejected replies remain in persisted interaction history, excluded from scoring inputs.

### Update support and readiness in code

Preserve complete prompts/replies once and attach whole-answer support by dimension ID. Persona-only tension clarification may select two exact source excerpts; code verifies and quotes them without generated prose. Timing/conviction flags record presence; actual forecasts and assumptions remain in raw answers.

Compute [readiness](ASSESSMENT.md#question-budget-and-readiness) in code from the latest routing or result judgments of the displayed map outputs, without another Jev request. A first answer that places the outlook and scale unlocks results on request; automatic results wait for four accepted answers. Reply count alone cannot unlock results. Readiness never changes a reasoning score.

### C. Route follow-ups

Code enumerates eligible authored candidates. Shared `dimensionDefinitions` maps each target ID to its label and meaning. Supply the usable transcript once, continuous evidence support, unresolved issues, familiarity, horizon/conviction gaps and each candidate’s text, targets and intended distinction. The same batch also judges the map outputs: expressed outlook (`facet:outlook_orientation`), transformation and the P(doom) band. It uses the result’s own question definitions, so readiness and direct map questions follow what the participant will see. It also judges `overall_outlook` and the central basis. These five fixed questions share the 96-question budget, and the candidate shortlist leaves room for them.

Jev independently judges coverage gain, projection usefulness, consequential novelty and whether the intended distinction remains unanswered. It judges ambiguity/tension benefit only for matching unresolved issues. Code combines authored weights, effort/repetition penalties and a stable ID tie-break. Effective novelty is the lower of the novelty Noul and the probability of an unasked/partial gap; the threshold is 0.6 with positive utility for every candidate. Before ranking, code asks the core map questions at most once each: `impact.overall` when the balance is missing, then `transformation.ultimate` and `risk.chance`, then one split-outlook question when the outlook judgment is split between neighboring levels. Triggered prompts are never ranked, and the split question needs no extra Jev request because routing already judges the outlook. Show results automatically when the map is placed, at least four answers are accepted, and no worthwhile candidate or uninvestigated issue remains. Explicit Continue still explores. Jev never invents a question. See [current routing details](ASSESSMENT.md#current-elicitation-experiment).

### D. Results on demand or automatic routing completion

Supply the complete accepted transcript once, active whole-answer support, dimension definitions, correction scopes, coverage, unresolved issues and versions. Prior interpretations are not independent evidence. Independently judge dimension status/score, worldview direction, catastrophic risk, scoped facets (expressed outlook, overall expected impact, capability ceiling, development pace, deployment policy and access policy), and central basis. Routing evaluates only the map outputs, overall expected impact and central basis; it does not construct the full result. Result generation runs on explicit request, automatic routing completion, or the prompt cap. At the cap, every assessment with a substantive answer gets the full projection, and it is insufficient only when both map coordinates cannot be placed. Debug mode does not generate extra results. The map uses the separate expressed-outlook facet (`outlook_orientation`), rather than a benefit/harm average or net-impact forecast.

Consume scores only on supported branches. Explicit unknowns remain unplaced. Code normalizes authored scales, calculates the map and interpretation ranges, chooses conservative authored findings and curated resources, and retains whole-answer provenance. Reuse a result when its evidence revision is unchanged, including historical results with their original version.

### Experimental worldview views — `worldview-v8`

Runtime projection adds four judgments: human influence, transformation (eventual magnitude, whenever it arrives), inferred P(doom) likelihood band and evidence basis. When the transcript contains percentage tokens, it also selects and verifies a stated P(doom). Persona mode additionally selects supporting excerpts, milestone timing and assumptions/update conditions from bounded exact passages. Jev selects authored categories or candidates; it writes no new result prose. Missing or ambiguous evidence remains unplaced.

Only persona mode runs the dependent evidence pass for reasoning excerpts and experimental quote verification. Each experimental quote requires at least 0.75 verification support. Quote verification does not gate whole-interview axes or inferred P(doom); whole-answer provenance remains available. Choice confidence compares competing quotes and is not a claim-validity threshold. Milestone checks require the specific milestone, rather than assigning generic societal timing to AGI or superintelligence. Historical experiment versions remain readable. The builders in `lib/assessment/worldview-experiment.ts` define the current questions and version; [ASSESSMENT.md](ASSESSMENT.md#pdoom-estimator--worldview-v8) defines P(doom) composition.

Store these results in optional `result.experiment` with its own version, model, timestamp and evidence revision. The same transformation and P(doom) band questions drive map-centric readiness during routing. Historical reasoning scores are never reinterpreted; display-only upgrades of saved results are described in [ASSESSMENT.md](ASSESSMENT.md#presentation-of-saved-results). Exact quotes are presentation evidence; the existing dimension ledger retains whole-answer provenance.

### Runtime corpus grounding is paused

The user paused identification and canonical-summary grounding for the local demo. No B1/B2 requests, reference-topic judgment, source summaries or reference claims enter new inference. Legacy reference flags do not affect new routing, readiness, findings or resource ranking; newly calculated results have no grounding-source list. Do not claim external fact-checking. Grounded understanding now assesses the connection between a claim and the basis the participant offers, not independent source accuracy.

Keep corpus assets, source provenance, curated reading recommendations and `/corpus` for offline authoring/review. Old saved reference checks and debug exchanges remain readable as historical records. This does not authorize renewed grounding calls or erase the unfinished corpus review gates.

## Debugging

Physical exchanges require server and operation capture enabled. The participant client requests capture independently of its Debug visibility toggle. Browser IndexedDB stores traces separately from server-authoritative progress; failed operations may return safe stage diagnostics without committing an assessment revision. Preserve actual recorded evaluator questions and payloads rather than explaining historical judgments with today’s rubric. [Local debugging](local-debugging.md) defines trace retention, inspection, downloads and sanitized server diagnostics.

New operations use the current assessment algorithm from `lib/assessment/schema.ts` (`0.7.4`); content, rubric and model versions remain pinned to the assessment. Preserve historical payloads and reuse cached results when their evidence revision is unchanged. Storage schema, algorithm and experiment versions are separate compatibility boundaries.

## Failure bounds and paid evaluation

Bounds: 12 initial participant prompts; forks add up to 12 with an absolute inherited ceiling of 30 and warning two prompts before the current ceiling; 20,000 characters per submitted reply; 96 independent questions per stage; 32 physical requests per operation including retries. Large-input interpretation can require five batches and routing twelve; the operation ceiling must accommodate interpretation, optional result generation, optional tension-selection and routing requests plus bounded retry capacity. A regression exercises the actual SDK batching with mocked transport and full multibyte history. Drafts retain all text; over-limit guidance blocks submission without truncation. The input counter appears only above the limit.

All stages share a 120-second operation deadline; stages have a 45-second deadline and physical attempts 15 seconds. Large inputs use eight-question batches with complete participant evidence. Batches are planned before evaluation. A context overflow fails the operation without recursive splitting. Each transient physical call has at most one retry; permanent errors fail immediately. Preserve drafts, validate responses, retry transient failures with bounded backoff, reject stale responses and keep credentials server-side. The cumulative transcript may still exceed provider context; never silently discard evidence.

Use credential-free fixtures for workflow/boundary checks. No paid pressure testing. Optional evaluation commands require `--allow-paid --max-requests=N` (1–24), with a shared physical-request allowance, reserved before stages and retained when failed-call cost is unknown. These flags do not replace agreement on a small reviewed suite and cost budget.

## Spend budget

TypeSafe is prepaid with auto-recharge and has no monthly cap, so the app enforces its own ceiling on participant Jev spend (`lib/server/jev-budget.ts` for the rules, `lib/server/jev-budget-store.ts` for Postgres).

- **Budgets.** `JEV_MONTHLY_BUDGET_USD` (default 150) per UTC month and `JEV_DAILY_BUDGET_USD` (default 50) per UTC day. Raising one is a deliberate environment change plus a redeploy; nothing raises it at runtime. `0` pauses participant Jev calls. A malformed value, such as `$300`, keeps the default and logs `jev_budget_config_invalid` once per instance rather than failing startup.
- **Estimated spend.** The API reports token usage, not cost. Each successful request's `usage.input_tokens` is priced at $42 per billion input tokens; output is free ([models](https://docs.typesafe.ai/models), checked October 2, 2026; update `jevNanoUsdPerToken` when pricing changes). A request that fails without a response, such as a timeout, adds nothing because its cost is unknown, so the estimate can run slightly low. When an operation ends, successful or not, its usage is added to the UTC day and month rows of `jev_spend` in one atomic upsert, so concurrent serverless instances never lose spend.
- **Enforcement.** An operation reads the budget once, at its first Jev call. When the day or month has reached its budget it fails with `budget_exhausted` before calling Jev, and the participant's input stays in the failed operation ([PERSISTENCE.md](PERSISTENCE.md#synchronous-execution-and-idempotency)). Operations that make no Jev call, such as the exact test phrases or dismissing the interlude, are never blocked. An operation that started under budget finishes, so concurrent operations can overshoot by what is in flight, about a cent each. If the budget cannot be read, for example before its migration is applied, the check fails open and logs `jev_budget_unavailable` at error level.
- **TypeSafe out of credits.** The [API reference](https://docs.typesafe.ai/api) documents 401, 422, 429 and 529, but no billing error. Third parties observed HTTP 402 with `{"detail":{"error_type":"billing_error","message":"Your organization has no available TypeSafe API credits..."}}`; SDK 0.6.0 has no class for it and raises a plain `APIError` with status 402, which its retry policy and ours do not retry. The app treats a 402, or a structured `error_type`, `type` or `code` naming billing, credit, balance, insufficient funds or quota, or payment required, under any status, as out of credits; free-text messages never count. The failure is stored as `provider_out_of_credits`, and the first one starts a 10-minute hold in `jev_provider_status`: operations fail the same way without calling Jev until it expires, then the next one probes. Neither the 402 nor its body was verified against the live API, because that requires an empty balance.
- **Signals.** Server logs, one per event: `jev_budget_threshold_crossed` when estimated spend crosses 80% (warn) and 100% (error) of a day or month, and `jev_provider_out_of_credits` (error) once per hold. The increment that crosses a threshold reports it, so each is logged once. They carry only the period, threshold, spent and limit in USD ([MEASUREMENT.md](MEASUREMENT.md#operational-signals)). Blocked operations log at warn.
- **Scope.** Only participant operations through `/api/assessments` count. Offline commands (persona generation, re-evaluation, benchmarks, evaluations) have their own paid-request flags and are not counted, although they draw on the same TypeSafe balance. Participant interviews make no OpenAI calls; OpenAI is used only offline (simulated answers, benchmarks, translation), so it is outside this budget.

The participant sees the [over-budget notice](PRODUCT.md#out-of-budget). `pnpm db:test:budget` checks concurrent increments, signals, the hold and the participant path against native Postgres with a mocked TypeSafe.

## Evaluation and primary documentation

Before publishing, evaluate held-out reviewed conversations across Doom, Bloom, mixed, skeptical and uncertain views; familiarity/writing styles; coherent extremes and weak moderation; evidence offered with good/poor/uncertain fit; paraphrases/verbosity; recovery and relevant humor. Do not report the current draft readiness heuristic as empirically calibrated.

Verify current contracts from the [API](https://docs.typesafe.ai/api), [SDK](https://docs.typesafe.ai/sdk/javascript), [Choice](https://docs.typesafe.ai/primitives/choice), [Score](https://docs.typesafe.ai/primitives/score), [Noul](https://docs.typesafe.ai/primitives/noul), [shared state](https://docs.typesafe.ai/concepts/state) and [batching](https://docs.typesafe.ai/patterns/fan-out). Ordered Score levels must be self-contained; normalize by their maximum index before composition. Model/version pinning must be checked rather than assuming moving aliases are reproducible.

## Persistent operation integration

The authenticated `/api/assessments` endpoints load server snapshots through `lib/assessments/repository.ts`; callers send an assessment ID, expected revision, request key, and typed operation. They never supply replacement state. Acceptance retains the input before evaluation; only an atomic snapshot/head/success transaction advances state. Identical replays return saved outcomes without calling the evaluator again. Expired attempts are shown as interrupted and reconciled by the next mutation; explicit retry carries a new key and the failed operation ID.

The repository verifies ownership for private reads and mutations; HTTP handlers resolve ownership from Better Auth and require an exact configured origin for writes. Public reading uses a separate publication-checked serializer and never starts inference or anonymous sessions. The old full-state endpoint returns HTTP 410. Browser tests cover creation, draft recovery, saved answers, and lost-response recovery. No background assessment execution is involved.

## Verified upstream limits and diagnostics (2026-09-26)

The [model documentation](https://docs.typesafe.ai/models) specifies 64k tokens for state plus all questions and 32k for state plus the longest question. These are token limits, not JSON byte limits. Controlled live probes returned HTTP 400 with `{"detail":{"error_type":"max_tokens_exceeded"}}` for overflow, while the investigated production 403 payload replay succeeded at 7,155 input tokens. See the [investigation and reproduction](research/jev-403-investigation-2026-09-26.md). An HTTP 403 alone does not establish context overflow.

The SDK preserves parsed error `body`, `message`, response `headers` and `requestId` from `x-typesafe-request-id`. Capture sanitized HTTP diagnostics before SDK parsing so text/HTML firewall errors and alternate correlation headers survive. General error serialization intentionally omits raw exception messages and bodies.
