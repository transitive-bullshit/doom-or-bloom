# Historical development measurements

For current bounds and authorized occasional persona runs, see [TypeSafe workflow](TYPESAFE.md#failure-bounds-and-paid-evaluation) and [User Journeys](user-journeys.md). The September 17 measurements and safeguards below describe the former implementation, including reference resolution and batch fallback. Current runtime grounding is paused and context overflow fails without recursive splitting. Maximum-context regression checks use mocked transport. Later provider-limit findings are recorded in the [September 26 investigation](research/jev-403-investigation-2026-09-26.md).

On 2026-09-17, paid pressure testing stopped at the user’s request. The original 50-prompt setup was replaced at that time by 12 issued prompts, a warning at 10, 2,000 characters per answer, two resolved references per answer and 16 physical inference attempts per operation. These are historical limits, not current configuration or instructions to repeat the tests.

## Historical development evidence

The artifacts under `eval/` were collected before that instruction, using SDK 0.6.0 and requested/returned `jev-1.13.0`. They are synthetic development evidence, not reviewed held-out validation or proof that current draft semantics are correct.

- [Representative engine run](../eval/live-engine.json): three-answer and eight-answer paths, reference handling, recovery, paperclip pause and relevant humor; 32 physical requests, 234,443 input tokens and 65,550 output tokens. This later run did not perform a correction because its control interpretation remained unknown; correction is covered by local regressions. Earlier checkpoint logs describe an earlier run and should not be read as totals for this artifact.
- [Historical automatic batching](../eval/budget-benchmark.json): the former 50-answer setup passed with the seed’s 24 distinct summaries and bounded question batching. [Single-question](../eval/budget-benchmark-batch-1.json) and [eight-question](../eval/budget-benchmark-batch-8.json) variants retain their measured usage.
- [Historical 200-summary setup](../eval/budget-benchmark-references-200.json): failed with a token-limit error. No numeric provider limit was established. Failed-request usage and cost remain unknown; its zero successful-request estimate is not a claim of free failed requests.

Earlier [initial](../eval/budget-benchmark-initial.json) and [reduced-ledger](../eval/budget-benchmark-compacted-ledger.json) failures remain historical records. They do not create an instruction to repeat paid tests. Their former acceptance blocker is replaced by the user-authorized smaller bound and local failure safeguards.

## Safeguards at the time of these measurements

Final projection retains every usable raw answer and relevant canonical source summary. Lossless temporary IDs remove bookkeeping and restore original evidence IDs and distributions. Oversized requests permit one smaller question-batch fallback; an oversized child stops. Retries, fallback requests and stages share the operation’s physical-request ceiling and deadline. Failures preserve the participant’s draft rather than inventing a result.

Local unit/browser checks verify budget boundaries, retry/cancellation, evidence preservation, recovery, correction, report/PNG download, storage conflicts and stale-response handling. The actual PostHog SDK is checked against intercepted dummy endpoints with inference credentials disabled. These checks establish workflow and transport behavior, not semantic accuracy. Future paid semantic validation requires a small human-reviewed suite with an explicit cost budget, separate from the published development examples.
