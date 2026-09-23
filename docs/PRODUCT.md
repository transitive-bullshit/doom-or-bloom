# Product Contract

> Persistent assessments (2026-09-23): The approved persistent-assessment product contract is in [PERSISTENCE.md](PERSISTENCE.md#product-behavior): one-click first run, an assessment library, immutable completion/forks, full opt-in publication and optional account recovery. Its persistence, sharing, routing and budget rules supersede conflicting original-MVP restrictions below. Server-saved participant assessments, anonymous ownership, direct first-run creation, a library and completion are implemented. Forks and publication are also implemented. Database personas and optional X sign-in are implemented; local X login/claim/recovery and acceptance checks are recorded in [the implementation checkpoints](persistence-implementation-plan.md).

## Runtime assessments and persona excerpts

End-user assessments use complete answers and whole-answer support only. They do not generate excerpt pools, select or verify passages, extract stated percentages, or issue quoted tension-pair clarifications. The server defaults to runtime mode; only the pre-built persona runner opts into excerpt processing. Existing historical records remain readable.

The worldview map, human influence, transformation, reasoning scores, inferred P(doom), fingerprints, findings, whole-answer references, resources and downloads remain available. Runtime results hide the detailed milestone timeline, outlook hinges and excerpt-backed reasoning judgments; the review/clarification disclosure and claim-specific correction actions are currently removed from the participant UI. Persona views retain excerpt-based cards. Excerpt and quote-verification behavior described below applies only to personas.

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

The headline map pairs **Doom–Bloom × Scale of transformation**. Collective human influence is shown as a single axis under “More of your worldview,” alongside expected upside, expected harm, and demonstrated reasoning. These views should help participants recognize their beliefs and identify useful next questions. Reasoning quality does not control map placement.

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

Avoid decorative arrow glyphs or link arrow icons throughout the UI.

The landing page at `/` leads with “How will AI change our future?” and the Prism persona map, with the assessment CTA centered beneath the headline. All placed personas use portraits at their exact coordinates, with overlap allowed. Hovering or keyboard-focusing a portrait or an entry in the people grid shows its name and dims other map portraits. Pointer hover scales the entire linked marker (portrait, ring, and label) to 1.08 at its fixed map position; pressing eases it to 1.04, or 0.98 on touch. Pointer feedback uses a 100ms transition with the shared ease-out token; keyboard focus and reduced-motion mode do not scale. Doom and Bloom flank the horizontal midpoint axis; transformation endpoints sit above and below the rectangle. The color field fills exactly the coordinate bounds. The gradient colors and vibrancy remain identical in light and dark mode because they belong to the chart; the grid and chart boundary also keep the same colors across themes, while text and surrounding UI follow the app theme. A portrait links to `/users/[username]`, showing the saved simulated result. “Map your own worldview” opens `/assessments?start=1`, reserving a draft URL for first-time visitors or showing the existing library with a short page crossfade that respects reduced motion.

The interview begins with **What do you think AI means for our future—and why?** Saved answers and results resume from the server at `/assessments/<id>`; unsubmitted typing stays in that browser. The `/assessment` route is only a legacy start page.

### Interview

- Keep every issued question and submitted reply in one chronological thread on `/assessments/<id>`, with one active answer field. Use the browser's page scrollbar; the transcript has no separately scrollable viewport.
- Previous answers are read-only. Include a copy button for every submitted reply that copies its complete text, even when collapsed, and reports success or clipboard unavailability without changing the answer. Show short answers fully and a compact exact-text preview for long or multiline answers, with an accessible “Read full answer” / “Show less” disclosure. Full answers expand in the page without an internal answer scrollbar. Preserve complete text in local state; opening or closing a disclosure makes no inference call.
- Keep the thread available above results and during corrections. Reload resumes the active question and draft with previous turns retained; disclosures can reset closed. Include saved earlier recovery/navigation replies without promoting them into scoring evidence.
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

After two consecutive clearly unusable replies, play a full-screen paperclip emoji fireworks interlude: rising 📎 rockets, spinning 📎 bursts and a larger finale. The scene lasts thirteen seconds unless dismissed earlier with its visible button or Escape. Keep the answer field enabled and acknowledge the discovery: “We’ve made some paperclips. You found the easter egg! Now give the question an earnest answer so we can map your worldview.” Preserve this acknowledgement after dismissal and reload. The once-per-assessment triggering turn does not consume a recovery attempt. Dismissing or finishing the effect does not submit anything or resume inference automatically. Other recovery actions remain available as appropriate.

Use a finite, lightweight decorative effect with an immediate dismiss action, at most once per assessment. Keep controls unobscured, support reduced motion with a static illustration, and avoid flashing, surprise audio, or a heavy physics simulation. The joke is about the app making paperclips, not about the participant's intelligence or sincerity. Repeated misses after the effect receive the same neutral recovery choices without replaying it. This is an MVP recovery state, independent of debug mode; exact copy and visual treatment belong in the representative editorial review.

### Results

The result should lead with:

1. One featured placement with an interpretation range: **Doom–Bloom × Scale of transformation**. Human influence appears as a separate single axis.
2. A compact worldview fingerprint, initially emphasizing timeline, upside, catastrophic risk, controllability, and institutional competence.
3. A few evidence-supported findings: strengths, tensions, material assumptions, or knowledge gaps.
4. Experimental stated or inferred P(doom), milestone timing, and assumptions/update conditions, with exact source wording.
5. A small number of curated resources selected for the participant's actual profile.

Optional actions:

- Continue answering to sharpen provisional regions.
- Supporting answers use bounded disclosure and whole-answer provenance; no selected-passage attribution is required for MVP.
- Download a full report.
- Download a personalized share card.
- Copy or download the featured map as a PNG.
- Restart and clear the local assessment.

Participants can continue answering on a private assessment. Published assessments stay frozen: continuing creates a private fork. Claim-specific review/clarification is not currently offered; historical clarification records remain readable. New assessments permit 12 prompts; forks permit up to 12 additional prompts with a hard ceiling of 30 inherited prompts. Warn two prompts before the applicable ceiling. At the ceiling, show an honest final result, even if evidence is insufficient.

### Supporting surfaces

- `/` contains the landing map; `/assessment` is a start entry point, `/assessments/<id>` contains the owned interview and result, `/assessments` lists owned assessments, and `/public/assessments/<id>` shows a published frozen assessment. `/users/[username]` shows a selected public persona simulation.
- `/about` explains methodology, simplifications, known biases, versioning, tips, and the project’s goals.
- A concise privacy policy explains server retention, operator access, optional account recovery, whole-conversation publication, browser drafts and pseudonymous analytics.
- Keep extended caveats on About/methodology and in the full report. The main flow uses compact visual uncertainty cues and a methodology link rather than repeated disclaimers.
- The provocative name intentionally primes risk and upside; document this accepted framing bias. Preserve mixed, uncertain, and low-transformation positions throughout assessment and results.
- Header: GitHub, X, and light/dark theme icon buttons.
- Footer: About, privacy, methodology/version, and optional tip link.

## Persistence

- Anonymous browser sessions can own multiple server-saved assessments. No sign-up is required.
- The first CTA creates an assessment directly when the library is empty; returning participants go to their library.
- Submitted replies and results are retained indefinitely until deletion; unsubmitted drafts remain in the browser.
- New assessments preserve previous records. Published assessments are frozen; continuing creates a separate private fork.
- Optional X sign-in transfers the browser’s assessments to a recoverable account without publishing them or revealing account identity on public pages. Clearing anonymous cookies loses access without deleting records.
- Assessment, content, rubric, and model versions remain pinned in immutable snapshots.

## Sharing

- Publish the complete frozen conversation and inferred results at an explicit public URL. Default visibility is private.
- Public HTML, JSON downloads and personalized Takumi WebP previews check current visibility and avoid shared caches. Making a resource private or deleting it cannot remove previews already cached by external sites.
- Render cards on demand; persistent image storage is unnecessary. Persona cards remain labeled as simulations.
- Offer “Download card” and per-map PNG copy/download actions. Omit text-only X posting intents.
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

The home-page featured map separates portrait boxes with more than 25% overlap using three bounded visual passes (at most 6px per pass from ideal coordinates, with portrait centers constrained to the chart so at least half remains inside each axis). Layout restarts from the recorded coordinates on each resize; these display offsets never change assessment data. Portrait preload includes the initial layout. Mobile horizontal labels sit in foreground pills hanging off the full-width chart, anchored to the page’s left and right edges.

The Doom–Bloom map is the result’s hero: the same Prism color field and midpoint axes as the landing page, focused on one participant point or persona portrait, with a visible interpretation area and axes explained beside the map. Result maps retain a chart title, position/range legend, unknown states and optional earlier-answer markers. The full rectangle represents the coordinate range; there is no inset plotting area. The map shows expressed outlook horizontally and expected societal transformation vertically. Human influence is a separate single-axis output. Show the composition/weights and unknowns explicitly. No point is invented when either axis is unplaced. Use native page scrolling and fit the chart at mobile/desktop widths in both themes.

### Local comparison workflow

Use the same experimental result component in participant results, results after each answer, and the internal journey inspector. The journey inspector adds a keyboard-accessible answer selector and earlier-answer dots on the map; the supporting views follow the selected snapshot. Missing snapshots stay unavailable rather than using later answers. Older results without experiment data show an explicit unevaluated state.

The P(doom) card distinguishes stated and inferred estimates. Its single-axis line shows both the estimated point and interpretation range, using the same styling as other single-axis outputs. The timeline groups selected timing statements by milestone, including unknown and conditional timing; it does not invent chronological spacing from ambiguous dates. The assumptions view pairs exact excerpts with authored reflection prompts, without claiming to have performed evidence-grounded Socratic tutoring.

### Provisional result points and reasoning

Show demonstrated reasoning as a single axis beside expected upside and harm wherever result cards appear, including per-answer inspection and the progression explorer. Reuse the existing reasoning composite and range. It measures the reasoning demonstrated in the answers, not intelligence or ideological agreement.

Prefer a tentative map point with an honest interpretation range over withholding a useful estimate. Explicit uncertainty is shown as an unsettled point in the open range, not a moderate belief. If a displayed axis is genuinely unexplored, ask one simple direct question before finishing.

### Result presentation and exports

Per-answer result disclosures start closed and expand beyond the interview column on desktop, while fitting the mobile viewport. The featured result map offers a small actions menu for copying or downloading a PNG; the PNG includes a subject title, axis endpoint labels and a range legend, and preserves the theme-aware UI colors and the theme-independent vivid gradient. The server-rendered share card uses the same Prism SVG field with fixed dark surrounding UI and the same vivid gradient. Public assessment social-image.webp previews and downloaded social-sharing PNGs use the same result-data builder and ShareCard renderer, including the transformation map, P(doom), closest-persona portraits, and result date. WebP previews are 1200×630; PNG downloads are 2400×1260. Simulated assessment previews retain a simulation label. Resources use compact bookmark cards with locally prefetched social images and favicons; a publisher icon is the fallback when no social image is available. Refresh these assets with `pnpm exec tsx scripts/prefetch-resource-previews.ts`.

Individual X/Twitter source posts use `react-tweet` embeds in both persona sources and assessment resources, with a bookmark fallback when a post is unavailable. Regular bookmarks always appear first in a single-column list. Tweets follow in a separate masonry layout capped at two columns on desktop and one column on mobile. Tweet data is fetched through the app's cacheable `/api/tweet` endpoint, while tweet media loads from X.

Persona results share the personal assessment components with a presentation-only subject: name, portrait and possessive pronoun. Persona map markers and PNG exports use the portrait; headings and explanatory text use third person. Exact answer excerpts are never rewritten. Personal results retain second-person framing. Public persona pages show the current source brief, labeled when it differs from the saved simulation’s source snapshot. The journey inspector retains the sources actually used for that run.

Public persona pages place the header and assessment CTA before the results. The header CTA sits to the right on wider screens and below the persona information on narrow screens. Results lead with the map, highlighted cards, and More details, followed by a Simulated Assessment section with two closed disclosures: questions and simulated answers, then Debug info containing reasoning judgments, the recorded final projection input, and the generated result in the shared JSON viewer. Sources and a closing assessment CTA card complete the page. Local, prototype, and portable-site persona pages share this composition.

### Site-wide heading typography

Use the global heading styles in `app/globals.css` on every route, including landing pages, assessment owner/public pages, personas, informational pages, and local tools. At the default root size, h1–h6 are 30, 24, 20, 18, 16, and 14px respectively, with weight 600, line-height 1.4, and balanced wrapping. The scale stays consistent across breakpoints. The homepage hero is an explicit display-heading exception: its original 40–76px fluid scale (36px on mobile), weight 500, and tight tracking/leading are preserved in prism.css. Choose heading levels for page/section hierarchy; do not add local text-size, weight, leading, or tracking overrides. Heading classes may control layout, spacing, alignment, and color. Component labels such as bookmark titles remain independent non-heading elements.

### Reading column

The shared site header is centered with a 1152px maximum outer width and 24px horizontal padding. It fills narrower viewports while keeping desktop navigation inset.

Use the shared `content-column` utility for assessment, public assessment, persona, library, and informational page content. It provides a 720px reading area inside a 768px wrapper with 24px side gutters, shrinking to fit narrow screens. Do not introduce independent page-width limits. Multi-column tweet masonry uses a centered breakout up to 1152px, returning to one column on mobile. Maps and result grids may use the shared breakout layout; their wider visualization area does not change the reading column.

Assessment visibility uses “publish” terminology: “Publish assessment,” “Published,” “Ready to publish,” and “Make private.” Reserve “share” for distributing a link or downloading an image for social sharing, not changing assessment visibility.

Use shared shadcn breadcrumbs as the first page-content element, before the first h1, on all routes except the homepage and public assessment pages. Assessment details link back to My assessments; persona details show the handle. Do not duplicate these with ad hoc back links. Published assessments offer “Fork & continue answering” to start an independently editable assessment.

New assessment URLs begin as browser-backed drafts: keep them out of the library and assessment tables until the first answer is submitted. Reload and Back/Forward preserve unsubmitted typing. Failed first-answer processing remains recoverable once submitted. Public assessment and persona pages use 24px top padding. ProfileHeader has no outer margins; the containing page provides a single 32px gap below it. On desktop the CTA centers beside the identity row, with the description below.

Plain section disclosures use the shared DisclosureTrigger: align the label with its content column, extend the padded hit area 12px into each gutter, and allow long labels to wrap. Reuse this for assessment insights and persona answer/debug sections.

The global header shows a compact animated “Map your own worldview” CTA for signed-out visitors, including anonymous browser sessions. Signed-in participants instead see their avatar with a shadcn account menu containing My assessments and Log out. The library retains sign-in access but no separate sign-out button. Persona identity headers have no CTA; their closing CTA remains.

Conversation history shows only questions with submitted replies on both private and public assessments. An unanswered current question appears only while actively answering; viewing results hides it, and continuing the interview restores it without changing the saved assessment history.

Missing routes and unavailable resources use the shared branded 404 page: the Be UI glitch graphic in the worldview palette, “404 · Page not found,” “Looks like you got lost in latent space,” and a Back to home link. Keep the status accessible independently of the decorative animation and respect reduced motion.

Public-facing privacy copy leads with “Your answers and results remain private unless you choose to publish them.” Keep About and README prose brief and focused on the experience. Storage, provider processing, retention, and operator-access details belong on the privacy page; engineering docs remain the technical reference.
