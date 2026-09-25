import { startAssessment } from './fixtures'
import { expect, test } from './fixtures'

// Uses actual application control flow with exact local phrases, never paid inference.
test('test replies reliably trigger paperclips and an explicit request works once per assessment', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await startAssessment(page)
  await expect(
    page.getByRole('button', { name: 'Create a new assessment', exact: true })
  ).toHaveCount(0)
  const answer = page.getByLabel('Your answer', { exact: true })
  const submit = async (text: string) => {
    await answer.fill(text)
    await page.getByRole('button', { name: /^Continue/ }).click()
  }
  await submit('test')
  await expect(
    page.getByRole('button', { name: 'Create a new assessment', exact: true })
  ).toHaveCount(0)
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
    page.getByText('Choose what to do next', { exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Try again', exact: true })
  ).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Dismiss paperclips', exact: true })
  ).toHaveCount(0)
  // Recovery-only runs can start another assessment without deleting the first.
  const previousUrl = page.url()
  await page
    .getByRole('navigation', { name: 'breadcrumb' })
    .getByRole('link', { name: 'My assessments', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Create a new assessment', exact: true })
    .click()
  await expect(page).toHaveURL(/\/assessments\/[a-f0-9-]+$/)
  await expect(page).not.toHaveURL(previousUrl)
  await expect(answer).toHaveValue('')
  await expect(
    page.getByRole('button', { name: 'Create a new assessment', exact: true })
  ).toHaveCount(0)
  await expect(
    page.getByText('Choose what to do next', { exact: true })
  ).toHaveCount(0)
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
}) => {
  const operations: string[] = []
  page.on('request', (request) => {
    if (
      /\/api\/assessments\/[a-f0-9-]+$/.test(new URL(request.url()).pathname) &&
      request.method() === 'POST'
    )
      operations.push(request.postDataJSON().operation.type)
  })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await startAssessment(page)
  const answer = page.getByLabel('Your answer', { exact: true })
  await expect(answer).toBeVisible()
  await page.clock.install()
  await answer.fill('paperclips')
  await page.getByRole('button', { name: /^Continue/ }).click()
  const scene = page.locator('[data-slot=paperclip-interlude]')
  const dismiss = page.getByRole('button', { name: 'Dismiss paperclips' })
  await expect(scene).toBeVisible()
  await expect(dismiss).toBeVisible()
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
  await expect(page.getByText(/You found the easter egg/)).toBeVisible()
  // Recovery-only runs can start another assessment without deleting the first.
  const previousUrl = page.url()
  await page
    .getByRole('navigation', { name: 'breadcrumb' })
    .getByRole('link', { name: 'My assessments', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Create a new assessment', exact: true })
    .click()
  await expect(page).toHaveURL(/\/assessments\/[a-f0-9-]+$/)
  await expect(page).not.toHaveURL(previousUrl)
  await expect(answer).toHaveValue('')
  await expect(
    page.getByRole('button', { name: 'Create a new assessment', exact: true })
  ).toHaveCount(0)
  await expect(
    page.getByText('Choose what to do next', { exact: true })
  ).toHaveCount(0)
  await page.setViewportSize({ width: 390, height: 844 })
  await answer.fill('show me paperclips')
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect(dismiss).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(scene).toHaveCount(0)
  await expect(
    page.getByText('We’ve made some paperclips.', { exact: true })
  ).toBeVisible()
  await expect(answer).toBeEnabled()
  expect(operations).toEqual(['answer', 'dismiss', 'answer', 'dismiss'])
})
