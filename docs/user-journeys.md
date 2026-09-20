# Current diagnostic additions

The [0.6.0 diagnostic loop](diagnostic-improvement-loop.md) adds an exact real-user transcript replay to the 15 generated personas, preserves routing recommendations at each fixed prefix, and separates expressed outlook from net-impact forecasts. The current suite has 16 journeys.

# User Journeys: live stress-test participants

Open `/user-journeys` at the Portless development URL. The development-only inspector exercises the actual assessment engine, question eligibility/ranking, recovery policy, readiness gate and projections. Production returns 404 for the page and API. Nothing calls a model on page load.

## Purpose and authoring

The fifteen personas deliberately stress-test widely divergent positions, including extreme pessimism, forceful optimism, dismissive anti-doomerism, rigid certainty and genuine uncertainty. Public figures supply recognizable arguments and language, not balanced biographical portraits. Generated answers are fictional, not quotations or endorsements. Do not make every persona hedge, volunteer counterarguments or provide ideal update criteria. Do not improve a weak argument to help the persona score well.

`lib/journeys/catalog.ts` holds narrative-only context. `lib/journeys/public-personas.ts` contains five public-figure proxies with dated source summaries, short quoted anchors and voice instructions. The participant receives those summaries, not just URLs. The other ten cases cover novice concerns, high-risk acceleration, capability skepticism, labor harms, uncertainty, dogmatic optimism, dogmatic doom, playful recovery and two terse everyday participants.

The public proxies are:

- **Control alarmist — Eliezer Yudkowsky:** conditional extinction forecast under current methods; uncertainty about timing and hope for political intervention do not dilute the central claim.
- **Cautious builder — Sam Altman:** ambitious abundance and individual empowerment, including his September 2026 endorsement of frontier pacing and independent evaluators.
- **Abundance advocate — Marc Andreessen:** strong pro-building rhetoric, moral costs of delay and opposition to incumbent-protecting regulation.
- **Doomer-hoax critic — Jensen Huang:** deliberately selected incendiary All-In anti-doomer arguments and endorsement of the hoax framing, rather than an average of his public positions. Preserve speaker attribution during Trump's call.
- **Frontier pacer — Dario Amodei:** unusually large potential benefits alongside serious risks and an explicit present call to slow frontier capability growth.

The [existing-proxy source packet](research/persona-grounding-existing-2026-09-20.md) and [new-proxy source packet](research/persona-grounding-new-2026-09-20.md) record dates, sources and retrieval limitations. Some statements were retrieved through linked mirrors; distinguish verified words from editorial persona synthesis.

## Live models and boundaries

The default participant is **GPT-5.6 Sol** (`gpt-5.6-sol`), with live Jev through the normal engine. The participant receives character context, actual questions, conversation history and recovery guidance. It never sees desired scores, judgment targets, readiness, candidate rankings or the assessment rubric. Jev receives the actual answers and ordinary engine state, not persona identity or source packets.

Every reply retains the OpenAI request, returned model, exact answer, usage and duration. Answers pass unchanged to the engine. Failed operations preserve pending answers and safe diagnostics. No live failure substitutes a scripted answer or mocked judgment.

Occasional paid development runs are authorized. This is not authorization for unbounded pressure testing or recurring automatic spend. These published cases are not a blinded holdout or human semantic validation.

## Answer-only journeys and per-answer results

```sh
pnpm journeys:generate
pnpm journeys:generate --persona=control-alarmist --turns=5
pnpm journeys:generate --max-requests=240 --max-cost=5
```

New live artifacts contain only question-and-answer steps. Each answer retains its exact question, disposition, evidence readiness before/after, coverage changes and selected next question. The harness does not insert separate project, continue or clarification turns. The old `--exercise-results` live option has been removed. Separate mechanical tests can still exercise those application operations.

For each usable answer, the engine computes a shared profile before selecting the next question. The harness records that exact profile; opening the disclosure does not re-run inference or change the interview. No extra participant answer is generated for inspection. The step saves the result and the complete projection input state; full local traces include the actual Jev projection exchange. This makes the projection an actual observed result, not a locally fabricated chart or a reuse of the final result.

**Result after this answer** is collapsed by default and shows the Doom–Bloom map, interpretation ranges, components and underlying input state. Before result eligibility it shows the partial interpretation with its insufficient-evidence status. This does not bypass the participant-facing result gate; the interview continues. Non-answer attempts have no new result. The final result remains at the bottom. Two scripted non-answer recovery submissions remain actual answer steps; the retry transition itself is not a displayed step.

The disclosure sits at the bottom of every answer step beside Decision details and Requests and responses. Old journey formats are not migrated.

## Readiness is coverage, not guaranteed progress per answer

Readiness averages supported presence across 15 dimensions using each dimension's strongest active interpretation support, halved for an unresolved issue. It does not count the number of answers, distinct arguments, or certainty about a forecast. Repetition cannot automatically increase it. Once presence is established, another meaningful answer can change a position or narrow its interpretation without adding coverage.

