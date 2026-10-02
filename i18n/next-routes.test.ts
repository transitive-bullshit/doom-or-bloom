import { describe, expect, it } from 'vitest'
import { getPathMatch } from 'next/dist/shared/lib/router/utils/path-match.js'
import { prepareDestination } from 'next/dist/shared/lib/router/utils/prepare-destination.js'
import {
  localeRedirects,
  localeRewrites,
  privateRoutePrefixes
} from './next-routes'

type Rule = {
  source: string
  destination: string
  has?: { type: 'cookie'; key: string; value: string }[]
}

// Applies rules the way Next's router does: the first matching source wins.
function apply(rules: Rule[], path: string, cookie?: string) {
  for (const rule of rules) {
    if (rule.has?.some((item) => item.value !== cookie)) continue
    const params = getPathMatch(rule.source, {
      removeUnnamedParams: true,
      strict: true
    })(path)
    if (!params) continue
    return prepareDestination({
      appendParamsToQuery: false,
      destination: rule.destination,
      params,
      query: {}
    } as Parameters<typeof prepareDestination>[0]).newUrl
  }
  return null
}

describe('locale rewrites', () => {
  const { beforeFiles, afterFiles } = localeRewrites()
  const rewrite = (path: string) => apply([...beforeFiles, ...afterFiles], path)

  it('rewrites the root before the platform maps RSC requests to files', () => {
    // `/` would otherwise reach afterFiles as /index.rsc or /index.segments/….
    expect(apply(beforeFiles, '/')).toBe('/en')
    // Every other path waits for static files, such as /robots.txt.
    for (const path of ['/about', '/robots.txt', '/_next/static/chunk.js'])
      expect({ path, to: apply(beforeFiles, path) }).toEqual({ path, to: null })
  })

  it('serves unprefixed page URLs from the English tree', () => {
    expect(rewrite('/')).toBe('/en')
    expect(rewrite('/about')).toBe('/en/about')
    expect(rewrite('/users/simonw')).toBe('/en/users/simonw')
    expect(rewrite('/p-doom')).toBe('/en/p-doom')
    expect(rewrite('/blog')).toBe('/en/blog')
    expect(rewrite('/blog/what-is-p-doom')).toBe('/en/blog/what-is-p-doom')
    expect(rewrite('/public/assessments/abc')).toBe(
      '/en/public/assessments/abc'
    )
    expect(rewrite('/assessments')).toBe('/en/assessments')
    // An unknown locale-like prefix is just an unknown English path (404).
    expect(rewrite('/ko/about')).toBe('/en/ko/about')
  })

  it('leaves locale prefixes and routes outside app/[locale] alone', () => {
    for (const path of [
      '/es',
      '/es/about',
      '/api/assessments/abc',
      '/admin/users/abc',
      '/questions',
      '/prototypes/landing/personas/abc',
      '/users/simonw/opengraph-image',
      '/blog/what-is-p-doom/opengraph-image',
      '/blog/rss.xml',
      '/public/assessments/abc/data',
      '/public/assessments/abc/social-image.png'
    ])
      expect({ path, to: rewrite(path) }).toEqual({ path, to: null })
  })
})

describe('locale redirects', () => {
  const redirect = (path: string, cookie?: string) =>
    apply(localeRedirects(), path, cookie)

  it('drops a superfluous English prefix', () => {
    expect(redirect('/en')).toBe('/')
    expect(redirect('/en/users/simonw')).toBe('/users/simonw')
  })

  it('follows an explicit choice only for unprefixed page URLs', () => {
    expect(redirect('/about')).toBeNull()
    expect(redirect('/about', 'en')).toBeNull()
    expect(redirect('/', 'es')).toBe('/es')
    expect(redirect('/about', 'es')).toBe('/es/about')
    expect(redirect('/users/simonw', 'es')).toBe('/es/users/simonw')
    // English-bodied pages keep translated chrome under the chosen prefix.
    expect(redirect('/blog/what-is-p-doom', 'es')).toBe(
      '/es/blog/what-is-p-doom'
    )
    for (const path of [
      '/es/about',
      '/api/tweet',
      '/admin',
      '/questions',
      '/robots.txt',
      '/llms.txt',
      '/personas/simonw.jpg',
      '/_next/static/chunk.js',
      '/public/assessments/abc/data',
      '/public/assessments/abc/social-image.png',
      '/blog/rss.xml',
      '/blog/what-is-p-doom/opengraph-image'
    ])
      expect({ path, to: redirect(path, 'es') }).toEqual({ path, to: null })
  })
})

describe('private routes', () => {
  it('cover owner routes in every locale', () => {
    expect(privateRoutePrefixes).toEqual([
      '/assessment',
      '/assessments',
      ...['es', 'pt', 'hi', 'zh', 'th', 'ja', 'de', 'fr', 'id'].flatMap(
        (code) => [`/${code}/assessment`, `/${code}/assessments`]
      )
    ])
  })
})
