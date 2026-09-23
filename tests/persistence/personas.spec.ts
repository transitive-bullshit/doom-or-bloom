import { test, expect } from '@playwright/test'
import { Pool } from 'pg'

test('curated persona routes use the selected database run without a visitor session', async ({
  page,
  request,
  context
}) => {
  const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL })
  try {
    const { rows } = await pool.query(
      'SELECT p.slug, p.name, p.selected_assessment_id AS id FROM personas p WHERE p.featured ORDER BY p.slug LIMIT 1'
    )
    const persona = rows[0]!
    expect(persona).toBeTruthy()
    await page.goto(`/users/${persona.slug}`)
    await expect(
      page.getByRole('heading', { name: new RegExp(persona.name) }).first()
    ).toBeVisible()
    expect(await context.cookies()).toHaveLength(0)
    const data = await request.get(`/public/assessments/${persona.id}/data`)
    expect(data.status()).toBe(200)
    const published = await data.json()
    expect(published.kind).toBe('simulation')
    expect(published.simulation.kind).toBe('historical_journey_v1')
    expect(published.simulation.journey.result).toBeTruthy()
    expect(published.simulation.journey.participantExchanges).toBeUndefined()
    await page.goto(`/public/assessments/${persona.id}`)
    await expect(
      page.getByRole('heading', { name: new RegExp(persona.name) }).first()
    ).toBeVisible()
    const image = await request.get(
      `/public/assessments/${persona.id}/social-image.webp`
    )
    expect(image.status()).toBe(200)
    expect(image.headers()['content-type']).toContain('image/webp')
    const sitemap = await request.get('/sitemap.xml')
    expect(await sitemap.text()).toContain(`/users/${persona.slug}`)
    expect(await sitemap.text()).not.toContain(
      `/public/assessments/${persona.id}`
    )
    const sitemapText = await sitemap.text()
    expect(sitemapText).not.toContain('/assessment</loc>')
    expect(sitemapText).not.toContain('/assessments/')
    expect(sitemapText).toContain('https://www.doom-or-bloom.com/about')
    expect(sitemapText).toContain('https://www.doom-or-bloom.com/privacy')
    const robots = await (await request.get('/robots.txt')).text()
    expect(robots).toContain('Disallow: /assessments/')
    expect(robots).toContain('Disallow: /api/')
    expect(robots).toContain(
      'Sitemap: https://www.doom-or-bloom.com/sitemap.xml'
    )
    expect(robots).not.toContain('Disallow: /public/\n')
    const llms = await (await request.get('/llms.txt')).text()
    expect(llms).toContain(`/users/${persona.slug}`)
    expect(llms).toContain('/public/assessments/<id>')
    expect(llms).toContain('immutable snapshots')
    expect(llms).toContain('optional X sign-in')
    expect(llms).not.toContain(
      'No account or hosted transcript database required'
    )
    await page.goto('/privacy')
    await expect(page).toHaveTitle('Privacy | Doom or Bloom')
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /stores assessments/
    )
    expect(await context.cookies()).toHaveLength(0)
  } finally {
    await pool.end()
  }
})
