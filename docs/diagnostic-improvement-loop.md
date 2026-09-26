# Assessment diagnostic loop — algorithm 0.6.0

Historical implementation and live-review record from September 20, 2026. The observations below explain the diagnostic design; their cohort counts, per-answer projections, tension/excerpt behavior and storage lifecycle are not current runtime instructions. Use [ASSESSMENT.md](ASSESSMENT.md), [TYPESAFE.md](TYPESAFE.md), [local-debugging.md](local-debugging.md) and [user-journeys.md](user-journeys.md) for current behavior. These remain experimental authored measurements.

## Placement and reasoning

The horizontal map coordinate now represents **expressed outlook**, from concern about harmful futures to hope for beneficial futures. Jev reads the participant's adopted orientation directly. Code does not subtract benefits from harms, infer a forecast from policy, or use the participant's identity. An explicitly mixed, conditional or undecided orientation can be placed near the middle; this does **not** mean the participant expects benefits and harms to cancel. The stricter **overall expected impact** judgment remains a separate component and can be explicitly unknown. Both are exported. The map's explanation and report distinguish these meanings.

Interpretation ranges use directional-category quantiles plus a continuous margin for missing interpretation mass. Participant uncertainty is not automatically evaluator ignorance or a full-width box. These are not calibrated confidence intervals or event probabilities. A genuinely uninterpretable orientation remains unplaced.

The seven reasoning dimensions retain equal weights. Scores describe attained authored levels, not intelligence, fluency, expertise or truth. The rubric no longer requires someone to invent a contradiction and then reconcile it to demonstrate coherence, nor to restate every scope boundary in every sentence. Dictated speech is evaluated for its argument.

For reasoning components below 85, a separate typed evidence selection tries to substantiate the dominant rubric reading with an exact participant excerpt. Negative readings require evidence of a defect; positive readings require actual demonstrated reasoning. No suitable excerpt produces an explicit review flag, not a fabricated explanation or automatic score increase. Candidates are bounded and carry answer IDs and character offsets; the complete transcript remains authoritative. This is supporting evidence selection, not hidden model reasoning. Candidate omission and model disagreement remain reasons to review the score.

## Tensions and routing

A screening probability only creates a tentative issue. It cannot reduce readiness until an exact pair has been checked in context. Pair selection covers excerpts across the transcript rather than only the final clauses. Unsupported or inconclusive screens are discarded, with their judgments and decisions retained in the trace. A verified pair is a clarification opportunity, not proof of contradiction. Projection receives the raw account without unresolved labels and does not replace a scored distribution with a full-width range merely because a routing issue exists.

Each authored question has an intended distinction in `lib/assessment/question-objectives.ts`. Routing separately judges whether that specific distinction is unasked, partially answered, already answered or inapplicable. An already expressed unknown does not count as missing information. The gate complements marginal novelty and utility; it does not award points just for another answer. A new cyberattack/defense question can test the offense–defense balance directly when central to an account.

After each accepted answer, the trace records readiness change and changes in component values, ranges and claims. Flat readiness is a review signal, not proof that nothing was learned. Inspect the expected distinction, raw answer and component changes together.

## Portable diagnostic reports

Every completed browser operation requests a diagnostic trace, independently of the debug visibility toggle. Browser IndexedDB stores the trace, submitted operation and immutable resulting assessment snapshot, separately from local progress. Debug mode adds a closed **Results after this answer** disclosure for each accepted answer. It shows that historical map, component readings and the underlying state and Jev exchanges. Reloading preserves the snapshots; old missing snapshots are labeled rather than reconstructed from the final result.

The full Markdown report has a version-2 JSON appendix with prompts, answers, attempts, current judgments including routing, exact recorded evaluator states/questions/typed answers, transport usage/timing, routing decisions, per-operation snapshots and safe inference failures. It includes submitted recovery text if present in a trace, but excludes unsubmitted drafts, credentials, transport error bodies and hidden reasoning. These files contain participant text; downloading and sharing remain participant-controlled. Trace capture makes no additional inference calls and sends no analytics.

Storage retains at most 64 operations and approximately 32 MB, evicting complete old operations. Reports state `complete` or `partial`, expected and recorded completed-operation counts, and exact missing base revisions. An interrupted connection may lack server diagnostics; older reports cannot recover omitted traces. Rejected/failed operations do not count as completed revisions. Restart clears the prior local trace history.

## Fixed real-user regression

`lib/journeys/fixed-user-answers.json` contains the four exact dictated answers the user authorized for regression testing. No OpenAI participant generates or edits them. They run through live Jev and the actual assessment engine. The original question sequence is fixed deliberately: current routing recommendations and automatic-stop decisions are recorded at every prefix, but never used to transplant an old answer onto a different question. This is an explicitly labeled transcript replay, not an adaptive simulation.

The full live suite includes 15 generated personas plus this fixed replay. Only the latest suite is retained in the inspector. The real user's identity and hoped-for scores never enter evaluator inputs. Semantic checks should inspect placement at each prefix, false same-scope tensions, reasoning support, and avoidable repetition—not require a flattering coordinate.

## Repeating the loop

### Validated live run — 2026-09-20

Run `1789890398770-3e19539d-5014-4cd4-b479-c2d7bc83ab5d` completed all 16 journeys without inference errors: 219 Jev requests and 41 OpenAI participant requests, with an estimated combined cost of $0.51. The fixed replay uses no OpenAI-generated answers. Its outlook is placed at every prefix (33.25, 28.75, 29.25, 31.5 on the 0–100 Doom–Bloom axis); its final outlook range is 25–50 and demonstrated reasoning is 75.95. Current routing would stop after the second original answer; the replay deliberately continues through all four to preserve the regression evidence.

The control alarmist finishes at outlook 1.5 / reasoning 95.38, the cautious builder at 77.5 / 97.38, and the dogmatic doomer at 0 / 22.43. These are observed outputs, not target judgments supplied to Jev. The original real-user report was unplaced with a full-width outlook range and approximately 65.7 reasoning. Comparisons reflect changed measurement semantics and rubric as well as model variability; they are diagnostic examples rather than an independent calibration study.

1. Complete a real run and download the full report, or regenerate the bounded live suite.
2. Check versions and trace completeness before diagnosing missing decisions.
3. Compare each question's intended distinction and ranking with the actual answer and observed changes.
4. Inspect unplaced views, broad ranges, unsupported negative readings and unverified tensions against exact answers.
5. Add fixed evidence regressions for real failures, change one policy or rubric at a time, and compare matched evidence alongside the diverse live personas.
6. Keep honest uncertainty, brief answers and dogmatic extremes in the evaluation. Do not optimize scores, readiness or placement merely to make the chart more satisfying.
