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
test('a deleted pending question keeps local history and can be skipped without inference', async () => {
  const noInference: Provider = {
    kind: 'fixture',
    evaluate: async () => {
      throw new Error('Deleted pending questions must not invoke the provider')
    }
  }
  const original = issuePrompt(createAssessment('deleted-pending'), {
    promptId: 'grounding.source',
    text: 'Where could someone check the evidence that matters most to your view?',
    family: 'grounding',
    variant: 'original',
    sourceEvidenceIds: []
  })
  original.draft = 'My complete draft is still here.'
  await expect(
    run(original, { type: 'answer', text: original.draft }, noInference)
  ).rejects.toThrow('This question is no longer available')
  expect(original.draft).toBe('My complete draft is still here.')
  const skipped = await run(original, { type: 'skip' }, noInference)
  expect(skipped.assessment.prompts.slice(0, 2)).toEqual(original.prompts)
  expect(
    loadBundle().prompts.some(
      (p) => p.id === currentPrompt(skipped.assessment).promptId
    )
  ).toBe(true)
  expect(skipped.assessment.prompts).toHaveLength(3)
})
test('answered deleted questions remain valid history while known question edits still fail', async () => {
  let state = createAssessment('deleted-history')
  for (let i = 0; i < 3; i++)
    state = (
      await run(state, {
        type: 'answer',
        text: 'AI may improve medicine, with uncertain timing.'
      })
    ).assessment
  const issued = state.prompts[1]!
  issued.promptId = 'a-deleted-local-question'
  issued.text = 'A previously issued local question.'
  const answer = state.answers.find((a) => a.promptInstanceId === issued.id)!
  answer.promptText = issued.text
  const projected = await run(state, { type: 'project' })
  expect(projected.assessment.answers).toEqual(state.answers)
  expect(projected.assessment.prompts).toEqual(state.prompts)
  expect(projected.assessment.result).not.toBeNull()
  const tampered = structuredClone(state)
  tampered.prompts[0]!.text = 'An edited known root.'
  await expect(run(tampered, { type: 'stop' })).rejects.toThrow(
    'Invalid prompt history'
  )
})
test('placeholders and an explicit paperclip request use bounded local recovery with no provider calls', async () => {
  const noInference: Provider = {
    kind: 'live',
    evaluate: async () => {
      throw new Error('No inference for exact workflow phrases')
    }
  }
  const original = createAssessment('paperclip-local')
  const first = await run(
    original,
    { type: 'answer', text: 'test' },
    noInference,
    true
  )
  expect(first.assessment.recovery.clearMisses).toBe(1)
  expect(first.assessment.status).toBe('recovery')
  const second = await run(
    first.assessment,
    { type: 'answer', text: 'Test again!' },
    noInference,
    true
  )
  expect(second.assessment.recovery).toMatchObject({
    evaluated: 2,
    clearMisses: 2,
    paperclipShown: true,
    paperclipActive: true
  })
  expect(second.debug?.stages).toEqual([])
  expect(second.assessment.answers).toEqual([])
  expect(second.assessment.evidence).toEqual([])
  const explicit = await run(
    original,
    { type: 'answer', text: 'show me paperclips' },
    noInference,
    true
  )
  expect(explicit.assessment.status).toBe('paused')
  expect(explicit.assessment.recovery.paperclipActive).toBe(true)
  const resumed = await run(second.assessment, { type: 'retry' }, noInference)
  const third = await run(
    resumed.assessment,
    { type: 'answer', text: 'show me paperclips' },
    noInference
  )
  expect(third.assessment.recovery).toMatchObject({
    evaluated: 3,
    paperclipShown: true,
    paperclipActive: false,
    reason: 'exhausted'
  })
  await expect(
    run(third.assessment, { type: 'answer', text: 'test' }, noInference)
  ).rejects.toThrow('Choose a recovery action')
})
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
  const historical = structuredClone(result.assessment)
  historical.versions.assessment = '0.2.1'
  historical.result!.versions.assessment = '0.2.1'
  const reused = await run(
    historical,
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
  expect(reused.assessment.result).toEqual(historical.result)
  expect(reused.assessment.versions.assessment).toBe('0.3.0')
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

test('rejected retries preserve an established profile and resuming does not reset the allowance', async () => {
  let state = createAssessment('established-recovery')
  for (let i = 0; i < 3; i++)
    state = (
      await run(state, { type: 'answer', text: 'A relevant synthetic view.' })
    ).assessment
  const before = structuredClone(state)
  let providerCalls = 0
  const rejection = nonAnswerProvider()
  const provider: Provider = {
    kind: 'fixture',
    evaluate: async (...args) => {
      providerCalls++
      return rejection.evaluate(...args)
    }
  }
  for (let i = 0; i < 2; i++)
    state = (
      await run(state, { type: 'answer', text: 'unrelated nonsense' }, provider)
    ).assessment
  expect(state.answers).toEqual(before.answers)
  expect(state.evidence).toEqual(before.evidence)
  expect(state.judgments).toEqual(before.judgments)
  expect(state.coverage).toEqual(before.coverage)
  expect(state.prompts).toEqual(before.prompts)
  expect(eligible(state)).toBe(true)
  state = (await run(state, { type: 'dismiss' }, provider)).assessment
  state = (await run(state, { type: 'retry' }, provider)).assessment
  expect(providerCalls).toBe(2)
  expect(state.recovery.evaluated).toBe(2)
  state = (
    await run(state, {
      type: 'answer',
      text: 'Uncertain, but I expect useful tools and difficult transitions.'
    })
  ).assessment
  expect(state.answers).toHaveLength(4)
  expect(state.recovery.paperclipShown).toBe(true)
  expect(state.recovery.paperclipActive).toBe(false)
  expect(state.recovery.clearMisses).toBe(0)
  expect(
    state.attempts.filter(
      (attempt) =>
        attempt.promptInstanceId === before.prompts.at(-1)?.id &&
        attempt.evaluated
    )
  ).toHaveLength(3)
})
test('dependent stages share the remaining physical request budget', async () => {
  const fixture = createFixtureProvider()
  const budgets: Array<number | undefined> = []
  const provider: Provider = {
    kind: 'fixture',
    evaluate: async (input, questions, signal, budget) => {
      budgets.push(budget)
      const result = await fixture.evaluate(input, questions, signal)
      return { ...result, attempts: budgets.length === 1 ? 12 : 4 }
    }
  }
  const result = await run(
    createAssessment('budget'),
    {
      type: 'answer',
      text: 'I expect useful tools, with uncertain long-term effects.'
    },
    provider,
    true
  )
  expect(budgets).toEqual([16, 4])
  expect(
    result.debug?.stages.reduce((sum, stage) => sum + stage.attempts, 0)
  ).toBe(16)
  expect(result.assessment.answers).toHaveLength(1)
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
  for (let i = 1; i < 12; i++) state = issuePrompt(state, prompt)
  state = (
    await run(state, { type: 'answer', text: 'banana' }, nonAnswerProvider())
  ).assessment
  expect(state.status).toBe('capped')
  expect(state.result?.horizontal.value).toBeNull()
  expect(state.result?.insufficient).toBe(true)
})
test('unknown worldview positions and ordinary harm cannot fabricate catastrophic risk', async () => {
  const fixture = createFixtureProvider()
  const provider: Provider = {
    kind: 'fixture',
    evaluate: async (input, questions, signal) => {
      const result = await fixture.evaluate(input, questions, signal)
      for (const id of [
        'capability_trajectory:position',
        'risk_landscape:position',
        'catastrophic_risk:position'
      ])
        if (questions[id])
          result.answers[id] = fixtureAnswer(
            questions[id]!,
            'explicitly_unknown'
          )
      return result
    }
  }
  let state = createAssessment('unknown-worldview')
  for (let i = 0; i < 3; i++)
    state = (
      await run(
        state,
        {
          type: 'answer',
          text: 'AI may help with paperwork; I cannot forecast catastrophic harm or a date.'
        },
        provider
      )
    ).assessment
  state = (await run(state, { type: 'project' }, provider)).assessment
  expect(
    state.result?.components.find((c) => c.vector === 'risk_landscape')?.value
  ).toBeNull()
  expect(
    state.result?.fingerprint.find((c) => c.vector === 'catastrophic_risk')
      ?.claim
  ).toBeNull()
  expect(
    state.result?.fingerprint.find((c) => c.vector === 'timeline')?.claim
  ).toBeNull()
  expect(state.result?.vertical.value).toBeGreaterThan(0)
  expect(state.coverage.risk_landscape).toBe('unassessed')
})

test('shared text occurs once per stage and judgments use answer-level support without passage selection', async () => {
  const text =
    'UNIQUE_ANSWER_MARKER: useful science, uncertain outcomes. '.repeat(50)
  const state = createAssessment('shared-context')
  const result = await run(
    state,
    { type: 'answer', text },
    createFixtureProvider(),
    true
  )
  const interpretation = result.debug!.stages[0]!
  expect(Object.keys(interpretation.questions)).toHaveLength(21)
  expect(interpretation.state).toEqual({
    current: {
      id: result.assessment.answers[0]!.id,
      prompt: state.prompts[0]!.text,
      answer: text
    },
    usableHistory: [],
    clarificationTarget: null
  })
  for (const stage of result.debug!.stages) {
    expect(JSON.stringify(stage.state).split(text)).toHaveLength(2)
    expect(JSON.stringify(stage.questions)).not.toContain(text)
    expect(
      Object.keys(stage.questions).some((id) =>
        [
          'grounding.source:',
          'tension.general:',
          'control.failuremode:',
          'crux.test:'
        ].some((prefix) => id.startsWith(prefix))
      )
    ).toBe(false)
    expect(
      Object.keys(stage.questions).some((id) => /:span$|:evidence$/.test(id))
    ).toBe(false)
  }
  expect(
    result.assessment.evidence.every(
      (entry) => entry.answerId === result.assessment.answers[0]!.id
    )
  ).toBe(true)
  expect(JSON.stringify(result.assessment.evidence)).not.toMatch(/span|excerpt/)
  let ready = result.assessment
  for (let i = 0; i < 2; i++)
    ready = (
      await run(ready, { type: 'answer', text: `Distinct answer ${i}.` })
    ).assessment
  const projected = await run(
    ready,
    { type: 'project' },
    createFixtureProvider(),
    true
  )
  const stage = projected.debug!.stages[0]!
  expect(Object.keys(stage.questions)).toHaveLength(41)
  expect(JSON.stringify(stage.state).split(text)).toHaveLength(2)
  expect(JSON.stringify(stage.questions)).not.toContain(text)
  expect(
    Object.keys(stage.questions).some((id) => id.endsWith(':evidence'))
  ).toBe(false)
})
