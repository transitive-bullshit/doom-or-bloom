# Product Contract

## Purpose

Doom or Bloom helps a person articulate and inspect their expectations about advanced AI. It uses a short adaptive natural-language interview to build a high-dimensional worldview profile, then projects that profile into a simple, attractive result. The working domain is doom-or-bloom.com, purchased by Travis.

The project exists to elevate the quality, breadth, and depth of public conversation about AI futures, safety, risks, and benefits. It should be useful to novices, interesting to experts, and candid about its simplifications.

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
- Unlock a provisional result when supported coverage and interpretation confidence meet the experimental evidence-readiness threshold; there is no minimum answer count. Continue with authored follow-ups by default, with results available as an optional action.
- The typical path is 6–8 prompts. The participant can request results whenever eligible or continue for a sharper read.
- Never mechanically force a pro/con debate. Probe missing evidence only when it improves the map.

### Answer recovery and paperclip interlude

Expect playful, off-topic, and unusable answers. Respond with short, authored recovery guidance and a bounded chance to try again, following [the assessment recovery policy](ASSESSMENT.md#answer-relevance-and-bounded-recovery). Accept humor and uncertainty whenever they contain usable evidence; avoid scolding or labeling participants as trolls.

The exact sequence `test`, then `test again` must reliably trigger recovery locally. A standalone `show me paperclips` (or `show paperclips`) explicitly requests the interlude without additional Jev calls; it respects recovery bounds and the once-per-assessment marker. Meaningful paperclip-maximizer arguments are still assessed normally.

After two consecutive clearly unusable replies, briefly fill the background with paperclips and pause the interview. Suggested authored copy: “We've made some paperclips. Want to give the question another go?” Keep a visible, keyboard-accessible control panel with “Try again” when an attempt remains, “Try a different question” when budget permits, “View my result” when eligible, and “Stop for now” / “Restart.” Dismissing the visual effect does not submit anything or resume inference automatically.

Use a finite, lightweight decorative effect with an immediate dismiss action, at most once per assessment. Keep controls unobscured, support reduced motion with a static illustration, and avoid flashing, surprise audio, or a heavy physics simulation. The joke is about the app making paperclips, not about the participant's intelligence or sincerity. Repeated misses after the effect receive the same neutral recovery choices without replaying it. This is an MVP recovery state, independent of debug mode; exact copy and visual treatment belong in the representative editorial review.

### Results

The result should lead with:

1. A **Doom–Bloom × Epistemic Quality** placement with interpretation ranges.
2. A compact worldview fingerprint, initially emphasizing timeline, upside, catastrophic risk, controllability, and institutional competence.
3. A few evidence-supported findings: strengths, tensions, material assumptions, or knowledge gaps.
4. A small number of curated resources selected for the participant's actual profile.

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

## Explicit non-goals

- A scientifically validated psychological instrument.
- A definitive probability-of-doom calculator.
- A live news-retrieval or fact-checking service.
- A chatbot with unconstrained generated questions.
- A debate bot, persuasion funnel, or ideological sorting test.
- A measure of IQ, credentials, writing polish, or general rationality.
- Long-term user profiles, accounts, or public transcripts.

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

The Doom–Bloom map is the result’s hero: strong categorical pole colors, a clearly labeled participant point, visible interpretation area, and axes explained beside the map. Across = expected outlook, up = reasoning demonstrated in the answers. Show the composition/weights and unknowns explicitly. No point is invented when either axis is unplaced. Use native page scrolling and fit the chart at mobile/desktop widths in both themes.
