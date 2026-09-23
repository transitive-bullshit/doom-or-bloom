# Production SEO and launch-readiness audit — September 22, 2026

Production baseline: https://www.doom-or-bloom.com. Implementation changes are local and require the separate deployment task before they affect production.

## Coverage and production findings

Read all 47 public pages (homepage, assessment, about, privacy, 43 personas) with Twitterbot's user agent, plus robots.txt, sitemap.xml, llms.txt and the advertised social image. All returned HTTP 200. Every page had the same title and description, no canonical link, and the same generic image on the non-www hostname. Page-specific Open Graph titles, descriptions and URLs were absent. These meaningful sharing/search gaps were not detected by Lighthouse's 100 SEO scores.

The live sitemap already contained exactly the 47 public pages on the www hostname. robots.txt already allowed `/` for every user agent and disallowed only `/api/` and `/api$`. llms.txt already listed the public pages and distinguished simulated personas from actual submissions. Retained those working mechanisms; updated shared descriptions and added experimental-measurement caveats to llms.txt. No fabricated modification dates, crawl restrictions or unsupported structured-data claims were added.

## Implemented

- Consistent `https://www.doom-or-bloom.com` metadata base, self-referencing canonicals and Open Graph URLs.
- Unique titles and descriptions for the four main pages and all 43 personas; explicit Open Graph and X large-image metadata, dimensions, image content type and alternative text.
- Persona-specific Takumi social images using the saved result's actual outlook and transformation coordinates, with interpretation ranges and tentative/unsettled/unplaced handling. Named people are clearly labeled as simulations, not participants who submitted these answers.
- A default site card showing the real distribution of public persona positions and the site's invitation to map your own worldview.
- Explicit WebP output at 1200 × 630, quality 90, on the Node runtime. Persona image routes use a one-day revalidation interval. The root image is generated at build time. Participant PNG downloads remain available.
- Explicit `index, follow` metadata inherited by normal pages. API routes remain excluded through robots.txt; no additional crawler exclusions.
- Regression checks for result-to-map data, actual WebP decoding, emitted crawler metadata, every advertised image, sitemap coverage and API-only robots exclusions. Deployment trace checks now also require the persona image route's saved journey data.

## PNG versus WebP

Measured the same Takumi JSX in both formats on this Mac. Each case had one warmup and three measured renders; times are medians, not production cold-start predictions. Both formats decoded at 1200 × 630. Visually inspected the site and persona WebP output.

| Card | PNG bytes | WebP bytes | Reduction | PNG render | WebP render |
| --- | --: | --: | --: | --: | --: |
| Site | 91,804 | 46,846 | 49.0% | 9.8 ms | 19.8 ms |
| Sam Altman | 90,082 | 49,056 | 45.5% | 8.4 ms | 18.7 ms |
| Eliezer Yudkowsky | 91,392 | 50,780 | 44.4% | 8.3 ms | 18.6 ms |
| Marc Andreessen | 91,305 | 50,610 | 44.6% | 9.1 ms | 20.9 ms |

