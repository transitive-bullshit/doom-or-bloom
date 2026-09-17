import { expect, test } from 'vitest'
import { createAssessment } from '@/lib/assessment/state'
import { loadBundle } from '@/lib/content/loader'
import { projectionInput } from './projection-input'
import { referencePolicy } from './reference-input'

test('complete observations appear once and support links whole answers by ID', () => {
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
      hasHorizon: false,
      hasConviction: false
    })
    state.evidence.push({
      id: `${id}:e`,
      answerId: id,
      vector: 'causal_clarity',
      status: 'stated',
      judgmentIds: [],
      referenceIds: [],
      contextReferenceIds: []
    })
  }
  const input = projectionInput(state, loadBundle())
  expect(input.completeParticipantEvidence.map((a) => a.answer)).toEqual(
    state.answers.map((a) => a.text)
  )
  expect(input.completeParticipantEvidence).toHaveLength(12)
  expect(input.activeSupport[11]).toEqual({
    id: 'original-answer-11:e',
    answerId: 'original-answer-11',
    vector: 'causal_clarity',
    status: 'stated',
    referenceIds: [],
    claimTarget: null
  })
  for (const answer of state.answers)
    expect(JSON.stringify(input).split(answer.text)).toHaveLength(2)
  expect(JSON.stringify(input)).not.toMatch(
    /spanId|horizonSpanId|candidate excerpts/
  )
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
    vector: 'grounded_understanding',
    status: 'stated',
    judgmentIds: [],
    referenceIds: selected.slice(0, 2),
    contextReferenceIds: selected.slice(2)
  })
  const input = projectionInput(state, bundle)
  expect(input.referenceContext).toHaveLength(3)
  expect(input.referencePolicy).toBe(referencePolicy)
  const event = input.referenceContext.find((r) => r.id === selected[0])!
  const publication = input.referenceContext.find((r) => r.id === selected[1])!
  const experiment = input.referenceContext.find((r) => r.id === selected[2])!
  expect(event.kind).toBe('event')
  expect(publication.kind).toBe('publication')
  expect(event.date).toBe('2026-07')
  expect(publication.date).toBe('2026-08-26')
  expect(event.related).toContain(publication.id)
  expect(experiment.date).toBe(
    'Experiment date unknown; report published 2026-08-13'
  )
  for (const reference of input.referenceContext)
    expect(reference.summary).toBe(
      bundle.references.find((r) => r.id === reference.id)!.summary
    )
})
