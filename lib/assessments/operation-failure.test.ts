import { expect, test } from 'vitest'
import { englishTranslator } from '@/i18n/translators'
import {
  isBudgetFailure,
  operationFailureCategory,
  operationFailureMessage
} from './operation-failure'

test('historical evaluation failures explain a confirmed provider rejection', () => {
  const category = operationFailureCategory('evaluation_failed', [
    { stage: 'A: interpret', status: 403, attempt: 1 },
    { category: 'evaluation_failed' }
  ])
  expect(category).toBe('provider_rejected')
  expect(operationFailureMessage(englishTranslator(), category)).toContain(
    'TypeSafe (Jev)'
  )
})

test('a TypeSafe 402 reads as out of credits, including historical records', () => {
  const category = operationFailureCategory('evaluation_failed', [
    { stage: 'A: interpret', status: 402, attempt: 1 },
    { category: 'evaluation_failed' }
  ])
  expect(category).toBe('provider_out_of_credits')
  expect(isBudgetFailure(category)).toBe(true)
  expect(isBudgetFailure('budget_exhausted')).toBe(true)
  for (const other of ['evaluation_failed', 'provider_rejected', null])
    expect(isBudgetFailure(other)).toBe(false)
  // A stored budget category is already specific; diagnostics cannot change it.
  expect(operationFailureCategory('budget_exhausted', [{ status: 403 }])).toBe(
    'budget_exhausted'
  )
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
    expect(
      operationFailureMessage(englishTranslator(), 'private exception text')
    ).not.toMatch(/TypeSafe|private exception/)
  }
)
