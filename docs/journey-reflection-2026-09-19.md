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
