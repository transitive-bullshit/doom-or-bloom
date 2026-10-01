// The one list of planned locales. Enabling a locale is a one-line change here,
// plus its messages/<code>.json catalog; see docs/INTERNATIONALIZATION.md.
// Pure data and helpers: next.config.ts, the server and the browser import it.
//
// `code` is the URL segment and the next-intl locale id: short and lowercase
// (`/pt/…`, `/zh/…`). `tag` is the BCP 47 language tag, used wherever a language
// is declared: <html lang>, hreflang, Intl formatting and `lang` attributes.
// `openGraph` is the og:locale form of the tag.
const catalog = [
  {
    code: 'en',
    tag: 'en',
    endonym: 'English',
    openGraph: 'en_US',
    enabled: true
  },
  {
    code: 'es',
    tag: 'es',
    endonym: 'Español',
    openGraph: 'es_ES',
    enabled: true
  },
  {
    code: 'pt',
    tag: 'pt-BR',
    endonym: 'Português (Brasil)',
    openGraph: 'pt_BR',
    enabled: false
  },
  {
    code: 'hi',
    tag: 'hi',
    endonym: 'हिन्दी',
    openGraph: 'hi_IN',
    enabled: false
  },
  {
    code: 'zh',
    tag: 'zh-Hans',
    endonym: '简体中文',
    openGraph: 'zh_CN',
    enabled: false
  },
  { code: 'th', tag: 'th', endonym: 'ไทย', openGraph: 'th_TH', enabled: false },
  {
    code: 'ja',
    tag: 'ja',
    endonym: '日本語',
    openGraph: 'ja_JP',
    enabled: false
  },
  {
    code: 'de',
    tag: 'de',
    endonym: 'Deutsch',
    openGraph: 'de_DE',
    enabled: false
  },
  {
    code: 'fr',
    tag: 'fr',
    endonym: 'Français',
    openGraph: 'fr_FR',
    enabled: false
  },
  {
    code: 'id',
    tag: 'id',
    endonym: 'Bahasa Indonesia',
    openGraph: 'id_ID',
    enabled: false
  }
] as const satisfies readonly {
  code: string
  tag: string
  endonym: string
  openGraph: string
  enabled: boolean
}[]

type CatalogEntry = (typeof catalog)[number]
export type Locale = Extract<CatalogEntry, { enabled: true }>['code']
type CatalogCode = CatalogEntry['code']

export const defaultLocale = 'en' satisfies Locale
export const locales = catalog
  .filter((entry) => entry.enabled)
  .map((entry) => entry.code) as Locale[]
export const localeOptions = catalog.filter(
  (entry) => entry.enabled
) as Extract<CatalogEntry, { enabled: true }>[]

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as string[]).includes(value)
}

/** The BCP 47 tag for a URL segment, e.g. `pt` → `pt-BR`, enabled or not. */
export function languageTag(code: CatalogCode): CatalogEntry['tag'] {
  return catalog.find((entry) => entry.code === code)!.tag
}

export function openGraphLocale(locale: Locale) {
  return catalog.find((entry) => entry.code === locale)!.openGraph
}

// An explicit language choice, written only by the browser when the visitor
// picks a language. Page responses never set it, so they stay CDN-cacheable.
export const localeCookie = {
  name: 'NEXT_LOCALE',
  maxAge: 365 * 24 * 60 * 60,
  sameSite: 'lax'
} as const

export function localeCookieString(locale: Locale, secure: boolean) {
  return `${localeCookie.name}=${locale}; Max-Age=${localeCookie.maxAge}; Path=/; SameSite=Lax${secure ? '; Secure' : ''}`
}

/** English keeps unprefixed URLs; every other locale gets a `/<code>` prefix. */
export function localizedPath(path: string, locale: CatalogCode) {
  if (locale === defaultLocale) return path
  return path === '/' ? `/${locale}` : `/${locale}${path}`
}

/**
 * hreflang alternates for a path: each language tag mapped to its absolute
 * URL, with English as x-default.
 */
export function languageAlternates(
  origin: string,
  path: string,
  codes: readonly CatalogCode[] = locales
) {
  return {
    ...Object.fromEntries(
      codes.map((code) => [
        languageTag(code),
        `${origin}${localizedPath(path, code)}`
      ])
    ),
    'x-default': `${origin}${localizedPath(path, defaultLocale)}`
  }
}

/** Splits a browser pathname into its locale and the unprefixed route path. */
export function splitLocalePath(pathname: string): {
  locale: Locale
  path: string
} {
  const [, first = '', ...rest] = pathname.split('/')
  if (first !== defaultLocale && isLocale(first))
    return { locale: first, path: `/${rest.join('/')}` }
  return { locale: defaultLocale, path: pathname || '/' }
}
