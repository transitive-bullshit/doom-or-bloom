# Assessment Methodology

## Model layers

The assessment maintains three distinct layers:

1. **Worldview profile:** what the participant appears to believe and value.
2. **Epistemic profile:** qualities demonstrated by how the participant forms and supports those beliefs.
3. **Assessment state:** evidence, coverage, ambiguity, interpretation confidence, and versions.

Do not collapse these layers into a single score before the final participant-facing projection.

## Worldview basis vectors

| Vector | Meaning |
| --- | --- |
| Capability trajectory | Expected capability ceiling, milestones, timelines, and the possibility that transformative AI does not arrive. |
| Transition dynamics | Slow/fast takeoff, AI-assisted AI research, recursive improvement, diffusion, and available warning time. |
| Beneficial potential | Magnitude, likelihood, and distribution of gains in health, science, prosperity, governance, and flourishing. |
| Risk landscape | Likelihood and severity across misuse, loss of control, ordinary failures, and systemic disruption. |
| Technical controllability | Expected tractability of alignment, monitoring, containment, corrigibility, and defense. |
| Institutional competence | Ability of labs, markets, states, and international institutions to govern races and respond in time. |
| Human agency and continuity | Whether good futures preserve human control, involve integration, or transition toward posthuman or digital successors. |
| Action posture | Preferred pace, access model, safeguards, regulation, coordination, and accepted trade-offs. |

Action posture is modeled independently from expected outcomes. It may correlate with Doom–Bloom placement but never defines it.

## Epistemic basis vectors

| Vector | Meaning |
| --- | --- |
| Causal clarity | Explains mechanisms rather than asserting outcomes. |
| Scope discipline | Distinguishes horizons, actors, conditions, and meanings. |
| Appropriate uncertainty | Expresses confidence proportionately and preserves known unknowns. |
| Internal coherence | Related positions fit together after assumptions and scope are clarified. |
| Counterargument engagement | Represents serious alternatives rather than dismissing them. |
| Updateability | Identifies evidence or developments that would materially change the view. |
| Grounded understanding | Connects claims to identifiable evidence and characterizes material references accurately. |

Domain familiarity is tracked for routing and resources but is not itself epistemic quality. A material factual misunderstanding can lower grounded understanding and may undermine causal coherence when the argument depends on it.

## Evidence representation

Each meaningful judgment should retain:

- The answer and exact supporting excerpt or segment identifier.
- Any recognized entity, event, or publication.
- The participant claim drawn from that reference.
- Whether the belief was stated, strongly implied, weakly inferred, disputed, or unassessed.
- Participant conviction when expressed.
- Relevant horizon and assumptions.
- Interpretation distribution and confidence.
- Unresolved ambiguity or tension.

Derived scores are summaries of evidence, not new independent evidence.

## Fixed root and adaptive continuation

The only fixed prompt is:

> **What do you think AI means for our future—and why?**

Every later prompt is chosen from authored families such as concretization, timeline, mechanism, countercase, grounding, control, governance, upside correction, risk correction, and crux.

Routing priority:

1. Resolve material ambiguity.
2. Fill high-impact missing coverage.
3. Test a consequential causal claim or tension.
4. Probe a neglected positive or negative side when genuinely relevant.
5. Reduce uncertainty in the participant-facing projections.

Candidate follow-ups receive a deterministic priority using Jev judgments as inputs:

```text
priority =
  important_coverage_gain
  + material_ambiguity_resolved
  + consequential_tension_tested
  + projection_uncertainty_reduced
  - participant_effort
  - repetition
```

MVP weights are authored configuration and must be evaluated, not presented as information-theoretically optimal.

## Question budget and readiness

- Result eligibility begins after three substantive answers.
- Typical assessment: 6–8 prompts.
- The participant may request results once eligible.
- Results can be provisional; weak evidence widens interpretation ranges and marks components as unassessed.
- Clarification after results reopens the assessment.
- Warn at 45 lifetime prompts; hard stop at 50.
- A response that is empty, purely navigational, or not an answer does not consume a substantive-answer minimum but still needs abuse/cost controls in implementation.

Readiness depends on relevant coverage and resolved interpretation, never on agreement, sophistication, moderation, or a high epistemic score.

## Answer relevance and bounded recovery

Treat off-topic replies, nonsense, and mockery without usable assessment evidence as expected inputs. Judge whether an answer supplies interpretable evidence, not whether the participant is sincere or deserves a result. Humor, sarcasm, profanity, criticism of the assessment, unconventional beliefs, imperfect English, and honest uncertainty can all accompany a usable answer. A relevant partial answer can be accepted while its unanswered targets remain uncovered; a useful worldview statement need not follow the prompt perfectly.

Use these response dispositions, separately from quality scores:

