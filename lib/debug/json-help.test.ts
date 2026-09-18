import { expect, test } from 'vitest'
import { jsonHelp, questionBrief } from './json-help'
import type { Question } from '@/lib/assessment/schema'
const question: Question = {
  type: 'choice',
  instructions:
    'Interpret the participant’s expected benefits. Keep harms separate. Do not reward jargon.',
  criteria: { stated: 'An explicit expectation is present.' }
}
test('response keys use the actual recorded question, not a new or guessed meaning', () => {
  expect(
    jsonHelp({
      property: 'benefits:status',
      path: '$.answers.benefits:status',
      value: {},
      context: { questions: { 'benefits:status': question } }
    })
  ).toBe('Interpret the participant’s expected benefits. Keep harms separate.')
  expect(questionBrief(question)).not.toContain('Do not reward')
  expect(
    jsonHelp({
      property: 'questionId',
      path: '$.judgments[0].questionId',
      parent: { question },
      value: 'benefits:status',
      context: {}
    })
  ).toBe(questionBrief(question))
})
test('authored alternatives and state dimensions have context without annotating user text', () => {
  expect(
    jsonHelp({
      property: 'stated',
      path: '$.answers.benefits:status.probabilities.stated',
      value: 0.9,
      question,
      context: {}
    })
  ).toBe(question.criteria.stated)
  expect(
    jsonHelp({
      property: 'capability_trajectory',
      path: '$.coverage.capability_trajectory',
      value: 'assessed',
      context: {
        dimensions: [
          {
            id: 'capability_trajectory',
            label: 'Timeline',
            meaning: 'Expected ceiling and timing. Distinct from conviction.'
          }
        ]
      }
    })
  ).toContain('Timeline: Expected ceiling and timing.')
  expect(
    jsonHelp({
      property: 'answer',
      path: '$.current.answer',
      value: 'non_answer',
      context: {}
    })
  ).toBeUndefined()
  expect(
    jsonHelp({
      property: 'noul',
      path: '$.answers.horizon.noul',
      value: 0.8,
      context: {}
    })
  ).toContain('probability that the proposition')
})

test('readiness help distinguishes percentages and derived presence confidence from component coordinates', () => {
  expect(
    jsonHelp({
      property: 'value',
      path: '$.evidenceReadiness.value',
      value: 60,
      context: {}
    })
  ).toContain('0–100 scale')
  expect(
    jsonHelp({
      property: 'confidence',
      path: '$.evidenceReadiness.dimensions[0].confidence',
      value: 0.9,
      context: {}
    })
  ).toContain('highest eligible presence confidence')
  expect(
    jsonHelp({
      property: 'value',
      path: '$.result.horizontal.value',
      value: 0.6,
      context: {}
    })
  ).toContain('normalized interpretation coordinate')
})
