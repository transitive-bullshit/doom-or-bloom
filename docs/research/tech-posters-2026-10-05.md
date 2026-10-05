# Top tech posters — October 5, 2026

Thirty-four source-grounded simulated users from the top 100 of the [Top 50 Tech Posters on X](https://tech50x.snytch.ai/) vote, requested by Travis. The site's own API was read on October 5 (votes were still open, closing October 10); the snapshot with every account's final status and exclusion reason is [tech-posters-accounts-2026-10-05.json](tech-posters-accounts-2026-10-05.json). These are dated public views for fictional interviews, not quotations or endorsements. No target coordinates, reasoning scores or desired engine judgments were supplied.

| Ranks 1–100 | Count |
| --- | --: |
| Already simulated (kept their briefs): Musk, kache, roon, Karpathy, bone, Jensen Huang, Teknium, Altman, Beff Jezos, Hassabis, Andrew Curran, janus, Danielle Fong, Ethan Mollick, DHH | 15 |
| Added | 34 |
| Researched and excluded | 51 |

## Method

Nine research agents each took a batch of accounts and followed one shared brief standard: the account's own words only, irony and bait distinguished from stated positions, quoted posts attributed to their authors, pseudonymous accounts described as accounts with no identity speculation, and gaps recorded rather than filled. An account qualified only with at least six inspected sources stating its own views on AI's future; the briefs average about 11.5. Each batch record lists every source with its reading scope:

| Batch | Ranks  | Added | Record                                         |
| ----- | ------ | ----: | ---------------------------------------------- |
| A     | 2–15   |     4 | [tech-posters-a](tech-posters-a-2026-10-05.md) |
| B     | 17–25  |     4 | [tech-posters-b](tech-posters-b-2026-10-05.md) |
| C     | 27–39  |     5 | [tech-posters-c](tech-posters-c-2026-10-05.md) |
| D     | 40–50  |     6 | [tech-posters-d](tech-posters-d-2026-10-05.md) |
| E     | 51–62  |     5 | [tech-posters-e](tech-posters-e-2026-10-05.md) |
| F     | 63–72  |     4 | [tech-posters-f](tech-posters-f-2026-10-05.md) |
| G     | 73–81  |     1 | [tech-posters-g](tech-posters-g-2026-10-05.md) |
| H     | 82–90  |     3 | [tech-posters-h](tech-posters-h-2026-10-05.md) |
| I     | 91–100 |     2 | [tech-posters-i](tech-posters-i-2026-10-05.md) |

X access changed partway through. Several agents first searched X in the logged-in web app; X began rate-limiting the account, so all browsing of X stopped. After that, posts were found through web search, read through X's public embed endpoint (`cdn.syndication.twimg.com/tweet-result`, paced), and read sparingly through the X API until it reported depleted credits. A few long posts and X Articles therefore have unread endings; each batch record lists them under "Needs X access". Where the API ran out before a small account's timeline could be read, its exclusion rests on web search and the embed endpoint; the batch records mark those as borderline.

Exclusions fall into a few kinds: personal or shitposting accounts with too few stated AI views (most of ranks 63–100), slogans without arguments, product, news or leak feeds, a brand account (`@Bot`), a protected account (`@Boardy`), and non-AI accounts. `@NewAgeRetroNerd` was researched and generated but left out: its eight sources come from one week on one theme, too little for a faithful simulation of an AI worldview. Its local run is unselected in the catalog and is not importable.

Portraits are the accounts' current `_400x400` X avatars ([provenance](../../public/personas/SOURCES.md)). Display names drop emoji and decoration. `@Growing_daniel` shows as “Daniel”, as the account presents itself, although 2024 press coverage gives a surname. Named people with a verified Wikipedia article and Wikidata item (Wang, Johnson, Scoble, Mostaque, Sottiaux, Yaccarino) are in `lib/seo/person-identities.json`.

## Public P(doom) statement

One verified first-person statement was found and is recorded in `lib/journeys/public-pdoom-statements.ts`: Emad Mostaque, ≈20%, in his 2026-09-12 X article “Intelligence isn’t a crime”, revised down from the 50% he gave from December 2024 to April 2026. The Moonshots episode he cites was not inspected. Candidates excluded as jokes: Daniel's “p(doom) is zero if you're going to heaven”, tenso's “fuck it we ball” post, and Hensen Juang's “p(outage)”. The “>10%” figure bubble boi reacted to belongs to the researcher it quoted, and the 99.9% in Bryan Johnson's Bankless episode is the host's.

## Generation

The local development database (`localhost`) was confirmed first. Each batch ran as one group with four concurrent interviews:

```sh
pnpm journeys:generate --group=tech-posters-<letter> --turns=5 --max-cost=1.5
```

| Batch | Run | OpenAI / Jev requests | Estimated cost |
| --- | --- | --- | --: |
| A | `1791150295759-dd2f12a0-66a1-4568-b731-943a542fe8f6` | 18 / 110 | $0.39 |
| B | `1791150599670-952b5d64-c09b-430f-8e85-8b48a72af9ab` | 17 / 105 | $0.43 |
| C | `1791150356731-bb9b213c-791d-4e7b-8a14-a1f3f45b6c96` | 20 / 117 | $0.42 |
| D | `1791150656303-83071b20-5ff1-4d90-913e-4a10b7e3f85f` | 24 / 146 | $0.57 |
| E | `1791150730359-8b1ca557-f9e5-4635-9b14-7bcd843bd227` | 23 / 143 | $0.50 |
| F | `1791150427796-421326c3-b856-4e43-9f0f-3581936f9977` | 16 / 99 | $0.33 |
| G | `1791150484515-26c52ac5-21b2-4bff-8670-2e8a2981937d` | 9 / 51 | $0.19 |
| H | `1791150877224-99279aba-9b19-4495-9043-c14a6ae74b01` | 12 / 73 | $0.29 |
| I | `1791150541290-5047b6e6-745a-40a2-8414-a64c440e5575` | 8 / 48 | $0.17 |
| djcows, after a brief fix | `1791151094081-2f271e2d-c367-49c8-8d35-bca51a459f92` | 5 / 28 | $0.07 |
| signulll, after a brief fix | `1791151170292-c7dbacdd-ffa7-4dd8-ba81-b7f66dbacbe8` | 4 / 26 | $0.11 |

In all, 156 GPT-5.6 Sol and 946 Jev requests, an estimated $3.47 (development estimate, not an invoice), including the superseded first runs of djcows and signulll and the left-out NewAgeRetroNerd. Every run completed without a timeout or resume. Engine `0.7.5`, content `0.4.0-draft`, rubric `0.1.0-draft`, evaluator `jev-1.13.0`.

## Fidelity review and placements

Two reviewers read every interview against its brief. None invented a P(doom) number, date, employer or biography, and every pseudonymous account spoke as an account. Two were regenerated after a brief fix:

- **djcows:** its voice line carried “we are completely cooked”, which no source contains; the simulation used it, and the engine read the joke as concern (outlook 13.7, inferred ≈53%). The line was removed, and a belief now says the account has never said whether people keep control. The rerun declines to give odds in character; its P(doom) shows as Unclear.
- **signulll:** answers inflated one flag about memory and data power into inequality and “permanent damage” warnings the account never posted (outlook 50.3). The brief now marks that flag as a product observation. Rerun outlook 85.1.

Outlook (0 catastrophe … 100 flourishing) and transformation are live engine outputs, not validated measurements of the real people. A transformation of 50.0 marks an explicitly unsettled reading, not a midpoint.

| Simulated user | Outlook | Transformation | P(doom) | Note |
| --- | --: | --: | --- | --- |
| tenso (@distributedkv) | 93.1 | 93.8 | ≈6% |  |
| Roy (@usr_bin_roygbiv) | 93.1 | 65.3 | ≈4% | Slurs in the feed are kept out; adds some control reasoning the account never posted |
| Sierra Catalina | 67.2 | 74.7 | ≈5% |  |
| signüll | 85.1 | 88.3 | ≈4% | Regenerated |
| Thibault Sottiaux | 84.6 | 70.1 | ≈4% |  |
| hope hopes hoping | 23.0 | 80.6 | ≈11% | Humor account; answers lightly fill thin risk and jobs evidence |
| Alexandr Wang | 88.9 | 92.4 | ≈14% |  |
| Bryan Johnson | 17.6 | 96.9 | ≈41% | Faithful; the inference looks high beside his “tbd” |
| terminally online engineer (@tekbog) | 67.2 | 53.3 | ≈5% |  |
| X Freeze | 80.1 | 89.8 | ≈15% | Musk's words attributed to Musk |
| Daniel (@Growing_daniel) | 60.1 | 80.1 | ≈3% | One answer calls degraded personhood a permanent catastrophe |
| Lauren Tan | 75.3 | 50.0 | ≈2% | Declines every gap; placement rests on little |
| Jimmy Apples | 88.1 | 74.4 | ≈4% |  |
| VOID | 46.7 | 91.2 | ≈12% | One answer drifts toward catastrophe concern |
| bubble boi | 95.0 | 72.9 | <1% |  |
| Dylan Patel | 61.4 | 87.1 | ≈7% |  |
| Hensen Juang | 91.5 | 89.2 | ≈3% |  |
| Robert Scoble | 94.1 | 87.8 | ≈4% |  |
| Parmita Mishra | 90.3 | 50.4 | ≈3% | Transformation looks underread |
| Pierce Alexander Lilholt | 64.4 | 83.6 | ≈12% |  |
| Bojan Tunguz | 50.9 | 75.4 | ≈7% | Split result, so no outlook claim |
| Suavecito | 94.6 | 59.8 | <1% | Outlook rests on dismissing doom |
| Emad Mostaque | 27.4 | 94.4 | ≈20% stated |  |
| 0xSero | 59.6 | 88.0 | ≈9% | Split result, so no outlook claim |
| djcows | 75.4 | 91.1 | Unclear | Regenerated |
| Rooke Poole | 50.9 | 62.6 | ≈7% |  |
| zek | 88.6 | 91.7 | <1% |  |
| Flowers | 96.3 | 96.2 | ≈5% |  |
| Luana Cantuarias | 74.9 | 66.5 | ≈3% |  |
| Linda Yaccarino | 91.2 | 55.4 | ≈2% | Executive messaging only; no public view on risk |
| shako | 74.1 | 61.2 | ≈6% |  |
| Theo Browne | 40.0 | 78.9 | ≈19% |  |
| kumikumi (@ankkala) | 89.9 | 64.4 | ≈6% |  |
| Jason Kneen | 74.7 | 54.5 | ≈5% |  |

Rounded to the nearest outlook level, the batch adds 13 strongly flourishing, 11 benefit-leaning, 7 mixed and 3 concern-leaning users, and none catastrophe-oriented. That matches the list's audience (builders, accelerationists and lab staff) and leans the catalog further toward optimism, the skew [batch 1](simulated-users-batch-1-2026-10-01.md) was added to offset.

## Coverage limits

Flagged rather than padded: Linda Yaccarino, Lauren Tan and Jason Kneen post almost only about products and practice; djcows, hope hopes hoping and Daniel are mostly comedy with a handful of sincere posts; Hensen Juang, Parmita Mishra and kumikumi's substance comes from one or two weeks; VOID, Rooke Poole and Suavecito are small accounts (under 10,000 followers) with solid material. Each brief's concern names its gaps.

## Verification

On base `dd906de2` plus these changes:

- `pnpm test` passed: format, lint, types, 682 tests, content validation (212 one-liners) and unused-code checks. A new identity test maps every snapshot account to one existing or added user, or a recorded exclusion.
- `pnpm resources:previews` added previews for every new non-X source (919 of 919 current resources have images).
- `/users` and sample profiles rendered on the local dev server with portraits, one-liners, map points and Emad Mostaque's stated P(doom) card.

## Production import (not performed)

Only the local database changed. Importing is a separate, owner-approved step; deploy afterward so portraits, previews and static profiles rebuild.

```sh
IDS=distributedkv,usr_bin_roygbiv,sierracatalina,signulll,thsottiaux,hopes_revenge,alexandr_wang,bryan_johnson,tekbog,xfreeze,growing_daniel,poteto,apples_jimmy,voidstatekate,bubbleboi,dylan522p,basedjensen,scobleizer,parmita,piercelilholt,tunguz,suavecito585,emostaque,0xsero,djcows,rookepoole,zekramu,flowersslop,luacantu,lindayax,shakoistslog,theo,ankkala,jasonkneen
pnpm personas:import plan --env .env.production.local --ids $IDS
pnpm personas:import write --env .env.production.local --ids $IDS
```

Follower counts for the new accounts are not yet in `lib/personas/x-followers.json`; `node --import tsx scripts/refresh-x-followers.ts` adds them once X API credits return.
