# Tech posters' public statements — October 6, 2026

Travis asked for “What <Name> has said about AI” to become a default part of adding a person, but only when the quotes are especially relevant, and for the section to be added for the [top tech posters cohort](tech-posters-2026-10-05.md) and [Drew Spartz](ai-species-persona-2026-10-05.md). [user-journeys.md](../user-journeys.md#public-statements) now says so. Of the 35 people, 29 got a section and 6 were skipped because fewer than three of their statements cleared the bar.

## Method

Five agents each took seven people and followed one brief:

- **The bar.** At least three quotes, each a substantive statement of the person's own view on AI and its future. Launches, jokes, irony, bait, slogans and one-word reactions don't count. Together the quotes should be a sample the person would accept as fair.
- **Exact words.** Only the person's own posts, essays, transcript turns or an outlet's direct quote from its own interview. Each quote was checked character for character against text the agent fetched and trimmed only at sentence or clause boundaries.
- **X access.** Read-only and anonymous: the local archive, X's public embed endpoint and FxTwitter's public status and search endpoints, with pauses between calls. No browser, no xurl and no bird calls.
- **Video.** Auto-generated YouTube captions don't count as verified words. Spartz's three video quotes come from his creator-uploaded caption tracks, inside the narration ranges of his brief.
- **Excluded.** No P(doom) numbers.

X dates are UTC, so a few fall a day later than US Pacific time. Each statement's URL is in its `content/profiles/<slug>.json`.

## Included

| Person | Quotes | Sources |
| --- | --: | --- |
| 0xSero | 5 | X post, X article “Open Source must win” |
| Drew Spartz | 5 | Species videos (creator captions), X replies |
| Alexandr Wang | 5 | X, YC Startup School, The Economic Times, Semafor |
| kumikumi | 4 | X |
| Jimmy Apples | 5 | X |
| Hensen Juang | 5 | X |
| Bryan Johnson | 5 | X, his Substack essays |
| bubble boi | 5 | X |
| tenso | 4 | X |
| Dylan Patel | 5 | X, Dwarkesh Podcast, Lex Fridman Podcast |
| Emad Mostaque | 5 | X, his X essays, TechBBQ talk via Trending Topics |
| Flowers | 5 | X |
| hope hopes hoping | 5 | X |
| Luana Cantuarias | 4 | X |
| Parmita Mishra | 5 | X |
| Pierce Alexander Lilholt | 5 | X |
| Rooke Poole | 5 | X |
| Robert Scoble | 5 | X |
| shako | 4 | X, his Substack essays |
| signüll | 5 | X, the account's Substack essays |
| Sierra Catalina | 5 | X, her X articles, LinkedIn |
| Suavecito | 5 | X |
| terminally online engineer | 4 | X |
| Theo Browne | 5 | X |
| Thibault Sottiaux | 5 | Every's AI & I podcast, Cerebral Valley interview |
| Bojan Tunguz | 5 | X, New York Post interview |
| VOID | 5 | X |
| X Freeze | 3 | X |
| zek | 5 | X |

## Skipped

| Person | Why |
| --- | --- |
| Linda Yaccarino | Her statements are company messaging for X, xAI or eMed. Her only remark on AI harms is a 2024 corporate statement on election deepfakes. |
| Daniel (@growing_daniel) | One sincere view, on machine consciousness. The rest is comedy or half-jokes, and one light anecdote names a private friend. |
| Lauren Tan | Her posts are about engineering practice and her products. Only one line comes close to a view on AI's future. |
| Roy (@usr_bin_roygbiv) | Two borderline substantive posts. The rest is career tips, hype, parody and a post with a slur. |
| djcows | Every AI post is a one-line quip ending in a punchline. |
| Jason Kneen | Two qualifying posts. The rest is launches, complaints and sarcasm, and his 2024 LinkedIn lines are generic slogans. |

## Judgment calls

- **Wang.** His January 2025 Semafor line “Safety is not the number one goal” stays as dated context for the change of view his brief documents. The summary mentions the change.
- **Mostaque.** Two quotes come from Trending Topics' report of his TechBBQ talk, which quotes him directly. The talk date isn't given, so the article date is used.
- **Patel.** One post keeps his own typo, “is a ultimately wishful thinking”. The Latent Space transcript wasn't used because it is raw speech-to-text.
- **Bryan Johnson.** His Substack's address spells his name with a zero (`bryanjohns0n`). It is his: Substack's own X account links the address in a reply to @bryan_johnson, and his brief already relies on it.
- **Lilholt.** His bio says his posts are “AI-forged”. The quotes are aphorisms he publishes as his own.
- **hope hopes hoping.** One quote keeps the account's unusual spacing around punctuation.
- **bubble boi.** “Ai can’t kill every human on earth” comes from a post that also has a slur and insults; the quote excludes them. Another quote keeps “fuck man”, consistent with keeping simulated users' real voice.
- **X Freeze.** Most posts react to Musk. The quotes keep only the account's own framing, and one line that may restate Musk was dropped.
- **Pseudonymous accounts.** Summaries name them by display name. When that name is lowercase, the summary says “The tenso account …”, because a summary must start with a capital.

The coordinator review dropped three quotes and changed one summary:

- Dropped a Shako post that needed its hiring context, and an X Freeze post about shopping agents.
- Trimmed a context-free first sentence from a Scoble post.
- Rewrote Flowers' summary so it doesn't call them “it”.

## Verification

- `validate-content` validated all 78 registered public statement files.
- `pnpm test` passed: 114 test files and 685 tests, plus formatting, lint, types, content validation and unused-code checks.
- The sections are static content and ship with the deploy. No production data changes.
