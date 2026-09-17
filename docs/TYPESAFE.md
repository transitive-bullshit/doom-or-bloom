# TypeSafe / Jev Composition Specification

## Role of Jev

Jev performs narrowly scoped semantic judgments over participant evidence and authored context. It returns structured choices, scores, binary likelihoods, distributions, and confidence statistics. It does not generate participant-facing prose, invent questions, run the workflow, or explain its hidden reasoning.

Code owns state transitions, calculations, validation, routing eligibility, persistence, versioning, analytics, and rendering.

## Core rules

1. Use Jev for semantic interpretation; use code for deterministic operations.
2. Every judgment has a narrow question and concrete authored criteria.
3. Preserve raw evidence separately from derived judgments.
4. Batched questions are independent and cannot consume one another's outputs.
5. Use a second request when later judgments require earlier outputs or loaded reference details.
6. Never interpret Jev confidence as overall assessment completeness or correctness.
7. Never interpret a category probability as the participant's probability of an external event.
8. Include `none`, `unclear`, `not_expressed`, or equivalent outcomes where unsupported inference is possible.

## Runtime stages

### 1. Interpret the new answer

Send the current prompt, new answer, minimal relevant history, and stable assessment context. Batch independent judgments such as:

- Answer substantive or not.
- Response disposition (`usable`, `needs_clarification`, `non_answer`, `navigation`) under the [bounded recovery policy](ASSESSMENT.md#answer-relevance-and-bounded-recovery), including relevant humor and uncertainty.
- Outlook direction and qualitative strength.
- Mentioned horizons and milestones.
- Expressed benefits and risk pathways.
- Mechanisms and assumptions.
- Action posture.
- Causal clarity, scope discipline, uncertainty, and update conditions.
- Candidate reference mentions.
- Ambiguities or possible tensions requiring clarification.

Use Choice for exclusive interpretations, Score for ordered descriptive rubrics, and Noul for genuinely binary propositions. A Noul probability near 0.5 means uncertainty between yes and no, not medium quality.

Code consumes the response disposition before any later stage. If the answer is unusable or ambiguous, short-circuit reference resolution, ordinary candidate-benefit evaluation, and projection for that attempt. Independent speculative profile judgments already returned in the interpretation batch must be discarded, not stored as worldview evidence. Recovery counters, authored re-asks, pause actions, and the paperclip trigger are deterministic code. Do not ask Jev whether someone is a troll, is sincere, or “doesn't care.”

Keep non-answer attempts outside later scoring state, even when retaining them in local interaction history. Use only prior usable evidence when an explicit skip needs another authored prompt or a result request needs projection. A small recovery-context field may describe the current attempt count and displayed guidance; it is workflow context, not epistemic evidence. Debug traces should expose disposition, its distribution, the threshold/configuration used, the recovery transition, and which speculative judgments were discarded.

### 2. Resolve references progressively

Local deterministic matching shortlists plausible aliases from the reference corpus. Give Jev only the candidate identifiers and concise labels plus `none/unclear`. After selection, load only the relevant canonical summaries for attribution, evidentiary-fit, and groundedness judgments.

The majority of inference context should remain participant evidence. Never send the full corpus.

Alias matching is only an initial shortlist. Jev may also choose relevant topic families to widen local candidate retrieval when an answer refers to an incident indirectly. Distinguish a reference actually mentioned from context retrieved because it is relevant; never attribute the latter to the participant.

Carry authored reference kinds, date qualifiers and related-entry IDs through identification, selected-summary grounding and final projection. A report's publication date does not replace the underlying event date; unknown experiment dates stay unknown. Related entries do not imply independent corroboration or supply facts from an omitted summary. When final inputs shorten reference IDs, retain canonical source IDs so relationships remain interpretable. This metadata does not widen the shortlist or load additional summaries.

### 3. Update the evidence ledger

Code stores the answer, excerpt candidates, reference identifiers, and Jev outputs. If exact supporting text is needed, pre-segment or pre-extract candidate spans; ask Jev to choose candidate IDs, then copy the original text in code.

Do not ask Jev to emit arbitrary quotations or free-form extracted values.

### 4. Route

Code enumerates eligible authored prompts based on graph rules and budget. Jev judges the independent semantic benefits of candidates; code applies configured weights, exclusions, repetition penalties, and tie-breaking.

The selected question must already exist in the authored graph. Jev never writes a new participant-facing question at runtime.

### 5. Project results

Build a final state containing:

- Raw prompts and usable answers; rejected interaction attempts are excluded.
- Evidence-ledger entries with provenance.
- Relevant canonical reference summaries.
- Derived judgments clearly labeled as derived.
- Coverage and unresolved ambiguity.
- Assessment, content, rubric, and model versions.

Batch independent final questions for each output vector. Code then normalizes ordered scores, applies weights and constraints, derives ranges, and selects authored findings and resources.

Do not ask for one opaque overall worldview judgment. Do not multiply correlated judgments or repeatedly classify the entire transcript as though each pass were independent evidence.

## Conceptual state shape

```ts
type AssessmentState = {
  versions: {
    assessment: string
    content: string
    rubric: string
    model: string
  }
  promptBudget: {
    total: number
    substantive: number
    warnedAt10: boolean
  }
  turns: Array<{
    promptId: string
    promptText: string
    answer: string
  }>
  evidence: EvidenceLedgerEntry[]
  coverage: Record<BasisVectorId, CoverageState>
  unresolved: Array<AmbiguityOrTension>
}
```

This shape is illustrative, not an implementation mandate.

## Probability semantics

For an authored qualitative classification such as `very_low`, `low`, `material`, `high`, and `extreme`, Jev's distribution represents support for interpretations of the answer. Code may project that distribution into a smooth coordinate and interpretation range.

Store alongside it:

- Distribution across authored categories.
- Interpretation confidence.
- Explicitness: `stated | strongly_implied | weakly_inferred`.
- Participant-stated probability or range, if present.

Never relabel the projected value as the participant's `P(doom)`.

## Failure behavior

Local bounds are 12 lifetime participant prompts, 20,000 characters per submitted answer, at most two resolved references per answer, 96 independent questions per stage and 16 physical inference requests across one operation, including retries. The answer field retains longer drafts without truncation; the counter and soft-cap guidance appear only above the limit, blocking submission until edited to fit. Unsubmitted drafts stay outside inference requests. All stages share a 120-second operation deadline; each stage also has a 45-second deadline and 15-second physical-attempt timeout. Large inputs use question batches of eight while preserving complete participant evidence and relevant canonical summaries. One oversized-batch fallback may split in half; an oversized child terminates without probing for the provider limit. Preserve the draft and offer retry on failure. The product's answer cap is not a guarantee that a long cumulative transcript fits the provider context; do not pressure-test Jev or silently discard participant evidence.

Use credential-free fixtures for boundary and workflow checks. Paid pressure testing is excluded. Any future semantic evaluation must use a small reviewed suite with an explicit cost budget; the earlier maximum-context measurements do not create a requirement to repeat them.

The optional local evaluation commands refuse to run without `--allow-paid --max-requests=N`, where N is 1–24 physical requests shared across the whole run, including batches and retries. A stage reserves its allowance before starting; failed calls retain that reservation when actual cost is unknown. Exhausting the budget stops the run and records partial evidence, rather than expanding the ceiling. These flags are operational safeguards, not substitutes for agreeing the examples and budget with the user.

- Validate all responses against expected schemas.
- Retry transient 429/529 failures with bounded backoff.
- Reject stale responses after restart or superseding answers.
- Preserve the participant's answer locally if inference fails.
- Offer a calm retry state; do not fabricate a result.
- Keep credentials server-side.
- Add server-side cost, size, and rate limits without introducing a participant database.

## Offline evaluation requirement

Before publishing a rubric or prompt graph, test it on reviewed conversations spanning:

- Doom, bloom, mixed, skeptical, and uncertain positions.
- Novice through expert domain familiarity.
- Short, verbose, technical, colloquial, and non-native-English writing.
- Strong reasoning with extreme conclusions.
- Weak reasoning with moderate conclusions.
- Factual references used correctly, incorrectly, and ambiguously.
- Equivalent paraphrases and irrelevant verbosity.
- Relevant jokes/sarcasm and genuine uncertainty versus unrelated jokes, nonsense, insults without evidence, ambiguous replies, and navigation; repeated misses, successful recovery, and false non-answer classifications.

Hold out part of the labeled set. Do not tune and report performance on the same examples.

## Primary documentation for implementation

Verify current API contracts when implementing: [API](https://docs.typesafe.ai/api), [JavaScript SDK](https://docs.typesafe.ai/sdk/javascript), [Choice](https://docs.typesafe.ai/primitives/choice), [Score](https://docs.typesafe.ai/primitives/score), [Noul](https://docs.typesafe.ai/primitives/noul), [confidence](https://docs.typesafe.ai/confidence), and [independent batching](https://docs.typesafe.ai/patterns/fan-out).

Score criteria are ordered, self-contained descriptions, not bare labels. Normalize by the rubric's maximum index before combining differently sized scales. Choice/Score confidence reflects their distributions; Noul supplies a binary probability without separate confidence. API/model availability and immutable version pinning must be checked; storing a moving model alias alone cannot guarantee reproducibility.
