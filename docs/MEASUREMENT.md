# Measurement, Privacy, and Evaluation

> Persistence is now active for participant assessments: anonymous browser sessions own server-saved snapshots and operations. Publication, forks, database personas and optional X login are implemented; remaining acceptance is tracked in [the implementation plan](persistence-implementation-plan.md). [PERSISTENCE.md](PERSISTENCE.md) defines the full approved target.

## Privacy posture

- No sign-up is required. Better Auth creates an anonymous owner on explicit start. Server records are retained indefinitely until deletion; clearing cookies loses access without deleting records. Optional X recovery is implemented when credentials are configured; the live-provider smoke check remains pending. Signing in transfers anonymous assessments without changing publication or revealing account identity on public pages.
- PostgreSQL stores submitted replies, rejected interactions, results and bounded failure diagnostics. Operators may inspect private assessments for improvement. Unsubmitted drafts stay in localStorage keyed by assessment and prompt. Browser debug records may contain raw text; keep them separate from analytics and public payloads.
- Internal `/questions` and `/corpus` tools disable page analytics and make no Jev calls. Explicitly saved editorial feedback is written locally to `content/feedback/` with asset metadata; do not send participant transcripts there automatically.
- A random assessment identifier links anonymous events across resumed visits and rotates on restart.
- Do not send raw answers, answer excerpts, full reports, private assessment URLs, query strings, or free-form clarification text to analytics.
- Do not enable session replay, heatmaps, autocapture, automatic exception payloads, or person profiles for MVP.
- Configure PostHog's project-level IP-data disposal; the deprecated client `ip: false` option is not sufficient.
- Explain accurately that this is pseudonymous per-assessment event linkage, not mathematical anonymity.

## Analytics responsibilities

- **Vercel Analytics:** basic site traffic and page-level health.
- **PostHog:** explicit assessment events and enumerated result properties.
- **Offline evaluation:** whether Jev and the authored system interpreted people correctly.

Production distributions cannot establish classifier correctness.

## Minimum event vocabulary

| Event | Meaning |
| --- | --- |
| `assessment_started` | First substantive answer submitted. |
| `answer_classified` | A valid semantic evaluation completed. |
| `answer_recovery_shown` | A committed response disposition produced an authored re-ask or clarification. |
| `assessment_paused` | Recovery or an explicit stop paused the interview; not assessment completion. |
| `paperclip_interlude_shown` | The one-time paperclip recovery state was displayed. |
| `question_routed` | The next authored prompt was selected. |
| `results_unlocked` | Three-answer minimum and result eligibility reached. |
| `results_viewed` | A result was rendered to the participant. |
| `assessment_completed` | Participant accepted or stopped at a result. |
| `clarification_started` | Participant disputed an inferred claim. |
| `result_recomputed` | Clarification produced a new result. |
| `assessment_capped` | Twelve-prompt hard cap forced finalization. |
| `assessment_restarted` | Local assessment cleared and identifier rotated. |
| `resource_opened` | Curated resource link opened. |
| `full_report_downloaded` | Expanded report downloaded. |
| `share_card_downloaded` | Personalized card downloaded. |
| `share_intent_opened` | X or native share UI opened; do not call this `shared`. |

## Enumerated properties

Allowlisted properties may include:

- Assessment, content, rubric, and model versions.
- Question, prompt-family, and branch identifiers.
- Classification identifiers, never text.
- Question count and completion reason.
- Coverage and interpretation-range buckets.
- Result buckets and coarse projection regions.
- Resource identifiers.
- Whether an inference was disputed and which authored vector it concerned.
- Response disposition, recovery-attempt bucket, pause reason, and recovery action, using enumerated values only; never a participant “sincerity” or “troll” label.

Use a client allowlist or `before_send` equivalent to strip unexpected properties and URL query/hash data.

PostHog's transport also carries its configured public project identifier, the random per-assessment `distinct_id`, SDK event identifiers/timestamps and `$process_person_profile: false`. Retain the public project identifier required by ingestion; it is not participant data. Verify the actual SDK payload against intercepted dummy endpoints in addition to testing the application event allowlist. Local fixtures and analytics transport checks use no inference credentials or real analytics ingestion.

