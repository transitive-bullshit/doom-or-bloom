# Internationalization

This is the current contract for languages: which ones are live, how locale URLs route and cache, and how to add a string or a locale. The [October 1 spike](research/i18n-spike-2026-10-01.md) records the research and the later phases; this document wins where they differ.

## Scope

Enabled locales are English (`en`, the default) and Spanish (`es`). The full planned list lives in `i18n/config.ts`: Brazilian Portuguese, Hindi, Simplified Chinese, Thai, Japanese, German, French and Indonesian are present but disabled.

Translated (phases 1 and 2):

- the site chrome: header, footer, language selector, breadcrumbs, the not-found page, CTAs, page titles and descriptions (`Pages`);
- the landing page and the `/users` directory;
- the About and Privacy pages and the legacy `/assessment` start page;
- the whole assessment interface: the interview, readiness, recovery and error copy, toasts and aria-labels, self-placement, the result (map, P(doom) card, closest worldviews, details, feedback, share bar and captions), the publish dialog and the library;
- simulated-user and public assessment page chrome, their metadata, and their social images;
- the downloaded share card and the Markdown report;
- text that `lib/` code builds: result reasons, P(doom) ranges, claim scopes and readings, facet and experimental-axis labels and levels, milestone and hinge labels, self-placement comparisons, share captions, tension and correction prompts and API error messages.

Not translated yet (phase 3): authored assessment content from `content/` (questions, recovery copy, choices, rubric dimension levels, findings and resources) and the persona answers and descriptions. In Spanish the interview therefore shows Spanish UI around English questions; that is accepted for now. Admin, local review tools, debug panels (including the JSON inspector that About and simulated-user pages embed, which shows raw English data and field help), the fixture-mode badge, llms.txt and API error bodies stay English.

## URL segments and language tags

Each catalog entry in `i18n/config.ts` has a `code` and a `tag`:

- `code` is the URL segment and the next-intl locale id. It is short and lowercase: Brazilian Portuguese is `/pt/…` and Simplified Chinese `/zh/…`.
- `tag` is the BCP 47 language tag (`pt-BR`, `zh-Hans`; for English and Spanish it equals the code). Use `languageTag(code)` wherever a language is declared: `<html lang>`, hreflang alternates (`languageAlternates`), the sitemap, `lang` attributes, llms.txt and `Intl` formatting. `openGraph` is the og:locale form.

next-intl formats ICU numbers and plurals with the segment locale; CLDR resolves `pt` and `zh` to the same data as `pt-BR` and `zh-Hans`. Format dates and other explicit `Intl` calls with `languageTag(useLocale())`, never a hard-coded `'en-US'`.

## Routing

English URLs are unchanged. Every other locale adds a `/<code>` prefix (`localePrefix: 'as-needed'`), so `/users/simonw` is English and `/es/users/simonw` is Spanish. A superfluous `/en/…` prefix redirects (307) to the unprefixed URL.

