# Search and structured data

This document owns how pages present themselves to search engines and AI crawlers: titles and descriptions, structured data (JSON-LD), canonical URLs, the sitemap, robots.txt and llms.txt. [INTERNATIONALIZATION.md](INTERNATIONALIZATION.md#search-metadata) owns which locale URLs are indexed; [BLOG.md](BLOG.md) owns posts.

## Where things live

| What | Where |
| --- | --- |
| Page titles and descriptions | `messages/<locale>.json` under `Pages.<key>` for the pages in `publicPages` (`lib/site.ts`); `Profiles` for simulated users, whose titles `profileTitle` in `lib/seo/profile-titles.ts` builds ([Profile titles](#profile-titles)); frontmatter for blog posts |
| Metadata assembly | `pageMetadata` and `publicPageMetadata` in `lib/metadata.ts`: the title suffix, canonical URL, hreflang alternates, noindex outside English for English-bodied pages, Open Graph (`article` for posts) and the RSS alternate |
| Structured data | Pure builders in `lib/seo/json-ld.ts`, rendered by `JsonLd` and `BreadcrumbJsonLd` in `components/json-ld.tsx`; shapes are tested in `lib/seo/json-ld.test.ts` |
| Breadcrumbs | `breadcrumbTrail` in `lib/breadcrumbs.ts`, shared by the visible breadcrumbs and their BreadcrumbList |
| Social images | The checked-in site card (`app/opengraph-image.png`), profile cards (`/users/<slug>/opengraph-image`), public assessment cards ([PERSISTENCE.md](PERSISTENCE.md#public-pages-and-social-images)) and blog post cards (`/blog/<slug>/opengraph-image`, `lib/sharing/blog-social-card.tsx`) |
| Crawl files | `app/sitemap.ts`, `app/robots.ts`, `app/llms.txt/route.ts` and the blog feed `app/blog/rss.xml/route.ts` |

## Titles and descriptions

Write titles for what people search, not for the site's internal names: "How will AI change our future? Take the 3-minute quiz", "What is P(doom)? Estimates from Hinton, Musk, LeCun and more", "Geoffrey Hinton on AI safety, risk and P(doom)". `pageMetadata` appends " | Doom or Bloom"; the brand name "Doom or Bloom" and the subtitle in [README.md](README.md#locked-product-language) stay as written. Balance search demand with editorial neutrality: the home page's title keeps a neutral, trust-preserving framing (it leads with the site's own question rather than insider vocabulary that frames the site as doom-leaning), while topic pages (`/p-doom`, profiles, posts) target the terms people actually search, P(doom) included. Choose target queries from keyword research, not intuition: see `docs/research/seo-keywords-2026-10-02.md`. Name people in titles and descriptions across the range of views (Hinton, LeCun, Altman), never only one side, and avoid catalog counts that change ("169 thought leaders").

- No trailing period on a title. Descriptions are one or two full sentences and keep their periods.
- Pages about a simulated user call the worldview simulated in the description; the title names topics, not the simulation. The structured data adds that it is a simulation from public writing, not their own assessment; don't lead search snippets with that disclaimer. Inferred P(doom) is described as rough.
- Personas are "thought leaders"; the interview takes "about 3 minutes".
- Translate every title and description through the catalogs ([INTERNATIONALIZATION.md](INTERNATIONALIZATION.md#adding-a-string)). Post titles are English, like their posts.

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
| `/` | `WebSite`, `WebApplication` (free: `isAccessibleForFree` and a zero-price `Offer`) and the creator `Person`, Travis Fischer (`https://x.com/transitive_bs`) |
| `/users/<slug>` | `ProfilePage` whose `mainEntity` is the simulated `Person`: name, portrait, `sameAs` their X and profile links, and a description that says it is a simulation from public writing, not their own assessment |
| `/p-doom` | `Dataset` (the curated table: the publicly stated variable, `dateModified` and the sources of its numbers and quoted refusals) and an `ItemList` of its profiles in table order |
| `/blog` | `Blog` with each post as an `Article` part |
| `/blog/<slug>` | `Article`: headline, dates, author, the post card, `wordCount` and `timeRequired` |
| Every page with breadcrumbs | `BreadcrumbList` matching the visible trail, in the page's locale |

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
