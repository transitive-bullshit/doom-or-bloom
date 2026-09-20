import { describe, expect, it } from 'vitest'
import {
  experimentCandidates,
  experimentQuestions,
  experimentVerificationQuestions,
  buildWorldviewExperiment
} from './worldview-experiment'
import type { ExperimentInput } from './worldview-experiment'
import { fixtureAnswer } from '@/lib/server/provider'
import { resultSchema, worldviewExperimentSchema } from './schema'
import type { ModelAnswer } from './schema'

function input(text: string): ExperimentInput {
  return {
    completeParticipantEvidence: [
      { id: 'a1', prompt: 'AI future?', answer: text, correctionTarget: null }
    ],
    activeSupport: [
      { id: 'e1', answerId: 'a1', vector: 'risk_landscape', status: 'stated' }
    ]
  }
}
function assess(source: ExperimentInput, choices: Record<string, string>) {
  const candidates = experimentCandidates(source)
  const questions = experimentQuestions(candidates)
  const answers: Record<string, ModelAnswer> = Object.fromEntries(
    Object.entries(questions).map(([id, question]) => [
      id,
      fixtureAnswer(question, choices[id] ?? 'none')
    ])
  )
  for (const [id, question] of Object.entries(
    experimentVerificationQuestions(candidates, answers)
  )) {
    answers[id] = fixtureAnswer(question)
  }
  return buildWorldviewExperiment(source, candidates, answers, 1, 'fixture-v1')
}
describe('experimental worldview evidence boundaries', () => {
  it('keeps absent axes unplaced instead of borrowing reasoning or capability scores', () => {
    const result = assess(input('I do not know what will happen.'), {})
    expect(result.influence.value).toBeNull()
    expect(result.transformation.value).toBeNull()
    expect(result.pdoom).toBeNull()
    expect(result.milestones).toEqual([])
    expect(result.hinges).toEqual([])
    expect(worldviewExperimentSchema.safeParse(result).success).toBe(true)
  })
  it('requires a selected exact supporting passage before placing either axis', () => {
    const source = input(
      'Human action could decisively change which future we get.'
    )
    expect(
      assess(source, { 'experiment:influence': '4' }).influence.value
    ).toBeNull()
    const result = assess(source, {
      'experiment:influence': '4',
      'experiment:influence:evidence': 'p0'
    })
    expect(result.influence.value).toBe(1)
    expect(result.influence.evidenceIds).toEqual(['e1'])
    expect(result.axisEvidence.influence?.text).toBe(
      source.completeParticipantEvidence[0]!.answer
    )
  })
  it('extracts participant percentages without turning choice probability into P(doom)', () => {
    const source = input(
      'I put extinction risk at 10–20% by 2100. Job loss could be 40%.'
    )
    const candidates = experimentCandidates(source)
    expect(Object.values(candidates.probabilities).map((q) => q.token)).toEqual(
      ['10–20%', '40%']
    )
    const result = assess(source, { 'experiment:pdoom': 'n0' })
    expect(result.pdoom?.token).toBe('10–20%')
    expect(result.pdoom?.bounds).toEqual([0.1, 0.2])
    expect(assess(source, {}).pdoom).toBeNull()
  })
  it('preserves qualified bounds and decimal probabilities without fabricating an interval', () => {
    const source = input(
      'My extinction estimate is less than 0.5%. Another conditional estimate is 10% ± 5%.'
    )
    const values = Object.values(experimentCandidates(source).probabilities)
    expect(values.map((v) => v.token)).toEqual(['less than 0.5%', '10% ± 5%'])
    expect(values.every((v) => !v.bounds)).toBe(true)
    expect(values[0]?.text).toContain('less than 0.5%')
  })
  it('rejects uncertain or nonexistent candidate selections', () => {
    const source = input('My extinction estimate is 10%.')
    const candidates = experimentCandidates(source)
    const result = buildWorldviewExperiment(
      source,
      candidates,
      {
        'experiment:pdoom': {
          type: 'choice',
          choice: 'n0',
          probabilities: { n0: 0.6, none: 0.4 },
          confidence: 0.9
        }
      },
      1,
      'fixture-v1'
    )
    expect(result.pdoom).toBeNull()
  })
  it('copies unknown milestone timing and update conditions with answer provenance', () => {
    const source = input(
      'I do not know when AGI will arrive. I would update after a reliable autonomous research demonstration.'
    )
    const result = assess(source, {
      'experiment:milestone:agi': 'p0',
      'experiment:hinge:update': 'p1'
    })
    expect(result.milestones[0]?.evidence.text).toBe(
      'I do not know when AGI will arrive.'
    )
    expect(result.hinges[0]?.evidence.answerNumber).toBe(1)
    expect(result.hinges[0]?.question).toContain('What evidence')
  })
  it('retains independently verified evidence when suitable excerpts split selection probability', () => {
    const source = input(
      'Human choices can change the future. Cooperation can prevent catastrophe.'
    )
    const candidates = experimentCandidates(source)
    const answers: Record<string, ModelAnswer> = {
      'experiment:influence': {
        type: 'choice',
        choice: '3',
        probabilities: { '3': 1 },
        confidence: 1
      },
      'experiment:influence:evidence': {
        type: 'choice',
        choice: 'p0',
        probabilities: { p0: 0.5, p1: 0.5 },
        confidence: 0.5
      },
      'experiment:influence:evidence:verified': { type: 'noul', noul: 0.95 }
    }
    expect(
      buildWorldviewExperiment(source, candidates, answers, 1, 'fixture-v1')
        .influence.value
    ).toBe(0.75)
    answers['experiment:influence:evidence:verified'] = {
      type: 'noul',
      noul: 0.4
    }
    expect(
      buildWorldviewExperiment(source, candidates, answers, 1, 'fixture-v1')
        .influence.value
    ).toBeNull()
  })
  it('requires verification even for a confident but misleading milestone selection', () => {
    const source = input('AI will change work within a decade.')
    const candidates = experimentCandidates(source)
    const answers: Record<string, ModelAnswer> = {
      'experiment:milestone:agi': {
        type: 'choice',
        choice: 'p0',
        probabilities: { p0: 1 },
        confidence: 1
      },
      'experiment:milestone:agi:verified': { type: 'noul', noul: 0.02 }
    }
    expect(
      Object.keys(experimentVerificationQuestions(candidates, answers))
    ).toEqual(['experiment:milestone:agi:verified'])
    expect(
      buildWorldviewExperiment(source, candidates, answers, 1, 'fixture-v1')
        .milestones
    ).toEqual([])
  })
  it('keeps historical result parsing compatible without experimental fields', () => {
    expect(resultSchema.shape.experiment.isOptional()).toBe(true)
  })
})
