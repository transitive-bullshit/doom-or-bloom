# Local development measurements

Measured 2026-09-17 with `@typesafe-ai/sdk` 0.6.0 and explicitly requested/returned `jev-1.13.0`. These are synthetic development inputs, not participant data or reviewed held-out validation.

## Working representative paths

[live-engine.json](../eval/live-engine.json) records a three-answer result, eight-answer continuation, reference identification/grounding, a correction and recomputation, two confident non-answer strikes, the one-time paperclip pause, and accepted relevant humor. The recovery gate skips speculative profile judgments and later inference stages for unusable replies.

The run used 35 physical requests, 245,099 input tokens and 66,508 output tokens. The current published list price is $0.042 per million input tokens, with output tokens free; checked 2026-09-17 on [TypeSafe’s introduction and pricing table](https://typesafe.ai/blog/introducing-system-one-models-and-jev). The measured run’s list-price estimate is approximately **$0.0103**. This is an estimate from measured tokens, not an invoice or a promise about future pricing.

That measurement predates the expanded prompt pool and the explicit unknown/catastrophic-risk refinements. Rerun it against the final frozen assets. Stage timings, byte counts, question counts, usage and model identifiers are recorded per operation in the artifact.

## Maximum-evidence failure: unresolved

`pnpm eval:budget` constructs 50 synthetic usable answers of 2,000 characters each, 750 ledger entries and 200 reference claims. It exercises the final projection directly; repeating the same authored prompt is a stress setup, not a normal graph path or a quality benchmark. Reference claims are explicitly synthetic and uncertain, not accepted factual labels.

| Request representation | Bytes, including questions | Outcome |
| --- | --: | --- |
| Full bookkeeping | 702,808 | HTTP 400 |
| Reduced ledger bookkeeping | 588,034 | HTTP 400 |
| Short source IDs; complete raw text and summaries | 327,496 | HTTP 400 |

The provider error indicates an exceeded token limit. It supplies no numeric limit in the captured allowlisted hints. Error bodies, headers and credentials are not saved. Failed-request usage/cost is unavailable and must not be reported as zero. [Initial measurement](../eval/budget-benchmark-initial.json), [reduced-ledger measurement](../eval/budget-benchmark-compacted-ledger.json), and [current measurement](../eval/budget-benchmark.json) preserve the evidence.

Lossless compaction preserves every raw usable answer and canonical source summary, uses short temporary IDs in the request, and restores original evidence IDs/distributions before saving judgments. A regression verifies all 50 raw texts and provenance restoration. It removes bookkeeping rather than substituting a generated summary or an earlier score for evidence.

This is a release blocker. Before completing the MVP, establish the actual input limit, resolve final-projection and reference-heavy context growth with an evidence-preserving design, and repeat the 50-prompt case successfully. If the supported input budget or assessment composition must change, document the design and include material semantic changes in editorial review. Keep the implementation-plan feasibility and acceptance boxes unchecked until the evidence passes.

## Browser and ordinary checks

Fixture-mode browser regressions cover drafts on reload, three-answer results, correction, report/PNG download, restart during in-flight work, newer-tab conflicts, corrupt/unavailable storage, the forced cap and identical-ID retry after a lost response. Outbound requests to TypeSafe and analytics are absent in the disabled fixture case.

These checks establish workflow behavior and operational safeguards. They cannot establish neutrality, factual accuracy, rubric agreement, or paraphrase stability; those need the separate reviewed development/holdout protocol.
