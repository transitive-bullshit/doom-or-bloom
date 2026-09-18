# Journey improvement completion audit — 2026-09-19

Scope: the approved development loop on the ten fictional personas, using real Jev behind application routing and OpenAI-generated replies. Judge the actual replies rather than target persona scores. This is not completion of independent factual/source review, held-out validation, deployment or human testing.

| Requirement | Current implementation and direct evidence | Status |
| --- | --- | --- |
| Real adaptive calls and participant context | `live.ts` creates the live provider and OpenAI participant; `runner.ts` calls `runAssessment` for every operation. Participant tests inspect exact generated-text submission and exclude fixture judgments. | Verified, including completed live run |
| Supported evidence probability | `evidence-regression.test.ts` checks split probability across stated/strongly implied, exclusion of weak inference and preserved readiness. | Verified |
| Failures do not discard progress | Provider transport tests cover timeouts, cancellation, bounded retries, large payload batches, rounding tolerance and safe diagnostics. Runner tests fail interpretation, routing and projection, then retry from committed state without duplicate acceptance; prior results and original profiles survive. | Verified |
| Explicit pending-answer resume | CLI `--resume`, fresh bounded budget, immutable source/new linked artifact; participant test reuses the exact generated reply. Inspector displays the checkpoint and command; mobile browser test passes. | Verified |
| Topic evidence versus position and quality | Projection tests preserve supported unknowns without midpoint/date/catastrophe inventions. Draft rubric explicitly distinguishes ordinary harm, adopted benefits, uncertainty and demonstrated refusal to revise. Latest ten-live-result evidence recorded in the reflection log. | Current sample reviewed; agency error found and corrected in fixed-transcript replay |
| Actual ambiguity resolution | Regression tests distinguish issue-specific clarification, unresolved conflict, irrelevant weak mentions and explicit correction; scoped correction retains ordinary-harm evidence. | Verified |
| Useful routing and optional result actions | Shared control novelty penalty; unknown/unsupported-premise routing instructions; runner exercises early result, continuation, scoped correction and final projection. Ordinary five-answer payload test prevents accidental large-history batching. | Verified, including current live result actions |
| Specific, qualified results | Distribution-based claim tests reject unsupported midpoint prose; partial outlook tests retain component values; seven-card fingerprint includes ordinary harm/action. Evidence/range gates and worldview/reasoning diversity govern findings, including explicit refusal feedback. | Verified |
| Relevant resources for unknown positions | Explicit topic eligibility requires evidence, cannot assert score bounds, prioritizes supported open topics, diversifies topic/purpose and supplies an authored exploration question. Replayed all ten prior live outcomes with no additional inference; tests exclude missing evidence and preserve numerical gates. | Verified |
| Remaining confidence gates | See audit below. | Reviewed; no change justified |
| Current code has no obvious glaring live discrepancies | Requires completed current-code run and inspection of every generated conversation and final interpretation. | Not complete: current run exposed a values-relative agency error; fixed-transcript replay passed, fresh adaptive verification pending |

## Remaining confidence gates

The presence bug combined equivalent supported categories; familiarity and tension instead select one particular category. Their confidence gates intentionally require concentration before escalating to specialist language or recording a consequential tension. In the prior final-code live suite, the only non-`none` tension candidate had probability .50 and confidence .46; preserving uncertainty rather than asserting that tension is defensible. Several familiarity alternatives had probability .61–.72 with lower confidence; this does not establish that specialist wording would improve those interviews. The default remains general and familiarity does not directly score reasoning.

Disposition uses confidence only to avoid penalizing an uncertain `non_answer`: below .85 it requests clarification rather than counting a clear miss. `state.test.ts` checks uncertain misses and navigation do not trigger paperclips. All substantive model dispositions in the inspected prior suite were usable; the recovery persona's two exact misses follow explicit local policy. There is no observed failure supporting a blanket conversion of these gates or a threshold adjustment. Retain their full distributions for future review.

## Boundaries of the claim

External API failures cannot be guaranteed never to occur. This work addresses observed avoidable failures and makes remaining failures bounded, inspectable and resumable. A successful finite development sample cannot prove every future answer will be interpreted correctly. Completion of this loop means the identified mechanisms are addressed and no obvious discrepancy remains in the reviewed current ten-persona sample, not a guarantee of semantic accuracy or release readiness.

## Current live run and correction

Run `1789763124582-c591bc60-432f-4f51-9c7d-0131a3e108ea` completed all ten personas, five generated replies each, early result/continue and scoped correction actions. No evaluation failures: 120 Jev requests, 50 OpenAI requests, $0.153581994 estimated usage, zero unresolved cost reservations. All six isolated result/inspector browser checks pass.

Reviewed every generated conversation and its final worldview claims. The dogmatic participant welcomed replacement of work and institutions, but received a categorical loss of valued agency. This is a real mismatch: reduced human involvement is not itself loss of something this participant values. Clarified the existing human-agency definition to require both the participant’s valued form and its expected fate, with automation/delegation not automatically negative.

Fixed-transcript replay `1789763356780-147ed164-2cd3-4599-a028-078d36638975` uses ten live Jev projections, $0.010323684 estimated cost. It withholds that unsupported dogmatic agency position while retaining expressed agency-loss expectations for the alarmist and labor organizer. Unknown agency remains unplaced for the undecided participant. This is diagnostic replay, not a fresh adaptive run of the revised definition. Completion remains open. The current sample also merits a focused check of modal wording in transition expectations and the distinction between wanting safeguards and preferring continued development; do not infer these from persona labels or require numeric targets.
