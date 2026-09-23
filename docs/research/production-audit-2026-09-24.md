# Production Lighthouse, metadata, and cache audit

Measured September 24, 2026 (Asia/Bangkok), against the live production domain. No application code or production settings changed.

## Findings

1. **Public HTML is not using full-page ISR caching.** All four working pages repeatedly returned `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`, `Age: 0`, and `X-Vercel-Cache: MISS`, including later warm requests. The local scanner independently found `dynamic = "force-dynamic"` on all four page routes. Server-rendered output is not automatically cached output.
2. **Dynamic profile social-image caching works.** Early requests missed; later consecutive requests to `/users/barackobama/opengraph-image` returned `HIT`, `Age: 151`, identical image hashes, and 119/44 ms time to first byte. It advertises a seven-day browser freshness period. This establishes warm response reuse, not a production-wide hit rate or the complete internal regeneration policy.
3. **The replacement public assessment and its image work.** The page `/public/assessments/e4be9b9c-31f1-4f34-b1a6-a2da8941ed9b` returns 200 and assessment-specific metadata. Its `/social-image.webp` reaches `HIT`, `Age: 35`, with identical bytes and 129 ms time to first byte. Its HTML remains private/no-store. The original ID returned 404 and has been superseded by this example.
4. **A late header button causes a mobile layout shift.** The About filmstrip shows the “Map your own worldview” button appearing after initial paint and wrapping the header onto a second row. Lighthouse attributes the shift to the main content on all four working pages: CLS 0.234. Reserve the final header space or render a same-size initial control, then rerun mobile Lighthouse.
5. **Accessibility has small, specific gaps.** Homepage map markers overlap enough to fail target spacing. On the profile, “More details” is an out-of-order `h4`; embedded post author/follow links also fail target size/spacing. The public assessment also skips heading levels at “Additional insights” and the first question; its closest-worldview links have accessible-name/visible-label mismatches. Fix semantic heading order, matching accessible names, and usable target areas.

## Lighthouse scores

Lighthouse 13.5.0, headless Chrome 153, default simulated mobile and desktop throttling. One usable run per page/device; not medians or field data. Homepage and replacement assessment runs used HTTP/1.1 after the initial default-transport run produced many connection resets. The initial homepage 100 performance/100 accessibility/96 best-practices result is excluded because failed assets made it unrepresentative.

| Page | Mobile performance | Desktop performance | Accessibility mobile/desktop | Best practices | SEO |
| --- | --: | --: | --: | --: | --: |
| `/` | 87 | 94 | 96 / 96 | 100 | 100 |
| `/about` | 88 | 100 | 100 / 100 | 100 | 100 |
| `/users/barackobama` | 88 | 94 | 95 / 95 | 100 | 100 |
| `/public/assessments/e4be9b9c-31f1-4f34-b1a6-a2da8941ed9b` | 87 | 99 | 98 / 98 | 100 | 100 |

| Page | Mobile FCP | Mobile LCP | Mobile TBT | Mobile CLS | Desktop LCP | Desktop CLS |
| --- | --: | --: | --: | --: | --: | --: |
| `/` | 1.5 s | 1.5 s | 70 ms | 0.234 | 0.9 s | 0.001 |
| `/about` | 1.1 s | 1.2 s | 100 ms | 0.234 | 0.3 s | 0.001 |
| `/users/barackobama` | 1.0 s | 1.5 s | 70 ms | 0.234 | 1.0 s | 0.001 |
| Public assessment | 1.4 s | 1.4 s | 40 ms | 0.234 | 0.7 s | 0.001 |

LCP is good in these lab runs; mobile CLS needs improvement. Google's good thresholds are LCP ≤2.5 s and CLS ≤0.1. INP was not measured, so this is not a field Core Web Vitals pass. [Web Vitals definitions](https://web.dev/articles/vitals).

The homepage also has an estimated 540 KiB of image delivery savings: small portrait markers/legend avatars receive much larger original images. Lighthouse estimates zero FCP/LCP savings from that change in this run, so prioritize layout stability first; smaller correctly sized thumbnails would primarily reduce transfer. Unused JavaScript is a diagnostic, not proof that code can be removed: initial-load coverage does not exercise the interactive map or other controls.

## Social metadata and images

| Page | Metadata | Image result |
| --- | --- | --- |
| Home | Specific description, canonical, OG title/description/URL/type/site/locale, large-image card, image dimensions and alt text | Shared JPEG, 1200×630, 219,449 bytes, HTTP 200 |
| About | Page-specific title, description, canonical and OG URL; complete OG/card fields | Same site JPEG; appropriate reuse |
| Obama profile | Specific title/description/canonical/OG URL; simulation disclosure in description and image alt | Dynamic WebP, 1200×630, 54,174 bytes, HTTP 200 |
| Public assessment | “Travis Fischer’s AI worldview” title, matching canonical/OG URL, large-image card and image alt; description is generic to assessments | Dynamic WebP, 1200×630, 38,344 bytes, HTTP 200 |

