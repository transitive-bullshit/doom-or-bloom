import { expect, test } from '@playwright/test'

test('local personas explain exact paths, compare saved reruns and disclose synthetic exchanges', async ({
  page,
  request,
  baseURL
}, testInfo) => {
  let inference = 0
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.route('**/api/assessment', (route) => {
    inference++
    return route.abort()
  })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/user-journeys')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'User Journeys'
  )
  await expect(page.getByRole('region', { name: 'Run summary' })).toContainText(
    'First eligible after answer 1'
  )
  await expect(
    page
      .getByRole('region', { name: 'Journey timeline' })
      .locator('[data-slot=journey-step]')
  ).toHaveCount(6)
  const first = page.locator('[data-slot=journey-step]').first()
  await expect(first).toContainText(
    'What do you think AI means for our future—and why?'
  )
  await first.getByRole('button', { name: 'Read full answer' }).click()
  await first
    .getByRole('button', { name: 'Decision details', exact: true })
    .click()
  await expect(first.getByRole('table')).toBeVisible()
  const previousRun = await page.getByLabel('View run').inputValue()
  const saved = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/user-journeys') &&
      response.request().method() === 'POST'
  )
  await page
    .getByRole('button', { name: 'Rerun this persona · synthetic' })
    .click()
  expect((await saved).status()).toBe(200)
  await expect(page.getByLabel('View run')).not.toHaveValue(previousRun)
  await expect(
    page.getByRole('region', { name: 'Run comparison' })
  ).toContainText('The salient observed path and result match.')
  await expect(page.getByLabel('View run')).not.toHaveValue('baseline')
  const reloadedFirst = page.locator('[data-slot=journey-step]').first()
  await reloadedFirst
    .getByRole('button', { name: 'Requests and responses', exact: true })
    .click()
  await expect(
    reloadedFirst.getByRole('region', { name: /A: interpret request/ })
  ).toBeVisible()
  await expect(
    reloadedFirst.getByRole('region', { name: /A: interpret response/ })
  ).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath('journeys-desktop.png'),
    fullPage: false
  })
  await page.reload()
  await expect(page.getByRole('region', { name: 'Run summary' })).toContainText(
    'First eligible after answer 1'
  )
  expect(inference).toBe(0)
  expect(errors).toEqual([])
  const bad = await request.post('/api/user-journeys', {
    headers: { Origin: baseURL! },
    data: { personaId: 'control-alarmist', live: true }
  })
  expect(bad.status()).toBe(400)
  const foreign = await request.post('/api/user-journeys', {
    headers: { Origin: 'https://example.com' },
    data: {}
  })
  expect(foreign.status()).toBe(403)
})

test('mobile uncertainty and paperclip paths stay inspectable with page scrolling', async ({
  page
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/user-journeys')
  await page.getByLabel('View run').selectOption('baseline')
  await page.getByRole('button', { name: /Worried novice/ }).click()
  await expect(page.getByRole('region', { name: 'Run summary' })).toContainText(
    '5 accepted answers'
  )
  await expect(
    page.getByRole('region', { name: 'Journey result' })
  ).toContainText('Result of this run')
  await page.getByRole('button', { name: /Open-ended uncertainty/ }).click()
  await expect(
    page.getByRole('region', { name: 'Journey result' })
  ).toContainText('Unplaced')
  await expect(
    page.getByRole('region', { name: 'Journey result' })
  ).toContainText('Point withheld')
  await page.getByRole('button', { name: /Playful recovery/ }).click()
  await expect(
    page.getByRole('region', { name: 'Journey timeline' })
  ).toContainText('Paperclips triggered')
  await expect(
    page
      .getByRole('region', { name: 'Journey timeline' })
      .locator('[data-slot=journey-step]')
  ).toHaveCount(9)
  const first = page.locator('[data-slot=journey-step]').first()
  await first.getByRole('button', { name: 'Requests and responses' }).click()
  await expect(first).toContainText('baseline keeps salient decisions only')
  const width = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth,
    viewport: innerWidth
  }))
  expect(width.page).toBeLessThanOrEqual(width.viewport + 1)
  await page.screenshot({
    path: testInfo.outputPath('journeys-mobile.png'),
    fullPage: false
  })
})
