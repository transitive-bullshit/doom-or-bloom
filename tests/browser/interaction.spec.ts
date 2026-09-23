import { expect, test, startAssessment, savedAssessment } from './fixtures'
import type { Locator, Page } from '@playwright/test'

async function tabTo(page: Page, target: Locator) {
  const limit =
    (await page
      .locator(
        'a, button, input, select, textarea, summary, nextjs-portal, [tabindex]'
      )
      .count()) + 2
  for (let i = 0; i < limit; i++) {
    if (await target.evaluate((element) => element === document.activeElement))
      return
    await page.keyboard.press('Tab')
  }
  await expect(target).toBeFocused()
}
async function fitsViewport(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual((await page.evaluate(() => window.innerWidth)) + 1)
}

test('mobile keyboard flow, themes, natural focus and expanded debug fit', async ({
  page
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await startAssessment(page)
  await expect(page.locator('h1')).toHaveText('Map your AI worldview')
  await expect(page.locator('h2')).toBeVisible()
  await expect(page.locator('h2')).not.toBeFocused()
  await expect(
    page.getByLabel('Your answer', { exact: true })
  ).not.toBeFocused()
  await fitsViewport(page)
  await page.screenshot({ path: testInfo.outputPath('mobile-light.png') })
  await page.getByRole('button', { name: 'Toggle light or dark theme' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.screenshot({ path: testInfo.outputPath('mobile-dark.png') })
  await page.getByRole('button', { name: 'Toggle light or dark theme' }).click()
  for (let i = 0; i < 3; i++) {
    const answer = page.getByLabel('Your answer', { exact: true })
    await tabTo(page, answer)
    await page.keyboard.insertText(
      'AI could improve medicine, but delivery takes time. I am uncertain about long-term control.'
    )
    await tabTo(page, page.getByRole('button', { name: /^Continue/ }))
    await expect(page.getByRole('button', { name: /^Continue/ })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(answer).toHaveValue('')
    await expect(page.locator('h2')).toBeVisible()
  }
  const view = page.getByRole('button', { name: 'View my results' })
  await tabTo(page, view)
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible()
  for (const name of ['Insights', 'A few things that stood out']) {
    const disclosure = page.getByRole('button', { name, exact: true })
    await expect(disclosure).toHaveAttribute('aria-expanded', 'false')
    await disclosure.click()
    await expect(disclosure).toHaveAttribute('aria-expanded', 'true')
    await disclosure.click()
    await expect(disclosure).toHaveAttribute('aria-expanded', 'false')
  }

  await expect(
    page.getByRole('img', { name: /^Doom–Bloom:/ }).first()
  ).toHaveAttribute('aria-label', /not event probabilities/)
  await fitsViewport(page)
  await page
    .locator('[data-slot="worldview-map"]')
    .first()
    .screenshot({ path: testInfo.outputPath('hero-map-mobile.png') })
  await page.screenshot({
    path: testInfo.outputPath('mobile-result.png'),
    fullPage: true
  })
  await page
    .getByRole('button', { name: 'Jev / assessment debugging details' })
    .click()
  await expect(page.locator('[data-slot="json-viewer"]').first()).toBeVisible()
  await fitsViewport(page)
  await page.getByRole('button', { name: 'Debug on', exact: true }).click()
  await expect(page.locator('[data-slot="json-viewer"]')).toHaveCount(0)
  await page.setViewportSize({ width: 1365, height: 960 })
  await page
    .locator('[data-slot="worldview-map"]')
    .first()
    .screenshot({ path: testInfo.outputPath('hero-map-desktop.png') })
  await page.screenshot({
    path: testInfo.outputPath('desktop-result.png'),
    fullPage: true
  })
  const share = page.getByRole('button', {
    name: 'Share assessment',
    exact: true
  })
  await tabTo(page, share)
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(share).toBeFocused()
  expect(errors).toEqual([])
})

test('reduced-motion paperclips are reachable and dismissible by keyboard', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await startAssessment(page)
  for (let i = 0; i < 2; i++) {
    await page.getByLabel('Your answer', { exact: true }).fill('test')
    await page.getByRole('button', { name: /^Continue/ }).click()
    await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue(
      ''
    )
  }
  await expect(page.locator('.paperclip-effect')).toHaveCSS(
    'animation-name',
    'none'
  )
  const dismiss = page.getByRole('button', { name: 'Dismiss paperclips' })
  await tabTo(page, dismiss)
  await page.keyboard.press('Enter')
  await expect(dismiss).toHaveCount(0)
})

test('recovery counters survive a tab conflict and reload without a new allowance', async ({
  page,
  context
}) => {
  await startAssessment(page)
  await page.getByLabel('Your answer', { exact: true }).fill('test')
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect(page.getByText('Another try?', { exact: true })).toBeVisible()
  const second = await context.newPage()
  await second.goto(page.url())
  await second.getByLabel('Your answer', { exact: true }).fill('test')
  await second.getByRole('button', { name: /^Continue/ }).click()
  await expect(
    second.getByText('We’ve made some paperclips.', { exact: true })
  ).toBeVisible()
  await page.getByLabel('Your answer', { exact: true }).fill('stale answer')
  const rejected = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && response.status() === 409
  )
  await page.getByRole('button', { name: /^Continue/ }).click()
  await rejected
  await page.getByRole('button', { name: 'Refresh saved progress' }).click()
  await expect(
    page.getByText('We’ve made some paperclips.', { exact: true })
  ).toBeVisible()
  expect((await savedAssessment(page)).recovery.evaluated).toBe(1)
  await second.reload()
  expect((await savedAssessment(second)).recovery.evaluated).toBe(1)
  for (const evaluated of [2, 3]) {
    await page.getByLabel('Your answer', { exact: true }).fill('test')
    await page.getByRole('button', { name: /^Continue/ }).click()
    await expect
      .poll(async () => (await savedAssessment(page)).recovery.evaluated)
      .toBe(evaluated)
  }
  await expect(
    page.getByText('Let’s pause here', { exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Try again', exact: true })
  ).toHaveCount(0)
})

test('catastrophic-risk correction quotes that claim in the interface', async ({
  page
}) => {
  await startAssessment(page)
  for (let i = 0; i < 3; i++) {
    await page
      .getByLabel('Your answer', { exact: true })
      .fill(
        'Ordinary disruption and catastrophic loss of control are different concerns.'
      )
    await page.getByRole('button', { name: /^Continue/ }).click()
    await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue(
      ''
    )
  }
  await page.getByRole('button', { name: 'View my results' }).click()
  await page
    .getByRole('button', { name: 'Review & clarify my results' })
    .click()
  const section = page
    .locator('section')
    .filter({
      has: page.getByRole('heading', { name: 'Catastrophic risk', exact: true })
    })
    .last()
  const claim = await section.locator('p').first().textContent()
  await section
    .getByRole('button', { name: 'That’s not quite my view' })
    .click()
  const clarification = page.getByRole('heading', {
    name: /catastrophic risk/i
  })
  await expect(clarification).toContainText(claim!)
})
