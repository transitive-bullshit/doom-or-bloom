import { expect, test } from 'vitest'
import { conversationTurns } from './conversation'
import {
  acceptAnswer,
  createAssessment,
  currentPrompt,
  issuePrompt
} from './state'
import { assessmentSchema } from './schema'
import { restoreLocalInteraction, serverSnapshot } from './transport'

test('conversation preserves question order, earlier replies and exact accepted text without exposing a draft', () => {
  let state = createAssessment('conversation')
  const first = currentPrompt(state)
  state.interactionHistory = [
    {
      requestId: 'earlier',
      promptInstanceId: first.id,
      text: 'My first try.',
      disposition: 'needs_clarification'
    }
  ]
  state = acceptAnswer(state, {
    id: `${first.id}:a`,
    promptInstanceId: first.id,
    promptText: first.text,
    text: 'The complete answer.\nIncluding another line.',
    spans: [],
    substantive: true
  })
  state = issuePrompt(state, {
    promptId: 'horizon.general',
    text: 'When might this happen?',
    family: 'horizon',
    variant: 'original',
    sourceEvidenceIds: []
  })
  state.draft = 'Still writing; not submitted.'
  const turns = conversationTurns(state)
  expect(turns.map((turn) => turn.question)).toEqual([
    first.text,
    'When might this happen?'
  ])
  expect(turns[0]!.replies.map((reply) => reply.text)).toEqual([
    'My first try.',
    'The complete answer.\nIncluding another line.'
  ])
  expect(turns[1]!.replies).toEqual([])
  expect(JSON.stringify(turns)).not.toContain(state.draft)
  expect(state.answers).toHaveLength(1)
})

test('local conversation retains more than twenty earlier replies and retries do not duplicate them', () => {
  let state = createAssessment('earlier-replies')
  const prompt = currentPrompt(state)
  for (let i = 0; i < 25; i++) {
    const id = `navigation-${i}`
    const next = {
      ...state,
      attempts: [
        ...state.attempts,
        {
          id,
          promptInstanceId: prompt.id,
          variant: 'original',
          disposition: 'navigation' as const,
          confidence: 1,
          evaluated: false
        }
      ]
    }
    state = restoreLocalInteraction(
      state,
      next,
      { type: 'answer', text: `Reply ${i}` },
      id
    )
    state = restoreLocalInteraction(
      state,
      state,
      { type: 'answer', text: `Reply ${i}` },
      id
    )
  }
  expect(assessmentSchema.parse(state).interactionHistory).toHaveLength(25)
  expect(conversationTurns(state)[0]!.replies).toHaveLength(25)
  expect(conversationTurns(state)[0]!.replies[0]!.text).toBe('Reply 0')
  expect(serverSnapshot(state)).not.toHaveProperty('interactionHistory')
  expect(serverSnapshot(state).draft).toBe('')
  expect(state.answers).toEqual([])
  expect(state.evidence).toEqual([])
})
