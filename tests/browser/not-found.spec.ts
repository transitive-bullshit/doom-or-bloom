import { expect, test } from '@playwright/test'

for (const width of [1488, 390]) {
  test(`branded 404 is accessible and links home at ${width}px`, async ({
    page
  }) => {
    await page.setViewportSize({ width, height: 761 })
    await page.emulateMedia({
      reducedMotion: 'reduce',
      colorScheme: width === 390 ? 'dark' : 'light'
    })
    const response = await page.goto('/lost-in-latent-space')
    expect(response?.status()).toBe(404)
    await expect(
      page.getByRole('heading', { name: '404 · Page not found' })
    ).toBeVisible()
    await expect(
      page.getByText('Looks like you got lost in latent space', { exact: true })
    ).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
    await page.getByRole('link', { name: 'Back to home', exact: true }).click()
    await expect(page).toHaveURL(/\/$/)
  })
}

test('missing persona uses the shared 404 page', async ({ page }) => {
  await page.goto('/users/nonexistent-persona')
  await expect(
    page.getByRole('heading', { name: '404 · Page not found' })
  ).toBeVisible()
  await expect(
    page.locator('meta[name="robots"][content="noindex"]')
  ).toHaveCount(1)
})
