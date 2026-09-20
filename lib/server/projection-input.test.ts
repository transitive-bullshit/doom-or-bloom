import { expect, test } from 'vitest'
import { createAssessment } from '@/lib/assessment/state'
import { loadBundle } from '@/lib/content/loader'
import { projectionInput } from './projection-input'

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
    claimTarget: null
  })
  for (const answer of state.answers)
    expect(JSON.stringify(input).split(answer.text)).toHaveLength(2)
  expect(JSON.stringify(input)).not.toMatch(
    /spanId|horizonSpanId|candidate excerpts/
  )
})

test('legacy corpus links cannot enter current projection context', () => {
  const bundle = loadBundle()
  const state = createAssessment('legacy-reference-context')
  state.evidence.push({
    id: 'source-evidence',
    answerId: 'source-answer',
    vector: 'grounded_understanding',
    status: 'stated',
    judgmentIds: [],
    referenceIds: [bundle.references[0]!.id],
    contextReferenceIds: [bundle.references[1]!.id]
  })
  state.unresolved.push({
    id: 'legacy-reference',
    vector: 'grounded_understanding',
    evidenceIds: [],
    kind: 'reference'
  })
  state.referenceClaims.push({
    id: 'legacy-claim',
    answerId: 'source-answer',
    referenceId: bundle.references[0]!.id,
    attribution: 'no',
    fit: 'no',
    uncertainty: 'no',
    materiality: 'yes',
    judgmentIds: []
  })
  const input = projectionInput(state, bundle)
  expect(input).not.toHaveProperty('referenceContext')
  expect(input).not.toHaveProperty('referenceClaims')
  expect(input).not.toHaveProperty('referencePolicy')
  expect(input.activeSupport[0]).not.toHaveProperty('referenceIds')
  expect(input).not.toHaveProperty('unresolved')
  for (const reference of bundle.references)
    expect(JSON.stringify(input)).not.toContain(reference.summary)
  for (const dimension of bundle.rubric.dimensions)
    expect(input.dimensionDefinitions[dimension.id]).toEqual({
      label: dimension.label,
      meaning: dimension.meaning
    })
})

test('an unverified tension cannot become independent projection evidence', () => {
  const state = createAssessment('suspected-conflict')
  const before = projectionInput(state, loadBundle())
  state.unresolved.push({
    id: 'suspicion',
    vector: 'internal_coherence',
    kind: 'tension',
    evidenceIds: []
  })
  expect(projectionInput(state, loadBundle())).toEqual(before)
})
