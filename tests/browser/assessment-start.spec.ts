import { expect, test } from '@playwright/test'

test('starting an assessment keeps the library layout stable and reports status in toasts', async ({
  page
}) => {
  let release!: () => void
  const pending = new Promise<void>((resolve) => {
    release = resolve
  })
  let fail = true
  await page.route('**/api/assessments', async (route) => {
    if (route.request().method() !== 'POST' || !fail) return route.continue()
    await pending
    await route.fulfill({ status: 503, json: { error: 'Unavailable' } })
  })
  await page.goto('/assessments')
  const empty = page.getByText(
    'No assessments yet. Start whenever you’re ready.'
  )
  await expect(empty).toBeVisible()
  const before = await empty.boundingBox()
  await page.getByRole('button', { name: 'Create a new assessment' }).click()
  try {
    await expect(page.getByText('Opening your assessment…')).toBeVisible()
    expect((await empty.boundingBox())?.y).toBe(before?.y)
    await expect(
      page
        .locator('[data-sonner-toast]')
        .filter({ hasText: 'Opening your assessment…' })
    ).toBeVisible()
  } finally {
    release()
  }
  await expect(
    page.locator('[data-sonner-toast]').filter({
      hasText: 'We couldn’t open your assessment. Please try again.'
    })
  ).toBeVisible()
  expect((await empty.boundingBox())?.y).toBe(before?.y)
  fail = false
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page).toHaveURL(/\/assessments\/[^/?]+$/)
  await expect(page.getByText('Opening your assessment…')).toBeHidden()
})
