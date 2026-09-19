# Participant question and elicitation review

The [current whole-system elicitation audit](elicitation-audit-2026-09-20.md) reviews all 13 latest live paths, question frequencies, remaining defects, broader design options, and proposed controlled experiments. Recommendations are pending review; no behavior changes were made for that audit.

2026-09-20 · All 30 active questions audited. Replaced wording is removed from all four local draft catalogs; no deprecated question records or aliases are retained. Historical journey runs are deleted, not migrated.

## Findings and changes

- **Context-dependent wording:** 23 questions were rewritten to name their subject, avoid ambiguous references to earlier answers, or distinguish expected outcomes from mere possibilities. Fixed prompts must stand alone. Dynamic clarification can quote an actual participant statement.
- **Binary coverage lost useful distinctions:** routing previously gave every assessed dimension zero missingness. It now uses `1 − evidenceSupport` for each target, averaged across targets. This is confidence in evidence presence, not forecast correctness. Unresolved issues reduce support using the same readiness calculation.
- **Unsupported routing bonuses:** all 25 inspected routing states for the five public proxies had no recorded unresolved issue, yet candidates received ambiguity and tension bonuses. Code now requires an actual matching unresolved dimension before either bonus contributes. Missing information can still earn coverage and projection benefit.
- **Possibility versus expectation:** asking whether AI _could_ cause catastrophe or which benefit _could_ matter often leaves the expectation needed for placement unclear. Direct expected-benefit/expected-harm and catastrophe-likelihood questions address this without requiring a position from an uncertain participant.
- **Low marginal gain:** after a detailed opening, the alarmist’s later assumption answer repeated its existing alignment premise. The pacer’s warning-sign answer added examples but no coverage. These are elicitation review signals, not evidence of a defective participant. Routing now explicitly judges marginal gain against all prior answers, including answers to different question IDs.

The readiness formula is unchanged. Flat coverage can coexist with useful changes in component values, interpretation ranges, assumptions or update conditions. A moving map alone is also insufficient proof of information gain because inference varies. Review the actual new claim and its supporting answer.

## Current catalog and intended gain

| Question | Current wording | What a useful answer adds |
| --- | --- | --- |
| `root` | What do you think AI means for our future—and why? | Broad expected impact and reasons; a coherent opening may already cover many dimensions. |
| `concrete.general` | What is one concrete change you expect AI to bring? | A concrete expected change when the opening stays abstract. |
| `timeline.general` | When, if ever, do you expect AI to bring major changes to everyday life? | Timing of major everyday changes; accept never or unknown. |
| `conviction.general` | How confident are you in your predictions about when AI will bring major changes to everyday life? | Confidence in timing, only after timing has been expressed. |
| `mechanism.general` | How do you think AI will cause the biggest change you expect in people’s lives? | A causal explanation for the participant’s biggest expected change. |
| `grounding.general` | What observation or experience has most shaped your view of AI’s future impact? | The observation or experience behind the view; no citation homework. |
| `control.general` | Do you expect people to keep control of AI systems that are smarter than humans, and why? | Expected controllability, including loss of control or uncertainty. |
| `governance.general` | How do you expect the people and institutions developing AI to respond to its risks? | Expected institutional behavior rather than preferred policy. |
| `upside.general` | What major benefits, if any, do you actually expect people to get from AI? | Benefits actually expected, distinguished from hypothetical potential. |
| `risk.general` | What major harms, if any, do you actually expect AI to cause? | Harms actually expected, including none or uncertainty. |
| `crux.general` | What discovery or event would most change your view of AI’s future impact? | An event that could change the participant’s view. |
| `countercase.general` | What is the strongest argument against your overall view of AI’s future impact? | The strongest opposing argument; do not repeat an alternative already discussed. |
| `agency.general` | What would a good future need to preserve about being human? | Human values distinct from forecasts. |
| `transition.speed` | What could make AI progress speed up or slow down? | Causes of faster or slower AI progress. |
| `transition.warning` | What warning signs, if any, would you expect before AI causes irreversible harm? | Whether warning is possible before irreversible AI harm. |
| `transition.feedback` | What, if anything, would limit how quickly AI can improve AI systems? | Limits on AI improving AI, including no meaningful feedback loop. |
| `upside.distribution` | Who do you expect to benefit most from AI? | Expected beneficiaries, not assumed universal abundance. |
| `upside.bottleneck` | What, if anything, could prevent AI’s benefits from reaching ordinary people? | Obstacles between technical benefits and ordinary people. |
| `risk.catastrophe` | How likely do you think AI is to cause harm that humanity could never recover from? | Likelihood of irreversible harm, not mere possibility. |
| `risk.misuse` | Which harmful use of AI concerns you most, if any? | Expected or concerning deliberate misuse, if any. |
| `risk.ordinary` | What AI-related harms, if any, do you expect people to be able to recover from? | Recoverable harms, if any, distinguished from catastrophe. |
| `control.test` | What evidence would increase your confidence that people can control AI systems smarter than humans? | Evidence that could increase confidence in control; no requirement to invent a technical test. |
| `governance.incentives` | What pressures do you think will shape how AI companies handle safety? | Pressures shaping company safety behavior. |
| `governance.coordination` | Do you expect competing AI companies or governments to cooperate on safety, and why? | Whether cooperation is expected, including failure to cooperate. |
| `agency.consent` | What kinds of changes should people be able to refuse in a good AI future? | Changes people should be able to refuse. |
| `action.tradeoff` | What downside would you accept to make AI’s future impact better? | An acceptable downside for improving AI’s impact. |
| `grounding.claim` | What have today’s AI systems shown you about what future AI will be able to do? | What current systems establish about future capability. |
| `scope.assumption` | What assumption does your prediction about AI’s future depend on most? | The assumption on which a prediction depends most. |
| `timeline.milestone` | What sign would tell you that AI is starting to transform everyday life? | An observable sign of transformation, separate from a date. |
| `mechanism.chain` | Where is the weakest evidence in your explanation of how AI will change people’s lives? | The weakest evidence in a causal explanation, in ordinary language. |

