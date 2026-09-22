import { describe, expect, test } from 'vitest'
import {
  acceptAnswer,
  atCap,
  canSubmit,
  createAssessment,
  currentPrompt,
  eligible,
  issuePrompt,
  matchesResponse,
  recordDisposition
} from './state'
import { assessmentSchema } from './schema'

const next = {
  promptId: 'timeline',
  text: 'When?',
  family: 'timeline',
  variant: 'original',
  sourceEvidenceIds: []
}
describe('bounded assessment', () => {
  test('root is persisted once and reply count cannot establish readiness', () => {
    let state = createAssessment('a')
    for (let i = 0; i < 3; i++) {
      const text = "I don't know what will happen."
      state = acceptAnswer(state, {
        id: `a${i}`,
        promptInstanceId: currentPrompt(state).id,
        promptText: currentPrompt(state).text,
        text,
        hasHorizon: false,
        hasConviction: false,
        substantive: true
      })
      if (i < 2) state = issuePrompt(state, next)
    }
    expect(eligible(state)).toBe(false)
    expect(() => acceptAnswer(state, state.answers[0]!)).toThrow()
    expect(assessmentSchema.safeParse(state).success).toBe(true)
  })
  test('two misses trigger once, retries cannot reset recovery bounds', () => {
    let state = recordDisposition(
      createAssessment('a'),
      'non_answer',
      0.99,
      '1'
    )
    expect(state.status).toBe('recovery')
    state = recordDisposition(state, 'non_answer', 0.99, '2')
    expect(state.recovery.paperclipActive).toBe(true)
    expect(state.status).toBe('recovery')
    expect(state.recovery.reason).toBe('paperclips')
    expect(canSubmit(state)).toBe(true)
    expect(recordDisposition(state, 'non_answer', 0.99, '2')).toEqual(state)
    state = {
      ...state,
      status: 'recovery',
      recovery: { ...state.recovery, paperclipActive: false }
    }
    state = recordDisposition(state, 'non_answer', 0.99, '3')
    expect(canSubmit(state)).toBe(true)
    state = recordDisposition(state, 'non_answer', 0.99, '4')
    expect(canSubmit(state)).toBe(false)
    expect(state.recovery.reason).toBe('exhausted')
    expect(state.answers).toHaveLength(0)
    expect(eligible(state)).toBe(false)
  })
  test('ambiguous misses and navigation do not trigger paperclips', () => {
    let state = recordDisposition(createAssessment('a'), 'non_answer', 0.5, '1')
    expect(state.recovery.clearMisses).toBe(0)
    state = recordDisposition(state, 'navigation', 0.99, '2')
    expect(state.recovery.evaluated).toBe(1)
    expect(state.recovery.paperclipShown).toBe(false)
  })
  test('skip preserves misses, usable or ambiguous answers reset them', () => {
    let state = recordDisposition(createAssessment('a'), 'non_answer', 1, '1')
    state = issuePrompt(state, next)
    expect(state.recovery.clearMisses).toBe(1)
    state = recordDisposition(state, 'usable', 1, '2')
    expect(state.recovery.clearMisses).toBe(0)
  })
  test('twelfth prompt accepts an answer but thirteenth is forbidden', () => {
    let state = createAssessment('a')
    for (let i = 1; i < 12; i++) state = issuePrompt(state, next)
    expect(atCap(state)).toBe(true)
    expect(canSubmit(state)).toBe(true)
    expect(() => issuePrompt(state, next)).toThrow()
  })
  test('stale responses after restart or revision changes are ignored', () => {
    const state = createAssessment('a')
    expect(
      matchesResponse(
        state,
        { assessmentId: 'a', baseRevision: 0, requestId: 'x' },
        'x'
      )
    ).toBe(true)
    expect(
      matchesResponse(
        createAssessment('b'),
        { assessmentId: 'a', baseRevision: 0, requestId: 'x' },
        'x'
      )
    ).toBe(false)
    expect(
      matchesResponse(
        { ...state, revision: 1 },
        { assessmentId: 'a', baseRevision: 0, requestId: 'x' },
        'x'
      )
    ).toBe(false)
  })
})
