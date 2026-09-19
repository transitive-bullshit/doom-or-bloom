# Elicitation experiments

Approved work: [audit](elicitation-audit-2026-09-20.md), [implementation checkpoints](mvp-implementation-plan.md). Ongoing implementation log, not a completion claim.

## Checkpoint 1: consequential novelty and automatic results

An independent Jev Noul judges consequential new information for each shortlisted question. Routing prefers candidates clearing an experimental 0.65 threshold and positive utility. Once results are eligible, no worthwhile candidate remains, and recorded issues have had an opportunity for clarification, the engine projects immediately. Explicit Continue from results still offers a follow-up. Incomplete evidence does not stop merely because candidate novelty is low. No minimum answer count was introduced.

The live journey harness respects automatic results rather than silently opting everyone into more questions. Mechanical tests may still explicitly continue to exercise control flow.

Ambiguity/tension benefits are requested only for candidates targeting a recorded matching issue. Detailed novelty instructions live once in shared state: repeating them per candidate crossed the large-input batching boundary during the first opening replay, exhausting its 12-request allowance. Moving the policy into shared state allowed the same three-case replay to complete in seven physical calls.

## Targeted observations

Six recorded routing prefixes were replayed with live Jev novelty judgments. The old selected questions received:

| Prefix | Previous next question | New-information probability |
| --- | --- | --: |
| Alarmist after answer 4 | Benefits bottleneck | 0.36 |
| Huang proxy after answer 4 | Everyday milestone | 0.26 |
| Skeptic after answer 1 | Control evidence | 0.32 |
| Organizer after answer 4 | Control evidence | 0.24 |
| Dogmatic doomer after answer 1 | Change of mind | 0.45 |
| Uncertainty after answer 2 | Benefit distribution | 0.53 |

None cleared the threshold. This supports rejecting known repeats, but is insufficient validation of stopping: old states miss the doomer's contradictions, and absent question types cannot win. No counterfactual participant replies were generated in this replay.

The real revised engine was then tested with actual recorded opening answers:

- Dogmatic doomer: apparent incompatibility 0.83–0.84; an internal-coherence issue is recorded and questioning continues.
- High-risk accelerator: incompatibility 0.10; conditional support for continued development is not treated as contradictory. Results appear after one answer.
- Worried novice: incompatibility 0.07; questioning continues. Its selected crux question still needs review against missing expected-benefit information.

A separate tension-presence Noul examines incompatibilities within a single answer and across answers. A Choice localizes the issue, with internal coherence as the fallback when location is uncertain. Initial presence threshold: 0.75. Poor reasoning, strong conviction, uncertainty, and policy/forecast differences alone are excluded. A repeated contradiction does not force endless questioning: one relevant follow-up can be attempted, then results retain the unresolved issue if no valuable further question remains.

## Rejected question experiment and remaining work

Two versions of a generic company-control question were tested with the doomer opening. Neither displaced the generic assumption question; the first scored only 0.32 for novelty. The trial question was removed from all catalogs. Detecting a dimension-level issue is insufficient: clarification needs the actual conflicting claims or a more precise semantic target. Scoped clarification is still required.

Other work remains: broader approved questions, two terse personas and simulation fidelity, scoped capability/policy/impact interpretations shared with projection, uncertainty stability checks, dynamic result visuals, full live regeneration and UI verification. The 0.65 novelty cutoff is a hypothesis, not a calibrated statistical-significance test.

## Running focused experiments

- `pnpm exec node --env-file=.env.local --conditions=react-server --import tsx scripts/experiment-routing.ts --allow-paid --max-requests=8`
- `pnpm exec node --env-file=.env.local --conditions=react-server --import tsx scripts/experiment-openings.ts --allow-paid --max-requests=24`
- Add `--persona=dogmatic-doomer` to the opening replay for that case only.

Each command uses saved evidence, real Jev, and a shared physical-request bound. Reports overwrite fixed files under ignored `eval/runs/`; they do not create historical journey entries or replace the live suite. Routing replay diagnoses recorded candidate sets, so cannot evaluate newly added questions. Opening replay exercises the current full engine. Neither substitutes target scores for persona answers.

