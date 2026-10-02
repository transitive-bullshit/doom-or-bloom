import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'
import { createAssessment } from '../../lib/assessment/state'
import { emptyComponent } from '../../lib/assessment/projections'

test('share links render on first request, cache, and expire immediately on revocation and deletion', async ({
  request,
  playwright,
  baseURL
}) => {
  const headers = { origin: baseURL! }
  expect(
    (
      await request.post('/api/auth/sign-in/anonymous', { headers, data: {} })
    ).ok()
  ).toBe(true)
  const session = await (await request.get('/api/auth/get-session')).json()
  const state = createAssessment(randomUUID(), 'fixture-v1')
  const marker = `Share link cache fixture ${randomUUID()}`
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
  const api = `/api/assessments/${id}/share-link`
  const visitor = await playwright.request.newContext({
    baseURL,
    ignoreHTTPSErrors: true
  })
  const create = async () => {
    const response = await request.post(api, { headers, data: {} })
    expect(response.status()).toBe(201)
    return (await response.json()).link.id as string
  }
  const routes = (link: string) => [
    `/s/${link}`,
    `/es/s/${link}`,
    `/ja/s/${link}`,
    `/s/${link}/social-image.png`,
    `/es/s/${link}/social-image.png`
  ]
  const cached = async (link: string) => {
    for (const path of routes(link))
      for (const repeat of [false, true]) {
        const response = await visitor.get(path)
        expect(response.status(), path).toBe(200)
        // Rendered on the first request, then served from the route cache.
        if (repeat) {
          expect(response.headers()['x-nextjs-cache']).toBe('HIT')
          expect(response.headers()['cache-control']).toContain(
            's-maxage=172800'
          )
        }
        expect(response.headers()['set-cookie']).toBeUndefined()
        if (path.endsWith('.png'))
          expect(response.headers()['content-type']).toBe('image/png')
        else {
          const html = await response.text()
          expect(html).not.toContain(marker)
          expect(html).toContain(
            '<meta name="robots" content="noindex, nofollow"/>'
          )
        }
      }
  }
  const expired = async (link: string) => {
    for (const path of routes(link))
      for (const extraHeaders of path.endsWith('.png')
        ? [{}]
        : ([{}, { RSC: '1' }] as Record<string, string>[])) {
        const response = await visitor.get(path, { headers: extraHeaders })
        expect(response.status(), path).toBe(404)
        expect(await response.text()).not.toContain(marker)
      }
    expect((await visitor.get(`/api/share-links/${link}`)).status()).toBe(404)
  }
  try {
    const first = await create()
    await cached(first)
    // Only the owner can stop sharing; then every cached rendering expires.
    expect((await visitor.delete(api, { headers })).status()).toBe(401)
    expect((await request.delete(api, { headers })).status()).toBe(200)
    await expired(first)
    // Deleting the assessment expires its links just as immediately.
    const second = await create()
    await cached(second)
    expect(
      (await request.delete(`/api/assessments/${id}`, { headers })).status()
    ).toBe(204)
    await expired(second)
    const robots = await (await visitor.get('/robots.txt')).text()
    // Crawlers must reach /s/ to fetch link previews; the pages are noindex.
    expect(robots).not.toContain('/s/')
    expect(await (await visitor.get('/sitemap.xml')).text()).not.toContain(
      '/s/'
    )
  } finally {
    await request.delete(`/api/assessments/${id}`, { headers })
    await visitor.dispose()
  }
})
