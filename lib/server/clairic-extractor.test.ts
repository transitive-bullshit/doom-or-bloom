import { expect, test } from 'vitest'
import {
  clairicFields,
  clairicState,
  createClairicExtractor,
  resolveQuote
} from './clairic-extractor'

const evidence = [
  {
    id: 'a1',
    prompt: 'What do you think AI means?',
    answer: 'First thought. I expect AGI by 2030, roughly. Last one!'
  },
  {
    id: 'a2',
    prompt: 'How likely is catastrophe?',
    answer: 'Maybe one in five.'
  }
]
const span = (text: string, needle: string) => {
  const start = text.indexOf(needle)
  return [start, start + needle.length]
}

test('state offsets locate each answer body, never its question', () => {
  const state = clairicState(evidence)
  for (const [i, body] of state.bodies.entries())
    expect(state.text.slice(body.start, body.end)).toBe(evidence[i]!.answer)
  expect(resolveQuote(state, span(state.text, 'What do you think'))).toBeNull()
  expect(resolveQuote(state, undefined)).toBeNull()
})

test('quotes widen a minimal span to its sentence; the stated token stays exact', () => {
  const state = clairicState(evidence)
  expect(resolveQuote(state, span(state.text, 'by 2030'))).toEqual({
    answerId: 'a1',
    answerNumber: 1,
    text: 'I expect AGI by 2030, roughly.'
  })
  expect(resolveQuote(state, span(state.text, 'one in five'), false)).toEqual({
    answerId: 'a2',
    answerNumber: 2,
    text: 'one in five'
  })
})

test('runtime extraction asks only for P(doom) and the shadow map readings', () => {
  expect(Object.keys(clairicFields('runtime')).sort()).toEqual([
    'map_outlook',
    'map_transformation',
    'pdoom_estimate',
    'pdoom_stated_token',
    'pdoom_stated_value'
  ])
  const persona = clairicFields('persona')
  expect(persona.milestone_agi_year).toMatchObject({
    type: 'number',
    null_threshold: 0.2
  })
  // A plain number field returned 0% for people who gave no number.
  expect(persona.pdoom_stated_value!.instructions).toContain('null, not zero')
})

test('the extractor resolves text spans, anchors dates and rejects truncation', async () => {
  const state = clairicState(evidence)
  const bodies: unknown[] = []
  const extractor = createClairicExtractor({
    run: async <T>(_model: string, body: unknown) => {
      bodies.push(body)
      return {
        output: {
          model: 'clairic',
          truncated: false,
          usage: { input_tokens: 120, passes: 2 },
          answers: {
            pdoom_stated_value: { type: 'number', value: 20, p_null: 0.01 },
            pdoom_stated_token: {
              type: 'text',
              value: 'one in five',
              span: span(state.text, 'one in five')
            },
            hinge_update: { type: 'text', value: null, p_null: 0.9 }
          }
        } as T,
        elapsedMs: 5,
        attempts: 1
      }
    }
  })
  expect(extractor.mode).toBe('complement')
  const extraction = await extractor.extract({
    mode: 'runtime',
    evidence,
    referenceDate: '2026-10-20'
  })
  expect(bodies[0]).toMatchObject({
    model: 'clairic',
    reference_date: '2026-10-20'
  })
  expect(extraction.quotes).toEqual({
    pdoom_stated_token: {
      answerId: 'a2',
      answerNumber: 2,
      text: 'one in five'
    },
    hinge_update: null
  })
  expect(extraction.usage).toEqual({ input_tokens: 120, passes: 2 })

  const truncating = createClairicExtractor({
    run: async <T>() => ({
      output: {
        model: 'clairic',
        truncated: true,
        usage: { input_tokens: 1 },
        answers: {}
      } as T,
      elapsedMs: 1,
      attempts: 1
    })
  })
  await expect(
    truncating.extract({ mode: 'runtime', evidence })
  ).rejects.toThrow('truncated')
})
