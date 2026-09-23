import { test, expect, seedAssessment } from './fixtures'
import { createAssessment } from '../../lib/assessment/state'

test('New assessment preserves the library entry reached from the homepage', async ({
  page
}) => {
  await seedAssessment(page, createAssessment('history-seed', 'fixture-v1'))
  await page.goto('/')
  await page
    .getByRole('link', { name: 'Map your own worldview', exact: true })
    .first()
    .click()
  await expect(page).toHaveURL(/\/assessments$/)
  const create = page.getByRole('button', {
    name: 'Create a new assessment',
    exact: true
  })
  await create.click()
  await expect(page).toHaveURL(/\/assessments\/[a-f0-9-]+$/)
  const draftUrl = page.url()
  await page.goBack()
  await expect(page).toHaveURL(/\/assessments$/)
  await expect(create).toBeEnabled()
  await page.goForward()
  await expect(page).toHaveURL(draftUrl)
  await expect(
    page.getByRole('textbox', { name: 'Your answer' })
  ).toBeEditable()
  await page.goBack()
  await expect(create).toBeEnabled()
  await create.click()
  await expect(page).toHaveURL(/\/assessments\/[a-f0-9-]+$/)
  await expect(page).not.toHaveURL(draftUrl)
  await page.goBack()
  await expect(page).toHaveURL(/\/assessments$/)
  await expect(create).toBeEnabled()
  await page.goBack()
  await expect(page).toHaveURL(/\/$/)
})
