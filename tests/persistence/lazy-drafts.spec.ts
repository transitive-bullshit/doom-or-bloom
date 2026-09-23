import { Pool } from 'pg'
import { test, expect } from '@playwright/test'

test('unsubmitted drafts survive history and reload without database rows; first answer persists once', async ({
  page,
  context,
  baseURL
}) => {
  const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL })
  let id: string | undefined
  try {
    await page.goto('/assessments')
    await page
      .getByRole('button', { name: 'Create a new assessment', exact: true })
      .click()
    await expect(page).toHaveURL(/\/assessments\/[a-f0-9-]+$/)
    const url = page.url()
    id = url.split('/').at(-1)!
    const draftCookies = (await context.cookies()).filter((cookie) =>
      cookie.name.startsWith('assessment-draft')
    )
    expect(draftCookies).toHaveLength(2)
    expect(draftCookies.every((cookie) => cookie.value.length < 4000)).toBe(
      true
    )
    expect(
      (await pool.query('SELECT id FROM assessments WHERE id=$1', [id])).rows
    ).toHaveLength(0)
    expect(
      (
        await pool.query('SELECT id FROM used_assessment_drafts WHERE id=$1', [
          id
        ])
      ).rows
    ).toHaveLength(0)
    expect(await (await page.request.get('/api/assessments')).json()).toEqual(
      []
    )
    const answer = page.getByRole('textbox', { name: 'Your answer' })
    const text =
      'AI could improve medicine while requiring careful oversight of dangerous capabilities.'
    await answer.fill(text)
    await page.goBack()
    await expect(page).toHaveURL(/\/assessments$/)
    await expect(
      page.getByText('No assessments yet. Start whenever you’re ready.')
    ).toBeVisible()
    await page.goForward()
    await expect(page).toHaveURL(url)
    await expect(answer).toHaveValue(text)
    await page.reload()
    await expect(answer).toHaveValue(text)
    const stranger = await context.browser()!.newContext()
    try {
      await stranger.request.post(`${baseURL}/api/auth/sign-in/anonymous`, {
        headers: { origin: baseURL! },
        data: {}
      })
      // A copied draft ticket still cannot grant another session ownership.
      await stranger.addCookies(draftCookies)
      expect(
        (
          await stranger.request.get(`${baseURL}/api/assessments/${id}`)
        ).status()
      ).toBe(404)
    } finally {
      await stranger.close()
    }
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await expect
      .poll(
        async () =>
          (await (await page.request.get(`/api/assessments/${id}`)).json())
            .assessment.revision
      )
      .toBe(1)
    expect(
      (await (await page.request.get('/api/assessments')).json()).map(
        (item: { id: string }) => item.id
      )
    ).toEqual([id])
    expect(
      (await pool.query('SELECT id FROM assessments WHERE id=$1', [id])).rows
    ).toHaveLength(1)
    await page.request.delete(`/api/assessments/${id}`, {
      headers: { origin: baseURL! }
    })
    await context.addCookies(draftCookies)
    expect((await page.request.get(`/api/assessments/${id}`)).status()).toBe(
      404
    )
    expect(
      (await pool.query('SELECT id FROM assessments WHERE id=$1', [id])).rows
    ).toHaveLength(0)
  } finally {
    if (id)
      await page.request.delete(`/api/assessments/${id}`, {
        headers: { origin: baseURL! }
      })
    await pool.end()
  }
})
