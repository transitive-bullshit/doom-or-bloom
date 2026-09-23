import { startAssessment, mockEvaluation } from './fixtures'
import { unzipSync, strFromU8 } from 'fflate'
import { expect, test } from './fixtures'
import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'

test('every accepted answer has a collapsed historical result; debug-off runs still export a complete trace', async ({
  page
}, testInfo) => {
  await mockEvaluation(page, async (input) => {
    const response = JSON.parse(
      execFileSync(
        process.execPath,
        [
          '--conditions=react-server',
          '--import',
          'tsx',
          'tests/browser/diagnostic-engine.ts'
        ],
        { input: JSON.stringify(input), encoding: 'utf8' }
      )
    )
    return response
  })
  await startAssessment(page)
  await expect(
    page.getByRole('button', { name: /^Debug (on|off)$/ })
  ).toBeVisible()
  const debugOn = page.getByRole('button', { name: 'Debug on', exact: true })
  if (await debugOn.count()) await debugOn.click()
  await page
    .getByLabel('Your answer', { exact: true })
    .fill(
      'I expect useful AI tools, but powerful systems could cause serious harm if control fails. My view is conditional.'
    )
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect(
    page.getByRole('article', { name: 'Question 1 and replies' })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Results after this answer', exact: true })
  ).toHaveCount(0)
  await page.reload()
  await expect(
    page.getByRole('button', { name: 'Debug off', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Results after this answer', exact: true })
  ).toHaveCount(0)
  await page.getByRole('button', { name: 'Debug off', exact: true }).click()
  const first = page.getByRole('article', { name: 'Question 1 and replies' })
  const disclosure = first.getByRole('button', {
    name: 'Results after this answer',
    exact: true
  })
  await expect(disclosure).toHaveAttribute('aria-expanded', 'false')
  await disclosure.click()
  await expect(
    first.locator('[data-slot="worldview-map"]').first()
  ).toBeVisible()
  const expanded = first.locator('.result-breakout')
  const desktopSize = await expanded.boundingBox()
  expect(desktopSize!.width).toBeGreaterThan((await first.boundingBox())!.width)
  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(390)
  await page.setViewportSize({ width: 1280, height: 900 })
  await first.screenshot({ path: testInfo.outputPath('answer-result.png') })
  await page
    .getByLabel('Your answer', { exact: true })
    .fill(
      'I would change my view if more capable systems remained controllable in demanding independent tests over several years.'
    )
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect(
    page.getByRole('button', { name: 'Results after this answer', exact: true })
  ).toHaveCount(2)
  await page.reload()
  await expect(
    page.getByRole('button', { name: /^Debug (on|off)$/ })
  ).toBeVisible()
  if (
    await page.getByRole('button', { name: 'Debug off', exact: true }).count()
  )
    await page.getByRole('button', { name: 'Debug off', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Results after this answer', exact: true })
  ).toHaveCount(2)
  for (const button of await page
    .getByRole('button', { name: 'Results after this answer', exact: true })
    .all())
    await expect(button).toHaveAttribute('aria-expanded', 'false')
  await page
    .getByRole('button', { name: 'View my results', exact: true })
    .click()
  await page.getByRole('button', { name: 'Debug on', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Results after this answer', exact: true })
  ).toHaveCount(0)
  const downloading = page.waitForEvent('download')
  await page
    .getByRole('button', { name: 'Download full report', exact: true })
    .click()
  const downloaded = await downloading
  const files = unzipSync(await readFile((await downloaded.path())!))
  const data = JSON.parse(strFromU8(files['diagnostics.json']!))
  expect(data.reportVersion).toBe(2)
  expect(data.diagnosticTrace.completeness).toBe('complete')
  const operations = data.diagnosticTrace.operations
  expect(operations).toHaveLength(3)
  expect(operations[0].assessment.result.evidenceRevision).toBe(1)
  expect(operations[1].assessment.result.evidenceRevision).toBe(2)
  expect(
    operations[0].trace.stages.some(
      (s: { name: string }) => s.name === 'D: projection'
    )
  ).toBe(true)
  expect(
    operations[0].trace.decisions.some(
      (d: { action: string }) =>
        d.action === 'routing priorities and tie-break by ID'
    )
  ).toBe(true)
  expect(
    operations[1].trace.decisions.some(
      (d: { action: string }) => d.action === 'observed answer gain'
    )
  ).toBe(true)
})
