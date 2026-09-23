import { Pool } from 'pg'
import { readFile } from 'node:fs/promises'
import { unzipSync } from 'fflate'
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
      const savedItems = await (
        await page.request.get('/api/assessments')
      ).json()
      expect(
        savedItems.find((item: { id: string }) => item.id === id).title
      ).toBe(`Your AI worldview #${ids.length}`)
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
    const actions = table.getByRole('button', {
      name: 'Actions for Older assessment'
    })
    await actions.click()
    await expect(page.getByRole('menuitem').first()).toHaveText(
      'Publish assessment'
    )
    await page
      .getByRole('menuitem', {
        name: 'Publish assessment',
        exact: true
      })
      .click()
    await expect(page.getByRole('dialog')).toContainText(
      'Anyone with the link can view your answers and results.'
    )
    await page
      .getByRole('button', { name: 'Keep private', exact: true })
      .click()
    await expect(
      table.getByRole('link', { name: 'Published', exact: true })
    ).toHaveCount(0)
    await actions.click()
    await page
      .getByRole('menuitem', {
        name: 'Publish assessment',
        exact: true
      })
      .click()
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Publish assessment', exact: true })
      .click()
    await expect(
      table.getByRole('link', { name: 'Published', exact: true })
    ).toHaveAttribute('href', `/public/assessments/${ids[0]}`)
    await actions.click()
    await expect(
      page.getByRole('menuitem', {
        name: 'Publish assessment',
        exact: true
      })
    ).toHaveCount(0)
    await page
      .getByRole('menuitem', { name: 'Make private', exact: true })
      .click()
    await expect(
      table.getByRole('link', { name: 'Published', exact: true })
    ).toHaveCount(0)
    await actions.click()
    const pngDownload = page.waitForEvent('download')
    await page
      .getByRole('menuitem', { name: 'Download results image', exact: true })
      .click()
    const png = await readFile((await (await pngDownload).path())!)
    expect(png.subarray(1, 4).toString()).toBe('PNG')
    await expect(actions).toBeEnabled()
    await page.evaluate(() =>
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          write: async (items: ClipboardItem[]) => {
            const blob = await items[0]!.getType('image/png')
            document.documentElement.dataset.copiedImage = String(blob.size)
          }
        }
      })
    )
    await actions.click()
    await page
      .getByRole('menuitem', { name: 'Copy results image', exact: true })
      .click()
    await expect(
      page.getByText('Results image copied.', { exact: true })
    ).toBeVisible()
    expect(
      Number(
        await page.evaluate(() => document.documentElement.dataset.copiedImage)
      )
    ).toBeGreaterThan(1000)
    await actions.click()
    const reportDownload = page.waitForEvent('download')
    await page
      .getByRole('menuitem', { name: 'Download full report', exact: true })
      .click()
    const zip = unzipSync(
      await readFile((await (await reportDownload).path())!)
    )
    expect(Object.keys(zip).sort()).toEqual([
      'assessment.md',
      'diagnostics.json',
      'interview.md',
      'results.png',
      'worldview-map.png'
    ])
    expect(
      Buffer.from(zip['worldview-map.png']!.subarray(1, 4)).toString()
    ).toBe('PNG')
    await expect(actions).toBeEnabled()
    const other = await page.context().browser()!.newContext()
    try {
      expect(
        (
          await other.request.get(
            `${baseURL}/api/assessments/${ids[0]}/results-image`
          )
        ).status()
      ).toBe(401)
    } finally {
      await other.close()
    }
    await table
      .getByRole('button', { name: 'Actions for Newer assessment' })
      .click()
    await expect(
      page.getByRole('menuitem', {
        name: 'Publish assessment',
        exact: true
      })
    ).toHaveCount(0)
    await expect(
      page.getByRole('menuitem', {
        name: 'Download results image',
        exact: true
      })
    ).toHaveCount(0)
    await page.keyboard.press('Escape')
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
