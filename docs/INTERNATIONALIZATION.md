# Internationalization

This is the current contract for languages: which ones are live, how locale URLs route and cache, and how to add a string or a locale. The [October 1 spike](research/i18n-spike-2026-10-01.md) records the research and the later phases; this document wins where they differ.

## Scope

Enabled locales are English (`en`, the default) and Spanish (`es`). The full planned list lives in `i18n/config.ts`: pt-BR, hi, zh-Hans, th, ja, de, fr and id are present but disabled.

Phase 1 translates the site chrome only:

- header, footer, language selector and breadcrumbs;
- the landing hero, map labels and notes, and the `/users` directory controls;
- the "Map your own worldview" CTA, the worldview CTA card, and the compare prompt and pinned phone CTA on shared pages;
- the not-found page;
- page titles and descriptions (`Pages` in the catalogs) and the site description.

Everything else stays English for now: the interview, results, simulated-user and public assessment content, the About and Privacy bodies, admin and local tools, llms.txt, social images and API errors.

## Routing

English URLs are unchanged. Every other locale adds a `/<code>` prefix (`localePrefix: 'as-needed'`), so `/users/simonw` is English and `/es/users/simonw` is Spanish. A superfluous `/en/…` prefix redirects (307) to the unprefixed URL.

- Pages live under `app/[locale]/`. `app/[locale]/layout.tsx` is the root layout: it sets `<html lang>` and generates every enabled locale. The locale is a root param read through `next/root-params` in `i18n/request.ts`, so pages stay static; `setRequestLocale` is not used.
- `app/[locale]/(site)/layout.tsx` returns a 404 when the first segment is not a locale, e.g. `/api/about` matching `[locale]=api`.
- Outside the locale tree: `app/api/`, `app/(internal)/` (admin, `/questions`, `/corpus`, `/user-journeys`, `/prototypes`, English-only with its own root layout and no language selector), `llms.txt`, `robots.txt`, `sitemap.xml`, `/public/assessments/<id>/data`, `/public/assessments/<id>/social-image.png` and `/users/<slug>/opengraph-image`.
- There is no proxy function. `i18n/next-routes.ts` generates `next.config.ts` rules, which Vercel applies in its routing layer before the cache:
  - an `afterFiles` rewrite serves unprefixed page URLs from `/en/…`. It runs after static files and non-dynamic routes and before dynamic routes;
  - redirects drop the `/en` prefix and apply the [explicit choice](#persistence-of-the-choice). They run after the legacy `/assessment/<id>` and WebP image redirects, so a remembered language applies to the new URL.
- A new top-level route outside `app/[locale]` that has a dynamic segment must be added to `unlocalizedSegments` or `unlocalizedRoutes` in `i18n/next-routes.ts`. Otherwise the rewrite sends it to `/en/…` and it 404s. `i18n/next-routes.test.ts` runs the rules through Next's own matchers.
- Links inside localized UI use `Link`, `redirect`, `usePathname` and `getPathname` from `@/i18n/navigation`, which add the current prefix. Links in `components/assessment/` still point at unprefixed English URLs (deferred).
- `notFound()` inside a page renders the localized `app/[locale]/not-found.tsx`. A URL that matches no route, including `/es/<unknown>`, gets the server-rendered English `app/global-not-found.tsx` (`experimental.globalNotFound`).

## Persistence of the choice

The footer selector writes a `NEXT_LOCALE` cookie in the browser: one year, `Path=/`, `SameSite=Lax`, `Secure` over HTTPS. It is a strictly functional preference set only by an explicit choice. The selector then loads the same path in the new locale, keeping the query string and hash.

- The URL stays authoritative. With `NEXT_LOCALE=es`, an unprefixed page URL redirects (307) to its `/es` form; prefixed URLs, APIs, files and tools never redirect. Choosing English writes `en`, which stops the redirects.
- Accept-Language is never used: no detection, no redirect and, for now, no suggestion banner.
- Page responses never set a cookie or vary on one, so Vercel can cache them. Browser tests and `check:prefetch` assert this.

## Static rendering and caching

- `/`, `/about`, `/privacy`, `/users` and the sitemap are generated for every enabled locale with their existing revalidation intervals.
- Simulated-user profiles and published participant pages are pregenerated in English only. Other locales render on their first request, then cache and revalidate like English. Next 16.3 disables pregeneration for the whole route if `generateStaticParams` returns an empty list for any parent locale, so these pages return `{ locale: 'en', … }` for every parent and the duplicates collapse.
- Publication changes expire the public URL and each `/<locale>/public/assessments/<id>` rendering, plus the social image. Warmup fetches the English page and the image only ([PERSISTENCE.md](PERSISTENCE.md#public-pages-and-social-images)).
- Owner routes are private and no-store under every prefix (`privateRoutePrefixes`), and robots.txt disallows them under every prefix.

## Search metadata

`pageMetadata` in `lib/metadata.ts` takes the page's `locale` and whether its main content is `translated`:

- Translated pages (`translated: true` in `publicPages`, currently `/` and `/users`) canonicalize to themselves. They list every enabled locale as an hreflang alternate, with English as `x-default`, and set `og:locale` and its alternates.
- Chrome-only pages (About, Privacy, simulated-user profiles and public assessments) are noindex outside English. They canonicalize to the English URL and advertise no alternates, following Google's guidance against boilerplate-only translations.

The sitemap lists every locale URL of a translated page with `alternates.languages`, and only the English URL of other pages. `llms.txt` stays English and ends with a Languages section.

Fonts stay system fonts. `app/globals.css` adds `:lang()` fallback stacks for hi, th, zh and ja, relaxes tight Latin tracking for those scripts and gives Thai and Devanagari taller headings; `components/landing/prism.css` does the same for the hero.

## Adding a string

1. Add the key to `messages/en.json` under the namespace that owns it, and its translation to every other enabled catalog. Keys are typed from the English catalog (`i18n/app-config.d.ts`). `i18n/messages.test.ts` fails on a missing or empty message or on mismatched ICU arguments.
2. Read it with `useTranslations` in components (server or client) or `getTranslations` in async server code. A client component's namespace must be listed in `i18n/client-messages.ts`; the provider sends only those namespaces to the browser. Route handlers have no root params, so pass the locale: `getTranslations({ locale, namespace })`.
3. Use ICU for plurals and numbers (`{count, plural, one {…} other {…}}`, `{count, number}`). Write whole sentences as messages; never assemble them from fragments.
4. Follow the product copy rules: no trailing periods on headlines, CTAs or labels, and the interview takes "about 3 minutes". Doom, Bloom, P(doom) and Doom or Bloom stay untranslated. Keep a neutral, plain register (for Spanish, neutral rather than regional).

## Enabling a locale

1. Set `enabled: true` for it in `i18n/config.ts`.
2. Add `messages/<code>.json` with every key, reviewed by a native speaker.
3. Update tests that list the enabled locales: `i18n/config.test.ts`, the private prefixes in `i18n/next-routes.test.ts`, and the robots list in `scripts/audit-seo.ts`.
4. Run `pnpm test`, `pnpm check:browser tests/browser/i18n.spec.ts`, `pnpm build:local` and `pnpm check:prefetch`, and review the pages at phone and desktop widths.

Each locale adds its static pages to the build; profiles and public assessments render on demand. Decide URL casing before enabling `pt-BR` or `zh-Hans`: the prefix is currently the code itself (`/pt-BR`).

## Deferred

- Strings in `components/assessment/`, `lib/assessment/` and `content/`, plus the About and Privacy bodies. Localized links inside assessment components.
- Authored-content overlays, a display locale per answer, multilingual P(doom) extraction and the Jev validation probe ([spike](research/i18n-spike-2026-10-01.md) §4–5). Jev inputs stay English.
- Takumi fonts, localized share cards and a per-locale site social image.
- The client-side "View in Español?" suggestion banner.
- Message precompilation (`experimental.messages.precompile`) if the client catalog grows.
- The remaining locales.
- Verifying on a Vercel Preview that cookie redirects are served without a function and cached pages stay hits.
