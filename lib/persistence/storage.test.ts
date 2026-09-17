import { expect, test } from 'vitest'
import { createAssessment } from '@/lib/assessment/state'
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
