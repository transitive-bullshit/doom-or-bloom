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
