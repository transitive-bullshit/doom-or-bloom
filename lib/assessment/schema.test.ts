import { expect, test } from 'vitest'
import { baseResult } from './projections'
import { loadBundle } from '@/lib/content/loader'
import { canSubmit, createAssessment, recordDisposition } from './state'
import { assessmentSchema, operationSchema, resultSchema } from './schema'

test('historical results parse without experimental fields and receive compatibility defaults', () => {
  const result = baseResult(
    createAssessment('historical'),
    [],
    loadBundle().rubric,
    false
  )
  const {
    fingerprint: _fingerprint,
    sources: _sources,
    experiment: _experiment,
    ...historical
  } = result
  expect(resultSchema.parse(historical)).toEqual({
    ...historical,
    fingerprint: [],
    sources: []
  })
  expect(
    resultSchema.safeParse({ ...historical, evidenceRevision: -1 }).success
  ).toBe(false)
})

test('submitted answers accept exactly 20,000 characters and reject an extra character', () => {
  const text = 'a'.repeat(20_000)
  expect(operationSchema.parse({ type: 'answer', text })).toEqual({
    type: 'answer',
    text
  })
  expect(
    operationSchema.safeParse({ type: 'answer', text: `${text}a` }).success
  ).toBe(false)
})

test('legacy sessions migrate to answer-level support without losing drafts, versions or historical results', () => {
  const state = createAssessment('legacy')
  state.versions.assessment = '0.2.1'
  state.result = baseResult(state, [], loadBundle().rubric, false)
  const text =
    'I expect useful AI within ten years, with considerable uncertainty.'
  const span = { id: 'legacy:s0', start: 0, end: text.length, text }
  const old = {
    ...state,
    schemaVersion: 1,
    versions: { ...state.versions, assessment: '0.2.1' },
    draft: 'My unsent draft. '.repeat(2000),
    answers: [
      {
        id: 'legacy:a',
        promptInstanceId: state.prompts[0]!.id,
        promptText: state.prompts[0]!.text,
        text,
        substantive: true,
        spans: [span],
        context: {
          horizonSpanId: span.id,
          convictionSpanId: span.id,
          assumptionSpanId: null
        }
      }
    ],
    evidence: [
      {
        id: 'legacy:e',
        answerId: 'legacy:a',
        spanId: span.id,
        vector: 'capability_trajectory',
        status: 'stated',
        judgmentIds: ['old-selection'],
        referenceIds: [],
        contextReferenceIds: [],
        horizonSpanId: span.id,
        convictionSpanId: span.id,
        assumptionSpanId: null
      }
    ],
    judgments: [
      {
        id: 'old-selection',
        questionId: 'capability_trajectory:span',
        answerId: 'legacy:a',
        stage: 'interpret',
        question: {
          type: 'choice',
          instructions: 'Select a span',
          criteria: { [span.id]: text }
        },
        answer: {
          type: 'choice',
          choice: span.id,
          probabilities: { [span.id]: 1 },
          confidence: 1
        },
        model: state.versions.model,
        rubricVersion: state.versions.rubric
      }
    ]
  }
  const migrated = assessmentSchema.parse(old)
  expect(migrated.schemaVersion).toBe(2)
  expect(migrated.draft).toBe(old.draft)
  expect(migrated.versions).toEqual(old.versions)
  expect(migrated.result).toEqual(old.result)
  expect(migrated.answers[0]).toEqual({
    id: 'legacy:a',
    promptInstanceId: state.prompts[0]!.id,
    promptText: state.prompts[0]!.text,
    text,
    substantive: true,
    hasHorizon: true,
    hasConviction: true
  })
  expect(migrated.evidence[0]).toEqual({
    id: 'legacy:e',
    answerId: 'legacy:a',
    vector: 'capability_trajectory',
    status: 'stated',
    judgmentIds: [],
    referenceIds: [],
    contextReferenceIds: []
  })
  expect(migrated.judgments).toEqual([])
  expect(JSON.stringify(migrated)).not.toMatch(/spanId|SpanId|"spans"/)
  expect(assessmentSchema.parse(migrated)).toEqual(migrated)
})

test.each(['0.2.1', '0.6.0'])(
  'legacy %s paperclip pauses resume with an editable answer and acknowledgement',
  (version) => {
    const state = createAssessment('legacy-paperclips')
    state.versions.assessment = version
    state.recovery = {
      evaluated: 2,
      clearMisses: 2,
      paperclipShown: true,
      paperclipActive: true,
      reason: 'non_answer'
    }
    const migrated = assessmentSchema.parse({ ...state, status: 'paused' })
    expect(migrated.status).toBe('recovery')
    expect(migrated.recovery.paperclipActive).toBe(false)
    expect(canSubmit(migrated)).toBe(true)
    expect(migrated.recovery.reason).toBe('paperclips')
    expect(migrated.recovery.evaluated).toBe(2)
  }
)

test.each(['0.6.0', '0.7.5'])(
  '%s semantic recovery after paperclip dismissal retains its non-answer reason',
  (version) => {
    let state = createAssessment('current-recovery')
    state.versions.assessment = version
    state = recordDisposition(state, 'non_answer', 1, 'one')
    state = recordDisposition(state, 'non_answer', 1, 'two')
    state.recovery.paperclipActive = false
    state = recordDisposition(state, 'non_answer', 1, 'three')
    expect(state.recovery).toMatchObject({
      evaluated: 2,
      paperclipShown: true,
      reason: 'non_answer'
    })
    expect(assessmentSchema.parse(state)).toEqual(state)
  }
)
