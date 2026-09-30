import { afterEach, expect, test, vi } from 'vitest'
import {
  configureAnalytics,
  posthogPrivacyConfig,
  sanitizePostHog
} from './client'
import { makeEvent, sanitizeEvent, transitionEvents } from './events'
import {
  attributionUrl,
  firstTouchProperties
} from '../attribution/first-touch'
import {
  createAssessment,
  recordDisposition,
  issuePrompt
} from '@/lib/assessment/state'
const catalog = { prompts: { root: 'root' }, resources: ['resource.nist'] }
const id = 'b5a925d2-34bb-4909-a4f7-72659508c1b2'
afterEach(() => vi.unstubAllEnvs())
test('outbound sanitizer discards text, query strings and SDK enrichment', () => {
  vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'phc_synthetic_test_key')
  const state = createAssessment(id)
  const event = makeEvent(state, 'answer_classified', {
    disposition: 'non_answer'
  })
  const canary = 'PRIVATE_ANSWER_CANARY'
  const safe = sanitizeEvent(
    {
      ...event,
      properties: {
        ...event.properties,
        raw_answer: canary,
        excerpt: canary,
        clarification: canary,
        $current_url: `http://localhost/?answer=${canary}#${canary}`
      }
    },
    catalog
  )
  expect(JSON.stringify(safe)).not.toContain(canary)
  configureAnalytics(catalog, false)
  const outbound = sanitizePostHog({
    event: event.name,
    properties: {
      ...event.properties,
      distinct_id: id,
      token: canary,
      $current_url: canary,
      $referrer: canary,
      $set: { email: canary },
      $session_id: canary
    }
  })
  expect(outbound?.properties.distinct_id).toBe(id)
  expect(outbound?.properties.token).toBe('phc_synthetic_test_key')
  expect(JSON.stringify(outbound)).not.toContain(canary)
  expect(
    sanitizeEvent(
      { ...event, properties: { ...event.properties, resource_id: canary } },
      catalog
    )
  ).toBeNull()
  expect(attributionUrl(`https://example.com/?q=${canary}#${canary}`)).toBe(
    'https://example.com/'
  )
  expect(posthogPrivacyConfig.autocapture).toBe(false)
  expect(posthogPrivacyConfig.capture_exceptions).toBe(false)
  expect(posthogPrivacyConfig.disable_session_recording).toBe(true)
  expect(posthogPrivacyConfig.person_profiles).toBe('never')
})
test('recovery events precede start and are idempotent', () => {
  const previous = createAssessment(id)
  const next = recordDisposition(previous, 'non_answer', 1, 'r1')
  const events = transitionEvents(
    previous,
    next,
    { type: 'answer', text: 'nonsense' },
    'r1'
  )
  expect(events.map((e) => e.name)).toEqual([
    'answer_classified',
    'answer_recovery_shown'
  ])
  expect(
    transitionEvents(previous, next, { type: 'answer', text: 'nonsense' }, 'r1')
  ).toEqual([])
  const second = recordDisposition(next, 'non_answer', 1, 'r2')
  const names = transitionEvents(
    next,
    second,
    { type: 'answer', text: 'nonsense' },
    'r2'
  ).map((e) => e.name)
  expect(names).toContain('paperclip_interlude_shown')
  expect(names).not.toContain('assessment_paused')
  expect(names).not.toContain('assessment_started')
  expect(names).not.toContain('assessment_completed')
  expect(names).not.toContain('question_routed')
})
test('a successful retry keeps its attempt bucket after routing resets the recovery counter', () => {
  const initial = createAssessment(id)
  const previous = recordDisposition(initial, 'needs_clarification', 1, 'first')
  const accepted = recordDisposition(previous, 'usable', 1, 'second')
  const next = issuePrompt(accepted, {
    promptId: 'timeline.general',
    text: 'When?',
    family: 'timeline',
    variant: 'original',
    sourceEvidenceIds: []
  })
  expect(next.recovery.evaluated).toBe(0)
  const events = transitionEvents(
    previous,
    next,
    { type: 'answer', text: 'usable private answer' },
    'second'
  )
  expect(
    events.find((event) => event.name === 'answer_classified')?.properties
      .attempt_bucket
  ).toBe('two')
})
test('first-touch attribution passes the allowlist only as slugs', () => {
  const event = makeEvent(createAssessment(id), 'assessment_started')
  const touch = {
    v: 1 as const,
    ref: 'sim-gwern',
    referrer: 't.co',
    landing: 'user' as const,
    at: '2026-10-01T00:00:00.000Z'
  }
  const safe = sanitizeEvent(
    {
      ...event,
      properties: { ...event.properties, ...firstTouchProperties(touch) }
    },
    catalog
  )
  expect(safe?.properties).toMatchObject({
    first_touch_channel: 'sim-gwern',
    first_touch_ref: 'sim-gwern',
    first_touch_referrer: 't.co',
    first_touch_landing: 'user'
  })
  expect(
    sanitizeEvent(
      {
        ...event,
        properties: {
          ...event.properties,
          first_touch_referrer: 'https://t.co/private?q=1'
        }
      },
      catalog
    )
  ).toBeNull()
})
