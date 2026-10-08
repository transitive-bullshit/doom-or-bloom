# Product Contract

This document defines the current product and UI contract. [PERSISTENCE.md](PERSISTENCE.md#product-behavior) owns storage, ownership, fork and publication semantics. Implementation evidence lives in [the persistence checkpoints](persistence-implementation-plan.md); future ambitions are labeled separately below.

## Runtime assessments and persona excerpts

Participant assessments use whole-answer support; offline persona generation additionally selects and verifies excerpts. [TYPESAFE.md](TYPESAFE.md#runtime-assessments-and-persona-excerpts) owns this processing boundary. Preserve readable historical records while keeping the current UI distinctions below.

The worldview map, human influence, transformation, inferred P(doom), fingerprints, findings, whole-answer references, resources and downloads remain available. Runtime results hide the detailed milestone timeline, outlook hinges and excerpt-backed reasoning judgments; the review/clarification disclosure and claim-specific correction actions are currently removed from the participant UI. Persona views retain excerpt-based cards. Excerpt and quote-verification behavior described below applies only to personas.

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

The current product concentrates on the first goal: reliable worldview elicitation, a useful provisional snapshot, and modest answer-supported findings and reading suggestions. Participants can add answers to refine the interpretation; claim-specific correction is currently unavailable. Even that contribution needs validation; the implemented local demo uses draft assets and experimental interpretation/readiness heuristics. It does not yet establish assessment accuracy or educational benefit.

The second goal is a post-MVP direction. Clarifying answers, surfacing a supported tension, or linking to a resource does not amount to a sustained Socratic learning experience. Runtime corpus grounding is currently paused, so the demo cannot claim to test a participant's beliefs against current external evidence. The third goal is a longer-term impact ambition, not something that sharing or engagement counts alone can demonstrate.

The current contracts below remain the implementation baseline. The North Star does not expand the current question budget, change scoring or routing, authorize live retrieval, or commit a final headline axis. Future changes need explicit product and assessment decisions and appropriate evaluation.

### Post-MVP direction: grounded Socratic follow-up

After eliciting the initial worldview, offer an optional, distinct phase of inquiry:

- Identify a consequential assumption, unresolved causal link, or possible internal tension in the participant's own account. Confirm ambiguous interpretations before challenging them.
- Select a small amount of evidence for its relevance to that specific claim: dated capability demonstrations, real-world incidents, research, or clearly attributed expert arguments. Use the provenance, freshness, scope, and review standards in [SOURCES.md](SOURCES.md) and [AUTHORING.md](AUTHORING.md).
- Explain the connection and ask a pointed, open question about how the evidence affects the participant's reasoning. Make room for a reasoned objection to the evidence, a narrower claim, a changed belief, or continued uncertainty.
- Make any revision and remaining disagreement inspectable without treating movement toward optimism, pessimism, a policy position, or our preferred conclusion as success.

For example, if a participant says AI will never perform a particular task and a reviewed source reports a demonstration, first establish whether the demonstrated task and conditions match the participant's claim. Then ask whether that observation changes the claim or which limitation still matters. A narrow demonstration does not establish reliable deployment or general capability.

The hard problems are evidence curation and choosing the evidence that bears most directly on a person's assumptions. Recent or authoritative material is not automatically relevant or decisive; disagreements and transfer limits must remain visible. The voice should be curious and respectful, with room for substantive pushback, never condescending or scored by ideological agreement. This direction does not yet select a retrieval architecture or change the authored-content boundary.

### Experimental direction: more useful result visualizations

The headline map pairs **Doom–Bloom × Scale of transformation**. Collective human influence is shown as a single axis under “More of your worldview,” alongside expected upside and expected harm. These views should help participants recognize their beliefs and identify useful next questions. Reasoning quality does not control map placement.

The local experiment includes the following supporting views. Milestone timelines and excerpt-backed assumptions are currently shown only for simulated users; participant results retain inferred P(doom) and whole-answer support. These are provisional designs, not validated assessment instruments:

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
- Server-saved continuity without sign-up, with optional X account recovery.

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

Never use text arrow glyphs (↗, →, ↑) in the UI. Where a link needs an outbound marker, or a chart axis a direction, use a small inline SVG icon (lucide `ArrowUpRight`, `ArrowRight` or `ArrowUp`, about `size-3`, `aria-hidden`) aligned to the text; otherwise use none.

The landing page at `/` leads with “How will AI change our future?” and the Prism persona map, with the assessment CTA centered beneath the headline. Placed simulated users use portraits anchored to their recorded coordinates, with the bounded display offsets described under [Local demo visualization](#local-demo-visualization). Hovering or keyboard-focusing a portrait or an entry in the people grid shows its name and dims other map portraits. Pointer hover scales the entire linked marker (portrait, ring, and label) to 1.08 at its fixed map position; pressing eases it to 1.04, or 0.98 on touch. Pointer feedback uses a 100ms transition with the shared ease-out token; keyboard focus and reduced-motion mode do not scale. Doom and Bloom flank the horizontal midpoint axis; transformation endpoints sit above and below the rectangle. The color field fills exactly the coordinate bounds. The gradient colors and vibrancy remain identical in light and dark mode because they belong to the chart; the grid, chart boundary and portrait shadows also keep the same colors across themes, while text and surrounding UI follow the app theme. A portrait links to `/users/[username]`, showing the saved simulated result. “Map your own worldview” opens `/assessments?start=1`, reserving a draft URL for first-time visitors or showing the existing library with a short page crossfade that respects reduced motion.

The interview begins with **What do you think AI means for our future—and why?** Saved answers and results resume from the server at `/assessments/<id>`; unsubmitted typing stays in that browser. The `/assessment` route is only a legacy start page.

### Interview

- Keep every issued question and submitted reply in one chronological thread on `/assessments/<id>`, with one active answer field. Use the browser's page scrollbar; the transcript has no separately scrollable viewport.
- Previous answers are read-only. Include a copy button for every submitted reply that copies its complete text, even when collapsed, and reports success or clipboard unavailability without changing the answer. Show short answers fully and a compact exact-text preview for long or multiline answers, with an accessible “Read full answer” / “Show less” disclosure. Full answers expand in the page without an internal answer scrollbar. Preserve complete text in local state; opening or closing a disclosure makes no inference call.
- Keep the thread available above results and when continuing the interview. Reload resumes the active question and draft with previous turns retained; disclosures can reset closed. Include saved earlier recovery/navigation replies without promoting them into scoring evidence.
- Cmd+Enter or Ctrl+Enter submits through the same Continue validation; empty/whitespace, over-limit, busy or blocked drafts cannot bypass it. Plain Enter stays a newline; composition and repeated shortcut events do not submit.
- Leave focus to normal browser/user interaction; do not automatically focus the prompt, result or answer field on mount or after a stage transition.
- Use a light, playful, candid voice.
- Keep prompts short and avoid unexplained specialist terms.
- Let participants speak freely: submitted answers allow 20,000 characters. Never set a hard input cap or truncate typed, dictated or pasted text. Hide the character count during normal writing; only above the limit, show the count and amount to shorten, and disable Continue until the draft fits. Keep the text box editable and preserve the full draft on reload when browser storage is available.
- Let the active answer box and expanded debugging details grow with their content, using the page scrollbar rather than nested scroll areas.
- Show bounded progress without claiming a fake percentage of understanding.
- Results unlock once the map is placed: the outlook and the scale of change, with P(doom) as best effort ([readiness](ASSESSMENT.md#question-budget-and-readiness)). Participants can request results as soon as they unlock. Automatic results wait for four accepted answers, then appear when no consequential new follow-up remains, with optional deeper questions afterwards. Stopping after one or two answers surprised participants who did not know how long the interview was.
- Set expectations up front: most people see results after 4–6 short questions ([measurements](research/interview-progress-2026-10-04.md)), in about three minutes, and can keep going afterwards. A progress bar above each question shows four segments, one per accepted answer up to the automatic-results floor, ending in a Results flag. Its label reads “Question 1 of 4 · about 3 minutes”, then “Question N of 4”, counting accepted answers, so a re-asked or skipped question does not advance it. The segment being answered is tinted and pulses while the answer is read. This is expectation-setting, not a routing target or a measure of understanding.
- Follow-ups are part of the interview, not an afterthought. When routing continues past four answers, the label reads “Follow-up question · sharpens your result” and each follow-up fills half of what remains of the last segment, up to 95%. Routing decides follow-ups one at a time, so the bar never claims a count it does not know and never looks finished while questions remain, which gently encourages answering them. From the first follow-up, if results are available, the Results flag becomes a “Results ready” button. Results can unlock earlier, after even one answer; until four answers are accepted, **View my results** under the answer box is how to open them, and it stays available whenever results are. Near the cap the label switches to “Question N of 12”.
- Never mechanically force a pro/con debate. Probe a consequential unresolved distinction in the participant’s account, including its reasoning or basis even when the map position would not change.

### Answer recovery and paperclip interlude

Expect playful, off-topic, and unusable answers. Respond with short, authored recovery guidance and a bounded chance to try again, following [the assessment recovery policy](ASSESSMENT.md#answer-relevance-and-bounded-recovery). Accept humor and uncertainty whenever they contain usable evidence; avoid scolding or labeling participants as trolls.

The exact sequence `test`, then `test again` must reliably trigger recovery locally. A standalone `paperclips`, `show me paperclips` or `show paperclips` explicitly requests the interlude without additional Jev calls; it respects recovery bounds and the once-per-assessment marker. Matching ignores case, surrounding/repeated whitespace and trailing sentence punctuation. Meaningful paperclip-maximizer arguments are still assessed normally.

After two consecutive clearly unusable replies, play a full-screen paperclip emoji fireworks interlude: rising 📎 rockets, spinning 📎 bursts and a larger finale. The scene lasts thirteen seconds unless dismissed earlier with its visible button or Escape. Keep the answer field enabled and acknowledge the discovery: “We’ve made some paperclips. You found the easter egg! Now give the question an earnest answer so we can map your worldview.” Preserve this acknowledgement after dismissal and reload. The once-per-assessment triggering turn does not consume a recovery attempt. Dismissing or finishing the effect does not submit anything or resume inference automatically. Other recovery actions remain available as appropriate.

Use a finite, lightweight decorative effect with an immediate dismiss action, at most once per assessment. Keep controls unobscured, support reduced motion with a static illustration, and avoid flashing, surprise audio, or a heavy physics simulation. The joke is about the app making paperclips, not about the participant's intelligence or sincerity. Repeated misses after the effect receive the same neutral recovery choices without replaying it. This is an MVP recovery state, independent of debug mode; exact copy and visual treatment belong in the representative editorial review.

### Out of budget

When Jev is out of budget, because the app's spend budget is used up or TypeSafe has no credits ([TYPESAFE.md](TYPESAFE.md#spend-budget)), the interview never shows a generic error. It shows one notice in Travis's casual first person, the same for both causes, without naming the provider or an amount:

> **Doom or Bloom is taking a breather**
>
> Hey, Travis here. Doom or Bloom is a free side project, and it’s getting way more traffic than I expected, so it blew past its budget. Please be patient and check back in a few hours, or message me on X at @transitive_bs to follow up.

- Opening an interview while Jev is out of budget shows the notice above the question, adding “You can still write your answer. It stays in this browser until you send it.” The answer field stays usable and sending is not blocked, since the budget may have recovered; a blocked send is saved like any other.
- A blocked submission keeps its text in the saved operation and in the answer field. The notice replaces the generic failure alert, adds “Everything you wrote is saved, so you can retry right where you left off.” and offers **Retry saved submission**. It survives reload.
- @transitive_bs links to x.com/transitive_bs in a new tab. The copy lives in `Interview.failure` and is translated into every enabled language.

### Results

The result should lead with:

1. One featured placement with an interpretation range: **Doom–Bloom × Scale of transformation**. Human influence appears as a separate single axis.
2. A compact worldview fingerprint, initially emphasizing timeline, upside, catastrophic risk, controllability, and institutional competence.
3. A few evidence-supported findings: strengths, tensions, material assumptions, or knowledge gaps.
4. Experimental inferred P(doom); simulated users additionally retain sourced or stated estimates, milestone timing, and excerpt-backed assumptions/update conditions.
5. A small number of curated resources selected for the participant's actual profile.

Optional actions:

- Continue answering to sharpen provisional regions.
- Supporting answers use bounded disclosure and whole-answer provenance; no selected-passage attribution is required for MVP.
- Download a full report.
- Download a personalized share card, or share a card-only link to it.
- Copy or download the featured map as a PNG.
- Start a separate assessment, or explicitly delete an owned assessment from the library.

The first time a participant’s result appears, ask where they expect to land before revealing it (**self-placement**). Show the map without their point or range and invite a tap, with sliders as an accessible alternative. **Show where I landed** reveals the full result with their guess marked beside the placed point, plus one plain sentence comparing the two. Frame differences as something to inspect (“Your answers read as more worried than you placed yourself. Both can be true…”), never as a correction. When the guess and the result differ by more than 0.25 on either axis, show one optional question about the larger difference beneath that sentence, such as “You placed yourself as more hopeful than your answers suggest. What gives you hope that we missed?”, with **Answer this question**. The answer joins the conversation like any other and returns an updated result; the question is offered once, and not on a published assessment. Its wording, which a later publication shows, reveals only the direction of the difference, never the guess. **Skip** reveals the result immediately. Offer this only right after a first result, so a guess is never anchored by an earlier reveal. A saved guess or a local reveal marker prevents a repeat. Saving the guess never blocks the reveal.

Under the map and P(doom), ask **Does this feel right?** with one-tap **Yes** / **Not quite**. **Not quite** opens optional chips (more hopeful, more worried, more or less change, P(doom) lower or higher, something else) and an optional short comment. Feedback is stored privately with the assessment for periodic human review of patterns ([feedback audit](benchmark.md)). No single response changes a result.

Results open with a one-sentence explanation of why they appeared and what is still open (`result.reason`), plus how to read the map: the dot is our reading of what they wrote, the dashed box shows other plausible readings, and it is an interpretation, not a verdict. Personal maps add small “worried” and “hopeful” labels beneath the Doom and Bloom poles, while the landing map keeps the brand poles. An unplaced result is labeled “Not placed yet”. The P(doom) card names its source. A stated number reads “You said 20%”. Otherwise it shows the inferred point estimate (“<1%”, “≈N%”) with its plausible range beneath. A range headline read as a higher P(doom) than people hold. Last in the card, a small muted “How we estimate P(doom)” link opens the “How Doom or Bloom estimates P(doom)” section of the post “Why P(doom) estimates vary so much”, in the reader's language. It stays quiet so it never competes with the number or the share and compare actions. Simulated users' cards carry it too, except when the card shows a sourced public statement, which links its own source instead.

Participants can continue answering on a private assessment. Published assessments stay frozen: continuing creates a private fork. Claim-specific review/clarification is not currently offered; historical clarification records remain readable. New assessments permit 12 prompts; forks permit up to 12 additional prompts with a hard ceiling of 30 inherited prompts. Warn two prompts before the applicable ceiling. At the ceiling, show an honest final result, even if evidence is insufficient.

### Supporting surfaces

- `/` contains the landing map; `/assessment` is a start entry point, `/assessments/<id>` contains the owned interview and result, `/assessments` lists owned assessments, and `/public/assessments/<id>` shows a published frozen assessment. `/s/<id>` shows only the card of a shared result. `/users/[username]` shows a selected public persona simulation.
- `/p-doom` is a researched reference page. It answers “What is P(doom)?” in its first two sentences with the shared quotable definition, in two to four short neutral paragraphs with a link to the post on why estimates vary and how to read one, then:
  - **A curated table** (`lib/p-doom/curated.ts`) of about two dozen prominent thought leaders, each linking to their profile: stated numbers from low to high, then four well-known people who decline to give one. A row shows the stated token exactly as written (“<5%”, “10–20%”, “>90%”), then what the person actually said there, followed by the footnote marker for that source; a refusal shows “No number” and an exact quote of under 15 words. A person’s own words replace any summary of ours. That quote is the verified statement's `quote`, verbatim and whole: one of 25 words or more, or none, leaves the row without a quote rather than with trimmed words (only straight apostrophes are typeset). Such a row puts the footnote marker on the number instead and adds one short note phrased as what the number is a chance of (“Chance AI causes human extinction within about 30 years”), never as a summary of the person’s views. The quote carries the source URL as `cite`, and the name is the row header that attributes it. On phones the portrait sits above the name, giving the number and quote most of the row's width. Numbers and quotes are read by persona id from the verified statements (`lib/journeys/public-pdoom-statements.ts`) when the page renders, so a person without one is left out and a note written for another source gives way to the statement's outcome. The order is editorial: ranges and lower bounds are never sorted or plotted at a midpoint. The table shows no simulated estimates and has no sort controls. A line dating its newest statement (“Includes statements up to <date>”) and a note that definitions differ go with it. Under the note, a callout labelled “For comparison: AI researchers” (`lib/p-doom/survey.ts`) says in one neutral English sentence what published AI researchers answered to nearly the same question in AI Impacts’ 2024 Expert Survey on Progress in AI, citing the paper as a footnote; survey results never become table rows. A card below links to `/users`, where every simulated thought leader can be searched and sorted, including by a rough inferred P(doom).
  - **How it could happen** (`lib/p-doom/scenarios.ts`): six numbered scenarios, each with a short plain-language description, who argues it and where experts disagree, citing sources with numbered footnote markers. Scenario numbers are coral and the “Who argues it” and “Where experts disagree” labels use the softer body color, so the scenario title leads; proponents' names are plain prose, linked when they have a profile.
  - A compare-style CTA (“What’s your P(doom)?”).
  - **Sources**: numbered footnotes in order of first citation (the table, the survey callout, then the scenarios), each with the site's favicon, linked title, author or organization and year. The first 10 show; the rest sit behind a “Show all sources” disclosure that opens by itself when a reader follows a marker to a hidden footnote.
  - **Further reading** (`lib/p-doom/readings.ts`): grouped essential readings from a risk-concerned perspective, then critiques, each with a favicon, author, year, kind and a one-line description.

  Favicons are local files from `pnpm resources:previews`, which fetches an icon for every page the hub links; nothing is loaded from a third-party host at runtime. The explainer, notes, quotes, survey callout, scenarios, sources and readings are English; headings and labels are translated.

- `/blog` lists posts, newest first; `/blog/<slug>` shows one post ([BLOG.md](BLOG.md)). A post is translated into every language or stays English under translated chrome. Posts cite outside sources with the same numbered footnote markers and closing **Sources** list as `/p-doom` and About ([BLOG.md](BLOG.md#citing-sources)); all three share `lib/sources` and `components/sources`.
- `/about` explains the project’s goals, then holds the **Methodology** section (`/about#methodology`): the one place that explains how the interview and results work. The footer and blog posts link there instead of restating it. In order: how the interview works (a step diagram of the interview and of what Jev judges and code decides after every answer), what a result is and isn’t (the map, the dimensions behind it, P(doom)’s source, editorial choices, simulated thought leaders), evidence so far (a chart of how far readings land from each other and from people’s self-placement, then labeled findings ending with what isn’t done yet), who has taken it, why the questions are authored, versions with a dated list of changes that affected results, and last the worked JSON example. Privacy and what’s next follow.
  - Keep it short and plain: state limits as facts beside what is being done about them, and present “Does this feel right?” agreement as an upper bound.
  - Every claim cites a numbered footnote in the `/p-doom` style, listed under **Sources** at the end of the page. Sources, research numbers and the changes list live in `lib/about/methodology.ts`; participant numbers are read from `content/blog/aggregates/participants.json`, and versions from `lib/assessment/schema.ts`. Links to the code and docs point at `main` on GitHub and follow the current content and rubric versions.
  - Add an entry to the changes list when a release changes what people see. The page is translated; footnote titles and bylines stay English.
- A concise privacy policy explains server retention, operator access, optional account recovery, whole-conversation publication, card-only share links and comparisons, browser drafts and pseudonymous analytics.
- Keep extended caveats on About/methodology and in the full report. The main flow uses compact visual uncertainty cues and a methodology link rather than repeated disclaimers.
- The provocative name intentionally primes risk and upside; document this accepted framing bias. Preserve mixed, uncertain, and low-transformation positions throughout assessment and results.
- Header: GitHub, X, and light/dark theme icon buttons.
- Footer: the brand and tagline, then three groups: Explore (map your worldview, the thought-leader directory and P(doom) estimates), Blog (a few featured posts, then all posts) and Project (About, Methodology at `/about#methodology`, Privacy and the source code). A bottom row credits the creator and holds the social links and a language selector listing each enabled language by its own name (English, Español). On phones the groups stack, with Explore and Project side by side. Choosing one keeps the current page and is remembered for later visits ([INTERNATIONALIZATION.md](INTERNATIONALIZATION.md)). The interface, results, sharing and social images follow the chosen language; authored questions and result texts stay English until they are translated, and answers are shown as written.

## Persistence

- Anonymous browser sessions can own multiple server-saved assessments. No sign-up is required.
- The first CTA reserves a browser-backed draft URL when the library is empty; the first submitted answer creates its server record. Returning participants go to their library.
- Submitted replies and results are retained indefinitely until deletion; unsubmitted drafts remain in the browser.
- New assessments preserve previous records. Published assessments are frozen; continuing creates a separate private fork.
- Optional X sign-in transfers the browser’s assessments to a recoverable account without publishing them or revealing account identity on public pages. Clearing anonymous cookies loses access without deleting records.
- Assessment, content, rubric, and model versions remain pinned in immutable snapshots.

## Sharing

- Publish the complete frozen conversation and inferred results at an explicit public URL. Default visibility is private.
- Public routes enforce publication visibility with route-specific caching and revocation behavior defined in [PERSISTENCE.md](PERSISTENCE.md#public-pages-and-social-images). Making a resource private or deleting it revokes fresh access, but cannot remove previews already cached by external sites.
- Render cards on demand; persistent image storage is unnecessary. Persona cards remain labeled as simulations.
- The owner's result shows a share bar directly under “Does this feel right?”. It previews the prefilled caption, then offers X, Threads, Bluesky and LinkedIn composer links, Copy link and Download image. Browsers with Web Share also get the native share sheet (text and link). Composers only prefill; nothing is posted or published without the participant.
- Captions contain only the P(doom) token and the closest thought leader's name, never an @mention. A stated number is quoted as written, and an inferred one is credited to Doom or Bloom (“reads my P(doom) as ~8%”) because inferred values are rough. Without a number, the caption names the thought leader or falls back to a plain invitation.
- No composer can attach an image, so an unpublished result shares a **share link**: `/s/<id>`, a noindex page with only the card (the map point and range, P(doom) and the closest thought leaders) and a strong “Where do you land? / Compare now” invitation. Its link preview is the participant's own card. The first share action creates the link and later ones reuse it; a new result gets a new link. A published result keeps linking to its public page. Every link carries `?ref=share-<target>` for [attribution](MEASUREMENT.md#acquisition-attribution). Storage, revocation and caching are in [PERSISTENCE.md](PERSISTENCE.md#share-links).
- Before the first share, an optional “Name on your link” field takes a first name for the page's heading (“Alex mapped their AI worldview”); left blank, it says “A friend”. Once a link exists the bar says anyone with it sees only the card and offers **Stop sharing link**, which revokes every link of the assessment. Changing the name means stopping and sharing again.
- Publishing lives in the share bar, with the same confirmation. Per-map PNG copy and download actions stay in the map menu.
- **Compare with me.** A thought leader's compare invitation opens `/assessments?start=1&compare=persona:<slug>`, and a share link's opens `/assessments?start=1&compare=<id>`. The target is kept in browser storage for the new draft. Returning visitors land in their library, which offers “Compare with my latest result” beside starting a new assessment. After self-placement, the result shows the other person on the same map (a thought leader's portrait, or a labeled diamond for a friend) and a comparison card: an alignment bucket (Very aligned, Mostly aligned, Some distance, Worlds apart), plain differences in outlook and scale of change, both P(doom) values side by side, and for a friend a thought leader both land near. The bucket uses the weighted distance that ranks closest thought leaders; with too little in common it says “Too early to say” instead of guessing. A two-option switch under the map heading, **Just you** or **You vs <name>**, turns the comparison off and on: off leaves only the participant on the map and hides the comparison card. Arriving from a compare link shows it, as does comparing from the library again; the choice is kept with the target in browser storage, so a reload keeps it. A thought leader's comparison keeps the simulation label and links to their page. A friend's offers **Send them your result**, which shares the participant's own share link tagged `?ref=compare`. The comparison is computed in the participant's browser from public data; nothing about it is saved, and the two assessments are never linked. If the link was revoked, the result says the comparison was turned off.
- Pages people reach from a shared link offer a way in: public results show a compare prompt under the heading (“Where do you land vs <name>?”), and simulated-user pages show it between the results and the simulated answers. On simulated-user pages a “Similar worldviews” list follows it: up to six other simulated users nearest by the same distance as a participant’s closest worldviews, compared across the whole catalog, each a portrait and name linking to their profile. A simulation that expresses too few positions for that distance lists the people nearest on the positions it does express, and its description says so ([SEO.md](SEO.md#internal-links)). Phones get a pinned “Where do you land?” bar on both, because the header CTA is hidden below 640px. On simulated-user pages both carry that thought leader as the compare target. Public participant pages are titled “A shared AI worldview”, since visitors are not the owner.

## Enduring non-goals

- A scientifically validated psychological instrument.
- A definitive probability-of-doom calculator.
- A chatbot with unconstrained generated questions.
- A debate bot, persuasion funnel, or ideological sorting test.
- A measure of IQ, credentials, writing polish, or general rationality.

## Outside MVP scope

- A live news-retrieval or fact-checking service.
- A sustained, evidence-grounded Socratic follow-up phase.

Anonymous ownership, optional X recovery and explicitly published complete assessments are implemented; they are part of the current persistence contract.

## Responsive layout and control feedback

- Landing and directory maps grow continuously with their available width. Axis gutters and portrait sizes are fluid; labels move outside only when the map container has room.
- Result card and excerpt grids choose columns from their available space and content count, keeping shared subgrid rows aligned. A short row uses its full width.
- Shared buttons, filters, inputs and select controls have at least 44px targets on touch-capable devices. Editable form text is at least 16px. Dense map dots retain their small visual targets and an accessible people list.
- Keyboard focus uses a visible outline that survives forced colors. Directory dots reveal their name and rise above nearby points on keyboard focus, as they do on mouse hover.
- The answer field grows to 12 lines, then scrolls internally. Its wrapping stays stable while typing.
- Shared buttons and filters give color feedback on press, with a small scale change only when motion is allowed. Disabled controls do not react. Hover requires a fine pointer with hover capability. The animated worldview CTA keeps its existing interaction.

## Technical envelope already chosen

- Next.js and TypeScript.
- TypeSafe AI/Jev is the sole inference provider for participant assessments. Offline simulated-user generation also uses OpenAI for answers; see [user-journeys.md](user-journeys.md).
- Pre-authored questions, rubrics, findings, resources, and reference material.
- Vercel Analytics for basic traffic; PostHog for explicit pseudonymous assessment events.
- Postgres and Drizzle for submitted assessment history; Better Auth for ownership; localStorage for unsubmitted drafts.
- Takumi for share-card rendering.
- shadcn/ui for common controls, next-themes for light/dark mode, and restrained optional sound effects.

### Internal local review tools

Development-only `/questions` and `/corpus` are read-only inspectors for built-in assets, relationship maps and metadata. They make no inference or analytics calls. Feedback forms and the save API have been removed; revise authored files directly. See [local debugging guide](local-debugging.md) for use and interpretation.

## Local demo visualization

Participants see interview progress ([Interview](#interview)), not readiness. Debug mode adds a **What your result needs** checklist below the answer form: the outlook, the scale of change and an optional P(doom), with the placement thresholds and evidence coverage behind a disclosure. It shows what the displayed result needs, not forecast accuracy, quality or answer length. See [ASSESSMENT.md](ASSESSMENT.md#question-budget-and-readiness).

The home-page featured map separates portrait boxes with more than 25% overlap using three bounded visual passes (at most 6px per pass from ideal coordinates, with portrait centers constrained to the chart so at least half remains inside each axis). Layout restarts from the recorded coordinates on each resize; these display offsets never change assessment data. Portraits appear together once every image settles and the first layout lands. While they load, small dots at their recorded coordinates pulse in a doom-to-bloom wave, appearing only after 250ms so fast loads show no placeholder. On a map's first reveal per page load, when the chart is on screen, portraits then fly in from beyond the chart edges in the same doom-to-bloom order across 620ms: each starts larger, blurred, tilted and transparent, as if near the viewer, and settles onto its position with a slight spring as its dot fades beneath it. The entrance settles within about 1.3 seconds regardless of how many users the map shows, and a resize mid-flight lands every portrait immediately. Each portrait takes pointer input once it lands. Later visits in the same page load, offscreen maps and reduced motion use a short fade instead. Mobile horizontal labels sit in foreground pills hanging off the full-width chart, anchored to the page’s left and right edges.

The Doom–Bloom map is the result’s hero: the same Prism color field and midpoint axes as the landing page, focused on one participant point or persona portrait, with a visible interpretation area and axes explained beside the map. Result maps retain a chart title, position/range legend, unknown states and optional earlier-answer markers. The full rectangle represents the coordinate range; there is no inset plotting area. The map shows expressed outlook horizontally and expected societal transformation vertically. Human influence is a separate single-axis output. Show the composition/weights and unknowns explicitly. No point is invented when either axis is unplaced. Use native page scrolling and fit the chart at mobile/desktop widths in both themes.

### Local comparison workflow

Use the same experimental result component in participant results, results after each answer, and the internal journey inspector. The journey inspector adds a keyboard-accessible answer selector and earlier-answer dots on the map; the supporting views follow the selected snapshot. Missing snapshots stay unavailable rather than using later answers. Older results without experiment data show an explicit unevaluated state.

The P(doom) card distinguishes inferred estimates from stated or sourced estimates when those are available in a simulated-user result. Its single-axis line shows both the estimated point and interpretation range, using the same styling as other single-axis outputs. Keep its prose short.

- A sourced public statement shows the number, then the person’s own words as a short quote, then one line with the outcome (plus the horizon when it names a time), then the source title linked with its month and year. Review notes and caveats stay in the report. A stated range or bound without a stated point (10–90%, ≥10%) shows only its band on the axis line, never a midpoint dot.
- Inferred and stated estimates get a single sentence naming where the number comes from, with the plausible range for inferred ones. Simulated-user results show the timeline, which groups selected timing statements by milestone, including unknown and conditional timing; it does not invent chronological spacing from ambiguous dates. Their assumptions view pairs exact excerpts with authored reflection prompts, without claiming to have performed evidence-grounded Socratic tutoring.

### Provisional result points and reasoning

Do not show the demonstrated reasoning card in user-facing results, including participant results, public assessments, simulated-user pages, per-answer inspection and the progression explorer. Retain the reasoning composite, range and evidence in the assessment data for internal analysis and diagnostics; this presentation change does not alter scoring or map placement.

Prefer a tentative map point with an honest interpretation range over withholding a useful estimate. Explicit uncertainty is shown as an unsettled point in the open range, not a moderate belief. An unexplored axis remains unplaced. Routing asks the core map questions (the overall balance when missing, the eventual scale of change and a gut-feel P(doom)) once each before automatic results ([ASSESSMENT.md](ASSESSMENT.md#participant-facing-projections)). Saved results receive display-only upgrades at render time ([presentation of saved results](ASSESSMENT.md#presentation-of-saved-results)); they are never reprocessed.

### Result presentation and exports

Per-answer result disclosures start closed and expand beyond the interview column on desktop, while fitting the mobile viewport. The featured result map offers a small actions menu for copying or downloading a PNG; the PNG includes a subject title, axis endpoint labels and a range legend, and preserves the theme-aware UI colors and the theme-independent vivid gradient. The server-rendered share card uses the same Prism SVG field with fixed dark surrounding UI and the same vivid gradient. Public assessment social-image.webp previews and downloaded social-sharing PNGs use the same result-data builder and ShareCard renderer, including the transformation map, P(doom), closest-persona portraits, and result date. WebP previews are 1200×630; PNG downloads are 2400×1260. Simulated assessment previews retain a simulation label. Resources use compact bookmark cards with locally prefetched social images and favicons; a publisher icon is the fallback when no social image is available. Refresh these assets with `pnpm resources:previews`.

Individual X/Twitter source posts use `react-tweet` embeds in both persona sources and assessment resources, with a bookmark fallback when a post is unavailable. Regular bookmarks always appear first in a single-column list. Tweets follow in a separate masonry layout capped at two columns on desktop and one column on mobile. Tweet data is fetched through the app's cacheable `/api/tweet` endpoint, while tweet media loads from X.

Persona results share the personal assessment components with a presentation-only subject: name, portrait and possessive pronoun. Persona map markers and PNG exports use the portrait; headings and explanatory text use third person. Exact answer excerpts are never rewritten. Personal results retain second-person framing. Public persona pages show the current source brief, labeled when it differs from the saved simulation’s source snapshot. The journey inspector retains the sources actually used for that run.

Public simulated-user pages place their identity header before the results, with no header CTA. On wide screens (`lg` and up), profile headers hang the portrait in the left margin, so the breadcrumb, name, profile link and summary share the column’s left edge. The name, link and summary are evenly and tightly spaced. Narrower screens keep the portrait inline beside the name, with the summary below the portrait. The published-assessment header shares this layout. Results lead with the map, highlighted cards, and More details, then the compare prompt and Similar worldviews. Profiles with sourced statements then show “What <Name> has said about AI” ([public statements](user-journeys.md#public-statements)): a one-sentence summary and three to five dated quotes in the person's own words on a newest-first timeline, each linked to its source, so readers meet the real record before the simulated one. The map stays first. A Simulated Assessment section follows: its questions and simulated answers start closed, one click away, because the results and the person's own words and sources carry the page; they stay in the page's HTML, and an answer reference in the results still opens them. Published participant pages keep their answers expanded. Debug info starts closed and contains reasoning judgments, the recorded final projection input, and the generated result in the shared JSON viewer. Sources and a closing assessment CTA card complete the page. Local, prototype, and portable-site persona pages share this composition; only `/users/<slug>` adds Similar worldviews.

### Site-wide heading typography

### Coral accent

The coral from the logo's doom half (`--coral`, `#ff786a`; Tailwind `coral`) is the site's one accent color. Use it sparingly, for editorial emphasis only: data marks in charts, the left rule of definitions and pull quotes, and similar small markers on content pages. Selected text gets a translucent coral tint (`--selection`) everywhere, form fields included; the text keeps its own color. Don't use it for body text, buttons, large fills, links or error states (those use `destructive`). It stays the same in light and dark mode, like the map colors. The map's own Prism field keeps its separate tokens.

Use the global heading styles in `app/globals.css` on every route, including landing pages, assessment owner/public pages, personas, informational pages, and local tools. At the default root size and from 640px up, h1–h6 are 36, 28, 22, 18, 16, and 14px respectively, with weight 600, line-height 1.4, and balanced wrapping. Each step down is clearly smaller, so a section, its subsections and their labels never read as the same level. Below 640px, h1–h3 step down to 32, 24 and 20px, so names beside a portrait and the result map's centered title keep their lines on phones. The homepage hero is an explicit display-heading exception: its original 40–76px fluid scale (36px on mobile), weight 500, and tight tracking/leading are preserved in prism.css. Choose heading levels for page/section hierarchy; do not add local text-size, weight, leading, or tracking overrides. Heading classes may control layout, spacing, alignment, and color. Component labels such as bookmark titles remain independent non-heading elements.

### Reading column

The shared site header is centered with a 1152px maximum outer width and 24px horizontal padding. It fills narrower viewports while keeping desktop navigation inset.

Use the shared `content-column` utility for assessment, public assessment, persona, library, and informational page content. It provides a 720px reading area inside a 768px wrapper with 24px side gutters, shrinking to fit narrow screens. Do not introduce independent page-width limits. Multi-column tweet masonry uses a centered breakout up to 1152px, returning to one column on mobile. Maps and result grids may use the shared breakout layout; their wider visualization area does not change the reading column. Reference lists (the P(doom) page’s sources and further reading) widen to 60rem on desktop with `reference-breakout`, so long titles wrap less.

Assessment visibility uses “publish” terminology: “Publish assessment,” “Published,” “Ready to publish,” and “Make private.” Reserve “share” for distributing a link or downloading an image for social sharing, not changing assessment visibility.

Use shared shadcn breadcrumbs as the first page-content element, before the first h1, on all routes except the homepage, public assessment pages and share link pages. Assessment details link back to My assessments; persona details show the handle. Do not duplicate these with ad hoc back links. Published assessments offer “Fork & continue answering” to start an independently editable assessment.

New assessment URLs begin as browser-backed drafts: keep them out of the library and assessment tables until the first answer is submitted. Reload and Back/Forward preserve unsubmitted typing. Failed first-answer processing remains recoverable once submitted. Public assessment and persona pages use 24px top padding. ProfileHeader has no outer margins; the containing page provides a single 32px gap below it. The identity description sits below its name and portrait. On simulated-user pages it is the person's one-liner, a neutral, conservative description of what they argue or work on that follows [the one-liner rule](user-journeys.md#simulated-user-one-liners); it never states a P(doom) or a catastrophe outcome in our words.

Plain section disclosures use the shared DisclosureTrigger: align the label with its content column, extend the padded hit area 12px into each gutter, and allow long labels to wrap. Reuse this for assessment insights and persona answer/debug sections.

The global header shows a compact animated “Map your own worldview” CTA for signed-out visitors, including anonymous browser sessions. Signed-in participants instead see their avatar with a shadcn account menu containing My assessments and Log out. The library retains sign-in access but no separate sign-out button. Persona identity headers have no CTA; their closing CTA remains.

Conversation history shows only questions with submitted replies on both private and public assessments. An unanswered current question appears only while actively answering; viewing results hides it, and continuing the interview restores it without changing the saved assessment history.

Share link pages are landing pages like public assessments: no breadcrumbs, the shared reading column, and a pinned “Where do you land? / Compare now” bar on phones.

Missing routes and unavailable resources use the shared branded 404 page: the Be UI glitch graphic in the worldview palette, “404 · Page not found,” “Looks like you got lost in latent space,” and a Back to home link. Keep the status accessible independently of the decorative animation and respect reduced motion.

### Simulated users directory

Public people represented by generated answers are **simulated users**. They did not take the assessment or endorse its interpretation. Keep the simulation label on their results and link the source brief. Existing internal `persona` type, table, and fixture names remain compatibility identifiers.

`/` contains only featured simulated users. `/users` reuses the same map for all selected, published simulated-user results. Below the map, one row of filters (Everyone, Toward doom, Mixed, Toward bloom, and Stated a P(doom)) and a search field by name or X handle narrow the people grid immediately. The grid lists 48 people at a time, most X followers first unless the visitor chose another order; Show more adds the next 48 and Show all lists every match. When the list reaches every match, the buttons go away and focus on them moves to the first newly listed person, so keyboard and screen-reader users continue from there. Changing the filter, search or order starts the list over. The map shows a portrait for each listed person and a small dot for everyone else, linking to their profile and naming them on hover; dots outside the current filter or search fade. Toward doom and Toward bloom cover outlooks nearest the concern-leaning level or below and the benefit-leaning level or above; Stated a P(doom) means a verified public statement. Users without enough evidence for a map position remain available in the grid. Each fixture has an explicit `featured` boolean in its presentation metadata, used by both seeding and live generation. The Independent 100 additions start unfeatured; existing duplicates retain their original fixtures, selected results and featured status.
