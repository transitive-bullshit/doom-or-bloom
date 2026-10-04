# Assessment Methodology

> [PERSISTENCE.md](PERSISTENCE.md#product-behavior) defines ownership, publication and forks. There is no completion operation: private assessments can continue, while published snapshots are frozen. A new assessment has 12 prompts; an owner’s fork adds up to 12, with 30 total across inherited history.

## Where each output comes from

`project` in `lib/server/engine.ts` runs the projection and map-ladder requests and assembles the result (`resultSchema` in `lib/assessment/schema.ts`, beside the `versions` constant). Saved results are upgraded for display by `presentResult` in `lib/assessment/present-result.ts`.

| Output | Jev input | Computed by | Rules |
| --- | --- | --- | --- |
| Doom–Bloom, map x (`result.horizontal`) | `facet:outlook_orientation` | `facetComponents` (`lib/assessment/facets.ts`), refined by `mapPosition` (`lib/assessment/map-ladder.ts`) | [Doom–Bloom](#doombloom), [placement](#placement-between-levels) |
| Scale of transformation, map y (`result.experiment.transformation`) | `experiment:transformation` | `axis` in `buildWorldviewExperiment` (`lib/assessment/worldview-experiment.ts`), refined by `mapPosition` | [Projections](#participant-facing-projections), [placement](#placement-between-levels) |
| Human influence (`result.experiment.influence`) | `experiment:influence` | The same `axis`, without the ladder | [Projections](#participant-facing-projections) |
| P(doom) (`result.experiment.pdoom`) | `experiment:pdoom:band` and `:basis`; a typed percentage through `experiment:pdoom` | `inferPdoom` and `pdoomToken` (`lib/assessment/pdoom.ts`); a stated value takes precedence; `presentPdoom` applies “Unclear” at display | [Estimator](#pdoom-estimator--worldview-v8) |
| Retained reasoning (`result.vertical`) | The seven reasoning dimensions' rubric judgments | `composite` (`lib/assessment/projections.ts`) | [Reasoning profile](#retained-reasoning-profile) |
| Readiness | Latest outlook, transformation and P(doom) band judgments | `mapStatus` and `evidenceReadiness` (`lib/assessment/readiness.ts`) | [Readiness](#question-budget-and-readiness) |
| Ranges and confidence | The same distributions | `axis` and `facetComponents`; `widen` in `present-result.ts` at display | [Ranges](#interpretation-ranges) |

## Runtime assessments and persona excerpts

Runtime assessments use whole-answer support; persona mode additionally selects and verifies excerpts. [TYPESAFE.md](TYPESAFE.md#runtime-assessments-and-persona-excerpts) owns the processing boundary and [PRODUCT.md](PRODUCT.md#results) owns the current participant presentation. Excerpt and quote-verification rules below apply only to personas; [correction semantics](#corrections-and-clarification) distinguish the retained engine operation from the current UI.

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
| Grounded understanding | Connects claims to the offered observations/examples and distinguishes observation, interpretation and uncertainty; no external source verification in the local demo. |

Domain familiarity is tracked for routing and resources but is not itself epistemic quality. The local demo assesses the fit of a claim to its offered basis; it does not independently establish factual/source accuracy.

## Evidence representation

Each meaningful judgment should retain:

- A stable whole-answer ID linked to the dimension; preserve the full prompt and answer separately. Runtime assessments use whole answers; persona excerpts add presentation evidence without replacing this support.
- Whether the belief was stated, strongly implied, weakly inferred, disputed, or unassessed.
- Whether participant conviction is expressed; the actual language remains in the raw answer.
- Whether a forecast horizon/milestone is expressed; relevant timing and assumptions remain in the raw answer.
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

- Results unlock once the displayed map is placed and at least one reply is usable. The participant may then request them; automatic results also wait for four accepted answers (`autoStopFloor`), so a detailed first answer no longer ends the interview after one or two questions. The interview's progress bar counts toward those four answers, and follow-ups after the fourth fill its last segment without completing it ([PRODUCT.md](PRODUCT.md#interview)); it sets expectations and is not a routing target.
- Results can be provisional; weak evidence widens interpretation ranges and marks components as unassessed.
- Further answers append to a private assessment. A published assessment must first be made private or continued through an owner-created private fork. The retained claim-specific clarification operation follows the same ownership and budget rules.
- New assessments stop at 12 issued prompts. Forks use `min(inherited prompts + 12, 30)`; warn two prompts before that ceiling. Skips and clarification prompts count; recovery attempts on the same prompt do not. At 30, start a fresh assessment.
- A response that is empty, purely navigational, or not an answer does not add assessment evidence but still needs abuse/cost controls in implementation.

Readiness is map-centric (algorithm `0.7.0`). Every routing pass judges the displayed outputs with the questions the result uses: `facet:outlook_orientation` (x), `experiment:transformation` (y) and `experiment:pdoom:band`. The map is placed when the latest routing or result judgment gives the outlook’s five levels at least 0.7 probability and the scale’s levels, or its explicit unknown, at least 0.5. These mirror the result’s placement rules. P(doom) is best effort and never blocks results. Readiness never depends on agreement, sophistication, moderation or reasoning coverage. The earlier gate required a central basis and two reasoning dimensions. It blocked 95% of production participants who left without results, and it is retired ([interview audit](research/interview-modeling-audit-2026-09-27.md)). Saved assessments whose judgments predate the map probe keep the earlier coverage rule until their next evaluated answer.

Participants see interview progress rather than readiness or a coverage percentage; debug mode shows a **What your result needs** checklist (outlook, scale of change and optional P(doom)). Evidence coverage remains routing and debugging support. It gives equal weight to 15 dimensions: each assessed dimension contributes the highest combined probability of `stated` or `strongly_implied` attached to active whole-answer support, and unresolved ambiguity or verified persona tension halves that contribution. Missing or ambiguous coverage and superseded or disputed support contribute zero, and repetition adds no weight. It is not a calibrated probability of forecast accuracy.

Offer **View my results** once the map is placed. Show results automatically when the map is placed, at least four answers are accepted, no consequential new follow-up remains, and material issues have had a clarification opportunity. Participants can opt into further questions from results. Low scores never prolong the interview. At the lifetime cap, every assessment with a substantive answer is projected, and the result is insufficient only when the projection cannot place both map coordinates. Each result records a participant-facing `reason` explaining why it appeared and what is still open.

## Answer relevance and bounded recovery

Answer length is a submission constraint, not an inference disposition. Permit up to 20,000 characters per submitted answer and preserve the complete usable text in evidence context. Unsubmitted drafts have no application character cap: retain over-limit text locally, keep it editable, explain the excess and disable Continue. The counter is hidden unless the draft exceeds the limit, so the allowance is not presented as a writing target. Do not truncate or evaluate an over-limit draft, count it as a non-answer, or consume a recovery attempt. Storage failures keep the existing in-tab preservation and explicit notice behavior.

Treat off-topic replies, nonsense, and mockery without usable assessment evidence as expected inputs. Judge whether an answer supplies interpretable evidence, not whether the participant is sincere or deserves a result. Humor, sarcasm, profanity, criticism of the assessment, unconventional beliefs, imperfect English, and honest uncertainty can all accompany a usable answer. A relevant partial answer can be accepted while its unanswered targets remain uncovered; a useful worldview statement need not follow the prompt perfectly.

Use these response dispositions, separately from quality scores:

| Disposition | Meaning | Behavior |
| --- | --- | --- |
| `usable` | Provides relevant interpretable evidence, including a stated lack of knowledge or uncertainty | Accept supported evidence, count at most one substantive answer for the prompt instance, and resume ordinary routing |
| `needs_clarification` | Intended meaning or relevance is unclear | Give an authored neutral clarification/rephrasing; do not guess a position or trigger the Easter egg |
| `non_answer` | Clearly contains no usable assessment evidence, such as unrelated content or uninterpretable nonsense | Give an authored recovery response; exclude it from scoring and substantive-answer counts |
| `navigation` | Requests skipping, stopping, restarting, or viewing results | Offer the relevant UI action under existing eligibility rules; do not infer worldview or intent to mock |

Brief, direct answers are usable. This includes a word or phrase that names an experience, source, benefit or harm (“coding”), “nothing” or “none” to a question about harms or what would change a view, an honest “idk”, and slang that carries an outlook (“it’s joever”). Reserve `needs_clarification` for replies that could mean substantively different things, or that ask what the question means. The 2026-09-27 revision accepted 44 of 44 authored brief answers, against 37 before, and still rejected every authored non-answer and navigation request. It has not yet been validated on real rejected replies.

Only a high-confidence `non_answer` may advance the clear-miss streak. Exact standalone `test` and `test again` are locally recognized placeholders (confidence 1), so this sequence reliably triggers the interlude without paid inference. Exact `paperclips`, `show me paperclips` or `show paperclips` requests reveal it directly if it has not been shown; they count as non-answers, respect remaining submissions and never create evidence. Match only whole normalized phrases, not meaningful answers discussing tests or paperclip maximizers. Version and evaluate this threshold with the rubric; uncertain classifications follow `needs_clarification`. An accepted or ambiguous answer resets the streak; explicitly stopping clears it, and restarting creates a new assessment. Empty input, other navigation, failed inference, refresh, and duplicate submission do not advance it. Simply switching prompts does not erase consecutive clear misses.

Recovery policy for MVP:

1. After the first clear miss, briefly explain that the answer could not be connected to the question and invite another try. Re-show the same prompt with authored guidance; preserve the participant's text for editing.
2. After two consecutive clear misses, offer the paperclip interlude defined in [PRODUCT.md](PRODUCT.md#answer-recovery-and-paperclip-interlude). This is a playful UI state, not an inference that the participant “doesn't care.” Show it at most once per assessment, persisting that marker across reloads.
3. Permit at most **two recovery submissions after the original submission per prompt instance**: three successfully evaluated submissions in total. The once-per-assessment submission that reveals the paperclip interlude does not consume this budget. Keep the answer field enabled, acknowledge the easter egg, and invite an earnest answer; dismissing or finishing the animation preserves that acknowledgement. Further non-answers use the remaining attempts without replaying the interlude. At exhaustion, pause with options to try a different authored question, view an eligible result, stop, or restart. Repeated ambiguity uses the same bound but pauses neutrally without paperclips.
4. Re-showing/rephrasing the same elicitation goal is the same prompt instance; preserve the displayed variant with each attempt. The fixed root wording stays intact, with recovery guidance beneath it. Choosing a different question issues a new prompt and consumes the lifetime budget; its selection uses prior usable evidence or a deterministic authored fallback, never the nonsense reply.
5. A usable answer ends recovery and clears the consecutive-miss streak. Rejected attempts never add coverage, lower Epistemic Quality, or become factual evidence in later judgments. Preserve them separately in server snapshot interaction history for conversation review/recovery/debugging, explicitly excluded from scoring context. Retain submitted replies rather than evicting older ones at an arbitrary history count; failed operations retain submitted text without changing the last committed snapshot. Unsubmitted drafts remain editable rather than become a transcript turn.

Provider retries are distinct from recovery submissions and must be idempotent with respect to counters. Navigation and validation failures remain subject to request/rate limits but do not consume semantic recovery attempts. The lifetime cap takes precedence over recovery: after processing the assessment’s final allowed prompt, finalize from usable evidence, with an insufficient-evidence state if necessary. Before result eligibility, stopping preserves a paused assessment and creates no invented placement. The paperclip interlude is never a substitute assessment result.

## Reference handling — paused for the local demo

Corpus identification and canonical-summary grounding are removed from current inference. No external reference checks or summaries enter routing/projection, and no independent fact-check is claimed. Preserve corpus assets, offline review tools and historical saved checks. Legacy reference flags cannot affect new readiness, findings, resource ranking or projections. See [TYPESAFE.md](TYPESAFE.md#runtime-corpus-grounding-is-paused).

## Participant-facing projections

The current map pairs expressed outlook horizontally with **scale of transformation** vertically: how much AI eventually changes society, whenever that change arrives, independently of desirability or pace. The two lowest levels are reserved for people who expect AI to remain a bounded tool or a hype cycle; treating extinction or permanent disempowerment as a live outcome implies civilizational stakes. Pace belongs to the timeline, not the scale. `result.experiment` also retains **human influence** (how much collective human choices can change AI outcomes), displayed on a separate single axis. Neither is derived from reasoning quality, capability timing, technical controllability, institutional competence or valued human continuity. Those remain distinct components.

Each experimental axis uses five authored positions plus missing and explicitly unknown alternatives. Since `worldview-v4`, whole-interview estimates are independent of optional representative excerpts. Missing discussion remains unplaced only when directional and explicit-uncertainty mass together are below 0.20. With substantial directional evidence, code uses its conditional mean, refined for the scale by the [map ladder](#placement-between-levels) since `worldview-v9`; below 0.75 directional mass, or with at least 0.25 of the mass on “not expressed”, it shrinks the estimate toward the center of the open range and labels it tentative. Interpretation ranges retain the 10th–90th percentile spread plus missing/unknown mass. Dominant explicit indecision places a clearly labeled unsettled reference point at 0.5 with the full [0,1] range; this is not a moderate belief. Optional persona source excerpts independently verify at Noul ≥0.75. These are development interpretation heuristics, not calibrated confidence intervals.

Before ordinary follow-ups, routing asks the core map questions, each at most once:

- `impact.overall`, only when the overall balance is not expressed;
- `transformation.ultimate` (“How much do you think AI will ultimately change the world?”), unless the participant has explicitly left the scale unknown;
- `risk.chance` (“What’s your gut-feel chance that AI causes human extinction or a similarly permanent catastrophe?”), which asks for a number, unless a catastrophe-likelihood question was already asked. “No idea” still counts as an answer;
- then, once, a question that resolves a split outlook reading. When the latest outlook judgment gives its leading level less than 0.6 of the level mass and a neighboring level at least 0.25, routing asks the matching `outlook.lean.<pair>` question, which names both readings (for example, “Are you mainly worried about where AI is heading, or do hope and worry feel roughly balanced to you?”).

In the September 29 review, split readings sat 0.161 from participants’ own placements against 0.135 for the rest, and answering the direct overall-impact question moved readings about twice as close as an ordinary follow-up ([engine design review](research/engine-design-review-2026-09-29.md#next-experiment-a-targeted-follow-up-question)). Triggered prompts are never ranked as ordinary follow-ups.

With the core questions settled, the next ordinary follow-up goes to the **personal question**, `personal.life-work` (“How do you expect AI to change your own life or work?”), asked at most once per assessment, a fork's inherited history included. No other prompt asks about the participant's own life or work ([record](research/personal-question-2026-10-04.md)). Routing chooses it only after deciding not to show automatic results, and it is not a ranked candidate, so it is never itself a reason to withhold results: the stop decision is made exactly as without it. In effect, the interview zooms out, then in:

- on the most common path (opening, scale, P(doom), one ranked follow-up, results), when that fourth question only filled the four-answer floor, it becomes opening, scale, P(doom), personal question, results;
- the balance path (opening, overall balance, scale, P(doom), results) reaches results unchanged, and the personal question is the first optional question after them;
- when a worthwhile ranked follow-up is pending, the personal question takes its slot and that follow-up comes next.

So the interview keeps its length when the displaced question only filled the floor, and is one question longer when the displaced follow-up was worthwhile and still is after the personal answer, or would have investigated an unresolved issue the personal question does not target. The live before/after runs in the record show both.

Explicit indecision counts as an answer and is never re-asked. This is the audit’s variant F, which had the best outlook, scale and P(doom) accuracy of the variants tested. The scale question is asked even when routing already reads a scale. In validation, participants who were not asked it kept a low-biased scale (error 0.160 against 0.097 for those asked, on 153 simulated participants), because answers about near-term change understate the eventual magnitude. With the four-answer floor, the core questions replace ordinary follow-ups rather than lengthening the interview. `transformation.general` (“everyday life”) is retired because it anchored people to the near term. Missing positions remain visibly unplaced. The retained reasoning composite (`result.vertical`) is not drawn on the map; see [retained reasoning profile](#retained-reasoning-profile).

Runtime P(doom) is inferred from the participant’s whole worldview using catastrophe-likelihood bands and a direct-versus-contextual support judgment. A percentage the participant typed is also extracted in runtime mode (selection plus independent verification), and it takes precedence, however short the answer: a bare “30%” counts. Qualifiers keep their meaning: “less than 1%” is 0–1%, and “around 25%” is 25%. Declining to give a number does not make the account uninterpretable: the band is still inferred from expected outcomes, attitudes to catastrophic risk and confidence in safeguards. Harm the participant expects from not developing AI, or from policies that restrict it, is not AI-caused catastrophe. It counts toward neither P(doom) nor expected harms. A participant who calls AI humanity's only hope against extinction was otherwise read as expecting doom. Evaluator confidence is never itself a P(doom). More than half of the interpretation mass must support probability bands, and Jev must identify direct or contextual evidence. Clear risk dismissal or a substantive benign worldview can support a low estimate without numerical language; silence in an isolated narrow answer does not establish zero risk. Preserve conditional scenarios, and do not infer beliefs from a persona’s identity. Persona mode additionally selects a representative excerpt, and persona milestone dates remain exact selections.

On real answers, inferred values are rough. With every number-bearing answer removed, the inferred value landed within 2× in odds of the number 113 participants had typed for 22% of them, no more often than a constant 12.5%, and stronger models did no better; the ordering is informative, though ([engine design review](research/engine-design-review-2026-09-29.md#pdoom-inference)). They remain on display because participants value the detail.

The display names the source. Stated values read “You said 20%”. Inferred values are labeled as inferred and headlined by their point estimate (“<1%”, “≈N%”, “>99%”), with the plausible range beneath. When that range spans more than about 50× in odds (4 logits) and runs from under 10% to over 30%, the answers read both as dismissing catastrophe and as expecting it; the headline then says “Unclear”, since a midpoint would mean nothing. A wide range that stays within the low (or high) end keeps its point estimate: an enthusiast whose reading spreads across the lowest bands is shown “<1%”, not “Unclear”. In the September 27 re-read of 716 production results with `0.7.1`, 7 were Unclear under this rule, against 62 under width alone. A range headline such as “under 6%” read as a higher P(doom) than the participant holds, especially for people who dismiss catastrophe. See [the estimator](#pdoom-estimator--worldview-v8).

### Doom–Bloom

The horizontal coordinate uses the `outlook_orientation` facet: the participant’s expressed leaning toward concern or hope about AI’s future. Interpret the adopted orientation in the complete account, preserving conditions, rather than counting optimistic/pessimistic words or using emotional tone, policy preference or risk awareness alone.

A conflicted or explicitly undecided account with no dominant leaning is an understood middle orientation (level 2, “mixed or undecided”); it does not predict equal benefits and harms. Conditional accounts are judged by their adopted leaning. Someone who expects good outcomes as the likely path while calling for care or regulation leans hopeful (3), and dominant enthusiasm is 4. Symmetrically, mainly expecting harm is 1, and catastrophe as the expected default is 0. Criticism of hype, companies or product quality is not by itself a doom orientation. Before `worldview-v8`, level 2 also absorbed conditional optimism, which pulled hopeful participants toward the middle. Missing orientation remains unplaced. Strong adopted extinction expectations support the Doom pole, and strong transformative-flourishing expectations support Bloom. The separate `overall_outlook` facet represents expected net impact and retains its own unknown state; it does not supply the headline coordinate, and readiness reads it only for saved assessments that predate map judgments (`legacyCore` in `lib/assessment/readiness.ts`). Benefits, harms, valued human agency and P(doom) also remain separate interpretations.

Additional typed facets separate expected capability ceiling from arrival timing, and development pace from deployment safeguards and access policy. These are independent claims, not extra votes in the map. Strongly supported facets appear as additional result cards; missing or uncertain ones remain in the underlying evidence without inventing a policy preference. The 0.75 display threshold is a development heuristic, not calibrated statistical significance.

It is not:

- One minus a probability of doom.
- A participant-stated numerical forecast.
- A proxy for accelerate/pause policy preference.
- A moral judgment.

### Placement between levels

Since algorithm `0.7.5` (`worldview-v9`), both map coordinates are placed between and within the five level descriptions, not only at them. A level choice says which description fits best, and Jev is usually sure of one level, so before this change about two thirds of simulated users and half of participants sat within 0.03 of a level: the map showed five columns. Two independent continuous readings of the same simulated users (a separate judge and the simulated person's own placement) show no such columns.

The **map ladder** (`lib/assessment/map-ladder.ts`) asks nine yes/no comparisons per axis over the whole account: is the view at or past each of the four boundaries between neighbouring levels, and past the typical account of each of the five levels? Each comparison is also asked mirrored (at or before, rather than past), because Jev leans toward “no” on these questions; averaging the two readings of each rung cancels that lean. A view squarely at level k reads k/4, as the level choice does, and a view between descriptions reads between them. The ladder refines the position only: the level choice still decides placement, readiness and the stated level, and the point stays within half a level (0.125) of the level choice's expected value. The ladder is a separate request beside the projection (`D: map placement`, 36 Nouls), so it adds no latency.

On all 178 simulated users ([research](research/distribution-banding-2026-10-03.md)), the share within 0.03 of a level fell from 64% to 28% (24% is what a smooth spread gives), rank agreement with the independent readings rose from 0.884 to 0.892 for the outlook and 0.865 to 0.882 for the scale, and within a level the ladder ordered pairs like those readings 79% of the time against 76%. Slight rewrites of an answer toward hope or worry moved the outlook the right way 85% of the time against 63%, with fewer moves the wrong way (1.7% against 2.2%). Finer level scales (9 levels, a Score instead of a Choice, within-level placement questions) and separate hope and worry intensities were tested and rejected: they left the columns or ordered held-out users worse. The ladder needs new judgments, so it cannot be a render-time upgrade. On October 4, 2026, saved participant results and simulated users were re-read with `0.7.5` instead ([re-evaluating saved results](PERSISTENCE.md#re-evaluating-saved-results)): 973 of 998 participant results and 170 of 178 simulated users, which took the participants within 0.03 of an outlook level from 52% to 22%. The rest get no result under the current engine and keep their earlier positions.

### Retained reasoning profile

The retained `vertical` field in saved/structured results composes the seven authored reasoning dimensions with equal weight. It is not a map axis (map height represents transformation): participants see it only as the demonstrated-reasoning line of the text report, and `/users` can sort simulated users by it. Detailed components stay separate internally.

Missing evidence widens the interpretation range; it does not lower the score. Technical vocabulary, credentials, and ideological centrism do not score points.

### Interpretation ranges

Jev distributions over authored qualitative categories may be projected into a position and range. This is an assessment interpretation—not the participant's event probability and not a statistically validated confidence interval. Displayed map ranges are never narrower than ±0.05 around the point, which is the retest variation observed for the same simulated worldview. This minimum is applied at render time, so it also covers saved results.

### Interview language

The interview, its questions and the result are shown in the participant's language from committed translations; snapshots, prompts sent to Jev and claims stay canonical English, and answers are judged as written ([INTERNATIONALIZATION.md](INTERNATIONALIZATION.md#jev-and-the-participants-language)). Outside English, Jev is told the interview language in one neutral line ([TYPESAFE.md](TYPESAFE.md#participant-language)), and each answer records its `displayLocale`. A typed P(doom) is read in every enabled language. Results across interview languages are not yet treated as comparable.

### Presentation of saved results

Saved snapshots are immutable and are never reprocessed. `presentResult` (`lib/assessment/present-result.ts`) applies display-only upgrades at render time to every saved result, including the participant view, share cards, reports, the published view and persona pages:

- inferred P(doom) is recomputed from the stored band probabilities with the current estimator;
- stated qualifiers are re-read;
- map ranges get the minimum width;
- contextual inferences get range labels;
- the result explanation is recomputed.

Choose this path only for upgrades that need no new evidence or judgments. Changes that do (new definitions, questions, dispositions or estimator inputs Jev must produce) apply only to evaluations after them; an older result gains them when the participant answers again. Reports keep the saved snapshot JSON and print presented values in the readable summary.

## Corrections and clarification

The current participant UI offers **Continue answering questions** to add evidence; it has no claim-specific review/clarification disclosure or correction action.

It also offers one **placement question** when a participant’s self-placement and their current result differ by more than 0.25 on either axis. The `placement` operation carries the guess, and the engine issues the authored question about the larger difference: more hopeful, more worried, more change or less change. It is offered once, only on a current private result below the prompt cap. The answer is ordinary evidence, not a correction: earlier evidence stays active and nothing is superseded. A usable answer returns straight to a newly projected result, as a clarification does. The `clarify` operation remains supported by the engine/API and persona runner, and historical correction records remain readable. The rules below govern that retained operation and its evidence compatibility, rather than a current participant control.

The retained clarification operation quotes the selected claim, including the separate catastrophic-risk fingerprint. Its follow-up answer updates judgments, evidence, routing and projections. A correction scoped to catastrophic risk keeps prior ordinary-harm evidence active; the catastrophic-risk projection uses evidence from the correction onward. Preserve all raw usable answers and identify the corrected scope explicitly so earlier statements remain available in their original context.

Scoped corrections change the assessment's interpretation through new evidence; they never directly edit a score, coordinate or historical answer. Retained correction events can inform quality review without being treated as ground truth automatically.

A capability-trajectory correction also invalidates earlier timeline context. The fingerprint and routing use the latest answer that supplies a horizon or explicitly leaves timing unknown, starting with that correction when present. Explicitly unknown timing is explored evidence: do not repeat the date question or ask for confidence in an obsolete date. A later adopted horizon can replace that uncertainty. Otherwise timing remains unexplored. The fingerprint points to the complete supporting answer rather than quoting or normalizing a selected passage. Corrections to other vectors preserve the timeline. Raw earlier answers remain in the conversation and report, with superseded evidence excluded from current fingerprint provenance.

Evidence presence is independent of reasoning quality. Explicit dismissal of alternatives or refusal to revise a belief can support a low reasoning level; silence about those dimensions remains unassessed. Supported uncertainty, including the separate catastrophic-risk component, retains its claim and evidence without a directional coordinate and remains a valid target for the retained clarification operation.

Result findings retain the authored evidence and interpretation-range gates. When supported findings exist in both areas, include worldview and reasoning feedback within the three-card limit so generic reasoning findings cannot crowd out the participant's expectations.

## Procedural neutrality

Use [JOURNEYS.md](JOURNEYS.md) and the user's argument maps for development cases, including acceleration with substantial catastrophic risk and restraint with low catastrophic risk. Risk families and safety concepts are overlapping authoring/retrieval tags, not additional scored vectors, severity labels or mandatory branches. Ordinary harms, permanent disempowerment and extinction need their own expressed scope and horizon; policy alone establishes none of them.

- Apply identical rubrics across worldview positions.
- Reward coherent extreme views over poorly supported moderation.
- Separate facts, forecasts, values, and policy.
- Use balanced adversarial test profiles.
- Publish methodology, simplifications, corpus criteria, and known biases.
- Prefer primary sources while preserving disputes and uncertainty.
- Do not claim that editorial choices are value-free.

Unplaced claims identify the scope that remains uncertain or unestablished. In particular, unknown transformative arrival must not imply an absence of views about ordinary tools. Gradual diffusion of bounded tools can establish transition dynamics even when transformative capability or arrival timing remains unknown. Saved generic unplaced claims remain valid clarification history.

A weak inference without supported evidence is unassessed, not an unresolved ambiguity. Create a new ambiguity flag only when the probability of genuinely unclear meaning meets the authored presence threshold. Existing supported evidence survives later weak mentions; genuine ambiguity and tension still require explicit resolution.

The main result fingerprint shows timeline, expected upside, expected harm, catastrophic risk, technical control, institutional competence and action posture. Ordinary harm and preferred action remain separate from catastrophe and from each other, and stay visible even when overall outlook is unplaced. Older saved five-card fingerprints remain readable. Control-method and control-test prompts share a novelty group: the existing repetition penalty applies across them without making a materially useful second question ineligible.

### Continuous routing support (local draft)

Candidate coverage missingness is the mean of `1 − contribution` across the question’s target dimensions, using the same continuous evidence-support contributions as readiness. A dimension marked assessed can still have a useful gap. Jev routing receives these 0–1 support values and unresolved issues; categorical coverage labels are omitted. Forecast certainty and reasoning quality are separate from evidence presence. Eligibility prerequisites still require a supported premise. Ambiguity and tension bonuses contribute only when the candidate targets a recorded unresolved issue of the matching kind. This avoids small nonzero benefit distributions inventing issues that interpretation did not find.

Routing supplies continuous evidence support and each candidate’s intended distinction. Jev classifies the candidate’s gap as unasked, partial, already answered or inapplicable. Effective novelty is capped by the probability of an unasked or partial gap, so a generic repeated question cannot qualify through its novelty Noul alone. Current routing does not separately judge benefit/harm positions.

### Current elicitation experiment

After a usable answer, routing evaluates the map outputs (outlook orientation, transformation and P(doom) band), overall outlook and central basis alongside candidate selection. The map judgments decide readiness and direct map questions; they share the batch budget, so the candidate shortlist reserves five questions. Full projection runs when results are requested, routing stops or the prompt cap is reached; it is reused while the evidence revision is unchanged. A new accepted answer invalidates the prior result. See [the Jev workflow](TYPESAFE.md#current-local-workflow--algorithm-076) and `lib/server/engine.ts`.

Semantic coverage gain is judged against the exact candidate and all prior answers, without multiplying it by broad dimension coverage. Broad-topic completeness can hide important distinctions. Continuous support gaps inform shortlisting; an unexplored timeline has an early shortlist bonus, separate from final utility. Effective novelty at least 0.6 and positive utility currently qualify a follow-up; explicit unknowns and already explained reasoning should not be elicited repeatedly. This threshold is being evaluated in live journeys.

In persona mode, tension presence is judged separately from localization. For an apparent incompatibility, Jev can select a pair among bounded exact participant excerpts; code formats a self-contained “How do these fit together?” clarification. The prompt retains the source answer IDs and validates that both excerpts really occurred before the question. Runtime assessments omit this tension-screening and quotation pass. Ordinary evidence attribution remains whole-answer based.

The overall-outlook interpretation accepts strongly implied adopted forecasts: requiring safety work does not erase an expectation of broad prosperity, just as a possible political escape does not erase an adopted extinction forecast. The direct `impact.overall` opportunity applies when its current judgment has `not_expressed` probability at least 0.35 and `explicitly_unknown` below 0.5. It bypasses the generic novelty cutoff and does not repeat. Grounding and crux questions no longer get lower novelty thresholds: those bonuses existed to satisfy the retired central-basis gate, and they made the grounding question the most-asked, most-rejected and most-abandoned follow-up. These thresholds are local development heuristics.

### P(doom) estimator — worldview-v8

Inferred estimates (`logodds-v1`, `lib/assessment/pdoom.ts`) average the band probabilities in log-odds, so a diffuse distribution cannot inflate a low estimate. Band edges of 0 and 1 are clamped to 0.02% and 99.98%. The range uses interpolated 25th–75th percentiles in log-odds, widened by `2 × (1 − supported mass)` logits and never narrower than ±0.5 logit around the estimate. Retakes of the same simulated worldview moved P(doom) by about 0.3–0.5 logits. Explicit participant percentages and public-source overrides bypass the estimator. Reports retain the arithmetic band mean, the range, the band probabilities and the method under `pdoom.adjustment`.

Everyday wording is mapped by attitude, not by band name. Someone who calls catastrophe “very unlikely” or “science fiction” while dismissing it belongs in the lowest bands, not the 3–10% band that shares the name. Since algorithm `0.7.1`, optimism that never mentions catastrophic risk, loss of control or extinction also belongs in the lowest bands. Real participants rarely discuss catastrophe, and a hopeful account was otherwise read as “very unlikely” in the band’s 3–10% sense ([real-data check](research/interview-modeling-audit-2026-09-27.md#optimists-on-real-answers-algorithm-071)).

The former sharpening transform had been compensating for exactly this: it pushed low estimates lower and high ones higher. It is not reintroduced:

- it compressed mid-range beliefs (a stated 20% was displayed as ≈3%);
- on the references, a log-odds calibration fitted to the estimates has slope 0.77, pointing away from extremes.

Fully attitude-anchored band labels pulled well-known dismissers below 1%, but also dragged mid-range participants down (error 0.45 → 0.89 on the validation references), so only the wording rule was adopted. Well-known public positions are best represented by verified [public statements](#participant-facing-projections) rather than a global transform.

The bands are 0–0.1%, 0.1–1%, 1–3%, 3–10%, 10–30%, 30–50%, 50–70%, 70–90%, 90–97%, 97–99% and 99–100%. They are alternative interpretations of the participant’s belief, not evaluator confidence as event probability.

Worldview-v5 to v7 applied a shifted-sharpening correction (`shifted-sharpening-v1`–`v3`) after an arithmetic band mean. It squashed the 5–40% range: production’s median displayed value was 2%, against about 11% under the log-odds mean. Saved results keep those numbers, but display recomputes them from their stored band probabilities ([presentation](#presentation-of-saved-results)).

## Closest persona comparisons

Personal results include up to three closest saved public persona results. Comparison uses two kinds of values, all on their existing 0–1 scales:

- the eight worldview basis-vector components;
- the displayed map point (Doom–Bloom outlook and scale of transformation), each axis weighted like two components, because the map is what participants compare themselves by.

Distance is the weighted root-mean-square difference over the participant’s placed values. An unknown persona value is never read as a midpoint opinion. It costs the expected squared disagreement with an uninformed guess, `v² − v + 1/3` for participant value `v`, so a persona cannot match by lacking the participant’s strongest positions. Epistemic scores, derived facets and P(doom) are excluded, to avoid double counting or conflating beliefs with reasoning quality. A stale experiment leaves the scale out.

Before this rule, comparisons used only shared components and ignored the map. A strongly accelerationist participant then matched two safety researchers whose results lacked an action-posture value ([interview audit](research/interview-modeling-audit-2026-09-27.md)).

A candidate needs at least three known values and at least half of the participant’s placed values. Smaller distance ranks first; ties prefer more known values, then stable persona ID. The card displays an insufficient-evidence state when needed and links portrait/name entries to `/users/[username]`. These are exploratory comparisons against simulated answers, not validated similarity percentages or claims about the real people. Recomputed results update matches after new evidence. Only compact public comparison values cross into the assessment client; persona-loading failures leave the assessment usable.
