import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { recordDisposition } from '../../lib/assessment/state'
import { storageKey } from '../../lib/persistence/storage'

async function tabTo(page: Page, target: Locator) {
  for (let i = 0; i < 30; i++) {
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

test('mobile keyboard flow, themes, result focus and expanded debug fit', async ({
  page
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.locator('h1')).toBeFocused()
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
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: /^Continue/ })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(answer).toHaveValue('')
    await expect(page.locator('h1')).toBeFocused()
  }
  const view = page.getByRole('button', { name: 'View my result' })
  await tabTo(page, view)
  await page.keyboard.press('Enter')
  await expect(
    page.getByRole('heading', { name: 'A map of your AI worldview' })
  ).toBeFocused()
  await expect(page.getByRole('img', { name: /^Doom–Bloom:/ })).toHaveAttribute(
    'aria-label',
    /not event probabilities/
  )
  await fitsViewport(page)
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
  await page.screenshot({
    path: testInfo.outputPath('desktop-result.png'),
    fullPage: true
  })
  const restart = page.getByRole('button', { name: 'Restart', exact: true })
  await tabTo(page, restart)
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(restart).toBeFocused()
  expect(errors).toEqual([])
})

test('reduced-motion paperclips are reachable and dismissible by keyboard', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  let providerCalls = 0
  await page.route('**/api/assessment', async (route) => {
    const input = route.request().postDataJSON()
    const state =
      input.operation.type === 'answer'
        ? recordDisposition(input.assessment, 'non_answer', 1, input.requestId)
        : input.assessment
    providerCalls += input.operation.type === 'answer' ? 1 : 0
    if (input.operation.type === 'dismiss')
      state.recovery.paperclipActive = false
    state.revision++
    await route.fulfill({
      json: {
        assessmentId: state.id,
        baseRevision: state.revision - 1,
        requestId: input.requestId,
        assessment: state,
        provider: 'fixture'
      }
    })
  })
  await page.goto('/')
  for (let i = 0; i < 2; i++) {
    await page.getByLabel('Your answer', { exact: true }).fill('off-topic')
    await page.getByRole('button', { name: /^Continue/ }).click()
    await expect(
      page.getByRole('button', { name: /^Reading your answer/ })
    ).toHaveCount(0)
  }
  await expect(page.locator('.paperclip-effect')).toHaveCSS(
    'animation-name',
    'none'
  )
  const dismiss = page.getByRole('button', { name: 'Dismiss paperclips' })
  await tabTo(page, dismiss)
  await page.keyboard.press('Enter')
  await expect(dismiss).toHaveCount(0)
  expect(providerCalls).toBe(2)
})

test('recovery counters survive a tab conflict and reload without a new allowance', async ({
  page,
  context
}) => {
  let providerCalls = 0
  await context.route('**/api/assessment', async (route) => {
    const input = route.request().postDataJSON()
    const state =
      input.operation.type === 'answer'
        ? recordDisposition(input.assessment, 'non_answer', 1, input.requestId)
        : input.assessment
    providerCalls += input.operation.type === 'answer' ? 1 : 0
    if (input.operation.type === 'retry') {
      state.status = 'recovery'
      state.recovery.paperclipActive = false
    }
    state.revision++
    await route.fulfill({
      json: {
        assessmentId: state.id,
        baseRevision: state.revision - 1,
        requestId: input.requestId,
        assessment: state,
        provider: 'fixture'
      }
    })
  })
  await page.goto('/')
  await page
    .getByLabel('Your answer', { exact: true })
    .fill('unrelated first answer')
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect(page.getByText('Another try?', { exact: true })).toBeVisible()
  const second = await context.newPage()
  await second.goto('/')
  await second
    .getByLabel('Your answer', { exact: true })
    .fill('unrelated second answer')
  await second.getByRole('button', { name: /^Continue/ }).click()
  await expect(
    second.getByText('We’ve made some paperclips.', { exact: true })
  ).toBeVisible()
  await expect(
    page.getByText('This assessment changed in another tab')
  ).toBeVisible()
  await second.reload()
  await expect(
    second.getByRole('button', { name: 'Dismiss paperclips' })
  ).toHaveCount(0)
  await page.getByRole('button', { name: 'Reload latest version' }).click()
  expect(
    await page.evaluate((key) => {
      const saved = JSON.parse(localStorage.getItem(key)!)
      return saved.assessment.recovery.evaluated
    }, storageKey)
  ).toBe(2)
  await page.getByRole('button', { name: 'Try again', exact: true }).click()
  await page
    .getByLabel('Your answer', { exact: true })
    .fill('unrelated third answer')
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect(
    page.getByRole('button', { name: 'Try again', exact: true })
  ).toHaveCount(0)
  expect(providerCalls).toBe(3)
})

test('catastrophic-risk correction quotes that claim in the interface', async ({
  page
}) => {
  await page.goto('/')
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
  await page.getByRole('button', { name: 'View my result' }).click()
  await page
    .getByRole('button', { name: 'Inspect evidence & clarify my view' })
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
  await expect(page.locator('h1')).toContainText('catastrophic risk')
  await expect(page.locator('h1')).toContainText(claim!)
})
