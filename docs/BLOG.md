# Blog

The blog publishes plain-language posts about P(doom), AI worldviews and the ideas behind Doom or Bloom at `/blog`. This document owns how posts are written, rendered, translated and charted, and the rules for publishing participant data. [SEO.md](SEO.md) owns titles, structured data and crawl files.

## Writing a post

A post is one MDX file, `content/blog/<slug>.mdx`. The file name is the URL slug: lowercase words joined by hyphens. Keep slugs free of numbers that change, such as participant counts.

```mdx
---
title: What is P(doom)?
description: One or two sentences for search results, social cards and the blog index.
date: 2026-10-01
updated: 2026-11-15 # optional
---

import statements from './data/public-pdoom-statements.json'

Opening paragraph…

## A section heading

<DataRanges data={statements} />
```

- Frontmatter is validated by `postFrontmatterSchema` (`lib/blog/schema.ts`): `title` without a trailing period, a `description` of 50–200 characters, `date` and an optional `updated` (YYYY-MM-DD). The author is the site creator.
- Headings never end with a period. `pnpm test:content` and the unit tests fail on one. List items, chart titles, labels and captions have no trailing period either.
- Write in a plain, candid voice without hype. Personas are "thought leaders"; the interview takes "about 3 minutes". Say when a number is inferred, and call simulated thought leaders simulated, without foregrounding disclaimers: a line in the methods section is enough. Summarize a real person's views conservatively, and quote only their exact words.
- Use typographic quotes and apostrophes, like the rest of the site's copy. In MDX, write a literal `<` before a digit or space as `\<`.
- Link to site pages with root-relative URLs (`[the P(doom) table](/p-doom)`); they keep the reader's language prefix. Other links open in a new tab.
- Write people's full names. The first mention of anyone with a published profile in each paragraph, list item or table cell links to their profile automatically ([SEO.md](SEO.md#internal-links)). Names in headings, links and bold or italic text stay as written, and single-word names (Roon, Aella) need an explicit link such as `[Roon](/users/tszzl)`.
- Reading time is computed from the prose (230 words a minute); you do not set it.
- Every post renders with the shared reading column, a byline, its `BlogPosting` structured data, a Takumi social card at `/blog/<slug>/opengraph-image` and a closing assessment CTA. The card (`lib/sharing/blog-social-card.tsx`) is the post's header on a page laid over the landing map's Prism field: the Doom or Bloom › Blog breadcrumb, the title at the largest size whose balanced lines fit, and the byline with date and reading time. Its URL's `v` hashes the title, date and reading time; bump `blogCardRevision` when the design or its labels change. The newest post comes first on the index and in the feed.

Check a post with `pnpm dev`, then run `pnpm test`, `pnpm check:browser tests/browser/seo.spec.ts` and, before release, `pnpm build:local` and `pnpm check:prefetch`.

## Rendering

Posts are compiled by `@next/mdx` (configured in `next.config.ts`, with `remark-frontmatter` to keep the YAML out of the page and `remark-gfm` for tables). `mdx-components.tsx` maps elements and data components (`components/blog/mdx.tsx`); a post's page binds the charts to the post's language and the profile links (`postComponents`). `lib/blog/posts.ts` reads the frontmatter with gray-matter for the index, metadata, sitemap, llms.txt and RSS feed.

Posts change only with a deployment. The index and every post are generated at build in every locale; unknown slugs are 404s. The feed (`/blog/rss.xml`, summaries only) and the post cards are generated once at build. The sitemap and llms.txt regenerate every 48 hours and bundle `content/blog/*.mdx` (the sitemap also bundles translations); `scripts/check-production-traces.mjs` asserts all of this.

## Languages

