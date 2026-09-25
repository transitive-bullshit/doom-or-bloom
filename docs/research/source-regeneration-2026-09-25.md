# Source-driven simulation regeneration — September 25, 2026

The user authorized local regeneration after source additions, corrections and discovery-list removals. Compared current authored generation inputs with each selected database run's recorded persona snapshot. Material fields included sources, beliefs, background, voice, concern, familiarity, response style, proxy and sourced P(doom). Follower counts and bookmark image metadata are not generation inputs.

## Scope

103 of 141 selected simulations differed: all 97 Independent additions, plus Tyler Cowen, Sam Altman, Demis Hassabis, Ilya Sutskever, Andrej Karpathy and Max Tegmark. The other 38 selected users are outside the rerun. The saved development collection additionally includes 11 non-public development journeys, also outside this scope.

Run the existing live OpenAI participant and Jev interview pipeline, without target scores, desired placements or modified routing. Four concurrent interviews per batch, up to twelve questions each. Four batches of 26, 26, 26 and 25 users each have a $5 estimated-cost ceiling and 1,536 Jev-request ceiling. New successful simulations receive new immutable assessment IDs and become locally selected results; old public snapshots remain accessible.

## Interruption handling

The first two batches completed with 52 successful results. The process was interrupted at the start of batch three. Before restarting, checked that no generation process remained, then reconciled database selected IDs against the initial audit: 51 users remained unchanged. Only those 51 were restarted; none of the 52 completed users were rerun. In-flight requests from the interrupted process may have incurred cost not recorded by its unfinished aggregate report; completed-batch usage must not be represented as total billed spend.

## Artifact recovery

All 26 users in the restarted third batch published successfully to Postgres, but saving the combined local diagnostic artifact exceeded its 256 MB bound. The database results were unaffected. Rebuilt that batch's development records from the exact published journey and final assessment snapshots, retaining original run provenance. Provider transport traces and participant exchange envelopes from the unsaved batch are unavailable; no synthetic usage totals or envelopes were manufactured. The recovered batch has null request metadata and no aggregate cost report.

Local diagnostic serialization now omits pretty-printing whitespace while retaining every field. The read/write bounds remain unchanged; the checked-in development fixture remains formatted and excludes transport traces as before. The store round-trip regression verifies lossless compact serialization. Reconciled selected IDs again and ran only the final 25 users.

## Completion

All **103** affected users have successful new selected results using current source briefs. Exact canonical comparisons verified that all **141** previous published snapshots remain unchanged, all **38** unaffected selected users retain the same assessment IDs and payloads, and all **44** featured flags are preserved. The development collection contains **152** journeys; its **49** untouched records (38 public plus 11 development-only) are unchanged.

| Example      | Doom–Bloom before | After | Displayed P(doom) after |
| ------------ | ----------------: | ----: | ----------------------- |
| Robin Hanson |              62.5 |  74.3 | Inferred <1%            |
| Robert Miles |              49.3 |  26.0 | Inferred ≈11%           |
| swyx         |              74.3 |  54.8 | Inferred ≈1%            |

These are observed model outputs, not real-person quotations or desired coordinates. Doom–Bloom and P(doom) are distinct projections. Miles's new estimate still comes from the simulated answers and current inference transform; his source's broad 10–90% discussion was not converted into a precise public override. The existing routing and P(doom) algorithm were not changed during this rerun.

[Machine-readable results and batch provenance](source-regeneration-results-2026-09-25.json) record previous/new assessment IDs and all source counts. Three batches retained aggregate usage reports totaling an estimated **$2.9619** (196 participant requests and 896 Jev requests). This excludes the recovered third batch and any in-flight requests at interruption, so it is not a complete billed total. Each batch remained bounded by its configured $5 ceiling; no complete cost total is manufactured.

The previous four batch IDs and new immutable simulation URLs remain associated with their original inputs. No production database or deployment was changed.

## Validation

Source-snapshot equality, all previous public payload hashes, untouched selected IDs/payloads and unchanged fixture records were checked directly against the native local database and pre-run collection. Persona database checks and the selected-profile browser case passed. `pnpm test` passed all 288 tests plus formatting, lint, types, content and unused-code checks, including lossless compact diagnostic serialization. Local Hanson, Miles and swyx profiles and the 141-user directory were checked after selection. No algorithm or scoring changes were made.
