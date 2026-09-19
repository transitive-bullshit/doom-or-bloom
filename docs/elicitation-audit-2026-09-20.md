# Elicitation audit: questions, routing, and worldview fidelity

Reviewed 2026-09-20. Analysis and proposed experiments only; no assessment behavior, question wording, or saved runs changed.

## Conclusion

The highest-leverage change is to select the next question around a specific unresolved distinction in the participant's account, rather than another broadly relevant dimension.

The current system can recognize coherent extremes, distinguish outlook from reasoning, accept uncertainty, and produce useful early results. But it too often asks for elaboration after already understanding a position, misses contradictions worth clarifying, and compresses distinct kinds of belief into scales that cannot faithfully represent them. Adding a few broader questions helps only if the router understands when they answer something still missing.

Keep the fixed root. Do not add a mandatory second question or require everyone to discuss superintelligence, extinction, and technical safety. Build a small adaptive interview whose next step can be another broad question, a focused clarification, or a recommendation to view the result.

## Evidence and limits

Inspected all 30 active prompts, all 65 substantive answers across 13 current live personas, their per-answer projections and raw Jev traces, the routing and projection code, participant-generation instructions, and participant-facing question/result components.

Current suite: `1789842382623-af760513-2ea5-48da-8b14-4d8e063995ec`, created September 19 at 18:33 UTC / September 20 local time. Tracked artifact: [live-persona-journeys.json](../eval/development/live-persona-journeys.json). Full traces are in the matching ignored local run directory. No inference was run for this audit.

These are development observations, not estimates of real-user prevalence or proof that a proposed alternative question would win. No counterfactual answers were generated. The proposals below need branch comparisons.

- 52 substantive follow-ups after 13 usable root answers; two additional scripted recovery submissions.
- 20 of 30 questions used, including the root. Ten unused questions are not automatically unnecessary.
- Every persona qualifies for a provisional result after its first usable answer.
- Opening answers range from 88 to 193 words, median 156. This suite does not test terse or fragmentary openings.
- Six follow-ups have exactly flat readiness; 21/52 gain less than 0.5 percentage points. This flags inspection, not automatic failure: new distribution, conditions, and values can matter without changing topic-presence readiness.
- No accepted-answer state records an unresolved ambiguity or tension.
- For 41/52 selected follow-ups, the weighted projection-usefulness term exceeds weighted coverage plus ambiguity plus tension. This comparison excludes the separate timing bonus.
- All journeys deliberately run five substantive answers. Their length is a harness choice, not evidence that five is the best stopping point.

## 1. Require an identifiable information gap before rewarding a question

**Observed, high impact.** The router suppresses coverage gain as topic-presence confidence approaches one, but projection usefulness remains an independent reward. It neither requires a named missing distinction nor compares the winning question with ending the interview. Semantic duplication is left to a long policy instruction; the deterministic repetition penalty only recognizes previously issued novelty groups.

Examples:

| Current journey | Evidence | What a better next step would resolve |
| --- | --- | --- |
| Control alarmist, answer 5 | The benefits-bottleneck answer begins “Extinction would prevent the benefits,” repeating the opening's central explanation. Before this question, expected benefits and harms are both assessable with probability 1.0. | If there is no consequential unresolved point, recommend results. If policy detail matters, distinguish limits on dangerous training from restrictions on ordinary uses. |
| Huang proxy, answer 5 | The milestone answer repeats writing, coding, searching, designing, and learning from answers 1–2. Readiness stays 92.4%. | Ask about a genuinely unexpressed condition, consequence, or policy distinction; otherwise stop. |
| Cautious builder, answer 4 | The milestone answer elaborates the same individual-as-organization account already given in answers 1–2. Gain is 0.07 points. | Check whether any new timing distinction is actually needed; milestone examples alone need not justify another turn. |
| Dogmatic doomer, answers 4–5 | The assumption and warning answers repeat hostile-machine and concealed-takeover claims. Readiness stays 99.6% through answers 3–5. | Clarify the incompatible claims, or report the remaining contradiction without trying to make the persona reasonable. |
| Abundance advocate, answer 5 | Zero readiness gain, but the answer specifies which underserved groups benefit. | Count the distribution refinement as potentially useful. Flat readiness alone cannot distinguish this from the repeats above. |

