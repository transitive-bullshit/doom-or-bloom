import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { test, expect } from '@playwright/test'
import { createAssessment } from '../../lib/assessment/state'
import { emptyComponent } from '../../lib/assessment/projections'

test('publication warms HTML/RSC and revocation expires cached content immediately', async ({
  request,
  playwright,
  baseURL
}) => {
  const headers = { origin: baseURL! }
  const signedIn = await request.post('/api/auth/sign-in/anonymous', {
    headers,
    data: {}
  })
  expect(signedIn.ok()).toBe(true)
  const session = await (await request.get('/api/auth/get-session')).json()
  const state = createAssessment(randomUUID(), 'fixture-v1')
  const marker = `Public cache fixture ${randomUUID()}`
  state.status = 'results'
  state.answers = [
    {
      id: 'cache-answer',
      promptInstanceId: state.prompts[0]!.id,
      promptText: state.prompts[0]!.text,
      text: marker,
      substantive: true,
      hasHorizon: false,
      hasConviction: false
    }
  ]
  state.result = {
    evidenceRevision: state.evidenceRevision,
    versions: state.versions,
    horizontal: emptyComponent('outlook', 'Doom–Bloom'),
    vertical: emptyComponent('epistemic', 'Demonstrated reasoning'),
    components: [],
    findings: [],
    resources: [],
    fingerprint: [],
    sources: [],
    provisional: true,
    capped: false,
    insufficient: true,
    reason: 'Synthetic cache acceptance fixture; no inference.'
  }
  const { id } = JSON.parse(
    execFileSync(
      process.execPath,
      [
        '--conditions=react-server',
        '--import',
        'tsx',
        'tests/browser/seed-assessment.ts'
      ],
      {
        input: JSON.stringify({ ownerId: session.user.id, assessment: state }),
        encoding: 'utf8'
      }
    )
  ) as { id: string }
  const visitor = await playwright.request.newContext({
    baseURL,
    ignoreHTTPSErrors: true
  })
  const path = `/public/assessments/${id}`
  const mutation = `/api/assessments/${id}`
  const visibility = async (value: 'public' | 'private') => {
    const response = await request.patch(mutation, {
      headers,
      data: { expectedRevision: 0, visibility: value }
    })
    expect(response.status()).toBe(200)
  }
  const unavailable = async () => {
    for (const extraHeaders of [{}, { RSC: '1' }] as Record<string, string>[]) {
      const response = await visitor.get(path, { headers: extraHeaders })
      expect(response.status()).toBe(404)
      expect(await response.text()).not.toContain(marker)
    }
    expect((await visitor.get(`${path}/data`)).status()).toBe(404)
  }
  try {
    await unavailable() // Also exercise invalidation of cached private 404s.
    expect(
      (
        await visitor.patch(mutation, {
          headers,
          data: { expectedRevision: 0, visibility: 'public' }
        })
      ).status()
    ).toBe(401)
    await visibility('public')
    // Observe generation on disk instead of warming the page with a test GET.
    await expect
      .poll(
        async () => {
          try {
            return (
              await readFile(`.next/server/app${path}.html`, 'utf8')
            ).includes(marker)
          } catch {
            return false
          }
        },
        { timeout: 20_000 }
      )
      .toBe(true)
    for (const extraHeaders of [{}, { RSC: '1' }] as Record<string, string>[]) {
      const response = await visitor.get(path, { headers: extraHeaders })
      expect(response.status()).toBe(200)
      expect(response.headers()['x-nextjs-cache']).toBe('HIT')
      expect(response.headers()['cache-control']).toContain('s-maxage=172800')
      expect(await response.text()).toContain(marker)
    }
    const data = await visitor.get(`${path}/data`)
    expect(data.headers()['cache-control']).toContain('no-store')
    expect(
      (
        await visitor.patch(mutation, {
          headers,
          data: { expectedRevision: 0, visibility: 'private' }
        })
      ).status()
    ).toBe(401)
    expect((await visitor.get(path)).status()).toBe(200)
    await visibility('private')
    await unavailable()
    await visibility('public')
    const republished = await visitor.get(path)
    expect(republished.status()).toBe(200)
    expect(await republished.text()).toContain(marker)
    expect((await request.delete(mutation, { headers })).status()).toBe(204)
    await unavailable()
    expect((await visitor.get('/sitemap.xml')).status()).toBe(200)
    expect(await (await visitor.get('/sitemap.xml')).text()).not.toContain(id)
  } finally {
    await request.delete(mutation, { headers })
    await visitor.dispose()
  }
})
