import { gunzipSync } from 'node:zlib'
import { Pool } from 'pg'
import { execFileSync } from 'node:child_process'
import type { BrowserContext, Page } from '@playwright/test'
import {
  expect,
  test,
  startAssessment,
  savedAssessment,
  mockEvaluation,
  skipSelfPlacement
} from '../browser/fixtures'
import { assessmentSchema } from '../../lib/assessment/schema'
import { firstTouchCookie } from '../../lib/attribution/first-touch'
import {
  acceptAnswer,
  currentPrompt,
  issuePrompt,
  recordDisposition
} from '../../lib/assessment/state'

test('internal editorial pages initialize no analytics or inference even when analytics is enabled', async ({
  page,
  baseURL
}) => {
  const external: string[] = []
  const inference: string[] = []
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url())
    // The development feedback widget talks only to its local companion.
    if (url.origin === 'http://localhost:4747')
      return route.fulfill({ json: {} })
    if (url.origin !== new URL(baseURL!).origin) {
      external.push(url.hostname)
      return route.fulfill({ status: 200, body: '' })
    }
    if (
      url.pathname.startsWith('/api/assessments/') &&
      route.request().method() === 'POST'
    )
      inference.push(url.pathname)
    return route.continue()
  })
  await page.goto('/questions')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Built-in questions'
  )
  await page
    .getByLabel('Search questions or metadata')
    .fill('grounding.general')
  await expect(page.getByText('1 matches', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Corpus', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Built-in corpus'
  )
  await page
    .getByLabel('Search titles, IDs, topics, dates or snapshot text')
    .fill('event.openai-hugging-face-2026')
  await page.getByRole('link', { name: 'User Journeys', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'User Journeys'
  )
  await expect(page.getByRole('region', { name: 'Run summary' })).toBeVisible()
  expect(external).toEqual([])
  expect(inference).toEqual([])
})

