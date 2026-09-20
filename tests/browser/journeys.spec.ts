import { expect, test } from '@playwright/test'
import { createAssessment } from '../../lib/assessment/state'

test('latest live personas expose results and decisions without rerun controls', async ({
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
  await expect(page.getByLabel('Rerun mode')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Rerun/ })).toHaveCount(0)
  await expect(
    page.getByText(
      'Fictional stress-test personas, loosely grounded in public positions'
    )
  ).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Live journeys and mechanical tests' })
  ).toHaveCount(0)
  const liveSteps = page.locator('[data-slot=journey-step]')
  await expect(liveSteps.first()).toBeVisible()
  const results = liveSteps.getByRole('button', {
    name: 'Result after this answer',
    exact: true
  })
  await expect(results).toHaveCount(await liveSteps.count())
  await expect(results.first()).toHaveAttribute('aria-expanded', 'false')
  const positions = await liveSteps.first().evaluate((step) => {
    const buttons = Array.from(step.querySelectorAll('button'))
    const result = buttons.find(
      (button) => button.textContent?.trim() === 'Result after this answer'
    )!
    const decisions = buttons.find(
      (button) => button.textContent?.trim() === 'Decision details'
    )!
    const readiness = step.querySelector('[role=meter]')!
    return {
      afterReadiness: Boolean(
        result.compareDocumentPosition(readiness) &
        Node.DOCUMENT_POSITION_PRECEDING
      ),
      beforeDecisions: Boolean(
        result.compareDocumentPosition(decisions) &
        Node.DOCUMENT_POSITION_FOLLOWING
      )
    }
  })
  expect(positions).toEqual({ afterReadiness: true, beforeDecisions: true })
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'User Journeys'
  )
  await expect(page.getByRole('region', { name: 'Run summary' })).toContainText(
    /First eligible after answer [1-5]/
  )
  await expect(
    page
      .getByRole('region', { name: 'Journey timeline' })
      .locator('[data-slot=journey-step]')
  ).not.toHaveCount(0)
  const first = page.locator('[data-slot=journey-step]').first()
  await expect(first).toContainText(
    'What do you think AI means for our future—and why?'
  )
  const fullAnswer = first.getByRole('button', { name: 'Read full answer' })
  if (await fullAnswer.count()) await fullAnswer.click()
  await first
    .getByRole('button', { name: 'Decision details', exact: true })
    .click()
  await expect(first.getByRole('table')).toBeVisible()
  await expect(page.getByLabel('View run')).toHaveCount(0)
  await expect(page.getByLabel('Compare with')).toHaveCount(0)

  await first
    .getByRole('button', { name: 'Result after this answer', exact: true })
    .click()
  await expect(
    first.getByRole('region', { name: 'Step 1 result', exact: true })
  ).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath('journeys-desktop.png'),
    fullPage: false
  })
  await page.reload()
  await expect(page.getByRole('region', { name: 'Run summary' })).toContainText(
    /First eligible after answer [1-5]/
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
  await page.getByRole('button', { name: /Worried novice/ }).click()
  await expect(page.getByRole('region', { name: 'Run summary' })).toContainText(
    /[1-5] accepted answers/
  )
  await expect(
    page.getByRole('region', { name: 'Journey result' })
  ).toContainText('Result of this run')
  await page.getByRole('button', { name: /Open-ended uncertainty/ }).click()
  const uncertainFirst = page.locator('[data-slot=journey-step]').first()
  await uncertainFirst
    .getByRole('button', { name: 'Result after this answer', exact: true })
    .click()
  await expect(uncertainFirst).toContainText('mixed, conditional or undecided')
  await page.getByRole('button', { name: /Playful recovery/ }).click()
  await expect(
    page.getByRole('region', { name: 'Journey timeline' })
  ).toContainText('Paperclips triggered')
  await expect(
    page
      .getByRole('region', { name: 'Journey timeline' })
      .locator('[data-slot=journey-step]')
  ).not.toHaveCount(2)
  const first = page.locator('[data-slot=journey-step]').first()
  await first
    .getByRole('button', { name: 'Result after this answer', exact: true })
    .click()
  await expect(
    first.getByRole('region', {
      name: 'Step 1 projection input state',
      exact: true
    })
  ).toBeVisible()
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

test('failed operation diagnostics remain readable on mobile', async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.route('**/api/user-journeys?*', async (route) => {
    const response = await route.fetch()
    const payload = await response.json()
    payload.run.mode = 'live'
    delete payload.journey.personaSnapshot
    payload.journey.error = 'Jev: provider or transport failure (HTTP 401).'
    payload.journey.failureStage = 'interpret'
    payload.journey.failedOperation = {
      requestId: 'failed-request',
      assessment: createAssessment('failed-assessment', 'jev-1.13.0'),
      operation: { type: 'answer', text: 'Keep my exact answer.' },
      completedStages: [],
      stage: 'interpret',
      elapsedMs: 17,
      error: payload.journey.error,
      attempts: 1,
      requests: [
        {
          attempt: 1,
          model: 'jev-1.13.0',
          questionIds: ['disposition'],
          elapsedMs: 17,
          status: 401
        }
      ]
    }
    await route.fulfill({ response, json: payload })
  })
  await page.goto('/user-journeys')
  await page
    .getByRole('button', { name: 'Failed operation diagnostics', exact: true })
    .click()
  await expect(
    page.getByRole('region', { name: 'Pending operation', exact: true })
  ).toContainText('Keep my exact answer.')
  await expect(
    page.getByRole('region', { name: 'Failed stage diagnostics', exact: true })
  ).toContainText('401')
  const width = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth,
    viewport: innerWidth
  }))
  expect(width.page).toBeLessThanOrEqual(width.viewport + 1)
  await page.unrouteAll({ behavior: 'wait' })
})

test('the real-user fixed regression is selectable and exposes all four original answers', async ({
  page
}) => {
  await page.goto('/user-journeys')
  await page.getByRole('button', { name: /Real user · fixed answers/ }).click()
  await expect(page.getByRole('region', { name: 'Run summary' })).toContainText(
    '4 accepted answers'
  )
  await expect(page.locator('[data-slot=journey-step]')).toHaveCount(4)
  await expect(
    page.getByRole('button', { name: 'Result after this answer', exact: true })
  ).toHaveCount(4)
  await page
    .locator('[data-slot=journey-step]')
    .first()
    .getByRole('button', { name: 'Result after this answer', exact: true })
    .click()
  await expect(
    page
      .locator('[data-slot=journey-step]')
      .first()
      .locator('[data-slot=worldview-map]')
  ).toBeVisible()
})
