import { expect, test } from 'vitest'
import { facetComponents, facetQuestions } from './facets'
import { createAssessment } from './state'
import { fixtureAnswer } from '@/lib/server/provider'

test('explicit uncertainty is preserved separately from a moderate overall outlook', () => {
  const state = createAssessment('net-unknown')
  state.evidence.push({
    id: 'e',
    answerId: 'a',
    vector: 'risk_landscape',
    status: 'stated',
    judgmentIds: [],
    referenceIds: [],
    contextReferenceIds: []
  })
  const question = facetQuestions()['facet:overall_outlook']!
  const unknown = facetComponents(state, {
    'facet:overall_outlook': fixtureAnswer(question, 'explicitly_unknown')
  })[0]!
  expect(unknown.value).toBeNull()
  expect(unknown.claim).toContain('not settled')
  const balanced = facetComponents(state, {
    'facet:overall_outlook': fixtureAnswer(question, '2')
  })[0]!
  expect(balanced.value).toBe(0.5)
  expect(balanced.claim).toContain('balanced')
})

test('a deployment preference does not manufacture research-pace or access preferences', () => {
  const state = createAssessment('scoped-policy')
  state.evidence.push({
    id: 'policy-e',
    answerId: 'a',
    vector: 'action_posture',
    status: 'stated',
    judgmentIds: [],
    referenceIds: [],
    contextReferenceIds: []
  })
  const questions = facetQuestions()
  const components = facetComponents(state, {
    'facet:deployment_policy': fixtureAnswer(
      questions['facet:deployment_policy']!,
      '0'
    ),
    'facet:development_pace': fixtureAnswer(
      questions['facet:development_pace']!,
      'not_expressed'
    ),
    'facet:access_policy': fixtureAnswer(
      questions['facet:access_policy']!,
      'not_expressed'
    )
  })
  expect(
    components.find((component) => component.vector === 'deployment_policy')
      ?.claim
  ).toContain('prior protections')
  expect(
    components.find((component) => component.vector === 'development_pace')
      ?.value
  ).toBeNull()
  expect(
    components.find((component) => component.vector === 'access_policy')?.value
  ).toBeNull()
})
