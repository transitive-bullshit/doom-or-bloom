import type { Assessment, VectorId } from './schema'
import { epistemicIds, vectorIds } from './schema'
import { supportProbability } from './presence'

// A draft engineering heuristic, not a probability that a forecast is correct.
const readinessThreshold = 55
const outlookIds: VectorId[] = [
  'beneficial_potential',
  'risk_landscape',
  'human_agency'
]

export function evidenceReadiness(state: Assessment) {
  const judgments = new Map(
    state.judgments.map((judgment) => [judgment.id, judgment])
  )
  const dimensions = vectorIds.map((vector) => {
    const support = state.evidence.filter(
      (entry) =>
        entry.vector === vector &&
        ['stated', 'strongly_implied'].includes(entry.status) &&
        state.answers.some(
          (answer) => answer.id === entry.answerId && answer.substantive
        )
    )
    // Repetition adds no weight. Only presence judgments attached to active support count.
    const confidence =
      state.coverage[vector] === 'assessed'
        ? Math.max(
            0,
            ...support.flatMap((entry) =>
              entry.judgmentIds.map((id) => {
                const judgment = judgments.get(id)
                const answer = judgment?.answer
                return judgment?.stage === 'interpret' &&
                  judgment.questionId === `${vector}:status` &&
                  judgment.answerId === entry.answerId &&
                  answer?.type === 'choice'
                  ? supportProbability(answer)
                  : 0
              })
            )
          )
        : 0
    const unresolved = state.unresolved.some(
      (item) =>
        item.vector === vector &&
        item.kind !== 'reference' &&
        (item.kind !== 'tension' || item.verified === true)
    )
    return {
      vector,
      confidence,
      unresolved,
      contribution: confidence * (unresolved ? 0.5 : 1)
    }
  })
  const value =
    (dimensions.reduce((sum, dimension) => sum + dimension.contribution, 0) /
      vectorIds.length) *
    100
  const hasOutlook = dimensions.some(
    (dimension) =>
      outlookIds.includes(dimension.vector) && dimension.contribution > 0
  )
  const hasReasoning = dimensions.some(
    (dimension) =>
      epistemicIds.includes(
        dimension.vector as (typeof epistemicIds)[number]
      ) && dimension.contribution > 0
  )
  // A focused account need not cover most of the entire taxonomy. Use only
  // current-revision shared judgments, and keep coverage itself unchanged.
  const currentProfile = state.judgments.filter(
    (judgment) =>
      judgment.stage === 'project' &&
      judgment.answerId === `result:${state.evidenceRevision}`
  )
  const outlook = currentProfile.find(
    (judgment) => judgment.questionId === 'facet:overall_outlook'
  )?.answer
  const basis = currentProfile.find(
    (judgment) => judgment.questionId === 'central_basis'
  )?.answer
  const coreSupported =
    outlook?.type === 'choice' &&
    (outlook.probabilities.not_expressed ?? 1) <= 0.15 &&
    basis?.type === 'noul' &&
    basis.noul >= 0.75 &&
    dimensions.filter(
      (dimension) =>
        epistemicIds.includes(
          dimension.vector as (typeof epistemicIds)[number]
        ) && dimension.contribution >= 0.7
    ).length >= 2
  const ready =
    state.answers.some((answer) => answer.substantive) &&
    (value >= readinessThreshold || coreSupported) &&
    hasOutlook &&
    hasReasoning
  return {
    value,
    threshold: readinessThreshold,
    ready,
    dimensions,
    covered: dimensions.filter((dimension) => dimension.confidence > 0).length,
    total: vectorIds.length,
    hasOutlook,
    hasReasoning
  }
}
