# Karpathy's deleted frontier-pacing post — October 3, 2026

Local work against `26e04c64`. Production was read but not written; the import below waits for Travis's approval.

## What changed

- **Removed** the September 21 Reuters source from `hands-on-agent-builder`. Its only Karpathy content was a quotation from his September 12 X post backing Dario Amodei's frontier-pacing essay, and that post is no longer on X.
- **Added** his [October 2 post](https://x.com/karpathy/status/2105819303471976479) on understanding model outputs, his most substantive post since then.
- **Regenerated** his journey locally with one bounded live run. Production still selects the September run.

The brief now has no source on his views about frontier governance. That is a research gap: the deletion does not show that he dropped or kept the view, so the brief asserts neither.

## The deleted post

[Status 2098811935114551617](https://x.com/karpathy/status/2098811935114551617) dates from 2026-09-12 16:32 UTC by its ID. Reuters quoted it as “I love this and really hope we can come together as an industry and make it happen,” posted “while sharing a screenshot of Amodei's essay.” The quotation was verified in the [Investing.com syndication](https://www.investing.com/news/stock-market-news/factboxtech-leaders-governments-split-over-ai-doom-fears-4908878) on September 23 and again today; the canonical Reuters page blocks the reader.

Checked on October 3:

- The X API v2 lookup returns “Could not find post with id”. The logged-out status page says the page doesn't exist.
- The account is active, and his September 12 replies at 14:15, 14:32 and 17:37 UTC are still on his timeline; this post is not.
- Travis reported that X labels it deleted by its author. A logged-out check can't see that label, but the evidence above is consistent with it.

## Where it was cited

| Location | Citation | Change |
| --- | --- | --- |
| `lib/journeys/foundational-public-personas.ts` | Reuters source with the quotation | Removed |
| [Karpathy source additions](karpathy-source-additions-2026-09-23.md) | Records adding it | Dated note pointing here |
| `lib/sharing/resource-previews.json` | Reuters bookmark preview | Kept. The preview script retains entries, and his earlier runs still list the source |
| Earlier saved runs | Source snapshots of the September 25 local run and production's September 28 re-evaluation | Unchanged; saved runs are immutable |
| `public/personas/SOURCES.md` | Portrait provenance only | None needed |
| `content/source-intake.json` | No entry for the post or the article | None needed |

## How much his simulation depended on it

It was one of seven sources. No belief, background or voice line referred to it, but it was the brief's only source on frontier coordination. In the three answers production shows, one clause echoes it, closing the overall-impact answer: the net result should be positive “if we do the unglamorous work … and coordinate responsibly around frontier development.” Nothing else in his answers depends on it. The footprint is small, but leaving it would keep a statement he removed in his public profile and answers.

## Newer statements checked

His timeline from September 1 to October 3 (X API, reposts excluded) and his blog index, whose latest post is April 30.

- Nothing restates, replaces or contradicts the endorsement.
- September 21 reply to Max Leiter: “So ready to do my part in pacing the frontier 🫡”. It answers a post about not starting a video game, so it is a joke, not a policy statement. Not added.
- September 25 reply on AGI and ASI terminology: not substantive. Not added.
- October 2 post: added, with the quotation “a lot more of our work will rise up the abstractions into oversight and understanding.”
- Out of scope: his May 19 post says “Personal update: I've joined Anthropic.” The brief doesn't mention his employer. Adding it would also change the simulation, so it is left for a separate review.

## Regenerated run

`pnpm journeys:generate --persona=hands-on-agent-builder --turns=12 --max-requests=60 --max-cost=1`, the settings of his September 25 regeneration, with the root `.env.development.local`. The database was verified as `localhost`/`doom_bloom_dev` first.

- Run `1790978538193-95c981c3-dccc-49aa-8ec6-03ce8fbfeb59`; local assessment `b98187c7-9aae-43a0-8d67-877c80dbd0ee`, digest `83c45370efc13ee407b01eaa169ab277d6db6bf97c573e80805943fabb9ff70b`.
- Participant `gpt-5.6-sol`; engine 0.7.4, content 0.4.0-draft, `jev-1.13.0`.
- Five accepted answers: root, eventual scale, catastrophe chance, institutional response and what would change his view. The engine stopped automatically at 95.9% readiness.
- Estimated $0.101: 5 OpenAI and 27 Jev requests, under a $1 cap. This is the harness estimate, not an invoice.

|                   | Production (September 28) | New local run |
| ----------------- | ------------------------: | ------------: |
| Answers           |                         3 |             5 |
| Outlook           |                    75/100 |        75/100 |
| Transformation    |                    57/100 |        63/100 |
| Human influence   |                    56/100 |        51/100 |
| P(doom), inferred |                ≈4% (2–9%) |   ≈6% (3–12%) |

Production's run is the engine 0.7.1 re-evaluation of the September 25 answers. The outlook did not change. The other shifts come with questions the September interview never received: the direct scale question that engine 0.7.0 added, a catastrophe question and an institutions question. The engine version differs too, so they can't be credited to the source change. Asked for a catastrophe chance, the simulation declines to give a percentage; ≈6% is inferred from its answers.

Fidelity review of the five answers against the brief:

- None mentions Amodei, frontier pacing or industry coordination.
- The opening answer paraphrases the October 2 post: more work rising into oversight and understanding while agents do more of the legwork.
- The institutions answer expects voluntary restraint alone not to “carry the entire burden” and external scrutiny, standards, incident reporting and regulation to matter more. That is generated; no source in the brief covers his governance views.
- “Enormously—probably on the scale of a major computing transition” is generated magnitude language, in line with the brief's enthusiasm but not quoted from it.

## Verification

- `/user-journeys` and `/users/karpathy` on the local dev server show the five answers, the result and seven sources: no Reuters link, and the October 2 post embedded.
- `pnpm resources:previews`: 776 URLs, none missing.
- `pnpm personas:import plan --env <production settings> --ids karpathy` reports `karpathy: new selected run`. Nothing was written.

## Production

Not imported. After approval, from a checkout with the local run:

```sh
pnpm personas:import write --env .env.production.local --ids karpathy
```

Profile sources come from the database brief, so production's profile changes only on import. Deploy afterwards so static profiles and previews rebuild.
