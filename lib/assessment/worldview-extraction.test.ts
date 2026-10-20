import { expect, test } from 'vitest'
import type { WorldviewExperiment } from './schema'
import {
  applyExtraction,
  extractionCandidates,
  type ExperimentExtraction
} from './worldview-experiment'

const input = {
  completeParticipantEvidence: [
    {
      id: 'a1',
      prompt: 'Timing?',
      answer: 'AGI arrives around 2031. Work changes within ten years.',
      correctionTarget: null
    },
    {
      id: 'a2',
      prompt: 'Chance?',
      answer: 'Honestly about 10–20%. Approximately zero for the next year.',
      correctionTarget: null
    }
  ],
  activeSupport: []
}
const quote = (answerId: string, answerNumber: number, text: string) => ({
  answerId,
  answerNumber,
  text
})

function extraction(
  answers: ExperimentExtraction['answers'],
  quotes: ExperimentExtraction['quotes']
): ExperimentExtraction {
  return {
    model: 'clairic',
    answers,
    quotes,
    usage: { input_tokens: 1, passes: 1 },
    elapsedMs: 1
  }
}

test('a numeric stated token keeps its words and range', () => {
  const { candidates, answers } = extractionCandidates(
    input,
    extraction(
      { pdoom_stated_value: { type: 'number', value: 10, p_null: 0.02 } },
      { pdoom_stated_token: quote('a2', 2, '10–20%') }
    ),
    'runtime'
  )
  expect(candidates.probabilities.x_pdoom).toEqual({
    answerId: 'a2',
    answerNumber: 2,
    text: 'Honestly about 10–20%.',
    token: '10–20%',
    bounds: [0.1, 0.2]
  })
  expect(answers['experiment:pdoom']).toMatchObject({
    type: 'choice',
    choice: 'x_pdoom'
  })
})

test('verbal odds show the number they mean; a missing value proposes nothing', () => {
  const verbal = extractionCandidates(
    input,
    extraction(
      { pdoom_stated_value: { type: 'number', value: 0, p_null: 0.01 } },
      { pdoom_stated_token: quote('a2', 2, 'Approximately zero') }
    ),
    'runtime'
  )
  expect(verbal.candidates.probabilities.x_pdoom).toMatchObject({
    token: '0%',
    bounds: [0, 0]
  })
  const none = extractionCandidates(
    input,
    extraction(
      { pdoom_stated_value: { type: 'number', value: null, p_null: 0.9 } },
      { pdoom_stated_token: quote('a2', 2, 'Approximately zero') }
    ),
    'runtime'
  )
  expect(none.answers).toEqual({})
})

test('replace mode proposes persona quotes, and hinges never share a passage', () => {
  const same = quote('a1', 1, 'Work changes within ten years.')
  const { candidates, answers } = extractionCandidates(
    input,
    extraction(
      {
        hinge_uncertainty: { type: 'text', value: 'x', p_null: 0.2 },
        hinge_update: { type: 'text', value: 'x', p_null: 0.1 },
        milestone_work_quote: { type: 'text', value: 'x', p_null: 0.05 },
        milestone_science_quote: { type: 'text', value: 'x', p_null: 0.3 }
      },
      {
        hinge_uncertainty: same,
        hinge_update: same,
        milestone_work_quote: same,
        milestone_science_quote: same
      }
    ),
    'persona'
  )
  // The more certain hinge keeps the passage; both milestones may cite it.
  expect(Object.keys(answers).sort()).toEqual([
    'experiment:hinge:update',
    'experiment:milestone:science',
    'experiment:milestone:work'
  ])
  expect(Object.keys(candidates.passages)).toHaveLength(3)
})

test('years are kept only when the quote supports them and they are not past', () => {
  const milestone = (id: string, text: string) => ({
    id,
    label: id,
    evidence: quote('a1', 1, text)
  })
  const experiment = {
    milestones: [
      milestone('agi', 'AGI arrives around 2031.'),
      milestone('asi', 'AGI arrives around 2031.'),
      milestone('work', 'Work changes within ten years.'),
      milestone('science', 'Work changes within ten years.')
    ]
  } as unknown as WorldviewExperiment
  const result = applyExtraction(
    experiment,
    extraction(
      {
        milestone_agi_year: { type: 'number', value: 2031 },
        // Clairic copied the year into another milestone: the quote says 2031.
        milestone_asi_year: { type: 'number', value: 2034 },
        milestone_work_year: { type: 'number', value: 2036 },
        // "This decade" read as a past year.
        milestone_science_year: { type: 'number', value: 2020 }
      },
      {
        milestone_work_quote: quote('a1', 1, 'Work changes within ten years.'),
        milestone_science_quote: quote(
          'a1',
          1,
          'Work changes within ten years.'
        )
      }
    ),
    2026
  )
  expect(result.milestones.map((m) => [m.id, m.year])).toEqual([
    ['agi', 2031],
    ['asi', undefined],
    ['work', 2036],
    ['science', undefined]
  ])
  expect(result.extraction).toMatchObject({ model: 'clairic' })
})
