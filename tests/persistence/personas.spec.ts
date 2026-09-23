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
    const data = await request.get(`/assessments/public/${persona.id}/data`)
    expect(data.status()).toBe(200)
    const published = await data.json()
    expect(published.kind).toBe('simulation')
    expect(published.simulation.kind).toBe('historical_journey_v1')
    expect(published.simulation.journey.result).toBeTruthy()
    expect(published.simulation.journey.participantExchanges).toBeUndefined()
    await page.goto(`/assessments/public/${persona.id}`)
    await expect(
      page.getByRole('heading', { name: new RegExp(persona.name) }).first()
    ).toBeVisible()
    const image = await request.get(
      `/assessments/public/${persona.id}/social-image.webp`
    )
    expect(image.status()).toBe(200)
    expect(image.headers()['content-type']).toContain('image/webp')
    const sitemap = await request.get('/sitemap.xml')
    expect(await sitemap.text()).toContain(`/users/${persona.slug}`)
    expect(await sitemap.text()).not.toContain('/assessments/public/')
    expect(await context.cookies()).toHaveLength(0)
  } finally {
    await pool.end()
  }
})