Selected WebP for roughly half the transfer size at a small rendering cost, amortized by caching. PNG is faster to encode and lossless; WebP quality 90 keeps this graphic readable. The encoder and HTTP/metadata MIME type agree. Actual X/Meta unfurling of the new URLs still needs checking after deployment; fetching with a crawler user agent does not prove platform cache refresh or platform rendering. [Takumi output format documentation](https://takumi.kane.tw/docs/output-formats).

## Production Lighthouse baseline

Lighthouse 13.5.0, local headless Chrome, default simulated mobile settings, one cold-navigation run per page against production. These are lab samples, not real-user Core Web Vitals or a prediction of field INP. Avoid treating a few points as statistically significant; [Lighthouse documents score variability](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring).

| Page | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | --: | --: | --: | --: | --: | --: | --: | --: |
| `/` | 94 | 96 | 100 | 100 | 1.4 s | 2.7 s | 120 ms | 0 |
| `/assessment` | 96 | 100 | 100 | 100 | 0.9 s | 2.7 s | 60 ms | 0 |
| `/users/sama` | 95 | 96 | 100 | 100 | 1.0 s | 2.9 s | 60 ms | 0 |
| `/about` | 96 | 100 | 100 | 100 | 1.0 s | 2.6 s | 100 ms | 0 |

## Remaining launch follow-ups

1. **Deploy and validate social unfurls.** Run the included `--check` audit on production after deployment, then use real social previews to confirm cache refresh. This work did not deploy or submit anything to a social platform.
2. **Touch targets on the map and embedded posts.** Homepage portraits overlap at exact coordinates, which Lighthouse flags. The separate people grid remains an alternate navigation surface. Moving dots would violate the product's deliberate exact-coordinate design; a touch-specific chooser deserves a focused design task. The Sam Altman page's embedded post author/follow links also have undersized targets.
3. **Client JavaScript.** Lighthouse estimates 93–108 KiB of unused code on initial load and 300–550 ms potential LCP savings. The persona sample spent about 1.7 s evaluating scripts. These measurements identify a follow-up investigation, not proof that the reported code is unused during interaction. Inspect chunk ownership and interaction coverage before removing or splitting it.
4. **Portrait delivery.** Homepage image-delivery diagnostics estimate 519 KiB of savings from smaller/modern images; the persona portrait adds about 10 KiB. Both have zero estimated LCP benefit in these runs, so this is a bandwidth improvement rather than a claimed score win. The current UI explicitly bypasses Next image optimization. Consider a dedicated resized WebP asset pass or correctly sized Next Image output.
5. **About page JSON controls.** Lighthouse reports accessible names that do not contain all visible JSON label text, despite the overall 100 accessibility score. Align those control labels in a focused accessibility pass.
6. **Search operations after deployment.** Verify domain ownership and sitemap submission in Search Console/Bing Webmaster Tools, then inspect indexing and real-user metrics as traffic accumulates. Account status was not inspected. llms.txt is informational and is not evidence of search or AI crawler indexing.

No broad performance rewrite is justified by the measured scores. No INP/CrUX field dataset, desktop Lighthouse runs, manual screen-reader audit, or social-platform unfurl verification was collected.

## Verification

All 47 routes passed the emitted-head metadata assertions in both local development and the isolated production build. All 44 advertised image URLs returned decodable 1200 × 630 WebP responses. Unknown persona pages and images returned 404. The final production-mode image route returned `x-nextjs-cache: MISS` then `HIT`, with `s-maxage=86400`. All 226 unit tests passed, as did TypeScript, lint, formatting, the production build and saved-journey trace checks. These are local implementation checks; the production Lighthouse scores above remain the pre-deployment baseline.

## Reproduction and evidence

- `node --import tsx scripts/audit-seo.ts` captures the production baseline without assertions.
- `node --import tsx scripts/audit-seo.ts https://www.doom-or-bloom.com /tmp/doom-seo-audit/after-deploy.json --check` verifies deployed changes.
- For local development, use `pnpm dev` and `pnpm exec portless get doom-or-bloom --no-worktree`, then pass that URL and an output path to the same script with `--check`.
- `node --import tsx scripts/benchmark-social-images.ts` regenerates the comparison images and benchmark in `/tmp/doom-seo-audit/images`.
- `pnpm dlx lighthouse https://www.doom-or-bloom.com/ --chrome-flags='--headless' --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=/tmp/doom-seo-audit/home.json --quiet`; repeat for other paths, sequentially.
- `NEXT_TEST_DIST_DIR=.next-seo-audit pnpm build` isolates the production build from the existing development server.

Committed evidence: [production metadata](seo-launch-2026-09-22/production-metadata.json), [Lighthouse summaries and exact settings](seo-launch-2026-09-22/lighthouse-summary.json), [format benchmark](seo-launch-2026-09-22/image-benchmark.json). Full temporary Lighthouse JSON reports are under `/tmp/doom-seo-audit/` on the audit machine.

## Profile-photo follow-up

Both card variants now show the same actual profile photos as the webapp at their saved map positions: 30px circular portraits on the default map and a 48px subject portrait on persona maps. Checked-in photos are embedded as data URLs; no external image fetch is required. The deployment trace check verifies that the persona-image server bundle includes the portrait assets. Both variants were visually inspected after rendering.

Repeating the comparison with photos yielded site PNG/WebP sizes of 154,190/68,670 bytes (55.5% smaller), Sam Altman 95,091/50,460 (46.9%), Eliezer Yudkowsky 95,818/52,040 (45.7%), and Marc Andreessen 95,774/52,798 (44.9%). WebP remains the selected format. The original table above records the earlier dot-based cards; [the portrait benchmark](seo-launch-2026-09-22/portrait-image-benchmark.json) records the updated measurements.

## September 23 — Static default artwork

The site-wide image is now the supplied `app/opengraph-image.jpg` (1200 × 630). Non-persona page metadata imports the actual JPEG so its content-hashed URL and dimensions track file replacements, with the correct JPEG type for both Open Graph and X cards. The root file convention also supplies the default for pages without explicit metadata. The accompanying alt-text file describes the botanical circuit artwork. Persona pages retain their explicit, generated WebP map images. Removed obsolete root image tracing rules and updated the full-route SEO audit to verify JPEG defaults alongside persona WebP responses.