## Checkpoint 2: broader prompts and terse participants

Added capability-by-2040, general policy, uncertainty and effects-over-time prompts; simplified six existing questions. Added two deliberately terse participants and instructions that prevent technical questions from upgrading novice expertise.

The full 15-persona run produced 42 accepted answers and used 109 Jev requests ($0.317 estimated combined inference). No new broad question or grounding question won selection. Most interviews stopped after 2–3 answers. This is not sufficient evidence of improvement: the alarmist, doomer and novice stopped unplaced. Novelty values of 0.5–0.6 for useful unasked distinctions were rejected by the initial 0.65 cutoff. Dimension coverage also hides differences within a dimension. The direct outlook interpretation and router must share scoped gaps before early stopping is trustworthy.

The shorter participant instructions also caused the dogmatic opening to omit its incompatible claims, so the normal suite no longer exercised within-answer contradiction handling. Restore that persona-specific stress case without supplying any desired judgments.

## Checkpoint 3: shared scoped interpretation and live comparison

The next full 15-persona run used 75 answers and 212 Jev requests ($0.601 estimated). The alarmist and doomer now had outlook coordinates near 0.003; their demonstrated reasoning differed sharply (0.88 versus 0.19). Capability-by-2040 was selected four times, general policy once, and effects-over-time once. Grounding remained unselected. All personas used five answers: the permissive 0.5 novelty threshold admitted several weak late follow-ups.

The map now directly interprets the participant’s adopted overall expectation. It does not calculate an overall opinion by averaging separate benefit/harm coordinates. This deliberately leaves genuinely unspecified balances unplaced: several cautious personas describe possibilities and conditions without adopting a net expectation. Added a simple overall-impact question to elicit that distinction when useful. An unknown balance is not a moderate worldview.

The shared profile is evaluated once per accepted-answer revision, before routing. Its five separate facets cover overall impact, capability ceiling, development pace, deployment conditions and access. Per-answer debug results include partial profiles before result eligibility; this does not automatically end an incomplete interview. Displayed facet cards require a supported category; model probabilities are never described as calibrated statistical significance. Missing category mass widens ranges instead of disappearing during normalization.

Removed the extra multiplication of semantic question utility by coarse dimension coverage and the early timing bonus. General coverage remains useful for shortlisting. Projection benefit now includes the participant’s policy, capability and explanatory distinctions, rather than only two map axes. The latest novelty threshold is 0.6, between the two observed failure modes; it remains experimental.

The doomer’s explicit contradiction received only 0.51 tension probability in the full run. A lower initial 0.5 screen now precedes a source-pair verification. In the focused replay, the exact incompatible pair received 0.92 and produced a quoted clarification. The coherent conditional high-risk accelerator scored only 0.08 for tension and received results after its first answer. The uncertain novice also received results after one answer, honestly unplaced. Actual subsequent replies and whole-suite effects still require the final regeneration.

`pnpm journeys:review` now summarizes usage, unused questions, effort in words, supported facets and review flags from the current recorded suite. Small score/readiness changes are only prompts to inspect the answer; they are not proof of no useful information.

### Grounding intervention and clarification-loop regression

A bounded two-persona intervention compared the highest-ranked timing question with the existing grounding question, using the same recorded opening and newly generated replies (18 Jev requests, four Sol replies, $0.031 estimated). The terse pragmatist used 13 versus 14 words; grounding elicited actual experience editing emails and checking mistakes. The organizer used 42 versus 46 words; grounding elicited an explicit analogy with prior automation instead of another forecast. These are observed qualitative gains, not a randomized efficacy claim.

Added a shared `central_basis` judgment that distinguishes having explained the basis of a central expectation from simply having expressed that expectation. If the basis is clearly missing (at least 0.75 gap), the existing grounding question gets a one-point priority bonus and a 0.5 novelty threshold. Other candidates retain 0.6. A poor but explicitly offered basis, an explicit lack of basis, or an explicitly undecided outlook is not a reason to repeat the question. The per-candidate threshold is recorded in debug rankings.