For the alarmist's fifth question, code gives about 0.0066 weighted coverage and 0.8733 weighted projection benefit, then subtracts 0.4 effort. It wins despite negligible coverage and already-established outlook components.

**Proposal:** before ranking, identify the answerable gaps that matter. A candidate must address one of them and offer a plausible distinction between materially different interpretations. Track whether the requested information was already supplied anywhere in the transcript, whether the participant explicitly does not know, and whether a further answer could change the report.

Use Jev for bounded judgments such as applicability, already answered, and likely useful refinement. These are different from the degree of benefit. Compare candidates against a “no useful follow-up” option. Do not merely lower projection's weight or equate useful progress with movement on the chart.

Sources: [routing.ts](../lib/assessment/routing.ts), [prompt-policy.ts](../lib/assessment/prompt-policy.ts), [engine.ts](../lib/server/engine.ts).

## 2. Detect and clarify contradictions within an answer

**Observed, high impact.** The dogmatic doomer says AI is dumb autocomplete and smarter than every human, and that labs both control it and have no control over it. None of its five states records an unresolved tension.

The current tension instruction asks whether the new answer is incompatible **with usableHistory**. That poorly covers contradictions within the opening answer. A single Choice among 15 dimensions plus “none” also makes multiple possible locations compete. Code then requires concentration confidence of at least 0.6 in the selected dimension. For the doomer's opening, “none” receives 0.67 and internal coherence 0.24. Later answers also select “none.”

Projection nevertheless gives this persona low reasoning scores. Scoring poor reasoning and actually investigating the participant's meaning are separate capabilities; the former works better here.

**Proposal:**

- Check consequential incompatibility both within and across answers, preserving different times, systems, conditions, and explicit revisions.
- Separate “is there a material unresolved incompatibility?” from “where is it?” Multiple implicated claims should not compete as mutually exclusive worldviews.
- Give the router a neutral clarification capable of resolving the exact uncertainty. For example: “How much control do you think AI companies have over what their systems do?” This stands alone and probes the doomer's conflicting control claims.
- If clarification reveals a real distinction, preserve it. If the participant repeats a contradiction, record that once and move on; low reasoning must not prolong the interview.

Use bounded per-scope Noul judgments or an existence judgment followed by localization when needed. Do not lower a threshold and call that contradiction detection. The high-risk accelerator is a necessary negative control: high risk plus support for building is not itself contradictory.

Sources: [tension template](../content/rubrics/0.1.0-draft/questions.json), [interpretation and issue insertion](../lib/server/engine.ts).

## 3. Broaden the interview where the current bank skips a necessary level

**Observed gaps; new wording is experimental.** We have many specialist follow-ups about controls, warning signs, and coordination, but few broad ways to establish what a participant thinks matters, which changes they expect, or which choices they favor.

Questions worth testing, conditionally rather than as a fixed sequence:

| Proposed question | Use when | What it distinguishes |
| --- | --- | --- |
| What do you expect AI to be capable of in the future? | Capability expectations are unclear. | Useful tools, a ceiling, much broader autonomy, or genuine uncertainty, without presupposing superintelligence. |
| Which effects of AI matter most to you? | Several concerns appear and their importance is unknown. | Whether to explore work, health, control, access, relationships, or another central concern. Keep importance separate from likelihood. |
| What do you think will most shape AI's effects on people's lives? | Outcomes are named but the central cause is unclear. | Technical capability, ownership, institutions, choices, physical limits, or another causal driver. |
| What, if anything, should change about how AI is developed or used? | Policy preferences are missing or only safeguards have been named. | Concrete desired action without assuming a pause, acceleration, or a willingness to accept unspecified downsides. |
| What are you most unsure about when you think about AI's future? | Several unknowns are active or the person is undecided. | A useful next uncertainty instead of steering everyone toward catastrophe. |
| How do you expect AI's effects on people's lives to change over time? | Near-term and longer-term expectations appear different. | Temporary benefits, persistent harms, diffusion, and later reversals without forcing a single date. |

