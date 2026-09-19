import { expect, test } from 'vitest'
import { loadBundle } from '@/lib/content/loader'
import { createAssessment } from '@/lib/assessment/state'
import { createFixtureProvider } from './provider'
import type { Provider } from './provider'
import { runAssessment } from './engine'

test('a detailed first answer can finish automatically and voluntary exploration still issues a follow-up', async () => {
  const fixture = createFixtureProvider()
  const provider: Provider = {
    kind: 'fixture',
    async evaluate(state, questions) {
      const result = await fixture.evaluate(state, questions)
      for (const id of Object.keys(questions))
        if (id.endsWith(':novelty'))
          result.answers[id] = { type: 'noul', noul: 0.02 }
      return result
    }
  }
  const bundle = loadBundle()
  const response = await runAssessment(
    {
      assessment: createAssessment('early-complete'),
      requestId: 'first-answer',
      debug: true,
      operation: {
        type: 'answer',
        text: 'Useful AI is likely, with uneven gains and serious risks. My forecast depends on effective oversight.'
      }
    },
    provider,
    bundle,
    true
  )
  expect(response.assessment.answers).toHaveLength(1)
  expect(response.assessment.status).toBe('results')
  expect(response.assessment.result).not.toBeNull()
  expect(response.assessment.prompts).toHaveLength(1)
  const route = response.debug!.stages.find(
    (stage) => stage.name === 'C: route'
  )!
  expect(
    Object.keys(route.questions).some(
      (id) => id.endsWith(':ambiguity') || id.endsWith(':tension')
    )
  ).toBe(false)
  const continued = await runAssessment(
    {
      assessment: response.assessment,
      requestId: 'voluntary-follow-up',
      debug: false,
      operation: { type: 'continue' }
    },
    provider,
    bundle
  )
  expect(continued.assessment.status).toBe('answering')
  expect(continued.assessment.prompts).toHaveLength(2)
  expect(continued.assessment.answers).toHaveLength(1)
})

test('an incomplete short account is not stopped solely because no candidate clears the novelty threshold', async () => {
  const fixture = createFixtureProvider()
  const provider: Provider = {
    kind: 'fixture',
    async evaluate(state, questions) {
      const result = await fixture.evaluate(state, questions)
      for (const [id, question] of Object.entries(questions)) {
        if (id.endsWith(':novelty'))
          result.answers[id] = { type: 'noul', noul: 0.02 }
        if (id.endsWith(':status') && question.type === 'choice')
          result.answers[id] = {
            type: 'choice',
            choice: 'not_expressed',
            confidence: 1,
            probabilities: Object.fromEntries(
              Object.keys(question.criteria).map((key) => [
                key,
                key === 'not_expressed' ? 1 : 0
              ])
            )
          }
      }
      return result
    }
  }
  const response = await runAssessment(
    {
      assessment: createAssessment('brief-opening'),
      requestId: 'brief-answer',
      debug: false,
      operation: { type: 'answer', text: 'Probably useful.' }
    },
    provider,
    loadBundle()
  )
  expect(response.assessment.status).toBe('answering')
  expect(response.assessment.result).toBeNull()
})

test('an apparent within-answer contradiction prevents automatic completion even when its location is uncertain', async () => {
  const fixture = createFixtureProvider()
  const provider: Provider = {
    kind: 'fixture',
    async evaluate(state, questions) {
      const result = await fixture.evaluate(state, questions)
      if (questions.tension_present)
        result.answers.tension_present = { type: 'noul', noul: 0.92 }
      for (const id of Object.keys(questions))
        if (id.endsWith(':novelty'))
          result.answers[id] = { type: 'noul', noul: 0.02 }
      return result
    }
  }
  const response = await runAssessment(
    {
      assessment: createAssessment('conflicting-control'),
      requestId: 'conflicting-answer',
      debug: true,
      operation: {
        type: 'answer',
        text: 'The labs fully control every AI action, but nobody controls those same AI actions.'
      }
    },
    provider,
    loadBundle(),
    true
  )
  expect(response.assessment.status).toBe('answering')
  expect(response.assessment.unresolved).toEqual([
    expect.objectContaining({ vector: 'internal_coherence', kind: 'tension' })
  ])
  const route = response.debug!.stages.find(
    (stage) => stage.name === 'C: route'
  )!
  expect(Object.keys(route.questions)).toContain('scope.assumption:tension')
  expect(Object.keys(route.questions)).not.toContain('upside.general:tension')
})
