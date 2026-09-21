import { expect, test } from '@playwright/test'
import { execFileSync } from 'node:child_process'

// The browser uses the real engine with explicit mocked judgments in a
// server-conditioned Node process. No live inference is made.
test('automatic first-answer results offer voluntary follow-ups and scoped detail cards', async ({
  page
}, testInfo) => {
  const operations: string[] = []
  await page.route('**/api/assessment', async (route) => {
    const input = route.request().postDataJSON()
    operations.push(input.operation.type)
    const response = JSON.parse(
      execFileSync(
        process.execPath,
        [
          '--conditions=react-server',
          '--import',
          'tsx',
          'tests/browser/early-engine.ts'
        ],
        { input: JSON.stringify(input), encoding: 'utf8' }
      )
    )
    await route.fulfill({ json: response })
  })
  await page.goto('/assessment')
  await page
    .getByLabel('Your answer', { exact: true })
    .fill(
      'I expect useful tools and serious risks, with outcomes depending on oversight. Research should continue, but deployment should require meaningful safeguards.'
    )
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect(
    page.getByRole('heading', { name: 'A map of your AI worldview' })
  ).toBeVisible()
  await expect(
    page.getByRole('region', { name: 'More of your worldview' })
  ).toBeVisible()
  await page
    .getByRole('region', { name: 'More of your worldview' })
    .screenshot({ path: testInfo.outputPath('worldview-details.png') })
  expect(operations).toEqual(['answer'])
  await page
    .getByRole('button', { name: 'Continue answering questions' })
    .click()
  await expect(page.getByLabel('Your answer', { exact: true })).toBeVisible()
  expect(operations).toEqual(['answer', 'continue'])
})
