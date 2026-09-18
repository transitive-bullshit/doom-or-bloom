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
