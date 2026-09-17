# Measurement, Privacy, and Evaluation

## Privacy posture

- No account, email, hosted assessment database, or cross-device profile.
- One local assessment record per browser.
- A random assessment identifier links anonymous events across resumed visits and rotates on restart.
- Do not send raw answers, answer excerpts, full reports, query strings, or free-form clarification text to analytics.
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
| `assessment_capped` | Fifty-prompt hard cap forced finalization. |
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

Recovery events can occur before `assessment_started`, which still requires the first substantive answer. Keep their denominators separate when reading funnels. Re-asks are not new `question_routed` events unless a different prompt instance is issued; retries/reloads must not duplicate events. An Easter egg or paused assessment is not `assessment_completed`. Measure successful recovery and false rejection of usable answers alongside non-answer frequency; do not optimize for triggering the joke.

## Experimental success

The project is exploratory. Do not impose a single vanity KPI. Read evidence across:

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

Maintain a blinded, human-reviewed holdout set. Evaluate at least:

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
