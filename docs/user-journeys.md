# User Journeys: live participants and assessment

Open `/user-journeys` at the Portless development URL. This internal tool uses the current question catalog, assessment engine, routing eligibility/ranking, recovery policy, readiness gate and projection code. It has no connection to the participant’s browser assessment or debug history. Production returns 404 for both page and API.

## Live runs are the experience review baseline

As authorized on 2026-09-18, occasional development journeys use **GPT-5.4 mini as the fictional participant and live Jev through the actual assessment engine**. API costs for both are expected. The inspector defaults to live reruns and prefers a saved live run. Nothing runs on page load.

The participant receives the character’s beliefs and voice, the actual questions and prior replies, and any recovery guidance. It does not receive fixture levels, target coverage, rubric, scores, candidate rankings or readiness. Its complete reply passes unchanged to the normal engine; Jev receives the ordinary participant evidence, never persona labels or hypotheses. **Live personas have no predetermined target judgments.** Review the assessment against what the participant actually said. The scripted two-miss recovery prelude remains an explicit fixture action before the OpenAI participant resumes.

Every generated reply retains the exact OpenAI request instructions/input, returned model, reply, usage and duration alongside the Jev exchanges. Failed assessment operations preserve the generated pending reply. No fallback injects synthetic judgments into a live run. Earlier scripted-live artifacts remain labeled separately. These simulations evaluate the application, not the prevalence of real human beliefs; inspect persona fidelity as part of review.

```sh
pnpm journeys:live
pnpm journeys:live --persona=control-alarmist --turns=5
pnpm journeys:live --turns=6 --max-requests=240 --max-cost=2
```

Defaults: five answer opportunities; 24 physical Jev requests for one persona or a shared 240 for all ten; at most one OpenAI call per answer opportunity; a $2 conservative cost budget. Retries/fallbacks count against the Jev bound; failed usage retains its reservation. A failure after progress is saved and other personas may continue; failure before any accepted answer stops the suite. Budgets and incomplete runs are visible in artifacts. Counts of completed successful requests are distinct from reserved/unknown failed usage. Cost estimates use published rates ($0.75/M input and $4.50/M output for GPT-5.4 mini; $0.042/M Jev input, free output), charging cached input at full price. Byte-based input reservations include overhead and all allowed attempts; these are local estimates, not a provider billing guarantee.

Set server-side `OPENAI_API_KEY` in the environment or `.env.local`, alongside `TYPESAFE_API_KEY`. The normal participant application still uses only Jev. No new dependencies or external storage are required.

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

Select a persona and saved run. Each chronological operation shows the exact issued question, full answer with bounded disclosure, consumed disposition, readiness before/after, newly covered dimensions and actual next question. Decision details show shortlisted candidate priorities, the engine’s local decisions and readiness contributions. Full stage requests/responses are available for locally generated runs, with the same folding, sorting and meaning help as interview debugging. New live snapshots retain the original fictional profile without injected fixture levels or coverage flags; synthetic snapshots retain those test inputs. Later catalog edits do not rewrite recorded descriptions. Older development artifacts without that snapshot label the displayed authoring as current. This exposes recorded judgments and code composition, not hidden model reasoning.

The default is five answer opportunities, continuing follow-ups even if a first answer qualifies, then projection when eligible. Recovery actions are separate operations. A run that cannot pass readiness retains its questions/answers and explicitly shows no result. There is no fabricated result or bypass of the app’s gate. In algorithm 0.5.0, projection preserves evidence readiness while separately representing unplaceable positions.

Explicit unknowns count as presence in the synthetic hypotheses, with unknown worldview positions remaining unplaced. Historical algorithm 0.4.0 runs marked unplaced components unassessed during projection, so their final meter could fall below the earlier eligibility threshold. Algorithm 0.5.0 preserves the evidence coverage. The inspector calls out this transition and preserves both per-step readiness and the first eligible answer. A one-turn sparse/undecided run remains ineligible; a longer uncertain run can yield an honest unplaced outlook.

**Synthetic** means authored presence/position/score hypotheses are injected, with zero inference requests. Routing benefit hypotheses use missing targets and unresolved flags; the real engine applies shortlist eligibility, weights, effort, repetition, calibration and ID tie-breaks. These runs demonstrate workflow behavior, not whether Jev understood the text. Hypotheses and family/question-specific answer scripts live in `lib/journeys/catalog.ts`; inspect them through Run provenance and persona. Confidence is deliberately deterministic in this mode rather than measured calibration.

**Live Jev + OpenAI** means generated answers pass through the live provider. Older **Jev + scripted answers** runs use the authored answer bank. Persona labels, expected levels and injected judgments are not included in model state; assessment identifiers are opaque. Real Jev may ask a different sequence, interpret coverage differently or leave coordinates unplaced. The OpenAI participant responds to the actual question, including new authored families. Synthetic fixtures still require an explicit script and fail clearly for unsupported questions or judgments.

## Regenerate and compare

```sh
pnpm journeys:generate
pnpm journeys:generate --persona=worried-novice --turns=6
pnpm journeys:generate --persona=control-alarmist --turns=1
pnpm journeys:check
```

Choose Synthetic fixture explicitly for free reruns of one persona or all ten; the default is a paid live run. Saved artifacts are immutable directories under `eval/runs/journeys/<run-id>/`, containing complete `suite.json` and small `index.json`. They are ignored by Git and survive server/browser refresh. The inspector lists the 40 most recent plus the checked-in baseline; older artifacts remain on disk. API writes require development mode, a local hostname and same origin. Reads validate artifact identity, schema and a 32 MB bound. Damaged artifacts produce an error rather than being overwritten.

Compare with a previous run to see question/next-question paths, per-step readiness and final outlook/reasoning. Input, content and engine hashes accompany versions and model. Rows align chronological operations: when routing diverges, later scripts can also differ. A warning identifies changed persona inputs or turn bounds. Synthetic-versus-Jev comparisons are diagnostic, not claims of equivalent judgments.

`pnpm journeys:check` regenerates free synthetic paths and exits nonzero if salient observations differ from `eval/development/persona-baseline.json`. The snapshot compares question/answer paths, dispositions, readiness, coverage, candidate priorities, recovery, coordinates/ranges, components and selected findings/resources. UUIDs, timestamps, byte counts, transport use and timings are excluded. This is a deterministic control-flow regression, not a numerical answer key for live Jev.

Synthetic assessment IDs are opaque and deterministic to keep baseline diffs readable; live IDs are random and carry no persona label. Run directories always have unique IDs, preserving all earlier full exchanges.

Update the baseline deliberately after inspecting intended changes:

```sh
pnpm journeys:generate --write-baseline
pnpm fix:format
pnpm journeys:check
```

Baseline updates require all ten personas and the five-turn bound; they preserve earlier full runs and overwrite only the version-controlled compact baseline. Review its Git diff and commit at a sensible checkpoint. An updated baseline is not human semantic approval.

## Review boundaries

Occasional live development journeys are authorized. This does not authorize unbounded pressure testing, recurring automatic spend, or claim human-reviewed holdout validation. The separate release/holdout review gates remain open.

Published fictional personas are development cases, not a blinded holdout. Review answer relevance and expected interpretations before trusting them as semantic evaluation cases. Keep the separate human review/held-out measurement gates from [MEASUREMENT.md](MEASUREMENT.md) open.
