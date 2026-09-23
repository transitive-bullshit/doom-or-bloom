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
  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'More details' })).toBeVisible()
  await page
    .getByRole('region', { name: 'More details' })
    .screenshot({ path: testInfo.outputPath('worldview-details.png') })
  const matches = page.getByRole('region', { name: 'Your closest worldviews' })
  await expect(matches.getByRole('link')).toHaveCount(3)
  await expect(matches.getByRole('img')).toHaveCount(3)
  const firstMatch = matches.getByRole('link').first()
  await expect(firstMatch).toHaveAttribute('href', /^\/users\//)
  await firstMatch.focus()
  await expect(firstMatch).toBeFocused()
  await matches.screenshot({
    path: testInfo.outputPath('closest-personas.png')
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(matches).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  await matches.screenshot({
    path: testInfo.outputPath('closest-personas-mobile.png')
  })
  const destination = await firstMatch.getAttribute('href')
  const personaPage = await page.context().newPage()
  await personaPage.goto(destination!)
  await expect(personaPage.getByRole('heading', { level: 1 })).toBeVisible()
  await personaPage.close()
  expect(operations).toEqual(['answer'])
  await page
    .getByRole('button', { name: 'Continue answering questions' })
    .click()
  await expect(page.getByLabel('Your answer', { exact: true })).toBeVisible()
  expect(operations).toEqual(['answer', 'continue'])
})
