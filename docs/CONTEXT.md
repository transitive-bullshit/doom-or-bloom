# Doom or Bloom

_Map your AI worldview, one question at a time._

Doom or Bloom is a bounded, adaptive self-assessment of a participant's expectations about advanced AI and the reasoning they demonstrate in their answers. Its fixed root prompt is: **“What do you think AI means for our future—and why?”** This glossary defines product semantics; [ASSESSMENT.md](ASSESSMENT.md) defines the current draft scoring rules and [PERSISTENCE.md](PERSISTENCE.md) defines ownership and lifecycle. The assessment remains unvalidated.

## Language

**Participant**: The person answering the assessment about their own AI worldview. _Avoid_: Patient, subject, account

**Assessment**: A bounded sequence of participant answers and authored follow-ups with a provisional result available when evidence readiness supports it, potentially after one detailed reply. Participants can resume a private assessment or continue their published assessment through an independent fork, within the applicable prompt budget; a fresh assessment starts a new conversation. _Avoid_: Chat, session when referring to the assessment itself

**Assessment identifier**: A stable identifier for one assessment across visits, publication, and ownership recovery. It is separate from participant identity and does not grant access to private content. _Avoid_: User ID, account ID, anonymous person

**Assessment owner**: The identity entitled to manage an assessment, initially anonymous and optionally recoverable through sign-in. Ownership is separate from the person a simulation represents. _Avoid_: Persona, public viewer

**Assessment snapshot**: An immutable record of an assessment at a particular point, keeping its conversation, evidence, and inferred result together. _Avoid_: Live profile, independent result

**Assessment status**: The owner-facing status derived from visibility and current results: In progress, Ready to publish, or Published. It is separate from interview recovery and operation processing. There is no explicit completion step; private assessments remain editable through additional answers. Published content is frozen while public; unpublishing permits further answers on the same assessment.

**Assessment fork**: A new private assessment created by the owner from their published assessment. It inherits the published conversation and permits additional answers or corrections without changing the original. _Avoid_: Public remix, editing the original, independent new evidence when referring to inherited answers

**Published assessment**: An assessment with results whose full conversation and inferred results are available to other visitors by public link. _Avoid_: Private share, anonymous aggregate

**Persona**: A curated representation of a public perspective used as the subject of simulated assessments. It is distinct from a real participant, authenticated owner, or endorsement. _Avoid_: Registered account of the represented person

**Simulated assessment**: An assessment answered by a simulation from a recorded persona/source brief, with provenance distinct from participant-submitted assessments. _Avoid_: The represented person’s own answers

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

**Doom–Bloom projection**: The map’s horizontal interpretation of the participant’s expressed orientation toward AI’s future, from concern to hope. Mixed, conditional or undecided outlooks can occupy the middle without forecasting equal benefits and harms. Overall expected impact remains a separate facet; P(doom), reasoning quality and policy preferences do not determine this coordinate. _Avoid_: Event probability, net-impact calculation, acceleration preference

**Projection pass**: The final set of independent Jev judgments that evaluates each output vector against the complete evidence ledger and its authored rubric. Deterministic application logic normalizes, weights, constrains, and renders these structured judgments; Jev does not issue one opaque overall verdict. _Avoid_: Free-form result generation, double-counting derived judgments as new evidence

**Demonstrated reasoning**: The reasoning visible in the participant's answers, including causal explanations, handling of alternatives, consistency, and update conditions. It is distinct from general intelligence, credentials, writing fluency, or agreement with the assessment's authors. _Avoid_: IQ, rationality of the person

**Epistemic quality**: The composite of the seven demonstrated-reasoning dimensions. It is displayed separately from the worldview map and retains the historical `result.vertical` field in saved data. Its components remain separate internally; missing evidence widens the interpretation range rather than lowering the score. _Avoid_: Map height, expertise, jargon fluency, ideological moderation

**Forecast horizon**: The period and expected capability trajectory within which a participant states a forecast. Routing can elicit missing timing or conviction when relevant; subsequent interpretation preserves the participant’s stated context and explicit uncertainty. _Avoid_: A fixed deadline or required question order assumed for every participant

**Interpretation confidence**: The evaluator's certainty about a specific interpretation of the available evidence. It is distinct from how strongly the participant holds a belief and from how much of the worldview the assessment has explored. _Avoid_: Overall accuracy, assessment completeness

**Interpretation range**: The range of output positions supported by Jev's distribution over authored qualitative belief categories. It can be rendered visually but is not the participant's stated probability or a statistically validated confidence interval. _Avoid_: Participant probability, confidence interval before validation

**Coverage**: Which parts of the worldview and demonstrated reasoning have actually been elicited. Missing coverage is not evidence of poor reasoning. _Avoid_: Low score for an unanswered dimension

**Evidence readiness**: An experimental summary of supported dimension coverage and interpretation confidence, used to offer a provisional result without a fixed reply-count minimum. It describes the evidence available for this assessment, separately from reasoning quality, participant conviction and forecast accuracy. _Avoid_: Probability that we understand the person, scientific confidence, quality score

**Clarification**: A scoped correction supported by the engine/API and persona runner when an inferred claim is disputed. It elicits new natural-language evidence and recomputes the interpretation within the applicable prompt budget. Claim-specific controls are currently absent from the participant UI, which instead offers continued answering; historical clarification records remain readable. _Avoid_: Direct score editing, historical answer editing, dragging a result to a preferred coordinate

**Procedural neutrality**: The commitment to apply the same evidentiary and reasoning standards across optimistic, pessimistic, moderate, and unconventional positions while publishing methodology, simplifications, content versions, and known biases. It does not claim that editorial choices are value-free. _Avoid_: Viewpoint-free assessment, forced balance

**Tension**: An apparent incompatibility between answers that may reflect a contradiction, different assumptions, different scopes, or a change of mind. A tension remains unresolved until the distinction has been investigated. _Avoid_: Contradiction before clarification

**Crux**: A belief or assumption whose revision would materially change the participant's outlook or preferred actions. _Avoid_: Any belief, any disagreement

**Finding**: An evidence-supported takeaway selected for the result, such as a demonstrated strength, unresolved tension, or important untested assumption. _Avoid_: Verdict

**Resource**: A curated reading or other reference with an explicit learning purpose and the conditions under which it is relevant to a participant. _Avoid_: Automatically invented recommendation

**Result**: The assessment's placement, supporting findings, and selected resources, with limits from missing or ambiguous evidence made visible. _Avoid_: Validated psychological measurement

**Full report**: An optional downloadable artifact containing the expanded profile, coverage, interpretation ranges, supporting evidence, relevant Jev judgments, rubric and content versions, and methodology context. It excludes hidden reasoning and secrets. _Avoid_: Raw API dump, public transcript by default

**Share card**: A participant-controlled visual summary of a result intended for sharing beyond the assessment. _Avoid_: Public transcript

**Anonymous ownership claim**: A transaction that transfers a browser’s assessments to its authenticated account, preserving IDs, snapshots and visibility. It then removes the anonymous owner and revokes its sessions. Failure leaves anonymous access intact. Authentication is optional; anonymous publications stay anonymous after sign-in. Explicit publication while signed in captures a public name, portrait, and profile link.
