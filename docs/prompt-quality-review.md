# Participant question quality review

2026-09-17 · Authoring/runtime feedback checkpoint · All 34 authored prompts inspected locally; no paid semantic evaluation.

## Recorded feedback

Travis rejected `grounding.source`, “Where could someone check the evidence that matters most to your view?” It did not elicit useful information about his beliefs, was insufficiently actionable, and immediately made him want to leave the experience. This is product feedback to preserve, not a participant reasoning deficit.

The prompt asks for citation location without establishing a concrete belief, observation, mechanism or update condition. A URL by itself cannot demonstrate grounded understanding or updateability. Participants should be able to describe experiences or reasoning without homework, citations or technical vocabulary.

## Why it reached the demo

This is an authored draft in the 34-prompt catalog, not a question Jev generated. Its `prerequisites` are empty, `permittedAfter` is `*`, and its target vectors are grounded understanding and updateability. Those broad tags made it eligible whenever such coverage might help. Jev judged four benefits of eligible candidates; code combined benefits, missingness, effort and repetition penalties to choose one. Neither eligibility nor those targets constituted question-level editorial validation. Without the specific operation trace, this explains how it could be selected, rather than asserting its exact winning scores.

The earlier representative-batch approval established direction; it did not individually approve every later prompt. The gap was insufficient question-level scrutiny and safeguards against unsupported premises. Draft/demo priority must not be treated as evidence that every question is useful.

## Changes applied

- [x] Exclude `grounding.source` from future routing in every supported corpus. Retain its historical authored record so saved questions/answers still validate; it is no longer in the offered question pool. An already-issued question remains in history and can be skipped.
- [x] Also retire `tension.general`, `control.failuremode` and `crux.test`: each is vague or assumes information not established by its prerequisites. They require concrete replacements/premise support before reinstatement.
- [x] Gate `conviction.general` on current horizon evidence. A capability-trajectory correction without replacement timing removes that premise. Fix its calibration gap lookup to use the actual `conviction` novelty group.
- [x] Supply one shared routing question policy: favor concrete, answerable belief elicitation; unsupported presuppositions have zero benefit on all routing dimensions; citation location alone earns no benefit. This adds no stage or paid test, and repeats no participant text in criteria.
- [x] Keep useful observation-based grounding (`grounding.general`) and belief-changing developments (`crux.general`). They elicit why the participant believes something without requiring source hunting.

The catalog retains 34 historical authored entries; four are retired, leaving the root plus 29 possible follow-ups before normal eligibility gates. This runtime policy is part of algorithm `0.3.0`. Pinned source corpora, prior answers and historical results are preserved. An already-issued retired question is not silently rewritten.

## Audit of the entire catalog

“Keep” is a local editorial judgment, not a claim of reviewed semantic performance. “Watch” indicates a concrete remaining authoring or context-binding risk. Suggested revisions are proposals, not automatically added runtime questions.

