import { expect, test } from 'vitest'
import { baseResult } from '@/lib/assessment/projections'
import { loadBundle } from '@/lib/content/loader'
import { canSubmit, createAssessment } from '@/lib/assessment/state'
import { limits, operationSchema } from '@/lib/assessment/schema'
import {
  loadAssessment,
  saveAssessment,
  StorageConflict,
  storageKey
} from './storage'
function memory() {
  const map = new Map<string, string>()
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v)
    },
    removeItem: (k: string) => {
      map.delete(k)
    }
  }
}
test('drafts resume, an interlude never replays, conflicting tabs cannot overwrite', () => {
  const storage = memory()
  const state = createAssessment('a')
  state.draft = 'unsent answer'
  state.recovery.paperclipShown = true
  state.recovery.paperclipActive = true
  saveAssessment(storage, state, null, 't1')
  const loaded = loadAssessment(storage)
  expect(loaded.kind).toBe('valid')
  if (loaded.kind !== 'valid') throw new Error('Expected saved assessment')
  expect(loaded.assessment.draft).toBe('unsent answer')
  expect(loaded.assessment.recovery.paperclipActive).toBe(false)
  saveAssessment(storage, state, 't1', 't2')
  expect(() => saveAssessment(storage, state, 't1', 't3')).toThrow(
    StorageConflict
  )
})
test('corrupt and unavailable storage are recoverable', () => {
  const storage = memory()
  storage.setItem(storageKey, '{bad')
  expect(loadAssessment(storage).kind).toBe('invalid')
  expect(
    loadAssessment({
      ...storage,
      getItem: () => {
        throw new Error('unavailable')
      }
    }).kind
  ).toBe('unavailable')
})

test('resuming an earlier content version preserves its draft and version', () => {
  const storage = memory()
  const state = createAssessment('earlier-content')
  state.versions.content = '0.2.0-draft'
  state.draft = 'This is my original unsent answer.'
  saveAssessment(storage, state, null, 'earlier-token')
  const loaded = loadAssessment(storage)
  if (loaded.kind !== 'valid')
    throw new Error('Expected earlier saved assessment')
  expect(loaded.assessment).toEqual(state)
})
test('over-limit drafts resume intact while submitted answers have a 20,000-character bound', () => {
  const storage = memory()
  const state = createAssessment('long-draft')
  state.draft = 'spoken answer '.repeat(2000)
  expect(state.draft.length).toBeGreaterThan(limits.answerChars)
  saveAssessment(storage, state, null, 'long-token')
  const loaded = loadAssessment(storage)
  expect(loaded.kind).toBe('valid')
  if (loaded.kind !== 'valid') throw new Error('Expected saved assessment')
  expect(loaded.assessment.draft).toBe(state.draft)
  const accepted = 'a'.repeat(20_000)
  expect(operationSchema.parse({ type: 'answer', text: accepted })).toEqual({
    type: 'answer',
    text: accepted
  })
  expect(
    operationSchema.safeParse({ type: 'answer', text: `${accepted}a` }).success
  ).toBe(false)
})

test('legacy sessions migrate to answer-level support without losing drafts, versions or historical results', () => {
  const storage = memory()
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
  storage.setItem(
    storageKey,
    JSON.stringify({ token: 'legacy-token', assessment: old })
  )
  const loaded = loadAssessment(storage)
  if (loaded.kind !== 'valid') throw new Error('Expected migrated assessment')
  expect(loaded.token).toBe('legacy-token')
  expect(loaded.assessment.schemaVersion).toBe(2)
  expect(loaded.assessment.draft).toBe(old.draft)
  expect(loaded.assessment.versions).toEqual(old.versions)
  expect(loaded.assessment.result).toEqual(old.result)
  expect(loaded.assessment.answers[0]).toEqual({
    id: 'legacy:a',
    promptInstanceId: state.prompts[0]!.id,
    promptText: state.prompts[0]!.text,
    text,
    substantive: true,
    hasHorizon: true,
    hasConviction: true
  })
  expect(loaded.assessment.evidence[0]).toEqual({
    id: 'legacy:e',
    answerId: 'legacy:a',
    vector: 'capability_trajectory',
    status: 'stated',
    judgmentIds: [],
    referenceIds: [],
    contextReferenceIds: []
  })
  expect(loaded.assessment.judgments).toEqual([])
  saveAssessment(storage, loaded.assessment, loaded.token, 'new-token')
  expect(storage.getItem(storageKey)).not.toMatch(/spanId|SpanId|"spans"/)
  const resumed = loadAssessment(storage)
  expect(resumed.kind === 'valid' && resumed.assessment).toEqual(
    loaded.assessment
  )
})

test('legacy paperclip pauses resume with an editable answer and acknowledgement', () => {
  const storage = memory()
  const state = createAssessment('legacy-paperclips')
  state.status = 'recovery'
  state.recovery = {
    evaluated: 2,
    clearMisses: 2,
    paperclipShown: true,
    paperclipActive: false,
    reason: 'non_answer'
  }
  saveAssessment(storage, state, null, 'legacy')
  const loaded = loadAssessment(storage)
  if (loaded.kind !== 'valid') throw new Error('Expected saved assessment')
  expect(canSubmit(loaded.assessment)).toBe(true)
  expect(loaded.assessment.recovery.reason).toBe('paperclips')
  expect(loaded.assessment.recovery.evaluated).toBe(2)
})
