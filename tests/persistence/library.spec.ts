import { Pool } from 'pg'
import { test, expect } from '@playwright/test'

test('library sorts by creation date and status and keeps management in row menus', async ({
  page,
  baseURL
}) => {
  const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL })
  const ids: string[] = []
  try {
    for (const title of ['Older assessment', 'Newer assessment']) {
      await page.goto('/assessments')
      await page
        .getByRole('button', { name: 'Create a new assessment' })
        .click()
      await expect(page).toHaveURL(/\/assessments\/[a-f0-9-]+$/)
      const id = page.url().split('/').at(-1)!
      ids.push(id)
      await page
        .getByRole('textbox', { name: 'Your answer' })
        .fill(
          'AI could improve medicine, but dangerous capabilities need careful oversight.'
        )
      await page.getByRole('button', { name: 'Continue', exact: true }).click()
      await expect
        .poll(
          async () =>
            (await (await page.request.get(`/api/assessments/${id}`)).json())
              .assessment.revision
        )
        .toBe(1)
      await pool.query(
        'UPDATE assessments SET title=$1, created_at=$2, updated_at=$3 WHERE id=$4',
        [
          title,
          title.startsWith('Older') ? '2026-01-01' : '2026-02-01',
          title.startsWith('Older') ? '2026-03-01' : '2026-02-01',
          id
        ]
      )
    }
    const projected = await page.request.post(`/api/assessments/${ids[0]}`, {
      headers: { origin: baseURL! },
      data: {
        assessmentId: ids[0],
        expectedRevision: 1,
        requestKey: crypto.randomUUID(),
        operation: { type: 'project' }
      }
    })
    expect(projected.ok()).toBe(true)
    await page.goto('/assessments')
    const table = page.getByRole('table', { name: 'My assessments' })
    const names = table.locator('tbody tr td:first-child')
    await expect(names).toHaveText(['Newer assessment', 'Older assessment'])
    const cellBox = await names.first().boundingBox()
    const linkBox = await names.first().getByRole('link').boundingBox()
    expect(linkBox!.width).toBeCloseTo(cellBox!.width, 0)
    // The collapsed table border occupies one pixel outside the link.
    expect(Math.abs(linkBox!.height - cellBox!.height)).toBeLessThanOrEqual(1)

    await expect(
      table.getByRole('columnheader', { name: 'Date created' })
    ).toHaveAttribute('aria-sort', 'descending')
    await table.getByRole('button', { name: 'Date created' }).click()
    await expect(names).toHaveText(['Older assessment', 'Newer assessment'])
    await table.getByRole('button', { name: 'Status', exact: true }).click()
    await expect(names).toHaveText(['Newer assessment', 'Older assessment'])
    await table.getByRole('button', { name: 'Status', exact: true }).click()
    await expect(names).toHaveText(['Older assessment', 'Newer assessment'])
    await expect(
      table.getByRole('button', { name: 'Delete', exact: true })
    ).toHaveCount(0)
    await table
      .getByRole('button', { name: 'Actions for Older assessment' })
      .click()
    await expect(
      page.getByRole('menuitem', { name: 'Make private' })
    ).toHaveCount(0)
    await page.getByRole('menuitem', { name: 'Delete', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: 'Keep it' }).click()
    await expect(names).toHaveCount(2)
    await table
      .getByRole('button', { name: 'Actions for Older assessment' })
      .click()
    await page.getByRole('menuitem', { name: 'Delete', exact: true }).click()
    await page
      .getByRole('button', { name: 'Delete assessment', exact: true })
      .click()
    await expect(names).toHaveText(['Newer assessment'])
    await table.getByRole('link', { name: 'Newer assessment' }).click()
    await expect(page).toHaveURL(new RegExp(`/assessments/${ids[1]}$`))
  } finally {
    for (const id of ids)
      await page.request.delete(`/api/assessments/${id}`, {
        headers: { origin: baseURL! }
      })
    await pool.end()
  }
})
