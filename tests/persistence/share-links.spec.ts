import { Pool } from 'pg'
import { load } from 'cheerio'
import { test, expect, type Page } from '@playwright/test'

const canary = 'SHARE_LINK_ANSWER_CANARY'

async function reachResult(page: Page) {
  await page.goto('/assessment')
  await page
    .getByRole('link', { name: 'Map your own worldview', exact: true })
    .last()
    .click()
  await expect(page).toHaveURL(/\/assessments\/[a-f0-9-]+$/)
  // Fixture judgments place the map after one answer.
  await page
    .getByLabel('Your answer', { exact: true })
    .fill(`I expect useful tools and serious risks. ${canary}`)
  await page.getByRole('button', { name: /^Continue/ }).click()
  await page.getByRole('button', { name: 'View my results' }).click()
  await page.getByRole('button', { name: 'Skip', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Results', exact: true })
  ).toBeVisible()
  return new URL(page.url()).pathname.split('/').at(-1)!
}

test('share links: owner-only create, reuse and revoke; card only; deletion cascades', async ({
  page,
  browser,
  baseURL
}) => {
  const headers = { origin: baseURL! }
  const id = await reachResult(page)
  const api = `/api/assessments/${id}/share-link`
  const database = new Pool({ connectionString: process.env.TEST_DATABASE_URL })
  const stranger = await browser.newContext({ baseURL })
  const visitor = await browser.newContext({ baseURL })
  try {
    expect(await (await page.request.get(api)).json()).toEqual({
      link: null,
      active: 0
    })
    expect(
      (
        await page.request.post(api, { headers, data: { name: 'Alex2' } })
      ).status()
    ).toBe(400)

    const created = await page.request.post(api, {
      headers,
      data: { name: 'Alex', locale: 'es' }
    })
    expect(created.status()).toBe(201)
    const { link } = await created.json()
    expect(link.id).toMatch(/^[A-Za-z0-9_-]{16}$/)
    expect(link.name).toBe('Alex')
    // Repeating reuses the link for the same result.
    const reused = await page.request.post(api, { headers, data: {} })
    expect(reused.status()).toBe(200)
    expect((await reused.json()).link.id).toBe(link.id)
    expect(await (await page.request.get(api)).json()).toMatchObject({
      link: { id: link.id },
      active: 1
    })

    // Without a session the API is unauthorized; another owner sees nothing.
    expect((await stranger.request.get(api)).status()).toBe(401)
    expect(
      (
        await stranger.request.post('/api/auth/sign-in/anonymous', {
          headers,
          data: {}
        })
      ).ok()
    ).toBe(true)
    for (const response of [
      await stranger.request.get(api),
      await stranger.request.post(api, { headers, data: {} }),
      await stranger.request.delete(api, { headers })
    ])
      expect(response.status()).toBe(404)

    // The public page shows the card and nothing from the answers.
    const path = `/s/${link.id}`
    const html = await (await visitor.request.get(path)).text()
    expect(html).not.toContain(canary)
    expect(html).not.toContain(id)
    const $ = load(html)
    expect($('meta[name="robots"]').attr('content')).toBe('noindex, nofollow')
    expect($('h1').text()).toBe('Alex mapped their AI worldview')
    expect($('meta[property="og:image"]').attr('content')).toMatch(
      new RegExp(`/s/${link.id}/social-image\\.png\\?v=`)
    )
    expect($('a[href*="compare="]').first().attr('href')).toBe(
      `/assessments?start=1&compare=${link.id}`
    )
    for (const image of [
      `${path}/social-image.png`,
      `/es${path}/social-image.png`
    ]) {
      const png = await visitor.request.get(image)
      expect(png.status()).toBe(200)
      expect(png.headers()['content-type']).toBe('image/png')
      const bytes = await png.body()
      expect(bytes.readUInt32BE(16)).toBe(1200)
      expect(bytes.readUInt32BE(20)).toBe(630)
    }
    // Comparison data: values and the card's facts, no answers or IDs.
    const data = await visitor.request.get(`/api/share-links/${link.id}`)
    expect(data.headers()['cache-control']).toContain('no-store')
    const comparison = await data.json()
    expect(Object.keys(comparison).toSorted()).toEqual([
      'closestPersonaIds',
      'kind',
      'map',
      'name',
      'pdoom',
      'values'
    ])
    expect(JSON.stringify(comparison)).not.toContain(canary)
    expect(JSON.stringify(comparison)).not.toContain(id)

    // Stopping revokes the page, card and comparison data.
    const revoked = await page.request.delete(api, { headers })
    expect(await revoked.json()).toEqual({ revoked: 1 })
    for (const url of [
      path,
      `${path}/social-image.png`,
      `/api/share-links/${link.id}`
    ])
      expect((await visitor.request.get(url)).status()).toBe(404)
    expect(await (await page.request.get(api)).json()).toEqual({
      link: null,
      active: 0
    })

    // A new share makes a new link; deleting the assessment removes all links.
    const again = await (
      await page.request.post(api, { headers, data: {} })
    ).json()
    expect(again.link.id).not.toBe(link.id)
    expect(again.link.name).toBeNull()
    expect((await visitor.request.get(`/s/${again.link.id}`)).status()).toBe(
      200
    )
    expect(
      (
        await page.request.delete(`/api/assessments/${id}`, { headers })
      ).status()
    ).toBe(204)
    expect((await visitor.request.get(`/s/${again.link.id}`)).status()).toBe(
      404
    )
    const { rows } = await database.query(
      'SELECT count(*)::int AS links FROM share_snapshots WHERE assessment_id = $1',
      [id]
    )
    expect(rows[0].links).toBe(0)
  } finally {
    await page.request.delete(`/api/assessments/${id}`, { headers })
    await stranger.close()
    await visitor.close()
    await database.end()
  }
})
