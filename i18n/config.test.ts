import { describe, expect, it } from 'vitest'
import {
  defaultLocale,
  isLocale,
  languageAlternates,
  languageTag,
  localeCookieString,
  localeOptions,
  localizedPath,
  locales,
  splitLocalePath
} from './config'

describe('locale paths', () => {
  it('keeps English unprefixed and prefixes other locales', () => {
    expect(defaultLocale).toBe('en')
    expect(localizedPath('/', 'en')).toBe('/')
    expect(localizedPath('/users/simonw', 'en')).toBe('/users/simonw')
    expect(localizedPath('/', 'es')).toBe('/es')
    expect(localizedPath('/users/simonw', 'es')).toBe('/es/users/simonw')
  })

  it('splits a browser pathname into its locale and route path', () => {
    expect(splitLocalePath('/')).toEqual({ locale: 'en', path: '/' })
    expect(splitLocalePath('/about')).toEqual({ locale: 'en', path: '/about' })
    expect(splitLocalePath('/es')).toEqual({ locale: 'es', path: '/' })
    expect(splitLocalePath('/es/users/simonw')).toEqual({
      locale: 'es',
      path: '/users/simonw'
    })
    // Only enabled, non-default locales are prefixes.
    expect(splitLocalePath('/en/about').path).toBe('/en/about')
    expect(splitLocalePath('/fr/about')).toEqual({
      locale: 'fr',
      path: '/about'
    })
    expect(splitLocalePath('/ko/about')).toEqual({
      locale: 'en',
      path: '/ko/about'
    })
    expect(splitLocalePath('/essay').path).toBe('/essay')
  })

  it('lists each enabled locale once with its endonym', () => {
    expect(locales).toEqual([
      'en',
      'es',
      'pt',
      'hi',
      'zh',
      'th',
      'ja',
      'de',
      'fr',
      'id'
    ])
    expect(localeOptions.map(({ endonym }) => endonym)).toEqual([
      'English',
      'Español',
      'Português (Brasil)',
      'हिन्दी',
      '简体中文',
      'ไทย',
      '日本語',
      'Deutsch',
      'Français',
      'Bahasa Indonesia'
    ])
    expect(isLocale('es')).toBe(true)
    expect(isLocale('pt')).toBe(true)
    expect(isLocale('pt-BR')).toBe(false)
    expect(isLocale('zh-Hans')).toBe(false)
    expect(isLocale('ko')).toBe(false)
  })
})

describe('URL segments and language tags', () => {
  it('uses short URL segments for regional and script variants', () => {
    expect(languageTag('pt')).toBe('pt-BR')
    expect(languageTag('zh')).toBe('zh-Hans')
    expect(localizedPath('/about', 'pt')).toBe('/pt/about')
    expect(localizedPath('/', 'zh')).toBe('/zh')
  })

  it('keeps every tag a canonical BCP 47 tag', () => {
    for (const code of [...locales, 'pt', 'zh', 'hi', 'th', 'ja'] as const) {
      expect(code).toMatch(/^[a-z]{2}$/)
      expect(Intl.getCanonicalLocales(languageTag(code))).toEqual([
        languageTag(code)
      ])
    }
    expect(localeOptions.map(({ tag }) => tag)).toEqual([
      'en',
      'es',
      'pt-BR',
      'hi',
      'zh-Hans',
      'th',
      'ja',
      'de',
      'fr',
      'id'
    ])
  })

  it('keys hreflang alternates by tag and links them by segment', () => {
    expect(
      languageAlternates('https://example.com', '/about', ['en', 'pt', 'zh'])
    ).toEqual({
      en: 'https://example.com/about',
      'pt-BR': 'https://example.com/pt/about',
      'zh-Hans': 'https://example.com/zh/about',
      'x-default': 'https://example.com/about'
    })
    expect(languageAlternates('https://example.com', '/')).toEqual({
      en: 'https://example.com/',
      es: 'https://example.com/es',
      'pt-BR': 'https://example.com/pt',
      hi: 'https://example.com/hi',
      'zh-Hans': 'https://example.com/zh',
      th: 'https://example.com/th',
      ja: 'https://example.com/ja',
      de: 'https://example.com/de',
      fr: 'https://example.com/fr',
      id: 'https://example.com/id',
      'x-default': 'https://example.com/'
    })
  })
})

describe('locale cookie', () => {
  it('is a one-year, first-party, lax preference', () => {
    expect(localeCookieString('es', true)).toBe(
      'NEXT_LOCALE=es; Max-Age=31536000; Path=/; SameSite=Lax; Secure'
    )
    expect(localeCookieString('en', false)).not.toContain('Secure')
  })
})
