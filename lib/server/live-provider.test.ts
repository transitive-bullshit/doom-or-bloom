import { expect, test } from 'vitest'
import { validateEvaluation } from './live-provider'
import { fixtureAnswer } from './provider'
import type { Question } from '@/lib/assessment/schema'
const question: Question = {
  type: 'choice',
  instructions: 'Classify',
  criteria: { a: null, none: null }
}
const raw = {
  model: 'jev-1.13.0',
  answers: { q: fixtureAnswer(question, 'a') },
  usage: { input_tokens: 1, output_tokens: 1 }
}
test('provider boundary validates options, primitives, distributions and missing answers', () => {
  expect(validateEvaluation(raw, { q: question }).model).toBe('jev-1.13.0')
  expect(() =>
    validateEvaluation({ ...raw, answers: {} }, { q: question })
  ).toThrow()
  expect(() =>
    validateEvaluation(
      { ...raw, answers: { q: { type: 'noul', noul: 0.5 } } },
      { q: question }
    )
  ).toThrow()
  expect(() =>
    validateEvaluation(
      {
        ...raw,
        answers: {
          q: {
            type: 'choice',
            choice: 'made-up',
            confidence: 1,
            probabilities: { a: 0, none: 1 }
          }
        }
      },
      { q: question }
    )
  ).toThrow()
  expect(() =>
    validateEvaluation(
      {
        ...raw,
        answers: {
          q: {
            type: 'choice',
            choice: 'a',
            confidence: 1,
            probabilities: { a: 0.8, none: 0.8 }
          }
        }
      },
      { q: question }
    )
  ).toThrow()
})
test('noul has no confidence field; ordered score must agree with distribution', () => {
  expect(
    validateEvaluation(
      { ...raw, answers: { q: { type: 'noul', noul: 0.4 } } },
      { q: { type: 'noul', instructions: 'Present?' } }
    ).answers.q
  ).toEqual({ type: 'noul', noul: 0.4 })
  const score: Question = {
    type: 'score',
    instructions: 'Rate',
    criteria: ['Low', 'High']
  }
  expect(() =>
    validateEvaluation(
      {
        ...raw,
        answers: { q: { ...fixtureAnswer(score, undefined, 1), score: 0 } }
      },
      { q: score }
    )
  ).toThrow()
})
