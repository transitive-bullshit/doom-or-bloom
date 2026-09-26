# TypeSafe / Jev Composition Specification

> [PERSISTENCE.md](PERSISTENCE.md#synchronous-execution-and-idempotency) defines server-authoritative snapshots and synchronous atomic operations. This document defines Jev’s semantic role; application code owns idempotency, budgets, recovery and atomic commits. Start in `lib/server/engine.ts` for orchestration, `lib/server/live-provider.ts` for SDK calls, and `lib/assessment/` for deterministic state and scoring.

## Runtime assessments and persona excerpts

End-user assessments use complete answers and whole-answer support only. They do not generate excerpt pools, select or verify passages, extract stated percentages, or issue quoted tension-pair clarifications. The server defaults to runtime mode; only the pre-built persona runner opts into excerpt processing. Existing historical records remain readable.

See [PRODUCT.md](PRODUCT.md#results) for the participant presentation and [ASSESSMENT.md](ASSESSMENT.md#corrections-and-clarification) for retained claim-specific correction semantics. Excerpt and quote-verification behavior below applies only to personas.

## Role and boundaries

Jev performs narrow semantic judgments over participant evidence and authored definitions. It returns Choice, Score and Noul outputs, distributions and interpretation confidence. Code owns state transitions, calculations, eligibility, routing, persistence, versioning and rendering. Jev does not write participant questions, generate result prose or expose hidden reasoning.

Independent questions in a batch cannot consume one another’s outputs. Later stages receive earlier results only through code. Question IDs are application bookkeeping: supply the actual dimension meaning in instructions/criteria or named shared state. Never equate a category probability with the participant’s event probability, or interpretation confidence with forecast correctness.

## Current local workflow — algorithm 0.6.1

### A. Interpret the reply

Supply the current authored prompt and complete submitted reply once, prior usable answers, unresolved scopes with their source-answer IDs, and the correction target. Runtime evaluates 20 independent base judgments; personas add tension existence and location for 22: disposition, reading familiarity, 15 dimension-presence classifications, horizon presence, explicitly unknown horizon, participant-conviction presence, tension existence and tension location. Add one resolution judgment for each dimension with an unresolved ambiguity or tension, up to 35 runtime judgments (37 for personas). Missing evidence and demonstrated low-quality reasoning are distinct.

Every dimension question includes its human-readable label and its full authored meaning. Worldview describes expectations/values/policy; reasoning describes the supplied explanation. Missing evidence is not a low score. Presence of an explicit unknown does not establish a directional position. Familiarity is a wording/resource signal, not quality.

Consume disposition first. Only usable replies contribute evidence. Ambiguous or clearly irrelevant replies enter the bounded recovery policy in [ASSESSMENT.md](ASSESSMENT.md#answer-relevance-and-bounded-recovery); discard speculative profile judgments for them. Never judge sincerity. Exact standalone `test`, `test again`, `paperclips`, `show me paperclips` and `show paperclips` use the documented deterministic recovery/interlude policy without Jev calls. Rejected replies remain in persisted interaction history, excluded from scoring inputs.

### Update support and readiness in code

Preserve complete prompts/replies once and attach whole-answer support by dimension ID. Persona-only tension clarification may select two exact source excerpts; code verifies and quotes them without generated prose. Timing/conviction flags record presence; actual forecasts and assumptions remain in raw answers.

Compute [evidence readiness](ASSESSMENT.md#question-budget-and-readiness) from existing combined presence probability and coverage, without another Jev request. A well-covered first answer can unlock a provisional result; reply count cannot unlock it. Readiness never changes a reasoning score.

### C. Route follow-ups

Code enumerates eligible authored candidates. Shared `dimensionDefinitions` maps each target ID to its label and meaning. Supply the usable transcript once, continuous evidence support, unresolved issues, familiarity, horizon/conviction gaps and each candidate’s text, targets and intended distinction.

Jev independently judges coverage gain, projection usefulness, consequential novelty and whether the intended distinction remains unanswered. It judges ambiguity/tension benefit only for matching unresolved issues. Code combines authored weights, effort/repetition penalties and a stable ID tie-break. Effective novelty is the lower of the novelty Noul and the probability of an unasked/partial gap; the default threshold is 0.6 with positive utility. A clearly missing central basis lowers the grounding question’s threshold to 0.5 and adds a bonus proportional to the basis gap. An unassessed updateability dimension gives the unasked crux question the same lower threshold. When eligible and no worthwhile candidate or uninvestigated issue remains, show results automatically; explicit Continue still explores. Jev never invents a question. See [current routing details](ASSESSMENT.md#current-elicitation-experiment).

### D. Results on demand or automatic routing completion

Supply the complete accepted transcript once, active whole-answer support, dimension definitions, correction scopes, coverage, unresolved issues and versions. Prior interpretations are not independent evidence. Independently judge dimension status/score, worldview direction, catastrophic risk, scoped facets (expressed outlook, overall expected impact, capability ceiling, development pace, deployment policy and access policy), and central basis. Routing evaluates only overall expected impact (`overall_outlook`) and central basis alongside candidates; it does not construct the full result. Result generation runs on explicit request, automatic routing completion, or the prompt cap; debug mode does not generate extra results. The map uses the separate expressed-outlook facet (`outlook_orientation`), rather than a benefit/harm average or net-impact forecast.

Consume scores only on supported branches. Explicit unknowns remain unplaced. Code normalizes authored scales, calculates the map and interpretation ranges, chooses conservative authored findings and curated resources, and retains whole-answer provenance. Reuse a result when its evidence revision is unchanged, including historical results with their original version.

### Experimental worldview views — `worldview-v7`

Runtime projection adds four judgments: human influence, transformation, inferred P(doom) likelihood band and evidence basis. Persona mode additionally selects supporting excerpts, a stated P(doom), milestone timing and assumptions/update conditions from bounded exact passages and percentage tokens. Jev selects authored categories or candidates; it writes no new result prose. Missing or ambiguous evidence remains unplaced.

Only persona mode runs the dependent evidence pass for reasoning excerpts and experimental quote verification. Each experimental quote requires at least 0.75 verification support. Quote verification does not gate whole-interview axes or inferred P(doom); whole-answer provenance remains available. Choice confidence compares competing quotes and is not a claim-validity threshold. Milestone checks require the specific milestone, rather than assigning generic societal timing to AGI or superintelligence. Historical experiment versions remain readable. The builders in `lib/assessment/worldview-experiment.ts` define the current questions and version; [ASSESSMENT.md](ASSESSMENT.md#pdoom-adjustment--worldview-v7) defines P(doom) composition.

Store these results in optional `result.experiment` with its own version, model, timestamp and evidence revision. This additive experiment does not change readiness or routing semantics or reinterpret historical reasoning scores. Exact quotes are presentation evidence; the existing dimension ledger retains whole-answer provenance.

### Runtime corpus grounding is paused

The user paused identification and canonical-summary grounding for the local demo. No B1/B2 requests, reference-topic judgment, source summaries or reference claims enter new inference. Legacy reference flags do not affect new routing, readiness, findings or resource ranking; newly calculated results have no grounding-source list. Do not claim external fact-checking. Grounded understanding now assesses the connection between a claim and the basis the participant offers, not independent source accuracy.

Keep corpus assets, source provenance, curated reading recommendations and `/corpus` for offline authoring/review. Old saved reference checks and debug exchanges remain readable as historical records. This does not authorize renewed grounding calls or erase the unfinished corpus review gates.

## Debugging

Physical exchanges require server and operation capture enabled. The participant client requests capture independently of its Debug visibility toggle. Browser IndexedDB stores traces separately from server-authoritative progress; failed operations may return safe stage diagnostics without committing an assessment revision. Preserve actual recorded evaluator questions and payloads rather than explaining historical judgments with today’s rubric. [Local debugging](local-debugging.md) defines trace retention, inspection, downloads and sanitized server diagnostics.

New operations use the current assessment algorithm from `lib/assessment/schema.ts` (`0.6.1`); content, rubric and model versions remain pinned to the assessment. Preserve historical payloads and reuse cached results when their evidence revision is unchanged. Storage schema, algorithm and experiment versions are separate compatibility boundaries.

## Failure bounds and paid evaluation

Bounds: 12 initial participant prompts; forks add up to 12 with an absolute inherited ceiling of 30 and warning two prompts before the current ceiling; 20,000 characters per submitted reply; 96 independent questions per stage; 32 physical requests per operation including retries. Large-input interpretation can require five batches and routing twelve; the operation ceiling must accommodate interpretation, optional result generation, optional tension-selection and routing requests plus bounded retry capacity. A regression exercises the actual SDK batching with mocked transport and full multibyte history. Drafts retain all text; over-limit guidance blocks submission without truncation. The input counter appears only above the limit.

All stages share a 120-second operation deadline; stages have a 45-second deadline and physical attempts 15 seconds. Large inputs use eight-question batches with complete participant evidence. Batches are planned before evaluation. A context overflow fails the operation without recursive splitting. Each transient physical call has at most one retry; permanent errors fail immediately. Preserve drafts, validate responses, retry transient failures with bounded backoff, reject stale responses and keep credentials server-side. The cumulative transcript may still exceed provider context; never silently discard evidence.

Use credential-free fixtures for workflow/boundary checks. No paid pressure testing. Optional evaluation commands require `--allow-paid --max-requests=N` (1–24), with a shared physical-request allowance, reserved before stages and retained when failed-call cost is unknown. These flags do not replace agreement on a small reviewed suite and cost budget.

## Evaluation and primary documentation

Before publishing, evaluate held-out reviewed conversations across Doom, Bloom, mixed, skeptical and uncertain views; familiarity/writing styles; coherent extremes and weak moderation; evidence offered with good/poor/uncertain fit; paraphrases/verbosity; recovery and relevant humor. Do not report the current draft readiness heuristic as empirically calibrated.

Verify current contracts from the [API](https://docs.typesafe.ai/api), [SDK](https://docs.typesafe.ai/sdk/javascript), [Choice](https://docs.typesafe.ai/primitives/choice), [Score](https://docs.typesafe.ai/primitives/score), [Noul](https://docs.typesafe.ai/primitives/noul), [shared state](https://docs.typesafe.ai/concepts/state) and [batching](https://docs.typesafe.ai/patterns/fan-out). Ordered Score levels must be self-contained; normalize by their maximum index before composition. Model/version pinning must be checked rather than assuming moving aliases are reproducible.

## Persistent operation integration

The authenticated `/api/assessments` endpoints load server snapshots through `lib/assessments/repository.ts`; callers send an assessment ID, expected revision, request key, and typed operation. They never supply replacement state. Acceptance retains the input before evaluation; only an atomic snapshot/head/success transaction advances state. Identical replays return saved outcomes without calling the evaluator again. Expired attempts are shown as interrupted and reconciled by the next mutation; explicit retry carries a new key and the failed operation ID.

The repository verifies ownership for private reads and mutations; HTTP handlers resolve ownership from Better Auth and require an exact configured origin for writes. Public reading uses a separate publication-checked serializer and never starts inference or anonymous sessions. The old full-state endpoint returns HTTP 410. Browser tests cover creation, draft recovery, saved answers, and lost-response recovery. No background assessment execution is involved.

## Verified upstream limits and diagnostics (2026-09-26)

The [model documentation](https://docs.typesafe.ai/models) specifies 64k tokens for state plus all questions and 32k for state plus the longest question. These are token limits, not JSON byte limits. Controlled live probes returned HTTP 400 with `{"detail":{"error_type":"max_tokens_exceeded"}}` for overflow, while the investigated production 403 payload replay succeeded at 7,155 input tokens. See the [investigation and reproduction](research/jev-403-investigation-2026-09-26.md). An HTTP 403 alone does not establish context overflow.

The SDK preserves parsed error `body`, `message`, response `headers` and `requestId` from `x-typesafe-request-id`. Capture sanitized HTTP diagnostics before SDK parsing so text/HTML firewall errors and alternate correlation headers survive. General error serialization intentionally omits raw exception messages and bodies.