test('actual PostHog SDK payloads exclude answers and URL canaries; resume does not duplicate start', async ({
  page,
  baseURL
}) => {
  const captured: string[] = []
  const external: string[] = []
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning')
      errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))
  const canary = 'PRIVATE_TRANSPORT_CANARY'
  // The SDK intentionally drops WebDriver traffic. Emulate a participant for
  // this intercepted transport test while preserving filtering in the app.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false })
    Object.defineProperty(navigator, 'userAgentData', { get: () => undefined })
  })
  await page.route('**/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.origin === 'http://localhost:4747')
      return route.fulfill({ json: {} })
    if (url.origin === new URL(baseURL!).origin) return route.continue()
    external.push(url.hostname)
    const body = request.postDataBuffer()
    if (url.hostname === 'posthog.invalid' && body) {
      if (body[0] === 0x1f && body[1] === 0x8b)
        captured.push(gunzipSync(body).toString('utf8'))
      else if (url.searchParams.get('compression') === 'base64')
        captured.push(
          Buffer.from(
            new URLSearchParams(body.toString('utf8')).get('data')!,
            'base64'
          ).toString('utf8')
        )
      else captured.push(body.toString('utf8'))
    }
    await route.fulfill({
      status: 200,
      json: {},
      headers: { 'access-control-allow-origin': '*' }
    })
  })
  await mockEvaluation(page, async (input) => {
    if (input.operation.type !== 'answer') throw new Error('Expected answer')
    const initial = assessmentSchema.parse(input.assessment)
    const prompt = currentPrompt(initial)
    const answerId = `${prompt.id}:a`
    let state = recordDisposition(initial, 'usable', 1, input.requestId)
    state = acceptAnswer(state, {
      id: answerId,
      promptInstanceId: prompt.id,
      promptText: prompt.text,
      text: input.operation.text,
      substantive: true,
      hasHorizon: false,
      hasConviction: false
    })
    state = issuePrompt(state, {
      promptId: 'timeline.general',
      text: 'When, if ever, do you expect AI to bring major changes to everyday life?',
      family: 'timeline',
      variant: 'original',
      sourceEvidenceIds: []
    })
    state.revision++
    return {
      assessmentId: state.id,
      baseRevision: initial.revision,
      requestId: input.requestId,
      assessment: state,
      provider: 'live'
    }
  })
  // Arrive from an outreach link: tags are kept, everything else is dropped.
  await page.goto(`/?ref=Sim-Gwern&utm_medium=dm&private=${canary}`, {
    referer: `https://t.co/${canary}`
  })
  await expect
    .poll(async () =>
      decodeURIComponent(
        (await page.context().cookies()).find(
          (cookie) => cookie.name === firstTouchCookie
        )?.value ?? ''
      )
    )
    .toContain('"ref":"sim-gwern"')
  await startAssessment(page)
  const privatePath = new URL(page.url()).pathname
  await page.goto(`${privatePath}?answer=${canary}#${canary}`)
  await page
    .getByLabel('Your answer', { exact: true })
    .fill(`AI could improve science. ${canary}`)
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue('')
  await expect
    .poll(() => captured.join('\n'), {
      timeout: 15_000
    })
    .toContain('assessment_started')
  await page.reload()
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue('')
  const serialized = captured.join('\n')
  expect(serialized).not.toContain(canary)
  expect(serialized).not.toContain(privatePath)
  expect(serialized).not.toContain('$current_url')
  expect(serialized).not.toContain('$referrer')
  expect(serialized).not.toContain('$session_id')
  expect(serialized.match(/"event":"assessment_started"/g)).toHaveLength(1)
  for (const property of [
    '"first_touch_channel":"sim-gwern"',
    '"first_touch_ref":"sim-gwern"',
    '"first_touch_medium":"dm"',
    '"first_touch_referrer":"t.co"',
    '"first_touch_landing":"home"'
  ])
    expect(serialized).toContain(property)
  // The anonymous owner created at start stores the same first touch.
  const owner = await (await page.request.get('/api/auth/get-session')).json()
  const database = new Pool({ connectionString: process.env.TEST_DATABASE_URL })
  try {
    const { rows } = await database.query(
      'SELECT first_touch FROM "user" WHERE id=$1',
      [owner.user.id]
    )
    expect(rows[0].first_touch).toMatchObject({
      ref: 'sim-gwern',
      medium: 'dm',
      referrer: 't.co',
      landing: 'home'
    })
    expect(JSON.stringify(rows[0].first_touch)).not.toContain(canary)
  } finally {
    await database.end()
  }
  expect(
    external.every((host) =>
      ['posthog.invalid', 'va.vercel-scripts.com'].includes(host)
    )
  ).toBe(true)
})
test('missing live key preserves the draft and does not consume a semantic attempt', async ({
  page,
  baseURL
}) => {
  await page.route('**/*', (route) =>
    new URL(route.request().url()).origin === new URL(baseURL!).origin
      ? route.continue()
      : route.abort()
  )
  await startAssessment(page)
  await page
    .getByLabel('Your answer', { exact: true })
    .fill('A useful answer preserved without credentials.')
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect(
    page.getByText('This step did not finish', { exact: true })
  ).toBeVisible()
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue(
    'A useful answer preserved without credentials.'
  )
  const attempts = (await savedAssessment(page)).attempts
  expect(attempts).toEqual([])
})

/** Intercepts PostHog transport for a context and collects decoded payloads. */
async function capturePostHog(context: BrowserContext, baseURL: string) {
  const captured: string[] = []
  // The SDK drops WebDriver traffic; emulate a participant for transport tests.
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false })
    Object.defineProperty(navigator, 'userAgentData', { get: () => undefined })
    // Desktop browsers without Web Share copy links instead.
    Object.defineProperty(navigator, 'share', { value: undefined })
  })
  await context.route('**/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.origin === 'http://localhost:4747')
      return route.fulfill({ json: {} })
    if (url.origin === new URL(baseURL).origin) return route.continue()
    const body = request.postDataBuffer()
    if (url.hostname === 'posthog.invalid' && body)
      captured.push(
        body[0] === 0x1f && body[1] === 0x8b
          ? gunzipSync(body).toString('utf8')
          : url.searchParams.get('compression') === 'base64'
            ? Buffer.from(
                new URLSearchParams(body.toString('utf8')).get('data')!,
                'base64'
              ).toString('utf8')
            : body.toString('utf8')
      )
    await route.fulfill({
      status: 200,
      json: {},
      headers: { 'access-control-allow-origin': '*' }
    })
  })
  return captured
}

