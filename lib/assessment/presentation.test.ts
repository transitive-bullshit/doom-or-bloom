import { expect, test } from 'vitest'
import { createAssessment } from './state'
import { emptyComponent } from './projections'
import { selectPresentation } from './presentation'
import { loadBundle } from '@/lib/content/loader'

test('positive findings require exact evidence and the entire interpretation range to support the claim', () => {
  const bundle = loadBundle()
  const state = createAssessment('findings')
  const causal = {
    ...emptyComponent('causal_clarity', 'Causal clarity'),
    value: 0.8,
    range: [0.7, 0.9] as [number, number],
    evidenceIds: ['exact-evidence']
  }
  expect(
    selectPresentation(state, [causal], bundle).findings.map((f) => f.id)
  ).toContain('finding.causal')
  expect(
    selectPresentation(state, [{ ...causal, range: [0.2, 0.9] }], bundle)
      .findings
  ).toEqual([])
  expect(
    selectPresentation(state, [{ ...causal, evidenceIds: [] }], bundle).findings
  ).toEqual([])
  state.unresolved.push({
    id: 'unresolved',
    vector: 'causal_clarity',
    kind: 'tension',
    evidenceIds: ['exact-evidence']
  })
  expect(selectPresentation(state, [causal], bundle).findings).toEqual([])
})
test('resources ignore legacy grounding and diversify authored purpose groups', () => {
  const bundle = loadBundle()
  const state = createAssessment('resources')
  state.referenceClaims.push({
    id: 'claim',
    answerId: 'a',
    referenceId: 'report.openai-misalignment-reporting-framework-2026',
    attribution: 'yes',
    fit: 'yes',
    uncertainty: 'yes',
    materiality: 'no',
    judgmentIds: []
  })
  const components = [
    'institutional_competence',
    'capability_trajectory',
    'beneficial_potential',
    'technical_controllability'
  ].map((vector) => ({
    ...emptyComponent(vector, vector),
    value: 0.7,
    range: [0.7, 0.7] as [number, number],
    evidenceIds: ['e']
  }))
  const resources = selectPresentation(state, components, bundle).resources
  const withoutClaims = { ...state, referenceClaims: [] }
  expect(resources).toEqual(
    selectPresentation(withoutClaims, components, bundle).resources
  )
  expect(
    new Set(
      resources.map(
        (r) => bundle.resources.find((asset) => asset.id === r.id)!.purposeGroup
      )
    ).size
  ).toBe(resources.length)
  expect(resources).toHaveLength(3)
  expect(
    resources.every(
      (r) =>
        bundle.resources.find((asset) => asset.id === r.id)?.familiarity ===
        'general'
    )
  ).toBe(true)
})
