import { test as base, expect, type Page } from '@playwright/test'

export { expect }
export const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    await use(page)
    // Remove only records owned by this test's browser session.
    const response = await page.request.get(`${baseURL}/api/assessments`)
    if (!response.ok()) return
    const items = (await response.json()) as { id: string }[]
    for (const item of items)
      await page.request.delete(`${baseURL}/api/assessments/${item.id}`, {
        headers: { origin: baseURL! }
      })
  }
})

export async function startAssessment(page: Page) {
  await page.goto('/assessment')
  await page
    .getByRole('button', { name: 'Map your own worldview', exact: true })
    .click()
  await expect(page).toHaveURL(/\/assessments\/[a-f0-9-]+$/)
}

/** UI fixture seam: authorization reads and writes still use saved DB state. */
export async function mockEvaluation(
  page: Page,
  evaluate: (
    input: import('../../lib/assessment/schema').AssessmentRequest
  ) => Promise<import('../../lib/assessment/schema').AssessmentResponse>
) {
  await page.route(/\/api\/assessments\/[a-f0-9-]+$/, async (route) => {
    if (route.request().method() !== 'POST') return route.continue()
    const submission = route.request().postDataJSON()
    const read = await page.request.get(route.request().url())
    expect(read.ok()).toBe(true)
    const saved = await read.json()
    const response = await evaluate({
      assessment: saved.assessment,
      requestId: submission.requestKey,
      operation: submission.operation,
      debug: submission.debug
    })
    const { execFileSync } = await import('node:child_process')
    const json = JSON.parse(
      execFileSync(
        process.execPath,
        [
          '--conditions=react-server',
          '--import',
          'tsx',
          'tests/browser/persist-engine-response.ts'
        ],
        { input: JSON.stringify({ submission, response }), encoding: 'utf8' }
      )
    )
    await route.fulfill({ json })
  })
}

export async function seedAssessment(
  page: Page,
  assessment: import('../../lib/assessment/schema').Assessment
) {
  await page.goto('/assessment')
  const origin = new URL(page.url()).origin
  let session = await (await page.request.get('/api/auth/get-session')).json()
  if (!session?.user) {
    const response = await page.request.post('/api/auth/sign-in/anonymous', {
      headers: { origin },
      data: {}
    })
    expect(response.ok()).toBe(true)
    session = await response.json()
  }
  const { execFileSync } = await import('node:child_process')
  const { id } = JSON.parse(
    execFileSync(
      process.execPath,
      [
        '--conditions=react-server',
        '--import',
        'tsx',
        'tests/browser/seed-assessment.ts'
      ],
      {
        input: JSON.stringify({ ownerId: session.user.id, assessment }),
        encoding: 'utf8'
      }
    )
  ) as { id: string }
  if (assessment.draft)
    await page.evaluate(
      ({ id, promptId, text }) => {
        localStorage.setItem(
          `doom-or-bloom:draft:${id}`,
          JSON.stringify({ promptId, text })
        )
      },
      { id, promptId: assessment.prompts.at(-1)!.id, text: assessment.draft }
    )
  await page.goto(`/assessments/${id}`)
  return id
}

export async function savedAssessment(page: Page) {
  const id = new URL(page.url()).pathname.split('/').at(-1)!
  const response = await page.request.get(`/api/assessments/${id}`)
  expect(response.ok()).toBe(true)
  return (await response.json())
    .assessment as import('../../lib/assessment/schema').Assessment
}
