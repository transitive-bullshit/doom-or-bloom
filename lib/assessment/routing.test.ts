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
