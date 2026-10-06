# Search and structured data

This document owns how pages present themselves to search engines and AI crawlers: titles and descriptions, structured data (JSON-LD), canonical URLs, the sitemap, robots.txt and llms.txt. [INTERNATIONALIZATION.md](INTERNATIONALIZATION.md#search-metadata) owns which locale URLs are indexed; [BLOG.md](BLOG.md) owns posts.

## Where things live

| What | Where |
| --- | --- |
| Page titles and descriptions | `messages/<locale>.json` under `Pages.<key>` for the pages in `publicPages` (`lib/site.ts`); `Profiles` for simulated users, whose titles `profileTitle` in `lib/seo/profile-titles.ts` builds ([Profile titles](#profile-titles)); frontmatter for blog posts |
| Metadata assembly | `pageMetadata` and `publicPageMetadata` in `lib/metadata.ts`: the title suffix, canonical URL, hreflang alternates, noindex outside English for English-bodied pages, Open Graph (`article` for posts) and the RSS alternate |
| Structured data | Pure builders in `lib/seo/json-ld.ts`, rendered by `JsonLd` and `BreadcrumbJsonLd` in `components/json-ld.tsx`; shapes are tested in `lib/seo/json-ld.test.ts` |
| Breadcrumbs | `breadcrumbTrail` in `lib/breadcrumbs.ts`, shared by the visible breadcrumbs and their BreadcrumbList |
| Social images | The checked-in site card (`app/opengraph-image.png`), profile cards (`/users/<slug>/opengraph-image`), public assessment cards ([PERSISTENCE.md](PERSISTENCE.md#public-pages-and-social-images)) and blog post cards (`/blog/<slug>/opengraph-image`, and `/<code>/blog/<slug>/opengraph-image` for a translated post; `lib/sharing/blog-social-card.tsx`) |
| Crawl files | `app/sitemap.ts`, `app/robots.ts`, `app/llms.txt/route.ts` and the blog feed `app/blog/rss.xml/route.ts` |

## Site social image

The site-wide card is the approved white portrait-first design: 1200 × 630, 85px circular color portraits with 3px white borders, a muted map and Doom/Bloom pills. Its margins are 64px horizontally and 48px vertically; the Bloom pill intentionally overlaps the right margin. The Venn icon and brand align with the chart’s top and bottom. Portrait spacing retains the original 94px diameter so the smaller faces keep their reviewed centers and give the question more visual prominence.

`pnpm social-image:generate` recreates `app/opengraph-image.png` and its alt text offline from `lib/sharing/site-social-points.json`, the approved frozen public simulated-user map. The JSX lives in `lib/sharing/site-social-card.tsx`. Portraits that would cover each other move apart vertically, and a stack pushed past the top or bottom of the plot moves back inside as one piece; Gary Marcus then has an image-only vertical offset of 90.8px. None of this changes saved results, outlook positions or the site’s interactive map. Dots retain the presented worldview coordinates. Regeneration uses checked-in portraits and Inter Tight, with no inference or network calls.

To refresh the distribution, capture a review from an explicit read-only database target, then apply it:

```sh
pnpm social-image:generate --production --out=work/social-images/<new-review>
# Or use --local for the local development database.
# Inspect before.png, after.png and review.json in that directory, then:
pnpm social-image:generate --apply=work/social-images/<new-review>
```

Database capture changes no approved files. The review contains before/after images, point snapshots and alt text, capture target/time, hashes and the added, removed or changed points. Inspect the full distribution as well as the eight editorial portraits; their selection, collision spacing and Gary's offset remain controlled by the card component, separately from the raw coordinates. To change those controls, edit the component before creating a new review. A capture does not overwrite an existing directory. Omitting `--out` creates a timestamped review under ignored `work/social-images/`.

Apply checks the bundle hashes, verifies the PNG reproduces from its points and current design, and requires the reviewed alt text to match the current design. It refuses a changed approved snapshot, image or alt file. It then copies the exact reviewed PNG, points and alt text into their checked-in locations, with no database access or inference. Commit those files together; default offline regeneration then reproduces the same pixels. Bundles created without the hashed alt files must be captured again. The commands do not commit, push or deploy. `--local` and `--production` capture reviews, rather than directly replacing the root image.

## Titles and descriptions

Write titles for what people search, not for the site's internal names: "How will AI change our future? Take the 3-minute quiz", "What is P(doom)? Estimates from Hinton, Musk, LeCun and more", "Geoffrey Hinton on AI safety, risk and P(doom)". `pageMetadata` appends " | Doom or Bloom"; the brand name "Doom or Bloom" and the subtitle in [README.md](README.md#locked-product-language) stay as written. Balance search demand with editorial neutrality: the home page's title keeps a neutral, trust-preserving framing (it leads with the site's own question rather than insider vocabulary that frames the site as doom-leaning), while topic pages (`/p-doom`, profiles, posts) target the terms people actually search, P(doom) included. Choose target queries from keyword research, not intuition: see `docs/research/seo-keywords-2026-10-02.md`. Name people in titles and descriptions across the range of views (Hinton, LeCun, Altman), never only one side, and avoid catalog counts that change ("169 thought leaders").

- No trailing period on a title. Descriptions are one or two full sentences and keep their periods.
- Pages about a simulated user call the worldview simulated in the description; the title names topics, not the simulation. The structured data adds that it is a simulation from public writing, not their own assessment; don't lead search snippets with that disclaimer. Inferred P(doom) is described as rough.
- Personas are "thought leaders"; the interview takes "about 3 minutes".
- Translate every title and description through the catalogs ([INTERNATIONALIZATION.md](INTERNATIONALIZATION.md#adding-a-string)). Post titles come from each post's frontmatter, and a translated post's from its translation ([BLOG.md](BLOG.md#languages)).

### Profile titles

A simulated user's title names what people search about that person, then falls back to where they land on the map:

1. **Search topics**, when the keyword study found strong evidence: up to three topics from a controlled vocabulary, stored per person with their evidence in `lib/seo/profile-title-topics.json`. A topic is strong when Google ranks "<name> ai <topic>" (or "<name> on ai <topic>", "<name> p doom", "<name> agi") in its top three suggestions for that prefix. P(doom), safety and risk need only that, as approved on October 2; other topics also need Google's overall suggestions for the name, Bing or DuckDuckGo to show them. The list runs P(doom), then safety and risk when confirmed, then the rest by demand. Refresh it with a new keyword study, never at runtime, and review it by hand: drop suggestions about someone else with the same name.
2. **Map position** for everyone else, neutral topics rather than stances: outlook below 40 "<Name> on AI safety and risk", 40 to 79 "<Name> on AI’s risks and benefits", 80 and up "<Name> on AI’s future and opportunities". The bands come from the decision page; P(doom) is named only where people search it.
3. **"<Name> on AI"** for an unplaced profile.

Titles read as a plain list, never a colon. Topics that name a kind of AI share one "AI" ("AI safety, risk and P(doom)"); without one the list starts with AI itself ("AI and P(doom)", "AI, jobs and AGI"). "The future of AI" leads a list unless another topic already names AI, when it closes it as "the future" ("AI regulation, jobs and the future"). P(doom) comes last. The vocabulary: safety, risk, regulation, policy, ethics, consciousness, the AI bubble, jobs, education, healthcare, open source, AGI, superintelligence, the future and P(doom). Stances such as optimism are not topics.

Every title must fit Google's desktop limit of about 600px of 20px Arial with " | Doom or Bloom" (`googleTitleWidth` in `lib/seo/title-width.ts`). The choice is made in English: a search title drops its least searched topics until it fits, and a map title that doesn't fit falls back to "<Name> on AI". Other languages show the same choice through `Profiles.userTitleTopics`, `Profiles.userTitleMap`, `Profiles.titleTopic` and `Profiles.titleTopicAfterAi` (a topic's shorter form once AI is named), joined with the locale's list format (British English in English, so no serial comma). `lib/seo/profile-titles.test.ts` checks the grammar for every combination of topics and the width of every catalog title.

## Structured data

| Page | Types |
| --- | --- |
| `/` | `WebSite` (no `SearchAction`: the directory's search is not addressable by URL), `WebApplication` (free: `isAccessibleForFree` and a zero-price `Offer`) and the creator `Person`, Travis Fischer, with `sameAs` his X, GitHub and website |
| `/users/<slug>` | `WebPage` about the real person: `mainEntity` and the first `about` are the `Person`, followed by the shared topics; `citation` lists the profile's sources as `CreativeWork`s (dated when the source brief records a date). The `Person` has a name, portrait, the factual one-liner as `description` and `sameAs` their X or profile link, plus English Wikipedia and Wikidata where `lib/seo/person-identities.json` has them |
| `/users` | `CollectionPage` whose `mainEntity` is an `ItemList` of every profile, alphabetical by name |
| `/p-doom` | `WebPage` about P(doom), whose `mainEntity` is the `Dataset` of the curated table: `variableMeasured` (a `PropertyValue`), `creator`, `dateModified`, `temporalCoverage`, `isAccessibleForFree` and `isBasedOn` the sources of its numbers and quoted refusals. No `license` is stated for the table, so none is claimed. An `ItemList` of its profiles in table order |
| `/about` | `AboutPage` about the `WebSite` |
| `/blog` | `Blog` with each post as a `BlogPosting` in `blogPost` |
| `/blog/<slug>` | `BlogPosting`: headline, dates, author and publisher (the creator), the post card, `mainEntityOfPage`, `wordCount`, `timeRequired` and `inLanguage`; a translation gives its own URL and `translationOfWork` |
| Every page with breadcrumbs | `BreadcrumbList` matching the visible trail, in the page's locale; pages with a `WebPage` node link it as `breadcrumb` |

- **Simulated people.** A profile is a `WebPage`, not a `ProfilePage`, which Google reserves for people affiliated with the site. The `Person`'s `description` is their one-liner, never the simulation's result. The page's `description` adds that the worldview is a simulation from public writing, not their own assessment, after the search description, so snippets don't lead with it.
- **Shared `@id`s.** Pages join through stable `@id`s: `/#website`, `/#creator`, `/users/<slug>#person` for the real person in every locale and on every page that lists them (`/p-doom`, `/users`), and the topics `/#topic-ai-safety` and `/#topic-ai-existential-risk` (`Thing`s) and `/#topic-p-doom` (a `DefinedTerm` with the shared definition), each with its Wikipedia and Wikidata `sameAs`. A page includes the full node for every topic it references. Profiles and `/users` are about all three topics; `/p-doom` is about P(doom) and existential risk.
- **Wikipedia and Wikidata.** `lib/seo/person-identities.json` maps profile slugs to English Wikipedia articles about that person and their Wikidata items. Add a person only after checking the article is about them, not a namesake, a disambiguation page or a redirect to an organization or blog (Gwern, Nathan Lambert, John Scott-Railton, Katja Grace and Scott Alexander have none), and resolve the item with `https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&ppprop=wikibase_item&redirects=1&titles=<title>`. `lib/seo/person-identities.test.ts` checks every key is a known slug and every URL is well formed.
- **Not used.** No FAQ markup (Google restricts FAQ rich results to authoritative government and health sites) and no `Quiz` (it describes a test of knowledge, not an opinion interview).

Render JSON-LD with `JsonLd`, which escapes `<` so text cannot close the script element. Place it after the breadcrumbs (they must stay the first page-content element) and outside `PageTransition`. Add a builder and a test for any new type rather than writing objects inline in a page. Check new types with Google's Rich Results Test or the Schema Markup Validator against a public deployment.

## Indexing and canonical URLs

- Pages translated in every locale (`translated: true` in `publicPages`) canonicalize to themselves and list hreflang alternates.
- Pages whose main content stays English (simulated users, public assessments, the P(doom) hub, the blog index and English-only posts) translate their chrome, canonicalize to the English URL and are noindex outside English. The sitemap lists only their English URL. Translated posts are indexed in every locale, like translated pages.
- Owner routes are disallowed in robots.txt under every prefix and are never in the sitemap.
- `scripts/audit-seo.ts <origin> <output> --check` fetches every sitemap URL and checks titles, canonicals, Open Graph and Twitter tags and social images against a running server.

## Internal links

The footer links the `/users` directory, `/p-doom`, the blog index and a few featured posts (`footerPosts` in `lib/blog/footer-posts.ts`, labelled with each post's title in the reader's language, or its English title when the post is English only), plus About, Methodology and Privacy, on every page. Its "Map your worldview" link is `nofollow`, since robots.txt keeps the interview out of search. Each simulated-user page links up to six similar worldviews (`loadSimilarWorldviews` in `components/landing/data.ts`, using the same distance as a participant's closest worldviews across the whole catalog). The P(doom) hub links its curated thought leaders' profiles, the `/users` directory of every profile and the "What is P(doom)?" post; the post links back to the hub. On the hub and in blog posts, the name of anyone with a published profile links to it, so readers can move from a mention to that person's simulated worldview (`profileMentions` in `lib/personas/mentions.ts`): the first mention of a full name in each paragraph, list item or table cell, and every name in bylines, scenario proponents and charts (a chart's numbers stay unlinked). Matching is exact and case-sensitive on whole multi-word names (a middle initial may be left out); single-word names such as Roon are too often ordinary words to link automatically. The hub links the profiles published when it regenerates; posts link those published at build. These links do not prefetch automatically, like the map and directory.

## Owner tasks

Search Console and Bing Webmaster Tools verification, sitemap submission and rich-result monitoring need the site owner's accounts; they are not part of the code.
