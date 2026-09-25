# Independent simulated users: deeper source review

Requested follow-up to the [initial 97-user expansion](independent-simulated-users-2026-09-25.md). The initial briefs contained 235 source records: 73 users had two sources, 13 had three, seven had four, three had five and one had seven. This pass seeks stronger opinion evidence, not merely more links.

## Research method

Two independent research batches cover all 97 additions: 49 in batch A and 48 in batch B. Researchers inspect author websites, articles, primary interview transcripts and original X posts. Original posts are retrieved through read-only authenticated X API calls where web access is incomplete, including long-form post text when available. Search terms and inspected scopes are retained in the batch evidence records. Engagement counts are dated observations, not a claim that the selected posts are the author's most popular work ever.

Substantive evidence is kept separate from identity pages, project indexes, episode descriptions and metadata. A person's statement establishes their expressed view, not the truth of an allegation or general validity of a performance claim. Interview hosts and quoted authors retain their own attribution. Published and revised dates are separated where verified; access dates do not make older opinions current. Recent statements are combined with lasting conceptual arguments and explicit revisions.

Briefs preserve disagreements and strong positions where evidenced. A missing policy statement is not a neutral policy stance; a possible outcome is not a median forecast; a technical project is not a personal governance platform. No risk probability is manufactured to obtain a map placement.

## Review and integration

The parent review samples underlying primary texts, checks source attribution and date/claim alignment, and audits all 97 identities, source deltas and recorded access limitations before integration. One early review caught an important forecast distinction: Eli Lifland's August 28 post calls near-term superintelligence plausible, while his AXRP interview gives much later medians and wide tails. The revised brief must preserve both rather than interpret plausibility as a central forecast.

Independent primary-text spot checks include [Gwern's Guardian Angels proposal](https://gwern.net/guardian-angel), [Hanson's explanation of his policy submission](https://www.overcomingbias.com/p/when-they-hear-less-than-you-say), and [Lifland's AXRP transcript](https://axrp.net/episode/2026/08/03/episode-50-eli-lifland-ai-2027.html), including the later forecast-update section. Additional spot checks cover George Hotz’s takeoff argument, Jeremy Howard’s coauthored risk-priority essay, Dalrymple’s speaker-labeled interview, and Lumpenspace’s distinction between biological-human survival and continuing value. Parent research also supplied direct Kylie Robison commentary from her WIRED livestream, personal reporting and self-posted CNN interview, plus Julia Galef’s bounded reasoning statements in her own writing and a Noahpinion interview.

Current source briefs are authoring inputs. Existing generated interviews, results and recorded source snapshots remain immutable. Updating a brief does not retroactively ground an older answer in new evidence. Profile pages distinguish the current brief's sources from the source snapshot used for the saved run.

## Completion evidence

All **97** briefs were revised. Total source records increased **235 → 708** (696 distinct URLs), with **473 newly inspected source URLs** and 11 refreshed existing records. There are 429 X post records and 480 records dated 2026. Source count ranges from 4 to 13; 95 users have at least six. Charles Goddard and Julia Galef have four each with explicit limitations. Galef's available evidence chiefly supports her reasoning approach and historical treatment of AI disagreements, not a current detailed AI platform.

- [Per-user coverage table](independent-deepening-coverage-2026-09-25.md)
- [Batch A: 49 users](independent-deepened-batch-a-2026-09-25.md), with [machine-readable evidence](independent-deepened-evidence-a-2026-09-25.json)
- [Batch B: 48 users](independent-deepened-batch-b-2026-09-25.md), with [machine-readable evidence](independent-deepened-evidence-b-2026-09-25.json)

The canonical source briefs are in `lib/journeys/independent-{first,middle,last}-personas.ts`. Their beliefs, background, voice constraints and concerns were revised alongside source summaries. Identities, source attribution, duplicate-account handling and featured status are preserved. The original generated journey fixture is unchanged; this pass does not regenerate answers or results.

Remaining limits include sparse current policy evidence for some technical builders, unavailable transcripts, and the difference between a personal experiment and a reproduced capability result. Short technical observations and jokes are narrow supplemental evidence, not complete worldviews. Later Jesse Genet X posts were excluded where authorship after a reported account compromise could not be verified. AI-generated text, quoted speakers, namesakes and reporting about others were not adopted as the account owner's personal belief.

## Validation and local synchronization

Validated on the working tree based on `dc92663`:

- `pnpm test`: formatting, lint, types, content validation, Knip and all 283 tests passed.
- `pnpm db:test:personas`: import idempotence, provenance, publication validation and ordering passed.
- `pnpm check:persistence tests/persistence/personas.spec.ts`: the database-backed profile browser case passed.
- Catalog audit: all 97 identities and unfeatured flags preserved; no repeated source URLs within a brief. All 428 dated X post records agree with their post-ID UTC dates within one day.
- Local metadata synchronization updated 97 profiles. All 141 selected assessment results and the 44 featured profiles were unchanged; stored current briefs match the authored catalog.
- `git diff --check` passed, and the generated journey fixture has no changes.

No inference regeneration or deployment was performed in this source-deepening pass.
