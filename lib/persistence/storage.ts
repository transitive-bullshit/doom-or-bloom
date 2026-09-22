import { assessmentSchema } from '@/lib/assessment/schema'
import type { Assessment } from '@/lib/assessment/schema'
export const storageKey = 'doom-or-bloom:assessment:v1'
export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}
export type Loaded =
  | { kind: 'valid'; assessment: Assessment; token: string }
  | { kind: 'empty' }
  | { kind: 'invalid'; raw: string }
  | { kind: 'unavailable' }
export function loadAssessment(storage: StorageLike): Loaded {
  try {
    const raw = storage.getItem(storageKey)
    if (!raw) return { kind: 'empty' }
    try {
      const data = JSON.parse(raw) as { assessment: unknown; token: unknown }
      const assessment = assessmentSchema.parse(data.assessment)
      if (typeof data.token !== 'string') return { kind: 'invalid', raw }
      // Older paperclip interludes paused an otherwise answerable question.
      if (
        assessment.status === 'paused' &&
        assessment.recovery.paperclipShown &&
        assessment.recovery.reason === 'non_answer' &&
        assessment.recovery.evaluated < 3
      ) {
        assessment.status = 'recovery'
        assessment.recovery.reason = 'paperclips'
      }
      // A stored marker must not replay a transient decorative effect on reload.
      assessment.recovery.paperclipActive = false
      return { kind: 'valid', assessment, token: data.token }
    } catch {
      return { kind: 'invalid', raw }
    }
  } catch {
    return { kind: 'unavailable' }
  }
}
export class StorageConflict extends Error {}
export function saveAssessment(
  storage: StorageLike,
  assessment: Assessment,
  previousToken: string | null,
  token: string
) {
  const raw = storage.getItem(storageKey)
  let actualToken: string | null = null
  if (raw) {
    try {
      actualToken = (JSON.parse(raw) as { token?: string }).token ?? null
    } catch {
      throw new StorageConflict('The saved assessment changed')
    }
  }
  if (previousToken !== actualToken)
    throw new StorageConflict(
      'Another tab changed this assessment. Reload its latest version before continuing.'
    )
  storage.setItem(storageKey, JSON.stringify({ token, assessment }))
  return token
}
