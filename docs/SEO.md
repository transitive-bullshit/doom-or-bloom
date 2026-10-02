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

Write titles for what people search, not for the site's internal names: "How will AI change our future? Map your AI worldview", "What is P(doom)? Estimates from AI thought leaders", "<Name> on AI and P(doom)". `pageMetadata` appends " | Doom or Bloom"; the brand name "Doom or Bloom" and the subtitle in [README.md](README.md#locked-product-language) stay as written. Balance search demand with editorial neutrality: the home page's title keeps a neutral, trust-preserving framing (it leads with the site's own question rather than insider vocabulary that frames the site as doom-leaning), while topic pages (`/p-doom`, profiles, posts) target the terms people actually search, P(doom) included. Choose target queries from keyword research, not intuition.

- No trailing period on a title. Descriptions are one or two full sentences and keep their periods.
- Pages about a simulated user call the worldview simulated in the description; keep titles short ("<Name>’s views on AI and P(doom)"). The structured data adds that it is a simulation from public writing, not their own assessment; don't lead search snippets with that disclaimer. Inferred P(doom) is described as rough.
- Personas are "thought leaders"; the interview takes "about 3 minutes".
- Translate every title and description through the catalogs ([INTERNATIONALIZATION.md](INTERNATIONALIZATION.md#adding-a-string)). Post titles are English, like their posts.

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
