import { test, expect } from '@playwright/test'

test('optional X login is on the library and uses the configured callback and read scopes', async ({
  page,
  baseURL
}) => {
  await page.route('https://x.com/**', async (route) => {
    const url = new URL(route.request().url())
    expect(url.pathname).toBe('/i/oauth2/authorize')
    expect(url.searchParams.get('scope')).toBe('users.read tweet.read')
    expect(url.searchParams.get('redirect_uri')).toBe(
      `${baseURL}/api/auth/callback/twitter`
    )
    await route.fulfill({
      contentType: 'text/html',
      body: '<h1>Mock X authorization</h1>'
    })
  })
  await page.goto('/assessments')
  await expect(
    page.getByRole('button', { name: 'Create a new assessment' })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Sign in with X' }).click()
  await expect(
    page.getByRole('heading', { name: 'Mock X authorization' })
  ).toBeVisible()
  await page.goto('/assessments?authError=claim')
  await expect(page.locator('p[role=alert]')).toContainText(
    'Your browser still has access'
  )
  await page.goto('/assessments?authError=signin')
  await expect(page.locator('p[role=alert]')).toContainText(
    'Sign-in was not completed'
  )
})
