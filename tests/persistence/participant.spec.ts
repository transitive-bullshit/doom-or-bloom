import { Pool } from 'pg'
import { test, expect } from '@playwright/test'

test('first CTA creates directly, draft survives reload, answer is server-saved, returning CTA opens library', async ({
  page,
  context,
  baseURL
}) => {
  await page.goto('/')
  expect(await context.cookies()).toHaveLength(0)
  await page
    .getByRole('link', { name: 'Map your own worldview' })
    .first()
    .click()
  await expect(page).toHaveURL(/\/assessments\/[a-f0-9-]+$/)
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
      .getByRole('link', { name: 'Map your own worldview' })
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
  await page.getByRole('link', { name: 'Map your own worldview' }).click()
  await expect(page).toHaveURL(/\/assessments\/[a-f0-9-]+$/)
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

test('publish, fork, and revoke preserve independent assessments and deny public images', async ({
  page,
  context,
  baseURL
}) => {
  await page.goto('/assessment')
  await page.getByRole('link', { name: 'Map your own worldview' }).click()
  await expect(page).toHaveURL(/\/assessments\/[a-f0-9-]+$/)
  const id = page.url().split('/').at(-1)!
  let forkId: string | undefined
  const visitor = await context.browser()!.newContext()
  const headers = { origin: baseURL! }
  try {
    await page
      .getByRole('textbox', { name: 'Your answer' })
      .fill(
        'AI could greatly improve medicine if governance keeps pace with increasingly powerful systems. ' +
          'I would look for independent evidence that benefits reach people broadly and that safety measures hold up as capabilities grow. '.repeat(
            4
          )
      )
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await expect
      .poll(
        async () =>
          (await (await page.request.get(`/api/assessments/${id}`)).json())
            .assessment.revision
      )
      .toBe(1)
    await expect(
      page.getByRole('button', {
        name: 'Publish assessment publicly',
        exact: true
      })
    ).toHaveCount(0)
    await expect(
      page.getByRole('button', { name: 'Done', exact: true })
    ).toHaveCount(0)
    const prematureShare = await page.request.patch(`/api/assessments/${id}`, {
      headers,
      data: { expectedRevision: 1, visibility: 'public' }
    })
    expect(prematureShare.status()).toBe(409)
    const projected = await page.request.post(`/api/assessments/${id}`, {
      headers,
      data: {
        assessmentId: id,
        expectedRevision: 1,
        requestKey: crypto.randomUUID(),
        operation: { type: 'project' }
      }
    })
    expect(projected.status()).toBe(200)
    const readyLibrary = await (
      await page.request.get('/api/assessments')
    ).json()
    expect(
      readyLibrary.find((item: { id: string }) => item.id === id)
    ).toMatchObject({ hasResults: true, visibility: 'private' })
    const beforeView = await (
      await page.request.get(`/api/assessments/${id}`)
    ).json()

    await page.reload()
    const ownerMatches = page
      .getByRole('region', { name: 'Your closest worldviews' })
      .getByRole('link', { name: /persona$/ })
    await expect(ownerMatches).toHaveCount(3)
    const ownerMatchLinks = await ownerMatches.evaluateAll((links) =>
      links.map((link) => link.getAttribute('href'))
    )
    expect(
      await (await page.request.get(`/api/assessments/${id}`)).json()
    ).toEqual(beforeView)
    await page
      .getByRole('button', { name: 'Publish assessment publicly', exact: true })
      .click()
    await expect(page.getByRole('dialog')).toContainText(
      'Anyone with the link can view your answers and results.'
    )
    await page
      .getByRole('button', { name: 'Publish assessment publicly', exact: true })
      .click()
    await expect(
      page.getByRole('link', { name: 'View public assessment' })
    ).toBeVisible()
    const publicURL = `${baseURL}/assessments/public/${id}`
    const html = await visitor.request.get(publicURL)
    expect(html.status()).toBe(200)
    // Next dev overrides HTML Cache-Control to no-cache, must-revalidate.
    // Production private/no-store headers are verified in build/start acceptance.
    expect(html.headers()['cache-control']).toMatch(/no-store|no-cache/)
    expect(await html.text()).toContain('AI could greatly improve medicine')
    expect(await html.text()).toContain('noindex')
    expect(await html.text()).toContain(
      `/assessments/public/${id}/social-image.webp`
    )
    const json = await (await visitor.request.get(`${publicURL}/data`)).json()
    expect(json.assessment.answers).toHaveLength(1)
    expect(json.ownerId).toBeUndefined()
    expect(json.assessment.draft).toBeUndefined()
    expect(json.operation).toBeUndefined()
    const image = await visitor.request.get(`${publicURL}/social-image.webp`)
    expect(image.status()).toBe(200)
    expect(image.headers()['content-type']).toContain('image/webp')
    expect(image.headers()['cache-control']).toContain('no-store')
    const bytes = await image.body()
    expect(bytes.toString('ascii', 0, 4)).toBe('RIFF')
    expect(bytes.toString('ascii', 8, 12)).toBe('WEBP')
    const sharp = (await import('sharp')).default
    const metadata = await sharp(bytes).metadata()
    expect([metadata.width, metadata.height]).toEqual([1200, 630])
    await sharp(bytes).toFile('/tmp/persistence-public-card.webp')
    expect(await visitor.cookies()).toHaveLength(0)
    const publicPage = await visitor.newPage()
    await publicPage.goto(publicURL)
    const publicMatches = publicPage
      .getByRole('region', { name: 'Your closest worldviews' })
      .getByRole('link', { name: /persona$/ })
    await expect(publicMatches).toHaveCount(3)
    expect(
      await publicMatches.evaluateAll((links) =>
        links.map((link) => link.getAttribute('href'))
      )
    ).toEqual(ownerMatchLinks)
    await expect(publicPage.getByRole('heading', { level: 1 })).toHaveCSS(
      'font-size',
      '30px'
    )
    await expect(
      publicPage.getByRole('heading', {
        name: 'Your AI worldview',
        exact: true
      })
    ).toBeVisible()
    await expect(
      publicPage.getByRole('heading', { name: 'Results', exact: true })
    ).toHaveCount(0)
    await expect(
      publicPage.getByRole('button', {
        name: /Download full report|Review the results/
      })
    ).toHaveCount(0)
    await expect(
      publicPage.getByText('Complete inferred assessment data')
    ).toHaveCount(0)
    await expect(
      publicPage.getByRole('link', { name: /Download shared/ })
    ).toHaveCount(0)
    await expect(
      publicPage.getByText('Where do you land?', { exact: true })
    ).toBeVisible()
    const conversation = publicPage.getByRole('region', {
      name: 'Full conversation'
    })
    expect((await conversation.boundingBox())!.width).toBe(700)
    const expand = conversation.getByRole('button', {
      name: /Read full answer/
    })
    await expect(expand).toHaveAttribute('aria-expanded', 'false')
    await expand.click()
    await expect(
      conversation.getByRole('region', { name: 'Answer 1 to question 1' })
    ).toHaveText(json.assessment.answers[0].text)
    await conversation.getByRole('button', { name: /Collapse answer/ }).click()
    await expect(expand).toHaveAttribute('aria-expanded', 'false')
    await publicPage.screenshot({
      path: '/tmp/public-assessment-desktop.png',
      fullPage: true
    })
    await publicPage.setViewportSize({ width: 390, height: 844 })
    expect(
      await publicPage.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(390)
    await publicPage.close()

    await page.goto('/')
    await page
      .getByRole('link', { name: 'Map your own worldview' })
      .first()
      .click()
    await expect(page).toHaveURL(/\/assessments$/)
    await page.getByRole('link', { name: 'View', exact: true }).click()
    await page
      .getByRole('button', { name: 'Continue in a forked assessment' })
      .click()
    await expect(page).not.toHaveURL(new RegExp(`/assessments/${id}$`))
    forkId = page.url().split('/').at(-1)!
    expect(forkId).not.toBe(id)
    const fork = await (
      await page.request.get(`/api/assessments/${forkId}`)
    ).json()
    expect(fork.visibility).toBe('private')
    expect(fork.assessment.answers).toHaveLength(1)
    expect(fork.assessment.promptCeiling).toBe(
      json.assessment.prompts.length + 12
    )
    await page.goto(`/assessments/${id}`)
    await page.route(`**/api/assessments/${id}`, async (route) => {
      if (route.request().method() !== 'PATCH') return route.continue()
      return route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          error:
            'The saved state could not be confirmed. Retry with the same request key.'
        })
      })
    })
    await page
      .getByRole('button', { name: 'Make private', exact: true })
      .click()
    await expect(
      page.getByText('Couldn’t change visibility. Please try again.', {
        exact: true
      })
    ).toBeVisible()
    await expect(page.getByText(/same request key/)).toHaveCount(0)
    await page.unroute(`**/api/assessments/${id}`)
    await page
      .getByRole('button', { name: 'Make private', exact: true })
      .click()
    await expect(
      page.getByRole('button', {
        name: 'Publish assessment publicly',
        exact: true
      })
    ).toBeVisible()
    // Simulate a now-authenticated owner before explicit republication.
    const databaseUrl = process.env.TEST_DATABASE_URL!
    expect(new URL(databaseUrl).pathname.endsWith('_test')).toBe(true)
    const profilePool = new Pool({ connectionString: databaseUrl })
    try {
      const {
        rows: [owner]
      } = await profilePool.query(
        'SELECT owner_id FROM assessments WHERE id=$1',
        [id]
      )
      await profilePool.query(
        'UPDATE "user" SET is_anonymous=false, name=$2, image=$3 WHERE id=$1',
        [
          owner.owner_id,
          'Public publisher',
          'https://pbs.twimg.com/profile_images/123/avatar_normal.jpg'
        ]
      )
      await profilePool.query(
        'INSERT INTO account (id, account_id, provider_id, user_id, updated_at) VALUES ($1,$2,$3,$4,now())',
        [crypto.randomUUID(), '123456789', 'twitter', owner.owner_id]
      )
    } finally {
      await profilePool.end()
    }
    const republished = await page.request.patch(`/api/assessments/${id}`, {
      headers,
      data: { expectedRevision: 2, visibility: 'public' }
    })
    expect(republished.status()).toBe(200)
    const attributedPage = await visitor.newPage()
    await attributedPage.goto(publicURL)
    await expect(
      attributedPage.getByRole('heading', {
        name: 'Public publisher',
        exact: true
      })
    ).toBeVisible()
    await expect(
      attributedPage.getByRole('img', { name: 'Public publisher', exact: true })
    ).toHaveAttribute('src', /avatar_400x400.jpg/)
    await expect(
      attributedPage.getByRole('link', { name: 'View on X', exact: true })
    ).toHaveAttribute('href', 'https://x.com/i/user/123456789')
    await attributedPage.close()
    await page.goto('/assessments')
    await page
      .getByRole('button', { name: 'Make private', exact: true })
      .click()
    await expect(
      page.getByRole('button', { name: 'Make private', exact: true })
    ).toHaveCount(0)
    expect((await visitor.request.get(`${publicURL}/data`)).status()).toBe(404)
    expect(
      (await visitor.request.get(`${publicURL}/social-image.webp`)).status()
    ).toBe(404)
    const denied = await visitor.request.get(publicURL)
    expect(await denied.text()).not.toContain(
      'AI could greatly improve medicine'
    )
    const continued = await page.request.post(`/api/assessments/${id}`, {
      headers,
      data: {
        assessmentId: id,
        expectedRevision: 2,
        requestKey: crypto.randomUUID(),
        operation: { type: 'continue' }
      }
    })
    expect(continued.status()).toBe(200)
    expect((await continued.json()).assessment.id).toBe(id)
    const beforeSavedResults = await (
      await page.request.get(`/api/assessments/${id}`)
    ).json()
    await page.goto(`/assessments/${id}`)
    await page
      .getByRole('button', { name: 'View my results', exact: true })
      .click()
    await expect(
      page.getByRole('button', {
        name: 'Publish assessment publicly',
        exact: true
      })
    ).toBeVisible()
    expect(
      await (await page.request.get(`/api/assessments/${id}`)).json()
    ).toEqual(beforeSavedResults)
    await page.request.delete(`/api/assessments/${id}`, { headers })
    expect(
      (await page.request.get(`/api/assessments/${forkId}`)).status()
    ).toBe(200)
  } finally {
    for (const savedId of [id, forkId].filter(Boolean))
      await page.request.delete(`/api/assessments/${savedId}`, { headers })
    await visitor.close()
  }
})

test('homepage navigation survives an empty auth API response', async ({
  page
}) => {
  await page.route('**/api/auth/get-session', (route) =>
    route.fulfill({ status: 503, body: '' })
  )
  await page.goto('/')
  await page.locator('[data-slot="primary-cta"]').first().click()
  await expect(page).toHaveURL(/\/assessments(?:\?start=1|\/[a-f0-9-]+)?$/)
  await expect(page.getByText(/Unexpected end of JSON input/)).toHaveCount(0)
})
