import { defaultLocale, localeCookie, locales } from './config'

// Locale routing without a proxy function: Vercel applies next.config
// redirects and rewrites in its routing layer, before its cache, so every page
// stays static and no response ever sets a cookie.

const prefixed = locales.filter((locale) => locale !== defaultLocale)

// First path segments that never carry a locale: the locale prefixes, and
// routes outside app/[locale] with dynamic segments (APIs, admin, local tools).
// Keep this in sync with the top-level folders of app/.
const unlocalizedSegments = [
  ...locales,
  'api',
  'admin',
  'questions',
  'corpus',
  'user-journeys',
  'prototypes',
  'internal-unavailable'
]

// Route handlers outside app/[locale] that share a page's URL prefix.
const unlocalizedRoutes = [
  'users/[^/]+/opengraph-image',
  'public/assessments/[^/]+/data',
  'public/assessments/[^/]+/social-image\\.png'
]

// Path-to-regexp accepts lookaheads, but not capturing groups, inside a
// parameter pattern. Each pattern matches one or more segments after `/`.
const routedPath = [
  `(?!(?:${unlocalizedSegments.join('|')})(?:/|$))`,
  `(?!(?:${unlocalizedRoutes.join('|')})$)`,
  '.+'
].join('')

// Redirects run before static files, so they also skip framework paths
// (`/_next`) and anything that looks like a file, such as /robots.txt.
const pagePath = `(?![_.])(?!.*\\.[^/]*$)${routedPath}`

export function localeRedirects() {
  return [
    // English is never prefixed; a superfluous /en prefix is dropped.
    { source: `/${defaultLocale}`, destination: '/', permanent: false },
    {
      source: `/${defaultLocale}/:path*`,
      destination: '/:path*',
      permanent: false
    },
    // An explicit, browser-written choice sends unprefixed page URLs to that
    // locale. Prefixed URLs are authoritative and never redirect.
    ...prefixed.flatMap((locale) => {
      const has = [
        { type: 'cookie' as const, key: localeCookie.name, value: locale }
      ]
      return [
        { source: '/', has, destination: `/${locale}`, permanent: false },
        {
          source: `/:path(${pagePath})`,
          has,
          destination: `/${locale}/:path`,
          permanent: false
        }
      ]
    })
  ]
}

/**
 * Serves unprefixed URLs from the English tree. These run after static files
 * and non-dynamic routes, and before dynamic routes such as app/[locale]. A
 * path that then matches no route gets app/global-not-found.tsx.
 */
export function localeRewrites() {
  return [
    { source: '/', destination: `/${defaultLocale}` },
    { source: `/:path(${routedPath})`, destination: `/${defaultLocale}/:path` }
  ]
}

/** Owner routes stay private in every locale. */
export const privateRoutePrefixes = [
  '/assessment',
  '/assessments',
  ...prefixed.flatMap((locale) => [
    `/${locale}/assessment`,
    `/${locale}/assessments`
  ])
]
