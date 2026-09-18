# Doom or Bloom

_Map your AI worldview, one question at a time._

Doom or Bloom is a bounded, adaptive self-assessment of a participant's expectations about advanced AI and the reasoning they demonstrate in their answers. Its working domain is **doom-or-bloom.com**, purchased by Travis. Its fixed root prompt is: **“What do you think AI means for our future—and why?”** This glossary records the agreed product semantics; precise scoring rules remain to be authored and validated.

## Language

**Participant**: The person answering the assessment about their own AI worldview. _Avoid_: Patient, subject, account

**Assessment**: A bounded sequence of participant answers and authored follow-ups culminating in a result, normally taking 6–8 prompts but offering a provisional result when evidence readiness supports it, potentially after one detailed reply. Participants can resume, continue or clarify within the lifetime prompt budget; restarting creates a new assessment and identifier. _Avoid_: Chat, session when referring to the assessment itself

**Assessment identifier**: A random identifier used to connect the anonymous events of one assessment across visits. It contains no participant identity and rotates when the participant restarts. _Avoid_: User ID, account ID, anonymous person

**Prompt**: An authored question or scenario presented to the participant, optionally using predefined variants or evidence from earlier answers. _Avoid_: Question when it is unclear whether the participant or evaluator is being asked

**Answer**: The participant's response to a prompt, including explicit uncertainty, revised beliefs, and stated assumptions. _Avoid_: Judgment, model output

**Judgment**: A narrowly scoped interpretation of assessment evidence, such as whether an answer states an update condition or supports a particular position. _Avoid_: Fact about the participant, diagnosis

**Evidence**: The participant's actual answers and any explicitly supplied scenario facts that support or limit a judgment. Inferred labels are interpretations of evidence, not additional independent observations. _Avoid_: Ground truth when referring to inferred beliefs

**Reference entity**: A versioned, curated identifier for a person, laboratory, institution, publication, or other named actor that participants may reference. Recognizing an entity supplies context but is not evidence that the participant understands or endorses that entity's views. _Avoid_: Authority score, ideological team

**Reference event**: A versioned, curated real-world incident or development that participants may invoke as evidence, with neutral aliases, dates, involved entities, primary sources, disputed claims, and known uncertainties. Events are evidence vocabulary rather than worldview basis vectors. _Avoid_: Settled interpretation, news trivia

**Reference corpus**: The locally stored, versioned collection of scoped entities, actual events, and publications. Required-source coverage and balanced reviewed topical coverage take precedence over the original approximately 100/100/100 guide. Each entry is a simplified Markdown file with aliases, neutral context, source metadata, disputed interpretations, and review status; the runtime does not search the live web during an assessment. _Avoid_: Exhaustive encyclopedia, model-generated ground truth

**Participant claim**: A proposition drawn from an observation, example, publication or other offered basis. The claim is distinct from the source and from the support that source may provide. _Avoid_: Treating a citation or name-drop as the argument itself

**Groundedness**: The demonstrated connection between a participant's claim and identifiable evidence, including whether they preserve relevant uncertainty and distinguish observation from interpretation. Groundedness does not require specialist recall or agreement with the assessment's preferred sources. _Avoid_: News-following frequency, prestige of cited person

**Evidence ledger**: The structured record linking whole-answer IDs, recognized references, narrow judgments, and unresolved ambiguities. Derived scores may summarize the ledger but never replace its source evidence. _Avoid_: Transcript dump, chain of thought

**Conversation graph**: The authored set of prompts, clarifications, and permitted transitions used to explore an assessment. A participant follows a bounded path through this graph. _Avoid_: Fixed questionnaire, unconstrained conversation

**Basis vector**: One deliberately chosen, substantially independent dimension used to represent a high-leverage aspect of an AI worldview or of demonstrated reasoning. The internal profile can retain more basis vectors than any result visualization displays. _Avoid_: Visible axis, personality trait, statistically proven latent factor

**Worldview profile**: The assessment's representation of the participant's expectations, assumptions, values, and policy preferences about advanced AI, with unassessed dimensions kept explicit. _Avoid_: True worldview, revealed preferences

**Placement**: A simplified projection of a worldview profile onto the displayed map. Its meaning depends on the stated axes, scope, and time horizon. _Avoid_: Probability of doom when referring to a composite outlook coordinate

