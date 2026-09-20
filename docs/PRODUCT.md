# Product Contract

## Purpose

Doom or Bloom helps a person articulate, inspect, and sharpen their expectations about advanced AI. It begins with a short adaptive natural-language interview to build a high-dimensional worldview profile, then projects that profile into a simple, attractive result. The working domain is doom-or-bloom.com, purchased by Travis.

The project exists to elevate the quality, breadth, and depth of public conversation about AI futures, safety, risks, and benefits. It should be useful to novices, interesting to experts, and candid about its simplifications.

## North Star

The long-term ambition has three connected goals:

1. **Help people understand their own AI worldview.** Efficiently elicit a faithful, inspectable account of what they expect, why they expect it, what remains uncertain, and which assumptions matter most. Use a neutral, truth-seeking process that preserves mixed views and lets people correct our interpretation.
2. **Help people strengthen and sharpen that worldview.** Once the initial account is recognizable to the participant, offer a Socratic follow-up that tests important assumptions against pertinent evidence and alternative explanations. Help them identify cruxes, clarify causal reasoning, and state what would change their mind. Success can mean a revised belief, a better-supported existing belief, or more explicit uncertainty.
3. **Improve the quality, depth, and breadth of AI discourse.** Help people cut through noise about AI safety, risks, upsides, futures, and policy. Connect clear claims to recent real-world capabilities, achievements, incidents, research, and curated expert perspectives, while distinguishing observed evidence from opinion and extrapolation about the near future.

These goals guide development; they are not claims about what the current app has achieved. Each local improvement should advance faithful understanding or useful inquiry. A more engaging chart, smoother interview, or higher completion rate is an intermediate gain, not sufficient evidence that the project fulfills its purpose. Revisit those choices when they obscure important distinctions or stop helping participants think more clearly.

### MVP contribution and limits

The MVP concentrates on the first goal: reliable worldview elicitation, a useful provisional snapshot, participant correction, and modest evidence-supported findings and reading suggestions. Even that contribution needs validation; the implemented local demo uses draft assets and experimental interpretation/readiness heuristics. It does not yet establish assessment accuracy or educational benefit.

The second goal is a post-MVP direction. Clarifying answers, surfacing a supported tension, or linking to a resource does not amount to a sustained Socratic learning experience. Runtime corpus grounding is currently paused, so the demo cannot claim to test a participant's beliefs against current external evidence. The third goal is a longer-term impact ambition, not something that sharing or engagement counts alone can demonstrate.

The existing MVP contracts below remain the implementation baseline. The North Star does not expand the current question budget, change scoring or routing, authorize live retrieval, or commit a final headline axis. Future changes need explicit product and assessment decisions and appropriate evaluation.

### Post-MVP direction: grounded Socratic follow-up

After eliciting the initial worldview, offer an optional, distinct phase of inquiry:

- Identify a consequential assumption, unresolved causal link, or possible internal tension in the participant's own account. Confirm ambiguous interpretations before challenging them.
- Select a small amount of evidence for its relevance to that specific claim: dated capability demonstrations, real-world incidents, research, or clearly attributed expert arguments. Use the provenance, freshness, scope, and review standards in [SOURCES.md](SOURCES.md) and [AUTHORING.md](AUTHORING.md).
- Explain the connection and ask a pointed, open question about how the evidence affects the participant's reasoning. Make room for a reasoned objection to the evidence, a narrower claim, a changed belief, or continued uncertainty.
- Make any revision and remaining disagreement inspectable without treating movement toward optimism, pessimism, a policy position, or our preferred conclusion as success.

For example, if a participant says AI will never perform a particular task and a reviewed source reports a demonstration, first establish whether the demonstrated task and conditions match the participant's claim. Then ask whether that observation changes the claim or which limitation still matters. A narrow demonstration does not establish reliable deployment or general capability.

The hard problems are evidence curation and choosing the evidence that bears most directly on a person's assumptions. Recent or authoritative material is not automatically relevant or decisive; disagreements and transfer limits must remain visible. The voice should be curious and respectful, with room for substantive pushback, never condescending or scored by ideological agreement. This direction does not yet select a retrieval architecture or change the authored-content boundary.

### Experimental direction: more useful result visualizations