The following 15-persona run completed in 39 answers and 118 Jev requests ($0.307), with four one-answer completions. It exposed a repeated quoted clarification for the doomer. Deduplicate source pairs and treat the answer to a tension clarification as the opportunity to explain it; if the conflict remains, retain it in results rather than asking the same question again. A regression covers a participant doubling down. One final full-suite verification remains after these fixes.

### Focused readiness

The next suite asked grounding six times. A terse worker still reached the five-answer harness limit with only 46% broad coverage despite having explained their jobs concern, its observational basis, possible service benefits, distribution and desired worker rights. That is a taxonomy-completion requirement, not useful elicitation.

Result eligibility now also accepts a focused core: current-revision overall-outlook interpretation has at most 0.15 probability of not being expressed (explicit unknown is allowed), its basis is established at least 0.75, and at least two reasoning dimensions have supported evidence at least 0.7. Existing substantive-answer, outlook and reasoning requirements remain. Coverage is not inflated. Missing dimensions remain missing and keep the result provisional. A regression checks that stale profile judgments cannot unlock this route.

Contradiction screening is now deliberately sensitive (0.35), followed by the independent concrete pair check. The doomer’s clear “nobody controls it, and labs control everything” formulation scored only 0.44 at the initial screen in a later run. Clause selection now also handles “, and”; selecting a quotation pair still needs at least 0.5 probability. A high-confidence no-pair result discards the tentative issue before the shared profile is interpreted.

## Final verification

Latest live suite: `1789849060050-17c2e5ec-93aa-4b42-90fb-fe462ca8654c` — 15 personas, 37 accepted replies, 113 physical Jev requests, estimated combined cost $0.2823, zero failed journeys. Every usable answer has a saved result and input state, including partial profiles before broad coverage eligibility. Only the current live suite and the separate current mechanical baseline are retained in the inspector's store.

- Fourteen personas automatically finish within the five-answer harness allowance. High-risk acceleration and explicit open uncertainty finish after one answer. The terse worker uses all five opportunities; the app remains eligible to show results and can offer further useful exploration up to its ordinary cap.
- Grounding is asked five times, versus none in the original audit. Direct overall-impact is used once. The broader capability, policy and changing-impact questions had opportunities in earlier full experiments; they need not be forced into every stochastic regeneration. Latest counts are reproducible with `pnpm journeys:review`.
- Alarmist outlook: 0/100 from the first answer; final demonstrated reasoning 76/100. Dogmatic doomer: about 0.5/100 outlook and 24/100 reasoning. Outlook extremity is not rewarded as reasoning quality.
- The doomer receives one source-quoted clarification, then results; no repeated clarification. Coherent conditional high-risk acceleration is not treated as a contradiction.
- Playful recovery finishes at 51.5% broad coverage after a useful grounding answer. The focused-core route avoids filling unrelated dimensions while preserving an unknown overall outlook.
- Seven overall outlooks remain unplaced. These are conditional or explicitly unresolved balances, not arithmetic midpoints manufactured from possible benefits and harms. The cautious public proxies, novice and skeptic deserve continued human review of scope and wording; fewer answers alone is not proof of improved fidelity.
- New capability/policy cards are displayed only for supported interpretations; separate benefits/harm graphics and underlying evidence remain inspectable. UI checks cover first-answer automatic results, voluntary exploration, desktop/mobile journey disclosures, and placed/unplaced map states.

Validation: 168 unit tests; type, lint and content checks; current mechanical baseline; focused live comparisons; repeated full live suites; browser verification. These are development observations, not held-out validation, calibrated confidence intervals or a causal estimate of efficiency gains. Participant simulation and Jev judgments still vary across regenerated wording. Source-pair verification and current-revision caching address observed failure modes without claiming to remove model variance.

The original audit's follow-ups on late low-value questions, within-answer tension detection, question opportunity, projection disagreement, policy conflation, persona verbosity and automatic stopping are addressed in this round. Next experiments should use fixed-prefix holdouts and human recognizability judgments to calibrate stopping and interpretation thresholds, rather than adding generic questions to fill every dimension.
