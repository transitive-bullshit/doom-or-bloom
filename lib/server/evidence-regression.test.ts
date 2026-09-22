import { expect, test } from 'vitest'
import { loadBundle } from '@/lib/content/loader'
import { createAssessment } from '@/lib/assessment/state'
import { evidenceReadiness } from '@/lib/assessment/readiness'
import { runAssessment } from './engine'
import { createFixtureProvider, fixtureAnswer } from './provider'
import type { Provider } from './provider'

test('live-style probability split between supported categories still creates evidence and readiness', async () => {
  const fixture = createFixtureProvider()
  const provider: Provider = {
    kind: 'fixture',
    async evaluate(...args) {
      const response = await fixture.evaluate(...args)
      for (const id of Object.keys(response.answers).filter((id) =>
        id.endsWith(':status')
      )) {
        response.answers[id] = {
          type: 'choice',
          choice: 'stated',
          confidence: 0.56,
          probabilities: {
            stated: 0.66,
            strongly_implied: 0.32,
            weakly_inferred: 0.02,
            unclear: 0,
            not_expressed: 0
          }
        }
      }
      return response
    }
  }
  const bundle = loadBundle()
  const result = await runAssessment(
    {
      debug: false,
      requestId: 'split-support',
      assessment: createAssessment('split-support'),
      operation: {
        type: 'answer',
        text: 'AI could accelerate medicine, but autonomous systems could create a serious risk of losing control.'
      }
    },
    provider,
    bundle
  )
  expect(result.assessment.coverage.risk_landscape).toBe('assessed')
  expect(evidenceReadiness(result.assessment).value).toBeCloseTo(98)
  const projected = await runAssessment(
    {
      debug: false,
      requestId: 'split-project',
      assessment: result.assessment,
      operation: { type: 'project' }
    },
    provider,
    bundle
  )
  expect(projected.assessment.result?.horizontal.value).not.toBeNull()
})

test('unplaceable positions do not erase understood evidence during projection', async () => {
  const fixture = createFixtureProvider()
  const provider: Provider = {
    kind: 'fixture',
    async evaluate(...args) {
      const response = await fixture.evaluate(...args)
      for (const [id, q] of Object.entries(args[1])) {
        if (id.endsWith(':position') || id.startsWith('facet:'))
          response.answers[id] = fixtureAnswer(q, 'explicitly_unknown')
      }
      return response
    }
  }
  const bundle = loadBundle()
  const answer = await runAssessment(
    {
      debug: false,
      requestId: 'unknown-answer',
      assessment: createAssessment('unknown-position'),
      operation: {
        type: 'answer',
        text: 'I do not know how feasible control is. I would want independent tests before trusting it.'
      }
    },
    provider,
    bundle
  )
  const before = evidenceReadiness(answer.assessment)
  const result = await runAssessment(
    {
      debug: false,
      requestId: 'unknown-project',
      assessment: answer.assessment,
      operation: { type: 'project' }
    },
    provider,
    bundle
  )
  expect(evidenceReadiness(result.assessment)).toEqual(before)
  expect(result.assessment.result?.horizontal.value).toBeNull()
  const catastrophe = result.assessment.result?.fingerprint.find(
    (component) => component.vector === 'catastrophic_risk'
  )
  expect(catastrophe?.value).toBeNull()
  expect(catastrophe?.claim).toBe(
    'You expressed uncertainty about the prospect of catastrophic or irreversible harm.'
  )
  expect(catastrophe?.evidenceIds.length).toBeGreaterThan(0)
  const clarification = await runAssessment(
    {
      debug: false,
      requestId: 'unknown-catastrophe-clarify',
      assessment: result.assessment,
      operation: {
        type: 'clarify',
        vector: 'risk_landscape',
        claim: 'catastrophic_risk'
      }
    },
    provider,
    bundle
  )
  expect(clarification.assessment.prompts.at(-1)?.claimTarget).toBe(
    'catastrophic_risk'
  )
})

test('a split score distribution cannot invent a categorical middle-level claim', async () => {
  const fixture = createFixtureProvider()
  const provider: Provider = {
    kind: 'fixture',
    async evaluate(...args) {
      const result = await fixture.evaluate(...args)
      const score = result.answers['beneficial_potential:score']
      if (score?.type === 'score')
        result.answers['beneficial_potential:score'] = {
          ...score,
          score: 1.5,
          confidence: 0.25,
          probabilities: { 0: 0.5, 1: 0, 2: 0, 3: 0.5 }
        }
      return result
    }
  }
  const bundle = loadBundle()
  const state = (
    await runAssessment(
      {
        debug: false,
        requestId: 'split-claim-answer',
        assessment: createAssessment('split-claim'),
        operation: {
          type: 'answer',
          text: 'The outcome depends on whether effective safeguards arrive.'
        }
      },
      provider,
      bundle
    )
  ).assessment
  const result = await runAssessment(
    {
      debug: false,
      requestId: 'split-claim-project',
      assessment: state,
      operation: { type: 'project' }
    },
    provider,
    bundle
  )
  const c = result.assessment.result!.components.find(
    (c) => c.vector === 'beneficial_potential'
  )!
  expect(c.value).toBe(0.5)
  expect(c.claim).not.toBe(
    bundle.rubric.dimensions.find((d) => d.id === 'beneficial_potential')!
      .levels[2]
  )
  expect(c.claim).toMatch(/uncertain|interpretations|readings/i)
})

