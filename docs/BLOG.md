# Blog

The blog publishes plain-language posts about P(doom), AI worldviews and the ideas behind Doom or Bloom at `/blog`. This document owns how posts are written, rendered and charted. [SEO.md](SEO.md) owns titles, structured data and crawl files.

## Writing a post

A post is one MDX file, `content/blog/<slug>.mdx`. The file name is the URL slug: lowercase words joined by hyphens.

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
- Headings never end with a period. `pnpm test:content` and the unit tests fail on one.
- Write in a plain, candid voice without hype. Personas are "thought leaders"; the interview takes "about 3 minutes". Say when a number is inferred or simulated, and that simulations are not endorsements.
- Use typographic quotes and apostrophes, like the rest of the site's copy.
- Link to site pages with root-relative URLs (`[the P(doom) table](/p-doom)`); they keep the reader's language prefix. Other links open in a new tab.
- Write people's full names. The first mention of anyone with a published profile in each paragraph, list item or table cell links to their profile automatically ([SEO.md](SEO.md#internal-links)). Names in headings, links and bold or italic text stay as written, and single-word names (Roon, Aella) need an explicit link such as `[Roon](/users/tszzl)`.
- Reading time is computed from the prose (230 words a minute); you do not set it.
- Every post renders with the shared reading column, a byline, its `BlogPosting` structured data, a Takumi social card at `/blog/<slug>/opengraph-image` and a closing assessment CTA. The newest post comes first on the index and in the feed.

Check a post with `pnpm dev`, then run `pnpm test`, `pnpm check:browser tests/browser/seo.spec.ts` and, before release, `pnpm build:local` and `pnpm check:prefetch`.

## Rendering

Posts are compiled by `@next/mdx` (configured in `next.config.ts`, with `remark-frontmatter` to keep the YAML out of the page and `remark-gfm` for tables). `mdx-components.tsx` maps elements and data components (`components/blog/mdx.tsx`). `lib/blog/posts.ts` reads the frontmatter with gray-matter for the index, metadata, sitemap, llms.txt and RSS feed.

Posts change only with a deployment. The index and every post are generated at build in every locale; unknown slugs are 404s. The feed (`/blog/rss.xml`, summaries only) and the post cards are generated once at build. The sitemap and llms.txt regenerate every 48 hours and bundle `content/blog/*.mdx`; `scripts/check-production-traces.mjs` asserts all of this.

## Languages

Posts are English. Other locales serve the same English post under translated chrome (header, footer, breadcrumbs, byline, the "Posts are written in English" note) rather than redirecting: a remembered language sends unprefixed URLs to `/<code>/…`, so a redirect back to English would loop. These pages are noindex and canonicalize to the English post, the same policy as other English-bodied pages ([INTERNATIONALIZATION.md](INTERNATIONALIZATION.md#search-metadata)). The sitemap, llms.txt and the feed list only English URLs. Translating posts is deferred.

## Data components

Charts render from committed aggregate JSON in `content/blog/data/`. A post imports the file and passes it to a component, which validates it with `blogDataSchema` when the page builds:

| Component | Data (`kind`) | Renders |
| --- | --- | --- |
| `<DataRanges data={…} />` | `ranges`: rows with a `label`, a `token` as written ("10–20%"), `low` and `high` probabilities, an optional `note` and source `href` | A table with one range bar per row on a 0–100% scale. A label naming someone with a profile links to it; `href` records the number’s source, which the chart doesn’t link. Leave `note` off rows about people: a one-line gloss can misrepresent a third party’s views, and the source link carries the context |
| `<DataMap data={…} />` | `map`: points with `outlook` (Doom 0 to Bloom 1), `transformation` (incremental 0 to civilizational 1), an optional `label` and a relative `weight` | The result map's Prism field and geometry with sized points, plus an equivalent screen-reader table |
| `<Definition />` | none | The quotable P(doom) definition shared with the `/p-doom` hub (`lib/p-doom/copy.ts`) |

Every data file also carries a `title` (no trailing period), a `source` sentence shown under the chart, an `asOf` date and a `provenance`. Keep the numbers in the file reproducible from their source: `public-pdoom-statements.json` is checked against the verified statements in `lib/journeys/public-pdoom-statements.ts` by `lib/blog/blog.test.ts`.

## No participant data until approved

The allowed provenances are `public-statements` (numbers people said in public, each linked) and `simulated-users` (our public simulated profiles). Participant assessments are private by default and published ones belong to their publishers. Do not compute, export or commit anything derived from participant assessments, including counts, averages or map densities, until the owner approves publishing aggregates and the privacy policy, minimum group sizes and a `participants` provenance are added here. Production reads for blog data are limited to simulated-user records ([admin.md](admin.md)).
