# Search and structured data

This document owns how pages present themselves to search engines and AI crawlers: titles and descriptions, structured data (JSON-LD), canonical URLs, the sitemap, robots.txt and llms.txt. [INTERNATIONALIZATION.md](INTERNATIONALIZATION.md#search-metadata) owns which locale URLs are indexed; [BLOG.md](BLOG.md) owns posts.

## Where things live

| What | Where |
| --- | --- |
| Page titles and descriptions | `messages/<locale>.json` under `Pages.<key>` for the pages in `publicPages` (`lib/site.ts`); `Profiles.userTitle` and `Profiles.userDescription` for simulated users; frontmatter for blog posts |
| Metadata assembly | `pageMetadata` and `publicPageMetadata` in `lib/metadata.ts`: the title suffix, canonical URL, hreflang alternates, noindex outside English for English-bodied pages, Open Graph (`article` for posts) and the RSS alternate |
| Structured data | Pure builders in `lib/seo/json-ld.ts`, rendered by `JsonLd` and `BreadcrumbJsonLd` in `components/json-ld.tsx`; shapes are tested in `lib/seo/json-ld.test.ts` |
| Breadcrumbs | `breadcrumbTrail` in `lib/breadcrumbs.ts`, shared by the visible breadcrumbs and their BreadcrumbList |
| Social images | The checked-in site card (`app/opengraph-image.png`), profile cards (`/users/<slug>/opengraph-image`), public assessment cards ([PERSISTENCE.md](PERSISTENCE.md#public-pages-and-social-images)) and blog post cards (`/blog/<slug>/opengraph-image`, `lib/sharing/blog-social-card.tsx`) |
| Crawl files | `app/sitemap.ts`, `app/robots.ts`, `app/llms.txt/route.ts` and the blog feed `app/blog/rss.xml/route.ts` |

## Titles and descriptions

Write titles for what people search, not for the site's internal names: "How will AI change our future? Take the 3-minute quiz", "What is P(doom)? Estimates from Hinton, Musk, LeCun and more", "<Name> on AI and P(doom)". `pageMetadata` appends " | Doom or Bloom"; the brand name "Doom or Bloom" and the subtitle in [README.md](README.md#locked-product-language) stay as written. Balance search demand with editorial neutrality: the home page's title keeps a neutral, trust-preserving framing (it leads with the site's own question rather than insider vocabulary that frames the site as doom-leaning), while topic pages (`/p-doom`, profiles, posts) target the terms people actually search, P(doom) included. Choose target queries from keyword research, not intuition: see `docs/research/seo-keywords-2026-10-02.md`. Name people in titles and descriptions across the range of views (Hinton, LeCun, Altman), never only one side, and avoid catalog counts that change ("169 thought leaders").

- No trailing period on a title. Descriptions are one or two full sentences and keep their periods.
- Pages about a simulated user call the worldview simulated in the description; keep titles short ("<Name>’s views on AI and P(doom)"). The structured data adds that it is a simulation from public writing, not their own assessment; don't lead search snippets with that disclaimer. Inferred P(doom) is described as rough.
- Personas are "thought leaders"; the interview takes "about 3 minutes".
- Translate every title and description through the catalogs ([INTERNATIONALIZATION.md](INTERNATIONALIZATION.md#adding-a-string)). Post titles are English, like their posts.

## Structured data

| Page | Types |
| --- | --- |
| `/` | `WebSite` (no `SearchAction`: the directory's search is not addressable by URL), `WebApplication` (free: `isAccessibleForFree` and a zero-price `Offer`) and the creator `Person`, Travis Fischer, with `sameAs` his X, GitHub and website |
| `/users/<slug>` | `WebPage` about the real person: `mainEntity` and the first `about` are the `Person`, followed by the shared topics; `citation` lists the profile's sources as `CreativeWork`s (dated when the source brief records a date). The `Person` has a name, portrait, the factual one-liner as `description` and `sameAs` their X or profile link, plus English Wikipedia and Wikidata where `lib/seo/person-identities.json` has them |
| `/users` | `CollectionPage` whose `mainEntity` is an `ItemList` of every profile in the directory's default order (by name) |
| `/p-doom` | `WebPage` about P(doom), whose `mainEntity` is the `Dataset` of the curated table: `variableMeasured` (a `PropertyValue`), `creator`, `dateModified`, `temporalCoverage`, `isAccessibleForFree` and `isBasedOn` the sources of its numbers and quoted refusals. No `license` is stated for the table, so none is claimed. An `ItemList` of its profiles in table order |
| `/about` | `AboutPage` about the `WebSite` |
| `/blog` | `Blog` with each post as a `BlogPosting` in `blogPost` |
| `/blog/<slug>` | `BlogPosting`: headline, dates, author and publisher (the creator), the post card, `mainEntityOfPage`, `wordCount` and `timeRequired` |
| Every page with breadcrumbs | `BreadcrumbList` matching the visible trail, in the page's locale; pages with a `WebPage` node link it as `breadcrumb` |

- **Simulated people.** A profile is a `WebPage`, not a `ProfilePage`, which Google reserves for people affiliated with the site. The `Person`'s `description` is their one-liner, never the simulation's result. The page's `description` adds that the worldview is a simulation from public writing, not their own assessment, after the search description, so snippets don't lead with it.
- **Shared `@id`s.** Pages join through stable `@id`s: `/#website`, `/#creator`, `/users/<slug>#person` for the real person in every locale and on every page that lists them (`/p-doom`, `/users`), and the topics `/#topic-ai-safety` and `/#topic-ai-existential-risk` (`Thing`s) and `/#topic-p-doom` (a `DefinedTerm` with the shared definition), each with its Wikipedia and Wikidata `sameAs`. A page includes the full node for every topic it references. Profiles and `/users` are about all three topics; `/p-doom` is about P(doom) and existential risk.
- **Wikipedia and Wikidata.** `lib/seo/person-identities.json` maps profile slugs to English Wikipedia articles about that person and their Wikidata items. Add a person only after checking the article is about them, not a namesake, a disambiguation page or a redirect to an organization or blog (Gwern, Nathan Lambert, John Scott-Railton, Katja Grace and Scott Alexander have none), and resolve the item with `https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&ppprop=wikibase_item&redirects=1&titles=<title>`. `lib/seo/person-identities.test.ts` checks every key is a known slug and every URL is well formed.
- **Not used.** No FAQ markup (Google restricts FAQ rich results to authoritative government and health sites) and no `Quiz` (it describes a test of knowledge, not an opinion interview).

Render JSON-LD with `JsonLd`, which escapes `<` so text cannot close the script element. Place it after the breadcrumbs (they must stay the first page-content element) and outside `PageTransition`. Add a builder and a test for any new type rather than writing objects inline in a page. Check new types with Google's Rich Results Test or the Schema Markup Validator against a public deployment.

## Indexing and canonical URLs

- Pages translated in every locale (`translated: true` in `publicPages`) canonicalize to themselves and list hreflang alternates.
- Pages whose main content stays English (simulated users, public assessments, the P(doom) hub, the blog index and posts) translate their chrome, canonicalize to the English URL and are noindex outside English. The sitemap lists only their English URL.
- Owner routes are disallowed in robots.txt under every prefix and are never in the sitemap.
- `scripts/audit-seo.ts <origin> <output> --check` fetches every sitemap URL and checks titles, canonicals, Open Graph and Twitter tags and social images against a running server.

## Internal links

The footer links About, P(doom), Blog and Privacy on every page. Each simulated-user page links up to six similar worldviews (`loadSimilarWorldviews` in `components/landing/data.ts`, using the same distance as a participant's closest worldviews across the whole catalog). The P(doom) hub links its curated thought leaders' profiles, the `/users` directory of every profile and the "What is P(doom)?" post; the post links back to the hub. These links do not prefetch automatically, like the map and directory.

## Owner tasks

Search Console and Bing Webmaster Tools verification, sitemap submission and rich-result monitoring need the site owner's accounts; they are not part of the code.