// The real engine with fixture judgments, run outside the server; no inference.
async function revealResult(page: Page) {
  await mockEvaluation(page, async (input) =>
    JSON.parse(
      execFileSync(
        process.execPath,
        [
          '--conditions=react-server',
          '--import',
          'tsx',
          'tests/browser/early-engine.ts'
        ],
        { input: JSON.stringify(input), encoding: 'utf8' }
      )
    )
  )
  await expect(page).toHaveURL(/\/assessments\/[a-f0-9-]+$/)
  await page
    .getByLabel('Your answer', { exact: true })
    .fill('I expect useful tools and serious risks, depending on oversight.')
  await page.getByRole('button', { name: /^Continue/ }).click()
  await page.getByRole('button', { name: 'View my results' }).click()
  await skipSelfPlacement(page)
}

test('share link and compare events carry only enumerated values, never link, persona or assessment IDs', async ({
  page,
  browser,
  baseURL
}) => {
  const sharer = await capturePostHog(page.context(), baseURL!)
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  // A thought-leader comparison, then a share link from its result.
  await page.goto('/users/karpathy')
  await page
    .locator('[data-slot="card"]')
    .filter({ hasText: 'Where do you land vs' })
    .getByRole('link', { name: 'Map my worldview' })
    .click()
  await revealResult(page)
  const sharerId = new URL(page.url()).pathname.split('/').at(-1)!
  await expect(page.getByRole('region', { name: /^You vs / })).toBeVisible()
  const bar = page.getByRole('region', { name: 'Share your result' })
  await bar.getByRole('button', { name: 'Copy link' }).click()
  await expect(page.getByText('Link copied.', { exact: true })).toBeVisible()
  const link = new URL(
    await page.evaluate(() => navigator.clipboard.readText())
  )
  const linkId = link.pathname.split('/').at(-1)!
  expect(linkId).toMatch(/^[A-Za-z0-9_-]{16}$/)
  await expect
    .poll(() => sharer.join('\n'), { timeout: 15_000 })
    .toContain('share_link_created')
  await expect
    .poll(() => sharer.join('\n'), { timeout: 15_000 })
    .toContain('compare_result_viewed')

  // A friend arrives from the link and compares.
  const friend = await browser.newContext({ baseURL, ignoreHTTPSErrors: true })
  try {
    const recipient = await capturePostHog(friend, baseURL!)
    await friend.grantPermissions(['clipboard-read', 'clipboard-write'])
    const visitor = await friend.newPage()
    await visitor.goto(`${link.pathname}?ref=share-x`)
    await visitor
      .getByRole('region', { name: 'Where do you land?' })
      .getByRole('link', { name: 'Compare now' })
      .click()
    await revealResult(visitor)
    const comparison = visitor.getByRole('region', { name: /^You vs / })
    await comparison
      .getByRole('button', { name: 'Send them your result' })
      .click()
    await expect(visitor.getByText('Link copied. Send it back')).toBeVisible()
    await expect
      .poll(() => recipient.join('\n'), { timeout: 15_000 })
      .toContain('share_link_created')
    const sent = recipient.join('\n')
    expect(sent).toMatch(
      /"event":"compare_result_viewed".*?"alignment_bucket":"(very_aligned|mostly_aligned|some_distance|worlds_apart|unknown)"/
    )
    expect(sent).toContain('"compare_source":"snapshot"')
    expect(sent).toContain('"share_surface":"compare_result"')
    expect(sent).toContain('"first_touch_ref":"share-x"')
    expect(sent).toContain('"first_touch_landing":"share_link"')
    const sentBack = new URL(
      await visitor.evaluate(() => navigator.clipboard.readText())
    )
    const recipientId = new URL(visitor.url()).pathname.split('/').at(-1)!
    const shared = sharer.join('\n')
    expect(shared).toContain('"compare_source":"persona"')
    expect(shared).toContain('"share_surface":"result_bar"')
    expect(shared).toContain('"link_kind":"snapshot"')
    // Neither side's payloads name the link, the thought leader or the other
    // assessment; each carries only its own random assessment ID.
    for (const serialized of [shared, sent]) {
      expect(serialized).not.toContain(linkId)
      expect(serialized).not.toContain(sentBack.pathname.split('/').at(-1)!)
      expect(serialized).not.toContain('karpathy')
      expect(serialized).not.toContain('/s/')
    }
    expect(shared).not.toContain(recipientId)
    expect(sent).not.toContain(sharerId)
  } finally {
    const items = await friend.request.get('/api/assessments')
    if (items.ok())
      for (const item of (await items.json()) as { id: string }[])
        await friend.request.delete(`/api/assessments/${item.id}`, {
          headers: { origin: baseURL! }
        })
    await friend.close()
  }
})
