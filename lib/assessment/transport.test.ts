import { expect, test } from 'vitest'
import { createAssessment, recordDisposition } from './state'
import { restoreLocalInteraction } from './transport'

test('rejected replies preserve interaction text and the unsent draft', () => {
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
})

test('rejected replies keep the language they were written in', () => {
  const state = createAssessment('local-locale')
  const next = recordDisposition(state, 'non_answer', 1, 'request-es')
  const restored = restoreLocalInteraction(
    state,
    next,
    { type: 'answer', text: 'asdf', locale: 'ja' },
    'request-es'
  )
  expect(restored.interactionHistory[0]?.displayLocale).toBe('ja')
})
