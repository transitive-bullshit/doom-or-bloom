# User journeys and simulated-user workflow

Open `/user-journeys` at the Portless development URL. The development-only inspector exercises the actual assessment engine, question eligibility/ranking, recovery policy, readiness gate and projections. Production returns 404 for the page and API. Nothing calls a model on page load.

## Purpose and authoring

Fictional participants deliberately stress-test divergent positions, rhetoric and reasoning. Public-person simulations instead seek fidelity to their dated source briefs. Generated answers are fictional, not quotations or endorsements. Preserve supported certainty, uncertainty, contradictions and style without adding ideal reasoning to improve a score. Missing source evidence is a research gap, not proof that the person is uncertain.

`lib/journeys/catalog.ts` assembles the current catalog from narrative briefs in `lib/journeys/`; `components/landing/people.ts` owns public presentation and featured status, and `components/landing/one-liners.ts` the [one-liner](#simulated-user-one-liners) under each name. The participant receives source summaries, short quoted anchors and voice guidance, not just URLs. The separate fixed personal transcript is a diagnostic replay. Catalog membership changes; dated expansion notes below record historical counts.

Persistence is implemented. Public pages read each profile's selected immutable Postgres run. Ignored `work/journeys/` files serve local diagnostics, provenance and import; they are not the public-page runtime source. See [database-backed curated publication](#database-backed-curated-publication-2026-09-23).

For a focused edit:

1. Update the person's source brief and presentation metadata as needed, including their [one-liner](#simulated-user-one-liners). Preserve speaker attribution, dates, conditional claims and research gaps; [AUTHORING.md](AUTHORING.md#simulated-user-source-briefs) captures the source-audit lessons.
2. Run relevant free checks from [testing.md](testing.md), and `pnpm resources:previews` when source URLs change.
3. If the task calls for new simulated answers, generate only the affected `--persona=<id>` or explicit group with bounded live spend. Successful public-person generation also publishes/selects its new run in the configured database; confirm the intended local environment before running.
4. Inspect the saved answers, routing, readiness and source snapshot at `/user-journeys`, then the selected result at `/users/<username>`. Compare fidelity to the brief, not desired coordinates. Source-only changes do not rewrite a saved simulation.

The [diagnostic improvement loop](diagnostic-improvement-loop.md) records why the fixed transcript replay was added and why expressed outlook is separate from net-impact forecasts.

### Simulated-user one-liners

Each simulated user has a one-line description under their name in the profile header and on their social card. It is our description of a real third party, framed as a simulation of them, so it must be something they would likely accept as fair. All of them live in `components/landing/one-liners.ts`, keyed by slug; write one when adding a person, and revisit it when their brief changes.

- Describe what the person is publicly known to argue or work on, in neutral, conservative terms. Don't push them toward Doom or Bloom, and don't single out one scenario, project or number as their view.
- Keep both sides of a view at the weight their sources give them. Use neutral verbs (argues, studies, builds, calls for), not loaded ones or labels (dismisses, cheers, doomer, hype).
- Make only claims their sources clearly support across their public writing, not one interview, post or project, unless that work is what they are known for, such as their book or company.
- Quote only words that are verbatim, short, checked against a source in their brief and genuinely sum up their overall view, such as a book title or a thesis they state themselves. Record each in `verifiedOneLinerQuotes` with its URL. Otherwise paraphrase.
- No P(doom) numbers or catastrophe outcomes (extinction, takeover, everyone dying) unless they are the core of the person's public identity and a verified quote supports them. Describe what risk advocates call for or study instead. The P(doom) card already shows a stated number with its outcome and source.
- Shape: "<plain role> who <argues, writes about, builds or calls for …>." Name an organization only when the brief, its research record or the person's own current profile states it. One sentence, or two very short ones, of 60–150 characters, ending with a period, in plain language and the same tone as the others. Describe pseudonymous accounts as accounts ("Pseudonymous account that …") and a pen name as a pseudonymous writer, never by a guessed identity.
- English only, like the briefs; one-liners are not translated.

`pnpm test:content` checks the mechanical parts: length, punctuation, and no percentages, P(doom) or outcome words outside a verified quote. Fairness still needs a read against the brief. The brief's own `description` is backstage context for the simulated participant, never shown publicly. The [October 2 rewrite](research/neutral-one-liners-2026-10-02.md) applied this rule to all 169 people.

### Public statements

Profiles of people with search demand can show “What <Name> has said about AI”, below the map, the compare prompt and Similar worldviews. It is the real person's public record beside our simulation of them, so it follows the one-liner's fairness bar and adds stricter sourcing.

- Three to five quotes, newest first, each with its date, venue and link. Aim for 25 words or fewer; `pnpm test:content` rejects more than 30.
- Exact words only, checked against a primary source you fetched: their own writing, an official transcript, or an outlet's direct quote from its own interview. Attribute only their turns in a transcript, never an interviewer's. Trim only at sentence or clause boundaries and never join separate passages. Curly quotes and apostrophes may replace straight ones. Record the check in `verified`.
- Choose quotes that are fair to their overall view at the weight their sources give it: benefits and risks, and what they think should be done. Show a change of view only where the sources show it, ideally in their own words. Prefer sources in their brief.
- Never quote simulated answers. A stated P(doom) belongs on the P(doom) card, not here.
- Open with one neutral sentence under [the one-liner rule](#simulated-user-one-liners); it can mention a documented change of view.
- Store each person in `content/profiles/<slug>.json` and register it in `lib/personas/public-statements.ts`. Quotes and summaries are English, like briefs; only the heading and note are translated.

## Live models and boundaries

The default participant is **GPT-5.6 Sol** (`gpt-5.6-sol`), with live Jev through the normal engine. The participant receives character context, actual questions, conversation history and recovery guidance. It never sees desired scores, judgment targets, readiness, candidate rankings or the assessment rubric. Jev receives the actual answers and ordinary engine state, not persona identity or source packets.

Every reply retains the OpenAI request, returned model, exact answer, usage and duration. Answers pass unchanged to the engine. Failed operations preserve pending answers and safe diagnostics. No live failure substitutes a scripted answer or mocked judgment.

Occasional paid development runs are authorized. This is not authorization for unbounded pressure testing or recurring automatic spend. These published cases are not a blinded holdout or human semantic validation.

## Answer-only journeys and per-answer results

```sh
pnpm journeys:generate --persona=control-alarmist --turns=5 --max-requests=24 --max-cost=2
pnpm journeys:mechanical:check
```

New live artifacts contain only question-and-answer steps. Each answer retains its exact question, disposition, evidence readiness before/after, coverage changes and selected next question. The harness does not insert separate project, continue or clarification turns. The old `--exercise-results` live option has been removed. Separate mechanical tests can still exercise those application operations.

Each answer records its projection input. If the engine already returned a result for that evidence revision, the harness uses it. Otherwise, once readiness permits a result, the offline runner explicitly requests a projection and attaches the result and trace to that answer step. Ordinary participant routing does not generate these intermediate snapshots. Opening a saved disclosure makes no inference call or extra participant answer.

**Result after this answer** is collapsed by default and shows the saved Doom–Bloom map, interpretation ranges, components and underlying input state when available. Before result eligibility it records that the readiness gate does not permit a result; do not substitute a later snapshot. Non-answer attempts provide no new evidence. The final result remains at the bottom. Two scripted non-answer recovery submissions remain actual answer steps; the retry transition itself is not a displayed step.

The disclosure sits at the bottom of every answer step beside Decision details and Requests and responses. Old journey formats are not migrated.

## Readiness is coverage, not guaranteed progress per answer

Evidence coverage averages supported presence across 15 dimensions using each dimension's strongest active interpretation support, halved for an unresolved issue. It guides routing; result eligibility is map-centric (outlook and scale placed), and automatic results wait for four answers. See [readiness](ASSESSMENT.md#question-budget-and-readiness). It does not count the number of answers, distinct arguments, or certainty about a forecast. Repetition cannot automatically increase it. Once presence is established, another meaningful answer can change a position or narrow its interpretation without adding coverage.

Flat or tiny gains are an elicitation review signal: inspect whether the question captured a new claim, resolved uncertainty, or merely repeated an earlier answer. Routing uses continuous support gaps, and ambiguity/tension bonuses require a matching unresolved issue. See [the question and routing audit](prompt-quality-review.md) for the current catalog and review loop. The meter uses one decimal to expose small gains.

## Budgets and storage

Defaults are five answer opportunities (CLI accepts 1–12), at most one OpenAI call per opportunity, and 24 physical Jev requests per selected entry, capped at 1536 for the batch. The request limit is shared across a batch, not a per-person hard ceiling. Estimated cost limits default to $2 for one persona and $5 for a group/full catalog. Running `pnpm journeys:generate` without a selector processes the full catalog plus the fixed replay. Prefer a scoped run for a local change; set explicit limits for longer runs. Automatic results end the simulation without opting into deeper exploration. `lib/journeys/live.ts` owns selection/defaults, and `live-budget.ts` records the dated pricing estimate. Failed usage may remain reserved and cached input is charged in full; the estimate is not a provider invoice.

Set server-only `OPENAI_API_KEY` and `TYPESAFE_API_KEY` in the environment or `.env.development.local`. The ordinary participant app still uses only Jev.

Local diagnostic artifacts live in ignored `work/journeys/`; public-person runs also persist to Postgres through generation hooks: `users/<persona-id>/<content-hash>.json` stores each user's complete result independently; `runs/<run-id>.json` contains small manifests with provenance and references; `latest.json` selects the current live and mechanical collections. Saving a scoped batch writes only its changed user records and atomically publishes the manifest, retaining other users and their original run provenance. Immutable records keep previous manifests readable. The inspector and database seeder read individual users; collection-wide analysis explicitly loads the full collection. Public profiles continue to read PostgreSQL.

A fresh checkout contains authored personas and a small two-user test sample at `lib/journeys/__fixtures__/sample-journeys.json`, plus the mechanical regression baseline. It has no generated live results. Run `pnpm journeys:generate --persona=<id>` (or `--group=independent`) to generate local results; these use paid live providers. Import an existing saved collection without inference with `pnpm journeys:migrate --file=<saved-suite.json>`, which preserves the original and verifies each imported record. Run `pnpm db:seed` only after the required local results exist. Unit tests do not require local results or paid generation; local integration checks that import all personas require a populated local collection.

Reads and writes are schema-checked, with a 32 MB per-user bound and a 1 MB manifest bound for up to 256 users. Manifests are published only after their user files are complete; same-process concurrent saves are serialized. Run generation/import from one process per workspace. Local records are retained until explicitly removed; there is no automatic cleanup of historical per-user versions. The absolute request ceiling remains 1536, with the ordinary single-person default still 24.

A latest-results collection can combine independent generation batches. Its optional `sourceRuns` records each included persona’s original run, date and input/engine/content hashes. Top-level hashes then identify the assembled catalog; they do not imply every journey was regenerated simultaneously. Exact answers, traces and source snapshots remain intact. Current save/merge metadata reports the newest paid batch, not the lifetime cost of every retained user. Source IDs are provenance metadata, not retained historical runs.

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

Resume retries exactly the saved operation with a fresh bounded budget and no new OpenAI reply. A failed per-answer inspection projection resumes on the same answer, without replaying that accepted answer or adding a project step. It does not automatically finish the remaining interview. Source content and model must match. Saving the resumed run updates the selected local collection while retaining immutable previous records. Raw error bodies, headers and credentials are excluded.

### Response detail

Narrative personas can specify `responseStyle`: `detailed`, `conversational` (default), or `brief`. Public proxies and selected fictional participants develop extended arguments; the brief pragmatist and brief job worrier deliberately remain terse. This instruction reaches only the simulated participant. It never reaches Jev or supplies expected scores. `pnpm journeys:review` reports style and per-answer word counts so a shared-prompt edit cannot silently flatten the intended range of answer detail.

## Experimental worldview comparison

The inspector's “Watch the worldview develop” disclosure is closed by default and switches the outlook/transformation map, separate worldview axes, stated or inferred P(doom), milestone timing and assumptions to the selected saved answer. Earlier placed answers appear as numbered dots. Per-answer disclosures and final results show the same views.

`pnpm exec node --env-file=.env.development.local --conditions=react-server --import tsx scripts/replay-worldview-experiments.ts --allow-paid --max-requests=240 --max-cost=5` evaluates only the new fields against saved per-answer input states. This is a bounded live development replay, not regenerated participant answers or paid pressure testing. It sends the saved evidence, including any fixed personal transcript, to Jev; obtain authorization for that transfer before running.

Results are saved incrementally to `eval/development/worldview-experiments.json`; raw requests and typed responses stay under ignored `eval/runs/worldview-experiments/`. The loader overlays a record only when the source run ID, persona, step, input hash and evidence revision match. Core historical scores, answers and provenance are untouched. A replay can resume without repeating completed snapshots; missing or changed snapshots show an explicit unavailable state.

The 2026-09-20 replay was explicitly approved and covers all 45 saved result snapshots across 16 journeys. `--persona=<id>` scopes a review; `--refresh` replaces matching records after an extraction change. The `worldview-v2` pass verifies each selected excerpt independently, so alternative suitable quotes do not erase supported beliefs. See [comparison observations](worldview-experiment-review-2026-09-20.md).

Current results include inferred P(doom). Live generation writes fresh results for selected users and merges them into the local collection; a historical overlay is unnecessary for those new runs. Only final results are expanded by default.

Every results view includes a separate demonstrated-reasoning axis. The v4 map interpretation preserves tentative points and labels dominant indecision as unsettled. Influence and transformation questions compete through ordinary routing; missing axes are not guaranteed a direct probe before automatic stopping. See [current projections](ASSESSMENT.md#participant-facing-projections).

## Expanded canonical public figures — September 21, 2026

Sixteen additional source-grounded participants bring the public set to 36 people and the full collection to 47 journeys (46 generated personas plus the fixed personal replay). All new public briefs request detailed answers and supply narrative beliefs, dated source summaries and voice guidance, never desired coordinates or judgment targets.

- [Foundational researchers](research/foundational-personas-2026-09-21.md): Yoshua Bengio, Ilya Sutskever, Andrej Karpathy, Fei-Fei Li, Richard Sutton, Stuart Russell, Max Tegmark and Liang Wenfeng.
- [Social and economic perspectives](research/social-personas-2026-09-21.md): Timnit Gebru, Arvind Narayanan, Daron Acemoglu, Mark Zuckerberg and Emily M. Bender.
- [Public leaders](research/civic-personas-2026-09-21.md): Barack Obama, Donald Trump and Bill Gates.

The briefs prioritize inspected recent first-person material. Sutton’s substantial verified sources remain from 2025; Liang’s direct interviews are from 2023–2024. An unverified purported 2026 Liang meeting was excluded from participant inputs. These freshness limits remain visible in the source packets.

At this checkpoint, the featured prototype map included all 36 public personas, including the existing Jensen Huang journey. Coordinates come only from saved live assessments. Portrait provenance and official-source fallbacks are recorded in `public/personas/SOURCES.md`. The latest collection retains existing valid journeys while incorporating live runs for the new personas, with original generation provenance for each batch.

The [live generation record](research/canonical-persona-run-2026-09-21.md) records the new batch’s observed placements, costs and validation.

## Publicly stated P(doom) overrides

`lib/journeys/public-pdoom-statements.ts` records verified numerical public statements with a date, URL, outcome, horizon and conditions. These are attached to the persona snapshot and applied to every available per-answer result and the final result after the real assessment has run. They do not change Jev inputs, routing, readiness, reasoning scores or map coordinates. Personal assessments and mechanical tests do not use this override.

Overridden estimates have `source: public-statement`, a `publicStatement` provenance record, and the original engine value in `assessmentEstimate`. The displayed token preserves ranges and inequalities. When no point estimate was stated, the axis line shows only the stated band, with no dot; the `/users` directory still sorts such a statement by its midpoint. A quoted range is not an interpretation confidence interval.

The initial verified set covers Hinton (10–20%, January 2025, with later qualitative context), Marcus (approximately 3%), Dario (25%), Tegmark (>90% conditional on no regulation), and Noah (approximately 10% civilization collapse from biological misuse, with his separate 30% severe-destruction estimate retained as context). These endpoints are not interchangeable extinction forecasts. Unverified numbers attributed to other people remain excluded; their simulated answers continue through normal estimation.

## Soares and Greenblatt — September 22, 2026

At this checkpoint the canonical map included 39 public figures and the collection contained 50 journeys: 49 generated personas plus the fixed personal replay. Added [Nate Soares](research/nate-soares-persona-2026-09-22.md) with 10 source records and [Ryan Greenblatt](research/ryan-greenblatt-persona-2026-09-22.md) with 12. The supplied videos remain linked; Ryan's matching publisher transcript is available, while Nate's linked interview was not transcript-accessible and substantive grounding comes from separately inspected sources.

Both new personas use detailed GPT-5.6 Sol answers and live Jev routing and projection. Each completed after two accepted answers. The new batch used four OpenAI requests and 20 Jev requests, estimated at $0.0912. Collection `1790016746550-bb749692-1ce5-4c35-837f-27fce8dccc82` retains the previous 48 current journeys and records both generation batches in `sourceRuns`; it is not a replay of all 50. That checkpoint used a latest-collection store; current storage retains immutable per-user records and manifests as described above.

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

The replay saves each completed snapshot for resumption. `--publish` requires the full local collection (no `--persona`) and validates matching input hashes, evidence revisions and scoring versions before saving refreshed local journey artifacts. Despite its name, this flag does not publish or select Postgres runs and does not refresh public map/persona pages. For public results, use the persisted generation workflow above. Original interview timestamps, source-run hashes, core scores, questions and answers remain intact; the replay artifact records interpretation timestamps, requests and cost. Participant assessments are separate and are not migrated by this command.

## Re-evaluate selected simulated users — September 29, 2026

`pnpm personas:reevaluate plan --env <file> --out <plan.jsonl>` re-evaluates each selected simulated user with the current engine. `runPersona` accepts a recorded transcript for any persona, as it does for the fixed user, so each run's accepted answers are replayed question by question. No answer is generated and no recovery prelude runs.

- The new journey keeps the original run's source snapshot, the sources its answers were written from, and applies the current verified public P(doom) statement.
- `plan` calls Jev but writes nothing, and records what each page would show before and after.
- `write` publishes each replay through the persisted generation records (`begin`/`finish`). It becomes a new public simulation and, being newer, the selected run.
- Earlier runs stay at their own URLs. Pages, the map and nearest-persona comparisons refresh on the next deployment.
- `plan --restate` applies a newly recorded public statement to a user whose brief is otherwise unchanged. It copies the selected `simulation_v1` run and applies the statement to the snapshot and every result, with no Jev call. The new run keeps the answers, scores and engine hashes of the run it copies; users without a statement, with historical payloads or with a different statement already applied are skipped.

The September 29 run re-evaluated 135 of the 144 selected simulated users from engine 0.6 to 0.7.1, for $1.36 in Jev calls. The other nine keep their runs because the current engine would not offer a result from their one to three recorded answers. The share of simulated users at the “mixed” outlook fell from 19% to 12%, both ends grew, and the median inferred P(doom) moved from 7.9% to 4.7%. All eight verified public statements carried over.

## Import selected simulated users

`pnpm personas:import plan --env <file> --ids slug,slug` compares the named users' selected local `simulation_v1` runs with a target database such as production, which it opens read-only. `write` copies each profile and run through the persona repository without inference, under the run's original generation key, and verifies that the target selected the same snapshot digest. Profile metadata, including the one-liner, comes from `components/landing/people.ts` rather than the local database, so an import never restores an older description. Repeating an import is idempotent, and generation ordering keeps a newer target selection in place. The source must be the loopback database named by `.env.development.local`. Importing into production or preview is a separate, owner-approved step; deploy afterward so portraits, previews and static profiles rebuild.

## Sync profile metadata

`pnpm personas:sync-metadata plan --env <file> --all` (or `--ids slug,slug`) compares each profile's metadata in a target database with `components/landing/people.ts` and prints every changed field: one-liner, name, portrait, featured flag and the rest. It opens the target read-only. `write` updates the profiles that differ through the persona repository in one transaction and verifies them. It never touches source briefs, runs or selections, and skips profiles the target lacks, which arrive with their run through an import. Use it after editing presentation metadata, including on the local development database (`--env .env.development.local`). Writing to production is a separate, owner-approved step; deploy afterward so static profiles and social cards rebuild.

## Andrew McAfee — September 23, 2026

Added [Andrew McAfee](research/andrew-mcafee-sources-2026-09-23.md) at `/users/amcafee` with seven dated 2026 sources: four original-publisher interviews/articles, two authored X posts, and the requested Diary of a CEO debate. Only his labeled turns from the third-party debate transcript ground the persona; neither other speakers nor the full transcript are included. His official MIT biography supplies the portrait.

Collection `1790155057347-68d138b5-54b4-45c9-94aa-9de424aeddbe` contains 55 journeys and 44 public figures. The new live run completed after one detailed accepted answer, with one GPT-5.6 Sol request and five Jev requests, estimated at $0.0181. All previous 54 journey records are preserved unchanged, with original batch provenance. The top-level cost reports only this new batch.

The source-backed displayed P(doom) is approximately 0%, explicitly rounded rather than impossible, with no fixed forecast horizon. Its numerical display anchor is zero; it is not a measured exact probability or an invented uncertainty interval. The original inferred estimate remains recorded. The transformation result is 47.4/100 and human influence is tentative; these are live model outputs, not editorial targets.

## Database-backed curated publication (2026-09-23)

Public runtime pages now read the selected simulation assessment from Postgres. `pnpm db:seed` imports the current curated public catalog from local records, preserving recorded questions, answers, projection inputs, source snapshots, sourced P(doom) overrides and original run provenance. At the original persistence checkpoint, that catalog comprised 44 public people in a 55-journey collection. Current membership comes from `components/landing/people.ts`; imported files supply seed evidence, not public runtime reads. Historical payloads are explicitly `historical_journey_v1`; they do not pretend to contain a resumable engine state.

Live generation and explicit resume save a private input record before running, retain the full final engine snapshot as `simulation_v1`, and publish/select only after success. Failed operations keep private input/checkpoint diagnostics and do not change the selected public run. Each new generation gets its own assessment URL. Reusing a generation key never repeats paid calls; use a new explicit run to retry. Selection compares generation start timestamps so older late completions and repeated seeds cannot roll it back. The offline generation commit window is 30 minutes; participant POST deadlines remain separate and unchanged. No scheduler, queue or worker is involved.

Authored briefs remain generation inputs. Profile/source updates can disclose that the current brief differs from the selected run’s source snapshot; they do not rewrite its immutable result. Development traces and participant-provider exchanges remain filesystem/private diagnostics and are excluded from public payloads.

## Independent 100 and scoped generation — September 25, 2026

The 99 numbered accounts at <https://independent.prose.md/> yield 97 new simulated users: `@allTheYud` retains the existing Eliezer Yudkowsky fixture and `@slatestarcodex` retains Scott Alexander. The wildcard nomination contact is not an entry. Exact account and portrait provenance is in [the directory snapshot](research/independent-100-accounts-2026-09-25.json).

`pnpm journeys:generate --group=independent --max-requests=1536 --max-cost=15` selects only the 97 additions, with at most four concurrent interviews and the existing physical-request and cost ceilings. Individual `--persona=<id>` runs remain available. Scoped generation and resume merge into the saved collection, retaining untouched interviews and their per-batch `sourceRuns`. Cost and request metadata describe the newest paid batch. This batch originally used a monolithic artifact. Current per-user storage bounds are documented under [Budgets and storage](#budgets-and-storage); participant interview limits are separate.

The user-facing term is simulated user. Internal persona identifiers are retained for compatibility. Research gaps remain explicit: a builder's technical work does not establish their personal extinction probability, policy agenda or timelines. The participant prompt now distinguishes source-grounded public simulations from fictional extreme stress-test users. Only the new users are generated for this addition; saved original interviews remain unchanged.

An explicit `--turns=12` permits an offline simulation to reach the same twelve-question ceiling as a new participant assessment. The default remains five turns. This permits honest capped results with unknown dimensions when sparse evidence never unlocks an earlier result; it does not bypass readiness or invent views. Supply a sufficient explicit request budget for longer runs.

## Source-driven refresh — September 25, 2026

Regenerated all 103 selected users whose recorded source/voice/belief inputs differed from the current catalog: all 97 additions and six original users. All succeeded and are selected locally; 38 unaffected public users and 11 development-only journeys are preserved. Earlier immutable database runs remain unchanged. [The regeneration report](research/source-regeneration-2026-09-25.md) records source matching, batch recovery, usage limitations and result deltas.

This refresh used compact monolithic diagnostic artifacts. Current generated artifacts use the per-user store described above; the checked-in sample remains a small test fixture.

## Ramez Naam — September 27, 2026

Added [Ramez Naam](research/ramez-naam-persona-2026-09-27.md) at `/users/ramez` with nine dated primary-source records, including his guest essay on Noahpinion. The brief distinguishes useful AI progress from runaway takeoff, preserves his preference for plural access alongside practical safeguards, and excludes Noah Smith’s introductory forecasts. No numerical public P(doom) override is supplied.

The scoped live run completed after one substantial answer under the ordinary automatic stopping policy, using one GPT-5.6 Sol request and five Jev requests for an estimated $0.0212. Its selected result is persisted locally; the generated collection retains all 143 prior records unchanged. The research record contains exact run provenance, source limits and verification. Like the other recent additions, he is in the simulated-user directory with `featured: false`.

## Simulated users batch 1 — October 1, 2026

Added 25 source-grounded simulated users to balance a catalog that sat mostly near the pragmatic-optimist group. They are critics of AI claims, pause and x-risk advocates, safety and policy writers, builders and commentators, and journalists and podcast hosts; two of them are pseudonymous accounts simulated from their own posts. Each brief has 8–12 inspected primary sources, and all are listed in the directory with `featured: false`. Eight verified first-person P(doom) statements are recorded with their outcomes, horizons and conditions. Three candidate numbers were excluded because their scope or attribution did not support a displayed estimate. The [batch record](research/simulated-users-batch-1-2026-10-01.md) links the five research records and gives run provenance, the fidelity review, coverage limits and verification.

Scoped live runs (`--persona=<id> --turns=5 --max-requests=24 --max-cost=0.3`) used 106 GPT-5.6 Sol and 550 Jev requests, for an estimated $2.72. Six final operations hit Jev timeouts or the request budget and were completed by one bounded resume each. The selected runs are persisted locally only; the local collection retains all 144 prior records unchanged.

## P(doom) sources — October 2, 2026

An audit of all 169 simulated users added 14 verified public P(doom) statements (30 in all) and up to two missing sources to each of 28 briefs: the statements' backers, refusals and close statements, and a rewrite of Roko Mijic's outdated brief. Those 28 users were regenerated with scoped live runs for an estimated $2.15. The six whose briefs did not change got their statement through `personas:reevaluate plan --restate`, on copies of production's September 29 runs, with no inference. The selected runs are local only. The [research record](research/pdoom-sources-2026-10-02.md) lists the statements and exclusions, the sources per user, before and after placements, the fidelity review and the import command.

## Neutral one-liners — October 2, 2026

All 169 one-liners were rewritten under [the one-liner rule](#simulated-user-one-liners) after Travis found them too terse and tilted toward doom. Each now names a role and what the person argues or works on; P(doom) numbers and outcome claims are gone except inside five verified quotes, such as Yudkowsky's book title. No interview was regenerated. The [research record](research/neutral-one-liners-2026-10-02.md) lists the largest changes, the least certain lines and the production metadata sync.

## Initial public-source expansion — September 20–21, 2026

This historical source-selection record explains the initial briefs. Current public-person simulations follow the fidelity rules above and the current catalog, rather than treating these early editorial labels as target outcomes.

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

## Acemoglu sources and Zitron fidelity — October 2, 2026

The [source refresh and placement investigation](research/acemoglu-zitron-refresh-2026-10-02.md) adds seven recent Acemoglu posts and records his regenerated local journey. It traces Zitron’s upward move to a newly generated answer to the direct scale question, preserves source metadata missing from this checkout, and documents remaining simulation sensitivity. These are local selected runs; production was inspected read-only. No shared scoring rule changed.

## Nick Bostrom — October 3, 2026

Added the `superintelligence-philosopher` brief and `/users/nick-bostrom` presentation metadata. The [source review](research/nick-bostrom-persona-2026-10-03.md) distinguishes historical control arguments, conditional beneficial futures and the 2026 timing paper’s existing-person scope. The requested October 1 NYT interview is retained with an explicit transcript-access gap, not used for unverified beliefs. The expanded brief now has 18 source links; the [additional paper review](research/nick-bostrom-expanded-sources-2026-10-03.md) records reading scopes. A bounded local run generated four accepted answers and a selected result, verified at `/user-journeys` and `/users/nick-bostrom`. See the [run record](research/nick-bostrom-persona-2026-10-03.md#expanded-brief-and-live-run) for provenance and limits. The subsequent user-requested production import preserved the complete selected payload; the [production verification](research/nick-bostrom-persona-2026-10-03.md#production-publication) records its identity and live checks.

## Andrej Karpathy's deleted post and Anthropic role — October 3, 2026

Karpathy's September 12 X post backing Amodei's frontier-pacing essay was deleted, so the Reuters source quoting it was removed from `hands-on-agent-builder` and his October 2 post on understanding model outputs was added. The brief asserts neither continued support nor a retraction. At Travis's request, the brief and one-liner now also state that he joined Anthropic in May, with a voice line that he doesn't speak for the company. A bounded live run regenerated his journey: five answers, with the outlook unchanged at 75/100. It was imported to production with Travis's approval. The [research record](research/karpathy-deleted-post-2026-10-03.md) lists every citation, his newer posts, the before and after result, and the production verification.
