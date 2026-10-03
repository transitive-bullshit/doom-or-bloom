# Cultural, civic and economic persona expansion — October 3, 2026

The requested four existing personas are now featured: Simon Willison, Joe Weisenthal, Mario Zechner and Jesse Genet. Seven new public-person personas have authored source packets, neutral presentation, actual sourced quotation sections, portraits and selected local live journeys. Ed Zitron’s interview was separately audited and replaced. Names were normalized to Cory Doctorow, Ha-Joon Chang, Ted Chiang and Jon Stewart.

## Research and real quotations

| New persona | Source records | Substantive inspected sources | Real quotes | Evidence audit |
| --- | --: | --: | --: | --- |
| Cory Doctorow | 9 | 9 | 4 | [Cultural writers](cultural-writer-personas-2026-10-03.md) |
| Ha-Joon Chang | 6 | 5 | 3 | [Political economy](political-economy-personas-2026-10-03.md) |
| Ted Chiang | 8 | 8 | 5 | [Cultural writers](cultural-writer-personas-2026-10-03.md) |
| Paul Krugman | 11 | 11 | 5 | [Political economy](political-economy-personas-2026-10-03.md) |
| Naomi Klein | 6 | 6 | 3 | [Civic and cultural](civic-cultural-personas-2026-10-03.md) |
| Jon Stewart | 5 | 5 | 4 | [Civic and cultural](civic-cultural-personas-2026-10-03.md) |
| Elizabeth Warren | 8 | 8 | 5 | [Civic and cultural](civic-cultural-personas-2026-10-03.md) |

Total: 53 records, 52 substantive inspected sources, 29 short exact quotations. Chang’s extra record is a short publisher-hosted endorsement. His five substantive sources include older AI interviews and recent broader economic-policy discussions; only one accessible substantial recent AI interview was found. Dates and this recency limitation are explicit. Chiang’s August 2024 essay is older foundational context; his other seven sources fall within the requested two-year window. Other packets are from 2025–2026.

Speaker attribution is essential: Stewart’s own questions and comments are separated from his guests’ forecasts; Klein’s viral fabricated quotation is excluded; coauthored statements are labelled; Krugman’s latest safety concerns are retained alongside his economic uncertainty. Missing quantitative estimates and technical-control positions do not justify inventing them. Real quotes are separate from fictional generated answers. Source-artwork fallbacks are explicitly recorded title cards and monograms when publishers block fetching; they do not contain challenge screens. Ted’s Occidental interview was inspected through indexed publisher text, but a later direct asset-fetch returned 404; the access limitation is recorded in his current brief and evidence audit without changing its claims or date. His public quotes use other sources.

## Live generation and fidelity review

The seven-person batch is `1791011703068-a8114700-77bb-4f3d-982b-67bac25583c3`, generated with assessment 0.7.4, Jev 1.13.0 and GPT-5.6 Sol. Only these seven explicit IDs were selected. Each had up to 12 answer opportunities; normal routing stopped six after four accepted answers and Stewart after five. All have successful selected public simulation runs in the loopback development database.

The shared estimated-spend cap was $15 and the physical Jev backstop 1024. Actual estimated spend was $0.6183: 29 participant requests and 149 Jev requests. Ed’s first repair cost $0.0770 and the second pass $0.0807; total estimated spend $0.7760, not a provider invoice. Other personas were retained with their original immutable records and provenance. Generation writes only locally; authorized publication is recorded below.

Every selected answer was read against its packet, including scale, catastrophe and counterfactual answers. Counterfactual update answers remain fictional synthesis, not public quotations. No reruns or manual scores were used to obtain lower placements. Ed’s second interview followed a substantive source-fidelity correction, not selection for a desired score.

| New persona | Doom–Bloom / 100 | Transformation / 100 | Vertical interpretation range / 100 | Accepted answers |
| --- | --: | --: | --- | --: |
| Cory Doctorow | 30.8 | 63.3 | 50–75 | 4 |
| Ha-Joon Chang | 39.8 | 51.8 | 17–100 | 4 |
| Ted Chiang | 25.5 | 52.9 | 37–88 | 4 |
| Paul Krugman | 27.0 | 66.3 | 48–77 | 4 |
| Naomi Klein | 25.8 | 70.8 | 45–80 | 4 |
| Jon Stewart | 25.0 | 74.5 | 72–78 | 5 |
| Elizabeth Warren | 29.5 | 61.0 | 18–100 | 4 |

All seven currently land above the midpoint. Ordinary-technology framing is compatible with substantial institutional, labor, political and ecological repercussions. Chang and Warren have especially broad interpretation ranges; their records do not establish precise ultimate scale expectations. The current answers express possible large changes more strongly than a pure low-impact reading; the result should not be treated as a verified personal numerical forecast. These additions broaden the people represented, rather than guarantee symmetry on the map. They are in the general directory, not newly featured.

## Featured map and Ed Zitron

Featured status is centrally authored in `components/landing/people.ts` and was synchronized only for the four requested local profiles. Their existing saved answers and positions were retained. Their older two-answer interviews omit the current direct eventual-scale prompt, as explained in the [original map proposal](lower-half-featured-map-2026-10-03.md); featuring them does not erase that limitation.

