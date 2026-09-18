# TypeSafe / Jev Composition Specification

## Role and boundaries

Jev performs narrow semantic judgments over participant evidence and authored definitions. It returns Choice, Score and Noul outputs, distributions and interpretation confidence. Code owns state transitions, calculations, eligibility, routing, persistence, versioning and rendering. Jev does not write participant questions, generate result prose or expose hidden reasoning.

Independent questions in a batch cannot consume one another’s outputs. Later stages receive earlier results only through code. Question IDs are application bookkeeping: supply the actual dimension meaning in instructions/criteria or named shared state. Never equate a category probability with the participant’s event probability, or interpretation confidence with forecast correctness.

## Current local workflow — algorithm 0.5.0

### A. Interpret the reply

Supply the current authored prompt and complete submitted reply once, up to five prior usable answers and the correction target. Evaluate 20 independent judgments: disposition, reading familiarity, 15 dimension-presence classifications, horizon presence, participant-conviction presence and consequential tension.

Every dimension question includes its human-readable label and its full authored meaning. Worldview describes expectations/values/policy; reasoning describes the supplied explanation. Missing evidence is not a low score. Presence of an explicit unknown does not establish a directional position. Familiarity is a wording/resource signal, not quality.

Consume disposition first. Only usable replies contribute evidence. Ambiguous or clearly irrelevant replies enter the bounded recovery policy in [ASSESSMENT.md](ASSESSMENT.md#answer-relevance-and-bounded-recovery); discard speculative profile judgments for them. Never judge sincerity. Exact standalone `test`, `test again`, `show me paperclips` and `show paperclips` use the documented deterministic recovery/interlude policy without Jev calls. Rejected replies remain local conversation history, excluded from scoring inputs.

### Update support and readiness in code

Preserve complete prompts/replies once and attach whole-answer support by dimension ID. Do not select spans, extract quotations or repeat participant text in criteria. Timing/conviction flags record presence; actual forecasts and assumptions remain in raw answers.

Compute [evidence readiness](ASSESSMENT.md#question-budget-and-readiness) from existing combined presence probability and coverage, without another Jev request. A well-covered first answer can unlock a provisional result; reply count cannot unlock it. Readiness never changes a reasoning score.

### C. Route follow-ups

Code enumerates eligible authored candidates. Shared `dimensionDefinitions` maps each target ID to its label and meaning; routing instructions explicitly refer to this map and define coverage states. Supply the usable transcript once, coverage, unresolved ambiguity/tension, familiarity, horizon/conviction gaps and candidate texts/targets.

Jev independently judges coverage gain, ambiguity resolution, tension testing and projection usefulness. Code combines them with authored weights, effort/repetition penalties and a stable ID tie-break. Continue to a follow-up by default, even when results are available; the participant may request results instead. Jev never invents a question.

### D. Project on demand

Supply the complete accepted transcript once, active whole-answer support, dimension definitions, correction scopes, coverage, unresolved ambiguity/tension and versions. Prior interpretations are not independent evidence. Evaluate 41 independent output judgments: status/score for 15 dimensions, directional position for eight worldview dimensions, and three separate catastrophic-risk judgments.

Consume scores only on supported branches. Explicit unknowns remain unplaced. Code normalizes authored scales, calculates the map and interpretation ranges, chooses conservative authored findings and curated resources, and retains whole-answer provenance. Reuse a result when its evidence revision is unchanged, including historical results with their original version.

### Runtime corpus grounding is paused

The user paused identification and canonical-summary grounding for the local demo. No B1/B2 requests, reference-topic judgment, source summaries or reference claims enter new inference. Legacy reference flags do not affect new routing, readiness, findings or resource ranking; newly calculated results have no grounding-source list. Do not claim external fact-checking. Grounded understanding now assesses the connection between a claim and the basis the participant offers, not independent source accuracy.

Keep corpus assets, source provenance, curated reading recommendations and `/corpus` for offline authoring/review. Old saved reference checks and debug exchanges remain readable as historical records. This does not authorize renewed grounding calls or erase the unfinished corpus review gates.

## Debugging

Capture exchanges only with both server and operation debug enabled. Record each physical request’s exact batch IDs, model, shared state and validated response, omitting credentials, headers and raw errors. Persist successful operations in browser IndexedDB separately from progress: up to 64 recent whole operations, evicted toward a 32 MB target without truncating retained bodies. Refresh restores history; restart clears that assessment’s history. Failure displays a notice while preserving progress. Failed operations currently lack a completed trace.

Show requests/responses side by side on desktop, stacked on smaller screens, with native page scrolling. JSON uses syntax colors, accessible folds, depth 2+ initially folded and exact copy. Default/High first/Low first sorts `answers` by Choice/Score confidence or Noul probability; stable ties and missing/nonfinite values last. Copy preserves original payload/order.

Dotted keys offer mouse-hover and keyboard-focus help. Response judgments use the actual recorded evaluator question, including historical questions; saved judgments use their stored question. State dimension IDs and classifications use authored definitions and a local glossary. Help is authored context, not a model-generated explanation; it adds no inference request and never modifies or copies annotations into JSON.

Storage schema remains v2. Decode legacy v1 saves into whole-answer support without changing raw answers, drafts, tokens, pinned content or historical results. New operations use 0.5.0; cached historical results are not silently recomputed.

## Failure bounds and paid evaluation

Bounds: 12 lifetime participant prompts, warning at 10; 20,000 characters per submitted reply; 96 independent questions per stage; 16 physical requests per operation including retries. Drafts retain all text; over-limit guidance blocks submission without truncation. The input counter appears only above the limit.

All stages share a 120-second operation deadline; stages have a 45-second deadline and physical attempts 15 seconds. Large inputs use eight-question batches with complete participant evidence. An oversized-batch fallback may split once; an oversized child terminates rather than probing the provider limit. Preserve drafts, validate responses, retry transient failures with bounded backoff, reject stale responses and keep credentials server-side. The cumulative transcript may still exceed provider context; never silently discard evidence.

Use credential-free fixtures for workflow/boundary checks. No paid pressure testing. Optional evaluation commands require `--allow-paid --max-requests=N` (1–24), with a shared physical-request allowance, reserved before stages and retained when failed-call cost is unknown. These flags do not replace agreement on a small reviewed suite and cost budget.

## Evaluation and primary documentation

Before publishing, evaluate held-out reviewed conversations across Doom, Bloom, mixed, skeptical and uncertain views; familiarity/writing styles; coherent extremes and weak moderation; evidence offered with good/poor/uncertain fit; paraphrases/verbosity; recovery and relevant humor. Do not report the current draft readiness heuristic as empirically calibrated.

Verify current contracts from the [API](https://docs.typesafe.ai/api), [SDK](https://docs.typesafe.ai/sdk/javascript), [Choice](https://docs.typesafe.ai/primitives/choice), [Score](https://docs.typesafe.ai/primitives/score), [Noul](https://docs.typesafe.ai/primitives/noul), [shared state](https://docs.typesafe.ai/concepts/state) and [batching](https://docs.typesafe.ai/patterns/fan-out). Ordered Score levels must be self-contained; normalize by their maximum index before composition. Model/version pinning must be checked rather than assuming moving aliases are reproducible.
