# TypeSafe / Jev Composition Specification

> Participant APIs now use server-authoritative snapshots and synchronous atomic operations. [PERSISTENCE.md](PERSISTENCE.md#synchronous-execution-and-idempotency) defines the contract. Jev retains the same semantic role; application code owns idempotency, budgets, recovery and atomic commits. Remaining acceptance checks are tracked in [the implementation plan](persistence-implementation-plan.md).

## Runtime assessments and persona excerpts

End-user assessments use complete answers and whole-answer support only. They do not generate excerpt pools, select or verify passages, extract stated percentages, or issue quoted tension-pair clarifications. The server defaults to runtime mode; only the pre-built persona runner opts into excerpt processing. Existing historical records remain readable.

The worldview map, human influence, transformation, reasoning scores, inferred P(doom), fingerprints, findings, whole-answer references, correction controls, resources and downloads remain available. Runtime results hide the detailed milestone timeline, outlook hinges and excerpt-backed reasoning judgments; the correction disclosure is “Review & clarify my results.” Persona views retain excerpt-based cards. Excerpt and quote-verification behavior described below applies only to personas.

## Role and boundaries

Jev performs narrow semantic judgments over participant evidence and authored definitions. It returns Choice, Score and Noul outputs, distributions and interpretation confidence. Code owns state transitions, calculations, eligibility, routing, persistence, versioning and rendering. Jev does not write participant questions, generate result prose or expose hidden reasoning.

Independent questions in a batch cannot consume one another’s outputs. Later stages receive earlier results only through code. Question IDs are application bookkeeping: supply the actual dimension meaning in instructions/criteria or named shared state. Never equate a category probability with the participant’s event probability, or interpretation confidence with forecast correctness.

## Current local workflow — algorithm 0.5.0

### A. Interpret the reply

Supply the current authored prompt and complete submitted reply once, prior usable answers, unresolved scopes with their source-answer IDs, and the correction target. Runtime evaluates 20 independent base judgments; personas add tension existence and location for 22: disposition, reading familiarity, 15 dimension-presence classifications, horizon presence, explicitly unknown horizon, participant-conviction presence, tension existence and tension location. Add one resolution judgment for each dimension with an unresolved ambiguity or tension, up to 35 runtime judgments (37 for personas). Missing evidence and demonstrated low-quality reasoning are distinct.

Every dimension question includes its human-readable label and its full authored meaning. Worldview describes expectations/values/policy; reasoning describes the supplied explanation. Missing evidence is not a low score. Presence of an explicit unknown does not establish a directional position. Familiarity is a wording/resource signal, not quality.

Consume disposition first. Only usable replies contribute evidence. Ambiguous or clearly irrelevant replies enter the bounded recovery policy in [ASSESSMENT.md](ASSESSMENT.md#answer-relevance-and-bounded-recovery); discard speculative profile judgments for them. Never judge sincerity. Exact standalone `test`, `test again`, `show me paperclips` and `show paperclips` use the documented deterministic recovery/interlude policy without Jev calls. Rejected replies remain local conversation history, excluded from scoring inputs.

### Update support and readiness in code

Preserve complete prompts/replies once and attach whole-answer support by dimension ID. Ordinary scoring uses whole-answer support. A bounded tension clarification may select two exact source excerpts; code verifies and quotes them without generated prose. Timing/conviction flags record presence; actual forecasts and assumptions remain in raw answers.

Compute [evidence readiness](ASSESSMENT.md#question-budget-and-readiness) from existing combined presence probability and coverage, without another Jev request. A well-covered first answer can unlock a provisional result; reply count cannot unlock it. Readiness never changes a reasoning score.

### C. Route follow-ups

Code enumerates eligible authored candidates. Shared `dimensionDefinitions` maps each target ID to its label and meaning; routing instructions explicitly refer to this map and define coverage states. Supply the usable transcript once, coverage, unresolved ambiguity/tension, familiarity, horizon/conviction gaps and candidate texts/targets.

Jev independently judges coverage gain, ambiguity resolution, tension testing and projection usefulness. Code combines them with authored weights, effort/repetition penalties and a stable ID tie-break. An independent Noul judges consequential novelty. The experimental threshold is 0.6 with positive utility. A clearly missing central basis gives the existing grounding question a one-point bonus and a 0.5 threshold, recorded per candidate. When eligible and no worthwhile candidate or uninvestigated issue remains, show results automatically; explicit Continue still explores. Jev never invents a question.

### D. Shared profile, before routing and on result requests

Supply the complete accepted transcript once, active whole-answer support, dimension definitions, correction scopes, coverage, unresolved ambiguity/tension and versions. Prior interpretations are not independent evidence. Evaluate 47 independent output judgments: status/score for 15 dimensions, directional position for eight worldview dimensions, three catastrophic-risk judgments, five scoped facets (overall outlook, capability ceiling, development pace, deployment policy and access policy), and a central-basis Noul. Routing consumes this same interpretation, instead of repeating its two outlook-position judgments. Code normalizes the direct overall-outlook distribution; it no longer averages benefit/harm coordinates.

Consume scores only on supported branches. Explicit unknowns remain unplaced. Code normalizes authored scales, calculates the map and interpretation ranges, chooses conservative authored findings and curated resources, and retains whole-answer provenance. Reuse a result when its evidence revision is unchanged, including historical results with their original version.

### Experimental worldview views — `worldview-v4`

The projection batch adds fifteen independent judgments: two qualitative axes, two supporting-excerpt selections, one stated P(doom) selection, three inferred P(doom) judgments (likelihood band, evidence basis, representative excerpt), four milestone timing selections, and three assumption/uncertainty/update-condition selections. Code proposes bounded exact passages and explicit percentage tokens from accepted answers, while preserving the complete transcript and correction scopes. Jev selects authored categories or candidates; it writes no new result prose. Missing or ambiguous evidence remains unplaced. The fifteen questions bring the current base projection batch to 63 judgments; a dependent evidence pass combines bounded reasoning-evidence selection with up to eleven independent Noul checks of the selected experimental excerpts. Each displayed quote requires at least 0.75 verification support. Quote verification does not gate the separately inferred whole-interview P(doom); its supporting answer IDs remain available even without a representative excerpt. Choice confidence compares competing quotes and is not used as a claim-validity threshold: several suitable excerpts can divide that probability. Milestone checks require the specific milestone, rather than assigning generic societal timing to AGI or superintelligence. Historical `worldview-v1` results remain readable.

Store these results in optional `result.experiment` with its own version, model, timestamp and evidence revision. This additive experiment does not change readiness or routing semantics or reinterpret historical reasoning scores. Exact quotes are presentation evidence; the existing dimension ledger retains whole-answer provenance.

### Runtime corpus grounding is paused

The user paused identification and canonical-summary grounding for the local demo. No B1/B2 requests, reference-topic judgment, source summaries or reference claims enter new inference. Legacy reference flags do not affect new routing, readiness, findings or resource ranking; newly calculated results have no grounding-source list. Do not claim external fact-checking. Grounded understanding now assesses the connection between a claim and the basis the participant offers, not independent source accuracy.

Keep corpus assets, source provenance, curated reading recommendations and `/corpus` for offline authoring/review. Old saved reference checks and debug exchanges remain readable as historical records. This does not authorize renewed grounding calls or erase the unfinished corpus review gates.

## Debugging

Capture exchanges only with both server and operation debug enabled. Record each physical request’s exact batch IDs, model, shared state and validated response, omitting credentials, headers and raw errors. Persist successful operations in browser IndexedDB separately from progress: up to 64 recent whole operations, evicted toward a 32 MB target without truncating retained bodies. Refresh restores history; new assessments use separate history without clearing the original. Failure displays a notice while preserving progress. Failed operations may return available stage diagnostics; they do not create a committed assessment revision.

Show requests/responses side by side on desktop, stacked on smaller screens, with native page scrolling. JSON uses syntax colors, accessible folds, depth 2+ initially folded and exact copy. Default/High first/Low first sorts `answers` by Choice/Score confidence or Noul probability; stable ties and missing/nonfinite values last. Copy preserves original payload/order.

Dotted keys offer mouse-hover and keyboard-focus help. Response judgments use the actual recorded evaluator question, including historical questions; saved judgments use their stored question. State dimension IDs and classifications use authored definitions and a local glossary. Help is authored context, not a model-generated explanation; it adds no inference request and never modifies or copies annotations into JSON.

Storage schema remains v2. Decode legacy v1 saves into whole-answer support without changing raw answers, drafts, tokens, pinned content or historical results. New operations use 0.5.0; cached historical results are not silently recomputed.

## Failure bounds and paid evaluation

Bounds: 12 initial participant prompts; forks add up to 12 with an absolute inherited ceiling of 30 and warning two prompts before the current ceiling; 20,000 characters per submitted reply; 96 independent questions per stage; 32 physical requests per operation including retries. Large-input interpretation can require five batches and routing twelve; the operation ceiling must accommodate interpretation, shared-profile, optional tension-selection and routing requests plus bounded retry capacity. A regression exercises the actual SDK batching with mocked transport and full multibyte history. Drafts retain all text; over-limit guidance blocks submission without truncation. The input counter appears only above the limit.

All stages share a 120-second operation deadline; stages have a 45-second deadline and physical attempts 15 seconds. Large inputs use eight-question batches with complete participant evidence. Batches are planned before evaluation. A context overflow fails the operation without recursive splitting. Each transient physical call has at most one retry; permanent errors fail immediately. Preserve drafts, validate responses, retry transient failures with bounded backoff, reject stale responses and keep credentials server-side. The cumulative transcript may still exceed provider context; never silently discard evidence.

Use credential-free fixtures for workflow/boundary checks. No paid pressure testing. Optional evaluation commands require `--allow-paid --max-requests=N` (1–24), with a shared physical-request allowance, reserved before stages and retained when failed-call cost is unknown. These flags do not replace agreement on a small reviewed suite and cost budget.

## Evaluation and primary documentation

Before publishing, evaluate held-out reviewed conversations across Doom, Bloom, mixed, skeptical and uncertain views; familiarity/writing styles; coherent extremes and weak moderation; evidence offered with good/poor/uncertain fit; paraphrases/verbosity; recovery and relevant humor. Do not report the current draft readiness heuristic as empirically calibrated.

Verify current contracts from the [API](https://docs.typesafe.ai/api), [SDK](https://docs.typesafe.ai/sdk/javascript), [Choice](https://docs.typesafe.ai/primitives/choice), [Score](https://docs.typesafe.ai/primitives/score), [Noul](https://docs.typesafe.ai/primitives/noul), [shared state](https://docs.typesafe.ai/concepts/state) and [batching](https://docs.typesafe.ai/patterns/fan-out). Ordered Score levels must be self-contained; normalize by their maximum index before composition. Model/version pinning must be checked rather than assuming moving aliases are reproducible.

Inferred P(doom) uses the complete worldview, including indirect priorities and expected outcomes. Jev classifies probability bands; code combines their midpoints, uses interpolated 25th–75th percentile interpretation ranges with unknown-mass padding and no contextual padding floor, then applies worldview-v7 shifted sharpening to inferred estimates and re-centers the range with asymmetric offsets scaled by the sharpening curve’s local derivative (delta-method spread), clipped to 0–100%. Raw band judgments and pre-adjustment estimates remain in the trace. It does not report Jev confidence as catastrophe probability. Verification checks whether the excerpt supports the interpretation in context, without requiring an explicit number. See [assessment rules](ASSESSMENT.md).

`worldview-v4` removes representative-quote gating from the two whole-interview map axes. Code retains tentative points, marks explicit indecision as an unsettled reference point in the full range, and leaves truly absent topics unplaced. Routing directly elicits missing displayed axes once before completion. The single-axis reasoning display reuses the existing composite; it adds no inference calls.

## Persistent operation integration (in progress)

The authenticated `/api/assessments` endpoints load server snapshots through `lib/assessments/repository.ts`; callers send an assessment ID, expected revision, request key, and typed operation. They never supply replacement state. Acceptance retains the input before evaluation; only an atomic snapshot/head/success transaction advances state. Identical replays return saved outcomes without calling the evaluator again. Expired attempts are shown as interrupted and reconciled by the next mutation; explicit retry carries a new key and the failed operation ID.

The repository verifies ownership for private reads and mutations; HTTP handlers resolve ownership from Better Auth and require an exact configured origin for writes. Public/session-free reading is a separate upcoming surface. The interview now uses the authenticated endpoints. The old full-state endpoint returns HTTP 410 and cannot run inference. Browser tests verify creation, draft recovery, saved answers, and lost-response recovery. No background execution is involved.
