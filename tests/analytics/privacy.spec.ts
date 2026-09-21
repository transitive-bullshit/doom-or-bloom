import { gunzipSync } from 'node:zlib'
import { expect, test } from '@playwright/test'
import { assessmentSchema } from '../../lib/assessment/schema'
import {
  acceptAnswer,
  currentPrompt,
  issuePrompt,
  recordDisposition
} from '../../lib/assessment/state'
import { storageKey } from '../../lib/persistence/storage'

test('internal editorial pages initialize no analytics or inference even when analytics is enabled', async ({
  page,
  baseURL
}) => {
  const external: string[] = []
  const inference: string[] = []
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url())
    if (url.origin !== new URL(baseURL!).origin) {
      external.push(url.hostname)
      return route.fulfill({ status: 200, body: '' })
    }
    if (url.pathname === '/api/assessment') inference.push(url.pathname)
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
  await page.route('**/api/assessment', async (route) => {
    const input = route.request().postDataJSON()
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
    await route.fulfill({
      json: {
        assessmentId: state.id,
        baseRevision: initial.revision,
        requestId: input.requestId,
        assessment: state,
        provider: 'live'
      }
    })
  })
  await page.goto(`/assessment?answer=${canary}#${canary}`)
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
  expect(serialized).not.toContain('$current_url')
  expect(serialized).not.toContain('$referrer')
  expect(serialized).not.toContain('$session_id')
  expect(serialized.match(/"event":"assessment_started"/g)).toHaveLength(1)
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
  await page.goto('/assessment')
  await page
    .getByLabel('Your answer', { exact: true })
    .fill('A useful answer preserved without credentials.')
  await page.getByRole('button', { name: /^Continue/ }).click()
  await expect(
    page.getByText(
      'The evaluator is not configured. Your answer is saved; please try again later.'
    )
  ).toBeVisible()
  await expect(page.getByLabel('Your answer', { exact: true })).toHaveValue(
    'A useful answer preserved without credentials.'
  )
  const attempts = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).assessment.attempts,
    storageKey
  )
  expect(attempts).toEqual([])
})
