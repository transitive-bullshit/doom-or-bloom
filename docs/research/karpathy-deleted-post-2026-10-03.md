# Karpathy's deleted frontier-pacing post and Anthropic role — October 3, 2026

Work against `26e04c64`. Travis approved the production import and deployment after the local review.

## What changed

- **Removed** the September 21 Reuters source from `hands-on-agent-builder`. Its only Karpathy content was a quotation from his September 12 X post backing Dario Amodei's frontier-pacing essay, and that post is no longer on X.
- **Added** his [October 2 post](https://x.com/karpathy/status/2105819303471976479) on understanding model outputs, his most substantive post since then.
- **Added** his May 19 post announcing that he joined Anthropic, at Travis's request, with a voice line that he doesn't speak for the company. His one-liner now names Anthropic.
- **Regenerated** his journey with one bounded live run after both changes.

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
- His May 19 post, “Personal update: I've joined Anthropic.”, was missing from the brief. See below.

## Anthropic role

His [May 19 post](https://x.com/karpathy/status/2056753169888334312), verified through the X API, says he joined Anthropic to get back to R&D, that “the next few years at the frontier of LLMs will be especially formative” and that he plans to resume his education work in time. Travis confirmed he works there now.

- **Brief**: the post is a source, and the background says he joined in May 2026 and remains passionate about education. A voice line says he works at Anthropic but doesn't speak for it, and blocks attributing company positions, policy proposals or colleagues' views to him without his own sources. Employment is not evidence of his view on any company proposal, including the frontier-pacing essay above.
- **One-liner**: “Anthropic researcher and educator who builds with AI agents and writes about their rapid, uneven progress and the gap between demos and reliable work.” Naming the organization follows the one-liner rule, since the brief now states it. “Rapid but uneven” became “rapid, uneven” to stay within 150 characters.
- His June 9 post on a Claude model release was read but not added. It is mostly about his employer's product, and his capability views are already covered by April–October sources.

## Regenerated run

`pnpm journeys:generate --persona=hands-on-agent-builder --turns=12 --max-requests=60 --max-cost=1`, the settings of his September 25 regeneration, with the root `.env.development.local`. The database was verified as `localhost`/`doom_bloom_dev` first.

Two runs, about $0.20 together (harness estimates, not invoices). Both used participant `gpt-5.6-sol`, engine 0.7.4, content 0.4.0-draft and `jev-1.13.0`, with 5 OpenAI and 27 Jev requests under a $1 cap.

- **Without the role** (superseded): run `1790978538193-95c981c3-dccc-49aa-8ec6-03ce8fbfeb59`, $0.101, readiness 95.9%.
- **Final**: run `1790979452285-6eee64e1-72c6-4638-9ec9-840c1bb83917`, $0.099, local assessment `ab52fd29-a646-44c1-a6ff-c4f0ddb37b68`, digest `d2e4ffe2bfae0d9169691cbadbe084cd1df07fc965fbad9004ace9e4c2750ad0`. Five accepted answers: root, eventual scale, catastrophe chance, institutional response and what would change his view. The engine stopped automatically at 94.3% readiness.

|  | Production (September 28) | Without the role | Final |
| --- | --: | --: | --: |
| Answers | 3 | 5 | 5 |
| Outlook | 75/100 | 75/100 | 75/100 |
| Transformation | 57/100 | 63/100 | 64/100 |
| Human influence | 56/100 | 51/100 | 55/100 |
| P(doom), inferred | ≈4% (2–9%) | ≈6% (3–12%) | ≈5% (2–10%) |

Production's run is the engine 0.7.1 re-evaluation of the September 25 answers. The outlook did not change. The other shifts come with questions the September interview never received: the direct scale question that engine 0.7.0 added, a catastrophe question and an institutions question. The engine version differs too, so they can't be credited to the source change. In both new runs the simulation declines to give a catastrophe percentage; the figures are inferred from its answers. The two new runs differ only slightly; one run each can't separate the role's effect from ordinary run-to-run variation.

Fidelity review of the final answers against the brief:

- None mentions Amodei, frontier pacing, industry coordination or Anthropic, and none states a company position.
- The opening answer paraphrases the October 2 post: agents do more of the legwork while we move up into oversight and understanding.
- On institutions it expects caution mixed with competitive pressure and says it has no “specific policy blueprint to offer”. The run without the role had instead predicted more regulation and outside scrutiny, which no source supports.
- “Probably at the level of a new computing paradigm” is generated magnitude language, in line with the brief's enthusiasm but not quoted from it.

## Verification

- For the run without the role, `/user-journeys` and `/users/karpathy` on the local dev server showed five answers and seven sources, with no Reuters link and the October 2 post embedded. The final run was checked in the local database: eight sources in brief and snapshot, five answers.
- `pnpm resources:previews`: no Karpathy preview needed. X posts use the tweet presentation.
- `pnpm personas:import plan --env <production settings> --ids karpathy` reported `karpathy: new selected run` before the write.

## Production

Profile sources come from the database brief, so production's profile changes only on import; a deploy then rebuilds static profiles and previews. Travis approved both.

```sh
pnpm personas:import write --env .env.production.local --ids karpathy
```

The write ran from this branch after merging `main` at `1d088e10`, where `pnpm test` passed (614 tests). It reported `karpathy: new selected run; verified selected digest`. No inference or migration was needed. A read-only comparison found local and production identical in selected digest, source brief and complete simulation payload, with the new one-liner.

- Production assessment: `b91beff3-c84d-4358-93ab-14da9076f79b`, public, origin `simulation`.
- Selected digest: `d2e4ffe2bfae0d9169691cbadbe084cd1df07fc965fbad9004ace9e4c2750ad0`.
- The September 28 run and its earlier answers stay at their own URLs.
