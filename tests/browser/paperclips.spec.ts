import { expect, test } from '@playwright/test'

// Uses actual application control flow with exact local phrases, never paid inference.
test('test replies reliably trigger paperclips and an explicit request works once per assessment', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const answer = page.getByLabel('Your answer', { exact: true })
  const submit = async (text: string) => {
    await answer.fill(text)
    await page.getByRole('button', { name: /^Continue/ }).click()
  }
  await submit('test')
  await expect(page.getByText('Another try?', { exact: true })).toBeVisible()
  await submit('test again')
  await expect(
    page.getByText('We’ve made some paperclips.', { exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Dismiss paperclips', exact: true })
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Dismiss paperclips', exact: true })
    .click()
  await page.reload()
  await expect(
    page.getByRole('button', { name: 'Dismiss paperclips', exact: true })
  ).toHaveCount(0)
  await page.getByRole('button', { name: 'Try again', exact: true }).click()
  await submit('show me paperclips')
  await expect(
    page.getByText('Let’s pause here', { exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Try again', exact: true })
  ).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Dismiss paperclips', exact: true })
  ).toHaveCount(0)
  await page.getByRole('button', { name: 'Restart', exact: true }).click()
  await page
    .getByRole('button', { name: 'Restart & clear', exact: true })
    .click()
  await submit('show me paperclips')
  await expect(
    page.getByRole('button', { name: 'Dismiss paperclips', exact: true })
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Jev / assessment debugging details' })
    .click()
  await expect(
    page.getByText('This operation made no inference requests.', {
      exact: true
    })
  ).toBeVisible()
})
