import { expect, test, vi } from 'vitest'
import { loadBundle } from '@/lib/content/loader'
import { assessmentSchema, limits } from '@/lib/assessment/schema'
import { createAssessment, currentPrompt } from '@/lib/assessment/state'
import { runAssessment } from './engine'
import { createFixtureProvider } from './provider'
import type { Provider } from './provider'
import { createLiveProvider } from './live-provider'
import type { Question } from '@/lib/assessment/schema'

test('ordinary five-answer interviews do not trigger large-history batching', async () => {
  const bundle = loadBundle()
  const fixture = createFixtureProvider()
  let state = createAssessment('ordinary-request-size')
  const text =
    'I expect useful tools, but reliability and oversight matter. '.repeat(15)
  vi.stubEnv('TYPESAFE_API_KEY', 'test-only')
  vi.stubGlobal('fetch', async (_url: unknown, init: RequestInit) => {
    if (typeof init.body !== 'string') throw new Error('Expected JSON request')
    const body = JSON.parse(init.body) as {
      model: string
      state: unknown
      questions: Record<string, Question>
    }
    const response = await fixture.evaluate(body.state, body.questions)
    return Response.json({ ...response, model: body.model })
  })
  try {
    for (let i = 0; i < 5; i++) {
      const result = await runAssessment(
        {
          assessment: state,
          requestId: `ordinary-${i}`,
          debug: true,
          operation: { type: 'answer', text }
        },
        createLiveProvider(state.versions.model),
        bundle,
        true
      )
      state = result.assessment
      const route = result.debug!.stages.find((s) => s.name === 'C: route')!
      expect(route).toBeDefined()
      expect(route.attempts).toBe(1)
      expect(route.state).toHaveProperty('evidenceSupport')
      expect(route.state).not.toHaveProperty('coverage')
      expect(route.state).not.toHaveProperty('coverageDefinitions')
      expect(JSON.stringify(route.state)).toContain(text)
    }
    const projected = await runAssessment(
      {
        assessment: state,
        requestId: 'ordinary-project',
        debug: true,
        operation: { type: 'project' }
      },
      createLiveProvider(state.versions.model),
      bundle,
      true
    )
    expect(projected.debug!.stages).toHaveLength(0)
    const result = projected.assessment.result!
    expect(result.fingerprint.map((c) => c.vector)).toEqual([
      'timeline',
      'beneficial_potential',
      'risk_landscape',
      'catastrophic_risk',
      'technical_controllability',
      'institutional_competence',
      'action_posture'
    ])
    for (const vector of ['risk_landscape', 'action_posture'])
      expect(result.fingerprint.find((c) => c.vector === vector)).toEqual(
        result.components.find((c) => c.vector === vector)
      )
    expect(assessmentSchema.safeParse(projected.assessment).success).toBe(true)
  } finally {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  }
})

test('long multibyte history with many unresolved dimensions fits the physical request budget', async () => {
  const bundle = loadBundle()
  const fixture = createFixtureProvider()
  const text = '長い回答にも完全な文脈を保持する。'.repeat(1000)
  expect(text.length).toBeLessThanOrEqual(limits.answerChars)
  const initial = await runAssessment(
    {
      assessment: createAssessment('long-unresolved'),
      requestId: 'long-first',
      debug: false,
      operation: { type: 'answer', text }
    },
    fixture,
    bundle
  )
  const state = initial.assessment
  state.familiarity.level = 'expert'
  state.unresolved = bundle.rubric.dimensions.map((d) => ({
    id: `${state.answers[0]!.id}:u:${d.id}`,
    vector: d.id,
    kind: 'ambiguity',
    evidenceIds: state.evidence
      .filter((e) => e.vector === d.id)
      .map((e) => e.id)
  }))
  let requests = 0
  vi.stubEnv('TYPESAFE_API_KEY', 'test-only')
  vi.stubGlobal('fetch', async (_url: unknown, init: RequestInit) => {
    requests++
    if (typeof init.body !== 'string') throw new Error('Expected JSON request')
    const body = JSON.parse(init.body) as {
      model: string
      state: unknown
      questions: Record<string, Question>
    }
    const response = await fixture.evaluate(body.state, body.questions)
    if (body.questions.familiarity)
      response.answers.familiarity = {
        type: 'choice',
        choice: 'expert',
        confidence: 1,
        probabilities: { unknown: 0, general: 0, expert: 1 }
      }
    return Response.json({ ...response, model: body.model })
  })
  try {
    const result = await runAssessment(
      {
        assessment: state,
        requestId: 'long-second',
        debug: true,
        operation: { type: 'answer', text }
      },
      createLiveProvider(state.versions.model),
      bundle,
      true
    )
    expect(result.assessment.answers).toHaveLength(2)
    expect(result.assessment.status).toBe('answering')
    expect(result.debug?.stages.map((s) => s.name)).toEqual([
      'A: interpret',
      'D: projection',
      'D: reasoning evidence',
      'C: route'
    ])
    expect(requests).toBeLessThanOrEqual(limits.providerAttempts)
    expect(requests).toBe(
      result.debug!.stages.reduce(
        (sum, stage) =>
          sum + Math.ceil(Object.keys(stage.questions).length / 8),
        0
      )
    )
    expect(
      Object.keys(result.debug!.stages[1]!.questions).length
    ).toBeLessThanOrEqual(limits.questions)
    expect(JSON.stringify(result.debug?.stages[1]?.state)).toContain(text)
  } finally {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  }
})

test('eight answers retain the complete transcript without corpus inference', async () => {
  const bundle = loadBundle()
  const provider = createFixtureProvider()
  let state = createAssessment('participant-only-path')
  let lastProjection: import('@/lib/assessment/schema').DebugStage | undefined
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
    lastProjection = result.debug!.stages.find(
      (stage) => stage.name === 'D: projection'
    )
    expect(state.answers.at(-1)).toMatchObject({
      text,
      promptText: prompt.text
    })
    expect(result.debug!.stages.map((stage) => stage.name)).toEqual([
      'A: interpret',
      'D: projection',
      'D: reasoning evidence',
      'C: route'
    ])
    expect(Object.keys(result.debug!.stages[0]!.questions)).toHaveLength(22)
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
  expect(result.debug!.stages).toHaveLength(0)
  const projection = lastProjection!
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
