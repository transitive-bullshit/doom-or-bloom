import { Pool } from 'pg'
import { test, expect, startAssessment } from './fixtures'

test('local admin filters real saved states and previews private results without impersonation or writes', async ({
  page,
  baseURL,
  browser
}) => {
  const database = process.env.TEST_DATABASE_URL!
  expect(new URL(database).pathname).toMatch(/_test$/)
  const pool = new Pool({ connectionString: database })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  try {
    await startAssessment(page)
    const id = page.url().split('/').at(-1)!
    const answer =
      'AI could improve medicine, but dangerous capabilities need careful oversight.'
    await page.getByRole('textbox', { name: 'Your answer' }).fill(answer)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await expect
      .poll(
        async () =>
          (await (await page.request.get(`/api/assessments/${id}`)).json())
            .assessment.revision
      )
      .toBe(1)
    const response = await page.request.post(`/api/assessments/${id}`, {
      headers: { origin: baseURL! },
      data: {
        assessmentId: id,
        expectedRevision: 1,
        requestKey: crypto.randomUUID(),
        operation: { type: 'project' }
      }
    })
    expect(response.ok()).toBe(true)
    const saved = await (
      await page.request.get(`/api/assessments/${id}`)
    ).json()
    expect(saved.assessment.result).not.toBeNull()
    const owner = (
      await (await page.request.get('/api/auth/get-session')).json()
    ).user.id as string
    const before = (
      await pool.query(
        'select revision, current_snapshot_id, updated_at from assessments where id=$1',
        [id]
      )
    ).rows
    // No owner cookies in this inspector; admin reads do not impersonate.
    const inspector = await browser.newContext({
      baseURL,
      locale: 'en-GB',
      timezoneId: 'Asia/Bangkok'
    })
    const admin = await inspector.newPage()
    const mutations: string[] = []
    admin.on('request', (request) => {
      if (
        request.url().includes('/api/assessments') &&
        request.method() !== 'GET'
      )
        mutations.push(request.method())
    })
    admin.on('pageerror', (error) => errors.push(error.message))
    try {
      const loaded = await admin.goto(`/admin?q=${id}`)
      // Next development rendering overrides configured no-store headers.
      expect(loaded!.headers()['cache-control']).toBe(
        'no-cache, must-revalidate'
      )
      await expect(
        admin.getByRole('heading', { name: 'Overview', exact: true })
      ).toBeVisible()
      await expect(
        admin
          .locator('[data-slot=card]')
          .filter({ hasText: 'Assessments started' })
      ).toContainText('1')
      await expect(
        admin.getByText('Completed', { exact: true }).first()
      ).toBeVisible()
      await expect(
        admin.getByRole('columnheader', { name: 'Updated · Asia/Bangkok' })
      ).toBeVisible()
      await expect(admin.locator('tbody time').first()).toHaveText(
        new Intl.DateTimeFormat('en-GB', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'Asia/Bangkok'
        }).format(before[0].updated_at)
      )
      await admin.screenshot({ path: '/tmp/admin-desktop.png', fullPage: true })
      await admin.goto(`/admin/assessments?q=${id}&state=completed`)
      await expect(admin.locator('tbody tr')).toHaveCount(1)
      await admin
        .getByRole('link', { name: 'Your AI worldview #1', exact: true })
        .click()
      await expect(admin.locator('[data-slot=worldview-map]')).toBeVisible()
      await admin
        .getByText('Assessment metadata & recent operations', { exact: true })
        .click()
      await expect(
        admin.getByRole('columnheader', { name: 'Time · Asia/Bangkok' })
      ).toBeVisible()
      await admin.getByRole('tab', { name: 'Questions & answers' }).click()
      await expect(admin.getByText(answer, { exact: true })).toBeVisible()
      await expect(
        admin.getByRole('textbox', { name: 'Your answer' })
      ).toHaveCount(0)
      await admin.getByRole('tab', { name: 'Results', exact: true }).click()
      await admin.screenshot({ path: '/tmp/admin-result.png', fullPage: true })
      await admin.goto(`/admin/users?q=${id}`)
      await expect(
        admin.getByRole('columnheader', {
          name: 'Last activity · Asia/Bangkok'
        })
      ).toBeVisible()
      await admin.goto(`/admin/users/${owner}`)
      await admin.getByRole('tab', { name: 'Participant library' }).click()
      await expect(
        admin.getByRole('table', { name: 'My assessments' })
      ).toBeVisible()
      await expect(
        admin.getByRole('columnheader', {
          name: /Date created · Asia\/Bangkok/
        })
      ).toBeVisible()
      await expect(
        admin.getByRole('button', { name: /^Actions for/ })
      ).toHaveCount(0)
      await expect(
        admin.getByRole('table').getByRole('link').first()
      ).toHaveAttribute('href', `/admin/assessments/${id}`)
      await admin.goto(`/admin/assessments?q=${id}&state=active`)
      await expect(admin.getByText('No matching records')).toBeVisible()
      await pool.query(
        "update assessments set created_at=now() - interval '8 days' where id=$1",
        [id]
      )
      await admin.goto(`/admin/assessments?q=${id}&range=7d`)
      await expect(admin.getByText('No matching records')).toBeVisible()
      await admin.goto(`/admin/assessments?q=${id}&range=all`)
      await expect(admin.locator('tbody tr')).toHaveCount(1)
      await admin.setViewportSize({ width: 390, height: 844 })
      await admin.screenshot({ path: '/tmp/admin-mobile.png', fullPage: true })
      expect(
        await admin.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      ).toBe(true)
      await admin.getByRole('button', { name: 'Toggle Sidebar' }).click()
      await expect(admin.getByRole('dialog')).toBeVisible()
      await admin
        .getByRole('dialog')
        .getByRole('link', { name: 'Users', exact: true })
        .click()
      await expect(
        admin.getByRole('heading', { name: 'Users', exact: true })
      ).toBeVisible()
      await expect(admin.getByRole('dialog')).toHaveCount(0)
      expect(
        (await inspector.request.get(`/api/assessments/${id}`)).status()
      ).toBe(401)
      expect(
        (
          await inspector.request.get('/admin', {
            headers: { 'x-forwarded-host': 'evil.example' }
          })
        ).status()
      ).toBe(404)
      expect(
        (await inspector.request.get('/admin/assessments/not-a-uuid')).status()
      ).toBe(404)
      expect(mutations).toEqual([])
      expect(errors).toEqual([])
      expect(
        (
          await pool.query(
            'select revision, current_snapshot_id, updated_at from assessments where id=$1',
            [id]
          )
        ).rows
      ).toEqual(before)
    } finally {
      await inspector.close()
    }
  } finally {
    await pool.end()
  }
})
