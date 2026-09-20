import { expect, test } from 'vitest'
import { createAssessment } from './state'
import { candidatePrompts, rankCandidates } from './routing'
import { loadBundle } from '@/lib/content/loader'
import { fixtureAnswer } from '@/lib/server/provider'
import { timelineContext, timelineUnknown } from './timeline'

test('later timing uncertainty supersedes a prior date for both the fingerprint and routing', () => {
  const state = createAssessment('revised-timing')
  const answer = {
    promptInstanceId: state.prompts[0]!.id,
    promptText: state.prompts[0]!.text,
    substantive: true,
    hasConviction: false
  }
  state.answers.push(
    { ...answer, id: 'early', text: 'Within ten years.', hasHorizon: true },
    {
      ...answer,
      id: 'later',
      text: 'Actually I cannot place a date on that.',
      hasHorizon: false,
      hasUnknownHorizon: true
    }
  )
  expect(timelineUnknown(state)).toBe(true)
  expect(timelineContext(state)).toBeNull()
  expect(
    candidatePrompts(state, loadBundle().prompts).find(
      (c) => c.prompt.id === 'conviction.general'
    )?.reason
  ).toBe('timing premise not established')
  state.answers.push({
    ...answer,
    id: 'latest',
    text: 'My new estimate is twenty years.',
    hasHorizon: true
  })
  expect(timelineUnknown(state)).toBe(false)
  expect(timelineContext(state)?.id).toBe('latest')
})

test('familiarity gates specialist wording without forcing an early timing question', () => {
  const bundle = loadBundle()
  const state = createAssessment('routing')
  state.coverage.causal_clarity = 'assessed'
  state.coverage.capability_trajectory = 'assessed'
  const candidates = candidatePrompts(state, bundle.prompts)
  expect(
    candidates.find((c) => c.prompt.id === 'mechanism.chain')?.reason
  ).toContain('familiarity')
  expect(
    candidates.find((c) => c.prompt.id === 'timeline.general')?.missing
  ).toBe(1)
  const answers = Object.fromEntries(
    ['timeline.general', 'concrete.general'].flatMap((id) =>
      ['coverage', 'ambiguity', 'tension', 'projection'].map((benefit) => [
        `${id}:${benefit}`,
        fixtureAnswer(
          {
            type: 'score',
            instructions: 'Equal utility',
            criteria: ['0', '1', '2', '3']
          },
          undefined,
          1
        )
      ])
    )
  )
  expect(
    rankCandidates(state, bundle.prompts, answers, bundle.rubric)[0]?.prompt.id
  ).toBe('concrete.general')
  state.familiarity.level = 'expert'
  expect(
    candidatePrompts(state, bundle.prompts).find(
      (c) => c.prompt.id === 'mechanism.chain'
    )?.reason
  ).toBeNull()
})

test('deleted questions are absent for every saved corpus and confidence questions require a timing premise', () => {
  const removed = [
    'grounding.source',
    'tension.general',
    'control.failuremode',
    'crux.test'
  ]
  for (const version of ['0.2.0-draft', '0.3.0-draft', '0.4.0-draft']) {
    const bundle = loadBundle(version)
    const state = createAssessment(`policy-${version}`)
    state.familiarity.level = 'expert'
    for (const vector of Object.keys(state.coverage))
      state.coverage[vector as keyof typeof state.coverage] = 'assessed'
    const candidates = candidatePrompts(state, bundle.prompts)
    expect(bundle.prompts).toHaveLength(36)
    for (const id of removed) {
      expect(bundle.prompts.some((prompt) => prompt.id === id)).toBe(false)
      expect(candidates.some((candidate) => candidate.prompt.id === id)).toBe(
        false
      )
    }
    expect(
      candidates.find(
        (candidate) => candidate.prompt.id === 'conviction.general'
      )?.reason
    ).toBe('timing premise not established')
    state.answers.push({
      id: 'timing-answer',
      promptInstanceId: state.prompts[0]!.id,
      promptText: state.prompts[0]!.text,
      text: 'I expect this within ten years.',
      substantive: true,
      hasHorizon: true,
      hasConviction: false
    })
    const timing = candidatePrompts(state, bundle.prompts).find(
      (candidate) => candidate.prompt.id === 'conviction.general'
    )!
    expect(timing.reason).toBeNull()
    expect(timing.missing).toBe(1)
  }
})

test('explicitly unknown timing is explored evidence, not an invitation to repeat the date question', () => {
  const state = createAssessment('unknown-timing')
  state.answers.push({
    id: 'a',
    promptInstanceId: state.prompts[0]!.id,
    promptText: state.prompts[0]!.text,
    text: 'I do not know when major change would happen.',
    substantive: true,
    hasHorizon: false,
    hasConviction: false,
    hasUnknownHorizon: true
  })
  const candidates = candidatePrompts(state, loadBundle().prompts)
  expect(
    candidates.find((c) => c.prompt.id === 'timeline.general')?.reason
  ).toBe('timing already addressed')
  expect(
    candidates.find((c) => c.prompt.id === 'timeline.milestone')?.calibration
  ).toBe(0)
})

