import { expect, test } from '@playwright/test'

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
              image: null
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
