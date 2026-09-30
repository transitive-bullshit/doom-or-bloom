import { expect, test } from '@playwright/test'

// Runs against the production build with an unreachable database: every
// locale's static pages come from the build output, and none sets a cookie.
test('static pages are prebuilt per locale, cached and cookie-free', async ({
  request
}) => {
  for (const path of ['/', '/es', '/about', '/es/about', '/users', '/es/users'])
    for (const headers of [{}, { RSC: '1' }] as Record<string, string>[]) {
      // An RSC request first gains its `_rsc` cache-busting parameter.
      const response = await request.get(path, { headers })
      expect(response.status()).toBe(200)
      expect(response.headers()['x-nextjs-cache']).toBe('HIT')
      expect(response.headers()['set-cookie']).toBeUndefined()
      expect(response.headers()['vary'] ?? '').not.toMatch(/cookie/i)
    }
  const html = await (await request.get('/es')).text()
  expect(html).toContain('<html lang="es"')
  expect(html).toContain('¿Cómo cambiará la IA nuestro futuro?')
})

test('a remembered language redirects unprefixed pages before the cache', async ({
  request
}) => {
  const headers = { cookie: 'NEXT_LOCALE=es' }
  for (const [path, location] of [
    ['/', '/es'],
    ['/users/simonw', '/es/users/simonw'],
    ['/about?ref=x', '/es/about?ref=x']
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
