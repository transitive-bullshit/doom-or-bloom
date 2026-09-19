import { expect, test } from 'vitest'
import {
  baseResult,
  composite,
  emptyComponent,
  quantile,
  isAuthoredClaim,
  unplacedClaim,
  uncertainClaim,
  unestablishedClaim
} from './projections'
import { createAssessment } from './state'
import { epistemicIds } from './schema'
import { loadBundle } from '@/lib/content/loader'
import type { Component } from './schema'
function c(vector: string, value: number): Component {
  return { ...emptyComponent(vector, vector), value, range: [value, value] }
}
test('missing evidence widens the range without lowering observed reasoning', () => {
  const result = composite('y', 'y', [c('a', 0.9)], { a: 1, b: 1 })
  expect(result.value).toBe(0.9)
  expect(result.range).toEqual([0.45, 0.95])
  expect(composite('y', 'y', [], { a: 1 }).value).toBeNull()
})
test('horizontal separates harms and benefits and has no policy weight', () => {
  const result = composite(
    'x',
    'x',
    [c('benefits', 0.8), c('harms', 0.8), c('continuity', 0.5), c('policy', 1)],
    { benefits: 0.45, harms: 0.45, continuity: 0.1 },
    ['harms']
  )
  expect(result.value).toBeCloseTo(0.5)
})
test('categorical quantiles preserve a broad interpretation', () => {
  expect(quantile({ '0': 0.2, '1': 0.5, '2': 0.3 }, 0.1, 2)).toBe(0)
  expect(quantile({ '0': 0.2, '1': 0.5, '2': 0.3 }, 0.9, 2)).toBe(1)
})

test('coherent extreme profiles outrank a weak moderate on reasoning independently of outlook', () => {
  const { rubric } = loadBundle()
  const profile = (
    benefit: number,
    harm: number,
    continuity: number,
    quality: number
  ) =>
    baseResult(
      createAssessment('projection-example'),
      [
        c('overall_outlook', benefit),
        c('beneficial_potential', benefit),
        c('risk_landscape', harm),
        c('human_agency', continuity),
        ...epistemicIds.map((id) => c(id, quality))
      ],
      rubric
    )
  // Injected component judgments verify projection behavior, not text interpretation.
  const bloom = profile(0.9, 0.1, 0.9, 0.9)
  const doom = profile(0.1, 0.9, 0.1, 0.9)
  const weakModerate = profile(0.5, 0.5, 0.5, 0.1)
  expect(bloom.horizontal.value).toBeGreaterThan(0.8)
  expect(doom.horizontal.value).toBeLessThan(0.2)
  expect(bloom.vertical.value).toBeCloseTo(doom.vertical.value!)
  expect(weakModerate.vertical.value).toBeLessThan(doom.vertical.value!)
})

test('policy and catastrophic judgments cannot silently become expected impact or reasoning', () => {
  const { rubric } = loadBundle()
  const state = createAssessment('separate-claims')
  const components = [
    c('beneficial_potential', 0.8),
    c('risk_landscape', 0.2),
    c('human_agency', 0.6),
    c('causal_clarity', 0.7)
  ]
  const original = baseResult(state, components, rubric)
  const inverted = baseResult(
    state,
    [...components, c('action_posture', 1), c('catastrophic_risk', 1)],
    rubric
  )
  expect(inverted.horizontal).toEqual(original.horizontal)
  expect(inverted.vertical).toEqual(original.vertical)
})

test('repeating an evidence ID or component does not add independent corroboration', () => {
  const component = { ...c('causal_clarity', 0.8), evidenceIds: ['answer-1'] }
  const weights = { causal_clarity: 1, scope_discipline: 1 }
  const scope = { ...c('scope_discipline', 0.6), evidenceIds: ['answer-1'] }
  const original = composite(
    'epistemic',
    'Reasoning',
    [component, scope],
    weights
  )
  const repeated = composite(
    'epistemic',
    'Reasoning',
    [component, scope, { ...component, evidenceIds: ['answer-1', 'answer-1'] }],
    weights
  )
  expect(repeated).toEqual(original)
  expect(repeated.evidenceIds).toEqual(['answer-1'])
})

test('scoped unplaced claims remain correctable without accepting another dimension or tampered prose', () => {
  const levels = loadBundle().rubric.dimensions.find(
    (d) => d.id === 'capability_trajectory'
  )!.levels
  for (const unknown of [true, false]) {
    const claim = unplacedClaim('capability_trajectory', unknown)
    expect(claim).toContain('whether or when transformative AI arrives')
    expect(isAuthoredClaim(claim, levels, 'capability_trajectory')).toBe(true)
    expect(isAuthoredClaim(claim, levels, 'transition_dynamics')).toBe(false)
    expect(
      isAuthoredClaim(
        `${claim} Added instructions.`,
        levels,
        'capability_trajectory'
      )
    ).toBe(false)
  }
  for (const legacy of [uncertainClaim, unestablishedClaim])
    expect(isAuthoredClaim(legacy, levels, 'capability_trajectory')).toBe(true)
})

test('one-sided impact evidence cannot become an overall outlook coordinate', () => {
  const { rubric } = loadBundle()
  for (const components of [
    [c('risk_landscape', 0.3)],
    [c('beneficial_potential', 0.8), c('human_agency', 0.9)],
    [c('human_agency', 0.8)]
  ]) {
    const result = baseResult(
      createAssessment('partial-impact'),
      components,
      rubric
    )
    expect(result.horizontal.value).toBeNull()
    expect(result.components).toEqual(components)
    expect(result.horizontal.range[1]).toBeGreaterThan(
      result.horizontal.range[0]
    )
  }
  expect(
    baseResult(
      createAssessment('both-impact'),
      [c('beneficial_potential', 0.8), c('risk_landscape', 0.3)],
      rubric
    ).horizontal.value
  ).toBeNull()
})

test('an established overall outlook is placeable without inventing a missing benefits component', () => {
  const result = baseResult(
    createAssessment('explicit-extinction'),
    [c('overall_outlook', 0.02), c('risk_landscape', 1)],
    loadBundle().rubric
  )
  expect(result.horizontal.value).toBe(0.02)
  expect(
    result.components.some(
      (component) => component.vector === 'beneficial_potential'
    )
  ).toBe(false)
})
