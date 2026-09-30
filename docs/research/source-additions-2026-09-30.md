# Source additions — September 30, 2026

## Scott Sumner — Wanna bet?

User-requested corpus inclusion of [Wanna bet?](https://scottsumner.substack.com/p/wanna-bet), published September 23, 2026. The complete public essay, all nine numbered sections and postscript were read on September 30. Reader comments are not attributed to the author; linked publications were not independently verified for this intake. No material revision date was established.

The [publication snapshot](../../content/releases/0.4.0-draft/references/publication.sumner-wanna-bet-2026.md) preserves attributed arguments and access limits. It is included in the active `0.4.0-draft` corpus, mapped from the required intake record and linked by `resource.sumner-wanna-bet`. Title and author aliases support retrieval; the reading resource uses topic eligibility without a required score or outlook. The source-coverage index is regenerated from these records.

This is a local draft addition, not human editorial approval or a frozen release. Runtime corpus grounding remains paused. No persona, saved assessment or historical release is changed.

## Verification

Verified on the dirty working tree based on `088eee49121b9e244810c0bdc5540501ecee625d`:

- `pnpm test` passed formatting, lint, types, all 388 tests across 83 files, content validation and unused-code checks. The unit portion took 4.72 seconds. Content validation reports 139 active references, 15 resources and 363 intake records.
- Direct loader assertions confirmed title, author, alias and shared `forecast` topic retrieval, the required intake mapping, the linked resource and absence from earlier corpora. Local Markdown links and `git diff --check` passed.
- `pnpm journeys:mechanical --write-baseline` regenerated all ten credential-free fixture cases. Comparing the parsed baseline confirmed unchanged interview paths and assessment values; only the third reading recommendation changed for `worried-novice` and `playful-recovery`, alongside generated timestamps, version and hashes.
- `pnpm resources:previews --url=https://scottsumner.substack.com/p/wanna-bet --concurrency=1` cached publisher artwork and an icon; the roulette image was visually inspected. `pnpm content:coverage` regenerated the source index.

No browser or database checks were needed for this content addition. No paid inference, persona regeneration, deployment or publication was performed.
