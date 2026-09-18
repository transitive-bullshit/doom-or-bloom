# First live journey reflection — 2026-09-18

The highest leverage change is to correct how the engine consumes Jev's evidence-presence judgments. Next, make failed operations diagnosable and resumable, preserve explicit unknowns through projection, and improve follow-up selection and result specificity. These are proposals awaiting feedback; this checkpoint changes the development harness, not assessment semantics.

## Evidence and limits

The primary evidence is the ten-persona live run [`1789721270400-757354d4-3ad7-4b1c-957e-fc23efb3fd25`](../eval/runs/journeys/1789721270400-757354d4-3ad7-4b1c-957e-fc23efb3fd25/suite.json). Select it in the local `/user-journeys` inspector. Its immutable artifacts are local and Git-ignored. This document preserves the important observations for the repository.

GPT-5.4 mini answered as each fictional participant. Actual application code selected every substantive question and called live Jev for interpretation, routing and projection. Algorithm `0.4.0`, content `0.4.0-draft`, rubric `0.1.0-draft`, Jev `jev-1.13.0`. The saved engine hash is `3f1cd1fb7fabf58754ba4ffe1fa4bbf9a7da2a32c5ee99b54433cac0fe14172f`; subsequent changes in this checkpoint concern harness provenance, UI, tests and documentation.

**There are no target scores for live personas.** Their written beliefs constrain the simulated participant; Jev judges the resulting answers. Neither model receives the old fixture scores. Those scores are injected inputs for free deterministic control-flow tests, not validated interpretations or an answer key. New live snapshots also omit them; original artifacts remain immutable.

This is an initial development sample, not a measured human completion rate. Each run follows a fixed policy of five answer opportunities and then requests a result if eligible. It does not model the user's choice to view a result earlier, continue later, correct a result, or abandon the interview. Paid runs call the real engine directly; separate browser tests cover the inspector. The recovery persona starts with two explicit scripted non-answers, then uses the live participant.

| Persona | Accepted replies | First eligible reply | Outcome within this run |
| --- | --: | --: | --- |
| Control alarmist | 1 | — | Jev evaluation failed on the next operation |
| Cautious builder | 5 | 4 | Result; final readiness 60.9% |
| Abundance advocate | 3 | 3 | Jev evaluation failed on the next operation |
| Worried novice | 5 | 2 | Result; final readiness 63.9% |
| High-risk accelerator | 3 | — | Jev evaluation failed on the next operation |
| Capability skeptic | 3 | 3 | Jev evaluation failed on the next operation |
| Labor organizer | 3 | 3 | Jev evaluation failed on the next operation |
| Open-ended uncertainty | 5 | 1 | Jev evaluation failed during projection |
| Dogmatic utopian | 5 | — | Still ineligible at the five-answer bound |
| Playful recovery | 5 | 3 | Result; final readiness 71.4% |

Recorded successful usage: 43 OpenAI requests and 84 physical Jev requests, approximately **$0.10** at the recorded published rates. Failed calls have unknown usage; **$0.2602 is retained as a conservative reservation, not an additional measured charge**. The shared Jev budget records 175 used-or-reserved attempts out of 240. These three quantities are deliberately distinct. Rates and accounting are documented in [User Journeys](user-journeys.md).

## 1. Use the probability of supported evidence for the support decision

**Observed, with a direct code explanation.** In the high-risk accelerator's opening, Jev returned:

| Dimension | P(stated) | P(strongly implied) | Combined support | Returned confidence | Engine accepts? |
| --- | --: | --: | --: | --: | --- |
| Expected harm | .66 | .32 | .98 | .56 | No |
| Causal clarity | .48 | .51 | .99 | .38 | No |
| Beneficial potential | .63 | .28 | .91 | .52 | No |
| Appropriate uncertainty | .59 | .37 | .96 | .49 | No |