The map should help participants understand their worldview and see what is worth exploring next. The prominence of demonstrated reasoning as the vertical axis is an open design question; its usefulness as the headline second dimension needs reassessment. Doom–Bloom remains useful as an overall-outlook projection, while reasoning feedback may be more actionable as specific strengths, gaps, and questions. For local comparison, two maps now replace the reasoning-axis map: **Doom–Bloom × Human influence** and **Doom–Bloom × Scale of transformation**. Choosing one eventual headline axis remains open.

The local experiment also displays the following supporting views. These are provisional designs, not validated assessment instruments:

| Candidate | Participant value | Interpretation boundary |
| --- | --- | --- |
| Milestone timeline | Compare expectations for participant-defined milestones such as AGI or ASI, and see which dates or dependencies remain unclear. | Preserve milestone definitions, conditions, ranges, and “may never happen” or unknown answers; do not invent dates from broad capability categories. |
| Prominent P(doom) estimate | Make a familiar catastrophic-risk belief easy to inspect alongside overall outlook. | Define the outcome and horizon, distinguish stated probability from our interpretation, and allow correction. P(doom) is separate from Doom–Bloom; infer an approximate probability from natural-language views, label stated versus inferred values, and show a broader range when support is indirect. |
| Uncertainty or probability view | Show the shape and limits of a belief where answers support it. | Separate the participant's uncertainty about the future from our uncertainty about their meaning. An illustrative range is not a calibrated margin of error; do not manufacture a “10% ± 5%” estimate or distribution. |
| Assumptions, cruxes, and reasoning gaps | Show which causal links support the worldview and which questions would most help sharpen it. | Separate unasked or unexplored areas from demonstrated weaknesses, and possible tensions from established contradictions. Tie observations to supporting answers. |

