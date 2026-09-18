# Live journey improvement loop — September 19

This continues the [initial reflection](journey-reflection-2026-09-18.md). These are development observations from real Jev judgments and OpenAI participant replies, not predefined persona scores or held-out validation.

## Evidence

Two fresh adaptive suites completed all ten personas, with five accepted answers and a result each. Both used the application's actual interpretation, recovery, routing and projection logic. Each made 50 OpenAI requests and 110 physical Jev requests, with no failures or unknown reserved cost.

| Saved run | Estimated API cost | Purpose |
| --- | --: | --- |
| `1789757412411-29c39e24-96f6-4ce3-aa90-c6037eb66668` | $0.1316 | Check the uncertainty, correction and evidence-preservation checkpoint |
| `1789757696323-4dd6399f-3c7f-4c96-a190-d40732163109` | $0.1335 | Check the revised evidence-presence rubric and subsequent uncertainty fixes |

Full local inputs, outputs and decisions are saved under `eval/runs/journeys/<run>/suite.json`. No persona's fixture scores were supplied to either model. Generated answers differ between runs, so coordinate differences alone are not an estimate of the effect of a code change.

## Findings and changes

**Poor reasoning was sometimes treated as missing evidence.** In the first suite, the dogmatic participant explicitly dismissed a counterargument. The projection judged counterargument engagement at 0.01 on the 0–3 scale, but its presence judgment assigned only 0.36 combined support. Interpretation also failed to establish the evidence. The engine correctly followed those judgments, but consequently omitted an observable weakness from the reasoning aggregate.

The presence instructions now distinguish evidence quality from evidence existence: explicit dismissal or refusal can demonstrate a low rubric level; silence still remains unassessed. A three-request Jev probe held the saved text fixed. Support for the dismissal became 1.00 in interpretation and 0.75 in projection, while the novice's opening remained below the support threshold for counterargument engagement. The local probe is `eval/runs/negative-evidence-1789757657011.json`. In the second full adaptive run, the dogmatic participant's actual dismissal produced a supported counterargument component of 0.023 on the normalized scale. This is evidence of the intended behavior, not a required persona score.

**Explicit catastrophic-risk uncertainty disappeared from the fingerprint.** Other unknown positions retained a claim and evidence, but the separate catastrophe component became entirely empty. It now preserves a supported uncertainty claim and evidence while leaving the coordinate null. An engine regression covers projection and subsequent scoped clarification. Unsupported catastrophe still receives no invented claim or coordinate.

**An obsolete timeline survived a later withdrawal.** The unknown-timing helper used the latest timing answer, while the fingerprint and conviction eligibility searched independently for any earlier date. They now share the latest applicable timing context. A regression covers date → unknown → revised date; existing scoped-correction tests also pass.

**Generic reasoning findings crowded out worldview findings.** Nine of ten results in the first suite displayed the same causal/crux/scope trio because those entries came first in the catalog. Selection now reserves a place for a supported worldview finding alongside reasoning feedback, retaining authored order and the existing evidence, uncertainty-range and unresolved-tension gates. It never manufactures a worldview finding for an unplaced participant. The synthetic baseline diff records the deterministic presentation change; this change followed the second live suite and requires no new inference.

## What the live results support

The novice and explicitly undecided participant had unplaced outlooks in both suites. Conditional requirements for control no longer automatically become claims that control is feasible. The dogmatic participant's concrete dismissal and unjustified certainty produce weak corresponding reasoning components; well-explained pessimism and optimism can both score well. Playful recovery remains bounded and subsequently reaches a normal result.

Question selection responds to the actual answers. In the first suite the undecided participant received a timeline question, answered that timing was unknown, and subsequently received a milestone question rather than another demand for a date. Different governance questions can still appear consecutively; whether each adds enough value needs further scrutiny.

## Remaining verification and improvements

- Broaden the live action paths beyond five answers followed by projection: early results, continuation and participant-initiated correction.
- Check bounded provider behavior with long histories and multiple unresolved dimensions, including useful failure diagnostics.
- Continue reviewing findings for specificity and fidelity to their triggering dimensions, and whether the fingerprint adequately represents ordinary harms and policy preferences.
- The existing participant development server remains a separate environment issue: it began timing out during inspection and logged `write EIO`. It was not restarted or reset.

Verification for this checkpoint: formatting, lint, types, content validation, all 136 unit tests and all ten synthetic baseline comparisons pass. Four focused browser checks pass against an isolated credential-free fixture server, covering desktop/mobile journey inspection, saved comparisons, broad ranges and unplaced axes. The active participant session was untouched. These focused checks do not constitute the broader live action-path verification listed above.

