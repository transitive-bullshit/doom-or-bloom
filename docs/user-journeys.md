# User journeys and simulated-user workflow

Open `/user-journeys` at the Portless development URL. The development-only inspector exercises the actual assessment engine, question eligibility/ranking, recovery policy, readiness gate and projections. Production returns 404 for the page and API. Nothing calls a model on page load.

## Add or update a simulated user

Adding a person, adding sources to a brief and changing a profile's presentation all follow this recipe. The fidelity rules are under [Purpose and authoring](#purpose-and-authoring), and [AUTHORING.md](AUTHORING.md#simulated-user-source-briefs) captures the source-audit lessons.

### Ids and slugs

Every person has two keys. The **id** (lowercase words and hyphens, such as `superintelligence-philosopher`) names the brief; `journeys:generate --persona`, `lib/journeys/public-pdoom-statements.ts`, `lib/p-doom/curated.ts` and the benchmark use it. The **slug** names the public profile; `/users/<slug>`, `--ids` for import and sync, one-liners, `content/profiles/` and `lib/seo/person-identities.json` use it. With an X account, the slug is the lowercased X username; without one, it must differ from the id (`nick-bostrom`). `persona-identity.test.ts` enforces both. Each person's `people.ts` entry lists both keys. Settle the slug before generating: renaming it later orphans the saved record.

### Files a person touches