The engine requires a supported winning category **and confidence ≥ .60**. Jev's confidence describes concentration across all alternatives. It can be low because probability is split between two alternatives that both mean support. It is not the probability of our grouped decision. This matches [TypeSafe's confidence semantics](https://docs.typesafe.ai/confidence).

The opening is reduced to 5.5% readiness despite plainly discussing benefits, risks and a conditional mechanism. The dogmatic utopian's explicit claims of ending disease and poverty similarly have .92 combined support for beneficial potential, but .34 confidence, so that position is dropped. That does not establish either persona's correct score; it establishes that the engine throws away evidence for a reason unrelated to the supported-versus-unsupported decision.

**Proposal:** centralize an explicit support probability, initially `P(stated) + P(strongly_implied)`, and review its threshold against actual answers. Use it consistently in interpretation, projection and readiness. Preserve the original category distribution for debugging. Do not merely lower the generic confidence threshold. Separately audit familiarity, tension and other gates according to the decision each makes.

**Verify:** replay fixed transcripts and distributions; splitting mass between the two supported categories must not erase support. Explicit absence and weak inference must still be excluded. Measure changes in accepted evidence, unnecessary follow-ups and unsupported final claims, rather than treating higher readiness as success by itself.

Relevant code: [`supported()` and interpretation](../lib/server/engine.ts), [readiness](../lib/assessment/readiness.ts).

## 2. Preserve progress across failures and record where they happened

**Observed; cause unresolved.** Six of ten journeys stopped on evaluation failures. Four of those had already reached eligibility. Current safe error messages do not distinguish transport, SDK validation, response validation or another local failure. A bounded replay of the control alarmist's preserved pending answer succeeded through interpretation and routing, so the original failure is not a reproducible semantic rejection. It is not evidence that all six failures were Jev outages.

The harness now retains the OpenAI reply even when its assessment operation fails. However, the engine's successful earlier stages within a failed operation are not all available in the saved journey trace. Completed request accounting and completed operation traces therefore need not match.

**Proposal:** record an allowlisted failed-operation envelope: stage, safe error category/code, physical attempt/status/timing and completed stage responses. Support explicitly resuming the saved pending answer from the last committed state. Keep bounded retry/deadline policy and avoid generating a different participant answer just to get past a failure. In the app, preserve a usable prior result when a later optional follow-up fails.

**Verify:** failure at each stage preserves prior answers and any prior result; resume has a clear request budget and no duplicate accepted answer. Review actual failure categories before changing batching or increasing retries.

Relevant code: [engine](../lib/server/engine.ts), [live provider](../lib/server/live-provider.ts), [journey runner](../lib/journeys/runner.ts).

## 3. Distinguish discussing a topic, taking a position and demonstrating reasoning

**Observed output concern, supported by code inspection.** The worried novice repeatedly says they do not know how to establish control and describes what evidence would reassure them. Their final controllability claim is nevertheless: “Control is expected to be very difficult and unreliable.” The displayed range is the entire scale. Stating a desired safeguard or an evidentiary requirement does not by itself express that forecast.

Readiness also falls during projection for all three completed results: 68.2→60.9, 76.5→63.9 and 76.0→71.4. Projection currently overwrites evidence coverage with whether a numerical component is placeable. This conflates “we understand that you are uncertain” with “we have not explored this.” The decline is not automatically wrong, but its meaning is inconsistent with an evidence-coverage meter.

The dogmatic participant raises a related question: explicitly dismissing counterarguments or refusing any update can be evidence of weak demonstrated reasoning, rather than no assessable evidence. Five replies ended with no result. Presence gating is a confirmed contributor; the quality-versus-presence distinction needs transcript review after that fix.

**Proposal:** represent topic evidence, position assessability, unresolved interpretation and reasoning quality separately. Preserve explicit unknowns as understood evidence while leaving that position unplaced. Only attribute a forecast when the participant expressed one; label safeguards, values and conditions as such. Assess weak reasoning when it is actually demonstrated, without requiring the participant to demonstrate good reasoning to receive a result.

**Verify:** requests for proof do not become pessimistic control forecasts; unknown timing does not become a date or midpoint; ordinary harm does not imply catastrophe; a stated refusal to update remains distinguishable from never being asked. Review against actual answers, not persona labels.

## 4. Resolve ambiguity when a follow-up actually resolves it

**Code-confirmed, with deterministic probes; also visible in the earlier live control run.** A normal later `stated` answer can restore coverage without removing the old ambiguity. Readiness remains halved and the projected interval remains `[0,1]`. Conversely, a later answer classified `weakly_inferred` can mark the whole dimension ambiguous even when earlier active evidence was strong. Only a dedicated correction clears the old unresolved entries automatically.

**Proposal:** attach uncertainty to the evidence or claim it concerns, and reconcile the aggregate state after new information. Clear an ambiguity only when the new answer resolves that same issue; retain real contradictions. An off-topic or weak later mention should not erase independent, still-active support.

**Verify:** ambiguous→clarified, clear→irrelevant, clear→contradictory, and explicit correction sequences. Follow-up usefulness should be reflected in resolved uncertainty rather than permanent penalties.

Relevant code: [evidence updates and projection ranges](../lib/server/engine.ts), [readiness contributions](../lib/assessment/readiness.ts).

## 5. Route toward useful clarification and allow a useful stopping point

**Observed patterns; selection-policy proposal.** The novice says in the opening that they do not know the timeline, then receives `timeline.general` and `timeline.milestone`, plus two control prompts. The accelerator receives `control.test` followed by `control.general`. Milestones and dates are different questions and can both help, but current ranking does not explicitly recognize “the participant already told us they do not know” or whether another answer is likely to change the result.

In the uncertainty persona, the two timing-family turns changed readiness by +0.9 and −3.7 percentage points. That is a review flag, not proof that those answers were useless. Readiness alone is an inadequate measure of question value.

**Proposal:** track expressed unknowns and already-addressed claims; penalize semantic repetition and unsupported premises. Rank for expected clarification of an important unresolved claim, using actual achieved change to audit the ranking. After a useful result is available, frame further questions as optional and choose one meaningful unresolved issue. Add harness policies for viewing the result at first eligibility and continuing from it; the current five-turn path cannot assess that choice.

Successful saved stages contain 3,024 routing judgments versus 760 interpretation and 123 projection judgments: **77% of the recorded judgment count is routing**. Median stage times were about 621 ms for routing and 360 ms for interpretation. This is an opportunity to prefilter clearly repetitive/inapplicable candidates before Jev, but it is not 77% of API cost or elapsed journey time. Fix evidence loss first so candidate filtering is based on correct state.

Relevant code: [routing](../lib/assessment/routing.ts), [route-stage questions](../lib/server/engine.ts).

## 6. Make results specific and preserve the shape of uncertainty

**Observed:** all three completed live results select the same causal-clarity, updateability and scope findings. Those are plausible strengths, but generic identical praise supplies little explanation of how these views differ. Selection takes the first three matching catalog entries. Recommendations also lean heavily on static priorities. The result fingerprint omits ordinary-harm and action preferences, even though those are central to some personas.

**Code-confirmed additional issue:** a component's prose claim is chosen by rounding its mean score. An offline distribution with half its probability at each endpoint generates a middle-level claim with zero probability mass. A mean can be a useful map coordinate without being a defensible categorical sentence. This mechanism should be fixed even though that exact distribution was not observed in this live suite. [TypeSafe score semantics](https://docs.typesafe.ai/primitives/score) explain why the mean can fall between plausible alternatives.

**Proposal:** select findings for explanatory value and diversity, tie them to specific answer evidence, and show a meaningful strength plus an uncertainty or tension where supported. Preserve the ordinary harms, conditions and action tradeoffs that distinguish the participant. Withhold or qualify categorical prose when the distribution or assessability does not support it; show broad or split interpretations honestly. Tie resources to a specific unanswered question.

**Verify:** a reader can recognize the participant from the summary; every personalized statement links to supporting answers; no phrase implies more certainty than the assessment contains. Do not force different findings merely because persona IDs differ.

Relevant code: [presentation selection](../lib/assessment/presentation.ts), [claims and fingerprint](../lib/server/engine.ts).

## Repeatable reflection loop

1. **Run real adaptive journeys.** Keep versioned persona narratives, model instructions, exact generated answers, full assessment inputs/outputs, selected questions and alternative priorities. Keep behavioral actions such as early result, retry and correction explicit. No persona score targets.
2. **Check simulation fidelity first.** Flag invented beliefs/experiences, expert language added to novices, and an LLM making a rigid character unusually reflective. Findings about assessment quality must use the actual generated text. The participant model is a confounder, not ground truth.
3. **Compute review flags.** Failed-operation rate and stage; support probability discarded by gates; readiness/placement disagreement; repeated questions after an unknown; unresolved items persisting after clarification; unsupported categorical claims; finding duplication; physical requests, tokens and latency. Distinguish mechanical flags from semantic judgments.
4. **Review the largest discrepancies.** For each proposal save the precise question/answer, Jev distribution, code decision and user-visible consequence. A separate semantic reviewer may suggest issues, but human review resolves contested interpretations. Optimize fidelity and usefulness, not numerical score or completion rate alone.
5. **Change one mechanism and compare.** Replay the same recorded transcripts for interpretation/projection comparisons, holding answers fixed. Separately generate fresh adaptive journeys to test changed routing and the resulting experience. A divergent route is not a same-input before/after comparison. Use a small number of repeats to check a surprising result before claiming stability.
6. **Promote regressions after review.** Keep deterministic mechanism tests and approved semantic invariants, such as “explicit unknown remains unplaced,” separate from observational live metrics. Incorporate manual testing as new narratives, action paths or reviewed transcript cases; never backfill arbitrary numerical targets from an imagined persona identity.

Recommended first batch after approval: support-probability handling, failed-operation diagnostics/resume, and unknown-versus-position separation. Re-run those before tuning routing weights or reasoning-score thresholds, because the current downstream metrics inherit those defects.
