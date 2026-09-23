import { expect, test } from '@playwright/test'

test('anonymous visitors see a compact header CTA on every page without mobile overflow', async ({
  page
}) => {
  await page.route('**/api/auth/get-session**', (route) =>
    route.fulfill({ json: null })
  )
  for (const width of [1488, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    for (const path of ['/', '/users/tszzl', '/assessments']) {
      await page.goto(path)
      const cta = page
        .getByRole('navigation', { name: 'Site navigation' })
        .getByRole('link', { name: 'Map your own worldview' })
      await expect(cta).toBeVisible()
      await expect(cta).toHaveAttribute('href', '/assessments?start=1')
      expect((await cta.boundingBox())!.height).toBe(36)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      ).toBe(true)
    }
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