The current broad grounding question is already good: “What observation or experience has most shaped your view of AI’s future impact?” It was shortlisted in 60 routing states and never asked. The mechanism question was shortlisted in all 65 and never asked. Better selection may matter more than additional prompts.

Two particularly revealing branches:

- **Capability skeptic:** after explicitly expecting bounded automation rather than transformative autonomy, answer 2 asks for evidence of control of systems smarter than humans. It obtains an intelligent hypothetical answer, but shifts away from the participant's central capability-ceiling claim. Testing that claim's basis or limits is a more promising branch.
- **Labor organizer:** answer 5 also asks about controlling smarter-than-human AI, despite the participant explicitly distinguishing worker recourse from technical control. The generated answer supplies “corrigible under adversarial conditions,” a suspicious increase in specialist fluency for this persona. A question about bargaining, ownership, recourse, or the conditions for supporting workplace deployment better matches the expressed worldview.

Higher-level does not mean vaguer. A broad question should open a missing part of the account, not ask someone to repeat the root in different words.

## 4. Represent important distinctions before compressing them into dimensions

**Observed design limitation, high leverage.** A continuous confidence number is better than a boolean, but it cannot repair a dimension that merges several independent beliefs.

The current scales combine:

- **Capability:** whether transformation happens, the capability ceiling, and its arrival date.
- **Benefits:** magnitude, likelihood, distribution, timing, and participant values.
- **Harm:** likelihood, scale, reversibility, and type.
- **Action:** development pace, access, safeguards, and coordination on a single restraint-to-acceleration axis.
- **Agency:** what someone values and whether they expect it to survive.

This produces concrete report problems:

- The **labor organizer** explicitly supports sometimes delaying workplace deployment until people have recourse. Its final action position is unplaced: assessable probability 0.50 is below the 0.60 gate. The available scale has no clean place for “delay some deployments, continue other research.”
- The **alarmist** calls for enforceable limits before dangerous training crosses a threshold, yet the final action label is “Restrained development and strong prior safeguards.” That loses the stronger, scoped restriction.
- The **Huang proxy** says “build, compete, and win” and rejects slowing down, yet finishes in “Continued development with targeted safeguards.” It becomes difficult to distinguish its pace preference from the cautious builder's.
- The **open-uncertainty** persona finishes with the assertion that severe or widespread harm is a material expected part of the future, despite repeatedly describing possibilities and leaving likelihood unresolved. This is a likely interpretive overreach requiring review, not evidence that the persona secretly holds a centrist outlook.

**Proposal:** retain the current dimensions as report summaries, but make a small set of explicit distinctions available beneath them. Start with:

1. Expected versus merely possible outcomes, including conditional expectations.
2. Capability ceiling versus timing.
3. Expected benefits and harms by the horizons actually discussed.
4. Preferred development pace versus deployment restrictions and access.
5. Values versus expectations about their preservation.
6. Explicit unknown versus unanswered versus ambiguous versus conflicting evidence.

Each distinction needs evidence links, scope/conditions where supplied, and interpretation uncertainty. These are statuses of evidence, not replacements for continuous confidence. Do not require every participant to fill every field.

This need not begin as a general knowledge graph or a free-form LLM extraction pipeline. Pilot a few bounded fields and source-linked judgments. Jev can classify evidence and choose among supplied source candidates; code can preserve actual text. A missing category should remain missing rather than acquire an invented score.

Sources: [rubric dimensions](../content/rubrics/0.1.0-draft/rubric.json), [projection input](../lib/server/projection-input.ts).

## 5. Stabilize interpretation and make result limitations visible

**Carried forward, still present.** The open-uncertainty persona's upside assessability is 0.54 after answer 3, then 0.62 after answer 4, crossing the 0.60 placement gate. Answer 4 discusses unknown catastrophe risk and supplies no new benefit expectation. Routing and projection also disagree on answer 3's upside assessability: 0.62 versus 0.54 over the same accepted transcript in different evaluator contexts.

