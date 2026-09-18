import { expect, test } from 'vitest'
import { JourneyFailure, providerFailure } from './failure'

test('failure reports distinguish evaluator validation from transport without exposing raw messages', () => {
  expect(
    providerFailure(
      'Jev',
      new Error('Provider score disagrees with distribution')
    ).message
  ).toBe('Jev: response validation.')
  const invalid = new Error('secret response body')
  invalid.name = 'ZodError'
  expect(providerFailure('Jev', invalid).message).toBe(
    'Jev: response validation.'
  )
  expect(
    providerFailure('Jev', new Error('sensitive transport details')).message
  ).toBe('Jev: provider or transport failure.')
  const transient = Object.assign(new Error('sensitive response body'), {
    status: 503
  })
  expect(providerFailure('Jev', transient).message).toBe(
    'Jev: provider or transport failure (HTTP 503).'
  )
  const budget = new JourneyFailure('Journey cost budget exhausted')
  expect(providerFailure('Jev', budget)).toBe(budget)
})
