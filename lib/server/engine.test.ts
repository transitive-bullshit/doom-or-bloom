import { expect, test } from 'vitest'
import { runAssessment } from './engine'
import { createFixtureProvider, fixtureAnswer } from './provider'
import type { Provider } from './provider'
import { loadBundle } from '@/lib/content/loader'
import {
  createAssessment,
  currentPrompt,
  eligible,
  issuePrompt
} from '@/lib/assessment/state'
import { assessmentSchema } from '@/lib/assessment/schema'
import type { Assessment, Operation } from '@/lib/assessment/schema'
let seq = 0
async function run(
  state: Assessment,
  operation: Operation,
  provider = createFixtureProvider(),
  debug = false
) {
  return runAssessment(
    { requestId: `r${++seq}`, assessment: state, operation, debug },
    provider,
    loadBundle(),
    true
  )
}
function nonAnswerProvider(disposition = 'non_answer'): Provider {
  const fixture = createFixtureProvider()
  return {
    kind: 'fixture',
    evaluate: async (state, questions, signal) => {
      const result = await fixture.evaluate(state, questions, signal)
      if (questions.disposition)
        result.answers.disposition = fixtureAnswer(
          questions.disposition,
          disposition
        )
      return result
    }
  }
}
test('three-answer path, reusable results and debug parity', async () => {
  let state = createAssessment('fixture')
  for (let i = 0; i < 3; i++)
    state = (
      await run(state, {
        type: 'answer',
        text: 'AI could help people, with safeguards.'
      })
    ).assessment
  expect(eligible(state)).toBe(true)
  const result = await run(
    state,
    { type: 'project' },
    createFixtureProvider(),
    true
  )
  expect(result.assessment.result?.insufficient).toBe(false)
  expect(assessmentSchema.safeParse(result.assessment).success).toBe(true)
  const reused = await run(
    result.assessment,
    { type: 'project' },
    {
      kind: 'fixture',
      evaluate: async () => {
        throw new Error('must reuse result')
      }
    },
    true
  )
  expect(reused.debug?.stages).toHaveLength(0)
  const request = {
    requestId: 'same',
    assessment: state,
    operation: { type: 'project' as const },
    debug: false
  }
  const a = await runAssessment(
    request,
    createFixtureProvider(),
    loadBundle(),
    true
  )
  const b = await runAssessment(
    { ...request, debug: true },
    createFixtureProvider(),
    loadBundle(),
    true
  )
  expect(a.assessment).toEqual(b.assessment)
  expect(a.debug).toBeUndefined()
})
test('nonsense short circuits all later stages and preserves scores', async () => {
  const provider = nonAnswerProvider()
  let state = createAssessment('nonsense')
  const first = await run(
    state,
    { type: 'answer', text: 'banana!' },
    provider,
    true
  )
  expect(first.debug?.stages).toHaveLength(1)
  expect(first.assessment.judgments).toHaveLength(0)
  expect(first.assessment.evidence).toHaveLength(0)
  state = (
    await run(
      first.assessment,
      { type: 'answer', text: 'banana again!' },
      provider
    )
  ).assessment
  expect(state.recovery.paperclipShown).toBe(true)
  expect(state.status).toBe('paused')
  expect(currentPrompt(state).ordinal).toBe(1)
  state = (await run(state, { type: 'retry' })).assessment
  state = (await run(state, { type: 'answer', text: 'third banana' }, provider))
    .assessment
  expect(state.recovery.evaluated).toBe(3)
  await expect(run(state, { type: 'retry' })).rejects.toThrow('different')
})
test('repeated ambiguity exhausts neutrally, successful retry resumes', async () => {
  let state = createAssessment('unclear')
  for (let i = 0; i < 3; i++)
    state = (
      await run(
        state,
        { type: 'answer', text: 'Maybe?' },
        nonAnswerProvider('needs_clarification')
      )
    ).assessment
  expect(state.status).toBe('paused')
  expect(state.recovery.paperclipShown).toBe(false)
  const skipped = (await run(state, { type: 'skip' })).assessment
  expect(skipped.prompts).toHaveLength(2)
  expect(skipped.recovery.evaluated).toBe(0)
  const recovered = (
    await run(skipped, {
      type: 'answer',
      text: "I don't know what AI will bring."
    })
  ).assessment
  expect(recovered.answers).toHaveLength(1)
})
test('cap takes precedence and insufficient evidence has no invented coordinates', async () => {
  let state = createAssessment('cap')
  const prompt = {
    promptId: 'timeline.general',
    text: loadBundle().prompts.find((p) => p.id === 'timeline.general')!.text,
    family: 'timeline',
    variant: 'original',
    sourceEvidenceIds: []
  }
  for (let i = 1; i < 50; i++) state = issuePrompt(state, prompt)
  state = (
    await run(state, { type: 'answer', text: 'banana' }, nonAnswerProvider())
  ).assessment
  expect(state.status).toBe('capped')
  expect(state.result?.horizontal.value).toBeNull()
  expect(state.result?.insufficient).toBe(true)
})
