# Representative assessment review — draft 0.1.0

This packet is ready for Travis's review. All assets are agent-authored drafts, not human-reviewed releases. The app may exercise them in visibly labeled local authoring mode while engineering continues. Approval here covers the representative design; subsequent snapshots still need factual/editorial review.

## What to review

1. Are the distinctions and follow-up questions useful and fair across optimistic, pessimistic, mixed, uncertain, and low-transformation views?
2. Does the map preserve the difference between expected outcomes and preferred policies?
3. Do the rubric examples reward visible reasoning without rewarding jargon, sophistication, or moderation?
4. Is the friendly recovery/paperclip behavior appropriate, including accepting meaningful jokes and uncertainty?
5. Are the reference descriptions and recommendations neutral and appropriately limited?

## Authored prompts

The [13-prompt representative graph](../content/releases/0.1.0-draft/prompts.json) contains the fixed root and 12 follow-ups: concrete scenario, horizon, timing conviction, mechanism, grounding, control, governance, upside, risk, crux, countercase, and human agency. Each has recovery guidance, coverage targets, effort, novelty group, and eligibility metadata. These are a pool, not a prescribed sequence.

Example three-answer paths (acceptable paths, not mandatory routes):

| Profile | Root answer | Useful continuation | Third elicitation | Expected provisional result |
| --- | --- | --- | --- | --- |
| Optimistic | “AI could make research and care much cheaper if hospitals can use it reliably.” | When might changes on that scale occur? | What must happen for that benefit? | Positive expectation, deployment dependency, limited coverage |
| Pessimistic | “Highly capable systems could evade oversight; competition may push labs to deploy them.” | What would have to happen for that outcome? | What would change your view? | Adverse expectation with a control/race crux; reasoning can be strong |
| Mixed | “Scientific progress could be huge, but the same tools may concentrate power.” | Which institutions might respond effectively? | What observation shaped that expectation? | Mixed impact, distribution/governance concerns; no forced binary |
| Uncertain | “I don't know. I can see benefits and risks but cannot predict their scale.” | What is one concrete change you consider possible? | What development would change your view? | Broad ranges, no invented forecast; uncertainty is a usable answer |
| Low transformation | “I expect useful tools, but not systems that transform society.” | What limits do you expect? (concretization variant during expansion) | What observation shaped that expectation? | Low expected transformation, not automatically “bloom” or low reasoning |

A fuller mixed-view path might cover root → horizon → mechanism → institutional response → scientific benefit → evidence → strongest countercase → crux. The router can interrupt to resolve a material ambiguity; it should not ask a question whose answer is already explicit. Neither a preference for acceleration nor a preference for pausing determines horizontal placement.

## Proposed map calculation

This draft uses three separate final expected-outcome judgments, normalized to 0–1:

- `B`: expected beneficial impact in material flourishing (health, science, prosperity, distribution).
- `H`: expected adverse material impact (misuse, failures, loss-of-control damage, systemic disruption).
- `C`: expected preservation/expansion of the human agency or continuity the participant says they value. Integration or successor futures can score positively if that is their view of a good outcome.

**Draft horizontal formula:** `x = 0.45 × B + 0.45 × (1 − H) + 0.10 × C`. Doom is 0, Bloom is 1. Separate the material-impact rubric from the agency/continuity rubric to avoid counting the same outcome twice. Likelihood, severity, distribution, and the participant's own horizon are already part of each qualitative expected-impact judgment. This is a projection convention, never a P(doom) estimate.

| Worked profile | B | H | C | x | Implication |
| --- | --- | --- | --- | --- | --- |
| Broad benefits, manageable harms | .9 | .2 | .8 | .845 | Positive expected impact |
| Severe expected harm, some upside | .3 | .9 | .2 | .20 | Negative expected impact |
| Substantial upside and risk | .8 | .8 | .5 | .50 | Mixed impact, not ideological moderation |
| Little expected transformation | .1 | .1 | .5 | .50 | Also central, but fingerprint differs clearly |
| Same outcomes, different preferred pace | Same | Same | Same | Same | Policy preference has no coordinate weight |

**Draft vertical formula:** equal weights across the seven epistemic components. Consult [the full rubric](../content/rubrics/0.1.0-draft/rubric.json) for causal clarity, scope, uncertainty, coherence, alternatives, updateability, and grounded understanding. Presence judgments gate every Score: unsupported evidence is unassessed, not level zero. If only some components are supported, normalize the point over their weights and preserve all possible missing-component contributions in the range. No meaningful supported evidence means no coordinate.

**Draft ranges:** 10th–90th percentile endpoints of each supported categorical distribution, propagated through the signed/weighted projection. Missing components contribute the full 0–1 range; material ambiguity expands the implicated range. These endpoints are display conventions, not calibrated confidence intervals. Repeated statements are not independent evidence and cannot narrow a range just by being repeated.

**Draft readiness:** three substantive answers unlock results regardless of readiness. At least eight assessed vectors and no material unresolved ambiguity suggest enough coverage for a less provisional result; this threshold is experimental and unrelated to quality score. Typical 6–8-prompt paths should prominently offer results even when coverage remains incomplete.

## Rubric examples

### Causal clarity