| ID | Assessment | Information sought / improvement |
| --- | --- | --- |
| `root` | Keep | Broad worldview and reasons; intentionally the only broad opening question. |
| `concrete.general` | Keep | A concrete expected change. Useful after a broad or uncertain opening. |
| `timeline.general` | Keep, context needed | Expected timing or “never.” Ask only when a scale/outcome is identifiable; do not keep pressing someone who cannot forecast. |
| `conviction.general` | Gate added | Conviction about an expressed timeline. Previously could ask about timing before any existed. |
| `mechanism.general` | Keep, context needed | Conditions producing the expressed outcome. Requires an identifiable outcome. |
| `grounding.general` | Keep | Observation/experience shaping an expectation. Accept lived experience and reasoning; no citation requirement. |
| `control.general` | Watch | Risks implying that very powerful AI is expected and control is possible. Future wording: “What makes you think people will—or won’t—be able to control more capable AI?” |
| `governance.general` | Keep | Expectations about institutional behavior, independently of preferred policy. |
| `upside.general` | Keep | Most consequential benefit. Do not force benefits into a user’s account merely for balance. |
| `risk.general` | Keep | Most consequential harm. Do not force concerns into an account merely for balance. |
| `crux.general` | Keep | A belief-changing development. Stronger than asking the participant to construct an unspecified test. |
| `countercase.general` | Keep | Strongest reason an expectation may be wrong. Avoid repeating an alternative already addressed. |
| `agency.general` | Keep | Values about human continuity; broad wording is appropriate to this distinct values dimension. |
| `transition.speed` | Keep | Beliefs about causes of faster/slower progress. |
| `transition.warning` | Watch | Assumes hard-to-reverse change and available warning. Future: “Would you expect warning before a major AI-driven change becomes hard to reverse? What would it look like?” |
| `transition.feedback` | Watch, expert/context only | Self-improvement bottlenecks. Expert familiarity plus broad transition evidence does not establish belief in AI-assisted research; shared policy must reject an absent premise. |
| `upside.distribution` | Keep | Distribution of an expressed benefit. Useful when actors/beneficiaries are unclear. |
| `upside.bottleneck` | Keep, context needed | Mechanism taking a named benefit to people. Requires a concrete benefit. |
| `risk.catastrophe` | Keep | Separates irreversible/catastrophic harm from ordinary harm; accept “no” and uncertainty. |
| `risk.misuse` | Keep | Most concerning harmful use, if any. Explicitly permits none. |
| `risk.ordinary` | Watch | “Which failures” is underspecified. Future: “What AI-related harm would be serious but still recoverable, and why?” Avoid assuming the user expects such harm. |
| `control.test` | Watch | Could sound like the participant must design a technical evaluation. Future: “What evidence would make you more confident that people can control a powerful AI system?” Accept no convincing evidence. |
| `control.failuremode` | Retired | Assumes a proposed oversight method. Future replacement must name that method and ask what could go wrong with it. |
| `governance.incentives` | Keep, context needed | Mechanism behind stated lab behavior. Requires an actual expectation, not just coverage in the governance vector. |
| `governance.coordination` | Watch | Assumes cooperation is desired/plausible. Future: “Do you expect competing labs or governments to cooperate on AI safety? Why or why not?” |
| `agency.consent` | Keep | Values about consent and refusal. Useful distinct from a capability forecast. |
| `action.tradeoff` | Watch | Too broad when no policy preference is known. Future: “What cost or downside would you accept for the AI policy you favor?” Bind to an actual policy; leave map placement independent. |
| `grounding.claim` | Keep, context needed | What a mentioned example does/does not establish. Broad groundedness coverage alone does not establish an example; shared policy must reject that absent premise. |
| `grounding.source` | Retired; direct user feedback | Citation location is low information. Existing `grounding.general` is the useful alternative; no substitute URL question. |
| `crux.test` | Retired | Unspecified assumption plus request to devise a check. Prefer `crux.general`; any replacement must name the actual assumption and ask what observation would change confidence. |
| `tension.general` | Retired | Vague “expectations fit together,” without naming a tension. Future replacement must identify both relevant beliefs and allow the user to reject the apparent tension. |
| `scope.assumption` | Keep, context needed | Most consequential assumption behind an identifiable outcome. Honest “I’m unsure” is useful. |
| `timeline.milestone` | Keep | Observable milestone tied to the described future; complements calendar timing. |
| `mechanism.chain` | Watch, expert/context only | Weakest causal link, but assumes an articulated chain. Future: “Which part of your explanation are you least sure about, and why?” |

## Required authoring standard from here

Each candidate must elicit one useful belief, expectation, value, mechanism, assumption, uncertainty or update condition. Write a short example answer and identify what the answer could change in the assessment. If the answer is just a URL, a slogan, or “what do you mean?”, revise it. Ask one clear question, permit disagreement/uncertainty, and avoid source-hunting assignments.

Contextual references such as “that outcome,” “your method” or “the example” require an identifiable antecedent in the actual usable conversation. Broad vector coverage and expertise are insufficient premise checks. The current shared policy improves candidate-benefit judgments but is not a proven deterministic gate for every semantic premise. The watch items above remain open for experience-driven refinement.

- [ ] Refine watch items in a new authored revision with explicit answerability examples and context requirements; preserve old prompt instances.
- [ ] Add realistic development journeys where no example, method, causal chain, timeline or policy has been stated, and where the user rejects the apparent premise.
- [ ] Review routing choices in the demo before committing to those replacements; use fixtures for structural regressions and no paid pressure testing.
- [ ] Include question usefulness, redundancy, premise correctness and perceived effort in the later reviewed evaluation set. Do not equate smooth engine execution with good questions.