test('a marginal assessable winner cannot turn explicit uncertainty into a directional claim', async () => {
  const fixture = createFixtureProvider()
  const provider: Provider = {
    kind: 'fixture',
    async evaluate(...args) {
      const result = await fixture.evaluate(...args)
      if (result.answers['technical_controllability:position'])
        result.answers['technical_controllability:position'] = {
          type: 'choice',
          choice: 'assessable',
          probabilities: {
            assessable: 0.51,
            explicitly_unknown: 0.49,
            not_expressed: 0
          },
          confidence: 0.27
        }
      return result
    }
  }
  const bundle = loadBundle()
  const state = (
    await runAssessment(
      {
        debug: false,
        requestId: 'marginal-answer',
        assessment: createAssessment('marginal'),
        operation: {
          type: 'answer',
          text: 'I do not know whether control will work. Independent tests would help me judge it.'
        }
      },
      provider,
      bundle
    )
  ).assessment
  const result = await runAssessment(
    {
      debug: false,
      requestId: 'marginal-project',
      assessment: state,
      operation: { type: 'project' }
    },
    provider,
    bundle
  )
  const c = result.assessment.result!.components.find(
    (c) => c.vector === 'technical_controllability'
  )!
  expect(c.value).toBeNull()
  expect(c.claim).toMatch(/uncertain|uncertainty|not yet/i)
})

for (const resolves of [true, false]) {
  test(`ordinary follow-up ${resolves ? 'resolves' : 'preserves'} a prior ambiguity according to the specific resolution judgment`, async () => {
    const fixture = createFixtureProvider()
    let answers = 0
    const provider: Provider = {
      kind: 'fixture',
      async evaluate(...args) {
        const result = await fixture.evaluate(...args)
        if (args[1].disposition) {
          answers++
          if (answers === 1)
            result.answers['beneficial_potential:status'] = fixtureAnswer(
              args[1]['beneficial_potential:status']!,
              'unclear'
            )
          if (args[1]['beneficial_potential:resolved'])
            result.answers['beneficial_potential:resolved'] = {
              type: 'noul',
              noul: resolves ? 0.95 : 0.05
            }
        }
        return result
      }
    }
    const bundle = loadBundle()
    let state = (
      await runAssessment(
        {
          debug: false,
          requestId: 'ambiguous',
          assessment: createAssessment(`ambiguity-${resolves}`),
          operation: {
            type: 'answer',
            text: 'I expect things to improve, but I mean something different by improvement.'
          }
        },
        provider,
        bundle
      )
    ).assessment
    expect(
      state.unresolved.some((u) => u.vector === 'beneficial_potential')
    ).toBe(true)
    state = (
      await runAssessment(
        {
          debug: false,
          requestId: 'clarifies',
          assessment: state,
          operation: {
            type: 'answer',
            text: 'By improvement I mean affordable, widely available treatments. I expect these benefits, not just greater capability.'
          }
        },
        provider,
        bundle
      )
    ).assessment
    expect(
      state.unresolved.some((u) => u.vector === 'beneficial_potential')
    ).toBe(!resolves)
  })
}

test('a weak later mention cannot erase still-active clear evidence', async () => {
  const fixture = createFixtureProvider()
  let answers = 0
  const provider: Provider = {
    kind: 'fixture',
    async evaluate(...args) {
      const result = await fixture.evaluate(...args)
      if (args[1].disposition && ++answers === 2)
        result.answers['beneficial_potential:status'] = fixtureAnswer(
          args[1]['beneficial_potential:status']!,
          'weakly_inferred'
        )
      return result
    }
  }
  const bundle = loadBundle()
  let state = (
    await runAssessment(
      {
        debug: false,
        requestId: 'clear',
        assessment: createAssessment('retain-support'),
        operation: {
          type: 'answer',
          text: 'I expect large medical benefits, including better treatment for common illnesses.'
        }
      },
      provider,
      bundle
    )
  ).assessment
  state = (
    await runAssessment(
      {
        debug: false,
        requestId: 'different-topic',
        assessment: state,
        operation: {
          type: 'answer',
          text: 'On institutions I expect a mixed response, with competition undermining voluntary restraint.'
        }
      },
      provider,
      bundle
    )
  ).assessment
  expect(state.coverage.beneficial_potential).toBe('assessed')
  expect(
    state.unresolved.some((u) => u.vector === 'beneficial_potential')
  ).toBe(false)
})