| File | What goes there | When |
| --- | --- | --- |
| A brief in `lib/journeys/` | Beliefs, dated source summaries, quoted anchors and voice, following `personaSchema` in `catalog.ts`. A new person also carries `id`, `slug`, `xUsername`, `shortName` and `featured` inline. One person gets `<surname>-public-persona.ts` and a batch `<theme>-personas.ts`; an existing person stays in the file that holds them. | Always |
| `lib/journeys/catalog.ts` | An import and an entry in `narrativePersonas` | New person |
| `components/landing/people.ts` | Presentation metadata, starting with `featured: false`. Profile order is this file's order. | New person, before generating: without an entry, a run is neither saved to Postgres nor importable |
| `components/landing/one-liners.ts` | The [one-liner](#simulated-user-one-liners), keyed by slug | New person; revisit when the brief changes |
| `public/personas/<file>.jpg` and `public/personas/SOURCES.md` | The portrait and its provenance line | New or changed portrait; no test checks provenance |
| `lib/sharing/resource-previews.json` and `public/resource-previews/` | Source previews from `pnpm resources:previews --url=<url>` (`--refresh` refetches) | Whenever source URLs change; tests require one for every source except X posts |
| `content/profiles/<slug>.json`, registered in `lib/personas/public-statements.ts` | [Public statements](#public-statements) | People with search demand |
| `lib/journeys/public-pdoom-statements.ts` | A [verified numerical P(doom)](#publicly-stated-pdoom-overrides); `lib/p-doom/curated.ts` can then list them on the P(doom) hub | Only with a verified statement |
| `lib/seo/person-identities.json` | Wikipedia and Wikidata links | After checking the article ([SEO.md](SEO.md)) |
| `docs/research/<name>-persona-<date>.md` | Sources, reading scopes, run provenance and verification | Always |

`lib/journeys/persona-identity.ts` maps only the original profiles; new people carry their keys in the brief. `content/source-intake.json` is the assessment-corpus registry ([SOURCES.md](SOURCES.md)), not a log of brief sources.

### Steps

1. Write or edit the brief. For a new person, also register it in `catalog.ts` and add the `people.ts` entry, one-liner and portrait.
2. Run `pnpm resources:previews --url=<url>` for each new source URL, then `pnpm test`.
3. If the task calls for new answers, generate one person per run: `pnpm journeys:generate --persona=<id> --max-cost=<dollars>`. `--persona` takes a single id; the groups are `--group=independent` and `--group=tech-posters-<letter>`, one per [top tech posters](research/tech-posters-2026-10-05.md) research batch. Leave `--max-requests` unset unless you mean to stop below the default backstop: a five-answer interview needs more than 24 requests ([budgets](#budgets-and-storage)). Generation saves to the database named in `.env.development.local`, so confirm it is local. [Resume](#resume-a-failed-operation) a failed run rather than starting over.
4. Inspect the answers, routing, readiness and source snapshot at `/user-journeys`, then the result at `/users/<slug>`. Compare fidelity to the brief, not desired coordinates.
5. Commit, then publish with the owner's approval: `pnpm personas:import plan --env <file> --ids <slug>`, then `write` ([import](#import-selected-simulated-users)). Production uses `.env.production.local`; staging is Vercel Preview, reached through a temporary env file ([databases](PERSISTENCE.md#databases-and-environments)). Deploy afterward so portraits, previews and static profiles rebuild.
6. For presentation-only changes (one-liner, name, portrait, featured flag), run `pnpm personas:sync-metadata plan --env <file> --ids <slug>`, then `write` ([sync](#sync-profile-metadata)). Sync `--all` after inserting someone mid-file in `people.ts`, since every later profile's order shifts.
7. If the featured set changed, capture and inspect a before/after review, then apply both the frozen points and [site social image](SEO.md#site-social-image). Offline regeneration alone keeps the previous distribution. If the person is in a benchmark set and their brief changed, rebuild their paid R2 and R3 references ([benchmark](benchmark.md)).
8. Add an entry to the [simulated-user log](research/simulated-user-log.md) linking the research record.

### Source changes and publication

Public profiles show sources from the database copy of the brief. Generation refreshes the local copy, and import copies it to the target along with the run; `personas:sync-metadata` and `personas:reevaluate plan --restate` never touch briefs. A new source therefore reaches production only by regenerating the person and importing the run. Until then the live profile keeps its earlier sources, and a saved simulation is never rewritten.

## Purpose and authoring

Fictional participants deliberately stress-test divergent positions, rhetoric and reasoning. Public-person simulations instead seek fidelity to their dated source briefs. Generated answers are fictional, not quotations or endorsements. Preserve supported certainty, uncertainty, contradictions and style without adding ideal reasoning to improve a score. Missing source evidence is a research gap, not proof that the person is uncertain.

`lib/journeys/catalog.ts` assembles the current catalog from narrative briefs in `lib/journeys/`; [Files a person touches](#files-a-person-touches) lists where everything else lives. The participant receives source summaries, short quoted anchors and voice guidance, not just URLs. The separate fixed personal transcript is a diagnostic replay. Catalog membership changes; the [simulated-user log](research/simulated-user-log.md) records dated additions and their historical counts.

Persistence is implemented. Public pages read each profile's selected immutable Postgres run. Ignored `work/journeys/` files serve local diagnostics, provenance and import; they are not the public-page runtime source. See [database-backed curated publication](#database-backed-curated-publication).

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

- Three to seven quotes, newest first, each with its date, venue and link. Aim for 25 words or fewer; `pnpm test:content` rejects more than 30.
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
pnpm journeys:generate --persona=control-alarmist --turns=5 --max-cost=2
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

Defaults are five answer opportunities (CLI accepts 1–12), at most one OpenAI call per opportunity, and a 1536-physical-request Jev backstop for the whole run. The request limit is shared across a batch, not a per-person hard ceiling. `--max-requests` can explicitly lower it. The dollar cap is the primary offline spending control; a five-answer interview can legitimately need more than 24 requests because each answer is interpreted, routed and projected in multiple batches. Estimated cost limits default to $2 for one persona and $5 for a group/full catalog. Running `pnpm journeys:generate` without a selector processes the full catalog plus the fixed replay. Prefer a scoped run for a local change; set explicit limits for longer runs. Automatic results end the simulation without opting into deeper exploration. `lib/journeys/live.ts` owns selection, and `live-budget.ts` owns the offline request backstop and dated pricing estimate. Failed usage may remain reserved and cached input is charged in full; the estimate is not a provider invoice.

Set server-only `OPENAI_API_KEY` and `TYPESAFE_API_KEY` in the environment or `.env.development.local`. The ordinary participant app still uses only Jev.

Local diagnostic artifacts live in ignored `work/journeys/`; public-person runs also persist to Postgres through generation hooks: `users/<persona-id>/<content-hash>.json` stores each user's complete result independently; `runs/<run-id>.json` contains small manifests with provenance and references; `latest.json` selects the current live and mechanical collections. Saving a scoped batch writes only its changed user records and atomically publishes the manifest, retaining other users and their original run provenance. Immutable records keep previous manifests readable. The inspector and database seeder read individual users; collection-wide analysis explicitly loads the full collection. Public profiles continue to read PostgreSQL.

A fresh checkout contains authored personas and a small two-user test sample at `lib/journeys/__fixtures__/sample-journeys.json`, plus the mechanical regression baseline. It has no generated live results. Run `pnpm journeys:generate --persona=<id>` (or `--group=independent`) to generate local results; these use paid live providers. Import an existing saved collection without inference with `pnpm journeys:migrate --file=<saved-suite.json>`, which preserves the original and verifies each imported record. Run `pnpm db:seed` only after the required local results exist. Unit tests do not require local results or paid generation; local integration checks that import all personas require a populated local collection.

Reads and writes are schema-checked, with a 32 MB per-user bound and a 1 MB manifest bound for up to 256 users. Manifests are published only after their user files are complete; same-process concurrent saves are serialized. Run generation/import from one process per workspace. Local records are retained until explicitly removed; there is no automatic cleanup of historical per-user versions. The absolute and default request ceiling is 1536 for both new generation and saved-operation resume. Participant operations retain their separate 32-request limit.

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
pnpm journeys:generate --resume=<run-id> --persona=<persona-id> --max-cost=0.5
```

Resume retries exactly the saved operation with a fresh bounded budget and no new OpenAI reply. Its default cost limit is $0.50. A deliberately exhausted request count is reported as a request-budget failure, not a provider timeout. A failed per-answer inspection projection resumes on the same answer, without replaying that accepted answer or adding a project step. It does not automatically finish the remaining interview. Source content and model must match. Saving the resumed run updates the selected local collection while retaining immutable previous records. Raw error bodies, headers and credentials are excluded.

### Response detail

Narrative personas can specify `responseStyle`: `detailed`, `conversational` (default), or `brief`. Public proxies and selected fictional participants develop extended arguments; the brief pragmatist and brief job worrier deliberately remain terse. This instruction reaches only the simulated participant. It never reaches Jev or supplies expected scores. `pnpm journeys:review` reports style and per-answer word counts so a shared-prompt edit cannot silently flatten the intended range of answer detail.

## Experimental worldview comparison

The inspector's “Watch the worldview develop” disclosure is closed by default and switches the outlook/transformation map, separate worldview axes, stated or inferred P(doom), milestone timing and assumptions to the selected saved answer. Earlier placed answers appear as numbered dots. Per-answer disclosures and final results show the same views.

`pnpm exec node --env-file=.env.development.local --conditions=react-server --import tsx scripts/replay-worldview-experiments.ts --allow-paid --max-requests=240 --max-cost=5` evaluates only the new fields against saved per-answer input states. This is a bounded live development replay, not regenerated participant answers or paid pressure testing. It sends the saved evidence, including any fixed personal transcript, to Jev; obtain authorization for that transfer before running.

Results are saved incrementally to `eval/development/worldview-experiments.json`; raw requests and typed responses stay under ignored `eval/runs/worldview-experiments/`. The loader overlays a record only when the source run ID, persona, step, input hash and evidence revision match. Core historical scores, answers and provenance are untouched. A replay can resume without repeating completed snapshots; missing or changed snapshots show an explicit unavailable state.

The 2026-09-20 replay was explicitly approved and covers all 45 saved result snapshots across 16 journeys. `--persona=<id>` scopes a review; `--refresh` replaces matching records after an extraction change. The `worldview-v2` pass verifies each selected excerpt independently, so alternative suitable quotes do not erase supported beliefs. See [comparison observations](worldview-experiment-review-2026-09-20.md).

Current results include inferred P(doom). Live generation writes fresh results for selected users and merges them into the local collection; a historical overlay is unnecessary for those new runs. Only final results are expanded by default.

Saved per-answer views use the same presentation rules as final results. For map placement, core questions, tentative readings and explicit indecision, use [current projections](ASSESSMENT.md#participant-facing-projections).

## Publicly stated P(doom) overrides

`lib/journeys/public-pdoom-statements.ts` records verified numerical public statements with a date, URL, outcome, horizon and conditions. These are attached to the persona snapshot and applied to every available per-answer result and the final result after the real assessment has run. They do not change Jev inputs, routing, readiness, reasoning scores or map coordinates. Personal assessments and mechanical tests do not use this override.

Overridden estimates have `source: public-statement`, a `publicStatement` provenance record, and the original engine value in `assessmentEstimate`. The displayed token preserves ranges and inequalities. When no point estimate was stated, the axis line shows only the stated band, with no dot; the `/users` directory still sorts such a statement by its midpoint. A quoted range is not an interpretation confidence interval.

The initial verified set covers Hinton (10–20%, January 2025, with later qualitative context), Marcus (approximately 3%), Dario (25%), Tegmark (>90% conditional on no regulation), and Noah (approximately 10% civilization collapse from biological misuse, with his separate 30% severe-destruction estimate retained as context). These endpoints are not interchangeable extinction forecasts. Unverified numbers attributed to other people remain excluded; their simulated answers continue through normal estimation.

## Refresh saved scoring without regenerating interviews

Run `pnpm exec node --env-file=.env.development.local --conditions=react-server --import tsx scripts/replay-worldview-experiments.ts --allow-paid --max-requests=720 --max-cost=3 --publish` after authorizing transfer of the saved evidence to Jev. The replay evaluates current experimental mappings against every saved per-answer input, including the fixed personal transcript. Explicit percentages and recorded public-source overrides are preserved.

The replay saves each completed snapshot for resumption. `--publish` requires the full local collection (no `--persona`) and validates matching input hashes, evidence revisions and scoring versions before saving refreshed local journey artifacts. Despite its name, this flag does not publish or select Postgres runs and does not refresh public map/persona pages. For public results, use the persisted generation workflow above. Original interview timestamps, source-run hashes, core scores, questions and answers remain intact; the replay artifact records interpretation timestamps, requests and cost. Participant assessments are separate and are not migrated by this command.

## Re-evaluate selected simulated users

`pnpm personas:reevaluate plan --env <file> --out <plan.jsonl>` re-evaluates each selected simulated user with the current engine. `runPersona` accepts a recorded transcript for any persona, as it does for the fixed user, so each run's accepted answers are replayed question by question. No answer is generated and no recovery prelude runs.

- The new journey keeps the original run's source snapshot, the sources its answers were written from, and applies the current verified public P(doom) statement.
- `plan` calls Jev but writes nothing, and records what each page would show before and after.
- `write` publishes each replay through the persisted generation records (`begin`/`finish`). It becomes a new public simulation and, being newer, the selected run.
- Earlier runs stay at their own URLs. Pages, the map and nearest-persona comparisons refresh on the next deployment.
- `plan --restate` applies a newly recorded public statement to a user whose brief is otherwise unchanged. It copies the selected `simulation_v1` run and applies the statement to the snapshot and every result, with no Jev call. The new run keeps the answers, scores and engine hashes of the run it copies; users without a statement, with historical payloads or with a different statement already applied are skipped.

## Import selected simulated users

`pnpm personas:import plan --env <file> --ids slug,slug` compares the named users' selected local `simulation_v1` runs with a target database such as production, which it opens read-only. `write` copies each profile and run through the persona repository without inference, under the run's original generation key, and verifies that the target selected the same snapshot digest. Profile metadata, including the one-liner, comes from `components/landing/people.ts` rather than the local database, so an import never restores an older description. Repeating an import is idempotent, and generation ordering keeps a newer target selection in place. The source must be the loopback database named by `.env.development.local`. Importing into production or preview is a separate, owner-approved step; deploy afterward so portraits, previews and static profiles rebuild. Staging is the Vercel Preview database, which has no local env file; pass a temporary one ([databases and environments](PERSISTENCE.md#databases-and-environments)).

## Sync profile metadata

`pnpm personas:sync-metadata plan --env <file> --all` (or `--ids slug,slug`) compares each profile's metadata in a target database with `components/landing/people.ts` and prints every changed field: one-liner, name, portrait, featured flag and the rest. It opens the target read-only. `write` updates the profiles that differ through the persona repository in one transaction and verifies them. It never touches source briefs, runs or selections, and skips profiles the target lacks, which arrive with their run through an import. Use it after editing presentation metadata, including on the local development database (`--env .env.development.local`). Writing to production is a separate, owner-approved step; deploy afterward so static profiles and social cards rebuild.

## Database-backed curated publication

Public runtime pages now read the selected simulation assessment from Postgres. `pnpm db:seed` imports the current curated public catalog from local records, preserving recorded questions, answers, projection inputs, source snapshots, sourced P(doom) overrides and original run provenance. At the original persistence checkpoint, that catalog comprised 44 public people in a 55-journey collection. Current membership comes from `components/landing/people.ts`; imported files supply seed evidence, not public runtime reads. Historical payloads are explicitly `historical_journey_v1`; they do not pretend to contain a resumable engine state.

Live generation and explicit resume save a private input record before running, retain the full final engine snapshot as `simulation_v1`, and publish/select only after success. Failed operations keep private input/checkpoint diagnostics and do not change the selected public run. Each new generation gets its own assessment URL. Reusing a generation key never repeats paid calls; use a new explicit run to retry. Selection compares generation start timestamps so older late completions and repeated seeds cannot roll it back. The offline generation commit window is 30 minutes; participant POST deadlines remain separate and unchanged. No scheduler, queue or worker is involved.

Authored briefs remain generation inputs. Profile/source updates can disclose that the current brief differs from the selected run’s source snapshot; they do not rewrite its immutable result. Development traces and participant-provider exchanges remain filesystem/private diagnostics and are excluded from public payloads.

## Scoped and group generation

`pnpm journeys:generate --group=independent --max-requests=1536 --max-cost=15` selects only the Independent 100 accounts, with at most four concurrent interviews and the existing physical-request and cost ceilings. `--group=tech-posters-<letter>` selects one top tech posters batch (`lib/journeys/tech-poster-personas.ts`) the same way; a batch stays well under the request backstop that the whole catalog would exceed. Individual `--persona=<id>` runs remain available. Scoped generation and resume merge into the saved collection, retaining untouched interviews and their per-batch `sourceRuns`. Cost and request metadata describe the newest paid batch. Current per-user storage bounds are documented under [Budgets and storage](#budgets-and-storage); participant interview limits are separate.

The user-facing term is simulated user. Internal persona identifiers are retained for compatibility. Research gaps remain explicit: a builder's technical work does not establish their personal extinction probability, policy agenda or timelines. The participant prompt now distinguishes source-grounded public simulations from fictional extreme stress-test users. Scoped runs generate only the selected users; saved interviews of everyone else remain unchanged.

An explicit `--turns=12` permits an offline simulation to reach the same twelve-question ceiling as a new participant assessment. The default remains five turns. This permits honest capped results with unknown dimensions when sparse evidence never unlocks an earlier result; it does not bypass readiness or invent views. Supply a sufficient explicit request budget for longer runs.
