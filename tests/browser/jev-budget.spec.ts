import { Pool } from 'pg'
import type { Page } from '@playwright/test'
import { expect, test, savedAssessment, startAssessment } from './fixtures'

// Forced budget states in the test database exercise the real server guard
// with fixture inference: no Jev or TypeSafe call is made.
const operationUrl = /\/api\/assessments\/[a-f0-9-]+$/
const reply = 'AI could cure diseases, but I worry about who controls it.'
const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL })
const clearBudget = () =>
  pool.query('DELETE FROM jev_spend; DELETE FROM jev_provider_status')
test.afterEach(clearBudget)
test.afterAll(() => pool.end())
test.beforeAll(async ({ playwright }) => {
  // Compile the interview route first: when this file runs alone, the dev
  // server would otherwise compile it inside the first timed navigation.
  const request = await playwright.request.newContext({
    baseURL: test.info().project.use.baseURL,
    ignoreHTTPSErrors: true
  })
  await request.get('/assessments/00000000-0000-4000-8000-000000000000', {
    maxRedirects: 0,
    timeout: 60_000
  })
  await request.dispose()
})

async function expectNotice(page: Page, saved: boolean) {
  const notice = page.getByTestId('budget-notice')
  await expect(notice).toHaveCount(1)
  await expect(notice).toContainText('Doom or Bloom is taking a breather')
  await expect(notice).toContainText('free side project')
  await expect(notice).toContainText('check back in a few hours')
  await expect(
    notice.getByRole('link', { name: '@transitive_bs' })
  ).toHaveAttribute('href', 'https://x.com/transitive_bs')
  await expect(notice).toContainText(
    saved ? 'Everything you wrote is saved' : 'You can still write your answer'
  )
  // The generic failure copy never appears alongside it.
  await expect(page.getByText('This step did not finish')).toHaveCount(0)
}

async function submitBlocked(page: Page) {
  await page.getByLabel('Your answer', { exact: true }).fill(reply)
  const response = page.waitForResponse(
    (r) => operationUrl.test(r.url()) && r.request().method() === 'POST'
  )
  await page.getByRole('button', { name: /^Continue/ }).click()
  expect((await response).status()).toBe(503)
}

async function savedOperation(page: Page) {
  const id = new URL(page.url()).pathname.split('/').at(-1)
  const { rows } = await pool.query(
    `SELECT status, action, failure_category FROM assessment_operations
     WHERE assessment_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [id]
  )
  return rows[0]
}

async function retrySucceeds(page: Page) {
  await page.getByRole('button', { name: 'Retry saved submission' }).click()
  await expect.poll(async () => (await savedAssessment(page)).revision).toBe(1)
  await expect(page.getByTestId('budget-notice')).toHaveCount(0)
  expect((await savedAssessment(page)).answers[0]?.text).toBe(reply)
}

for (const { name, block, force } of [
  {
    name: 'our own spend budget is used up',
    block: 'budget_exhausted',
    // The month's estimated spend has reached the default $150 budget.
    force: () =>
      pool.query(
        `INSERT INTO jev_spend (period, period_start, cost_nano_usd)
         VALUES ('month', date_trunc('month', now() AT TIME ZONE 'UTC')::date, $1)`,
        [150e9]
      )
  },
  {
    name: 'TypeSafe has no credits',
    block: 'provider_out_of_credits',
    // A TypeSafe 402 moments ago started a provider hold.
    force: () =>
      pool.query(
        `INSERT INTO jev_provider_status (provider, out_of_credits_at)
         VALUES ('typesafe', now())`
      )
  }
])
  test(`when ${name}, starting explains it and a submitted answer is saved for retry`, async ({
    page
  }) => {
    await force()
    await startAssessment(page)
    await expectNotice(page, false)
    // The answer box stays usable: typing is kept and can be sent.
    await submitBlocked(page)
    await expectNotice(page, true)
    expect(await savedOperation(page)).toMatchObject({
      status: 'failed',
      failure_category: block,
      action: { type: 'answer', text: reply }
    })
    expect((await savedAssessment(page)).revision).toBe(0)
    await page.reload()
    await expectNotice(page, true)
    await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue(
      reply
    )
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.getByTestId('budget-notice')).toBeVisible()
    await clearBudget()
    await retrySucceeds(page)
  })

test('an answer sent before the budget ran out sees the notice only after it is blocked', async ({
  page
}) => {
  await startAssessment(page)
  await expect(page.getByTestId('budget-notice')).toHaveCount(0)
  await pool.query(
    `INSERT INTO jev_spend (period, period_start, cost_nano_usd)
     VALUES ('day', (now() AT TIME ZONE 'UTC')::date, $1)`,
    [50e9]
  )
  await submitBlocked(page)
  await expectNotice(page, true)
})
