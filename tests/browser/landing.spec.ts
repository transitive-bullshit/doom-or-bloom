import { expect, test } from '@playwright/test'

test('landing portraits use tooltips and link to results; assessment drafts survive a trip home', async ({
  page
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Where do you land?' })
  ).toBeVisible()
  const portrait = page.getByRole('link', {
    name: 'View Eliezer Yudkowsky results'
  })
  await expect(portrait).not.toHaveAttribute('title')
  await portrait.hover()
  await expect(page.getByRole('tooltip')).toHaveText('Eliezer Yudkowsky')
  await portrait.click()
  await expect(page).toHaveURL(/\/personas\/control-alarmist$/)
  await expect(page.locator('[data-slot=worldview-map]')).toHaveCount(1)
  await expect(
    page.getByText('Eliezer Yudkowsky’s estimated P(doom)', { exact: true })
  ).toBeVisible()
  await expect(
    page.getByText('What his outlook hinges on', { exact: true })
  ).toBeVisible()
  const marker = page.locator('[data-persona-marker="Eliezer Yudkowsky"]')
  await expect(marker.locator('image')).toHaveAttribute(
    'href',
    '/personas/yudkowsky.jpg'
  )
  await expect(page.getByText('Your view', { exact: true })).toHaveCount(0)
  const sources = page.getByRole('region', { name: 'Sources', exact: true })
  await expect(sources.getByRole('heading', { name: 'Sources' })).toBeVisible()
  await expect(sources.getByRole('link').first()).toHaveAttribute(
    'href',
    'https://time.com/6266923/ai-eliezer-yudkowsky-open-letter-not-enough/'
  )
  await expect(
    page.getByRole('region', { name: 'More details' })
  ).toContainText('Human influence')
  await page.getByRole('link', { name: 'Map your own worldview' }).click()
  await expect(page).toHaveURL(/\/assessment$/)
  const answer = page.getByLabel('Your answer', { exact: true })
  await answer.fill('A draft that should survive navigation.')
  await page.getByRole('link', { name: 'Doom or Bloom', exact: true }).click()
  await page.getByRole('link', { name: 'Answer the first question' }).click()
  await expect(answer).toHaveValue('A draft that should survive navigation.')
  await page.goBack()
  await expect(
    page.getByRole('heading', { name: 'Where do you land?' })
  ).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(390)
  await expect(
    page.getByRole('link', { name: 'Answer the first question' })
  ).toBeInViewport()
})

test('featured portraits stay square and inside their circular frames', async ({
  page
}) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const portraits = page.locator('.landing-map-point')
    await expect(portraits.first()).toBeVisible()
    await portraits.evaluateAll(async (elements) => {
      await Promise.all(
        elements.map((element) => element.querySelector('img')!.decode())
      )
    })
    const overflow = await portraits.evaluateAll((elements) =>
      elements.flatMap((element) => {
        const image = element.querySelector('img')!.getBoundingClientRect()
        const frame = element.getBoundingClientRect()
        return Math.abs(image.width - image.height) > 0.5 ||
          image.bottom > frame.bottom ||
          image.right > frame.right
          ? [
              {
                person: element.getAttribute('aria-label'),
                image: [image.width, image.height],
                frame: [frame.width, frame.height]
              }
            ]
          : []
      })
    )
    expect(overflow).toEqual([])
  }
})

test('persona framing uses her/their and exports the portrait in the map', async ({
  page
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/personas/human-centered-spatial-builder')
  await expect(
    page.getByText('What her outlook hinges on', { exact: true })
  ).toBeVisible()
  const map = page.locator('[data-slot=worldview-map]')
  await expect(map.locator('[data-persona-marker] image')).toHaveAttribute(
    'href',
    '/personas/li.jpg'
  )
  const downloading = page.waitForEvent('download')
  await map.getByRole('button', { name: 'Map image actions' }).click()
  await page.getByRole('menuitem', { name: 'Download PNG' }).click()
  await (await downloading).saveAs(testInfo.outputPath('persona-map.png'))
  await page.goto('/personas/alignment-maximalist')
  await expect(
    page.getByText('What their outlook hinges on', { exact: true })
  ).toBeVisible()
  expect(errors).toEqual([])
})
