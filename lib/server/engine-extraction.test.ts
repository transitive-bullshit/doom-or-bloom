import { expect, test } from 'vitest'
import { loadBundle } from '@/lib/content/loader'
import { createAssessment } from '@/lib/assessment/state'
import type { Assessment } from '@/lib/assessment/schema'
import { runAssessment } from './engine'
import { clairicState, resolveQuote } from './clairic-extractor'
import { createFixtureProvider } from './provider'
import type { Extraction, Extractor, Provider } from './provider'

const bundle = loadBundle()

async function answered(text: string) {
  let state: Assessment = createAssessment(`extraction-${text.length}`)
  for (let i = 0; i < 5; i++)
    state = (
      await runAssessment(
        {
          assessment: state,
          requestId: `answer-${i}`,
          debug: false,
          operation: { type: 'answer', text }
        },
        createFixtureProvider(),
        bundle
      )
    ).assessment
  return state
}

// A Clairic stand-in that "finds" the given expression and value.
function extractor(token: string, value: number, calls: string[]): Extractor {
  return {
    mode: 'complement',
    async extract(request): Promise<Extraction> {
      calls.push(request.mode)
      const state = clairicState(request.evidence)
      const start = state.text.lastIndexOf(token)
      return {
        model: 'clairic',
        answers: {
          pdoom_stated_value: { type: 'number', value, p_null: 0.01 },
          pdoom_stated_token: {
            type: 'text',
            value: token,
            span: [start, start + token.length]
          }
        },
        quotes: {
          pdoom_stated_token: resolveQuote(
            state,
            [start, start + token.length],
            false
          )
        },
        usage: { input_tokens: 10, passes: 1 },
        elapsedMs: 1,
        attempts: 1
      }
    }
  }
}

async function project(state: Assessment, provider: Provider) {
  return runAssessment(
    {
      assessment: state,
      requestId: 'project',
      debug: true,
      operation: { type: 'project' }
    },
    provider,
    bundle,
    true
  )
}

test('a complement fills a stated P(doom) in words, verified by the decision model', async () => {
  const text =
    'I expect useful tools, but oversight matters. Maybe a one in five chance this goes catastrophically wrong.'
  const calls: string[] = []
  const { assessment, debug } = await project(await answered(text), {
    ...createFixtureProvider(),
    extractor: extractor('one in five', 20, calls)
  })
  expect(calls).toEqual(['runtime'])
  const stages = debug!.stages.map((s) => s.name)
  expect(stages).toContain('D: extraction')
  const evidence = debug!.stages.find((s) => s.name === 'D: result evidence')!
  expect(Object.keys(evidence.questions)).toContain('experiment:pdoom:verified')
  const pdoom = assessment.result!.experiment!.pdoom!
  expect(pdoom).toMatchObject({ source: 'stated', token: '20%', estimate: 0.2 })
  expect(pdoom.text).toBe(
    'Maybe a one in five chance this goes catastrophically wrong.'
  )
  expect(assessment.judgments.some((j) => j.model === 'clairic')).toBe(true)
})

test("a complement leaves the decision model's own stated selection alone", async () => {
  const text =
    'I expect useful tools, but oversight matters. My P(doom) is about 30%.'
  const fixture = createFixtureProvider()
  // The decision model selects the typed percentage itself.
  const provider: Provider = {
    ...fixture,
    async evaluate(state, questions, ...rest) {
      const result = await fixture.evaluate(state, questions, ...rest)
      const pick = questions['experiment:pdoom']
      if (pick?.type === 'choice') {
        const id = Object.keys(pick.criteria).find((k) => k !== 'none')!
        result.answers['experiment:pdoom'] = {
          type: 'choice',
          choice: id,
          confidence: 1,
          probabilities: Object.fromEntries(
            Object.keys(pick.criteria).map((k) => [k, k === id ? 1 : 0])
          )
        }
      }
      return result
    },
    extractor: extractor('30%', 99, [])
  }
  const { assessment } = await project(await answered(text), provider)
  const pdoom = assessment.result!.experiment!.pdoom!
  expect(pdoom).toMatchObject({ source: 'stated', token: 'about 30%' })
  expect(assessment.judgments.some((j) => j.model === 'clairic')).toBe(false)
})

test('without an extractor the result stage makes no extraction call', async () => {
  const { debug } = await project(
    await answered('I expect useful tools, but oversight matters.'),
    createFixtureProvider()
  )
  expect(debug!.stages.map((s) => s.name)).not.toContain('D: extraction')
})