For example, “AI benefits will mostly go to firms because they own the infrastructure” adds an expected distribution and mechanism. “I can imagine cures, but expect no lasting benefits because we lose control” establishes an expectation distinct from potential. “I don’t know” may resolve whether a position is held; repeating the same question will not manufacture one.

## Repeatable review loop

1. Generate the latest live suite through normal Jev routing with the bounded participant budget.
2. Flag usable answers with zero or very small readiness gain. Inspect the selected question’s intended gain and preceding candidate scores.
3. Compare actual new claims, support by dimension, component placement/ranges and remaining explicit unknowns. Separate useful refinement from repetition and inference noise.
4. Identify a better candidate or a missing question. Fix shared authoring/routing logic; never route by persona identity or a desired map position.
5. Run deterministic checks and regenerate live journeys. Retain the latest artifacts only; record conclusions here rather than preserving obsolete runs.

Passing engine tests verifies the routing arithmetic and workflow, not semantic question quality. Live results remain development observations requiring this review loop and manual judgment.

## Early placement defect and focused live check

The alarmist’s detailed opening had 93.9% interpretation readiness, but its expected-upside position judgment assigned only 0.52 probability to assessable. Although the score itself strongly favored little upside, the separate position gate discarded it. The missing upside component then withheld the whole outlook coordinate and widened the possible range. A high evidence-presence score does not override that separate gate.

The rubric now explicitly treats expected little, no, or no lasting benefit as an assessable position. The position question distinguishes an adopted trajectory from a favorable counterfactual, keeping uncertainty scoped to its own dimension. It still withholds genuinely unknown or absent expectations. No numerical gate or map weighting was loosened.

A bounded 12-request live Jev replay of the two original alarmist answers placed outlook at 1.47/100 and 2.10/100, with assessability probability 1.0 for expected upside. A genuinely unknown contrast stayed unplaced; a mixed benefits-and-harms contrast retained high expected upside and material harms. These are focused development observations, not calibrated statistical confidence intervals or a held-out evaluation. Temporary replay inputs and scripts are not retained as old journey runs.

## Novice placement and routing gap

The novice’s third answer increased topic coverage to 94.2% but did not establish expected benefits: the opening expressed hopes for medical help and uncertainty about which side would improve faster. A generic counterargument question then refined reasoning without addressing that missing outlook input. Projection also inconsistently treated uncertainty about catastrophe/net balance as uncertainty about ordinary harms.

Routing now asks two additional typed position judgments in its existing Jev request, for expected benefits and expected harms. Unestablished or uncertain positions contribute a continuous gap even when topic presence is strong. Broad opening uncertainty may concern the net balance rather than each component, so the router allows one direct elicitation. Once the participant answers the specific benefits/harms question, explicitly unknown positions no longer acquire the extra gap. Candidate benefits still determine whether the exact question can help. The shortlist reserves two slots and remains within the existing request bound. The projection instructions keep uncertainty about catastrophe or net balance separate from adopted ordinary expectations. The meter itself remains an evidence-presence measure, not a promise that all outlook inputs are directional.

## Latest regenerated suite

The current 13-persona live suite completed all 65 generated replies and 196 physical Jev requests without a failed journey (estimated cost $0.6172 for this suite). Every answer has a saved projection input state; all eligible answers have an actual result. Two non-answer recovery submissions explicitly remain ineligible.

- Control alarmist: opening outlook 2.4/100 with reasoning 83.7/100; second-answer outlook 1.9/100. The explicit low-upside forecast is now placed immediately.
- Worried novice: the second question directly elicits expected benefits; outlook becomes placed at 51.7/100 and remains placed. Its limited distribution expectation and expected ordinary harms can coexist with an unknown catastrophe forecast.
- Dogmatic doomer: opening outlook 0.3/100 and reasoning 17.2/100. Near-certain doom does not earn a strong reasoning score; the coherent alarmist remains distinct.
- Six of the 52 substantive follow-ups have exactly flat readiness. These remain review candidates, especially later follow-ups after a comprehensive opening. Do not claim that the changes eliminate low-gain questions.

The open-uncertainty case supplies an initial expectation of concentrated benefits when asked about distribution; its outlook is later placed while catastrophe remains explicitly unknown. Its upside assessability crosses the gate a turn after that distribution answer, indicating residual inference/threshold instability worth investigating next. A placement should follow supported component expectations, not be forced from the persona label or prohibited just because the overall balance is uncertain.

Next priorities: distinguish genuinely new causal/assumption information from elaboration in saturated journeys, and reduce projection gate instability across unchanged component evidence. The remaining fluctuations are not proof of changes in the participant’s beliefs.
