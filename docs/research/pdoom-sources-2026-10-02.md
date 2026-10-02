# P(doom) sources and regenerated simulated users — October 2, 2026

An October 1–2 audit of all 169 simulated users looked for verified first-person P(doom) statements and found more than the page showed, plus sources missing from the briefs. Travis approved adding highly relevant sources back into the briefs and regenerating the affected users. This record covers what was added, how each user was refreshed, the fidelity review and the production import still to do. These are dated public views for fictional interviews, not quotations or endorsements, and no target coordinates or engine judgments were supplied.

## Public statements

`lib/journeys/public-pdoom-statements.ts` grows from 16 to 30 verified statements. Each keeps its outcome, horizon and conditions, and each was checked against the speaker's own words.

| Simulated user | Displayed | Source and limits |
| --- | --- | --- |
| Daniel Kokotajlo | ≈70% | The Diary of a CEO, 2026-07-13: AI takeover or a comparable catastrophe on the default path; he corrects the host's "extinction" |
| Elon Musk | 10–20% | Verdict with Ted Cruz, 2025-03-17: "20% likely, maybe 10%", over about 5–10 years |
| Joe Carlsmith | ≥10% | His 2025-11-03 essay: a "double-digit" probability of destroying humanity's future |
| Zvi Mowshowitz | ≈70% | Cognitive Revolution, 2026-03-19: deliberately one significant digit |
| Eli Lifland | ≈50% | ControlAI interview, 2025-04-10: misaligned takeover, with ≈25% extinction inside it |
| David Dalrymple | <5% | Cognitive Revolution, 2026-07-12: down from about 70% in 2022 |
| Connor Leahy | ≈99% | The Peter McCormack Show, 2026-08-14: on the current trajectory, "within rounding error" of Nate Soares; the future is not decided |
| Robert Miles | 10–90% | Doom Debates, 2025-08-23: a defensible range, not a point |
| Roko Mijic | 35–40% | X, 2026-09-25: with a determined effort to reduce it; about 95% on the laissez-faire trajectory |
| Ed Zitron | 0% | The Diary of a CEO debate, 2026-09-17: extinction "strictly" from AI |
| Yann LeCun | ≈0% | X, 2026-04-21: below an extinction-level asteroid strike in the next millennium, "not zero" |
| Jensen Huang | 0% by 2030 | CBS News, 2026-09-20: "the end of the world" by 2030 only |
| Nathan Lambert | ≈0% | Interconnects, 2026-09-10: extinction "so low it isn't worth discussing" |
| John David Pressman | 12% | Varieties Of Doom, 2025-11-17: a figure he gave privately, published with his caveats |

- **Musk:** the third-party transcript renders his answer "Likely, maybe 10%". The automatic captions of the show's official upload and Transformer's quotation both read "20% likely, maybe 10%", so the entry cites the official upload and records the discrepancy.
- **Leahy and Huang:** the profile shows the outcome line but not the conditions, so Leahy's current-trajectory condition and relative framing are in the outcome, and Huang's horizon is part of the displayed token.
- **Excluded:** Richard Hanania's <12% rests on inputs he says he made up, and on 2026-09-29 he called the probability low without a number; batch 1 excluded it for the same reason. The audit's borderline candidates are context only, with no displayed number: Yudkowsky (conditional "Yes"), Soares (a conditional lower bound), Sacks (a refusal, then a conditional zero), Hanson (2023, the foom scenario only), Dwarkesh Patel (2023, self-described as made up), swyx (2023, 5–95%), Garrison Lovely and lumpenspace.

