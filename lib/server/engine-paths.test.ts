import { expect, test } from 'vitest'
import { loadBundle } from '@/lib/content/loader'
import { assessmentSchema, limits } from '@/lib/assessment/schema'
import { createAssessment, currentPrompt } from '@/lib/assessment/state'
import { runAssessment } from './engine'
import { createFixtureProvider } from './provider'
import type { Provider } from './provider'

test('eight answers retain the complete transcript without corpus inference', async () => {
  const bundle = loadBundle()
  const provider = createFixtureProvider()
  let state = createAssessment('participant-only-path')
  for (let i = 0; i < 8; i++) {
    const prompt = currentPrompt(state)
    const reference = bundle.references[i]!
    const text =
      `Answer ${i + 1}: I am considering ${reference.aliases[0]}.\n` +
      `Distinct original reasoning ${i + 1}. `.repeat(120) +
      `Complete final sentence ${i + 1}.`
    const result = await runAssessment(
      {
        requestId: `participant-only-${i}`,
        assessment: state,
        operation: { type: 'answer', text },
        debug: true
      },
      provider,
      bundle,
      true
    )
    state = result.assessment
    expect(state.answers.at(-1)).toMatchObject({
      text,
      promptText: prompt.text
    })
    expect(result.debug!.stages.map((stage) => stage.name)).toEqual([
      'A: interpret',
      'C: route'
    ])
    expect(Object.keys(result.debug!.stages[0]!.questions)).toHaveLength(21)
    expect(state.referenceClaims).toEqual([])
    expect(
      state.evidence.every((entry) => entry.referenceIds.length === 0)
    ).toBe(true)
    expect(state.unresolved.every((item) => item.kind !== 'reference')).toBe(
      true
    )
    for (const stage of result.debug!.stages) {
      expect(Object.keys(stage.questions).length).toBeLessThanOrEqual(
        limits.questions
      )
      for (const item of bundle.references)
        expect(JSON.stringify(stage.state)).not.toContain(item.summary)
    }
    expect(assessmentSchema.safeParse(state).success).toBe(true)
  }
  const result = await runAssessment(
    {
      requestId: 'participant-only-project',
      assessment: state,
      operation: { type: 'project' },
      debug: true
    },
    provider,
    bundle,
    true
  )
  const projection = result.debug!.stages[0]!
  expect(projection.name).toBe('D: projection')
  expect(projection.state).toEqual(
    expect.objectContaining({
      completeParticipantEvidence: state.answers.map((answer) => ({
        id: answer.id,
        prompt: answer.promptText,
        answer: answer.text,
        correctionTarget: null
      }))
    })
  )
  expect(projection.state).not.toHaveProperty('referenceContext')
  expect(result.assessment.result?.sources).toEqual([])
  expect(result.assessment.result?.insufficient).toBe(false)
})

test('twelve sequential usable answers force a final result and stop further inference', async () => {
  const bundle = loadBundle()
  const fixture = createFixtureProvider()
  let calls = 0
  const provider: Provider = {
    kind: 'fixture',
    evaluate: async (...args) => {
      calls++
      return fixture.evaluate(...args)
    }
  }
  let state = createAssessment('sequential-cap')
  for (let i = 0; i < limits.prompts; i++) {
    expect(currentPrompt(state).ordinal).toBe(i + 1)
    state = (
      await runAssessment(
        {
          requestId: `sequential-cap-${i}`,
          assessment: state,
          operation: {
            type: 'answer',
            text: `Synthetic accepted answer ${i + 1}: useful tools and uncertain transitions.`
          },
          debug: false
        },
        provider,
        bundle
      )
    ).assessment
  }
  expect(state.answers).toHaveLength(limits.prompts)
  expect(state.prompts).toHaveLength(limits.prompts)
  expect(state.status).toBe('capped')
  expect(state.result?.capped).toBe(true)
  expect(state.result?.insufficient).toBe(false)
  const before = calls
  await expect(
    runAssessment(
      {
        requestId: 'past-sequential-cap',
        assessment: state,
        operation: { type: 'continue' },
        debug: false
      },
      provider,
      bundle
    )
  ).rejects.toThrow('Restart')
  expect(calls).toBe(before)
  expect(assessmentSchema.safeParse(state).success).toBe(true)
})

for (const contentVersion of ['0.2.0-draft', '0.3.0-draft']) {
  test(`saved ${contentVersion} assessment resumes with its own corpus and result version`, async () => {
    const bundle = loadBundle(contentVersion)
    const provider = createFixtureProvider()
    let state = createAssessment('pinned-corpus')
    state.versions.content = contentVersion
    for (let i = 0; i < 3; i++)
      state = (
        await runAssessment(
          {
            requestId: `pinned-corpus-${i}`,
            assessment: state,
            operation: {
              type: 'answer',
              text: `Preserved earlier-version answer ${i}.`
            },
            debug: false
          },
          provider,
          loadBundle(state.versions.content)
        )
      ).assessment
    state = (
      await runAssessment(
        {
          requestId: 'pinned-corpus-result',
          assessment: state,
          operation: { type: 'project' },
          debug: false
        },
        provider,
        bundle
      )
    ).assessment
    expect(state.versions.content).toBe(contentVersion)
    expect(state.result?.versions.content).toBe(contentVersion)
    expect(state.answers[0]?.text).toBe('Preserved earlier-version answer 0.')
    expect(state.result?.insufficient).toBe(false)
  })
}
