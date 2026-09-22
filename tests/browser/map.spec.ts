import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { createAssessment } from '../../lib/assessment/state'
import { emptyComponent } from '../../lib/assessment/projections'
import { storageKey } from '../../lib/persistence/storage'

// Measure the actual dashed upper boundary against nearby chart pixels.
async function rangeContrast(png: Buffer, exportOffset = 0) {
  const { data, info } = await sharp(png)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const luminance = (x: number, y: number) => {
    const offset = (y * info.width + x) * 4
    const rgb = [0, 1, 2].map((channel) => {
      const v = data[offset + channel]! / 255
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    })
    return rgb[0]! * 0.2126 + rgb[1]! * 0.7152 + rgb[2]! * 0.0722
  }
  const scale = info.width / 680
  const y = Math.round((159.2 + exportOffset) * scale)
  let best = 1
  for (let x = Math.round(170 * scale); x < Math.round(500 * scale); x++) {
    const background = luminance(x, y - Math.ceil(5 * scale))
    for (let dy = -1; dy <= 1; dy++) {
      const edge = luminance(x, y + dy)
      best = Math.max(
        best,
        (Math.max(edge, background) + 0.05) /
          (Math.min(edge, background) + 0.05)
      )
    }
  }
  return best
}

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

for (const unplaced of [false, true, 'outlook'] as const) {
  test(`map explains ${unplaced === 'outlook' ? 'unplaced outlook with placed influence' : unplaced ? 'unplaced axes' : 'broad interpretation ranges'} without inference`, async ({
    page,
    context
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
        value: unplaced === true ? null : 0.74,
        range: [0.28, 0.92]
      },
      components: [],
      findings: [],
      resources:
        unplaced === false
          ? [
              {
                id: 'resource.economic-scenarios',
                title: 'Economic scenarios from the Anthropic Institute',
                url: 'https://www.anthropic.com/institute/econ-scenarios',
                purpose: 'Internal recommendation rationale',
                effort: 'Leadership essay',
                question: 'Which bottlenecks could limit AI’s economic gains?'
              }
            ]
          : [],
      fingerprint:
        unplaced === 'outlook'
          ? [
              emptyComponent('timeline', 'Timeline'),
              emptyComponent('beneficial_potential', 'Expected upside'),
              {
                ...emptyComponent('risk_landscape', 'Expected harm'),
                claim:
                  'Severe or widespread harm is a material expected part of the future.'
              },
              emptyComponent('catastrophic_risk', 'Catastrophic risk'),
              emptyComponent('technical_controllability', 'Controllability'),
              emptyComponent(
                'institutional_competence',
                'Institutional competence'
              ),
              {
                ...emptyComponent('action_posture', 'Action posture'),
                claim:
                  'Restrained development and strong prior safeguards are preferred.'
              }
            ]
          : [],
      sources: [],
      provisional: true,
      capped: false,
      insufficient: unplaced === true,
      reason: 'Synthetic visual fixture; no inference.'
    }
    state.result.experiment = {
      version: 'worldview-v1',
      model: 'fixture-v1',
      generatedAt: '2026-09-20T00:00:00Z',
      evidenceRevision: 0,
      influence: {
        ...emptyComponent('influence', 'Human influence'),
        value: unplaced === true ? null : 0.74,
        range: [0.28, 0.92]
      },
      transformation: {
        ...emptyComponent('transformation', 'Scale of transformation'),
        value: unplaced === true ? null : 0.4,
        range: [0.2, 0.6]
      },
      axisEvidence: { influence: null, transformation: null },
      pdoom: {
        source: 'inferred',
        basis: 'direct',
        token: '18%',
        bounds: [0.1, 0.6],
        estimate: 0.18
      },
      milestones: [],
      hinges: []
    }
    if (unplaced === false) {
      state.answers = [
        {
          id: 'accepted-answer-one',
          promptInstanceId: state.prompts[0]!.id,
          promptText: state.prompts[0]!.text,
          text: 'AI could transform science over the next decade. '.repeat(20),
          substantive: true,
          hasHorizon: true,
          hasConviction: false
        }
      ]
      state.result.experiment.milestones = [
        {
          id: 'science',
          label: 'Scientific transformation',
          evidence: {
            answerId: 'accepted-answer-one',
            answerNumber: 1,
            text: 'over the next decade'
          }
        }
      ]
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
    await page.goto('/assessment')
    await expect(page.locator('[data-slot="worldview-map"]')).toHaveCount(1)
    const map = page.locator('[data-slot="worldview-map"]').first()
    if (unplaced === false) {
      const reference = page.getByRole('link', {
        name: 'Answer 1',
        exact: true
      })
      await expect(
        page.locator('#answer-1').getByRole('button', { name: /Read full/ })
      ).toBeVisible()
      await reference.click()
      await expect(page).toHaveURL(/#answer-1$/)
      await expect(page.locator('#answer-1')).toBeFocused()
      await expect(page.locator('#answer-1')).toBeInViewport()
      await expect(page.locator('#answer-1').getByRole('region')).toHaveText(
        state.answers[0]!.text.trim()
      )
      await page
        .locator('#answer-1')
        .getByRole('button', { name: /Collapse/ })
        .click()
      await reference.click()
      await expect(page.locator('#answer-1').getByRole('region')).toBeVisible()
    }

    await expect(map).toContainText(
      'Across: your expressed Doom–Bloom outlook.'
    )
    await expect(map).toContainText('Up: scale of transformation.')
    await expect(map.getByRole('img')).toHaveAttribute(
      'aria-label',
      /12 to 88 horizontally, 20 to 60 vertically/
    )
    if (unplaced === 'outlook') {
      await expect(
        page.getByText('Expected harm', { exact: true })
      ).toBeVisible()
      await expect(
        page.getByText('Action posture', { exact: true })
      ).toBeVisible()
      await expect(
        page.getByText(
          'Severe or widespread harm is a material expected part of the future.',
          { exact: true }
        )
      ).toBeVisible()
      await expect(map.getByRole('img')).toHaveAttribute(
        'aria-label',
        /Doom–Bloom: unplaced. Scale of transformation: 40 out of 100/
      )
    }
    if (unplaced) {
      await expect(map).toContainText('Position not yet determined')
      await expect(map.getByRole('img').locator('circle')).toHaveCount(0)
    } else {
      await expect(map.getByText('Your view', { exact: true })).toBeVisible()
      const area = map.locator('rect[stroke-dasharray="6 5"]')
      expect(Number(await area.getAttribute('width'))).toBeCloseTo(380)
    }
    if (unplaced === false) {
      const bookmark = page.getByRole('link', {
        name: /Economic scenarios from the Anthropic Institute/
      })
      await expect(bookmark.locator('img')).toHaveCount(2)
      await expect
        .poll(() =>
          bookmark
            .locator('img')
            .evaluateAll((images) =>
              images.every(
                (image) =>
                  (image as HTMLImageElement).complete &&
                  (image as HTMLImageElement).naturalWidth > 0
              )
            )
        )
        .toBe(true)
      await expect(bookmark).not.toContainText(
        'Internal recommendation rationale'
      )
      await expect(bookmark).not.toContainText('Leadership essay')
      await bookmark.screenshot({
        path: testInfo.outputPath('resource-bookmark.png')
      })
      const risk = page
        .getByText('Your estimated P(doom)', { exact: true })
        .locator('xpath=../..')
      await expect(risk.locator('[data-slot=axis-point]')).toHaveAttribute(
        'style',
        /left: 18%/
      )
      const downloading = page.waitForEvent('download')
      await map.getByRole('button', { name: 'Map image actions' }).click()
      await page.getByRole('menuitem', { name: 'Download PNG' }).click()
      const downloaded = await downloading
      const png = await readFile((await downloaded.path())!)
      expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
      expect(png.readUInt32BE(16)).toBe(1360)
      expect(png.readUInt32BE(20)).toBe(980)
      await downloaded.saveAs(testInfo.outputPath('exported-map.png'))
      await page.route('**/api/share-card', (route) =>
        route.fulfill({ status: 500, body: 'Unavailable' })
      )
      await page
        .getByRole('button', { name: 'Download card', exact: true })
        .click()
      await expect(
        page.locator('[data-sonner-toast][data-type=error]')
      ).toContainText('Card generation failed. Please try again.')
      await context.grantPermissions(['clipboard-read', 'clipboard-write'])
      await map.getByRole('button', { name: 'Map image actions' }).click()
      await page.getByRole('menuitem', { name: 'Copy PNG' }).click()
      await expect(
        page
          .locator('[data-sonner-toast]')
          .filter({ hasText: 'Map copied as PNG.' })
      ).toHaveText('Map copied as PNG.')
      expect(
        await page.evaluate(
          async () => (await navigator.clipboard.read())[0]?.types
        )
      ).toContain('image/png')
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
    if (unplaced === false) {
      const darkChart = await map.getByRole('img').screenshot()
      const downloading = page.waitForEvent('download')
      await map.getByRole('button', { name: 'Map image actions' }).click()
      await page.getByRole('menuitem', { name: 'Download PNG' }).click()
      const download = await downloading
      await download.saveAs(testInfo.outputPath('exported-map-dark.png'))
      const png = await readFile((await download.path())!)
      expect
        .soft(await rangeContrast(darkChart), 'dark chart range boundary')
        .toBeGreaterThan(2)
      expect
        .soft(await rangeContrast(png, 55), 'dark PNG range boundary')
        .toBeGreaterThan(2)
    }

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(390)
    if (unplaced === 'outlook')
      await page.screenshot({
        path: testInfo.outputPath('partial-result-mobile.png'),
        fullPage: true
      })
    expect(inferenceCalls).toBe(0)
  })
}
