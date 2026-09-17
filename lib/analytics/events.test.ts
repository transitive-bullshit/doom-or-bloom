import { expect, test } from 'vitest'
import {
  configureAnalytics,
  posthogPrivacyConfig,
  sanitizePostHog
} from './client'
import { makeEvent, sanitizeEvent, transitionEvents, stripUrl } from './events'
import { createAssessment, recordDisposition } from '@/lib/assessment/state'
const catalog = { prompts: { root: 'root' }, resources: ['resource.nist'] }
const id = 'b5a925d2-34bb-4909-a4f7-72659508c1b2'
test('outbound sanitizer discards text, query strings and SDK enrichment', () => {
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
      $current_url: canary,
      $referrer: canary,
      $set: { email: canary },
      $session_id: canary
    }
  })
  expect(outbound?.properties.distinct_id).toBe(id)
  expect(JSON.stringify(outbound)).not.toContain(canary)
  expect(
    sanitizeEvent(
      { ...event, properties: { ...event.properties, resource_id: canary } },
      catalog
    )
  ).toBeNull()
  expect(stripUrl(`https://example.com/?q=${canary}#${canary}`)).toBe(
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
  expect(names).toContain('assessment_paused')
  expect(names).not.toContain('assessment_started')
  expect(names).not.toContain('assessment_completed')
  expect(names).not.toContain('question_routed')
})