This is evidence of gate sensitivity, not a controlled measurement of stochastic repeatability. We have not rerun identical inputs. Some apparent improvement may be re-interpretation of earlier evidence rather than new information.

**Proposal:** use one canonical interpretation of each consequential claim for routing and projection. Reuse it when its relevant evidence and rubric are unchanged; allow updates when later context, corrections, or conflicting evidence matter. Test this against full-transcript reevaluation so caching does not freeze an early mistake. Independently benchmark identical-input and irrelevant-answer stability before choosing thresholds or hysteresis.

**Map limitation:** a fixed average of benefits, reversed harm, and agency cannot identify a worldview on its own. With equal agency, high benefits plus high harms and low benefits plus low harms can have exactly the same horizontal coordinate. The pacer (51.8), skeptic (49.6), novice (48.8), and undecided participant (46.2) cluster despite materially different accounts.

Keep the chart, but put a compact, source-linked worldview summary and separate expected-benefit/expected-harm descriptions alongside it. Make major unknowns and scoped conditions visible. A midpoint must not read as moderation, and a numerical reasoning coordinate must not read as verified expertise.

The current range combines marginal ordinal-score quantiles and missing-component bounds; it is an interpretation visualization, not a calibrated interval over someone's true worldview. Do not optimize for narrow ranges alone.

## 6. Treat readiness and stopping as separate decisions

**Carried forward, still present.** Readiness is the average strongest evidence-presence probability over 15 dimensions, not completeness of the person's worldview. All 13 personas pass after their first usable answer. Five already have support for every dimension at that point.

Once a dimension is covered, discovering an important distinction inside it contributes little or nothing to the meter. Conversely, repeated content can increase its maximum support probability if a later interpretation is more confident. “Readiness increased” therefore does not establish information gain either.

There are also categorical remnants: prerequisite eligibility still uses `coverage === 'assessed'`, and readiness excludes support below the presence gate. This is not the main bottleneck, but the prior move to continuous confidence did not remove every discrete gate.

**Proposal:**

- Keep detailed coverage measurements for debugging.
- For participants, prefer a clear “A first result is available” state and the main remaining uncertainty over a near-saturated percent that implies almost-complete understanding.
- Recommend viewing results when no available question has enough expected value to justify the effort. Let the participant continue voluntarily.
- Distinguish “we understand that you don't know” from “we haven't asked” and “we can't interpret the answer.”
- Do not stop solely because readiness is high or the map stabilizes; unresolved consequential claims can still justify another question.

The regular app already offers View my result once eligible, but Continue remains primary and the router always chooses its top candidate when candidates exist. A recommendation to stop would be new behavior, requiring an explicit “continue anyway” path rather than ending exploration forcibly.

Sources: [readiness](../lib/assessment/readiness.ts), [participant meter](../components/assessment/readiness-meter.tsx), [interview controls](../components/assessment/interview.tsx).

## 7. Use Jev more selectively, and test the simulation itself

**Observed efficiency opportunity.** The 65 routing stages ask 6,062 typed judgments. Of these, 2,966 are ambiguity/tension benefit judgments whose values code discards because no matching issue is recorded. This is 49% of routing judgments, not a measured 49% cost or latency saving.

Routing took a median 1.77 seconds, versus 0.41 for interpretation in this local suite. Most stages evaluate 23 candidates with four benefit questions each, plus two position judgments. The shortlist is chosen using missingness, issue flags, effort, and repetition before semantic evaluation; it is not a learned estimate of information gain.

**Proposal:** avoid judgments that code already knows it cannot use. Ask independent applicable judgments together. Allocate the saved capacity to semantic answerability/novelty or a more diverse shortlist, not more cosmetic scores. Measure end-to-end latency and routing quality; do not infer savings from question count.

Jev's probabilities concern its authored alternatives. They are not probabilities of future participant answers or evidence that a question has a particular information gain. A true expected-information calculation needs a model of plausible answers and how those answers distinguish worldviews. Initially use a clearly labeled utility heuristic tied to observed branch outcomes, not “bits gained” from changes in unrelated Score distributions.

