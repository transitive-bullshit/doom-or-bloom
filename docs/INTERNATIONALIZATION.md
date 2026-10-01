# Internationalization

This is the current contract for languages: which ones are live, how locale URLs route and cache, how authored content is translated and reviewed, and how to add a string or a language. The [October 1 spike](research/i18n-spike-2026-10-01.md) records the research and the later phases; this document wins where they differ.

## Scope

Every planned locale is enabled: English (`en`, the default), Spanish (`es`), Brazilian Portuguese (`pt`), Hindi (`hi`), Simplified Chinese (`zh`), Thai (`th`), Japanese (`ja`), German (`de`), French (`fr`) and Indonesian (`id`). The list lives in `i18n/config.ts`.

Translated:

- the site chrome: header, footer, language selector, breadcrumbs, the not-found page, CTAs, page titles and descriptions (`Pages`);
- the landing page and the `/users` directory;
- the About and Privacy pages and the legacy `/assessment` start page;
- the whole assessment interface: the interview, readiness, recovery and error copy, toasts and aria-labels, self-placement, the result (map, P(doom) card, closest worldviews, details, feedback, share bar and captions), the publish dialog and the library;
- simulated-user and public assessment page chrome, their metadata, and their social images;
- the chrome of the P(doom) hub (table headings, labels, the “As of” line, notes and CTA) and of the blog (index heading, bylines, reading times), and their metadata;
- the downloaded share card, the map image and the Markdown report;
- text that `lib/` code builds: result reasons, P(doom) ranges, claim scopes and readings, facet and experimental-axis labels and levels, milestone and hinge labels, self-placement comparisons, share captions, tension and correction prompts and API error messages;
- authored assessment content from `content/`: questions (including the placement and split-outlook questions), their recovery copy, findings, resources and rubric level texts ([Authored content](#authored-content)).

Not translated: blog posts and their social cards and feed, the P(doom) hub’s explainer ([BLOG.md](BLOG.md#languages)), participant answers and simulated answers (Jev reads answers as written; see [Jev and the participant's language](#jev-and-the-participants-language)), persona descriptions, admin, local review tools, debug panels (including the JSON inspector that About and simulated-user pages embed), the fixture-mode badge, llms.txt (English, with a Languages section) and API error bodies. The library page's report download keeps authored text in English; the report from the interview page translates it.

All translations other than the Spanish UI catalog are machine translations. Native review is required only for the root question, the recovery and retry copy and the wording of result claims ([Review](#review)); it does not block a release.

## URL segments and language tags

Each catalog entry in `i18n/config.ts` has a `code` and a `tag`:

- `code` is the URL segment and the next-intl locale id. It is short and lowercase: Brazilian Portuguese is `/pt/…` and Simplified Chinese `/zh/…`.
- `tag` is the BCP 47 language tag (`pt-BR`, `zh-Hans`; for English and Spanish it equals the code). Use `languageTag(code)` wherever a language is declared: `<html lang>`, hreflang alternates (`languageAlternates`), the sitemap, `lang` attributes, llms.txt and `Intl` formatting. `openGraph` is the og:locale form.

next-intl formats ICU numbers and plurals with the segment locale; CLDR resolves `pt` and `zh` to the same data as `pt-BR` and `zh-Hans`. Format dates and other explicit `Intl` calls with `languageTag(useLocale())`, never a hard-coded `'en-US'`.

## Routing

English URLs are unchanged. Every other locale adds a `/<code>` prefix (`localePrefix: 'as-needed'`), so `/users/simonw` is English and `/es/users/simonw` is Spanish. A superfluous `/en/…` prefix redirects (307) to the unprefixed URL.

- Pages live under `app/[locale]/`. `app/[locale]/layout.tsx` is the root layout: it sets `<html lang>` and generates every enabled locale. The locale is a root param read through `next/root-params` in `i18n/request.ts`, so pages stay static; `setRequestLocale` is not used.
- `app/[locale]/(site)/layout.tsx` returns a 404 when the first segment is not a locale, e.g. `/api/about` matching `[locale]=api`.
- Outside the locale tree: `app/api/`, `app/(internal)/` (admin, `/questions`, `/corpus`, `/user-journeys`, `/prototypes`, English-only with its own root layout and no language selector), `llms.txt`, `robots.txt`, `sitemap.xml`, `/public/assessments/<id>/data`, the English `/public/assessments/<id>/social-image.png`, `/users/<slug>/opengraph-image`, `/blog/rss.xml` and `/blog/<slug>/opengraph-image`.
- There is no proxy function. `i18n/next-routes.ts` generates `next.config.ts` rules, which Vercel applies in its routing layer before the cache:
  - an `afterFiles` rewrite serves unprefixed page URLs from `/en/…`. It runs after static files and non-dynamic routes and before dynamic routes;
  - redirects drop the `/en` prefix and apply the [explicit choice](#persistence-of-the-choice). They run after the legacy `/assessment/<id>` and WebP image redirects, so a remembered language applies to the new URL.
- A new top-level route outside `app/[locale]` that has a dynamic segment must be added to `unlocalizedSegments` or `unlocalizedRoutes` in `i18n/next-routes.ts`. Otherwise the rewrite sends it to `/en/…` and it 404s. `i18n/next-routes.test.ts` runs the rules through Next's own matchers.
- Links and navigation inside localized UI, including the assessment components, use `Link`, `useRouter`, `redirect`, `usePathname` and `getPathname` from `@/i18n/navigation`, which add the current prefix. Share links, copied public links and the X sign-in callback keep the visitor's language.
- `notFound()` inside a page renders the localized `app/[locale]/not-found.tsx`. A URL that matches no route, including `/es/<unknown>`, gets the server-rendered English `app/global-not-found.tsx` (`experimental.globalNotFound`).
- An unsaved draft's ticket cookie is set for the owner page in every enabled locale (`assessment-draft` for `/assessments/<id>`, `assessment-draft-<code>` for `/<code>/assessments/<id>`), so a draft opens in any language ([PERSISTENCE.md](PERSISTENCE.md#product-behavior)). Its payload is compressed: each enabled locale adds about 0.9 KB to the start response, under 10 KB for ten locales. Keep the total well under 16 KB, a common response-header limit (the local proxy answers 502 above it).

## Persistence of the choice

The footer selector writes a `NEXT_LOCALE` cookie in the browser: one year, `Path=/`, `SameSite=Lax`, `Secure` over HTTPS. It is a strictly functional preference set only by an explicit choice. The selector then loads the same path in the new locale, keeping the query string and hash.

- The URL stays authoritative. With `NEXT_LOCALE=es`, an unprefixed page URL redirects (307) to its `/es` form; prefixed URLs, APIs, files and tools never redirect. Choosing English writes `en`, which stops the redirects.
- Accept-Language is never used: no detection, no redirect and, for now, no suggestion banner.
- Page responses never set a cookie or vary on one, so Vercel can cache them. Browser tests and `check:prefetch` assert this.

## Static rendering and caching

- `/`, `/about`, `/privacy`, `/users`, `/p-doom`, `/assessment` and the sitemap are generated for every enabled locale with their existing revalidation intervals. The blog index and every post are generated for every enabled locale at build, without revalidation: posts change only with a deployment.
- Simulated-user profiles and published participant pages are pregenerated in English only. Other locales render on their first request, then cache and revalidate like English. Next 16.3 disables pregeneration for the whole route if `generateStaticParams` returns an empty list for any parent locale, so these pages return `{ locale: 'en', … }` for every parent and the duplicates collapse.
- A published participant page outside English advertises its own social card at `/<code>/public/assessments/<id>/social-image.png` (`app/[locale]/(site)/public/assessments/[id]/social-image.png/route.tsx`). It renders on its first request and caches like the English image. Publication changes expire the public URL and each `/<locale>/public/assessments/<id>` rendering, the English image and each other locale's image. Warmup fetches the English page and image only ([PERSISTENCE.md](PERSISTENCE.md#public-pages-and-social-images)).
- Profile previews add `&locale=<code>` to `/users/<slug>/opengraph-image?v=png-1` outside English. Owner downloads (`/api/share-card`, `/api/assessments/<id>/results-image`) take the page's `?locale=`; English requests omit it.
- Owner routes are private and no-store under every prefix (`privateRoutePrefixes`), and robots.txt disallows them under every prefix.

## Search metadata

`pageMetadata` in `lib/metadata.ts` takes the page's `locale` and whether its main content is `translated`:

- Translated pages (`translated: true` in `publicPages`: `/`, `/about`, `/privacy` and `/users`) canonicalize to themselves. They list every enabled locale as an hreflang alternate keyed by its language tag, with English as `x-default`, and set `og:locale` and its alternates.
- Simulated-user profiles, public assessments, the P(doom) hub (`translated: false`), the blog index and posts are noindex outside English. Their main content stays in its original language, so they canonicalize to the English URL and advertise no alternates, following Google's guidance against boilerplate-only translations. Their English body is marked `lang="en"` under the localized `<html lang>`.

The sitemap lists every locale URL of a translated page with `alternates.languages`, and only the English URL of other pages. `llms.txt` stays English and ends with a Languages section.

## Fonts

Pages use system fonts. `app/globals.css` adds `:lang()` fallback stacks for hi, th, zh and ja, relaxes tight Latin tracking for those scripts and gives Thai and Devanagari taller headings; `components/landing/prism.css` does the same for the hero.

Takumi, which renders share cards, social images and the map PNG, never reads system fonts. Its built-in font covers Latin scripts. `lib/sharing/fonts/` carries OFL Noto Sans Devanagari, Thai, JP and SC subsets (Regular and Bold static instances, WOFF2, about 840 KB in all; `OFL-noto.txt`), declared in `lib/sharing/card-fonts.ts`:

- each covers its script's Unicode block, or for Han every character the committed catalogs and authored translations of its locales use, plus the card dates, digits, spaces and punctuation (SVG labels take one font per run);
- `pnpm fonts:subset --source=<directory>` rebuilds them from the Google Fonts variable fonts with fontTools through `uv`, and writes `coverage.json`. `lib/sharing/card-fonts.test.ts` fails when a catalog gains a character its font lacks, so rerun it after translating;
- `cardRenderOptions(locale)` in `lib/sharing/card-renderer.ts` gives hi, th, zh and ja one font-registered renderer, their language tag and their own font first, so Japanese and Chinese keep their Han forms. Latin-script locales keep the default renderer and byte-identical cards;
- Thai has no spaces between words and Takumi breaks lines only at break opportunities, so card text in Thai marks word boundaries with zero-width spaces (`cardTranslator`, `wrappable`). Devanagari shaping needs nothing extra;
- `next.config.ts` traces the fonts into every card route, and `scripts/check-production-traces.mjs` asserts it.

Characters outside a subset, such as a rare Han character in a publisher's name, still draw as boxes.

## Adding a string

1. Add the key to `messages/en.json` under the namespace that owns it, then translate it into every other catalog with `pnpm l10n:translate --locale=<code> --only-stale` ([Translation tooling](#translation-tooling)), or by hand. Keys are typed from the English catalog (`i18n/app-config.d.ts`). `i18n/messages.test.ts` parses every message, including select and plural branches, and fails on a missing or empty message, mismatched arguments or rich-text tags, a select or plural without `other`, or a message that does not format.
2. Read it with `useTranslations` in components (server or client) or `getTranslations` in async server code. Prefer server components for static copy: their messages never reach the browser.
3. Client components receive only the namespaces of their surface. The root layout sends the chrome; a page wraps its client tree in `<SurfaceMessages surface='…'>` (`components/surface-messages.tsx`), whose namespaces are listed in `i18n/client-messages.ts` (`interview`, `library`, `published`, and `review` for local tools). Add a new client namespace to every surface that renders it; a missing one logs `MISSING_MESSAGE`, which the Spanish browser tests fail on.
4. Use ICU for plurals, numbers and choices (`{count, plural, one {…} other {…}}`, `{count, number}`, `{subject, select, self {…} other {…}}`) and rich text for links (`t.rich('key', { link: (chunks) => <Link …>{chunks}</Link> })`). Write whole sentences as messages; never assemble them from fragments or lowercase a label to fit it into a sentence. Where a sentence needs a noun phrase, give it its own message (see `Claims.topics`).
5. Follow the product copy rules: no trailing periods on headlines, CTAs, labels or captions, the interview takes "about 3 minutes", and personas are "thought leaders" (`líderes de opinión`). Doom, Bloom, P(doom) and Doom or Bloom stay untranslated. Keep a neutral, plain register: Spanish is neutral rather than regional with `tú`, Portuguese uses `você`, German `du`, French `vous`, Indonesian `Anda`, Hindi `आप`, Japanese です/ます and Thai avoids gendered particles.

### Text built in `lib/`

Functions in `lib/` that produce participant-facing text take the root translator as their first argument: `t: Translator` from `i18n/translator.ts`, which is what `useTranslations()` and `getTranslations()` return. They use full keys (`t('Share.caption.none')`). Examples: `shareCaption`, `placementComparison`, `pdoomRangeLabel`, `serializeReport` and `userErrorMessage`.

- Route handlers have no root params and unit tests have no request: use `translatorFor(locale)` or `englishTranslator()` from `i18n/translators.ts`, and `testTranslator(locale)` from `i18n/test-translator.ts` in tests. Scripts run with `--conditions=react-server` cannot load next-intl at runtime, so code they import (such as `lib/assessments/http.ts`) reads `messages/en.json` directly.
- Saved snapshots keep canonical English. Jev reads it, and `validateSnapshot` and `isAuthoredClaim` match stored prompts and claims exactly, so never store display text. `lib/assessment/display-text.ts` maps stored text back to IDs at render time: `claimText`, `componentLabel`, `milestoneLabel`, `hingeLabel`, `hingeQuestion` and `promptText` (tension and correction prompts). English messages for those IDs must equal the canonical text; `display-text.test.ts` asserts it, so changing the code's English without the catalog fails.
- Authored text goes through the same functions with the release's authored text ([Authored content](#authored-content)). Participant and persona answers, and saved labels that differ from their ID's canonical text, pass through unchanged.

## Authored content

Authored assessment text is translated ahead of time and committed; nothing is translated at runtime. Translations live outside the frozen release directories, so a translation fix is an ordinary commit and never changes a release's `content:freeze` hashes:

```
content/l10n/<code>/releases/<contentVersion>.json   # questions, recovery copy, findings, resources
content/l10n/<code>/rubrics/<rubricVersion>.json     # rubric level texts, including catastrophic risk
content/l10n/<code>/messages.json                    # provenance of messages/<code>.json (no text)
```

- Entries are keyed by stable ID: `prompt:<id>:text|reask|clarification|exhausted`, `finding:<id>`, `resource:<id>:title|purpose|question|effort` and `level:<vector>:<index>`. Each records the text, `sourceHash` (the first 16 hex digits of the SHA-256 of the English it translates), `model`, `translatedAt`, `reviewStatus` (`machine` or `reviewed`) and, once reviewed, `reviewer`. The Spanish UI catalog predates the tool, so its provenance says `model: "unrecorded"`.
- Dimension labels are UI messages (`Claims.labels`, `Claims.topics`), checked against the rubric by `display-text.test.ts`. The P(doom) band labels and rubric meanings are Jev-only and stay English.
- Every supported content version (`supportedContentVersions`) and the current rubric version need a file per enabled locale, because saved assessments keep their pinned versions.
- `lib/content/l10n-loader.ts` builds an `AuthoredText` (each entry's English source and display text) for an assessment's pinned release and rubric in a locale: `authoredText` for the owner interview, and `authoredTextFor` for read-only pages, which sends only the questions, findings and resources they show. English returns null. A stale or missing entry shows English, per entry.
- Pages put it in `<AuthoredTextProvider>` (`components/assessment/authored-text.tsx`) around their client tree: the owner interview, published participant pages and simulated-user pages. Components read it with `useAuthoredText()` and pass it to `promptText`, `claimText`, `authoredPrompt`, `findingText` and `resourceText`. Each lookup is by ID and applies only when the saved text equals that ID's English source, so older or edited snapshots show what they saved. The owner page also sends recovery copy already translated (`recoveryCopy`).
- Snapshots stay canonical English throughout: Jev reads English prompts, and `validateSnapshot` and `isAuthoredClaim` require exact English.
- The loader builds file paths from versions, which tracing cannot follow, so `next.config.ts` includes the release text, rubrics and `content/l10n` release and rubric files for those three pages, and `scripts/check-production-traces.mjs` asserts them. A new page that shows authored text needs the same.
- A resource bookmark normally shows its publisher's English description; outside English a translated resource question takes its place.

### Validation

`pnpm test:content` (part of `pnpm test`) requires, for every enabled locale and every supported content and rubric version, a file with every entry, no extra IDs, a `sourceHash` matching the current English (so a stale translation fails) and the same `{…}` placeholders. Any other translation file present must be current too. It checks every `messages/*.json` against English: the same keys, ICU arguments, select and plural `other` branches and rich-text tags. `i18n/messages.test.ts` additionally formats every message of every enabled locale.

### Translation tooling

```
pnpm l10n:translate --locale=<code> [--only-stale] [--scope=all|messages|content] (--dry-run | --allow-paid --max-cost=<usd>)
pnpm l10n:review --locale=<code> [--back-translate --allow-paid --max-cost=<usd>]
pnpm l10n:review --locale=<code> --approve=<reviewer>
```

- `l10n:translate` translates `messages/<code>.json` and the content files with OpenAI (`gpt-5.6-sol`, low reasoning). With `--only-stale` it translates only missing entries and entries whose English changed; without it, everything except current reviewed entries. Each distinct English string is translated once and reused across versions. It writes the files in English key order, records provenance and formats them.
- The instructions carry the glossary and copy rules: Doom, Bloom, Doom or Bloom and P(doom) untranslated; a per-language term for AI; "thought leaders"; a plain, neutral register that never adds, drops or intensifies a premise; no final period where the English has none; "about 3 minutes"; and unchanged ICU placeholders and tags. Short labels (`Claims.labels`, `Map`, `Cta`, `Header`) are translated first and given to every later batch as a glossary. Every reply is checked (ICU structure, placeholders, untranslated brand terms, kana in Chinese), trailing periods are removed where the English has none, and failures are retried with the problem named.
- It needs `--allow-paid` and a `--max-cost` of at most $15 per run, and appends each call to `eval/runs/l10n-<code>-<time>.jsonl`. The OpenAI key exists only in the owner's login shell: run `bash -lc 'pnpm l10n:translate …'`, and never print the key.
- Read a sample back before committing. A useful audit: the target script is present (hi, th, zh, ja), Latin-script translations are not left identical to English, Doom, Bloom and P(doom) survive, and the register is consistent.
- After translating characters a card font lacks, run `pnpm fonts:subset` ([Fonts](#fonts)).

The phase 3 run (October 1, 2026) cost $5.81 for the eight new languages' messages and content and Spanish content, and $0.80 for back-translated review packets.

### Review

Only the root question, the recovery and retry copy (authored recovery variants, `Interview.recovery`, `Interview.failure` and the retry buttons) and the wording of result claims (rubric levels and `Claims` level, uncertainty and unplaced messages) need a native speaker; everything else may stay machine-translated. `pnpm l10n:review --locale=<code>` writes `docs/l10n-review/<code>.md` with English, the translation, the status and, with `--back-translate`, a machine back-translation for reviewers who want a second reading. Reviewers send corrections as edits to the files; `--approve=<reviewer>` then marks every current entry in the packet `reviewed`. Review does not block a release; results in different interview languages are not yet comparable ([MEASUREMENT.md](MEASUREMENT.md#evaluation-quality)).

## Jev and the participant's language

Jev inputs stay canonical English: prompts, choices, rubric definitions and question instructions. Answers are passed as written and never machine-translated. Since algorithm `0.7.4`, outside English every Jev stage's shared state carries one neutral line, `participantLanguage`: "The participant is using the interview in Spanish; answers may be written in any language. Judge meaning, not fluency or language." ([TYPESAFE.md](TYPESAFE.md#participant-language)). English interviews add nothing, so their inputs are unchanged.

- The interview submits the page's locale with each reply (`{ type: 'answer', text, locale }`). Accepted answers record it as `displayLocale`, rejected replies in the interaction history too, and assessment events carry `interview_locale`.
- Operations without a reply (results, continue, placement) use the latest saved reply's language.
- There is no per-language gating, probe or interview restriction. `pnpm eval:smoke:languages --allow-paid --max-requests=24` is a bounded live check that a Spanish and a Japanese reply succeed with the line; on October 1, 2026 both were usable (confidence 1) and the results read their stated P(doom) as "10%" and "5%くらい".
- Typed P(doom) percentages are read in every enabled language: NFKC plus Devanagari, Thai and Chinese numerals, localized percent words and prefix and suffix qualifiers, and sentence ends at 。！？ and the danda (`lib/assessment/pdoom.ts`). English reads exactly as before; `pdoom.test.ts` keeps the previous extractor to prove it.
- The exact local test phrases (`test`, `paperclips`) stay English.

## Adding a language

1. Add the catalog entry in `i18n/config.ts`: `code` (the URL segment), `tag`, `endonym`, `englishName` (Jev's line and the translation prompt) and `openGraph`.
2. Add a style note and its term for AI to `scripts/l10n-translate.ts`, then run `pnpm l10n:translate --locale=<code> --allow-paid --max-cost=<usd>`. Audit a sample and fix anything broken, then run `pnpm test:content`.
3. For a script Takumi's built-in font lacks, add a font to `lib/sharing/card-fonts.ts`, run `pnpm fonts:subset`, and check a card renders real glyphs and breaks lines correctly.
4. Generate the review packet with `pnpm l10n:review --locale=<code> --back-translate --allow-paid --max-cost=<usd>` and send it to a native speaker.
5. Set `enabled: true`, add the catalog to `i18n/test-translator.ts`, and update the tests that list the enabled locales: `i18n/config.test.ts`, `i18n/next-routes.test.ts`, the draft cookies in `tests/persistence/lazy-drafts.spec.ts`, `tests/browser/i18n-locales.spec.ts`, the robots list in `scripts/audit-seo.ts` and the home pages in `scripts/check-production-traces.mjs`.
6. Run `pnpm test`, `pnpm check:browser tests/browser/i18n.spec.ts tests/browser/i18n-assessment.spec.ts tests/browser/i18n-locales.spec.ts`, `pnpm check:persistence tests/persistence/lazy-drafts.spec.ts`, `pnpm build:local` and `pnpm check:prefetch`, and review the pages at phone and desktop widths, including the map labels and a share card.

Each locale adds its static pages to the build; profiles, public assessments and their social images render on demand.

## Deferred

- Native review of the root question, recovery copy and claim wording in every language (packets in `docs/l10n-review/`).
- Accuracy analysis of Jev by interview language, once there is real data: dispositions, readiness, confidence and placements.
- Simulated answers and persona descriptions: translate at publish time (spike option C) before their pages are indexed outside English.
- Authored text in the library page's report download.
- A per-locale site social image (`app/opengraph-image.png`).
- The client-side "View in Español?" suggestion banner.
- Message precompilation (`experimental.messages.precompile`) if the client catalog grows.
- Verifying on a Vercel Preview that cookie redirects are served without a function and cached pages stay hits.
