import { test, expect } from '@playwright/test'

test('first CTA creates directly, draft survives reload, answer is server-saved, returning CTA opens library', async ({
  page,
  context,
  baseURL
}) => {
  await page.goto('/')
  expect(await context.cookies()).toHaveLength(0)
  await page
    .getByRole('button', { name: 'Map your own worldview' })
    .first()
    .click()
  await expect(page).toHaveURL(/\/assessment\/[a-f0-9-]+$/)
  const url = page.url()
  const id = url.split('/').at(-1)!
  try {
    const answer = page.getByRole('textbox', { name: 'Your answer' })
    await answer.fill(
      'AI could improve medicine while requiring careful oversight of dangerous capabilities.'
    )
    await page.reload()
    await expect(answer).toHaveValue(
      'AI could improve medicine while requiring careful oversight of dangerous capabilities.'
    )
    await page.screenshot({
      path: '/tmp/persistence-interview.png',
      fullPage: true,
      animations: 'disabled'
    })
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await expect
      .poll(
        async () =>
          (await (await page.request.get(`/api/assessments/${id}`)).json())
            .assessment.revision
      )
      .toBe(1)
    await page.reload()
    const state = await (
      await page.request.get(`/api/assessments/${id}`)
    ).json()
    expect(state.assessment.answers).toHaveLength(1)
    await expect(
      page.getByText(state.assessment.answers[0].text, { exact: true }).first()
    ).toBeVisible()
    await page.goto('/')
    await page
      .getByRole('button', { name: 'Map your own worldview' })
      .first()
      .click()
    await expect(page).toHaveURL(/\/assessments$/)
    await expect(
      page.getByRole('link', { name: 'Resume', exact: true })
    ).toHaveCount(1)
    const other = await context.browser()!.newContext()
    try {
      const response = await other.request.get(
        `${baseURL}/api/assessments/${id}`
      )
      expect(response.status()).toBe(401)
    } finally {
      await other.close()
    }
  } finally {
    await page.request.delete(`/api/assessments/${id}`, {
      headers: { origin: baseURL! }
    })
  }
})

test('lost successful response resolves with the original request key after refresh', async ({
  page,
  baseURL
}) => {
  await page.goto('/assessment')
  await page.getByRole('button', { name: 'Map your own worldview' }).click()
  await expect(page).toHaveURL(/\/assessment\/[a-f0-9-]+$/)
  const id = page.url().split('/').at(-1)!
  try {
    await page.route(`**/api/assessments/${id}`, async (route) => {
      if (route.request().method() !== 'POST') return route.continue()
      await route.fetch()
      await route.abort()
    })
    await page
      .getByRole('textbox', { name: 'Your answer' })
      .fill(
        'AI has promising economic benefits, though uncertainty about control makes me cautious.'
      )
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await expect(
      page.getByRole('button', { name: 'Check submission' })
    ).toBeVisible()
    await page.unroute(`**/api/assessments/${id}`)
    await page.reload()
    await expect
      .poll(
        async () =>
          (await (await page.request.get(`/api/assessments/${id}`)).json())
            .assessment.revision
      )
      .toBe(1)
    await expect(
      page.getByRole('button', { name: 'Check submission' })
    ).toHaveCount(0)
    const saved = await (
      await page.request.get(`/api/assessments/${id}`)
    ).json()
    expect(saved.assessment.answers).toHaveLength(1)
  } finally {
    await page.request.delete(`/api/assessments/${id}`, {
      headers: { origin: baseURL! }
    })
  }
})
