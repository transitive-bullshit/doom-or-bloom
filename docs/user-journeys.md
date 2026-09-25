# Current diagnostic additions

> Approved persistence transition (2026-09-23), not yet implemented: The approved [persona persistence design](PERSISTENCE.md#personas-and-seeding) replaces runtime file selection with a persona-to-selected-assessment relation, retaining immutable prior runs and actual source provenance. Seeding existing curated public records requires no paid inference. Until [checkpoint 4](persistence-implementation-plan.md#checkpoint-4--dynamic-curated-personas), the file-based workflows below remain the implementation baseline.

The [0.6.0 diagnostic loop](diagnostic-improvement-loop.md) adds an exact real-user transcript replay to the 30 generated personas, preserves routing recommendations at each fixed prefix, and separates expressed outlook from net-impact forecasts. The current suite has 31 journeys.

# User Journeys: live stress-test participants

Open `/user-journeys` at the Portless development URL. The development-only inspector exercises the actual assessment engine, question eligibility/ranking, recovery policy, readiness gate and projections. Production returns 404 for the page and API. Nothing calls a model on page load.

## Purpose and authoring

The thirty personas deliberately stress-test widely divergent positions, including extreme pessimism, forceful optimism, dismissive anti-doomerism, rigid certainty and genuine uncertainty. Public figures supply recognizable arguments and language, not balanced biographical portraits. Generated answers are fictional, not quotations or endorsements. Do not make every persona hedge, volunteer counterarguments or provide ideal update criteria. Do not improve a weak argument to help the persona score well.

`lib/journeys/catalog.ts` holds narrative-only context. The six `lib/journeys/*public-personas.ts` modules contain thirty-six public-figure proxies with dated source summaries, short quoted anchors and voice instructions. The participant receives those summaries, not just URLs. The other ten cases cover novice concerns, high-risk acceleration, capability skepticism, labor harms, uncertainty, dogmatic optimism, dogmatic doom, playful recovery and two terse everyday participants.

The public proxies are:

- **Control alarmist — Eliezer Yudkowsky:** conditional extinction forecast under current methods; uncertainty about timing and hope for political intervention do not dilute the central claim.
- **Cautious builder — Sam Altman:** ambitious abundance and individual empowerment, including his September 2026 endorsement of frontier pacing and independent evaluators.
- **Abundance advocate — Marc Andreessen:** strong pro-building rhetoric, moral costs of delay and opposition to incumbent-protecting regulation.
- **Doomer-hoax critic — Jensen Huang:** deliberately selected incendiary All-In anti-doomer arguments and endorsement of the hoax framing, rather than an average of his public positions. Preserve speaker attribution during Trump's call.
- **Frontier pacer — Dario Amodei:** unusually large potential benefits alongside serious risks and an explicit present call to slow frontier capability growth.
- **Empirical skeptic — Gary Marcus:** current architectural limits, concrete misuse risks, and complementary regulation and liability.
- **Practical optimist — Andrew Ng:** application-driven benefits, skills transitions and engineering fixes rather than a pause.
- **World-model optimist — Yann LeCun:** a different technical route to powerful AI, with physical-world planning and open research.
- **Concerned pioneer — Geoffrey Hinton:** control and employment concerns alongside substantial medical and educational potential.
- **Bubble critic — Ed Zitron:** unreliable products, concentrated financial risk and responsibility for present harms.

- **Democratic moratorium — Bernie Sanders:** public control, worker protection and a proposed superintelligence ban.
- **Competitive decentralist — David Sacks:** continued development, competition, open models and product liability.
- **Scientific steward — Demis Hassabis:** extraordinary scientific ambition and a coordinated standards framework.
- **Coordinated scaler — Sholto Douglas:** rapid safe progress, economic transformation and opposition to concentrated power.
- **Alignment maximalist — Roon:** radical transformation, urgent alignment work, frontier pacing and broad access to safely trained models.
- **Efficient intelligence builder — Noam Shazeer:** engineering efficiency, substantial benefits and increasing care with capability.
- **Reasoning frontier builder — Noam Brown:** scientific progress, real bottlenecks and layered defenses.
- **Learning bottleneck investigator — Dwarkesh Patel:** continual learning, evolving views on research acceleration and changing oversight requirements.
- **Abundance risk-taker — Elon Musk:** extraordinary abundance from AI and robots, serious control concerns and recent support for frontier pacing.
- **Open-science realist — Nathan Lambert:** economically consequential progress and open research, with skepticism of runaway self-improvement and concern about inadequate risk preparation.

The first five additions were researched on September 21, 2026. Their authored briefs retain dated primary-source links and summaries in `lib/journeys/additional-public-personas.ts`; each has 2026 grounding. LeCun’s 2024 interview is explicitly older conceptual context. These are narrative inputs, never desired coordinates, probabilities or reasoning scores.

The next eight briefs in `lib/journeys/frontier-public-personas.ts` prioritize recent first-person statements, including September 2026 posts retrieved directly through the X API. Shazeer’s broader worldview uses his own turns in a February 2025 interview, supplemented by 2026 engineering statements; no fresh policy position is inferred from his job change. Dario’s existing brief was refreshed, not duplicated. Musk’s subsequent addition uses April–September 2026 first-person posts, the January Davos transcript and a clearly identified mirror of his July Economist interview. His latest pacing endorsement takes precedence over a simple unconditional-acceleration stereotype. [Research notes](research/persona-expansion-2026-09-21.md) record source limitations and attribution rules.

Lambert’s four primary essays include his September 19 RSI post, September 9 adoption essay, August 9 safety analysis and September 21 open-model briefing. Distinguish his forecasts from the views he quotes; his skepticism about runaway self-improvement does not imply insignificant AI benefits.

The [existing-proxy source packet](research/persona-grounding-existing-2026-09-20.md) and [new-proxy source packet](research/persona-grounding-new-2026-09-20.md) record dates, sources and retrieval limitations. Some statements were retrieved through linked mirrors; distinguish verified words from editorial persona synthesis.

## Live models and boundaries

The default participant is **GPT-5.6 Sol** (`gpt-5.6-sol`), with live Jev through the normal engine. The participant receives character context, actual questions, conversation history and recovery guidance. It never sees desired scores, judgment targets, readiness, candidate rankings or the assessment rubric. Jev receives the actual answers and ordinary engine state, not persona identity or source packets.

Every reply retains the OpenAI request, returned model, exact answer, usage and duration. Answers pass unchanged to the engine. Failed operations preserve pending answers and safe diagnostics. No live failure substitutes a scripted answer or mocked judgment.

Occasional paid development runs are authorized. This is not authorization for unbounded pressure testing or recurring automatic spend. These published cases are not a blinded holdout or human semantic validation.

## Answer-only journeys and per-answer results

```sh
pnpm journeys:generate
pnpm journeys:generate --persona=control-alarmist --turns=5
pnpm journeys:generate --max-requests=1128 --max-cost=5
```

New live artifacts contain only question-and-answer steps. Each answer retains its exact question, disposition, evidence readiness before/after, coverage changes and selected next question. The harness does not insert separate project, continue or clarification turns. The old `--exercise-results` live option has been removed. Separate mechanical tests can still exercise those application operations.

For each usable answer, the engine computes a shared profile before selecting the next question. The harness records that exact profile; opening the disclosure does not re-run inference or change the interview. No extra participant answer is generated for inspection. The step saves the result and the complete projection input state; full local traces include the actual Jev projection exchange. This makes the projection an actual observed result, not a locally fabricated chart or a reuse of the final result.

**Result after this answer** is collapsed by default and shows the Doom–Bloom map, interpretation ranges, components and underlying input state. Before result eligibility it shows the partial interpretation with its insufficient-evidence status. This does not bypass the participant-facing result gate; the interview continues. Non-answer attempts have no new result. The final result remains at the bottom. Two scripted non-answer recovery submissions remain actual answer steps; the retry transition itself is not a displayed step.

The disclosure sits at the bottom of every answer step beside Decision details and Requests and responses. Old journey formats are not migrated.

## Readiness is coverage, not guaranteed progress per answer

Readiness averages supported presence across 15 dimensions using each dimension's strongest active interpretation support, halved for an unresolved issue. It does not count the number of answers, distinct arguments, or certainty about a forecast. Repetition cannot automatically increase it. Once presence is established, another meaningful answer can change a position or narrow its interpretation without adding coverage.

Flat or tiny gains are an elicitation review signal: inspect whether the question captured a new claim, resolved uncertainty, or merely repeated an earlier answer. Routing uses continuous support gaps, and ambiguity/tension bonuses require a matching unresolved issue. See [the question and routing audit](prompt-quality-review.md) for the current catalog and review loop. The meter uses one decimal to expose small gains.

## Budgets and storage

Default: five answer opportunities (CLI allows one to six), at most one OpenAI call per opportunity, 24 physical Jev requests for one persona or 940 shared across the current full suite (20 per catalog entry including the fixed replay, with an explicit ceiling of 24 per entry), and a $5 estimated cost limit for the full suite ($2 for a single persona). The offline persona runner explicitly requests a result snapshot after each eligible answer for its authoring output; ordinary runtime routing does not generate intermediate results. Automatic results end the live simulation; it does not silently opt into deeper exploration. Increase the explicit bounded cost limit if needed. Rates checked 2026-09-20: Sol $4/M input and $20/M output; Jev $0.042/M input and free output. Cached input is conservatively charged in full. See [Sol model documentation](https://developers.openai.com/api/docs/models/gpt-5.6-sol). Failed usage may remain reserved; this is an estimate, not a provider invoice.

Set server-only `OPENAI_API_KEY` and `TYPESAFE_API_KEY` in the environment or `.env.development.local`. The ordinary participant app still uses only Jev.

Full local artifacts live at `eval/runs/journeys/<run-id>/{suite,index}.json` and are ignored by Git. A successful save replaces earlier runs of the same mode. Live saves also replace `eval/development/live-persona-journeys.json` with the current suite minus bulky Jev traces, so a fresh checkout sees the latest answers, results and states. The separate current mechanical baseline remains a regression fixture. There is no run-history selector, historical comparison UI or old-run migration. The inspector shows the latest live suite without rerun controls; generation remains available through the CLI. Reads/writes are schema-checked and bounded at 256 MB for up to 256 journeys; indices at 160 KB. The absolute request ceiling is 1536, with the ordinary single-person default still 24.

A latest-results collection can combine independent generation batches. Its optional `sourceRuns` records each included persona’s original run, date and input/engine/content hashes. Top-level hashes then identify the assembled catalog; they do not imply every journey was regenerated simultaneously. Exact answers, traces and source snapshots remain intact, and generation costs are summed. Source IDs are provenance metadata, not retained historical runs.

## Separate mechanical regression layer

`lib/journeys/mechanical/` contains ten independent engine cases with canned replies and injected judgments. These are not persona answer keys. They remain separate from the generated live personas; Huang and Amodei do not require invented mechanical judgments.

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

`pnpm exec node --env-file=.env.development.local --conditions=react-server --import tsx scripts/replay-worldview-experiments.ts --allow-paid --max-requests=240 --max-cost=5` evaluates only the new fields against saved per-answer input states. This is a bounded live development replay, not regenerated participant answers or paid pressure testing. It sends the saved evidence, including any fixed personal transcript, to Jev; obtain authorization for that transfer before running.

Results are saved incrementally to `eval/development/worldview-experiments.json`; raw requests and typed responses stay under ignored `eval/runs/worldview-experiments/`. The loader overlays a record only when the source run ID, persona, step, input hash and evidence revision match. Core historical scores, answers and provenance are untouched. A replay can resume without repeating completed snapshots; missing or changed snapshots show an explicit unavailable state.

The 2026-09-20 replay was explicitly approved and covers all 45 saved result snapshots across 16 journeys. `--persona=<id>` scopes a review; `--refresh` replaces matching records after an extraction change. The `worldview-v2` pass verifies each selected excerpt independently, so alternative suitable quotes do not erase supported beliefs. See [comparison observations](worldview-experiment-review-2026-09-20.md).

The current `worldview-v6` engine generates inferred P(doom) on every result snapshot. Full live regeneration replaces the previous suite; no separate historical overlay is needed. Only final results are expanded by default.

Every results view includes a separate demonstrated-reasoning axis. The v4 map interpretation preserves tentative points and labels dominant indecision as unsettled. Two direct map questions cover unexplored collective influence and transformation scale before automatic completion.

## Expanded canonical public figures — September 21, 2026

Sixteen additional source-grounded participants bring the public set to 36 people and the full collection to 47 journeys (46 generated personas plus the fixed personal replay). All new public briefs request detailed answers and supply narrative beliefs, dated source summaries and voice guidance, never desired coordinates or judgment targets.

- [Foundational researchers](research/foundational-personas-2026-09-21.md): Yoshua Bengio, Ilya Sutskever, Andrej Karpathy, Fei-Fei Li, Richard Sutton, Stuart Russell, Max Tegmark and Liang Wenfeng.
- [Social and economic perspectives](research/social-personas-2026-09-21.md): Timnit Gebru, Arvind Narayanan, Daron Acemoglu, Mark Zuckerberg and Emily M. Bender.
- [Public leaders](research/civic-personas-2026-09-21.md): Barack Obama, Donald Trump and Bill Gates.

The briefs prioritize inspected recent first-person material. Sutton’s substantial verified sources remain from 2025; Liang’s direct interviews are from 2023–2024. An unverified purported 2026 Liang meeting was excluded from participant inputs. These freshness limits remain visible in the source packets.

The featured prototype map includes all 36 public personas, including the existing Jensen Huang journey. Coordinates come only from saved live assessments. Portrait provenance and official-source fallbacks are recorded in `public/personas/SOURCES.md`. The latest collection retains existing valid journeys while incorporating live runs for the new personas, with original generation provenance for each batch.

The [live generation record](research/canonical-persona-run-2026-09-21.md) records the new batch’s observed placements, costs and validation.

## Publicly stated P(doom) overrides

`lib/journeys/public-pdoom-statements.ts` records verified numerical public statements with a date, URL, outcome, horizon and conditions. These are attached to the persona snapshot and applied to every available per-answer result and the final result after the real assessment has run. They do not change Jev inputs, routing, readiness, reasoning scores or map coordinates. Personal assessments and mechanical tests do not use this override.

Overridden estimates have `source: public-statement`, a `publicStatement` provenance record, and the original engine value in `assessmentEstimate`. The displayed token preserves ranges and inequalities. The axis dot uses the range midpoint when no point estimate was stated; the UI explicitly explains this. A quoted range is not an interpretation confidence interval.

The initial verified set covers Hinton (10–20%, January 2025, with later qualitative context), Marcus (approximately 3%), Dario (25%), Tegmark (>90% conditional on no regulation), and Noah (approximately 10% civilization collapse from biological misuse, with his separate 30% severe-destruction estimate retained as context). These endpoints are not interchangeable extinction forecasts. Unverified numbers attributed to other people remain excluded; their simulated answers continue through normal estimation.

## Soares and Greenblatt — September 22, 2026

The canonical map now includes 39 public figures. The latest collection has 50 journeys: 49 generated personas plus the fixed personal replay. Added [Nate Soares](research/nate-soares-persona-2026-09-22.md) with 10 source records and [Ryan Greenblatt](research/ryan-greenblatt-persona-2026-09-22.md) with 12. The supplied videos remain linked; Ryan's matching publisher transcript is available, while Nate's linked interview was not transcript-accessible and substantive grounding comes from separately inspected sources.

Both new personas use detailed GPT-5.6 Sol answers and live Jev routing and projection. Each completed after two accepted answers. The new batch used four OpenAI requests and 20 Jev requests, estimated at $0.0912. Collection `1790016746550-bb749692-1ce5-4c35-837f-27fce8dccc82` retains the previous 48 current journeys and records both generation batches in `sourceRuns`; it is not a replay of all 50. The local store still retains only the latest collection.

Soares' observed outlook is 18/100 and transformation 99.7/100, with inferred P(doom) approximately 62%. His brief's collective conditional MIRI estimate is not used as a personal public-probability override. Greenblatt's observed outlook is 37.5/100 and transformation 87/100. His source-backed displayed 35–40% is AI takeover by 2040, dated August 11, 2026; the original inferred estimate is approximately 33%. These are outputs of the live runs, not target coordinates or labels supplied to Jev.

## Carlsmith, Alexander, Kokotajlo and Cowen — September 22, 2026

Added four detailed source-grounded participants and their canonical map entries:

- [Joe Carlsmith](research/joe-carlsmith-persona-2026-09-22.md): 12 sources, including the supplied essays and verified Dwarkesh transcript.
- [Scott Alexander](research/scott-alexander-persona-2026-09-22.md): 13 sources, including the supplied September 20 post and June personal forecast update.
- [Daniel Kokotajlo](research/daniel-kokotajlo-persona-2026-09-22.md): 11 sources, including AI 2027, AI 2040, August forecasts and the Palisade interview.
- [Tyler Cowen](research/tyler-cowen-persona-2026-09-22.md): 10 sources, including September economic analysis and interview, July DeepMind talk, regulation proposals and a verified X post.

Collection `1790017721834-b165144d-d663-462a-aadf-ea5fc949d961` contains 54 journeys: 53 generated personas and the fixed real-user replay. The featured map contains 43 public figures. The new batch uses GPT-5.6 Sol and live Jev; existing 50 journeys are retained unchanged, with original batch provenance in `sourceRuns`. The four new runs completed without errors, using 13 OpenAI requests and 65 Jev requests, at an estimated $0.2724.

| Persona | Accepted answers | Outlook | Transformation | Displayed P(doom) |
| --- | --: | --: | --: | --- |
| Joe Carlsmith | 5 | 41/100 | 98.5/100 | Inferred ≈21% |
| Scott Alexander | 4 | 67.2/100 | 91/100 | Stated 20%, June 11, 2026 |
| Daniel Kokotajlo | 3 | 20.8/100 | 88/100 | Inferred ≈67% |
| Tyler Cowen | 1 | 74/100 | 31/100 | Inferred ≈12% |

These are observed outputs, not target coordinates. Scott's public override preserves the current-safety-effort, possible-pause and no-fixed-deadline context. Joe's old 5% has been repudiated and his more recent double-digit wording does not establish a precise percentage. Daniel's reported 70% was not verified against the original episode, so no public override is supplied. AI 2040 remains explicitly a policy recommendation rather than a 2040 arrival forecast. Cowen's slower-adoption interpretation is the engine's output; the brief also includes his expectations of eventual institutional transformation.

All new regular source bookmarks have local preview images; six Cowen article screenshots provide fallbacks where automated preview retrieval failed. X portraits are recorded in `public/personas/SOURCES.md`.

## Refresh saved scoring without regenerating interviews

Run `pnpm exec node --env-file=.env.development.local --conditions=react-server --import tsx scripts/replay-worldview-experiments.ts --allow-paid --max-requests=720 --max-cost=3 --publish` after authorizing transfer of the saved evidence to Jev. The replay evaluates current experimental mappings against every saved per-answer input, including the fixed personal transcript. Explicit percentages and recorded public-source overrides are preserved.

The replay saves each completed snapshot for resumption. `--publish` requires the full collection (no `--persona`) and validates that every result has a matching input hash, evidence revision, and current scoring version before atomically replacing the bundled persona results. Both the map and persona pages then read the refreshed bundle. The original interview timestamps, source-run hashes, core scores, questions, and answers remain intact; the replay artifact records the new interpretation timestamps, requests, and scoring cost. Browser-local personal assessments are separate and are not migrated by this command.

## Andrew McAfee — September 23, 2026

Added [Andrew McAfee](research/andrew-mcafee-sources-2026-09-23.md) at `/users/amcafee` with seven dated 2026 sources: four original-publisher interviews/articles, two authored X posts, and the requested Diary of a CEO debate. Only his labeled turns from the third-party debate transcript ground the persona; neither other speakers nor the full transcript are included. His official MIT biography supplies the portrait.

Collection `1790155057347-68d138b5-54b4-45c9-94aa-9de424aeddbe` contains 55 journeys and 44 public figures. The new live run completed after one detailed accepted answer, with one GPT-5.6 Sol request and five Jev requests, estimated at $0.0181. All previous 54 journey records are preserved unchanged, with original batch provenance. The top-level cost reports only this new batch.

The source-backed displayed P(doom) is approximately 0%, explicitly rounded rather than impossible, with no fixed forecast horizon. Its numerical display anchor is zero; it is not a measured exact probability or an invented uncertainty interval. The original inferred estimate remains recorded. The transformation result is 47.4/100 and human influence is tentative; these are live model outputs, not editorial targets.

## Database-backed curated publication (2026-09-23)

Public runtime pages now read the selected simulation assessment from Postgres. `pnpm db:seed` imports the curated catalog only (44 public people), preserving recorded questions, answers, projection inputs, source snapshots, sourced P(doom) overrides and original run provenance. The 55-journey development fixture remains historical evidence and seed input, rather than a runtime data source. Historical payloads are explicitly `historical_journey_v1`; they do not pretend to contain a resumable engine state.

Live generation and explicit resume save a private input record before running, retain the full final engine snapshot as `simulation_v1`, and publish/select only after success. Failed operations keep private input/checkpoint diagnostics and do not change the selected public run. Each new generation gets its own assessment URL. Reusing a generation key never repeats paid calls; use a new explicit run to retry. Selection compares generation start timestamps so older late completions and repeated seeds cannot roll it back. The offline generation commit window is 30 minutes; participant POST deadlines remain separate and unchanged. No scheduler, queue or worker is involved.

Authored briefs remain generation inputs. Profile/source updates can disclose that the current brief differs from the selected run’s source snapshot; they do not rewrite its immutable result. Development traces and participant-provider exchanges remain filesystem/private diagnostics and are excluded from public payloads.

## Independent 100 and scoped generation — September 25, 2026

The 99 numbered accounts at <https://independent.prose.md/> yield 97 new simulated users: `@allTheYud` retains the existing Eliezer Yudkowsky fixture and `@slatestarcodex` retains Scott Alexander. The wildcard nomination contact is not an entry. Exact account and portrait provenance is in [the directory snapshot](research/independent-100-accounts-2026-09-25.json).

`pnpm journeys:generate --group=independent --max-requests=1536 --max-cost=15` selects only the 97 additions, with at most four concurrent interviews and the existing physical-request and cost ceilings. Individual `--persona=<id>` runs remain available. Scoped generation and resume merge into the saved collection, retaining untouched interviews and their per-batch `sourceRuns`. Cost and request metadata describe the newest paid batch. Artifact/schema bounds allow up to 256 journeys and 256 provenance groups (256 MB artifact, 160 KB index); there is no change to participant interview limits.

The user-facing term is simulated user. Internal persona identifiers are retained for compatibility. Research gaps remain explicit: a builder's technical work does not establish their personal extinction probability, policy agenda or timelines. The participant prompt now distinguishes source-grounded public simulations from fictional extreme stress-test users. Only the new users are generated for this addition; saved original interviews remain unchanged.

An explicit `--turns=12` permits an offline simulation to reach the same twelve-question ceiling as a new participant assessment. The default remains five turns. This permits honest capped results with unknown dimensions when sparse evidence never unlocks an earlier result; it does not bypass readiness or invent views. Supply a sufficient explicit request budget for longer runs.

## Source-driven refresh — September 25, 2026

Regenerated all 103 selected users whose recorded source/voice/belief inputs differed from the current catalog: all 97 additions and six original users. All succeeded and are selected locally; 38 unaffected public users and 11 development-only journeys are preserved. Earlier immutable database runs remain unchanged. [The regeneration report](research/source-regeneration-2026-09-25.md) records source matching, batch recovery, usage limitations and result deltas.

Local full diagnostic artifacts now use compact JSON serialization to avoid spending the 256 MB artifact bound on indentation. Fields and read/write limits are unchanged; the checked-in trace-free fixture remains formatted.
