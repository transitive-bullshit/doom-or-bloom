import { expect, test } from 'vitest'
import { createAssessment } from './state'
import { vectorIds } from './schema'
import { evidenceReadiness } from './readiness'
import type { Assessment, VectorId } from './schema'
import { fixtureAnswer } from '@/lib/server/provider'

function withEvidence(
  vectors: readonly VectorId[],
  confidence = 1
): Assessment {
  const state = createAssessment('readiness')
  state.answers.push({
    id: 'one',
    promptInstanceId: state.prompts[0]!.id,
    promptText: state.prompts[0]!.text,
    text: 'Full participant account',
    substantive: true,
    hasHorizon: true,
    hasConviction: true
  })
  for (const vector of vectors) {
    const question = {
      type: 'choice' as const,
      instructions: 'Judge presence',
      criteria: { stated: 'Direct evidence', not_expressed: 'No evidence' }
    }
    const answer = fixtureAnswer(question, 'stated')
    if (answer.type === 'choice') {
      answer.confidence = confidence
      answer.probabilities = {
        stated: confidence,
        not_expressed: 1 - confidence
      }
    }
    state.judgments.push({
      id: vector,
      answerId: 'one',
      questionId: `${vector}:status`,
      stage: 'interpret',
      question,
      answer,
      model: 'fixture-v1',
      rubricVersion: state.versions.rubric
    })
    state.evidence.push({
      id: `${vector}:e`,
      answerId: 'one',
      vector,
      status: 'stated',
      judgmentIds: [vector],
      referenceIds: [],
      contextReferenceIds: []
    })
    state.coverage[vector] = 'assessed'
  }
  return state
}
test('empty, one comprehensive, and partial evidence use coverage rather than count', () => {
  expect(evidenceReadiness(createAssessment('empty'))).toMatchObject({
    value: 0,
    ready: false
  })
  expect(evidenceReadiness(withEvidence(vectorIds))).toMatchObject({
    value: 100,
    ready: true
  })
  expect(
    evidenceReadiness(withEvidence(['beneficial_potential', 'causal_clarity']))
  ).toMatchObject({ ready: false, covered: 2 })
  expect(evidenceReadiness(withEvidence(vectorIds.slice(0, 9)))).toMatchObject({
    value: 60,
    ready: true
  })
})
test('confidence, unresolved meaning and superseded evidence reduce readiness without scoring quality', () => {
  const state = withEvidence(vectorIds, 0.7)
  expect(evidenceReadiness(state).value).toBeCloseTo(70)
  for (const vector of vectorIds)
    state.unresolved.push({
      id: vector,
      vector,
      kind: 'tension',
      verified: true,
      evidenceIds: []
    })
  expect(evidenceReadiness(state).value).toBeCloseTo(35)
  expect(evidenceReadiness(state).ready).toBe(false)
  state.unresolved = []
  state.evidence.forEach((entry) => {
    entry.status = 'superseded'
  })
  expect(evidenceReadiness(state).value).toBe(0)
})
test('duplicate support, metadata alone and legacy references add no evidence', () => {
  const state = withEvidence(vectorIds.slice(0, 9))
  const before = evidenceReadiness(state).value
  state.evidence.push(...structuredClone(state.evidence))
  state.unresolved.push({
    id: 'old',
    vector: 'causal_clarity',
    kind: 'reference',
    evidenceIds: []
  })
  expect(evidenceReadiness(state).value).toBe(before)
  state.judgments = []
  expect(evidenceReadiness(state).value).toBe(0)
})

test('a focused supported worldview can qualify without filling unrelated dimensions; stale profile judgments cannot', () => {
  const state = withEvidence([
    'risk_landscape',
    'causal_clarity',
    'scope_discipline'
  ])
  const before = evidenceReadiness(state)
  expect(before.ready).toBe(false)
  const outlookQuestion = {
    type: 'choice' as const,
    instructions: 'Overall expectation',
    criteria: { '0': 'Negative overall', not_expressed: 'Missing' }
  }
  state.judgments.push(
    {
      id: 'net',
      questionId: 'facet:overall_outlook',
      stage: 'project',
      answerId: `result:${state.evidenceRevision}`,
      question: outlookQuestion,
      answer: fixtureAnswer(outlookQuestion, '0'),
      model: 'fixture-v1',
      rubricVersion: state.versions.rubric
    },
    {
      id: 'basis',
      questionId: 'central_basis',
      stage: 'project',
      answerId: `result:${state.evidenceRevision}`,
      question: { type: 'noul', instructions: 'Basis established' },
      answer: { type: 'noul', noul: 0.9 },
      model: 'fixture-v1',
      rubricVersion: state.versions.rubric
    }
  )
  const ready = evidenceReadiness(state)
  expect(ready.ready).toBe(true)
  expect(ready.value).toBe(before.value)
  state.evidenceRevision++
  expect(evidenceReadiness(state).ready).toBe(false)
})

function withMap(
  outlook: Record<string, number>,
  scale: Record<string, number>,
  stage: 'route' | 'project' = 'route'
) {
  const state = withEvidence([])
  const judge = (questionId: string, probabilities: Record<string, number>) =>
    state.judgments.push({
      id: `${stage}:${questionId}`,
      answerId: `${stage === 'route' ? 'route' : 'result'}:0`,
      questionId,
      stage,
      question: {
        type: 'choice',
        instructions: 'Map output',
        criteria: Object.fromEntries(
          Object.keys(probabilities).map((key) => [key, key])
        )
      },
      answer: {
        type: 'choice',
        choice: Object.entries(probabilities).sort(
          (a, b) => b[1] - a[1]
        )[0]![0],
        confidence: 1,
        probabilities
      },
      model: 'fixture-v1',
      rubricVersion: state.versions.rubric
    })
  judge('facet:outlook_orientation', outlook)
  judge('experiment:transformation', scale)
  return state
}

test('results unlock when the displayed map is placed, without reasoning coverage', () => {
  const placed = evidenceReadiness(
    withMap({ '3': 0.8, not_expressed: 0.2 }, { '4': 0.6, not_expressed: 0.4 })
  )
  expect(placed).toMatchObject({ ready: true, hasReasoning: false })
  expect(placed.map).toMatchObject({ known: true, outlook: true, scale: true })
  // Explicit uncertainty about scale is a placement; a weak outlook is not.
  expect(
    evidenceReadiness(
      withMap({ '3': 0.8, not_expressed: 0.2 }, { explicitly_unknown: 0.7 })
    ).ready
  ).toBe(true)
  expect(
    evidenceReadiness(
      withMap({ '3': 0.6, not_expressed: 0.4 }, { '4': 0.9, '3': 0.1 })
    ).ready
  ).toBe(false)
})

test('the latest map judgment decides readiness across stages', () => {
  const state = withMap(
    { '2': 0.9, not_expressed: 0.1 },
    { not_expressed: 0.8, '2': 0.2 }
  )
  expect(evidenceReadiness(state).ready).toBe(false)
  const later = withMap({ '2': 0.9 }, { '2': 0.9 }, 'project')
  state.judgments.push(...later.judgments.filter((j) => j.stage === 'project'))
  expect(evidenceReadiness(state).ready).toBe(true)
})
