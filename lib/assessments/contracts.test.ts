import { expect, test } from 'vitest'
import { createAssessment } from '../assessment/state'
import { submitSchema } from './contracts'

test('HTTP submissions accept operation identifiers and reject client-supplied assessment state', () => {
  const submission = {
    assessmentId: '8b622371-2ae8-4d99-afb2-f3118f5578b3',
    expectedRevision: 2,
    requestKey: 'retry-safe-operation',
    operation: {
      type: 'answer' as const,
      text: 'AI could improve medicine.',
      locale: 'es'
    }
  }
  expect(submitSchema.parse(submission)).toEqual({
    ...submission,
    debug: false
  })
  for (const extra of [
    { assessment: createAssessment('untrusted') },
    { draft: 'PRIVATE_DRAFT' },
    { interactionHistory: [{ text: 'PRIVATE_REJECTED_TEXT' }] }
  ])
    expect(submitSchema.safeParse({ ...submission, ...extra }).success).toBe(
      false
    )
})
