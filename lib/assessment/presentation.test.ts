import { expect, test } from 'vitest'
import { createAssessment } from './state'
import { emptyComponent } from './projections'
import { selectPresentation } from './presentation'
import { loadBundle } from '@/lib/content/loader'

test('supported worldview findings are not crowded out by three generic reasoning findings', () => {
  const state = createAssessment('finding-balance')
  const components = [
    'causal_clarity',
    'updateability',
    'scope_discipline',
    'risk_landscape'
  ].map((vector) => ({
    ...emptyComponent(vector, vector),
    value: 0.8,
    range: [0.7, 0.9] as [number, number],
    evidenceIds: [`${vector}:e`]
  }))
  const findings = selectPresentation(state, components, loadBundle()).findings
  expect(findings).toHaveLength(3)
  expect(findings.map((f) => f.id)).toContain('finding.risk-concern')
  expect(findings.map((f) => f.id)).toContain('finding.causal')
  expect(
    findings.find((f) => f.id === 'finding.risk-concern')?.evidenceIds
  ).toEqual(['risk_landscape:e'])
})

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

test('actionable revision feedback requires supported refusal, not silence, uncertainty or disagreement', () => {
  const bundle = loadBundle()
  const state = createAssessment('revision-feedback')
  const refusal = {
    ...emptyComponent('updateability', 'Updateability'),
    value: 0,
    range: [0, 0] as [number, number],
    evidenceIds: ['explicit-refusal']
  }
  const selected = (components: (typeof refusal)[]) =>
    selectPresentation(state, components, bundle).findings
  expect(selected([refusal])[0]).toMatchObject({
    id: 'finding.revision-closed',
    evidenceIds: ['explicit-refusal']
  })
  expect(selected([{ ...refusal, range: [0, 1] }])).toEqual([])
  expect(selected([{ ...refusal, evidenceIds: [] }])).toEqual([])
  expect(
    selectPresentation(
      state,
      [emptyComponent('updateability', 'Updateability')],
      bundle
    ).findings
  ).toEqual([])
  state.unresolved.push({
    id: 'u',
    vector: 'updateability',
    kind: 'ambiguity',
    evidenceIds: ['explicit-refusal']
  })
  expect(selected([refusal])).toEqual([])
})

test('topic resources include evidenced unknowns and prioritize open topics without inventing a position', () => {
  const bundle = loadBundle()
  const state = createAssessment('unknown-topic')
  const control = {
    ...emptyComponent('technical_controllability', 'Control'),
    evidenceIds: ['control-unknown']
  }
  const benefits = {
    ...emptyComponent('beneficial_potential', 'Benefits'),
    value: 0.8,
    evidenceIds: ['benefit-position']
  }
  const resources = selectPresentation(
    state,
    [control, benefits],
    bundle
  ).resources
  expect(resources[0]?.id).toBe('resource.metr-investigation')
  expect(resources[0]?.question).toContain('what remains unknown')
  expect(resources.map((r) => r.id)).toEqual([
    'resource.metr-investigation',
    'resource.economic-scenarios'
  ])
  expect(control.value).toBeNull()
  expect(
    selectPresentation(state, [{ ...control, evidenceIds: [] }], bundle)
      .resources
  ).toEqual([])
  const bounded = structuredClone(bundle)
  bounded.resources = [
    {
      ...bundle.resources[0]!,
      conditions: [
        {
          vector: 'technical_controllability',
          assessed: true,
          basis: 'position',
          min: 0.5
        }
      ]
    }
  ]
  expect(selectPresentation(state, [control], bounded).resources).toEqual([])
  state.familiarity.level = 'general'
  expect(
    resources.every(
      (r) =>
        bundle.resources.find((item) => item.id === r.id)?.familiarity ===
        'general'
    )
  ).toBe(true)
})