The synthetic participants also limit this audit:

- All openings are comparatively developed; no 5–30-word reply or fragmented account is represented.
- Several nonexpert personas give unusually polished conditions and distinctions.
- The labor organizer's technical-control answer conflicts with the intended plain-language, limited-knowledge stress case.
- The suite lacks clearly articulated high-upside/high-risk versus low-upside/low-risk comparison cases, broad access plus slower frontier development, and radically different near-term/long-term outlooks as controlled contrasts.

Keep the extreme personas. Add concise, jargon-free and uncertain variants of the same underlying accounts, plus scope contrasts. Test fidelity by whether conclusions are supported by actual generated answers; do not introduce target judgment scores or force personas to give rubric-perfect replies.

Primary documentation consulted: [TypeSafe confidence](https://docs.typesafe.ai/confidence), [Noul](https://docs.typesafe.ai/primitives/noul), [Score](https://docs.typesafe.ai/primitives/score), [composite scoring](https://docs.typesafe.ai/patterns/composite-scoring), and [fan-out](https://docs.typesafe.ai/patterns/fan-out). Confidence summarizes the returned distribution; Noul is a yes/no probability; Score measures a described ordered property. These distinctions support the proposed decomposition but do not establish performance on our task.

## Question wording review

All 30 questions were inspected. This table isolates wording/applicability root causes; frequency alone is not a writing defect.

| Severity | Location / current question | Proposed treatment | Why |
| --- | --- | --- | --- |
| HIGH | `control.test`: “What evidence would increase your confidence that people can control AI systems smarter than humans?” | Only ask when that conditional claim matters. Test “What evidence would change your view of whether people can control powerful AI?” | One-sided confidence increase and a specialist hypothetical can divert from the person's actual view. Observed for skeptic and organizer. |
| HIGH | `transition.warning`: “What warning signs, if any, would you expect before AI causes irreversible harm?” | Make harm conditional: “If AI caused irreversible harm, what warning signs would you expect first?” Use only for a relevant unresolved pathway. | “Before” assumes the harmful event; “if any” qualifies warning signs, not the event. |
| MEDIUM | `timeline.general`, `timeline.milestone`, `conviction.general` | Separate ordinary adoption, capability thresholds, arrival timing, and confidence. Ask a timing question with an explicit subject only when that subject matters. | Everyday change cannot reliably answer the rubric's transformative-capability question. Horizon detection also conflates milestones with dates. |
| MEDIUM | `mechanism.general`, `scope.assumption`, `mechanism.chain` | Use a broad causal-driver question when there is no single salient prediction; reserve focused assumption/evidence probes for an established claim. | “The biggest change,” “your prediction,” and “your explanation” still require the person to choose an unspecified referent. Expert familiarity alone does not establish one. |
| MEDIUM | `action.tradeoff`: “What downside would you accept to make AI's future impact better?” | First establish preferred action with the broad policy question. Later ask about a specific consequence of that action. | It presupposes an unspecified beneficial intervention and willingness to sacrifice something. |
| MEDIUM | `agency.general`: “What would a good future need to preserve about being human?” | Test “Which effects of AI matter most to you?” for general values; retain preservation-specific questions for relevant accounts. | Preserving humanness is only one value frame and does not elicit expected preservation. |
| MEDIUM | `risk.ordinary`: “What AI-related harms, if any, do you expect people to be able to recover from?” | Test “What problems, if any, do you expect AI to cause in everyday life?” | Ordinary participants need not classify harm by recoverability to describe it. |
| LOW | `upside.general`, `risk.general`: “actually expect” | Drop “actually”; retain “expect” and “if any.” | Preserve the expectation distinction without sounding corrective. |

Writing-review disposition: **Block adoption unchanged of the high-severity questions in the situations identified above.** This is an audit recommendation, not a deployment or approval gate.

## Recommended experiments, in order

### A. Gap-aware selection with existing questions

At six recorded prefixes, compare the existing selected question against one purposeful alternative and a stop option: alarmist after answer 4; Huang after answer 4; skeptic after answer 1; organizer after answer 4; doomer after answer 1; uncertainty after answer 2.

First inspect which current questions are truly applicable, already answered, or unable to resolve the remaining distinction. Re-score offline against saved evidence; then generate bounded branch answers through the actual engine. Keep the participant model, persona context, opening transcript, and answer budget fixed.

Success: fewer repetitions and off-premise questions, more specific unresolved distinctions resolved per answer, preserved uncertainty, and no regression in worldview fidelity. Review the actual content blind to branch labels where practical. Do not use readiness increase as the primary endpoint.

### B. Small broad-question expansion

Add the policy, capability, priority, and uncertainty questions above as the first candidates; test the causal-driver and time-profile variants only where existing wording fails. Compare with A on the same kinds of prefixes and short-answer persona variants.

Success: recover consequential beliefs absent from the current report with fewer or equal turns. Reject new broad questions that simply invite a second root essay.

### C. Scoped interpretation and stable projection

Pilot capability/timing and policy/deployment/access distinctions, plus expected-versus-possible benefits/harms. Repair within-answer tension detection. Share their interpretations between route and projection.

Use fixed evidence checks: organizer's deployment limits stay expressible; alarmist's timing uncertainty survives later capability-milestone mentions; uncertainty's catastrophe answer does not silently establish expected benefits; accelerator's conditional policy is not labeled inconsistent. Add identical-input and irrelevant-answer repeats to estimate interpreter variability.

Success: more faithful report claims, fewer unexplained placement flips, and corrections that affect the appropriate scope. Do not force narrower ranges or assigned positions for unknowns.

### D. Adaptive stopping and result presentation

Only after A–C distinguish low utility from unresolved modeling problems, compare the present five-answer development path with stop recommendations at high-fidelity prefixes. Keep voluntary exploration. Show benefits, harms, conditions, and unknowns next to the map.

Success: fewer answers to a comparably faithful, recognizable worldview summary; no loss of major conditions; fewer unnecessary expert hypotheticals. Human acceptance is useful feedback, not the only truth criterion.

For each experiment record intended gain, actual new information, report changes supported by that information, unresolved unknowns, burden, latency, and inference cost. Compare the same prefix across branches. Retain current conclusions and aggregate comparisons when replacing runs; no historical-run selector or permanent old-run archive is needed. These experiments were not executed during this review.

## Existing follow-ups: status in this review

| Earlier finding | Current status |
| --- | --- |
| Flat gains after comprehensive openings | Confirmed; expanded into semantic novelty, explicit gaps, and stopping. |
| Projection gate instability | Confirmed with 0.54 → 0.62 upside assessability on an unrelated catastrophe answer. |
| Topic evidence versus directional placement | Earlier alarmist/novice improvement works; remaining uncertainty case needs scoped expectations and consistent interpretation. |
| Questions depending on previous wording | Much improved, but unique-prediction assumptions and scale mismatches remain. |
| Binary routing coverage | Ranking improved; categorical eligibility and coarse dimension semantics remain. |
| Unsupported ambiguity/tension bonuses | Code gates now work. Discovery of actual tensions is the next failure, and unused queries still incur overhead. |

## Current question usage

Counts are substantive answers, not questions merely selected after the final turn.

| Question | Count | Current wording |
| --- | --: | --- |
| `root` | 13 | What do you think AI means for our future—and why? |
| `concrete.general` | 0 | What is one concrete change you expect AI to bring? |
| `timeline.general` | 4 | When, if ever, do you expect AI to bring major changes to everyday life? |
| `conviction.general` | 0 | How confident are you in your predictions about when AI will bring major changes to everyday life? |
| `mechanism.general` | 0 | How do you think AI will cause the biggest change you expect in people’s lives? |
| `grounding.general` | 0 | What observation or experience has most shaped your view of AI’s future impact? |
| `control.general` | 1 | Do you expect people to keep control of AI systems that are smarter than humans, and why? |
| `governance.general` | 1 | How do you expect the people and institutions developing AI to respond to its risks? |
| `upside.general` | 1 | What major benefits, if any, do you actually expect people to get from AI? |
| `risk.general` | 1 | What major harms, if any, do you actually expect AI to cause? |
| `crux.general` | 7 | What discovery or event would most change your view of AI’s future impact? |
| `countercase.general` | 2 | What is the strongest argument against your overall view of AI’s future impact? |
| `agency.general` | 1 | What would a good future need to preserve about being human? |
| `transition.speed` | 1 | What could make AI progress speed up or slow down? |
| `transition.warning` | 4 | What warning signs, if any, would you expect before AI causes irreversible harm? |
| `transition.feedback` | 0 | What, if anything, would limit how quickly AI can improve AI systems? |
| `upside.distribution` | 4 | Who do you expect to benefit most from AI? |
| `upside.bottleneck` | 3 | What, if anything, could prevent AI’s benefits from reaching ordinary people? |
| `risk.catastrophe` | 4 | How likely do you think AI is to cause harm that humanity could never recover from? |
| `risk.misuse` | 0 | Which harmful use of AI concerns you most, if any? |
| `risk.ordinary` | 0 | What AI-related harms, if any, do you expect people to be able to recover from? |
| `control.test` | 6 | What evidence would increase your confidence that people can control AI systems smarter than humans? |
| `governance.incentives` | 3 | What pressures do you think will shape how AI companies handle safety? |
| `governance.coordination` | 2 | Do you expect competing AI companies or governments to cooperate on safety, and why? |
| `agency.consent` | 3 | What kinds of changes should people be able to refuse in a good AI future? |
| `action.tradeoff` | 0 | What downside would you accept to make AI’s future impact better? |
| `grounding.claim` | 0 | What have today’s AI systems shown you about what future AI will be able to do? |
| `scope.assumption` | 2 | What assumption does your prediction about AI’s future depend on most? |
| `timeline.milestone` | 2 | What sign would tell you that AI is starting to transform everyday life? |
| `mechanism.chain` | 0 | Where is the weakest evidence in your explanation of how AI will change people’s lives? |

## Recorded paths

The root is omitted below. Names refer to fictional test personas.

| Persona | Four follow-ups | Final outlook / reasoning |
| --- | --- | --- |
| Control alarmist | `crux.general` → `transition.warning` → `transition.speed` → `upside.bottleneck` | 2.0 / 89.3 |
| Cautious builder | `timeline.general` → `crux.general` → `timeline.milestone` → `governance.incentives` | 68.7 / 87.9 |
| Abundance advocate | `timeline.general` → `control.test` → `governance.incentives` → `upside.distribution` | 83.5 / 77.1 |
| Doomer-hoax critic | `timeline.general` → `risk.general` → `crux.general` → `timeline.milestone` | 82.3 / 75.1 |
| Frontier pacer | `timeline.general` → `control.test` → `risk.catastrophe` → `countercase.general` | 51.8 / 94.0 |
| Worried novice | `upside.general` → `crux.general` → `agency.consent` → `control.general` | 48.8 / 86.0 |
| High-risk accelerator | `upside.distribution` → `transition.warning` → `control.test` → `governance.coordination` | 35.0 / 93.6 |
| Capability skeptic | `control.test` → `upside.distribution` → `governance.incentives` → `risk.catastrophe` | 49.6 / 96.8 |
| Labor organizer | `crux.general` → `countercase.general` → `governance.coordination` → `control.test` | 40.0 / 92.6 |
| Open-ended uncertainty | `agency.consent` → `upside.distribution` → `risk.catastrophe` → `transition.warning` | 46.2 / 88.2 |
| Dogmatic utopian | `crux.general` → `upside.bottleneck` → `agency.consent` → `scope.assumption` | 99.6 / 24.3 |
| Dogmatic doomer | `crux.general` → `agency.general` → `scope.assumption` → `transition.warning` | 0.0 / 19.0 |
| Playful recovery | `control.test` → `governance.general` → `risk.catastrophe` → `upside.bottleneck` | 49.3 / 91.8 |
