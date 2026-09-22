import { expect, test } from '@playwright/test'

// Uses actual application control flow with exact local phrases, never paid inference.
test('test replies reliably trigger paperclips and an explicit request works once per assessment', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/assessment')
  await expect(
    page.getByRole('button', { name: 'Restart', exact: true })
  ).toHaveCount(0)
  const answer = page.getByLabel('Your answer', { exact: true })
  const submit = async (text: string) => {
    await answer.fill(text)
    await page.getByRole('button', { name: /^Continue/ }).click()
  }
  await submit('test')
  await expect(
    page.getByRole('button', { name: 'Restart', exact: true })
  ).toBeVisible()
  await expect(page.getByText('Another try?', { exact: true })).toBeVisible()
  await submit('test again')
  await expect(
    page.getByText('We’ve made some paperclips.', { exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Dismiss paperclips', exact: true })
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Dismiss paperclips', exact: true })
    .click()
  await page.reload()
  await expect(
    page.getByRole('button', { name: 'Dismiss paperclips', exact: true })
  ).toHaveCount(0)
  await expect(answer).toBeEnabled()
  await expect(
    page.getByText('We’ve made some paperclips.', { exact: true })
  ).toBeVisible()
  await submit('paperclips')
  await expect(answer).toBeEnabled()
  await submit('test')
  await expect(
    page.getByText('Let’s pause here', { exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Try again', exact: true })
  ).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Dismiss paperclips', exact: true })
  ).toHaveCount(0)
  // Recovery-only runs must be restartable without an accepted answer.
  await page.getByRole('button', { name: 'Restart', exact: true }).click()
  await page
    .getByRole('button', { name: 'Restart & clear', exact: true })
    .click()
  await expect(answer).toHaveValue('')
  await expect(
    page.getByRole('button', { name: 'Restart', exact: true })
  ).toHaveCount(0)
  await expect(page.getByText('Let’s pause here', { exact: true })).toHaveCount(
    0
  )
  await submit('show me paperclips')
  await expect(
    page.getByRole('button', { name: 'Dismiss paperclips', exact: true })
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Jev / assessment debugging details' })
    .click()
  await expect(
    page.getByText('This operation made no inference requests.', {
      exact: true
    })
  ).toBeVisible()
})

test('paperclip fireworks stay for ten seconds, finish automatically and support immediate Escape', async ({
  page
}, testInfo) => {
  const operations: string[] = []
  page.on('request', (request) => {
    if (request.url().endsWith('/api/assessment'))
      operations.push(request.postDataJSON().operation.type)
  })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/assessment')
  const answer = page.getByLabel('Your answer', { exact: true })
  await expect(answer).toBeVisible()
  await page.clock.install()
  await answer.fill('paperclips')
  await page.getByRole('button', { name: /^Continue/ }).click()
  const scene = page.locator('[data-slot=paperclip-interlude]')
  const dismiss = page.getByRole('button', { name: 'Dismiss paperclips' })
  await expect(scene).toBeVisible()
  await expect(scene.locator('.paperclip-sprite')).toHaveCount(394)
  await expect(scene.locator('.paperclip-sprite').first()).toHaveText('📎')
  await expect(scene.locator('.paperclip-effect svg')).toHaveCount(0)
  await expect(dismiss).toBeVisible()
  // Inspect the finale at a reproducible point without slowing the test down.
  const sprites = await scene.evaluate((element) => {
    for (const animation of element.getAnimations({ subtree: true })) {
      animation.pause()
      animation.currentTime = 10_100
    }
    return [...element.querySelectorAll('.paperclip-sprite')].filter(
      (sprite) => Number(getComputedStyle(sprite).opacity) > 0.1
    ).length
  })
  expect(sprites).toBeGreaterThan(50)
  await page.screenshot({
    path: testInfo.outputPath('paperclip-fireworks-desktop.png'),
    fullPage: false
  })
  await page.clock.runFor(10_000)
  await expect(dismiss).toBeVisible()
  // Re-rendering interview details must not restart the scene's lifetime.
  await page
    .getByRole('button', { name: 'Jev / assessment debugging details' })
    .click()
  await page.clock.runFor(3000)
  await expect(scene).toHaveCount(0)
  await expect(
    page.getByText('We’ve made some paperclips.', { exact: true })
  ).toBeVisible()
  expect(operations).toEqual(['answer', 'dismiss'])
  await expect(answer).toBeEnabled()
  await expect(
    page.getByText(/Now give the question an earnest answer/)
  ).toBeVisible()
  // Recovery-only runs must be restartable without an accepted answer.
  await page.getByRole('button', { name: 'Restart', exact: true }).click()
  await page
    .getByRole('button', { name: 'Restart & clear', exact: true })
    .click()
  await expect(answer).toHaveValue('')
  await expect(
    page.getByRole('button', { name: 'Restart', exact: true })
  ).toHaveCount(0)
  await expect(page.getByText('Let’s pause here', { exact: true })).toHaveCount(
    0
  )
  await page.setViewportSize({ width: 390, height: 844 })
  await answer.fill('show me paperclips')
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect(dismiss).toBeVisible()
  await scene.evaluate((element) => {
    for (const animation of element.getAnimations({ subtree: true })) {
      animation.pause()
      animation.currentTime = 1800
    }
  })
  await page.screenshot({
    path: testInfo.outputPath('paperclip-fireworks-mobile.png'),
    fullPage: false
  })
  await page.keyboard.press('Escape')
  await expect(scene).toHaveCount(0)
  await expect(
    page.getByText('We’ve made some paperclips.', { exact: true })
  ).toBeVisible()
  await expect(answer).toBeEnabled()
  expect(operations).toEqual(['answer', 'dismiss', 'answer', 'dismiss'])
})
