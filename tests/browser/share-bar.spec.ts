import { expect, test, startAssessment, skipSelfPlacement } from './fixtures'

async function reachResult(page: import('@playwright/test').Page) {
  await startAssessment(page)
  // Fixture judgments place the map after one answer; this does not test live semantics.
  await page
    .getByLabel('Your answer', { exact: true })
    .fill('I expect useful tools and serious risks, depending on oversight.')
  await page.getByRole('button', { name: /^Continue/ }).click()
  await page.getByRole('button', { name: 'View my results' }).click()
  await skipSelfPlacement(page)
}

test('the result offers tagged share intents and publishing beside them', async ({
  page,
  context
}) => {
  await reachResult(page)
  const id = new URL(page.url()).pathname.split('/').at(-1)!
  const bar = page.getByRole('region', { name: 'Share your result' })
  await expect(bar).toBeVisible()
  await expect(bar).toContainText('Where do you land?')
  await expect(bar).toContainText('Your answers stay private')

  const x = new URL(
    (await bar.getByRole('link', { name: 'Post on X' }).getAttribute('href'))!
  )
  expect(x.origin + x.pathname).toBe('https://x.com/intent/post')
  expect(new URL(x.searchParams.get('url')!).searchParams.get('ref')).toBe(
    'share-x'
  )
  expect(x.searchParams.get('text')).toContain('Where do you land?')
  for (const name of ['Threads', 'Bluesky', 'LinkedIn'])
    await expect(bar.getByRole('link', { name })).toHaveAttribute(
      'target',
      '_blank'
    )

  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await bar.getByRole('button', { name: 'Copy link' }).click()
  const copied = new URL(
    await page.evaluate(() => navigator.clipboard.readText())
  )
  expect(copied.pathname).toBe('/')
  expect(copied.searchParams.get('ref')).toBe('share-copy-link')

  // Publishing moved from above the conversation into the share bar.
  await bar.getByRole('button', { name: 'Publish assessment' }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Publish assessment' })
    .click()
  await expect(bar).toContainText('Your answers and results are public')
  const published = new URL(
    (await bar.getByRole('link', { name: 'Post on X' }).getAttribute('href'))!
  ).searchParams.get('url')!
  expect(new URL(published).pathname).toBe(`/public/assessments/${id}`)

  // Visitors to the published page get a way in near the top.
  await page.goto(`/public/assessments/${id}`)
  await expect(
    page.getByRole('heading', { level: 1, name: 'A shared AI worldview' })
  ).toBeVisible()
  await expect(page.getByText('Where do you land?').first()).toBeVisible()
  await expect(
    page.getByRole('region', { name: 'Share your result' })
  ).toHaveCount(0)
})

test('simulated-user pages invite a comparison, pinned on phones', async ({
  page
}) => {
  await page.goto('/users/karpathy')
  const name = (await page.getByRole('heading', { level: 1 }).textContent())!
  await expect(
    page.getByText(`Where do you land vs ${name.trim()}?`, { exact: true })
  ).toBeVisible()
  const pinned = page
    .locator('.fixed')
    .filter({ hasText: 'Where do you land?' })
  await expect(pinned).toBeHidden()
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(pinned).toBeVisible()
  await expect(
    pinned.getByRole('link', { name: 'Map my worldview' })
  ).toHaveAttribute('href', '/assessments?start=1')
})