Evaluate candidate axes and visualizations against the North Star: whether participants recognize their own views, understand the distinctions and uncertainty, and can identify a useful next question. Visual interest and shareability matter, but do not establish interpretive validity. See [MEASUREMENT.md](MEASUREMENT.md#north-star-learning-questions).

## Audience

The default participant is a curious, technologically engaged adult. No AI-safety vocabulary is assumed. Technical depth is introduced only when the participant's answers indicate that it will be understood and diagnostically useful.

## Product promise

- A provisional result once evidence readiness supports it, potentially after one detailed answer.
- One fixed, jargon-free opening question; all subsequent prompts are adaptive.
- A neutral, curious interview rather than a debate or lesson.
- A memorable simplified map backed by a richer internal profile.
- Evidence-supported observations and optional reading, not a verdict about intelligence or moral worth.
- Local continuity without an account.

## Product principles

1. **Simple outside, nuanced inside.** The internal model may be high-dimensional; the primary UX remains legible in seconds.
2. **Elicit before advising.** The interview maps the participant. Counterarguments and resources belong primarily in results.
3. **Procedural neutrality.** Apply the same standards across optimistic, pessimistic, moderate, and unconventional positions.
4. **No jargon tax.** Plain-language reasoning can score as highly as expert terminology.
5. **Unknown is not low.** Unassessed dimensions widen uncertainty; they do not reduce epistemic quality.
6. **Specific claims remain accountable.** Material factual misunderstandings may be neutrally clarified and surfaced.
7. **The map is explicitly a projection.** It is useful, shareable, and incomplete by design.

## Experience

### Entry

The landing experience is restrained and centered, inspired by the economy of opusfived.dev:

- Product name and one-sentence promise.
- A compact example result or visual hint.
- The root prompt as the primary CTA:

> **What do you think AI means for our future—and why?**

- A natural-language answer field with a reassurance such as “A few sentences is plenty.”

### Interview

- Keep every issued question and submitted reply in one chronological thread on `/`, with one active answer field. Use the browser's page scrollbar; the transcript has no separately scrollable viewport.
- Previous answers are read-only. Include a copy button for every submitted reply that copies its complete text, even when collapsed, and reports success or clipboard unavailability without changing the answer. Show short answers fully and a compact exact-text preview for long or multiline answers, with an accessible “Read full answer” / “Show less” disclosure. Full answers expand in the page without an internal answer scrollbar. Preserve complete text in local state; opening or closing a disclosure makes no inference call.
- Keep the thread available above results and during corrections. Reload resumes the active question and draft with previous turns retained; disclosures can reset closed. Include local earlier recovery/navigation replies without promoting them into scoring evidence.
- Cmd+Enter or Ctrl+Enter submits through the same Continue validation; empty/whitespace, over-limit, busy or blocked drafts cannot bypass it. Plain Enter stays a newline; composition and repeated shortcut events do not submit.
- Leave focus to normal browser/user interaction; do not automatically focus the prompt, result or answer field on mount or after a stage transition.
- Use a light, playful, candid voice.
- Keep prompts short and avoid unexplained specialist terms.
- Let participants speak freely: submitted answers allow 20,000 characters. Never set a hard input cap or truncate typed, dictated or pasted text. Hide the character count during normal writing; only above the limit, show the count and amount to shorten, and disable Continue until the draft fits. Keep the text box editable and preserve the full draft on reload when browser storage is available.
- Let the active answer box and expanded debugging details grow with their content, using the page scrollbar rather than nested scroll areas.
- Show bounded progress without claiming a fake percentage of understanding.
- Unlock a provisional result when supported coverage and interpretation confidence meet the experimental evidence-readiness threshold; there is no minimum answer count. Show results automatically when no consequential new follow-up remains, with optional deeper questions. Results remain available as an earlier participant action once eligible.
- The typical path is 6–8 prompts. The participant can request results whenever eligible or continue for a sharper read.
- Never mechanically force a pro/con debate. Probe missing evidence only when it improves the map.

### Answer recovery and paperclip interlude

Expect playful, off-topic, and unusable answers. Respond with short, authored recovery guidance and a bounded chance to try again, following [the assessment recovery policy](ASSESSMENT.md#answer-relevance-and-bounded-recovery). Accept humor and uncertainty whenever they contain usable evidence; avoid scolding or labeling participants as trolls.

The exact sequence `test`, then `test again` must reliably trigger recovery locally. A standalone `paperclips`, `show me paperclips` or `show paperclips` explicitly requests the interlude without additional Jev calls; it respects recovery bounds and the once-per-assessment marker. Matching ignores case, surrounding/repeated whitespace and trailing sentence punctuation. Meaningful paperclip-maximizer arguments are still assessed normally.

After two consecutive clearly unusable replies, pause the interview and play a full-screen paperclip fireworks interlude: rising paperclip rockets, colorful spinning bursts and a larger finale. The scene lasts thirteen seconds unless dismissed earlier with its visible button or Escape. Suggested authored recovery copy: “We've made some paperclips. Want to give the question another go?” Keep a visible, keyboard-accessible control panel with “Try again” when an attempt remains, “Try a different question” when budget permits, “View my result” when eligible, and “Stop for now” / “Restart.” Dismissing or finishing the visual effect does not submit anything or resume inference automatically.

Use a finite, lightweight decorative effect with an immediate dismiss action, at most once per assessment. Keep controls unobscured, support reduced motion with a static illustration, and avoid flashing, surprise audio, or a heavy physics simulation. The joke is about the app making paperclips, not about the participant's intelligence or sincerity. Repeated misses after the effect receive the same neutral recovery choices without replaying it. This is an MVP recovery state, independent of debug mode; exact copy and visual treatment belong in the representative editorial review.

### Results

The result should lead with:

1. Two experimental placements with interpretation ranges: **Doom–Bloom × Human influence** and **Doom–Bloom × Scale of transformation**.
2. A compact worldview fingerprint, initially emphasizing timeline, upside, catastrophic risk, controllability, and institutional competence.
3. A few evidence-supported findings: strengths, tensions, material assumptions, or knowledge gaps.
4. Experimental stated or inferred P(doom), milestone timing, and assumptions/update conditions, with exact source wording.
5. A small number of curated resources selected for the participant's actual profile.

Optional actions:

- Continue answering to sharpen provisional regions.
- Supporting answers use bounded disclosure and whole-answer provenance; no selected-passage attribution is required for MVP.
- Select “That’s not quite my view,” identify a disputed inferred claim, and clarify in natural language.
- Download a full report.
- Download a personalized share card.
- Open a prefilled X posting intent and manually attach the card.
- Restart and clear the local assessment.

Clarification reopens the same assessment. Warn at 10 lifetime prompts. At 12, force a final result and disable further clarification until restart.

### Supporting surfaces

- `/` contains the landing, interview, and results state transitions.
- `/about` explains methodology, simplifications, known biases, versioning, tips, and the project’s goals.
- A concise privacy policy explains local persistence and anonymous analytics.
- Keep extended caveats on About/methodology and in the full report. The main flow uses compact visual uncertainty cues and a methodology link rather than repeated disclaimers.
- The provocative name intentionally primes risk and upside; document this accepted framing bias. Preserve mixed, uncertain, and low-transformation positions throughout assessment and results.
- Header: GitHub, X, and light/dark theme icon buttons.
- Footer: About, privacy, methodology/version, and optional tip link.

## Persistence

- One assessment per browser, stored locally.
- Resume automatically across visits.
- Restart discards the current local assessment and rotates the anonymous assessment identifier.
- No accounts, cross-device synchronization, session history, or hosted assessment database.
- Assessment, content, rubric, and model versions travel with the local record.

## Sharing

- Generate the card on demand with Takumi; persistent image storage is unnecessary.
- MVP uses a generic social link preview. A personalized preview would require a public URL payload and is deliberately excluded.
- X web intents cannot attach the generated image. Offer “Download card” and “Post on X” as separate, clearly worded actions.
- Native file sharing is an optional enhancement when the browser supports sharing files.

## Enduring non-goals

- A scientifically validated psychological instrument.
- A definitive probability-of-doom calculator.
- A chatbot with unconstrained generated questions.
- A debate bot, persuasion funnel, or ideological sorting test.
- A measure of IQ, credentials, writing polish, or general rationality.

## Outside MVP scope

- A live news-retrieval or fact-checking service.
- A sustained, evidence-grounded Socratic follow-up phase.
- Long-term user profiles, accounts, or public transcripts.

The longer-term goals above do not require live retrieval or hosted profiles. Those implementation choices remain separate from the product ambition.

## Technical envelope already chosen

- Next.js and TypeScript.
- TypeSafe AI is the sole external inference API.
- Pre-authored questions, rubrics, findings, resources, and reference material.
- Vercel Analytics for basic traffic; PostHog for explicit anonymous product events.
- Local storage for assessment persistence.
- Takumi for share-card rendering.
- shadcn/ui for common controls, next-themes for light/dark mode, and restrained optional sound effects.

### Internal local review tools

Development-only `/questions` and `/corpus` display built-in assets, relationship maps, important metadata and per-entry free-form feedback. Notes append to project files with asset identity/version/hash and preserve earlier notes; they do not alter authored assets automatically. These pages make no inference or analytics calls. See [local debugging guide](local-debugging.md) for use and interpretation.

## Local demo visualization

Display a compact Evidence readiness meter while interviewing, including the provisional-result threshold. Explain that it reflects supported coverage rather than forecast accuracy, quality or answer length; debug disclosure gives the experimental formula. See [ASSESSMENT.md](ASSESSMENT.md#question-budget-and-readiness).

The Doom–Bloom map is the result’s hero: strong categorical pole colors, a clearly labeled participant point, visible interpretation area, and axes explained beside the map. Both maps share expressed outlook horizontally. Upward means stronger collective human influence on the first map and greater expected societal transformation on the second. Show the composition/weights and unknowns explicitly. No point is invented when either axis is unplaced. Use native page scrolling and fit the chart at mobile/desktop widths in both themes.

### Local comparison workflow

Use the same experimental result component in participant results, results after each answer, and the internal journey inspector. The journey inspector adds a keyboard-accessible answer selector and earlier-answer dots on both maps; all three supporting views follow the selected snapshot. Missing snapshots stay unavailable rather than using later answers. Older results without experiment data show an explicit unevaluated state.

P(doom) shows a selected participant percentage or range with its exact source context; it is not inferred from categorical risk or evaluator confidence. Qualified estimates retain their wording, without a fabricated bar or error interval. The timeline groups selected timing statements by milestone, including unknown and conditional timing; it does not invent chronological spacing from ambiguous dates. The assumptions view pairs exact excerpts with authored reflection prompts, without claiming to have performed evidence-grounded Socratic tutoring.

### Provisional result points and reasoning

Show demonstrated reasoning as a single axis beside expected upside and harm wherever result cards appear, including per-answer inspection and the progression explorer. Reuse the existing reasoning composite and range. It measures the reasoning demonstrated in the answers, not intelligence or ideological agreement.

Prefer a tentative map point with an honest interpretation range over withholding a useful estimate. Explicit uncertainty is shown as an unsettled point in the open range, not a moderate belief. If a displayed axis is genuinely unexplored, ask one simple direct question before finishing.
