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

## LessWrong — AI Risk Skepticism

User-requested inclusion of [AI Risk Skepticism](https://www.lesswrong.com/w/ai-risk-skepticism). On September 30, the wiki definition, editor metadata and initial 15 of 31 tagged-post listings were inspected. Original publication date is unknown; the displayed wiki update is January 17, 2025. Linked essays, reader discussions and remaining listings were not inspected or incorporated as individually read sources.

The [hub snapshot](../../content/releases/0.4.0-draft/references/hub.lesswrong-ai-risk-skepticism.md) is included in the active `0.4.0-draft` corpus with a required intake mapping and title/spelling aliases. Its role is conceptual context and discovery; skeptical arguments must be evaluated individually, and the tag does not establish a shared forecast, policy or level of reasoning quality. This addition does not add a reading recommendation or imply review of the linked collection. Human editorial review remains pending and runtime corpus grounding remains paused.

## LessWrong verification

Verified on the dirty working tree based on `fa3b87a73a378c8bb47ffd0ca54105628f088bda`:

- `pnpm test` passed formatting and lint, then stopped at two existing TypeScript errors in the ignored `work/social-images/takumi-preview.tsx`: the unavailable `loadSiteSocialPoints` import and an implicitly typed callback parameter. That scratch file was not changed by this addition.
- The remaining checks passed separately: `pnpm test:unit` (398 tests across 84 files, 3.68 seconds), `pnpm test:content` (140 active references, 15 resources and 364 intake records) and `pnpm test:unused`.
- Direct loader assertions verified active inclusion, title/spelling alias retrieval, required intake mapping, date scope, absence from historical corpora and matching current/pinned draft manifests. Local Markdown links and the new section anchor passed; `git diff --check` passed. `pnpm content:coverage` regenerated the coverage index.

No browser, database or paid inference checks were needed for this corpus-only addition. No persona or reading-resource changes, regeneration, deployment or publication were performed.

Follow-up at the user's request: repaired the ignored local preview script to load featured summaries through `personaRepository`, pass them to the current `siteSocialPoints` API and close the pool in `finally`. On the same dirty base revision, `pnpm test` then passed formatting, lint, TypeScript, all 398 tests across 84 files (unit duration 3.73 seconds), content validation and unused-code checks. The preview script remains a local ignored file; no application API or TypeScript exclusions changed.
