import { expect, test } from 'vitest'
import type { Question } from '@/lib/assessment/schema'
import { createClefProvider } from './clef-provider'
import { fixtureAnswer } from './provider'

type Body = {
  model: string
  state: unknown
  questions: Record<string, Question>
}

function fakeClef(bodies: Body[], model = 'clef') {
  return async <T>(_id: string, body: unknown) => {
    const request = body as Body
    bodies.push(request)
    return {
      output: {
        model,
        usage: { input_tokens: 100, output_tokens: 0 },
        answers: Object.fromEntries(
          Object.entries(request.questions).map(([id, q]) => [
            id,
            fixtureAnswer(q)
          ])
        )
      } as T,
      elapsedMs: 3,
      attempts: 1
    }
  }
}

test('question IDs are aliased for Clef and mapped back', async () => {
  const bodies: Body[] = []
  const provider = createClefProvider('clef', { run: fakeClef(bodies) })
  const questions: Record<string, Question> = {
    'risk_landscape:status': {
      type: 'noul',
      instructions: 'Is risk discussed?'
    },
    'facet:outlook_orientation': {
      type: 'choice',
      instructions: 'Which outlook?',
      criteria: { doom: 'Doom', bloom: 'Bloom' }
    }
  }
  const result = await provider.evaluate({ transcript: 'x' }, questions)
  expect(provider.model).toBe('clef')
  // Clef allows only [A-Za-z0-9_.-] in question IDs.
  for (const id of Object.keys(bodies[0]!.questions))
    expect(id).toMatch(/^[A-Za-z0-9_.-]+$/)
  expect(Object.keys(result.answers).sort()).toEqual(
    Object.keys(questions).sort()
  )
  expect(result.answers['facet:outlook_orientation']).toMatchObject({
    type: 'choice'
  })
})

test('requests hold at most 64 questions', async () => {
  const bodies: Body[] = []
  const provider = createClefProvider('clef', { run: fakeClef(bodies) })
  const questions = Object.fromEntries(
    Array.from({ length: 93 }, (_, i) => [
      `route:q${i}:gain`,
      { type: 'noul', instructions: `Q${i}?` } satisfies Question
    ])
  )
  const result = await provider.evaluate({ transcript: 'x' }, questions)
  expect(bodies.map((b) => Object.keys(b.questions).length)).toEqual([64, 29])
  expect(Object.keys(result.answers)).toHaveLength(93)
  expect(result.usage.input_tokens).toBe(200)
})

test('a different model version or a near-full context window fails the call', async () => {
  const questions: Record<string, Question> = {
    q: { type: 'noul', instructions: 'Q?' }
  }
  await expect(
    createClefProvider('clef', { run: fakeClef([], 'clef-flash') }).evaluate(
      {},
      questions
    )
  ).rejects.toThrow('Evaluation failed')
  const full = createClefProvider('clef', {
    run: async <T>() => ({
      // Clef truncates long state silently, so a near-full window is refused.
      output: {
        model: 'clef',
        usage: { input_tokens: 61_000, output_tokens: 0 },
        answers: { q0: { type: 'noul', noul: 0.5 } }
      } as T,
      elapsedMs: 1,
      attempts: 1
    })
  })
  await expect(full.evaluate({}, questions)).rejects.toThrow(
    'Evaluation failed'
  )
})