| Disposition | Meaning | Behavior |
| --- | --- | --- |
| `usable` | Provides relevant interpretable evidence, including a stated lack of knowledge or uncertainty | Accept supported evidence, count at most one substantive answer for the prompt instance, and resume ordinary routing |
| `needs_clarification` | Intended meaning or relevance is unclear | Give an authored neutral clarification/rephrasing; do not guess a position or trigger the Easter egg |
| `non_answer` | Clearly contains no usable assessment evidence, such as unrelated content or uninterpretable nonsense | Give an authored recovery response; exclude it from scoring and substantive-answer counts |
| `navigation` | Requests skipping, stopping, restarting, or viewing results | Offer the relevant UI action under existing eligibility rules; do not infer worldview or intent to mock |

Only a high-confidence `non_answer` may advance the clear-miss streak. Version and evaluate this threshold with the rubric; uncertain classifications follow `needs_clarification`. An accepted or ambiguous answer resets the streak; explicitly stopping clears it, and restarting creates a new assessment. Empty input, other navigation, failed inference, refresh, and duplicate submission do not advance it. Simply switching prompts does not erase consecutive clear misses.

Recovery policy for MVP:

1. After the first clear miss, briefly explain that the answer could not be connected to the question and invite another try. Re-show the same prompt with authored guidance; preserve the participant's text for editing.
2. After two consecutive clear misses, pause automatic questioning and offer the paperclip interlude defined in [PRODUCT.md](PRODUCT.md#answer-recovery-and-paperclip-interlude). This is a playful UI state, not an inference that the participant “doesn't care.” Show it at most once per assessment, persisting that marker across reloads.
3. Permit at most **two recovery submissions after the original submission per prompt instance**: three successfully evaluated submissions in total. An explicit “Try again” after the interlude uses remaining attempts; it does not reset the budget. At exhaustion, pause with options to try a different authored question, view an eligible result, stop, or restart. Repeated ambiguity uses the same bound but pauses neutrally without paperclips.
4. Re-showing/rephrasing the same elicitation goal is the same prompt instance; preserve the displayed variant with each attempt. The fixed root wording stays intact, with recovery guidance beneath it. Choosing a different question issues a new prompt and consumes the lifetime budget; its selection uses prior usable evidence or a deterministic authored fallback, never the nonsense reply.
5. A usable answer ends recovery and clears the consecutive-miss streak. Rejected attempts never add coverage, lower Epistemic Quality, or become factual evidence in later judgments. Preserve them separately as bounded local interaction history for recovery/debugging, explicitly excluded from scoring context.

Provider retries are distinct from recovery submissions and must be idempotent with respect to counters. Navigation and validation failures remain subject to request/rate limits but do not consume semantic recovery attempts. The lifetime cap takes precedence over recovery: after processing prompt 50, finalize from usable evidence, with an insufficient-evidence state if necessary. Before result eligibility, stopping preserves a paused assessment and creates no invented placement. The paperclip interlude is never a substitute assessment result.

## Reference handling

Recognizing a name or incident is not sufficient evidence of understanding. Evaluate separately:

1. Reference identification.
2. Attribution accuracy.
3. The participant's claim.
4. Evidentiary fit between reference and claim.
5. Preserved uncertainty and disputed details.
6. Whether the argument depends materially on the reference.

When a likely factual misunderstanding is both high-confidence and decision-relevant, prefer a neutral clarification if question budget permits. Otherwise surface it carefully in results. Never belittle the participant or treat the snapshot corpus as infallible.

## Participant-facing projections

### Doom–Bloom

The horizontal projection estimates the participant's overall expected impact of advanced AI on humanity. It integrates positive and negative outcomes, likelihood, severity, distribution, and human continuity.

It is not:

- One minus a probability of doom.
- A participant-stated numerical forecast.
- A proxy for accelerate/pause policy preference.
- A moral judgment.

### Epistemic Quality

The vertical projection composes demonstrated reasoning, grounded understanding, appropriate uncertainty, internal coherence, and updateability. Detailed components stay separate internally.

Missing evidence widens the interpretation range; it does not lower the score. Technical vocabulary, credentials, and ideological centrism do not score points.

### Interpretation ranges

Jev distributions over authored qualitative categories may be projected into a position and range. This is an assessment interpretation—not the participant's event probability and not a statistically validated confidence interval.

## Corrections and clarification

Results expose a small set of central inferred claims. “That’s not quite my view” lets the participant choose a disputed inference and clarify in natural language. Re-run the relevant judgments, evidence ledger, routing, and projections.

Participants may correct the assessment's interpretation; they may not directly edit a score or coordinate. Corrections provide valuable quality telemetry without being treated as ground truth automatically.

## Procedural neutrality

- Apply identical rubrics across worldview positions.
- Reward coherent extreme views over poorly supported moderation.
- Separate facts, forecasts, values, and policy.
- Use balanced adversarial test profiles.
- Publish methodology, simplifications, corpus criteria, and known biases.
- Prefer primary sources while preserving disputes and uncertainty.
- Do not claim that editorial choices are value-free.