- Pages live under `app/[locale]/`. `app/[locale]/layout.tsx` is the root layout: it sets `<html lang>` and generates every enabled locale. The locale is a root param read through `next/root-params` in `i18n/request.ts`, so pages stay static; `setRequestLocale` is not used.
- `app/[locale]/(site)/layout.tsx` returns a 404 when the first segment is not a locale, e.g. `/api/about` matching `[locale]=api`.
- Outside the locale tree: `app/api/`, `app/(internal)/` (admin, `/questions`, `/corpus`, `/user-journeys`, `/prototypes`, English-only with its own root layout and no language selector), `llms.txt`, `robots.txt`, `sitemap.xml`, `/public/assessments/<id>/data`, the English `/public/assessments/<id>/social-image.png` and `/users/<slug>/opengraph-image`.
- There is no proxy function. `i18n/next-routes.ts` generates `next.config.ts` rules, which Vercel applies in its routing layer before the cache:
  - an `afterFiles` rewrite serves unprefixed page URLs from `/en/…`. It runs after static files and non-dynamic routes and before dynamic routes;
  - redirects drop the `/en` prefix and apply the [explicit choice](#persistence-of-the-choice). They run after the legacy `/assessment/<id>` and WebP image redirects, so a remembered language applies to the new URL.
- A new top-level route outside `app/[locale]` that has a dynamic segment must be added to `unlocalizedSegments` or `unlocalizedRoutes` in `i18n/next-routes.ts`. Otherwise the rewrite sends it to `/en/…` and it 404s. `i18n/next-routes.test.ts` runs the rules through Next's own matchers.
- Links and navigation inside localized UI, including the assessment components, use `Link`, `useRouter`, `redirect`, `usePathname` and `getPathname` from `@/i18n/navigation`, which add the current prefix. Share links, copied public links and the X sign-in callback keep the visitor's language.
- `notFound()` inside a page renders the localized `app/[locale]/not-found.tsx`. A URL that matches no route, including `/es/<unknown>`, gets the server-rendered English `app/global-not-found.tsx` (`experimental.globalNotFound`).
- An unsaved draft's ticket cookie is set for the owner page in every enabled locale (`assessment-draft` for `/assessments/<id>`, `assessment-draft-<code>` for `/<code>/assessments/<id>`), so a draft opens in any language ([PERSISTENCE.md](PERSISTENCE.md#product-behavior)). Each enabled locale adds about 2 KB to the start response.

## Persistence of the choice

The footer selector writes a `NEXT_LOCALE` cookie in the browser: one year, `Path=/`, `SameSite=Lax`, `Secure` over HTTPS. It is a strictly functional preference set only by an explicit choice. The selector then loads the same path in the new locale, keeping the query string and hash.

- The URL stays authoritative. With `NEXT_LOCALE=es`, an unprefixed page URL redirects (307) to its `/es` form; prefixed URLs, APIs, files and tools never redirect. Choosing English writes `en`, which stops the redirects.
- Accept-Language is never used: no detection, no redirect and, for now, no suggestion banner.
- Page responses never set a cookie or vary on one, so Vercel can cache them. Browser tests and `check:prefetch` assert this.

## Static rendering and caching

- `/`, `/about`, `/privacy`, `/users`, `/assessment` and the sitemap are generated for every enabled locale with their existing revalidation intervals.
- Simulated-user profiles and published participant pages are pregenerated in English only. Other locales render on their first request, then cache and revalidate like English. Next 16.3 disables pregeneration for the whole route if `generateStaticParams` returns an empty list for any parent locale, so these pages return `{ locale: 'en', … }` for every parent and the duplicates collapse.
- A published participant page outside English advertises its own social card at `/<code>/public/assessments/<id>/social-image.png` (`app/[locale]/(site)/public/assessments/[id]/social-image.png/route.tsx`). It renders on its first request and caches like the English image. Publication changes expire the public URL and each `/<locale>/public/assessments/<id>` rendering, the English image and each other locale's image. Warmup fetches the English page and image only ([PERSISTENCE.md](PERSISTENCE.md#public-pages-and-social-images)).
- Profile previews add `&locale=<code>` to `/users/<slug>/opengraph-image?v=png-1` outside English. Owner downloads (`/api/share-card`, `/api/assessments/<id>/results-image`) take the page's `?locale=`; English requests omit it.
- Owner routes are private and no-store under every prefix (`privateRoutePrefixes`), and robots.txt disallows them under every prefix.

## Search metadata

`pageMetadata` in `lib/metadata.ts` takes the page's `locale` and whether its main content is `translated`:

- Translated pages (`translated: true` in `publicPages`: `/`, `/about`, `/privacy` and `/users`) canonicalize to themselves. They list every enabled locale as an hreflang alternate keyed by its language tag, with English as `x-default`, and set `og:locale` and its alternates.
- Simulated-user profiles and public assessments are noindex outside English. Their answers stay in their original language, so they canonicalize to the English URL and advertise no alternates, following Google's guidance against boilerplate-only translations.

The sitemap lists every locale URL of a translated page with `alternates.languages`, and only the English URL of other pages. `llms.txt` stays English and ends with a Languages section.

Fonts stay system fonts. `app/globals.css` adds `:lang()` fallback stacks for hi, th, zh and ja, relaxes tight Latin tracking for those scripts and gives Thai and Devanagari taller headings; `components/landing/prism.css` does the same for the hero. Takumi's default font covers Spanish; cards in non-Latin scripts need registered fonts first (deferred).

## Adding a string

1. Add the key to `messages/en.json` under the namespace that owns it, and its translation to every other enabled catalog. Keys are typed from the English catalog (`i18n/app-config.d.ts`). `i18n/messages.test.ts` parses every message, including select and plural branches, and fails on a missing or empty message, mismatched arguments or rich-text tags, a select or plural without `other`, or a message that does not format.
2. Read it with `useTranslations` in components (server or client) or `getTranslations` in async server code. Prefer server components for static copy: their messages never reach the browser.
3. Client components receive only the namespaces of their surface. The root layout sends the chrome; a page wraps its client tree in `<SurfaceMessages surface='…'>` (`components/surface-messages.tsx`), whose namespaces are listed in `i18n/client-messages.ts` (`interview`, `library`, `published`, and `review` for local tools). Add a new client namespace to every surface that renders it; a missing one logs `MISSING_MESSAGE`, which the Spanish browser tests fail on.
4. Use ICU for plurals, numbers and choices (`{count, plural, one {…} other {…}}`, `{count, number}`, `{subject, select, self {…} other {…}}`) and rich text for links (`t.rich('key', { link: (chunks) => <Link …>{chunks}</Link> })`). Write whole sentences as messages; never assemble them from fragments or lowercase a label to fit it into a sentence. Where a sentence needs a noun phrase, give it its own message (see `Claims.topics`).
5. Follow the product copy rules: no trailing periods on headlines, CTAs, labels or captions, the interview takes "about 3 minutes", and personas are "thought leaders" (`líderes de opinión`). Doom, Bloom, P(doom) and Doom or Bloom stay untranslated. Keep a neutral, plain register (for Spanish, neutral rather than regional, with `tú`).

### Text built in `lib/`

Functions in `lib/` that produce participant-facing text take the root translator as their first argument: `t: Translator` from `i18n/translator.ts`, which is what `useTranslations()` and `getTranslations()` return. They use full keys (`t('Share.caption.none')`). Examples: `shareCaption`, `placementComparison`, `pdoomRangeLabel`, `serializeReport` and `userErrorMessage`.

- Route handlers have no root params and unit tests have no request: use `translatorFor(locale)` or `englishTranslator()` from `i18n/translators.ts`, and `testTranslator(locale)` from `i18n/test-translator.ts` in tests. Scripts run with `--conditions=react-server` cannot load next-intl at runtime, so code they import (such as `lib/assessments/http.ts`) reads `messages/en.json` directly.
- Saved snapshots keep canonical English. Jev reads it, and `validateSnapshot` and `isAuthoredClaim` match stored prompts and claims exactly, so never store display text. `lib/assessment/display-text.ts` maps stored text back to IDs at render time: `claimText`, `componentLabel`, `milestoneLabel`, `hingeLabel`, `hingeQuestion` and `promptText` (tension and correction prompts). English messages for those IDs must equal the canonical text; `display-text.test.ts` asserts it, so changing the code's English without the catalog fails.
- Anything that is not canonical code-built text passes through unchanged: authored content, participant and persona answers, and saved labels that differ from their ID's canonical text.

## Enabling a locale

1. Set `enabled: true` for it in `i18n/config.ts`. Its URL segment is `code`; check `tag` and `openGraph`.
2. Add `messages/<code>.json` with every key, reviewed by a native speaker.
3. Update tests that list the enabled locales: `i18n/config.test.ts`, the private prefixes in `i18n/next-routes.test.ts`, the draft cookies in `tests/persistence/lazy-drafts.spec.ts`, and the robots list in `scripts/audit-seo.ts`.
4. For a non-Latin script, register Takumi fonts for the cards and social images before enabling it.
5. Run `pnpm test`, `pnpm check:browser tests/browser/i18n.spec.ts tests/browser/i18n-assessment.spec.ts`, `pnpm check:persistence tests/persistence/lazy-drafts.spec.ts`, `pnpm build:local` and `pnpm check:prefetch`, and review the pages at phone and desktop widths, including the map labels.

Each locale adds its static pages to the build; profiles, public assessments and their social images render on demand.

## Deferred

- Phase 3, authored content: committed per-locale overlays for `content/` releases and rubrics (questions, recovery copy, rubric dimension levels, findings, resources), validated and frozen with their release, plus the placement questions in `lib/assessment/self-placement.ts`, which equal their authored prompts. Claims that quote rubric levels then localize through `claimText`, and correction prompts can name the dimension in the participant's language. Record a display locale per answer, add Jev locale context and multilingual P(doom) extraction, and run the paired Jev validation probe ([spike](research/i18n-spike-2026-10-01.md) §4–5). Jev inputs and engine versions stay unchanged until then.
- Simulated answers and persona descriptions: translate at publish time (spike option C) before their pages are indexed outside English.
- Takumi fonts for non-Latin scripts and a per-locale site social image (`app/opengraph-image.png`).
- The client-side "View in Español?" suggestion banner.
- Message precompilation (`experimental.messages.precompile`) if the client catalog grows.
- The remaining locales.
- Verifying on a Vercel Preview that cookie redirects are served without a function and cached pages stay hits.