The improvement goal remains open. Two successful suites establish observed reliability for these runs, not a guarantee that external API failures cannot occur.

## Extended results and correction pass

The repeatable command `pnpm journeys:live --exercise-results` now exercises early projection, continuation, a later projection, and a scoped correction answered by the actual OpenAI participant. The engine chooses the correction prompt from an existing result claim, with no target score. Intermediate results are retained and disclosed in the inspector. Comparisons include correction scope and intermediate claims; safe failure diagnostics distinguish participant, interpretation, routing and projection stages, and validation failures from transport failures.

Two complete adaptive runs each exercised all ten personas through all these actions without a failed operation:

| Run | Jev requests | OpenAI requests | Estimated cost |
| --- | --: | --: | --: |
| `1789758330255-7c3277f1-a599-4d10-b8ec-0cd917bafe9c` | 120 | 50 | $0.1437 |
| `1789758895224-ddf69b9c-17e8-4c70-8d1c-2fb1b28f6bb0` | 120 | 50 | $0.1465 |

The first exposed a specific scope error: a forecast of better paperwork tools over a decade became a forecast of transformative capability within decades. Merely clarifying the dimension meaning did not fully fix it. The independent assessability judgment now receives the actual authored score levels, requiring a position in their scope rather than a forecast about any related subject. Fixed-transcript live projection comparisons are saved at `eval/runs/projection-review/1789758667053-36bbc736-42be-4943-8a73-4fe477db2261/review.json` and `eval/runs/projection-review/1789758789163-6b8039af-3811-4e8a-aabf-729f99561905/review.json` (ten real Jev calls each, approximately $0.0194 combined). The latter preserves the playful participant's uncertainty while retaining the skeptic's low-ceiling position and an explicit transformative forecast. The earlier zero-call cached-projection artifact is not evidence of a retest.

A separate deterministic regression reproduced an avoidable operation failure through the actual Jev SDK with mocked transport: a valid multibyte history and 15 unresolved dimensions require five interpretation batches plus twelve routing batches. The former 16-request operation ceiling aborted the seventeenth successful request. The ceiling is now 24, with unchanged per-stage/operation deadlines, unchanged eight-question large-input batching, all 96 routing judgments and complete history preserved. Retry-exhaustion tests still enforce the bound; cost reservation uses the same constant. No paid maximum-context pressure test was used.

Verification: all 139 unit tests, formatting, lint, types, content validation and the unchanged synthetic observations pass. Desktop/mobile inspector checks pass, and a separate browser check of the real saved action run confirms all three intermediate results and the clarification step render with inference POSTs blocked.

### Remaining concrete findings from the final review

- The high-risk participant's control claim still says control is feasible under demanding conditions even though their answers primarily describe strategic worries and required safeguards. Exact claim-to-answer support needs a stronger check; this is not solved merely by the successful operation count.
- The dogmatic participant is assigned a decades-level capability claim without an explicit arrival horizon. Their assertion that benefits follow quickly _once_ AI is smart enough must not establish when that capability arrives.
- The undecided participant explicitly replies “I'm not sure which outcome you mean” to the mechanism prompt. The candidate's singular outcome premise is ambiguous in a two-scenario conversation. The playful participant also receives closely overlapping control-test/control-method questions and repeats the same safeguards. Routing applicability and marginal information gain still need work.
- Ordinary-harm and action summaries remain available only in detailed components, and the failed-operation envelope/resume proposal is not yet fully implemented.

These observations contradict completion of the overall goal. Keep the loop active; do not use the clean live runs as a substitute for semantic and experience quality.

## Forecast scope follow-up

Reprojected the exact final transcripts from action suite `1789758895224-ddf69b9c-17e8-4c70-8d1c-2fb1b28f6bb0` through live Jev, retaining history and invalidating only the diagnostic copy's cached result. No persona targets or new participant answers were supplied.

The controllability meaning now separates technical feasibility from requirements for institutional cooperation, support for development, and evidence that might change a belief. Both follow-up replays leave the high-risk participant's technical control forecast unplaced instead of asserting feasibility. The dogmatic participant's explicitly automatic control expectation remains placed.

Timing needed two iterations. Clarifying the dimension meaning alone changed the unsupported decades claim into an unsupported long/indefinite claim. The position judgment now explicitly distinguishes an omitted arrival horizon from an anticipated distant arrival; neither rapid consequences after arrival nor eventual transformation alone supports a timed position. The second replay leaves this participant's capability component unplaced while preserving their optimistic impact expectation. Explicit near-term forecasts and the skeptic's explicitly low ceiling remain placed; the undecided participant's overall outlook remains unplaced.