Flat or tiny gains are an elicitation review signal: inspect whether the question captured a new claim, resolved uncertainty, or merely repeated an earlier answer. Routing uses continuous support gaps, and ambiguity/tension bonuses require a matching unresolved issue. See [the question and routing audit](prompt-quality-review.md) for the current catalog and review loop. The meter uses one decimal to expose small gains.

## Budgets and storage

Default: five answer opportunities (CLI allows one to six), at most one OpenAI call per opportunity, 24 physical Jev requests for one persona or 240 shared across all fifteen, and a $2 estimated cost limit. Each usable answer includes a shared-profile request before routing. Automatic results end the live simulation; it does not silently opt into deeper exploration. Increase the explicit bounded cost limit if needed. Rates checked 2026-09-20: Sol $4/M input and $20/M output; Jev $0.042/M input and free output. Cached input is conservatively charged in full. See [Sol model documentation](https://developers.openai.com/api/docs/models/gpt-5.6-sol). Failed usage may remain reserved; this is an estimate, not a provider invoice.

Set server-only `OPENAI_API_KEY` and `TYPESAFE_API_KEY` in the environment or `.env.local`. The ordinary participant app still uses only Jev.

Full local artifacts live at `eval/runs/journeys/<run-id>/{suite,index}.json` and are ignored by Git. A successful save replaces earlier runs of the same mode. Live saves also replace `eval/development/live-persona-journeys.json` with the current suite minus bulky Jev traces, so a fresh checkout sees the latest answers, results and states. The separate current mechanical baseline remains a regression fixture. There is no run-history selector, historical comparison UI or old-run migration. The inspector shows the latest live suite without rerun controls; generation remains available through the CLI. Reads/writes are schema-checked and bounded at 64 MB; indices at 20 KB.

## Separate mechanical regression layer

`lib/journeys/mechanical/` contains ten independent engine cases with canned replies and injected judgments. These are not persona answer keys. They remain separate from the fifteen live personas; Huang and Amodei do not require invented mechanical judgments.

```sh
pnpm journeys:mechanical
pnpm journeys:mechanical:check
pnpm journeys:mechanical --write-baseline
```

The checked-in `eval/development/mechanical-journey-baseline.json` tests deterministic paths, dispositions, coverage, ranking and projection composition. `journeys:check` remains an alias. Updating it requires all ten mechanical cases and five turns; review and commit its diff. A passing mechanical comparison says nothing about live Jev's understanding.

## Resume a failed operation

```sh
pnpm journeys:generate --resume=<run-id> --persona=<persona-id> --max-requests=24 --max-cost=0.5
```

Resume retries exactly the saved operation with a fresh bounded budget and no new OpenAI reply. A failed per-answer inspection projection resumes on the same answer, without replaying that accepted answer or adding a project step. It does not automatically finish the remaining interview. Source content and model must match. Saving the resumed run replaces the previous run. Raw error bodies, headers and credentials are excluded.

### Response detail

Narrative personas can specify `responseStyle`: `detailed`, `conversational` (default), or `brief`. Public proxies and selected fictional participants develop extended arguments; the brief pragmatist and brief job worrier deliberately remain terse. This instruction reaches only the simulated participant. It never reaches Jev or supplies expected scores. `pnpm journeys:review` reports style and per-answer word counts so a shared-prompt edit cannot silently flatten the intended range of answer detail.

## Experimental worldview comparison

The inspector's “Watch the worldview develop” disclosure is closed by default and switches both alternative maps, stated or inferred P(doom), milestone timing and assumptions to the selected saved answer. Earlier placed answers appear as numbered dots. Per-answer disclosures and final results show the same views.

`pnpm exec node --env-file=.env.local --conditions=react-server --import tsx scripts/replay-worldview-experiments.ts --allow-paid --max-requests=240 --max-cost=5` evaluates only the new fields against saved per-answer input states. This is a bounded live development replay, not regenerated participant answers or paid pressure testing. It sends the saved evidence, including any fixed personal transcript, to Jev; obtain authorization for that transfer before running.

Results are saved incrementally to `eval/development/worldview-experiments.json`; raw requests and typed responses stay under ignored `eval/runs/worldview-experiments/`. The loader overlays a record only when the source run ID, persona, step, input hash and evidence revision match. Core historical scores, answers and provenance are untouched. A replay can resume without repeating completed snapshots; missing or changed snapshots show an explicit unavailable state.

The 2026-09-20 replay was explicitly approved and covers all 45 saved result snapshots across 16 journeys. `--persona=<id>` scopes a review; `--refresh` replaces matching records after an extraction change. The `worldview-v2` pass verifies each selected excerpt independently, so alternative suitable quotes do not erase supported beliefs. See [comparison observations](worldview-experiment-review-2026-09-20.md).

The current `worldview-v3` engine generates inferred P(doom) on every result snapshot. Full live regeneration replaces the previous suite; no separate historical overlay is needed. Only final results are expanded by default.