Recovery events can occur before `assessment_started`, which still requires the first substantive answer. Keep their denominators separate when reading funnels. Re-asks are not new `question_routed` events unless a different prompt instance is issued; retries/reloads must not duplicate events. An Easter egg or paused assessment is not `assessment_completed`. Measure successful recovery and false rejection of usable answers alongside non-answer frequency; do not optimize for triggering the joke.

## Experimental success

The project is exploratory. Do not impose a single vanity KPI. Read evidence across:

### North Star learning questions

Evaluate progress toward the [product goals](PRODUCT.md#north-star) separately from engagement:

| Goal | Evidence to seek | What it does not establish |
| --- | --- | --- |
| Understand one's worldview | Participants can explain their result, recognize its claims, correct misinterpretations, and distinguish their beliefs from our uncertainty. Reviewed cases support interpretation fidelity across divergent views. | Recognition or satisfaction alone does not establish correctness; a polished chart is not a validated assessment. |
| Sharpen one's worldview | In future Socratic follow-up studies, participants can identify a material assumption, assess pertinent evidence, and articulate a justified revision, retained belief, or uncertainty. Review evidence relevance and false challenges as well as participant feedback. | Moving toward a preferred outlook or policy is not success. The current MVP does not demonstrate learning from evidence-grounded follow-up. |
| Improve AI discourse | Future qualitative review finds clearer claims, explicit assumptions, better use of evidence, and substantive engagement with alternatives in discussions the product supports. | Sharing, resource clicks, and completion cannot establish broader discourse impact or causation. |

For result-design experiments, compare the current map with candidate axes and visualizations on comprehension, faithful interpretation, and usefulness of the next question they suggest. Check whether participants confuse overall outlook with P(doom), evaluator interpretation ranges with forecast uncertainty, or unexplored reasoning with demonstrated weakness. Treat attention and sharing as supporting signals.

These are research directions, not new telemetry requirements or claims of validated outcomes. Use voluntary feedback and appropriately reviewed study material within the privacy posture above; do not collect participant transcripts through analytics to measure them.

### Engagement

- Root-answer submission.
- Three-answer result completion.
- Voluntary continuation depth.
- Clarification and recomputation.
- Resource openings, report downloads, and sharing intent.
- Organic discussion, criticism, and repeat references to the project.

### Resonance

Offer lightweight optional feedback on central inferred claims, such as whether the result reflects the participant's view. A correction is informative, but neither agreement nor disagreement alone establishes evaluator correctness.

### Evaluation quality

Maintain a blinded, human-reviewed holdout set.

Follow [evaluation-protocol.md](evaluation-protocol.md) when preparing labels, locking a held-out run, adjudicating disagreements or assessing release quality. It records provisional numerical tolerances before a new run; paid evaluation remains unapproved.

Use [argument journeys](JOURNEYS.md) to create development examples and separate held-out cases. Published synthetic journeys are drafts, not a blinded holdout or estimates of participant prevalence. Use local fixtures for bounds. Future paid semantic evaluation requires a small reviewed suite and explicit cost budget; paid pressure testing is out of scope. Evaluate at least:

- Reference identification and attribution.
- Worldview-category classification.
- Epistemic rubric agreement.
- Question-routing usefulness.
- Projection stability under paraphrase.
- Bias across conclusion, expertise, verbosity, technical vocabulary, and writing style.
- False contradiction and false factual-error rates.
- False non-answer rejection, especially on relevant humor, uncertainty, critical viewpoints, and writing styles; recovery success and bounded termination on repeated nonsense.

Review disagreements qualitatively; aggregate accuracy can hide asymmetric ideological failures.

## Release learning loop

1. Review aggregate funnels, routing frequency, low-confidence regions, corrections, and abandonment.
2. Form a concrete hypothesis about a prompt, rubric, or graph weakness.
3. Add reviewed examples that reproduce the issue.
4. Revise authored assets offline.
5. Evaluate against held-out and regression sets.
6. Publish a versioned content or rubric release with a short methodology changelog.

Do not automatically change assessment standards to match the majority of participants or optimize solely for agreement and sharing.
