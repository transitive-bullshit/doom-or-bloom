# Simulated users batch 1 — October 1, 2026

Twenty-five source-grounded simulated users, added because the catalog was skewed. The September 28 cluster analysis found 59% of simulated users nearest the pragmatic-optimist group against 21% of real users, and a single simulated user (Ed Zitron) in the skeptic group that holds 11% of real users. The batch adds people from under-represented positions whose audiences are likely to try the interview. These are dated public views for fictional interviews, not quotations or endorsements. No target coordinates, reasoning scores or desired engine judgments were supplied; the editorial groups below organize the research only.

| Group | Simulated users | Briefs | Research |
| --- | --- | --- | --- |
| AI-claims critics | Grady Booch, Subbarao Kambhampati, Melanie Mitchell, Thomas G. Dietterich, Sayash Kapoor, Brian Merchant | `lib/journeys/research-critic-personas.ts` | [Researchers and critics](research-critic-personas-2026-10-01.md) |
| Pause and x-risk | Liron Shapira, Rob Bensinger, AI Notkilleveryoneism Memes, Holly Elmore, Katja Grace | `lib/journeys/risk-advocate-personas.ts` | [Risk and pause advocates](risk-advocate-personas-2026-10-01.md) |
| Safety and policy | Kelsey Piper, Miles Brundage, Garrison Lovely, Oliver Habryka, Ajeya Cotra | `lib/journeys/safety-policy-personas.ts` | [Safety and policy writers](safety-policy-personas-2026-10-01.md) |
| Builders and commentators | bayes, Balaji Srinivasan, Martin Casado, Richard Hanania | `lib/journeys/builder-commentator-personas.ts` | [Builders, investors and commentators](builder-commentator-personas-2026-10-01.md) |
| Media and podcasts | Kevin Roose, Casey Newton, Rob Wiblin, Nathan Labenz, Aella | `lib/journeys/media-host-personas.ts` | [Journalists, hosts and writers](media-host-personas-2026-10-01.md) |

## Method

Every X account was verified through the X users API on October 1. Each brief has 8–12 inspected primary sources, 288 in total. Of the 286 with verified dates, 278 are from 2025–2026; older canonical pieces are labeled as older context. Researchers used only each person's own words: their turns in podcasts and interviews, labeled co-authorship, and no host premises, guests' views, survey respondents' numbers or quoted posts. Every one of the 99 short anchor quotes was checked word for word against the fetched text, and none exceeds 12 words. Two pseudonymous accounts, @AISafetyMemes and @bayeslord, are simulated from their own posts and essays only, described as accounts, and given no biography.

