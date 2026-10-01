import { expect, test } from './fixtures'

const site = 'https://www.doom-or-bloom.com'

test('English URLs are unchanged and a superfluous /en prefix redirects to them', async ({
  page
}) => {
  const response = await page.goto('/about')
  expect(response?.status()).toBe(200)
  await expect(page).toHaveURL(/\/about$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(
    page.getByRole('heading', {
      name: 'A clearer conversation about AI futures'
    })
  ).toBeVisible()
  await expect(
    page.locator('footer').getByRole('link', { name: 'Privacy', exact: true })
  ).toHaveAttribute('href', '/privacy')
  await page.goto('/en/users')
  await expect(page).toHaveURL(/\/users$/)
  await expect(
    page.getByRole('heading', { name: 'Explore simulated users' })
  ).toBeVisible()
})

test('/es renders Spanish chrome and keeps links in Spanish', async ({
  page
}) => {
  await page.goto('/es')
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  await expect(page).toHaveTitle('Doom or Bloom')
  await expect(
    page.getByRole('heading', { name: '¿Cómo cambiará la IA nuestro futuro?' })
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Mapea tu propia visión de la IA' }).last()
  ).toHaveAttribute('href', '/es/assessments?start=1')
  await expect(
    page.getByRole('link', { name: 'Ver los resultados de Eliezer Yudkowsky' })
  ).toHaveAttribute('href', '/es/users/esyudkowsky')
  const footer = page.locator('footer')
  await expect(
    footer.getByRole('link', { name: 'Acerca de', exact: true })
  ).toHaveAttribute('href', '/es/about')
  await expect(footer.getByRole('combobox', { name: 'Idioma' })).toHaveText(
    'Español'
  )
  await expect(
    page.getByText('¿Dónde te ubicas?', { exact: true })
  ).toBeVisible()

  // Chrome is translated; English-only content keeps working under /es.
  await page.goto('/es/users/jensenhuang')
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  const breadcrumb = page.getByRole('navigation', {
    name: 'Ruta de navegación'
  })
  await expect(
    breadcrumb.getByRole('link', { name: 'Usuarios simulados' })
  ).toHaveAttribute('href', '/es/users')

  // A missing profile uses the localized 404 inside the Spanish layout.
  const missing = await page.goto('/es/users/nonexistent-persona')
  expect(missing?.status()).toBe(404)
  await expect(
    page.getByRole('heading', { name: '404 · Página no encontrada' })
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Volver al inicio' })
  ).toHaveAttribute('href', '/es')
  // URLs matching no route get the server-rendered English 404 page.
  expect((await page.goto('/es/no-such-page'))?.status()).toBe(404)
  await expect(
    page.getByRole('heading', { name: '404 · Page not found' })
  ).toBeVisible()
})

test('translated pages advertise hreflang alternates; chrome-only ones defer to English', async ({
  page
}) => {
  for (const [path, canonical] of [
    ['/', site],
    ['/es', `${site}/es`],
    ['/es/users', `${site}/es/users`],
    ['/es/about', `${site}/es/about`],
    ['/privacy', `${site}/privacy`]
  ] as const) {
    await page.goto(path)
    const head = page.locator('head')
    await expect(head.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      canonical
    )
    const route = path.replace(/^\/es(?=\/|$)/u, '') || '/'
    const english = route === '/' ? site : `${site}${route}`
    for (const [hreflang, href] of [
      ['en', english],
      ['es', `${site}/es${route === '/' ? '' : route}`],
      ['x-default', english]
    ] as const)
      await expect(
        head.locator(`link[rel="alternate"][hreflang="${hreflang}"]`)
      ).toHaveAttribute('href', href)
    await expect(head.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'index, follow'
    )
  }
  // Simulated answers and participant answers stay in their original
  // language, so their pages are noindex outside English.
  for (const path of ['/es/users/jensenhuang']) {
    await page.goto(path)
    const head = page.locator('head')
    await expect(head.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${site}${path.slice(3)}`
    )
    await expect(head.locator('link[rel="alternate"][hreflang]')).toHaveCount(0)
    await expect(head.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, follow'
    )
  }
})

test('choosing a language in the footer keeps the page and is remembered for unprefixed URLs', async ({
  page,
  context
}) => {
  await page.goto('/users?sort=ignored#top')
  await page
    .locator('footer')
    .getByRole('combobox', { name: 'Language' })
    .click()
  await page.getByRole('option', { name: 'Español' }).click()
  await expect(page).toHaveURL(/\/es\/users\?sort=ignored#top$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  await expect(
    page.getByRole('heading', { name: 'Explora los usuarios simulados' })
  ).toBeVisible()
  const cookie = (await context.cookies()).find(
    ({ name }) => name === 'NEXT_LOCALE'
  )
  expect(cookie).toMatchObject({ value: 'es', sameSite: 'Lax', path: '/' })
  // A one-year preference, not a session cookie.
  expect(cookie!.expires * 1000 - Date.now()).toBeGreaterThan(
    364 * 24 * 60 * 60 * 1000
  )

  // Later visits to English URLs follow the explicit choice; prefixed and
  // non-page URLs do not.
  await page.goto('/about')
  await expect(page).toHaveURL(/\/es\/about$/)
  await page.goto('/')
  await expect(page).toHaveURL(/\/es$/)
  expect((await page.request.get('/robots.txt')).url()).toMatch(
    /\/robots\.txt$/
  )

  await page.locator('footer').getByRole('combobox', { name: 'Idioma' }).click()
  await page.getByRole('option', { name: 'English' }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await page.goto('/about')
  await expect(page).toHaveURL(/\/about$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
})

test('page responses never set cookies, in any locale', async ({ request }) => {
  for (const path of [
    '/',
    '/es',
    '/about',
    '/es/users',
    '/users/jensenhuang'
  ]) {
    const response = await request.get(path, { maxRedirects: 0 })
    expect(response.status(), path).toBe(200)
    expect(response.headers()['set-cookie'], path).toBeUndefined()
  }
})

test('starting from a Spanish page opens the interview under /es', async ({
  page
}) => {
  await page.goto('/es')
  await page
    .getByRole('link', { name: 'Mapea tu propia visión de la IA' })
    .last()
    .click()
  await expect(page).toHaveURL(/\/es\/assessments\/[a-f0-9-]+$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  // The unsaved draft's page ticket must reach the locale-prefixed owner page.
  await expect(page.locator('textarea').first()).toBeVisible()
})
