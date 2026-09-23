import { expect, test } from '@playwright/test'

test('local question and corpus inspectors expose relationships without feedback editing', async ({
  page,
  request
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  let inferenceRequests = 0
  await page.route(/\/api\/assessments\/[a-f0-9-]+$/, (route) => {
    if (route.request().method() !== 'POST') return route.continue()
    inferenceRequests++
    return route.abort()
  })
  await page.setViewportSize({ width: 1440, height: 960 })
  await page.goto('/questions')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Built-in questions'
  )
  await expect(
    page.getByRole('group', { name: 'Authored question relationships' })
  ).toBeVisible()
  await expect(page.getByText(/38 catalog entries/)).toBeVisible()
  for (const id of [
    'grounding.source',
    'tension.general',
    'control.failuremode',
    'crux.test'
  ]) {
    await page.getByLabel('Search questions or metadata').fill(id)
    await expect(page.getByText('0 matches', { exact: true })).toBeVisible()
  }
  await page
    .getByLabel('Search questions or metadata')
    .fill('grounding.general')
  const entry = page.getByRole('link', {
    name: /^grounding\.general grounding/
  })
  await expect(entry).not.toContainText('Retired')
  await entry.click()
  const details = page.getByRole('region', {
    name: 'Question details grounding.general'
  })
  await expect(details).toBeVisible()
  await expect(details).toContainText('Permitted previous families')
  await expect(page.getByRole('button', { name: 'Save feedback' })).toHaveCount(
    0
  )
  await page.screenshot({
    path: testInfo.outputPath('questions-desktop.png'),
    fullPage: true
  })
  await page.goto('/corpus')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Built-in corpus'
  )
  await expect(
    page.getByRole('group', { name: 'Authored corpus relationships' })
  ).toBeVisible()
  await page
    .getByLabel('Search titles, IDs, topics, dates or snapshot text')
    .fill('event.openai-hugging-face-2026')
  const corpusEntry = page
    .getByRole('link')
    .filter({ hasText: 'Inspect details' })
    .filter({ hasText: 'event.openai-hugging-face-2026' })
    .first()
  await corpusEntry.click()
  await expect(page.getByRole('button', { name: 'Save feedback' })).toHaveCount(
    0
  )
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({
    path: testInfo.outputPath('corpus-mobile.png'),
    fullPage: true
  })
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(391)
  expect(
    await page
      .locator('main')
      .evaluate((main) =>
        [...main.querySelectorAll('*')].some(
          (element) =>
            ['auto', 'scroll'].includes(getComputedStyle(element).overflowY) &&
            element.scrollHeight > element.clientHeight + 1
        )
      )
  ).toBe(false)
  const removed = await request.post('/api/editorial-feedback', { data: {} })
  expect(removed.status()).toBe(404)
  expect(inferenceRequests).toBe(0)
  expect(errors).toEqual([])
})