Artifacts: `eval/runs/projection-review/1789759522119-7a374803-6738-45ea-beab-40fd2eb4ac69/review.json` and `eval/runs/projection-review/1789759569306-d4069592-fe4a-4f1e-995b-84b828e46a56/review.json`. Each completed ten real projection calls without failure; combined estimated cost $0.02084. These are fixed-transcript semantic checks, not fresh adaptive journeys, and one successful timing replay does not establish robustness. Routing premise/redundancy issues and the other outstanding experience work remain open.

## Routing follow-up

Two saved decision points exposed distinct misuses of routing utility: general uncertainty/trade-offs received tension benefit, and an already-answered safeguard question received substantial new-information benefit. The shared question policy now requires an unambiguous referent and evaluates the requested information rather than treating a different question ID as novelty. The four utility instructions distinguish missing coverage, stated ambiguity, actual incompatibility, and marginal projection information.

Live replay at the exact saved states changed the undecided participant's ambiguous `mechanism.general` question to the self-contained `risk.catastrophe` question. Its original candidate fell to priority 0.88. The playful participant's repeated `control.general` question lost to `countercase.general`. These are observed ranking improvements, not hard eligibility guarantees: Jev still assigns some nonzero utility to the discouraged candidates.

The immutable replay is `eval/runs/routing-review/1789759706856-3f8e92f8-7ddf-433d-b447-1c29eb9459a0/review.json`. Two routing stages used 13 physical requests because one crossed the conservative large-input batching threshold; estimated cost $0.00360. All candidate judgments and the complete histories were retained. No additional runtime stage or question-budget reduction was introduced.

The first fresh suite (`1789759729206-816fd3ca-f62b-4eee-ad62-c24198cc7ca2`) completed nine personas, then failed in routing after the playful participant generated its fourth answer. The safe error was a timeout/cancellation, not a confirmed budget-exhaustion error. It recorded 237 successful Jev requests, 49 participant requests, $0.17279 estimated spend and $0.01324 unresolved reservation. The failure retained the generated answer. The 240 used-or-reserved request count includes the reservation held after failure.

Inspection identified an avoidable regression: repeating expanded guidance across 96 questions put many ordinary routing inputs just above 100 KB, triggering twelve physical batches. Moved the detailed guidance into shared question policy and kept short dimension-specific reminders. A replay after the shared-policy change used two physical requests for the two saved routing states (`1789759988470-3f8b6021-b491-417a-8ceb-1a010bbe182a`), preserving the improved selections at approximately $0.00135. Added an actual-SDK mocked-transport regression requiring one routing request throughout five ordinary-length answers; the existing long multibyte/full-context regression still exercises 17 successful requests. This reduces avoidable batching without changing history, candidate count, timeout, retry or budget limits.

Final compact-wording replay `1789760097078-3fec344c-eafc-45dc-a40d-2d8279ac4068` again selected `risk.catastrophe` and `countercase.general`, using two requests ($0.00149). The complete fresh suite `1789760014519-a393b974-3afd-4118-9194-b572c60d7a24` then completed all ten personas, early results, continuation and corrections without failure: 121 Jev requests, 50 OpenAI requests, $0.15141 estimated total, zero remaining reservations. All forty routing stages used one request each; their inputs were approximately 68–83 KB. The extra Jev request beyond 120 was not a failed operation.

Reviewed all ten final transcripts and claims. The undecided participant retained an unplaced overall outlook; the dogmatic participant's explicitly two-year prediction remained placed and their demonstrated reasoning stayed low. The playful participant did not receive the repeated control-method question. The high-risk participant's control correction now produced a difficult/unreliable control claim consistent with the actual correction. No new occurrence of the ambiguous singular-outcome mechanism question appeared in this run.

Remaining concrete result issues:

- Generic unknown/unestablished wording is too broad for the dimension's actual scope. The cautious builder and playful participant correctly insist they have a direction about ordinary improvements even though transformative timing remains unestablished. Clarification needs to distinguish these rather than repeatedly implying they have no view.
- The skeptic explicitly corrected transition dynamics to gradual, incremental automation, yet the final transition component remained unknown. Arrival uncertainty must not erase an expressed transition expectation.
- The worried participant says the net outcome is unsettled, while the sole placed horizontal contributor (manageable/localized harm) produces an outlook of 0.623. This follows the current observed-only normalization but risks presenting an affirmative overall outlook from an incomplete account; inspect the result contract and presentation before changing aggregation.
- Conditional-upside and institutional-feasibility claims still warrant closer support review, especially where the expected competitive trajectory is pessimistic but a preferable counterfactual exists.

Verification: 140 unit tests, types, lint, formatting, content validation and the unchanged synthetic journey baselines passed. No UI source changed. This remains an intermediate checkpoint with specific semantic failures outstanding, not goal completion.