test('weak initial inference does not create an ambiguity that blocks a later explicit forecast', async () => {
  const bundle = loadBundle()
  const fixture = createFixtureProvider()
  let answers = 0
  const provider: Provider = {
    kind: 'fixture',
    async evaluate(...args) {
      const result = await fixture.evaluate(...args)
      if (args[1].disposition && ++answers === 1)
        result.answers['transition_dynamics:status'] = {
          type: 'choice',
          choice: 'weakly_inferred',
          confidence: 0.31,
          probabilities: {
            not_expressed: 0.29,
            unclear: 0.01,
            stated: 0.06,
            weakly_inferred: 0.44,
            strongly_implied: 0.2
          }
        }
      return result
    }
  }
  let state = (
    await runAssessment(
      {
        requestId: 'weak-opening',
        assessment: createAssessment('weak-transition'),
        operation: {
          type: 'answer',
          text: 'Useful tools, if people can check the results.'
        },
        debug: false
      },
      provider,
      bundle
    )
  ).assessment
  expect(state.unresolved.some((u) => u.vector === 'transition_dynamics')).toBe(
    false
  )
  expect(state.coverage.transition_dynamics).toBe('unassessed')
  state = (
    await runAssessment(
      {
        requestId: 'explicit-pace',
        assessment: state,
        operation: {
          type: 'answer',
          text: 'I expect gradual useful changes over the next decade.'
        },
        debug: false
      },
      provider,
      bundle
    )
  ).assessment
  expect(state.coverage.transition_dynamics).toBe('assessed')
  expect(state.unresolved.some((u) => u.vector === 'transition_dynamics')).toBe(
    false
  )
})

test('result evidence sends only selected experiment candidates and preserves the complete transcript', async () => {
  const fixture = createFixtureProvider()
  let inspected = false
  const provider: Provider = {
    kind: 'fixture',
    async evaluate(...args) {
      const [input, questions] = args
      const context = input as {
        completeParticipantEvidence?: Array<{ answer: string }>
        experimentCandidates?: Record<string, Record<string, unknown>>
        excerpts?: unknown
      }
      if (context.excerpts) {
        inspected = true
        const referenced = new Set(
          Object.values(questions).flatMap((q) =>
            [
              ...q.instructions.matchAll(
                /experimentCandidates\.(passages|probabilities)\.([\w]+)/g
              )
            ].map((match) => `${match[1]}.${match[2]}`)
          )
        )
        const supplied = Object.entries(context.experimentCandidates!).flatMap(
          ([pool, entries]) => Object.keys(entries).map((id) => `${pool}.${id}`)
        )
        expect(new Set(supplied)).toEqual(referenced)
        expect(context.completeParticipantEvidence?.[0]?.answer).toBe(text)
      }
      const response = await fixture.evaluate(...args)
      for (const [id, q] of Object.entries(questions)) {
        if (q.type === 'choice' && 'p0' in q.criteria)
          response.answers[id] = fixtureAnswer(q, 'p0')
      }
      return response
    }
  }
  const text =
    'AI could transform medicine. Independent evaluations could reveal control failures. I would update if safeguards worked reliably. Powerful systems may cause irreversible harm.'
  await runAssessment(
    {
      debug: false,
      requestId: 'compact-evidence',
      assessment: createAssessment('compact-evidence'),
      operation: { type: 'answer', text }
    },
    provider,
    loadBundle(),
    false,
    undefined,
    undefined,
    'persona'
  )
  expect(inspected).toBe(true)
})

test('runtime keeps full answers and core results without generating excerpt requests', async () => {
  const fixture = createFixtureProvider()
  const stages: string[] = []
  const text =
    'AI could transform medicine. Safeguards and independent evaluations matter. Catastrophe seems unlikely but possible.'
  const provider: Provider = {
    kind: 'fixture',
    async evaluate(...args) {
      const [input, questions] = args
      const context = input as Record<string, unknown>
      for (const key of [
        'excerpts',
        'experimentCandidates',
        'claimPairs',
        'excerptPolicy'
      ])
        expect(context).not.toHaveProperty(key)
      for (const id of Object.keys(questions)) {
        expect(id).not.toMatch(
          /:excerpt|:evidence|:verified|experiment:milestone|experiment:hinge|^tension/
        )
      }
      if (questions['experiment:influence']) {
        stages.push('projection')
        expect(JSON.stringify(context.completeParticipantEvidence)).toContain(
          text
        )
        expect(questions).toHaveProperty('experiment:transformation')
        expect(questions).toHaveProperty('experiment:pdoom:band')
      }
      return fixture.evaluate(...args)
    }
  }
  const response = await runAssessment(
    {
      requestId: 'runtime-without-excerpts',
      assessment: createAssessment('runtime-without-excerpts'),
      operation: { type: 'answer', text },
      debug: true
    },
    provider,
    loadBundle(),
    true
  )
  expect(stages).toEqual(['projection'])
  expect(response.debug!.stages.map((stage) => stage.name)).toEqual([
    'A: interpret',
    'D: projection',
    'C: route'
  ])
  const result = response.assessment.result!
  expect(result.experiment!.milestones).toEqual([])
  expect(result.experiment!.hinges).toEqual([])
  expect(
    result.components.every((component) => !component.reasoningEvidence)
  ).toBe(true)
  expect(result.horizontal.value).not.toBeNull()
  expect(result.experiment!.transformation.value).not.toBeNull()
})
