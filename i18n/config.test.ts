import { describe, expect, it } from 'vitest'
import {
  defaultLocale,
  isLocale,
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
      locale: 'en',
      path: '/fr/about'
    })
    expect(splitLocalePath('/essay').path).toBe('/essay')
  })

  it('lists each enabled locale once with its endonym', () => {
    expect(locales).toEqual(['en', 'es'])
    expect(localeOptions.map(({ endonym }) => endonym)).toEqual([
      'English',
      'Español'
    ])
    expect(isLocale('es')).toBe(true)
    expect(isLocale('pt-BR')).toBe(false)
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
