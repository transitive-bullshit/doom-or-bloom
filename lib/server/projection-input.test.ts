import { expect, test } from 'vitest'
import { createAssessment } from '@/lib/assessment/state'
import { loadBundle } from '@/lib/content/loader'
import { projectionInput } from './projection-input'
import { fixtureAnswer } from './provider'
import { referencePolicy } from './reference-input'

test('lossless aliases retain complete raw observations and restore original provenance', () => {
  const state = createAssessment('long-original-id')
  for (let i = 0; i < 12; i++) {
    const id = `original-answer-${i}`
    const text = `Exact original ${i}: ` + 'x'.repeat(1900)
    state.answers.push({
      id,
      promptInstanceId: state.prompts[0]!.id,
      promptText: 'Exact original prompt',
      text,
      substantive: true,
      spans: [{ id: `${id}:s`, start: 0, end: text.length, text }]
    })
    state.evidence.push({
      id: `${id}:e`,
      answerId: id,
      spanId: `${id}:s`,
      vector: 'causal_clarity',
      status: 'stated',
      judgmentIds: [],
      referenceIds: [],
      contextReferenceIds: [],
      horizonSpanId: null,
      convictionSpanId: null,
      assumptionSpanId: null
    })
  }
  const question = {
    type: 'choice' as const,
    instructions: 'Select exact evidence',
    criteria: {
      'original-answer-11:e': state.answers[11]!.text,
      none: 'Unsupported'
    }
  }
  const compact = projectionInput(state, loadBundle(), {
    'causal_clarity:evidence': question
  })
  expect(
    compact.input.completeParticipantEvidence.map((a) => a.answer)
  ).toEqual(state.answers.map((a) => a.text))
  expect(compact.input.completeParticipantEvidence).toHaveLength(12)
  expect(compact.providerQuestions['causal_clarity:evidence']?.type).toBe(
    'choice'
  )
  const result = compact.restore({
    'causal_clarity:evidence': fixtureAnswer(
      compact.providerQuestions['causal_clarity:evidence']!,
      'e11'
    )
  })['causal_clarity:evidence']!
  expect(result.type === 'choice' && result.choice).toBe('original-answer-11:e')
  expect(
    result.type === 'choice' && result.probabilities['original-answer-11:e']
  ).toBe(1)
})

test('projection retains source identity, qualified dates and relationships without widening to the whole corpus', () => {
  const bundle = loadBundle()
  const state = createAssessment('reference-metadata')
  const selected = [
    'event.openai-hugging-face-2026',
    'report.metr-hugging-face-investigation-2026',
    'event.anthropic-migration-conflict-demonstration-2026'
  ]
  state.evidence.push({
    id: 'source-evidence',
    answerId: 'source-answer',
    spanId: 'source-span',
    vector: 'grounded_understanding',
    status: 'stated',
    judgmentIds: [],
    referenceIds: selected.slice(0, 2),
    contextReferenceIds: selected.slice(2),
    horizonSpanId: null,
    convictionSpanId: null,
    assumptionSpanId: null
  })
  const { input } = projectionInput(state, bundle, {})
  expect(input.referenceContext).toHaveLength(3)
  expect(input.referencePolicy).toBe(referencePolicy)
  const event = input.referenceContext.find(
    (r) => r.canonicalId === selected[0]
  )!
  const publication = input.referenceContext.find(
    (r) => r.canonicalId === selected[1]
  )!
  const experiment = input.referenceContext.find(
    (r) => r.canonicalId === selected[2]
  )!
  expect(event.kind).toBe('event')
  expect(publication.kind).toBe('publication')
  expect(event.date).toBe('2026-07')
  expect(publication.date).toBe('2026-08-26')
  expect(event.related).toContain(publication.canonicalId)
  expect(experiment.date).toBe(
    'Experiment date unknown; report published 2026-08-13'
  )
  for (const reference of input.referenceContext)
    expect(reference.summary).toBe(
      bundle.references.find((r) => r.id === reference.canonicalId)!.summary
    )
})
