import { expect, test } from 'vitest'
import {
  operationFailureCategory,
  operationFailureMessage
} from './operation-failure'

test('historical evaluation failures explain a confirmed provider rejection', () => {
  const category = operationFailureCategory('evaluation_failed', [
    { stage: 'A: interpret', status: 403, attempt: 1 },
    { category: 'evaluation_failed' }
  ])
  expect(category).toBe('provider_rejected')
  expect(operationFailureMessage(category)).toContain('TypeSafe (Jev)')
})

test('a previous provider failure does not override a later failure or application category', () => {
  expect(
    operationFailureCategory('evaluation_failed', [
      { status: 403 },
      { status: 503 }
    ])
  ).toBe('evaluation_failed')
  expect(operationFailureCategory('deadline', [{ status: 403 }])).toBe(
    'deadline'
  )
  expect(operationFailureCategory(null, [{ status: 403 }])).toBeNull()
})

test.each([null, {}, [], [null], [{ status: '403' }]])(
  'unknown diagnostics stay generic without attributing blame',
  (diagnostics) => {
    expect(operationFailureCategory('evaluation_failed', diagnostics)).toBe(
      'evaluation_failed'
    )
    expect(operationFailureMessage('private exception text')).not.toMatch(
      /TypeSafe|private exception/
    )
  }
)
