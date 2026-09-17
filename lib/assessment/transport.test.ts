import { expect, test } from 'vitest'
import { createAssessment, recordDisposition } from './state'
import { restoreLocalInteraction, serverSnapshot } from './transport'
import { requestSchema } from './schema'

test('rejected interaction text is bounded locally and excluded from later server transport', () => {
  let state = createAssessment('local-only')
  state.draft = 'PRIVATE_REJECTED_TEXT'
  const next = recordDisposition(state, 'non_answer', 1, 'request-one')
  state = restoreLocalInteraction(
    state,
    next,
    { type: 'answer', text: state.draft },
    'request-one'
  )
  expect(state.interactionHistory[0]?.text).toBe('PRIVATE_REJECTED_TEXT')
  expect(state.draft).toBe('PRIVATE_REJECTED_TEXT')
  const snapshot = serverSnapshot(state)
  expect(JSON.stringify(snapshot)).not.toContain('PRIVATE_REJECTED_TEXT')
  const parsed = requestSchema.parse({
    requestId: 'next',
    assessment: snapshot,
    operation: { type: 'retry' }
  })
  expect(parsed.assessment.interactionHistory).toEqual([])
  expect(() =>
    requestSchema.parse({
      requestId: 'bad',
      assessment: state,
      operation: { type: 'retry' }
    })
  ).toThrow()
})
