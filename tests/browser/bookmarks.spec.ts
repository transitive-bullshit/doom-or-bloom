import { startAssessment, mockEvaluation } from './fixtures'
import { expect, test } from './fixtures'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

test('bookmarks are centered at 624px and fade only overflowing title and description lines', async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/users/noahpinion')
  const list = page.locator('[data-resource-layout="list"]')
  await expect(list).toHaveCSS('max-width', '624px')
  const desktop = await list.evaluate((element) => {
    const box = element.getBoundingClientRect()
    const parent = element.parentElement!.getBoundingClientRect()
    return {
      width: box.width,
      center: box.x + box.width / 2,
      parentCenter: parent.x + parent.width / 2
    }
  })
  expect(desktop.width).toBe(624)
  expect(Math.abs(desktop.center - desktop.parentCenter)).toBeLessThan(1)
  await page.setViewportSize({ width: 390, height: 844 })
  const text = list.locator('.fade-truncated-text')
  await expect(list.locator('[data-truncated="true"]').first()).toBeVisible()
  const measurements = await text.evaluateAll((elements) =>
    elements.map((element) => {
      const style = getComputedStyle(element)
      return {
        lines: Number(style.getPropertyValue('--fade-lines')),
        height: element.getBoundingClientRect().height,
        lineHeight: Number.parseFloat(style.lineHeight),
        truncated: element.getAttribute('data-truncated') === 'true',
        mask: style.maskImage,
        ellipsis: style.textOverflow
      }
    })
  )
  for (const item of measurements) {
    expect(item.height).toBeLessThanOrEqual(item.lines * item.lineHeight + 1)
    expect(item.ellipsis).not.toBe('ellipsis')
    expect(item.mask === 'none').toBe(!item.truncated)
  }
  const box = await list.boundingBox()
  expect(box!.width).toBeLessThan(390)
})

test('assessment bookmarks use the same two-line title and single three-line faded description', async ({
  page
}) => {
  const previews = JSON.parse(
    readFileSync('lib/sharing/resource-previews.json', 'utf8')
  ) as Record<string, { description?: string }>
  const [url, preview] = Object.entries(previews).find(
    ([, preview]) => (preview.description?.length ?? 0) > 300
  )!
  const title =
    'An intentionally long article title about artificial intelligence, human agency, institutions, scientific progress, and the decisions that will shape our future'
  await mockEvaluation(page, async (input) => {
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
    response.assessment.result.resources = [
      {
        id: 'resource.article',
        title,
        url,
        purpose: 'Test source',
        effort: 'Short read',
        question:
          'Which assumptions in this article would change your view of how AI affects our future?'
      }
    ]
    return response
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await startAssessment(page)
  await page
    .getByLabel('Your answer', { exact: true })
    .fill(
      'I expect useful tools and serious risks, with outcomes depending on oversight. Independent tests could change my view.'
    )
  await page.getByRole('button', { name: /^Continue/ }).click()
  const bookmark = page.locator('[data-resource-layout="list"] > a')
  await expect(bookmark).toHaveCount(1)
  await expect(bookmark.locator('p')).toHaveCount(1)
  await expect(bookmark.locator('p')).toHaveText(preview.description!)
  await expect(bookmark.locator('.fade-truncated-text')).toHaveCount(2)
  for (const [selector, lines] of [
    ['.fade-truncated-text[data-lines="2"]', 2],
    ['p span', 3]
  ] as const) {
    const text = bookmark.locator(selector)
    await expect(text).toHaveAttribute('data-truncated', 'true')
    const measured = await text.evaluate((element) => ({
      height: element.getBoundingClientRect().height,
      lineHeight: parseFloat(getComputedStyle(element).lineHeight),
      mask: getComputedStyle(element).maskImage,
      textOverflow: getComputedStyle(element).textOverflow
    }))
    expect(measured.height).toBeLessThanOrEqual(lines * measured.lineHeight + 1)
    expect(measured.mask).not.toBe('none')
    expect(measured.textOverflow).not.toBe('ellipsis')
  }
})
