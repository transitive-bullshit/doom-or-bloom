import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test('header CTA collapses after starting an assessment and leaving it', async ({
  page
}) => {
  await page.goto('/about')
  const cta = page
    .getByRole('navigation', { name: 'Site navigation' })
    .getByRole('link', { name: 'Map your own worldview' })
  await cta.hover()
  await expect(cta).toHaveAttribute('data-expanded', 'true')
  await cta.click()
  await expect(page).toHaveURL(/\/assessments\/[^/?]+$/)
  await page.mouse.move(0, 400)
  await expect(cta).toHaveAttribute('data-expanded', 'false')
  await cta.hover()
  await expect(cta).toHaveAttribute('data-expanded', 'true')
  await page.mouse.move(0, 400)
  await expect(cta).toHaveAttribute('data-expanded', 'false')
})

test('header CTA supports keyboard focus and resets on keyboard navigation', async ({
  page
}) => {
  await page.goto('/about')
  const cta = page
    .getByRole('navigation', { name: 'Site navigation' })
    .getByRole('link', { name: 'Map your own worldview' })
  await page.keyboard.press('Tab')
  await cta.focus()
  await expect(cta).toHaveAttribute('data-expanded', 'true')
  await page.keyboard.press('Tab')
  await expect(cta).toHaveAttribute('data-expanded', 'false')
  await page.keyboard.press('Shift+Tab')
  await expect(cta).toBeFocused()
  await expect(cta).toHaveAttribute('data-expanded', 'true')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/assessments\/[^/?]+$/)
  await expect(cta).toHaveAttribute('data-expanded', 'false')
})

test('anonymous header CTA is desktop-only without mobile overflow', async ({
  page
}) => {
  await page.route('**/api/auth/get-session**', (route) =>
    route.fulfill({ json: null })
  )
  for (const [width, path, visible] of [
    [1488, '/', true],
    [640, '/about', true],
    [639, '/about', false],
    [390, '/users/tszzl', false],
    [320, '/assessments', false]
  ] as const) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(path)
    const cta = page
      .getByRole('navigation', { name: 'Site navigation' })
      .getByRole('link', {
        name: 'Map your own worldview',
        includeHidden: true
      })
    await expect(cta).toHaveCount(1)
    if (visible) await expect(cta).toBeVisible()
    else await expect(cta).toBeHidden()
    await expect(cta).toHaveAttribute('href', '/assessments?start=1')
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
  }
})

test('account menu supports keyboard navigation and logout errors then success', async ({
  page
}) => {
  let signedIn = true
  let failLogout = true
  let image =
    'https://pbs.twimg.com/profile_images/header-test/avatar_normal.jpg'
  const portrait = await readFile('public/personas/karpathy.jpg')
  await page.route('**/_next/image?**', (route) => {
    const source = new URL(route.request().url()).searchParams.get('url')
    if (!source?.includes('/profile_images/header-test/'))
      return route.continue()
    return source.endsWith('/avatar_400x400.jpg')
      ? route.fulfill({ contentType: 'image/jpeg', body: portrait })
      : route.fulfill({ status: 404, body: 'Missing avatar' })
  })
  await page.route('**/api/auth/get-session**', (route) =>
    route.fulfill({
      json: signedIn
        ? {
            session: {
              id: 'header-session',
              userId: 'header-user',
              expiresAt: '2099-01-01T00:00:00Z'
            },
            user: {
              id: 'header-user',
              name: 'Header Test',
              email: 'header@example.com',
              isAnonymous: false,
              image
            }
          }
        : null
    })
  )
  await page.route('**/api/auth/sign-out', (route) => {
    if (failLogout)
      return route.fulfill({ status: 503, json: { error: 'Internal failure' } })
    signedIn = false
    return route.fulfill({ json: { success: true } })
  })
  await page.goto('/users/tszzl')
  const trigger = page.getByRole('button', { name: 'Account menu' })
  await expect(trigger).toBeVisible()
  const avatar = trigger.locator('img')
  await expect(avatar).toHaveAttribute('src', /\/_next\/image\?/)
  const avatarUrl = new URL((await avatar.getAttribute('src'))!, page.url())
  expect(avatarUrl.origin).toBe(new URL(page.url()).origin)
  expect(avatarUrl.searchParams.get('url')).toBe(
    'https://pbs.twimg.com/profile_images/header-test/avatar_400x400.jpg'
  )
  await expect
    .poll(() =>
      avatar.evaluate((node) => (node as HTMLImageElement).naturalWidth)
    )
    .toBeGreaterThan(0)
  image = 'https://pbs.twimg.com/profile_images/header-test/missing_normal.jpg'
  const failedAvatar = page.waitForResponse(
    (response) =>
      new URL(response.url()).searchParams
        .get('url')
        ?.endsWith('/header-test/missing_400x400.jpg') === true
  )
  await page.reload()
  expect((await failedAvatar).status()).toBe(404)
  await expect(trigger.locator('img')).toHaveCount(0)
  await expect(trigger.locator('[data-slot="avatar-fallback"]')).toHaveText('H')
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(
    page.getByRole('menuitem', { name: 'My assessments' })
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await trigger.click()
  await page.getByRole('menuitem', { name: 'My assessments' }).click()
  await expect(page).toHaveURL(/\/assessments$/)
  await expect(
    page.getByRole('button', { name: 'Sign out', exact: true })
  ).toHaveCount(0)
  await trigger.click()
  await page.getByRole('menuitem', { name: 'Log out', exact: true }).click()
  await expect(
    page.getByText('Couldn’t log out. Please try again.')
  ).toBeVisible()
  failLogout = false
  await trigger.click()
  await page.getByRole('menuitem', { name: 'Log out', exact: true }).click()
  await expect(
    page
      .getByRole('navigation', { name: 'Site navigation' })
      .getByRole('link', { name: 'Map your own worldview' })
  ).toBeVisible()
})

test('anonymous navigation stays still while the session loads', async ({
  page
}) => {
  let finishSession!: () => void
  const gate = new Promise<void>((resolve) => {
    finishSession = resolve
  })
  await page.route('**/api/auth/get-session**', async (route) => {
    await gate
    await route.fulfill({ json: null })
  })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  const navigation = page.getByRole('navigation', { name: 'Site navigation' })
  const library = navigation.getByRole('link', {
    name: 'My assessments',
    exact: true
  })
  const cta = navigation.getByRole('link', { name: 'Map your own worldview' })
  await expect(cta).toBeVisible()
  await expect(library).toHaveCount(0)
  const position = await cta.boundingBox()
  const sessionResponse = page.waitForResponse((response) =>
    response.url().includes('/api/auth/get-session')
  )
  finishSession()
  await sessionResponse
  await expect(cta).toBeVisible()
  expect((await cta.boundingBox())!.x).toBeCloseTo(position!.x, 1)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(library).toHaveCount(0)
  expect(position).not.toBeNull()
  expect(errors).toEqual([])
})