The local directory now contains 178 selected people, of whom 48 are featured. Six featured positions fall strictly below the transformation midpoint: the four additions, Nathan Lambert, and the audited Ed Zitron. The prior map had one of 44. Portrait displacement is presentation only; the underlying saved coordinates determine the count.

The [Ed answer audit](ed-zitron-answer-audit-2026-10-03.md) now records the second pass. The initial repair fixed the zero-extinction versus 1%-ten-year attribution, but overcorrected transformation from 51.5 (25–75 range) to 1.5 (0–1.5). The balanced brief retains both rejection of revolutionary LLM capabilities and adopted lasting economic/workforce damage. One corrected interview produces 35 (0–50 range), still below the midpoint. The source record does not establish a precise 10–20 score. No estimator change, clamp or rerun to select coordinates was used. The range describes interpretation of fictional answers rather than calibrated uncertainty about Ed’s beliefs or future events. Earlier records remain immutable.

Actual local map screenshot: `/Users/tfischer/.codex/visualizations/2026/10/03/01a10074-40fd-7582-9948-06d11863212d/featured-map-updated.jpg`. Verified the four new legend links, portrait placement and successful new Cory Doctorow profile with source bookmarks, four real quotations and four simulated answers. Portrait provenance is in [SOURCES.md](../../public/personas/SOURCES.md).

## Verification

Base revision `8ad008af34f9ae20cdd7f3a446ae3d02efcc10a7`, working tree dirty with this task. Initial verification was local; authorized release verification follows below.

- `pnpm fix:format`: passed.
- `pnpm test`: passed, 630 unit tests across 107 files, content validation, types, lint, formatting and unused-code checks. An initial unit run overlapped source-preview generation and failed on artwork not yet written; the completed preview run resolved it, and the full suite then passed.
- `pnpm resources:previews --concurrency=1`: completed; 53 new persona source entries plus one additional Ed source, each with local artwork and icon. Preserved preexisting entries rather than retain unrelated refreshes.
- `pnpm db:test:personas`: passed, including exact import, idempotency, provenance conflicts, publication validation, selected-run ordering and metadata-only sync.
- `pnpm check:persistence tests/persistence/personas.spec.ts`: passed, one scenario, 18.4 seconds.
- `pnpm build:local`: passed; verified 178 pregenerated profiles with results and answers, cached public shares, portraits and card fonts.
- `pnpm check:prefetch`: passed, 11 scenarios, 14.2 seconds, including every built profile with the database unavailable and map/directory navigation.

## Authorized production and staging publication

The user authorized merging this expansion after Ed’s second audit and adding the personas to both databases. After scoped read-only plans, `personas:import write` copied only the seven new profiles and Ed’s second-pass run to production and staging/Preview. Each selected snapshot digest was verified against the local record. `personas:sync-metadata write` changed only the four requested featured flags in each target and verified them. Staging is the existing separate `doom-or-bloom-preview` project, branch `br-blue-field-avdsx870`, database `doom_bloom_preview`; no new branch or schema migration was needed.

Read-only follow-up confirmed 178 selected public personas in production and 177 in staging, with 48 featured profiles in each. All twelve affected profiles are present, Ed’s selected transformation is 35 with range 0–50, and the four featured flags are set. The preexisting staging gap is Nick Marwell, outside this scoped expansion; none of the requested additions is missing. Repeating the production import plan reports all eight runs already selected. Neither import makes provider calls or transfers participant records. Regenerated and visually reviewed `app/opengraph-image.png` from production: 48 featured positions and eight chosen portraits.

On the release branch, the second-pass core checks again pass 630 tests across 107 files and the updated local build pregenerates all 178 profiles. All native database release checks pass, including repeated migrations, repository transactions, lifecycle, authentication, budget, feedback and persona publication. The restart gate initially failed because its Node readiness probe and browser context did not accept the local Portless CA. Matching the other local browser suites’ HTTPS setup fixes the gate; the complete killed-POST/restart/explicit-retry scenario now passes. Full persistence and browser runs also exposed stale desktop heading assertions (30px versus the current global 36px h1 scale, and 24px versus the current 28px h2 scale); updated the tests to match existing product styling. These repairs affect test configuration and assertions only.

Release verification at `44a194ff`, with the final h2 assertion and this record uncommitted: full persistence passed nine scenarios (45.7 seconds); analytics passed four (41.8 seconds); full browser run passed 101 of 102 (five minutes), and all nine landing/profile scenarios passed after the h2 assertion repair. Every scenario from the full browser run has therefore been verified, without rerunning unaffected cases or adding retries. The final local build passed, prefetch passed eleven scenarios (13.2 seconds), and public cache passed two (4.6 seconds). Core checks were rerun after the restart-test changes; an initial type check found a scratch verification script under ignored `work/`, which was moved out of TypeScript compilation, and the complete core command passed. No product types or runtime behavior were changed for that scratch-file issue.

[PR #41](https://github.com/transitive-bullshit/doom-or-bloom/pull/41) contains the authorized changes. The first commit’s CI and Vercel preview both passed. Browser verification of [that staging deployment](https://doom-or-bloom-630oz7h7j-saasify.vercel.app/) confirms all four featured legend links, Ed’s 35/100 result and 0–50 range, and all seven new directory entries. Database identity checks remain the authority for exact selected payloads. Production deployment verification follows the main-branch merge.
