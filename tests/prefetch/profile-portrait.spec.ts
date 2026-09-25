import { expect, test } from '@playwright/test'

for (const [path, deviceScaleFactor] of [
  ['/', 1],
  ['/users', 2]
] as const) {
  test.describe(`portrait from ${path} at ${deviceScaleFactor}x`, () => {
    test.use({ deviceScaleFactor })

    test('shows the map-sized portrait while the eager full-size image loads', async ({
      page
    }, testInfo) => {
      // Keep navigation's page crossfade out of the portrait screenshots.
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.route('**/api/auth/get-session*', (route) =>
        route.fulfill({ json: null })
      )
      await page.goto(path)
      const link = page.locator('.study-chart a[href="/users/tszzl"]')
      const mapImage = link.locator('img')
      await expect
        .poll(() =>
          mapImage.evaluate((node) => (node as HTMLImageElement).naturalWidth)
        )
        .toBeGreaterThan(0)
      const mapSource = await mapImage.evaluate(
        (node) => (node as HTMLImageElement).currentSrc
      )
      const mapUrl = new URL(mapSource)
      let release!: () => void
      const gate = new Promise<void>((resolve) => {
        release = resolve
      })
      let requested!: () => void
      const fullSizeRequest = new Promise<void>((resolve) => {
        requested = resolve
      })
      await page.route('**/_next/image?**', async (route) => {
        const url = new URL(route.request().url())
        if (
          url.searchParams.get('url') === mapUrl.searchParams.get('url') &&
          Number(url.searchParams.get('w')) >
            Number(mapUrl.searchParams.get('w'))
        ) {
          requested()
          await gate
        }
        await route.continue()
      })
      try {
        await link.click()
        await fullSizeRequest
        const portrait = page.locator(
          'main header [data-slot="profile-portrait"]'
        )
        const preview = portrait.locator('img[aria-hidden="true"]')
        const fullSize = portrait.locator('img:not([aria-hidden])')
        await expect(preview).toBeVisible()
        await expect
          .poll(() =>
            preview.evaluate((node) => (node as HTMLImageElement).naturalWidth)
          )
          .toBeGreaterThan(0)
        // Exact srcSet selection matches the map at both screen densities.
        expect(
          await preview.evaluate(
            (node) => (node as HTMLImageElement).currentSrc
          )
        ).toBe(mapSource)
        await expect(fullSize).toHaveAttribute('loading', 'eager')
        await expect(fullSize).toHaveAttribute('fetchpriority', 'high')
        await expect(fullSize).toHaveCSS('opacity', '0')
        await portrait.screenshot({
          path: testInfo.outputPath('pending-portrait.png')
        })
        release()
        await expect(fullSize).toHaveCSS('opacity', '1')
        await expect(preview).toHaveCount(0)
        expect(
          await fullSize.evaluate(
            (node) => (node as HTMLImageElement).naturalWidth
          )
        ).toBeGreaterThan(0)
        await portrait.screenshot({
          path: testInfo.outputPath('loaded-portrait.png')
        })
      } finally {
        release()
        await page.unrouteAll({ behavior: 'wait' })
      }
    })
  })
}