test('control tests and control mechanisms share the repetition cost without becoming ineligible', () => {
  for (const version of ['0.2.0-draft', '0.3.0-draft', '0.4.0-draft']) {
    const bundle = loadBundle(version)
    for (const previous of ['control.test', 'control.general']) {
      const state = createAssessment(`overlap-${previous}`)
      const prompt = bundle.prompts.find((p) => p.id === previous)!
      state.prompts.push({
        ...state.prompts[0]!,
        id: 'p2',
        ordinal: 2,
        promptId: prompt.id,
        text: prompt.text,
        family: prompt.family
      })
      const other =
        previous === 'control.test' ? 'control.general' : 'control.test'
      const candidate = candidatePrompts(state, bundle.prompts).find(
        (c) => c.prompt.id === other
      )!
      expect(candidate.reason).toBeNull()
      expect(candidate.repetition).toBe(1)
    }
  }
})

test('routing bonuses require a matching unresolved issue rather than nonzero model noise', () => {
  const bundle = loadBundle()
  const state = createAssessment('actual-issue')
  const id = 'risk.general'
  const answers = Object.fromEntries(
    ['coverage', 'ambiguity', 'tension', 'projection'].map((benefit) => [
      `${id}:${benefit}`,
      fixtureAnswer(
        {
          type: 'score',
          instructions: 'Benefit',
          criteria: ['0', '1', '2', '3']
        },
        undefined,
        3
      )
    ])
  )
  const rank = () =>
    rankCandidates(state, bundle.prompts, answers, bundle.rubric)[0]!
  expect(rank().ambiguity).toBe(0)
  expect(rank().tension).toBe(0)
  state.unresolved.push({
    id: 'issue',
    vector: 'human_agency',
    evidenceIds: [],
    kind: 'tension'
  })
  expect(rank().tension).toBe(0)
  state.unresolved.push({
    id: 'risk-issue',
    vector: 'risk_landscape',
    evidenceIds: [],
    kind: 'tension'
  })
  expect(rank().tension).toBeGreaterThan(0)
  expect(rank().ambiguity).toBe(0)
})

test('supported dimensions retain proportional routing gaps until evidence support reaches one', () => {
  const state = createAssessment('continuous-support')
  const bundle = loadBundle()
  state.answers.push({
    id: 'answer',
    promptInstanceId: state.prompts[0]!.id,
    promptText: state.prompts[0]!.text,
    text: 'I expect broad benefits.',
    substantive: true,
    hasHorizon: false,
    hasConviction: false
  })
  const question = {
    type: 'choice' as const,
    instructions: 'Evidence presence',
    criteria: { stated: 'Expressed', not_expressed: 'Absent' }
  }
  const answer = fixtureAnswer(question, 'stated')
  if (answer.type !== 'choice') throw new Error('Expected choice')
  answer.probabilities = { stated: 0.7, not_expressed: 0.3 }
  state.judgments.push({
    id: 'judgment',
    answerId: 'answer',
    questionId: 'beneficial_potential:status',
    stage: 'interpret',
    question,
    answer,
    model: 'fixture-v1',
    rubricVersion: state.versions.rubric
  })
  state.evidence.push({
    id: 'evidence',
    answerId: 'answer',
    vector: 'beneficial_potential',
    status: 'stated',
    judgmentIds: ['judgment'],
    referenceIds: [],
    contextReferenceIds: []
  })
  state.coverage.beneficial_potential = 'assessed'
  const gap = () =>
    candidatePrompts(state, bundle.prompts).find(
      (c) => c.prompt.id === 'upside.general'
    )!.missing
  expect(gap()).toBeCloseTo(0.3)
  answer.probabilities = { stated: 1, not_expressed: 0 }
  expect(gap()).toBe(0)
  const routeAnswers = {
    'upside.general:coverage': fixtureAnswer(
      {
        type: 'score' as const,
        instructions: 'Missing expected benefits',
        criteria: ['0', '1', '2', '3']
      },
      undefined,
      3
    ),
    'outlook:beneficial_potential:position': fixtureAnswer(
      {
        type: 'choice' as const,
        instructions: 'Position',
        criteria: {
          assessable: 'Known position',
          explicitly_unknown: 'Known unknown',
          not_expressed: 'Not elicited'
        }
      },
      'not_expressed'
    )
  }
  const coverageBenefit = () =>
    rankCandidates(
      state,
      bundle.prompts.map((p) =>
        p.id === 'upside.general' ? { ...p, maxUses: 2 } : p
      ),
      routeAnswers,
      bundle.rubric
    )[0]!.coverage
  expect(coverageBenefit()).toBeGreaterThan(0.9)
  routeAnswers['outlook:beneficial_potential:position'] = fixtureAnswer(
    {
      type: 'choice',
      instructions: 'Position',
      criteria: {
        assessable: 'Known position',
        explicitly_unknown: 'Known unknown',
        not_expressed: 'Not elicited'
      }
    },
    'explicitly_unknown'
  )
  expect(coverageBenefit()).toBeGreaterThan(0.9)
  const direct = bundle.prompts.find((p) => p.id === 'upside.general')!
  state.prompts.push({
    ...state.prompts[0]!,
    id: 'direct-upside',
    ordinal: 2,
    promptId: direct.id,
    text: direct.text,
    family: direct.family
  })
  state.answers.push({
    ...state.answers[0]!,
    id: 'unknown-upside',
    promptInstanceId: 'direct-upside',
    promptText: direct.text,
    text: 'I do not know what benefits to expect.'
  })
  expect(coverageBenefit()).toBe(1) // No extra gap bonus once uncertainty has been directly elicited.
  state.unresolved.push({
    id: 'ambiguity',
    vector: 'beneficial_potential',
    evidenceIds: ['evidence'],
    kind: 'ambiguity'
  })
  expect(gap()).toBe(0.5)
})