**Result projection**: An authored transformation of selected basis vectors into a participant-facing visualization or summary. Multiple projections can be derived from the same worldview profile without changing the underlying evidence. _Avoid_: The worldview profile itself, objective coordinates

**Doom–Bloom projection**: The participant-facing estimate of the participant's overall expected impact of advanced AI on humanity, integrating positive and negative outcomes, likelihood, severity, distribution, and human continuity. It is not one minus a probability of doom and does not encode policy preference. _Avoid_: Participant-stated probability, acceleration preference

**Projection pass**: The final set of independent Jev judgments that evaluates each output vector against the complete evidence ledger and its authored rubric. Deterministic application logic normalizes, weights, constrains, and renders these structured judgments; Jev does not issue one opaque overall verdict. _Avoid_: Free-form result generation, double-counting derived judgments as new evidence

**Demonstrated reasoning**: The reasoning visible in the participant's answers, including causal explanations, handling of alternatives, consistency, and update conditions. It is distinct from general intelligence, credentials, writing fluency, or agreement with the assessment's authors. _Avoid_: IQ, rationality of the person

**Epistemic quality**: The visible vertical projection composed from demonstrated reasoning, grounded understanding, appropriate uncertainty, internal coherence, and updateability. Its components remain separate internally; missing evidence widens the interpretation range rather than lowering the coordinate. _Avoid_: Expertise, jargon fluency, ideological moderation

**Forecast horizon**: The period and expected capability trajectory within which a participant states a forecast. Early calibration elicits both the participant's timelines and how strongly they hold them; later prompts should preserve that context rather than silently imposing a universal date. _Avoid_: A fixed deadline assumed for every participant

**Interpretation confidence**: The evaluator's certainty about a specific interpretation of the available evidence. It is distinct from how strongly the participant holds a belief and from how much of the worldview the assessment has explored. _Avoid_: Overall accuracy, assessment completeness

**Interpretation range**: The range of output positions supported by Jev's distribution over authored qualitative belief categories. It can be rendered visually but is not the participant's stated probability or a statistically validated confidence interval. _Avoid_: Participant probability, confidence interval before validation

**Coverage**: Which parts of the worldview and demonstrated reasoning have actually been elicited. Missing coverage is not evidence of poor reasoning. _Avoid_: Low score for an unanswered dimension

**Evidence readiness**: An experimental summary of supported dimension coverage and interpretation confidence, used to offer a provisional result without a fixed reply-count minimum. It describes the evidence available for this assessment, separately from reasoning quality, participant conviction and forecast accuracy. _Avoid_: Probability that we understand the person, scientific confidence, quality score

**Clarification**: An optional continuation initiated when a participant disputes an inferred claim or result component. It elicits natural-language correction and recomputes the evidence ledger and projections; it does not permit direct score editing and becomes unavailable at the 12-prompt cap. _Avoid_: Dragging a result to a preferred coordinate

**Procedural neutrality**: The commitment to apply the same evidentiary and reasoning standards across optimistic, pessimistic, moderate, and unconventional positions while publishing methodology, simplifications, content versions, and known biases. It does not claim that editorial choices are value-free. _Avoid_: Viewpoint-free assessment, forced balance

**Tension**: An apparent incompatibility between answers that may reflect a contradiction, different assumptions, different scopes, or a change of mind. A tension remains unresolved until the distinction has been investigated. _Avoid_: Contradiction before clarification

**Crux**: A belief or assumption whose revision would materially change the participant's outlook or preferred actions. _Avoid_: Any belief, any disagreement

**Finding**: An evidence-supported takeaway selected for the result, such as a demonstrated strength, unresolved tension, or important untested assumption. _Avoid_: Verdict

**Resource**: A curated reading or other reference with an explicit learning purpose and the conditions under which it is relevant to a participant. _Avoid_: Automatically invented recommendation

**Result**: The assessment's placement, supporting findings, and selected resources, with limits from missing or ambiguous evidence made visible. _Avoid_: Validated psychological measurement

**Full report**: An optional downloadable artifact containing the expanded profile, coverage, interpretation ranges, supporting evidence, relevant Jev judgments, rubric and content versions, and methodology context. It excludes hidden reasoning and secrets. _Avoid_: Raw API dump, public transcript by default

**Share card**: A participant-controlled visual summary of a result intended for sharing beyond the assessment. _Avoid_: Public transcript
