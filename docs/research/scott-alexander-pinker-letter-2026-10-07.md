# Scott Alexander — Pinker letter and regenerated simulation

Added the requested [An Open Letter To Steven Pinker On AI](https://www.astralcodexten.com/p/an-open-letter-to-steven-pinker-on) to Scott Alexander’s `rationalist-safety-advocate` brief, starting from freshly fetched `origin/main` at `28e8ff52`. All 13 previous sources remain.

## Source scope

Read the full publisher HTML on October 7, 2026, including its embedded article body and publication metadata. The publisher timestamp is `2026-10-06T21:23:06.574Z`, so source records use October 6. Direct web-tool opening failed; a direct publisher retrieval succeeded without an access gap. Attribute Alexander’s own arguments only. Pinker’s quoted objections, other people’s numerical forecasts, linked studies and incident reports are not independently verified findings. The dueling rhetoric is satire, not a policy proposal.

The letter adds distinctions between instrumental goals, misgeneralization and reward hacking; bounded superintelligence and omnipotence; plural goals and human-compatible goals; and infrastructure access driven by adoption incentives. It supports cooperation on near-term harms, subjective forecasting and precaution about possible model welfare, without establishing model consciousness. Its closing vision favors giving alignment scientists time and resources to reach safe superintelligence over banning smarter-than-human AI forever.

## Public P(doom)

The letter describes Alexander’s previously stated personal extinction judgment as approximately 25–30%. This is the latest inspected self-report, replacing the June rounded 20% as the current display source. It supplies no fixed calendar horizon, new policy conditions or explanation for the discrepancy, so do not claim a measured increase or attribute it to a particular event. Preserve the range without inventing a point estimate. Keep extinction separate from broader permanent curtailment and from AI 2027’s coauthored scenario.

Updated the current public-statement override, its P(doom) hub source/order, and the two blog charts that mechanically track these current statements. The June essay remains in the brief as historical context. Existing public quote cards remain unchanged.

## Regeneration and local persistence

Verified `.env.development.local` targets loopback PostgreSQL database `doom_bloom_dev`. Ran `pnpm journeys:generate --persona=rationalist-safety-advocate --max-cost=2`.

- Run: `1791356861543-6f24e3db-d186-4fcd-9163-292cf93469c6`.
- Selected local assessment: `329c7ddd-3f9d-40be-939a-a2ad0a8c353f`, payload `simulation_v1`, engine `0.7.5`.
- Snapshot digest: `be0cf4b1470aabffd72659b0dfb7db79df1f7d8c4db2b51f7a11deee6ba45eb2`.
- Four accepted answers, four saved per-answer results, 97.33% readiness, automatic stopping and no error.
- Four OpenAI replies and 26 Jev requests, estimated generation cost `$0.099735712` against the $2 cap.
- Simulated outlook `0.32875`, expected transformation `0.938125`, public-statement P(doom) `25–30%`. These coordinates describe the generated answers, not independently established properties of Alexander.

Reviewed all questions and answers against the brief. They preserve transformative upside, serious risk without inevitability, the 2034 median knowledge-work capability forecast, alignment work and verifiable slowing, adoption/access mechanisms and opposition to a permanent ban. The final answer’s detailed proposed alignment test is fictional elaboration from the brief, not an authenticated Alexander quote.

Only `slatestarcodex` changed selected assessment in the local database. The previous assessment `c5ceb0fc-7b1e-4568-add2-408809b42ecd` remains intact. The selected snapshot contains all 14 sources and the new public range.

Refreshed only Scott’s benchmark R2/R3 references and copied R4 with `pnpm benchmark:refs --only=r2,r3,r4 --personas=rationalist-safety-advocate --max-cost=1 --allow-paid`, at an estimated $0.06. Other personas’ references retain their prior provenance. The new judge readings place outlook at 0.48, and self-readings at 0.55; the interview engine’s 0.32875 is a different reading, not a reason to tune the brief toward a preferred coordinate.

## Verification

- `pnpm resources:previews --url=https://www.astralcodexten.com/p/an-open-letter-to-steven-pinker-on` fetched the publisher social image and favicon; the image was visually inspected.
- `pnpm test` passed: formatting, lint, types, 120 test files / 743 tests, content validation and unused-code checks. Initial checks caught stale benchmark/chart/hub references; those were synchronized before the passing run.
- Checked selected-run provenance, source presence, public range, old-run retention and all other local persona selections directly against Postgres.
- Browser-verified `/users/slatestarcodex` locally: the new source card, sourced 25–30% range, outlook 33 / transformation 94, and all four expanded interview answers render. The first server launch rejected a shared dependency symlink; installing this worktree’s locked dependencies from the local pnpm cache resolved it without application changes.

## Authorized production publication

On October 7, the owner requested deployment and any necessary production database update. `pnpm personas:import plan/write --env <private production file> --ids slatestarcodex` published only Scott’s regenerated simulation, without inference or schema changes. Production selected assessment `cfc69c80-47ba-465d-8608-f9cad9dd3311` has the exact local snapshot digest recorded above and the Pinker source. The previous production assessment `311511ba-0669-4959-a400-789b5edb9817` and its original digest remain intact. A before/after hash of metadata, briefs, selections and selected digests for the other 212 profiles is unchanged; the catalog still contains 213 profiles.

The associated release also cites Scott Alexander’s defense of subjective probabilities and Arvind Narayanan and Sayash Kapoor’s policy critique in the P(doom) explainer and leaders comparison, with a link from the polls post. The local production build passed its static-profile and bundled-asset checks. Deployment status is verified separately after the release reaches `main`.

Release verification uses a fresh native `doom_scott_release_20261007_test` database: the shared test database had newer retained selections than this checkout’s local fixture collection. All database checks, repeated migrations and restart recovery passed in the isolated database. The full browser suite passed 107 cases and exposed one asynchronous request-observation race in the paperclip test. Replaced its immediate array assertions with polling assertions; both paperclip cases then passed, with application behavior unchanged. The original failure trace was retained locally.

The remaining release suites passed: persistence 9, analytics 4, prefetch 13 and public cache 2. Addressed automated review by preserving range-only P(doom) values in benchmark serialization and including them in shown counts, signed/absolute error and paired within-2× comparisons. Range error measures compatibility with the reference, using zero inside the range and the nearest endpoint outside it; retest variability still uses point estimates. Added regression checks for Scott’s actual public statement and interval scoring. Final `pnpm test` passed 121 files / 746 tests, with format, lint, types, content validation and unused-code checks.
