import { expect, test } from '@playwright/test'
import { createAssessment } from '../../lib/assessment/state'
import { emptyComponent } from '../../lib/assessment/projections'
import { storageKey } from '../../lib/persistence/storage'

async function contrastRatios(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const map = document.querySelector('[data-slot="worldview-map"]')!
    const style = getComputedStyle(map)
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    const ctx = canvas.getContext('2d')!
    function luminance(color: string) {
      ctx.fillStyle = color
      ctx.fillRect(0, 0, 1, 1)
      const channels = Array.from(ctx.getImageData(0, 0, 1, 1).data)
        .slice(0, 3)
        .map((byte) => {
          const value = byte / 255
          return value <= 0.04045
            ? value / 12.92
            : ((value + 0.055) / 1.055) ** 2.4
        })
      return (
        channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722
      )
    }
    const background = luminance(style.backgroundColor)
    return ['--map-text', '--map-muted', '--map-doom', '--map-bloom'].map(
      (token) => {
        const foreground = luminance(style.getPropertyValue(token))
        return {
          token,
          ratio:
            (Math.max(background, foreground) + 0.05) /
            (Math.min(background, foreground) + 0.05)
        }
      }
    )
  })
}

for (const unplaced of [false, true]) {
  test(`map explains ${unplaced ? 'unplaced axes' : 'broad interpretation ranges'} without inference`, async ({
    page
  }, testInfo) => {
    const state = createAssessment(`map-${unplaced}`, 'fixture-v1')
    state.status = 'results'
    state.result = {
      evidenceRevision: 0,
      versions: state.versions,
      horizontal: {
        ...emptyComponent('outlook', 'Doom–Bloom'),
        value: unplaced ? null : 0.56,
        range: [0.12, 0.88]
      },
      vertical: {
        ...emptyComponent('epistemic', 'Demonstrated reasoning'),
        value: unplaced ? null : 0.74,
        range: [0.28, 0.92]
      },
      components: [],
      findings: [],
      resources: [],
      fingerprint: [],
      sources: [],
      provisional: true,
      capped: false,
      insufficient: unplaced,
      reason: 'Synthetic visual fixture; no inference.'
    }
    await page.addInitScript(
      ({ key, assessment }) =>
        localStorage.setItem(
          key,
          JSON.stringify({ token: 'map-fixture-token', assessment })
        ),
      { key: storageKey, assessment: state }
    )
    let inferenceCalls = 0
    await page.route('**/api/assessment', async (route) => {
      inferenceCalls++
      await route.abort()
    })
    await page.setViewportSize({ width: 1365, height: 960 })
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
    await page.goto('/')
    const map = page.locator('[data-slot="worldview-map"]')
    await expect(map).toContainText('Across: what future do you expect?')
    await expect(map).toContainText('Up: how have you explained your view?')
    await expect(map.getByRole('img')).toHaveAttribute(
      'aria-label',
      /12 to 88 horizontally, 28 to 92 vertically/
    )
    if (unplaced) {
      await expect(map).toContainText(
        'Point withheld until both axes are assessable'
      )
      await expect(map.locator('circle')).toHaveCount(0)
    } else {
      await expect(map.getByText('Your view', { exact: true })).toBeVisible()
      const area = map.locator('rect[stroke-dasharray="6 5"]')
      expect(Number(await area.getAttribute('width'))).toBeGreaterThan(400)
    }
    for (const pair of await contrastRatios(page))
      expect(pair.ratio).toBeGreaterThanOrEqual(4.5)
    await map.screenshot({ path: testInfo.outputPath('map-desktop.png') })
    await page.setViewportSize({ width: 390, height: 844 })
    await page
      .getByRole('button', { name: 'Toggle light or dark theme' })
      .click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    for (const pair of await contrastRatios(page))
      expect(pair.ratio).toBeGreaterThanOrEqual(4.5)
    await map.screenshot({ path: testInfo.outputPath('map-mobile-dark.png') })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(390)
    expect(inferenceCalls).toBe(0)
  })
}