A stated range or bound with no point estimate (Miles's 10–90%, Labenz's 10–90%, Carlsmith's ≥10%) now shows only its band on the profile's P(doom) axis, never a midpoint dot. The `/users` directory still sorts by the midpoint.

## Brief sources

Twenty-eight briefs gained at most two sources each, attributed to the person's own words: their posts, essays and labeled turns in transcripts.

- **Backers of the new statements:** Kokotajlo, Musk, Leahy, Zitron, LeCun, Huang and Pressman. Leahy's beliefs now carry the August 2026 estimate beside the conditional 2025 one.
- **Context with no displayed number:** Soares (the DOAC debate; his existing Tucker Carlson source also gained its transcript), Sacks, Hanson and Yudkowsky.
- **Refusals and close statements:** Bengio, Russell, Roon, Cowen, Narayanan, deepfates, Mollick, DHH, Bender, Gebru, Acemoglu, Fei-Fei Li, Teortaxes and Tenobrus, plus Dwarkesh's stale number, labeled as such.
- **Not added:** Sam Altman's brief already has the Fortune interview with his refusal, and Barack Obama's already has the September 14 thread that the audit's PC Gamer article quotes.

**Roko Mijic's brief was rewritten.** It framed alignment as comparatively easy, from a February 2026 livestream. His September 25 post and replies give 35–40% with a determined effort, about 95% on the laissez-faire trajectory and most of the risk within 15 years, and his September 26 Plan R+ post proposes splitting labs and giving well-behaved AIs political representation. The summary, beliefs and voice follow those posts and keep the February view as history.

All 759 current resources have preview images. The Marginal Revolution and Big Think pages returned Cloudflare challenges and use the local title card, as does the Bluesky post.

## Applying statements without new inference

Six users with a new statement had no brief change: Carlsmith, Zvi, Lifland, davidad, Miles and Lambert. `pnpm personas:reevaluate plan --restate` now copies a selected `simulation_v1` run and applies the persona's current statement to its snapshot and every result, as a live run would, with no Jev call. `write` then publishes it as a new selected run.

The local database still held these users' September 21–25 runs on engine 0.6, while production selects their September 29 re-evaluations on 0.7.1. Restating the local runs and importing them would have rolled production back. So production's September 29 runs were first written into the local database from that re-evaluation's saved plan file, with production persona IDs mapped to local ones, and then restated. Their profile rows were refreshed from the current catalog. On import, production keeps the same answers, outlook and scale for these six, and only the P(doom) changes. The assessment rows record the current engine version in their metadata, while each result keeps 0.7.1.

## Regeneration

The other 28 users were regenerated one at a time against the local development database, whose `DATABASE_URL` host was checked as `localhost`:

```sh
pnpm journeys:generate --persona=<id> --turns=5 --max-requests=24 --max-cost=0.3
```

Twenty-five runs completed directly. Musk, LeCun and Pressman exhausted the Jev request budget on their final operation, and each was completed with one bounded resume of that operation (`--resume=<run-id> --max-requests=24 --max-cost=0.3`). While those three waited, each failed run was the latest local record for its user, and another worktree's `pnpm db:seed` failed on Musk's. All 169 latest local records are successful runs again.

| Field | Value |
| --- | --- |
| Participant / evaluator | `gpt-5.6-sol` / `jev-1.13.0` |
| Assessment / content / rubric | `0.7.4` / `0.4.0-draft` / `0.1.0-draft` |
| Requests | 117 OpenAI, 588 Jev |
| Estimated cost | $2.11, plus $0.04 reserved by timed-out Jev requests. The six restatements cost nothing. This is the development estimate, not an invoice. |

## Results and fidelity review

Before is what production shows now (the September 29 0.7.1 re-evaluation); after is the selected local run. Outlook and scale are 0–100. "Stated" is a sourced public statement and "inferred" is the engine's reading of the answers. Restated runs keep their answers, so only their P(doom) changes.

Each regenerated interview was read in full against its brief and new sources:

- **Stated numbers appear only where a verified statement exists.** Kokotajlo, Leahy, Roko, Zitron and Huang give their sourced figures with the conditions attached, and Pressman calls his 12% a historical figure he would not present as current. Musk declines a fresh number ("not zero"), as in his July 2026 Economist interview, and the page shows his sourced March 2025 range.
- **Refusals are represented as refusals.** All 20 context users decline a number or scope it: Bengio stays out of "the p(doom) game", Russell steers the ship, Yudkowsky rejects the unconditional figure, and Sacks does not traffic in numbers before giving a conditional zero. The engine recorded none of their answers as a stated percentage.
- **No interview was unfaithful, so none was regenerated again.** Interviewer premises are not adopted, and no dates, quotations or experiences are invented. Two inferred values are artifacts worth knowing about. swyx's stock "5–95%" read as ≈25% (it was ≈7%), and deepfates' "no idea", with alignment as pivotal, reads as ≈16%.
- **swyx was reverted in review.** Travis, who knows him, judged ≈7% far more accurate, so the deliberately wide 2023 "5–95%" source was removed from his brief and he is not imported. Production keeps his earlier run.

New stated numbers:

| Simulated user | Before: outlook / scale | Before: P(doom) | After: outlook / scale | After: P(doom) | Run |
| --- | --: | --- | --: | --- | --- |
| Daniel Kokotajlo | 0.3 / 95.5 | ≈79% (inferred) | 10.5 / 99.7 | ≈70% (stated) | `1790899952148-a19690c5-5b9e-46a4-ba5c-297b4add9259` |
| Elon Musk | 95.0 / 98.7 | ≈22% (inferred) | 93.0 / 98.7 | 10–20% (stated) | `1790900767299-20d47226-aae1-43de-95fe-a06565ccc5c8` |
| Connor Leahy | 25.0 / 97.0 | ≈42% (inferred) | 0.0 / 100.0 | ≈99% (stated) | `1790900080672-5cc92dc1-020a-4d3b-b5d0-84fad95c07cb` |
| Ed Zitron | 25.3 / 11.0 | <1% (inferred) | 25.0 / 61.8 | 0% (stated) | `1790900201349-1610f733-fc0d-4a4f-b063-943cb3ccde38` |
| Yann LeCun | 85.7 / 65.5 | ≈4% (inferred) | 92.0 / 70.3 | ≈0% (stated) | `1790900801410-0e461da1-43d3-4879-866e-48823e35d478` |
| Jensen Huang | 100.0 / 71.3 | ≈1% (inferred) | 100.0 / 70.3 | 0% by 2030 (stated) | `1790900327342-0967aa84-ad8a-4e82-bfeb-b01a537918e7` |
| John David Pressman | 50.5 / 87.0 | ≈25% (inferred) | 57.0 / 72.2 | 12% (stated) | `1790900835525-703daf21-d20f-4789-a819-d62d9314efd1` |
| Joe Carlsmith | 28.5 / 99.7 | ≈19% (inferred) | 28.5 / 99.7 | ≥10% (stated) | `restate-1790899907075` |
| Zvi Mowshowitz | 1.3 / 99.7 | around 70% (said in interview) | 1.3 / 99.7 | ≈70% (stated) | `restate-1790899907061` |
| Eli Lifland | 19.3 / 99.0 | ≈18% (inferred) | 19.3 / 99.0 | ≈50% (stated) | `restate-1790899907067` |
| David Dalrymple | 77.0 / 99.7 | roughly 5% (said in interview) | 77.0 / 99.7 | <5% (stated) | `restate-1790899907036` |
| Robert Miles | 25.0 / 99.5 | ≈26% (inferred) | 25.0 / 99.5 | 10–90% (stated) | `restate-1790899907054` |
| Nathan Lambert | 75.5 / 44.5 | ≈4% (inferred) | 75.5 / 44.5 | ≈0% (stated) | `restate-1790899907047` |

Refusals and close statements added:

| Simulated user | Before: outlook / scale | Before: P(doom) | After: outlook / scale | After: P(doom) | Run |
| --- | --: | --- | --: | --- | --- |
| Nate Soares | 5.3 / 100.0 | ≈65% (inferred) | 1.0 / 100.0 | ≈88% (inferred) | `1790900455417-d6abe06a-261e-4e0d-ad32-6ecddd76ca8e` |
| David Sacks | 90.8 / 65.9 | ≈3% (inferred) | 94.0 / 63.0 | <1% (inferred) | `1790900515288-2a01a07b-742a-40bc-b993-ae4fddaae6a1` |
| Robin Hanson | 75.0 / 65.2 | ≈6% (inferred) | 75.0 / 66.8 | ≈2% (inferred) | `1790900572881-1dfbe2b9-0aa4-4175-a29d-5f9a6f855ea0` |
| Eliezer Yudkowsky | 0.3 / 100.0 | ≈90% (inferred) | 0.3 / 100.0 | ≈90% (inferred) | `1790900631933-96f07b6d-1b9f-44df-9fac-4b6b693c804b` |
| Shawn Wang (swyx), reverted in review | 75.0 / 52.0 | ≈7% (inferred) | not imported | — | `1790900691528-b1e57180-bc6f-4b09-9adf-6cf9fa3de0e2` |
| Dwarkesh Patel | 52.8 / 83.8 | ≈23% (inferred) | 52.3 / 81.1 | ≈19% (inferred) | `1790900899236-d66926fe-8786-402f-bce5-970eaf2b7e75` |
| Yoshua Bengio | 30.8 / 68.3 | ≈24% (inferred) | 26.5 / 72.5 | ≈21% (inferred) | `1790900967700-4af1f763-c287-4912-a1e6-0fabf2beb758` |
| Stuart Russell | 44.5 / 72.1 | ≈30% (inferred) | 29.0 / 79.7 | ≈28% (inferred) | `1790901035509-d076be6c-f5d4-46f0-89cb-4528c378d15b` |
| Roon | 60.3 / 97.8 | ≈27% (inferred) | 73.8 / 99.7 | ≈6% (inferred) | `1790901097967-4b5a0be0-4535-4b7e-b95c-9d4575a24c9e` |
| Tyler Cowen | 74.7 / 39.6 | ≈6% (inferred) | 75.3 / 73.5 | ≈5% (inferred) | `1790901158475-9fab6b1a-5348-4749-83db-a8410e3456f3` |
| Arvind Narayanan | 75.0 / 64.3 | ≈7% (inferred) | 72.0 / 72.8 | ≈7% (inferred) | `1790901215878-74e66d55-5e05-41a1-9b75-e8e5903a2773` |
| deepfates | 75.0 / 66.9 | ≈5% (inferred) | 74.5 / 74.3 | ≈16% (inferred) | `1790901276705-cbe6b822-ef7c-4b90-a3db-081d69c2c2eb` |
| Ethan Mollick | 50.0 / 41.9 | ≈1% (inferred) | 53.3 / 57.3 | ≈4% (inferred) | `1790901336434-119239a4-600d-4d3b-b267-4e97c4e3e94e` |
| David Heinemeier Hansson | 75.3 / 40.9 | ≈2% (inferred) | 99.5 / 57.0 | ≈5% (inferred) | `1790901394913-7106bd09-e310-4ed2-8c8b-41fbc34c999a` |
| Emily M. Bender | 25.0 / 38.1 | <1% (inferred) | 25.8 / 53.8 | ≈4% (inferred) | `1790901449028-8b753b39-70cd-4f0c-9ba0-e2b193423a85` |
| Timnit Gebru | 25.3 / 58.0 | ≈1% (inferred) | 27.0 / 59.0 | ≈4% (inferred) | `1790901512073-8a045130-c03b-4b45-92fa-d922b2306bd8` |
| Daron Acemoglu | 37.8 / 58.0 | ≈2% (inferred) | 33.3 / 70.0 | ≈4% (inferred) | `1790901574399-aeaa6657-0d44-41b9-980d-d6f75da35b12` |
| Fei-Fei Li | 77.8 / 52.5 | ≈1% (inferred) | 76.3 / 55.5 | ≈4% (inferred) | `1790901635667-715693ed-47e1-4b52-9b13-172fb3e045dd` |
| Teortaxes | 74.5 / 53.6 | ≈3% (inferred) | 67.3 / 66.8 | ≈13% (inferred) | `1790901692183-008a0b10-2008-4556-8604-be95403ee869` |
| Tenobrus | 27.5 / 73.0 | ≈22% (inferred) | 29.8 / 78.5 | ≈24% (inferred) | `1790901750960-19cdb3cf-63a0-4676-b25c-01e27701f4c5` |

Brief refreshed:

| Simulated user | Before: outlook / scale | Before: P(doom) | After: outlook / scale | After: P(doom) | Run |
| --- | --: | --- | --: | --- | --- |
| Roko Mijic | 50.3 / 88.5 | ≈29% (inferred) | 0.0 / 100.0 | 35–40% (stated) | `1790900138969-59956271-d258-4301-b2a7-ea5d75bc2dc5` |

A new interview and engine 0.7.4 together move some placements well beyond the P(doom) change. Zitron's scale rises from 11 to 62 because he now says the bubble will change the world "a lot". DHH's outlook moves from 75 to 99.5, Roon's inferred P(doom) falls from ≈27% to ≈6% with his "quite low but real" post, and Kokotajlo, Leahy and Roko now sit in the doom corner.

## Verification

Commands ran on this branch, using the disposable `doom_bloom_pdoomsrc_test` database for test runs.

- `pnpm test` (format, lint, types, 523 tests in 94 files, content validation and unused code) passed; `pnpm test:content` passed.
- `pnpm journeys:mechanical:check`: all observations match the baseline.
- `pnpm db:test:personas` passed.
- `pnpm check:persistence tests/persistence/personas.spec.ts` passed. It seeded all 169 profiles.
- `pnpm resources:previews --concurrency=2`: 759 of 759 current resources have images.
- `pnpm build:local` passed.

## Production import (not performed)

This work changed only the local database. Importing it is a separate, owner-approved step; see [importing selected simulated users](../user-journeys.md#import-selected-simulated-users).

```sh
IDS=dkokotajlo,elonmusk,npcollapse,edzitron,ylecun,jensenhuang,jd_pressman,jkcarlsmith,thezvi,eli_lifland,davidad,robertskmiles,natolambert,so8res,davidsacks,robinhanson,esyudkowsky,dwarkesh_sp,yoshua_bengio,stuart-russell,tszzl,tylercowen,random_walker,deepfates,emollick,dhh,emilymbender,timnitgebru,dacemoglumit,drfeifei,teortaxestex,tenobrus,rokomijic
pnpm personas:import plan --env .env.production.local --ids $IDS
pnpm personas:import write --env .env.production.local --ids $IDS
```

Run it from the checkout whose `.env.development.local` points at the local database holding these runs. `plan` should report "new selected run" for all 34. Deploy afterward so source previews and the static profiles rebuild.
