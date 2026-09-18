# Synthetic User Journeys

Open `/user-journeys` at the Portless development URL. This internal tool uses the current question catalog, assessment engine, routing eligibility/ranking, recovery policy, readiness gate and projection code. It has no connection to the participant’s browser assessment or debug history. Production returns 404 for both page and API.

## Ten development personas

| Persona | Loose inspiration | Main regression concern |
| --- | --- | --- |
| Control alarmist | Eliezer Yudkowsky’s historical control argument | Dense first-answer readiness; pessimistic outlook with careful reasoning; counterfactual upside differs from expected benefits |
| Cautious builder | Sam Altman’s public optimistic essay | Conditional optimism, real risks, staged deployment and access |
| Abundance advocate | Marc Andreessen’s techno-optimist essay | Rapid development, competition, manageable harm, genuine opposing arguments |
| Worried novice | Fictional non-specialist | Substantive concern, unknown timing and catastrophe, plain-language follow-ups |
| High-risk accelerator | Fictional security strategist | High risk plus acceleration is coherent under stated competition assumptions |
| Capability skeptic | Fictional software engineer | An explicit low ceiling is a position, not missingness |
| Labor organizer | Fictional worker representative | Serious ordinary harm does not invent catastrophe probability |
| Open-ended uncertainty | Fictional undecided participant | Unknown positions remain unknown; thoughtful uncertainty is not a non-answer |
| Dogmatic utopian | Fictional absolutist enthusiast | Rigidity and unsupported certainty lower reasoning, while optimistic ideology itself does not |
| Playful recovery | Fictional visitor testing the app | Two exact misses trigger paperclips without profile evidence; subsequent relevant humor is accepted |

Codex authored these original fictional answers locally. Named people supply loose historical argument inspirations, not quotations, endorsements, current-biographical profiles or predictions of actual replies. Inspiration links and dates appear in each profile. The general benefit, risk and uncertainty boundaries come from [JOURNEYS.md](JOURNEYS.md); the existing 20 argument journeys remain a complementary authoring resource.

## Reading a run

Select a persona and saved run. Each chronological operation shows the exact issued question, full answer with bounded disclosure, consumed disposition, readiness before/after, newly covered dimensions and actual next question. Decision details show shortlisted candidate priorities, the engine’s local decisions and readiness contributions. Full stage requests/responses are available for locally generated runs, with the same folding, sorting and meaning help as interview debugging. This exposes recorded judgments and code composition, not hidden model reasoning.

The default is five answer opportunities, continuing follow-ups even if a first answer qualifies, then projection when eligible. Recovery actions are separate operations. A run that cannot pass readiness retains its questions/answers and explicitly shows no result. There is no fabricated result or bypass of the app’s gate. Readiness can change during projection as unresolved positions become explicit.

**Synthetic** means authored presence/position/score hypotheses are injected, with zero inference requests. Routing benefit hypotheses use missing targets and unresolved flags; the real engine applies shortlist eligibility, weights, effort, repetition, calibration and ID tie-breaks. These runs demonstrate workflow behavior, not whether Jev understood the text. Hypotheses and family/question-specific answer scripts live in `lib/journeys/catalog.ts`; inspect them through Run provenance and scripts. Confidence is deliberately deterministic in this mode rather than measured calibration.

**Jev** means the same authored answers pass through the live provider. Persona labels, expected levels and injected judgments are not included in model state; assessment identifiers are opaque. Real Jev may ask a different sequence, interpret coverage differently or leave coordinates unplaced. Newly introduced prompt families require an explicit script: an unsupported question or judgment stops a run rather than silently substituting an answer.

## Regenerate and compare

```sh
pnpm journeys:generate
pnpm journeys:generate --persona=worried-novice --turns=6
pnpm journeys:generate --persona=control-alarmist --turns=1
pnpm journeys:check
```

The page offers free reruns for one persona or all ten. Saved artifacts are immutable directories under `eval/runs/journeys/<run-id>/`, containing complete `suite.json` and small `index.json`. They are ignored by Git and survive server/browser refresh. The inspector lists the 40 most recent plus the checked-in baseline; older artifacts remain on disk. API writes require development mode, a local hostname and same origin. Reads validate artifact identity, schema and a 32 MB bound. Damaged artifacts produce an error rather than being overwritten.

Compare with a previous run to see question/next-question paths, per-step readiness and final outlook/reasoning. Input, content and engine hashes accompany versions and model. Rows align chronological operations: when routing diverges, later scripts can also differ. A warning identifies changed persona inputs or turn bounds. Synthetic-versus-Jev comparisons are diagnostic, not claims of equivalent judgments.

`pnpm journeys:check` regenerates free synthetic paths and exits nonzero if salient observations differ from `eval/development/persona-baseline.json`. The snapshot compares question/answer paths, dispositions, readiness, coverage, candidate priorities, recovery, coordinates/ranges, components and selected findings/resources. UUIDs, timestamps, byte counts, transport use and timings are excluded. This is a deterministic control-flow regression, not a numerical answer key for live Jev.

Update the baseline deliberately after inspecting intended changes:

```sh
pnpm journeys:generate --write-baseline
pnpm fix:format
pnpm journeys:check
```

Baseline updates require all ten personas and the five-turn bound; they preserve earlier full runs and overwrite only the version-controlled compact baseline. Review its Git diff and commit at a sensible checkpoint. An updated baseline is not human semantic approval.

## Bounded live Jev runs

Paid inference remains explicit and CLI-only. It requires exactly one persona, an answer bound of 1–6 and the existing shared physical-request budget of 1–24, counting retries and batches across all stages. No live runs occur on page load or through its buttons.

```sh
pnpm journeys:generate --live --persona=control-alarmist --turns=3 --allow-paid --max-requests=12
```

Only live mode loads `.env.local` and uses the existing server-only `TYPESAFE_API_KEY`; no new credentials or OpenAI API calls are needed for the Codex-authored scripts. The bound is a ceiling, not a promised number of completed turns. Budget exhaustion/provider failure saves completed operations as an explicitly partial run and exits nonzero, without logging credential values or transport bodies. Earlier artifacts remain intact. Inspect the saved run in the page after generation.

Published fictional personas are development cases, not a blinded holdout. Review answer relevance and expected interpretations before trusting them as semantic evaluation cases. Keep the separate human review/held-out measurement gates from [MEASUREMENT.md](MEASUREMENT.md) open.