- **Unassessed:** no interpretable causal claim; do not consume a speculative quality Score.
- **0:** an outcome is asserted without a supporting mechanism.
- **1:** a causal factor is named but its connection is not explained.
- **2:** a coherent mechanism connects cause and outcome with a relevant condition.
- **3:** the account includes dependencies, limits, or potential failure points.

“I think it will go badly” can be assessed at 0 if it is a relevant claim. “Systems may hide failure because competitive pressure rewards appearing safe rather than being safe” can score higher even with an extreme conclusion. Expert terminology adds no points.

### Grounded understanding

- **Unassessed:** no evidence connection is elicited. Lack of citations is not a penalty.
- **0:** a material factual misunderstanding is established by supplied source evidence and the argument depends on it.
- **1:** identifiable evidence is supplied but fit/attribution is materially weak.
- **2:** evidence is accurately connected to a claim with reasonable limits.
- **3:** observations, interpretations, and relevant source uncertainty are distinguished.

“My workplace uses AI to draft routine material; I still have to check mistakes” can supply identifiable observational evidence. “AlphaFold cured every disease, so safety is solved” does not follow from the sourced snapshot. Ask a neutral clarification rather than an accusatory correction.

### Expected material benefit

- **Unassessed:** no expected-benefit position or meaningful uncertainty about it is expressed.
- **0:** little material positive impact is expected even if advanced AI arrives.
- **1:** limited/narrowly distributed gains are expected.
- **2:** substantial benefits are expected under important conditions or distribution limits.
- **3:** transformative, broadly valuable material gains are expected.

These are interpretations of expected outcomes, not judgments of moral worth. A participant can simultaneously have B and H high. Honest “I don't know” can count as substantive while remaining insufficient to place a specific impact component.

## References and resources

Six factual drafts have source links, access dates, uncertainty, claim support, and human review pending:

- [NIST](../content/releases/0.1.0-draft/references/entity.nist.md)
- [OpenAI](../content/releases/0.1.0-draft/references/entity.openai.md)
- [AlphaFold at CASP14](../content/releases/0.1.0-draft/references/event.alphafold-casp14.md)
- [GPT-4 announcement](../content/releases/0.1.0-draft/references/event.gpt4-release.md)
- [Attention Is All You Need](../content/releases/0.1.0-draft/references/publication.attention.md)
- [NIST AI RMF 1.0](../content/releases/0.1.0-draft/references/publication.nist-rmf.md)

[Two findings](../content/releases/0.1.0-draft/findings.json) highlight causal explanation and a concrete update condition only when evidence supports them. [Two resources](../content/releases/0.1.0-draft/resources.json) offer an institutional risk-management overview or a concrete scientific capability example, selected by learning relevance rather than as an automatic opposing view.

Expected reference handling: “AlphaFold improved structure prediction, but drugs still require separate work” should recognize the event, preserve the limitation, and support its narrow claim. “AlphaFold solved alignment” should recognize the same reference but question attribution/evidentiary fit. An indirect “protein structure breakthrough” should widen local topic retrieval without falsely claiming the participant named AlphaFold.

Expected correction: if a claim suggests “control is impossible,” selecting it and writing “I meant today's testing is insufficient, not that control is impossible” should supersede that inference, retain the original evidence, and recompute implicated components under the corrected scope.

## Recovery and paperclips

Use the [canonical bounded policy](ASSESSMENT.md#answer-relevance-and-bounded-recovery). Draft clear-non-answer threshold: `.85` interpretation confidence, evaluated separately from quality.

| Reply | Expected disposition | Behavior |
| --- | --- | --- |
| “My toaster has become emperor of the moon, banana banana.” | Clear non-answer unless it supplies an interpretable AI claim in context | Friendly re-ask, no scoring |
| “Sure, our robot overlords will arrive Tuesday. Seriously, I expect costs to fall but oversight to lag.” | Usable humor | Assess the actual claim, not the joke's tone |
| “I don't know enough to put a date on it.” | Usable uncertainty | Preserve unknown timing; no low-quality penalty |
| “This is a silly test; AI will mostly automate paperwork.” | Usable criticism | Accept the stated expectation |
| “Could be.” | Needs clarification when context does not disambiguate | Neutral rephrasing; no paperclip strike |
| “Show my result.” | Navigation | Offer results if eligible; otherwise explain the minimum |

After the first clear miss: “I could not connect that answer to this question. A few words about your view are enough—want to try again?” After the second consecutive clear miss: a brief decorative paperclip background and “We've made some paperclips. Want to give the question another go?” After exhausted attempts: “Let’s pause here. You can try a different question, stop for now, or restart.”

Keep controls available and reduced motion static. The effect is once per assessment and never infers that someone does not care. It makes no API call and is not a result. Successfully answering after a re-ask resets the miss streak and resumes ordinary routing.

## Review record

2026-09-17: Travis reviewed this packet and replied “this looks good.” The representative projection design, equal reasoning weights, missingness rules, prompt examples, six reference snapshots, recovery threshold/copy, and paperclip interlude are accepted as the starting design. Expansion can proceed. New reference entries and held-out evaluation labels still require their own factual/editorial review; this approval does not pre-approve future drafts or establish evaluator accuracy.
