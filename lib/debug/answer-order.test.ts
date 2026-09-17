import { expect, test } from 'vitest'
import { containsJevAnswers, orderAnswerEntries } from './answer-order'

const answers = {
  uncertain: {
    type: 'choice',
    confidence: 0.2,
    probabilities: { b: 0.8, a: 0.2 }
  },
  unknown: { type: 'noul', noul: 0.99 },
  certain: { type: 'score', confidence: 0.9 },
  tied: { type: 'choice', confidence: 0.9 },
  zero: { type: 'score', confidence: 0 }
}
test('confidence orders preserve ties, handle zero and leave answers without confidence last', () => {
  const keys = (order: 'default' | 'high' | 'low') =>
    orderAnswerEntries(answers, order).map(([key]) => key)
  expect(keys('default')).toEqual([
    'uncertain',
    'unknown',
    'certain',
    'tied',
    'zero'
  ])
  expect(keys('high')).toEqual([
    'certain',
    'tied',
    'uncertain',
    'zero',
    'unknown'
  ])
  expect(keys('low')).toEqual([
    'zero',
    'uncertain',
    'certain',
    'tied',
    'unknown'
  ])
})
test('display ordering never mutates the payload or distributions', () => {
  const original = JSON.stringify(answers)
  orderAnswerEntries(Object.freeze(answers), 'high')
  expect(JSON.stringify(answers)).toBe(original)
  expect(Object.keys(answers.uncertain.probabilities)).toEqual(['b', 'a'])
})
test('only typed Jev answer records enable sorting, including nested and all-noul responses', () => {
  expect(containsJevAnswers({ answers })).toBe(true)
  expect(containsJevAnswers({ stages: [{ response: { answers } }] })).toBe(true)
  expect(
    containsJevAnswers({ answers: { horizon: { type: 'noul', noul: 0.6 } } })
  ).toBe(true)
  expect(
    containsJevAnswers({
      answers: [{ text: 'A participant answer', confidence: 0.8 }]
    })
  ).toBe(false)
  expect(
    containsJevAnswers({
      answers: { participant: { text: 'An answer', confidence: 0.9 } }
    })
  ).toBe(false)
  expect(containsJevAnswers({ answers: {} })).toBe(false)
  const cyclic: Record<string, unknown> = {}
  cyclic.self = cyclic
  expect(containsJevAnswers(cyclic)).toBe(false)
})
