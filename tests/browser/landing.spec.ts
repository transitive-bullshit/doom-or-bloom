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
  const sources = page.getByRole('region', { name: 'Sources', exact: true })
  await expect(sources.getByRole('heading', { name: 'Sources' })).toBeVisible()
  await expect(sources.getByRole('link').first()).toHaveAttribute(
    'href',
    'https://time.com/6266923/ai-eliezer-yudkowsky-open-letter-not-enough/'
  )
  await expect(
    page.getByRole('region', { name: 'More of your worldview' })
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
