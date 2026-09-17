import { expect, test } from 'vitest'
import { createAssessment } from './state'
import { candidatePrompts, rankCandidates } from './routing'
import { loadBundle } from '@/lib/content/loader'
import { fixtureAnswer } from '@/lib/server/provider'

test('familiarity gates specialist wording while early missing horizons retain independent priority', () => {
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
  ).toBe('timeline.general')
  state.familiarity.level = 'expert'
  expect(
    candidatePrompts(state, bundle.prompts).find(
      (c) => c.prompt.id === 'mechanism.chain'
    )?.reason
  ).toBeNull()
})

test('retired questions are excluded for every saved corpus and confidence questions require a timing premise', () => {
  const retired = [
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
    for (const id of retired)
      expect(
        candidates.find((candidate) => candidate.prompt.id === id)?.reason
      ).toMatch(/^Retired/)
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
