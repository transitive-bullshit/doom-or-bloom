import { readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { expect, test } from '@playwright/test'
import { getPathMatch } from 'next/dist/shared/lib/router/utils/path-match.js'
import { prepareDestination } from 'next/dist/shared/lib/router/utils/prepare-destination.js'

type Rewrite = { source: string; destination: string }

const builtApp = '.next/server/app'

async function isBuiltFile(pathname: string) {
  const file = await stat(join(builtApp, pathname)).catch(() => null)
  return file?.isFile() ?? false
}

// Applies a rewrite through Next's own matchers, as i18n/next-routes.test.ts.
function rewrite(rule: Rewrite, pathname: string) {
  const params = getPathMatch(rule.source, {
    removeUnnamedParams: true,
    strict: true
  })(pathname)
  if (!params) return null
  return prepareDestination({
    appendParamsToQuery: false,
    destination: rule.destination,
    params,
    query: {}
  } as Parameters<typeof prepareDestination>[0]).newUrl
}

/**
 * The prerendered file Vercel serves for a page's RSC request; `segment` is
 * its Next-Router-Segment-Prefetch header. `next start` answers RSC requests
 * by header, so only this model shows the order of Vercel's routing layer
 * (the Next adapter): beforeFiles rewrites, then the RSC pathname (`/` becomes
 * `/index…`), then prerendered files, then `/index.rsc` normalized to `/`
 * (dropping its suffix), then afterFiles rewrites. These apply to the
 * suffixed pathname, or carry a suffix they do not match.
 */
async function vercelRscFile(
  rewrites: { beforeFiles: Rewrite[]; afterFiles: Rewrite[] },
  pathname: string,
  segment?: string
) {
  for (const rule of rewrites.beforeFiles)
    pathname = rewrite(rule, pathname) ?? pathname
  const suffix = segment ? `.segments${segment}.segment.rsc` : '.rsc'
  let file = `${pathname === '/' ? '/index' : pathname}${suffix}`
  if (await isBuiltFile(file)) return file
  if (file === '/index.rsc') file = '/'
  for (const rule of rewrites.afterFiles) {
    const target =
      rewrite(rule, file) ??
      (file.endsWith(suffix)
        ? rewrite(rule, file.slice(0, -suffix.length))?.concat(suffix)
        : null)
    if (target) return target
  }
  return file
}

/** Segment prefetch headers for a prerendered page, e.g. `/_tree`. */
async function segmentHeaders(prerendered: string) {
  const dir = join(builtApp, `${prerendered}.segments`)
  return (await readdir(dir, { recursive: true }))
    .filter((file) => file.endsWith('.segment.rsc'))
    .map((file) => `/${file.slice(0, -'.segment.rsc'.length)}`)
}

// Runs against the production build with an unreachable database: every
// locale's static pages come from the build output, and none sets a cookie.
test('static pages are prebuilt per locale, cached and cookie-free', async ({
  request
}) => {
  for (const path of [
    '/',
    '/es',
    '/about',
    '/es/about',
    '/users',
    '/es/users',
    // English-bodied pages are prebuilt in every locale too.
    '/p-doom',
    '/es/p-doom',
    '/blog',
    '/es/blog',
    '/blog/why-p-doom-estimates-vary',
    '/ja/blog/why-p-doom-estimates-vary'
  ])
    for (const headers of [{}, { RSC: '1' }] as Record<string, string>[]) {
      // An RSC request first gains its `_rsc` cache-busting parameter.
      const response = await request.get(path, { headers })
      expect(response.status()).toBe(200)
      if (headers.RSC)
        expect(response.headers()['content-type'], path).toContain(
          'text/x-component'
        )
      expect(response.headers()['x-nextjs-cache']).toBe('HIT')
      expect(response.headers()['set-cookie']).toBeUndefined()
      expect(response.headers()['vary'] ?? '').not.toMatch(/cookie/i)
    }
  // The feed and post cards are built once, outside the locale tree.
  for (const path of [
    '/blog/rss.xml',
    '/blog/why-p-doom-estimates-vary/opengraph-image?v=build'
  ]) {
    const response = await request.get(path)
    expect(response.status(), path).toBe(200)
    expect(response.headers()['x-nextjs-cache'], path).toBe('HIT')
  }
  const html = await (await request.get('/es')).text()
  expect(html).toContain('<html lang="es"')
  expect(html).toContain('¿Cómo cambiará la IA nuestro futuro?')
})

// Production once rewrote the home page's segment prefetches to
// /en/index.segments/… (404) and its RSC requests to the /en HTML, so every
// link to `/` logged a 404 and navigated with a full page load.
test('RSC and segment prefetches reach each page’s prerendered files on Vercel', async () => {
  const { rewrites } = JSON.parse(
    await readFile('.next/routes-manifest.json', 'utf8')
  )
  for (const [path, prerendered] of [
    ['/', '/en'],
    ['/es', '/es'],
    ['/users', '/en/users'],
    ['/es/users', '/es/users'],
    ['/p-doom', '/en/p-doom'],
    ['/blog/why-p-doom-estimates-vary', '/en/blog/why-p-doom-estimates-vary']
  ] as const) {
    const segments = await segmentHeaders(prerendered)
    expect(segments, prerendered).toContain('/_tree')
    for (const segment of [undefined, ...segments]) {
      const file = await vercelRscFile(rewrites, path, segment)
      expect({ path, segment, file }).toEqual({
        path,
        segment,
        file: segment
          ? `${prerendered}.segments${segment}.segment.rsc`
          : `${prerendered}.rsc`
      })
      expect(await isBuiltFile(file), file).toBe(true)
    }
  }
})

test('the home page serves its segment prefetches', async ({ request }) => {
  for (const segment of await segmentHeaders('/en')) {
    const response = await request.get('/', {
      headers: {
        RSC: '1',
        'Next-Router-Prefetch': '1',
        'Next-Router-Segment-Prefetch': segment
      }
    })
    expect(response.status(), segment).toBe(200)
    expect(response.headers()['content-type'], segment).toContain(
      'text/x-component'
    )
    expect(response.headers()['set-cookie'], segment).toBeUndefined()
  }
})

test('a renamed post redirects permanently before the cache', async ({
  request
}) => {
  for (const [path, location] of [
    ['/blog/what-is-p-doom', '/blog/why-p-doom-estimates-vary'],
    ['/es/blog/what-is-p-doom', '/es/blog/why-p-doom-estimates-vary'],
    [
      '/blog/what-is-p-doom/opengraph-image?v=build',
      '/blog/why-p-doom-estimates-vary/opengraph-image?v=build'
    ]
  ] as const) {
    const response = await request.get(path, { maxRedirects: 0 })
    expect(response.status(), path).toBe(308)
    expect(response.headers()['location'], path).toBe(location)
    expect(response.headers()['set-cookie'], path).toBeUndefined()
  }
})

test('a remembered language redirects unprefixed pages before the cache', async ({
  request
}) => {
  const headers = { cookie: 'NEXT_LOCALE=es' }
  for (const [path, location] of [
    ['/', '/es'],
    ['/users/simonw', '/es/users/simonw'],
    ['/about?ref=x', '/es/about?ref=x'],
    ['/blog/why-p-doom-estimates-vary', '/es/blog/why-p-doom-estimates-vary']
  ] as const) {
    const response = await request.get(path, { headers, maxRedirects: 0 })
    expect(response.status()).toBe(307)
    expect(response.headers()['location']).toBe(location)
    expect(response.headers()['set-cookie']).toBeUndefined()
  }
  // Legacy redirects run first, so the remembered language applies next.
  const legacy = await request.get('/assessment/abc', {
    headers,
    maxRedirects: 0
  })
  expect(legacy.status()).toBe(308)
  expect(legacy.headers()['location']).toBe('/assessments/abc')
  // Explicit prefixes are authoritative, and English never gains a prefix.
  expect(
    (await request.get('/es/about', { headers, maxRedirects: 0 })).status()
  ).toBe(200)
  const english = await request.get('/en/about', { maxRedirects: 0 })
  expect(english.status()).toBe(307)
  expect(english.headers()['location']).toBe('/about')
})