For all four working pages, all 19 OG/card metadata tags were present inside `<head>` when fetched with `Twitterbot/1.0`; JavaScript execution is not required. All three distinct successful images were decoded and dimensions verified; both dynamic images were visually inspected, and the profile image clearly labels the result as simulated. No actual platform share-preview debugger was used. The fundamental OG fields are present on the working pages. Optional sharing improvement: the assessment image says “My AI Worldview” while the metadata names Travis; using the public display name consistently and a result-specific description would make detached previews more informative. [Open Graph protocol](https://ogp.me/).

`robots.txt` returns 200, permits public pages and blocks private assessment/API paths and public assessment data endpoints. It advertises the production sitemap, which also returned 200.

## Caching by route

| Resource | Observed production behavior | Interpretation |
| --- | --- | --- |
| `/` | Repeated `MISS`, `Age: 0`, private/no-store | Dynamic HTML, no observed shared full-page ISR |
| `/about` | Repeated `MISS`, `Age: 0`, private/no-store | Dynamic HTML, no observed shared full-page ISR |
| `/users/barackobama` | Repeated `MISS`, `Age: 0`, private/no-store | Dynamic HTML, no observed shared full-page ISR |
| Replacement assessment HTML | 200, repeated `MISS`, `Age: 0`, private/no-store | Dynamic HTML, no observed shared full-page ISR |
| Hashed site JPEG | Warm `HIT`, `Age: 184`; `max-age=31536000, immutable` | Aggressive static asset caching works |
| Profile `/opengraph-image` | Warm `HIT`, `Age: 151`; `public, max-age=604800, must-revalidate` | Dynamic image response reuse works; browser freshness is seven days |
| Assessment `/social-image.webp` | Warm `HIT`, `Age: 35`; `public, max-age=604800, must-revalidate` | Dynamic image response reuse works; browser freshness is seven days |

The scanner found explicit dynamic rendering at [home](../../app/page.tsx:8), [About](../../app/about/page.tsx:8), [profile](../../app/users/[username]/page.tsx:8), and [public assessment](../../app/public/assessments/[id]/page.tsx:11). It also found it at [public assessment image](../../app/public/assessments/[id]/social-image.webp/route.tsx:7). These are scanner observations consistent with the live HTML responses, not a complete route-local implementation review.

Next.js documents that `force-dynamic` bypasses the Full Route Cache and Data Cache in the non-Cache-Components model. Separate application/database caches or memoized image rendering cannot be ruled in or out from these HTTP measurements. [Next.js caching](https://nextjs.org/docs/app/guides/caching-without-cache-components).

For the intended caching design, static generation fits About; public home/profile content can use ISR with explicit invalidation when selected persona data changes. A candidate freshness target is 24 hours plus on-demand invalidation, subject to verifying that the shared output contains no session-specific state. This is a design proposal, not an implemented or verified safe configuration. Do not merely overwrite private response headers.

For social images, keep the already-working static/image caching. Stable profile image URLs can remain in browser/social-platform caches for their freshness period; version the URL when the underlying result or image design changes if previews must refresh promptly. Public participant pages/images require publication-aware invalidation: unpublishing must not leave a long-lived shared copy at a still-valid URL. The successful example proves response caching, but unpublication invalidation was not tested because this audit made no publication changes.

Vercel consumes CDN-specific directives before returning a response, so an absent visible `s-maxage` does not prove missing edge caching. Warm `HIT`/`Age` evidence is stronger; the profile image demonstrates this. [Vercel cache-control behavior](https://vercel.com/docs/caching/cache-control-headers).

## Scope and evidence

Vercel project `saasify/doom-or-bloom` was verified using the supplied project ID and existing CLI authentication. Observability Plus was unavailable; the user selected a limited scanner-only audit. No route traffic, cache-hit percentage, ISR read/write count, or cost-impact conclusion is available. The scanner-only workflow produced no supported optimization candidates; the findings above come from production HTTP responses, Lighthouse, and explicitly labeled scanner observations.

The Vercel CLI created the local project link and downloaded its local OIDC environment file. Its redundant `.gitignore` addition was reverted. No deployment, production configuration, or application code was changed.

The first three pages were tested at approximately 03:47–03:50 Bangkok time against deployment `dpl_4BxwrPy6XzxhwMJf4nGQmym4bMuX`. The replacement assessment was tested around 04:01–04:02 against `dpl_6bZeuRgPbs5gTZRJp4kkLfvyBXbd`; the deployment changed during the audit. Scores are timestamped snapshots, not an assertion that all four were tested on one deployment.

Raw artifacts are in `/tmp/doom-production-audit-20260924/`:

- `home-mobile-repeat.report.html`, `about-mobile.report.html`, `profile-mobile.report.html` and matching JSON.
- `home-desktop.report.html`, `about-desktop.report.html`, `profile-desktop.report.html` and matching JSON.
- `assessment-valid-mobile.report.html` and `assessment-valid-desktop.report.html`, with matching JSON, cover the replacement URL. `assessment-mobile.report.json` records the superseded URL’s 404.
- `*-warm.headers`, `profile-image-third.headers`, `profile-image-fourth.headers` capture warm cache evidence.
- `*-bot.html` captures crawler metadata; `about-film-*.jpg` captures the layout shift.
- `profile-social.webp` and `assessment-valid-social.webp` are the verified dynamic previews. `assessment-valid-image-warm.headers` captures the latter’s cache hit.
- `vercel-report.md` contains the limited Vercel workflow output.

## Local implementation follow-up

The user requested hiding the mobile header CTA and enabling ISR for landing, About, and curated persona pages, with an interval of at least 24 hours. The local implementation now uses `revalidate = 86400`; production-mode verification confirms shared cache hits. At 320/390 px the anonymous CTA and loading placeholder are hidden and the header no longer changes height after session resolution. Participant public HTML and all image policies were left as audited. See the [checkpoint evidence](../persistence-implementation-plan.md#public-page-isr-and-mobile-header--september-24-2026). These changes have not been deployed; the measurements above describe the production audit before the changes.

ISR trades per-render function/database work for cached delivery and occasional regeneration. Cache reads/writes and network delivery still have costs; low-traffic pages may see little net cost benefit, while repeatedly visited pages can avoid most origin renders. The 24-hour interval is request-driven, not a daily background job, and content may remain stale until a subsequent request triggers successful regeneration. Exact savings were not measured. [Vercel ISR tradeoffs](https://vercel.com/blog/isr-a-flexible-way-to-cache-dynamic-content).