A post is English, or translated into every enabled locale; never some of them. Translations are committed and machine-made like other authored content ([INTERNATIONALIZATION.md](INTERNATIONALIZATION.md#authored-content)):

```
content/l10n/<code>/blog/<slug>.mdx          # title, description and body
content/l10n/<code>/blog/data/<file>.json     # the text of each chart the post imports
content/l10n/<code>/blog/meta.json            # provenance: the English hash, model, date and review status per file
```

- A translation keeps the English post's import lines, components, site links and heading levels, and its data files keep every number; only text a reader sees changes (`lib/blog/l10n.ts`). Dates, the author and the slug come from the English.
- `pnpm test:content` fails when a post is translated into only some locales, a translation is stale (its English changed), or its structure differs from the English (`lib/blog/translation-check.ts`).
- `pnpm l10n:translate --locale=<code> --scope=blog --post=<slug> --allow-paid --max-cost=<usd>` starts a post's translation; after that, `--only-stale` keeps it current with the rest of the locale ([translation tooling](INTERNATIONALIZATION.md#translation-tooling)). Use `--concurrency=2` with a small cap: each call reserves its worst case against the cap. Read a sample back before committing.
- Charts take their labels from the translated data file and their chrome (the "As of" line, "Fewer than 10", axis poles) from `BlogCharts` and `Map` in the post's language.

A translated post renders its translation in each locale, with `lang` on its title and body. It canonicalizes to itself, lists every locale as an hreflang alternate, and advertises a card in its language at `/<code>/blog/<slug>/opengraph-image` (`app/[locale]/(site)/blog/[slug]/opengraph-image`), set in Inter Tight with the share cards' Noto fonts for Hindi, Thai, Chinese and Japanese letters. Its `BlogPosting` gives the locale URL, `inLanguage` and `translationOfWork`. The sitemap lists every locale URL of a translated post with its alternates.

An English-only post serves the same English body in every locale under translated chrome (header, footer, breadcrumbs, byline and a "This post is written in English" note) rather than redirecting: a remembered language sends unprefixed URLs to `/<code>/…`, so a redirect back to English would loop. Those pages are noindex and canonicalize to the English post, like other English-bodied pages ([INTERNATIONALIZATION.md](INTERNATIONALIZATION.md#search-metadata)). The index lists each post in the reader's language where it is translated, and marks the others "In English".

The feed and llms.txt stay English.

## Data components

Charts render from committed JSON in `content/blog/data/`. A post imports the file and passes it to a component, which validates it with `blogDataSchema` when the page builds:

| Component | Data (`kind`) | Renders |
| --- | --- | --- |
| `<DataRanges data={…} />` | `ranges`: rows with a `label`, a `token` as written ("10–20%"), `low` and `high` probabilities, an optional `note` and source `href` | A table with one range bar per row on a 0–100% scale. A label naming someone with a profile links to it; `href` records the number’s source, which the chart doesn’t link. Leave `note` off rows about people: a one-line gloss can misrepresent a third party’s views, and the source link carries the context |
| `<DataBars data={…} />` | `bars`: one or two `series` and rows of shares per series, each with its group size (`count`) and an optional 95% interval (`ci`); `stacked` draws each row as one bar to 100%. Rows may share a `group` heading and carry a `note`, such as a p-value | Horizontal bars with the value at each bar's end, so the chart reads without its bars. A share of `null` reads "Fewer than 10" beside a hatched swatch. Names with a profile link to it |
| `<DataIntervals data={…} />` | `intervals`: a value per row and series, with `low` and `high` and the group size `n`, on a linear or log `scale`; `interval` names what the line shows ("95% interval", "Middle half") | A dot and its interval per row, with the value as text and ticks under each group |
| `<DataMap data={…} />` | `map`: aggregate `cells` (outlook and transformation spans with a `share` and `count`) and points with `outlook` (Doom 0 to Bloom 1), `transformation` (incremental 0 to civilizational 1), an optional `label`, `name` and relative `weight` | Cells: a square grid shaded by share, with groups under the minimum hatched and labelled "\<10". Points only: the result map's Prism field and geometry with sized points. Both include an equivalent screen-reader table |
| `<DataLandscape data={…} />` | `landscape`: projects placed on two editorial axes (`x` and `y`, each a `title` and the words at its `start` and `end`), each point with a `key`, `label`, `method`, `reach`, source `href`, and optional label `side`, `shift` and one `highlight`. A participant point also carries its group size `n`, at least 10, since its `reach` states it in prose | A plot of horizontal labels (numbered dots keyed in a list on phones) whose details panel follows hover, tap and focus and links the source. The highlighted project is coral and its corner tinted. A screen-reader table lists every project |
| `<DataScorecard data={…} />` | `scorecard`: approaches (`rows`) rated against criteria (`columns`, each with a `detail` question) as `yes`, `partly`, `no` or `na`, each with a one-line `note`; `levels` labels the four | A matrix of Harvey balls whose cells open their note on hover, tap or focus; on phones a compact overview whose rows open every criterion with its note. The highlighted row is coral |
| `<DataTrend data={…} />` | `trend`: small multiples on one date axis (`from`, `to`) with dated `events`; each panel one question (`title`, `note`), its own `scale` (`percent` shares or `year`s) and one or two series of dated points (the last day of fieldwork), the second `dashed` | Line panels labelled at their ends, with a crosshair that snaps to the nearest survey and a readout of every series there; arrow keys move it. A screen-reader table per panel. Values carry no group size, so participant numbers can't use it |
| `<DataEstimates data={…} />` | `estimates`: probabilities on one log `scale` with labelled ticks, each row the `figure` as written, a `value` (a dot, hollow when `inferred`) or a stated `low`–`high` range, the question's exact `wording`, a `detail` line, a `tone` for who answered (`ink` for people's own numbers) and, for participants, the group size `n` | Rows of text with a track and the figure; values below the scale sit at its edge behind an arrow. Names with a profile link to it. Rows citing public statements must match the verified statements, and participant medians the committed aggregates (`lib/blog/research-charts.test.ts`) |
| `<Definition />` | none | The quotable P(doom) definition shared with the `/p-doom` hub (`lib/p-doom/copy.ts`) |

Every data file also carries a `title` (no trailing period), a `source` sentence shown under the chart, an `asOf` date and a `provenance`. Series take the chart colors blue, then coral (`--chart-blue`, `--chart-coral` in `app/globals.css`); a series can name its `tone`, including `teal` (`--chart-teal`), so the same kind of respondent keeps its color across a post's charts: in the AI polls post, the public is blue, researchers and forecasters teal and Doom or Bloom coral. The three were checked together for contrast and color-vision separation on the card surface in both themes. `--chart-ink` marks things that are not a series, such as people's own stated numbers or reference examples. Interactive charts keep their text in the data file, so translations cover it, and read in full without hovering: every value is also in the text or a screen-reader table. Keep the numbers in each file reproducible from their source: `public-pdoom-statements.json` is checked against the verified statements in `lib/journeys/public-pdoom-statements.ts`, and the participant charts are rebuilt from the committed aggregates by `lib/blog/blog.test.ts`.

## Provenance

| `provenance` | What it is | Rules |
| --- | --- | --- |
| `public-statements` | Numbers people said in public | Each linked to its source |
| `simulated-users` | Our public simulated profiles | Call them simulated |
| `participants` | Aggregates of participant results | [Participant data](#participant-data) |
| `site-traffic` | Aggregate site analytics, such as referred visitors per day | Visitors, not participants; say so in the `source` |
| `published-research` | Numbers from third-party polls, surveys and studies | Each from the primary source (topline, report or paper), named in the `source`; only exact question wording goes in quotation marks; name the fielding firm and any sponsor; leave out figures found only in secondary coverage |

A chart that mixes sources lists them all and names each series' `provenance`.

## Participant data

Participant assessments are private by default, so posts publish aggregates only. The repository is public: anything committed is published.

- **Aggregates only:** counts, shares, medians, intervals and binned map cells. Never answer text or quotes, assessment, owner or user IDs, per-person timestamps, or anything else that could identify someone.
- **A minimum group of 10.** Every count, share or statistic describes at least 10 people. `blogDataSchema` enforces it on participant series and cells: each shown value carries its group size, and that size is at least 10. Shapes without a group size (`ranges` rows and map points) cannot carry participant numbers, and the committed aggregates never hold a group size under 10, whether a count or a denominator.
- **Small groups stay visible.** A group under 10 is not dropped. It shows as "Fewer than 10" (a hatched map cell labelled "\<10", or a hatched swatch in place of a bar) without a number, because where so few people land is a finding in itself. Prose follows the same rule.
- **Who counts:** one result per person (the earliest assessment of each owner that reached a result, by the current version of that result), leaving out simulated users, forks and the site owner's own test account. An assessment has finished when its current snapshot has a result.
- **Outlook levels are readings.** Since algorithm `0.7.5` the map places people between its five outlook levels, so a share by level (“mainly expects harm”) counts each person's level reading, not a slice of the axis. Medians and doom- or bloom-side shares use the map position.
- **Date every number:** the data's `asOf` shows under each chart, and the prose says "as of" the same date.

### Regenerating the numbers

`pnpm blog:data` (`scripts/blog-participant-data.ts`) is the pipeline. It reads the database read-only, the way the [admin tooling](admin.md) does, keeps per-person rows in memory, and pipes them to `scripts/blog-participant-data.py` (numpy and scipy through `uv`) for the statistics. Only aggregates leave it:

1. `pnpm blog:data --production` reads production with `default_transaction_read_only=on`. The owner has given standing approval for read-only, aggregate-only reads like this one.
2. It writes `content/blog/aggregates/participants.json`, every aggregate the posts cite, suppressed below 10, and rebuilds the charts of published posts, `content/blog/data/launch-week-*.json`, from it (`lib/blog/participant-charts.ts`). Builders for draft posts stay in that file; a chart is written once its name is in `publishedCharts`. Site traffic lives in `content/blog/aggregates/referrers.json`, copied by hand from Vercel Web Analytics.
3. Update the prose and the "as of" dates from the new aggregates, rerun `pnpm l10n:translate --locale=<code> --scope=blog --post=<slug> --only-stale --allow-paid --max-cost=1.5 --concurrency=2` for each locale, and run the blog checks. Each request reserves about $0.28 up front, so a lower cap or higher concurrency stops before spending; a whole post costs about $0.15 per locale.

`pnpm blog:data --out=<file>` runs the pipeline against the local database to check it, and `pnpm blog:data --charts-only` rebuilds the charts after a change to the chart builder. The current numbers are as of October 3, 2026, and leave forks out.
