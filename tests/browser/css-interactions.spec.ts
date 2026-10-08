import { expect, test, startAssessment } from './fixtures'
import { limits } from '../../lib/assessment/schema'
import { readFileSync } from 'node:fs'
import { suiteSchema, runIndex } from '../../lib/journeys/schema'

const recorded = suiteSchema.parse(
  JSON.parse(
    readFileSync('lib/journeys/__fixtures__/sample-journeys.json', 'utf8')
  )
)

test('landing map grows across narrow-tablet widths without a responsive cliff', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const widths = []
  for (const width of [390, 520, 521, 640, 768, 900, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    const chart = page.locator('.study-chart')
    await expect(chart).toBeVisible()
    widths.push((await chart.boundingBox())!.width)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
  }
  for (let i = 1; i < widths.length; i++)
    expect(widths[i]).toBeGreaterThanOrEqual(widths[i - 1]! - 1)
  expect(widths[2]! - widths[1]!).toBeLessThan(3)
})

test('two result excerpts fill the available tablet width and preserve their text', async ({
  page
}) => {
  await page.setViewportSize({ width: 768, height: 1000 })
  const suite = structuredClone(recorded)
  const journey = suite.journeys[0]!
  journey.result!.experiment!.hinges = journey.result!.experiment!.hinges.slice(
    0,
    2
  )
  await page.route('**/api/user-journeys?*', (route) =>
    route.fulfill({ json: { run: runIndex(suite), journey } })
  )
  await page.goto('/user-journeys')
  const hinges = page
    .getByRole('region', { name: 'Journey result', exact: true })
    .locator('[data-slot=card]')
    .filter({ hasText: /What .* outlook hinges on/ })
  const quotes = hinges.locator('blockquote')
  await expect(quotes).toHaveCount(2)
  const first = (await quotes.first().boundingBox())!
  const second = (await quotes.nth(1).boundingBox())!
  expect(first.width).toBeGreaterThan(280)
  expect(Math.abs(first.y - second.y)).toBeLessThan(1)
  expect(await quotes.first().innerText()).toContain(
    'aligned with human survival'
  )
  await page.setViewportSize({ width: 390, height: 1000 })
  expect((await quotes.nth(1).boundingBox())!.y).toBeGreaterThan(
    (await quotes.first().boundingBox())!.y
  )
})

test('directory selects leave room for the full text line at desktop and phone widths', async ({
  page
}) => {
  await page.goto('/users')
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const id of ['user-sort', 'user-sort-direction']) {
      const select = page.locator(`#${id}`)
      await expect(select).toBeVisible()
      const fits = await select.evaluate((element) => {
        const style = getComputedStyle(element)
        return (
          element.clientHeight -
            parseFloat(style.paddingBlockStart) -
            parseFloat(style.paddingBlockEnd) >=
          parseFloat(style.lineHeight)
        )
      })
      expect(fits).toBe(true)
    }
  }
})

test('touch controls stay comfortable without enlarging dense map dots', async ({
  browser,
  baseURL
}) => {
  const context = await browser.newContext({
    baseURL,
    ignoreHTTPSErrors: true,
    hasTouch: true,
    viewport: { width: 390, height: 1000 }
  })
  const page = await context.newPage()
  await page.goto('/users')
  const controls = [
    page.getByRole('radio', { name: /^Everyone/ }),
    page.getByPlaceholder('Search names or @handles'),
    page.locator('#user-sort'),
    page.locator('#user-sort-direction'),
    page.getByRole('button', { name: 'Show 48 more', exact: true })
  ]
  for (const control of controls) {
    await expect(control).toBeVisible()
    expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  }
  await expect(page.locator('#user-sort')).toHaveCSS('font-size', '16px')
  expect(
    (await page.locator('.study-marker').first().boundingBox())!.width
  ).toBeLessThan(24)
  await context.close()
})

test('long answers scroll inside the field and survive reload without a submission', async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 1000 })
  await startAssessment(page)
  const answer = page.getByRole('textbox', { name: 'Your answer', exact: true })
  const text =
    'AI could bring benefits and serious risks. My outlook depends on safeguards, institutions, and who shares in the gains.\n\n'.repeat(
      20
    )
  await answer.fill(text)
  await expect
    .poll(() =>
      answer.evaluate((element) => element.scrollHeight > element.clientHeight)
    )
    .toBe(true)
  expect((await answer.boundingBox())!.height).toBeLessThanOrEqual(300)
  await answer.press('Tab')
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true })
  ).toBeFocused()
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true })
  ).toBeInViewport()
  await page.reload()
  await expect(answer).toHaveValue(text)
})

test('directory list links are reached by Tab and shared outlines survive forced colors', async ({
  page
}) => {
  await page.goto('/users')
  await page.locator('#user-sort-direction').press('Tab')
  const firstPerson = page.locator('.study-legend a').first()
  await expect(firstPerson).toBeFocused()
  await expect(firstPerson).toHaveAccessibleName(/.+/)
  await expect(firstPerson).toHaveCSS('outline-style', 'solid')
  await expect(page.locator('.study-marker').first()).toHaveAttribute(
    'tabindex',
    '-1'
  )
  await page.emulateMedia({ forcedColors: 'active' })
  const filter = page.getByRole('radio', { name: /^Everyone/ })
  await filter.focus()
  await expect(filter).toHaveCSS('outline-style', 'solid')
  await expect(filter).toHaveCSS('outline-width', '2px')
})

test('shared buttons respond to a held press with reduced motion and ignore disabled presses', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/users')
  const button = page.getByRole('button', { name: 'Show 48 more', exact: true })
  await button.scrollIntoViewIfNeeded()
  const idle = await button.evaluate(
    (element) => getComputedStyle(element).backgroundColor
  )
  const bounds = (await button.boundingBox())!
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2
  )
  await page.mouse.down()
  await expect
    .poll(() =>
      button.evaluate((element) => getComputedStyle(element).backgroundColor)
    )
    .not.toBe(idle)
  await expect(button).toHaveCSS('scale', 'none')
  await page.mouse.move(0, 0)
  await page.mouse.up()
  await expect(
    page.getByRole('button', { name: 'Show 48 more', exact: true })
  ).toBeVisible()
  await startAssessment(page)
  await page
    .getByRole('textbox', { name: 'Your answer', exact: true })
    .fill('x'.repeat(limits.answerChars + 1))
  const disabled = page.getByRole('button', { name: 'Continue', exact: true })
  await expect(disabled).toBeDisabled()
  const background = await disabled.evaluate(
    (element) => getComputedStyle(element).backgroundColor
  )
  await disabled.scrollIntoViewIfNeeded()
  const disabledBounds = (await disabled.boundingBox())!
  await page.mouse.move(
    disabledBounds.x + disabledBounds.width / 2,
    disabledBounds.y + disabledBounds.height / 2
  )
  await page.mouse.down()
  await expect(disabled).toHaveCSS('background-color', background)
  await expect(disabled).toHaveCSS('scale', 'none')
  await page.mouse.up()
})