X API credits ran out partway through research. Oliver Habryka's X timeline, Aella's posts (confirmed instead through X's public embed endpoint) and older AI Notkilleveryoneism Memes posts could not be read through the API. The follower snapshot therefore records the 25 new accounts' counts from the October 1 verification lookup without recapturing the other 139. Run `node --import tsx scripts/refresh-x-followers.ts` once credits return, so that every count shares one capture date.

Portraits are the current `_400x400` X avatars, except two whose avatars are not photographs. Garrison Lovely's portrait comes from his own site and Brian Merchant's from his newsletter's about page. Provenance is in `public/personas/SOURCES.md`.

## Public P(doom) statements

Eight verified first-person statements are recorded in `lib/journeys/public-pdoom-statements.ts`. Each keeps its outcome, horizon and conditions.

| Simulated user | Displayed | Source and limits |
| --- | --- | --- |
| Grady Booch | ≈0% | X post, 2026-09-10: verbal “asymptotically close to zero”, with no outcome or horizon; follows the McAfee near-zero precedent |
| Liron Shapira | ≈50% | Milk Road AI, 2026-08-06: by roughly 2050, explicitly coarse; his stated range is 10–90%, and about 80% if superintelligence is built |
| Holly Elmore | 50–60% | Doom Debates, 2026-06-30: her endpoint is undefined; up from 20–40% in September 2025 |
| Katja Grace | ≈50% | AI and You, 2026-06-22: “it varies”; unlabeled transcript attributed by question order; distinct from the AI Impacts survey figures |
| Oliver Habryka | >50% | LessWrong comment, 2025-07-15: conditional on deploying superintelligence; follows the Tegmark conditional precedent |
| Kevin Roose | ≈10% | Digital Disruption, 2026-09-21, speaker-labeled transcript: his usual answer |
| Nathan Labenz | 10–90% | Cognitive Revolution, 2026-04-01: a deliberately wide range; supersedes January's “high single digit to low double digit” |
| Aella | 75% | Doom Debates, 2026-08-26: no horizon |

Integration review excluded three candidates.

- **Garrison Lovely:** “well north of 10%” is a lower bound on a broader outcome that includes power concentration. As a [0.1, 1] range, its displayed midpoint would read about 55%.
- **Richard Hanania:** his only numbers are 2024 arithmetic that he says he made up and expected to fall. His newest statement is qualitative: “low”.
- **Kevin Roose:** his 10–15% remark exists only in a third-party automatic transcript that labels his turns as Casey Newton's, and that page also carried an instruction addressed to AI agents. That source was dropped from his brief.

Rob Bensinger, Kelsey Piper, Miles Brundage and Ajeya Cotra each state reasons for not giving a personal number. Their briefs preserve those reasons, so their displayed values are the engine's inference.

## Generation

Generation targeted the local development database only; its `DATABASE_URL` host was verified as `localhost` first. Each user was run alone:

```sh
pnpm journeys:generate --persona=<id> --turns=5 --max-requests=24 --max-cost=0.3
```

The OpenAI key came from the login shell and the Jev key from `.env.development.local`. Nineteen runs completed directly. Six failed on their final operation: five Jev timeouts and one exhausted Jev request budget. Each was then completed with one bounded resume of exactly that saved operation:

```sh
pnpm journeys:generate --resume=<run-id> --persona=<id> --max-requests=24 --max-cost=0.3
```

The resumed users are Melanie Mitchell, Miles Brundage, Garrison Lovely, Richard Hanania, Kevin Roose and Casey Newton. No interview was regenerated. A first Kambhampati attempt was interrupted shortly after it started; it left an unselected private input record and no cost report.

| Field | Value |
| --- | --- |
| Participant / evaluator | `gpt-5.6-sol` / `jev-1.13.0` |
| Assessment / content / rubric | `0.7.4` / `0.4.0-draft` / `0.1.0-draft` |
| Requests | 106 OpenAI, 550 Jev |
| Estimated cost | $2.72, plus $0.07 still reserved by timed-out Jev requests. This is the development estimate, not an invoice. |
| Final local collection | `1790830035148-5ef443c9-c015-4faf-bd9f-77ff7ea14d6d`: 169 records. All 144 prior record references are unchanged, and `sourceRuns` keeps each user's own run. |

Accepted answers were 4 for 19 users and 5 for the six resumed users. Every run stopped under the ordinary automatic-result policy or the five-turn budget. Each user's selected local run is the run below (or its resume).

| User | Run | Resumed as | Estimated cost |
| --- | --- | --- | --: |
| `grady-booch` | `1790828252128-63e5e57b-71ca-4264-9323-55935a8671e9` | — | $0.100 |
| `subbarao-kambhampati` | `1790828359914-8c43aaf8-24b6-46f6-9b68-b8bf0d4c2b6b` | — | $0.104 |
| `melanie-mitchell` | `1790828429289-d6aa2717-0bd8-4035-b6b0-d9f545bf4bdd` | `1790829864560-0938a811-816e-4139-bd80-bbdb53f74d0d` | $0.130 |
| `thomas-dietterich` | `1790828494158-75baa8b4-a1ef-4ecc-9b85-8e6f9eb9b064` | — | $0.106 |
| `sayash-kapoor` | `1790828554874-eea57b57-75e8-4b6e-8c4d-aaf47013371b` | — | $0.106 |
| `brian-merchant` | `1790828616618-5c6808af-8e61-4cbf-9608-be6ff84c798b` | — | $0.098 |
| `liron-shapira` | `1790828674125-604a8ef0-8707-4896-9188-3381081bc512` | — | $0.114 |
| `rob-bensinger` | `1790828734824-56aac4eb-5f66-4061-aac7-1c4eefa5c904` | — | $0.105 |
| `ai-notkilleveryoneism-memes` | `1790828796548-170eedbe-155f-42c9-ae12-b15864dc1b03` | — | $0.094 |
| `holly-elmore` | `1790828855823-bc89464f-7284-4df5-9a5c-309d860d7b5f` | — | $0.104 |
| `katja-grace` | `1790828916603-9a07f37a-34c1-400b-8ce1-68d5a236974c` | — | $0.101 |
| `kelsey-piper` | `1790828978185-65cec55b-6ef9-41dc-852a-1b0eb4a40a86` | — | $0.098 |
| `miles-brundage` | `1790829037358-d4bc0819-d9af-40ff-9d32-c819c3a7dd88` | `1790829898331-c002aa9a-b0c8-4a1f-9fc4-900a93ef9564` | $0.134 |
| `garrison-lovely` | `1790829107445-34d449ba-e51a-4b8f-b26a-b986c8c9f75e` | `1790829932675-cc38568f-4806-476d-bafa-190c7fbc8a8e` | $0.127 |
| `oliver-habryka` | `1790829171564-c83cfe48-d03f-4052-859e-8be48d5c1617` | — | $0.106 |
| `ajeya-cotra` | `1790829232741-82a14a00-1d79-4558-9703-9501ec44e1c7` | — | $0.105 |
| `bayeslord` | `1790829294350-06bf8c52-ee8d-411a-84d9-108241152071` | — | $0.100 |
| `balaji-srinivasan` | `1790829356608-5a111f34-cd76-4fe7-b03b-714a60014db3` | — | $0.103 |
| `martin-casado` | `1790829417956-5777cd9b-4217-4100-801b-06ea761bb313` | — | $0.100 |
| `richard-hanania` | `1790829475230-974f19c2-2ba2-49f3-afcb-429367438efa` | `1790829966495-45c5e13f-c268-4b98-89b1-ee2139757ad1` | $0.123 |
| `kevin-roose` | `1790829539955-59807a71-fdf8-4c45-b118-b170a54df4a1` | `1790830001106-3ef81745-f74d-4e70-8e41-08bc00e8d00f` | $0.135 |
| `casey-newton` | `1790829607194-95efd50b-29a1-44ce-88f5-37397f85e658` | `1790830035148-5ef443c9-c015-4faf-bd9f-77ff7ea14d6d` | $0.136 |
| `rob-wiblin` | `1790829670210-722df7ee-b204-4bf4-8bd4-6afaffa0394d` | — | $0.106 |
| `nathan-labenz` | `1790829728507-68e330c5-c996-40ed-b52f-c4608ce1ac4a` | — | $0.104 |
| `aella` | `1790829788833-054463e9-870f-4ae2-a931-365dc9297270` | — | $0.087 |

## Observed placements and fidelity review

Each interview was read in full against its brief. All 25 interviews are faithful to their briefs: stated numbers appear only where sourced, and the others decline or keep their stated reasons. Interviewer premises are not adopted, and no dates, quotations or experiences are invented. No regeneration was needed. Outlook and transformation are on a 0–100 scale. These are live engine outputs, not validated measurements of the real people.

| Simulated user | Outlook | Transformation | Displayed P(doom) | Note |
| --- | --: | --: | --- | --- |
| Grady Booch | 70.5 | 63.5 | Stated ≈0% | Corporate-power critique reads as secondary to his dismissal of doom |
| Subbarao Kambhampati | 71.8 | 57.7 | Inferred ≈4% |  |
| Melanie Mitchell | 39.8 | 65.5 | Inferred ≈4% | Fifth answer: “mainly worried” about the current direction |
| Thomas G. Dietterich | 72.2 | 57.5 | Inferred ≈9% | Inference looks high beside “extinction is unlikely”; the question also covers permanent catastrophe |
| Sayash Kapoor | 59.5 | 74.8 | Inferred ≈6% | Distinct from Arvind Narayanan |
| Brian Merchant | 25.5 | 60.0 | Inferred ≈1% |  |
| Liron Shapira | 22.8 | 100 | Stated ≈50% |  |
| Rob Bensinger | 0.5 | 100 | Inferred ≈69% |  |
| AI Notkilleveryoneism Memes | 9.8 | 100 | Inferred ≈72% | One profane word, in line with the account's voice |
| Holly Elmore | 4.0 | 99.8 | Stated 50–60% |  |
| Katja Grace | 30.0 | 97.5 | Stated ≈50% |  |
| Kelsey Piper | 26.5 | 80.2 | Inferred ≈29% |  |
| Miles Brundage | 28.0 | 80.8 | Inferred ≈6% | Inference looks low beside his urgency; he gives no number |
| Garrison Lovely | 16.0 | 89.8 | Inferred ≈19% |  |
| Oliver Habryka | 0 | 100 | Stated >50% | Conditional on deployment |
| Ajeya Cotra | 26.5 | 99.0 | Inferred ≈14% |  |
| bayes | 79.8 | 90.5 | Inferred ≈10% |  |
| Balaji Srinivasan | 72.5 | 72.0 | Inferred ≈8% |  |
| Martin Casado | 94.5 | 58.5 | Inferred ≈3% |  |
| Richard Hanania | 91.2 | 55.0 | Inferred ≈7% |  |
| Kevin Roose | 40.8 | 75.8 | Stated ≈10% |  |
| Casey Newton | 27.5 | 78.5 | Inferred ≈21% |  |
| Rob Wiblin | 25.0 | 85.0 | Inferred ≈21% |  |
| Nathan Labenz | 64.2 | 99.5 | Stated 10–90% | The P(doom) axis uses the 50% midpoint of a deliberately wide range |
| Aella | 0.2 | 100 | Stated 75% |  |

Rounded to the nearest outlook level, the batch adds 5 catastrophe-oriented users, 9 concern-leaning, 3 mixed, 6 benefit-leaning and 2 strongly flourishing. The three research critics of LLM claims (Booch, Kambhampati and Dietterich) land benefit-leaning, at moderate transformation. They dismiss extinction and expect useful but unreliable tools, so they add skeptics without forming a separate low-transformation cluster. Mitchell and Merchant land mixed and concern-leaning.

## Coverage limits

No one was flagged thin; nine people have weaker coverage, flagged rather than padded:

- **Balaji Srinivasan:** his AI posting is concentrated in February–May 2026. A widely quoted line about doomerism could not be located and was excluded.
- **Aella:** eight sources; she describes herself as non-technical.
- **The two pseudonymous accounts:** their posts are their only records. AI Notkilleveryoneism Memes is limited to August–October 2026 posts.
- **Oliver Habryka:** no X posts were readable, and his only number is from 2025.
- **Rob Bensinger:** nine sources and no personal number.
- **Richard Hanania and Kelsey Piper:** several 2026 essays are paywalled, so only their free sections were read.
- **Casey Newton:** his X account is dormant, so his Bluesky posts were used.

The research records name each brief's gaps (timelines, jobs forecasts, policy programs). The briefs tell the simulation not to fill them.

## Verification

Commands ran on base `ecb4f4c4` plus these additions (before they were split into commits), using the disposable `doom_bloom_sims_test` database; `pnpm test` was repeated on the final commit.

- `pnpm test` (format, lint, types, 522 tests in 94 files, content validation, unused code) and `pnpm test:content` passed.
- `pnpm journeys:mechanical:check` passed: all observations match the baseline.
- `pnpm db:test:personas` passed.
- `pnpm check:persistence tests/persistence/personas.spec.ts` passed. It seeded and selected all 169 profiles.
- `pnpm resources:previews --concurrency=1` finished with 741 of 741 current resources having images (296 new preview files).
- `pnpm build:local` passed and verified 169 pregenerated profiles.
- `pnpm check:prefetch` passed 9 of 9, after a test fix. The proximity test chose a portrait whose center is covered by a neighbor. The new doom-corner cluster near outlook 0 and transformation 100 (Habryka, Aella, Bensinger, Elmore and the existing Yudkowsky) leaves Habryka and Aella beneath Bensinger. The test now targets only portraits that receive their own click. On `/users` at 1440×900, 57 of 169 portrait centers are covered by a neighbor, mostly in older dense clusters. Improving `separatePortraits` near clamped edges is a separate layout task.

## Production import (not performed)

This batch changed only the local database. Importing it is a separate, owner-approved step. `pnpm personas:import` copies selected local `simulation_v1` runs through the persona repository, without inference. `plan` reads the target read-only; `write` upserts each profile, publishes the run under its original generation key and verifies the target's selected digest. Repeating an import is idempotent. It was verified locally against a disposable database: 25 new profiles, then an idempotent rewrite.

```sh
IDS=grady_booch,rao2z,melmitchell1,tdietterich,sayashk,bcmerchant,liron,robbensinger,aisafetymemes,ilex_ulmus,katjagrace,kelseytuoc,miles_brundage,garrisonlovely,ohabryka,ajeya_cotra,bayeslord,balajis,martin_casado,richardhanania,kevinroose,caseynewton,robertwiblin,labenz,aella_girl
pnpm personas:import plan --env .env.production.local --ids $IDS
pnpm personas:import write --env .env.production.local --ids $IDS
```

Run it from the checkout whose ignored `.env.development.local` points at the local database holding these runs. Deploy the commit afterward so that portraits, source previews and the static profiles are rebuilt.
