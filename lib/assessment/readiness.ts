import type { Assessment, ModelAnswer, VectorId } from './schema'
import { epistemicIds, vectorIds } from './schema'
import { supportProbability } from './presence'

// A draft engineering heuristic, not a probability that a forecast is correct.
const readinessThreshold = 55
// Automatic results wait for this many accepted answers, so a detailed first
// reply no longer ends the interview after one or two questions.
export const autoStopFloor = 4
const outlookIds: VectorId[] = [
  'beneficial_potential',
  'risk_landscape',
  'human_agency'
]
const levels = ['0', '1', '2', '3', '4']
const mass = (answer: ModelAnswer | undefined, keys: string[]) =>
  answer?.type === 'choice'
    ? keys.reduce((sum, key) => sum + (answer.probabilities[key] ?? 0), 0)
    : 0

/**
 * Whether the evidence places the displayed result: the Doom–Bloom outlook,
 * the scale of change and (best effort) P(doom). Uses the latest routing or
 * result judgment of each output; evidence accumulates, so an earlier
 * revision's placement stands until the next evaluation (for example right
 * after a clarification answer). `known` is false when none exist, e.g. an
 * in-progress assessment saved before routing recorded these judgments.
 */
function mapStatus(state: Assessment) {
  const answer = (id: string) =>
    state.judgments.findLast(
      (judgment) =>
        (judgment.stage === 'route' || judgment.stage === 'project') &&
        judgment.questionId === id
    )?.answer
  const outlook = answer('facet:outlook_orientation')
  const scale = answer('experiment:transformation')
  const risk = answer('experiment:pdoom:band')
  return {
    known: Boolean(outlook && scale),
    // Mirrors the placement rules the result uses for each coordinate.
    outlook: mass(outlook, levels) >= 0.7,
    scale:
      mass(scale, levels) >= 0.5 || mass(scale, ['explicitly_unknown']) >= 0.5,
    risk: risk?.type === 'choice' && 1 - (risk.probabilities.unknown ?? 0) > 0.5
  }
}

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
  const substantive = state.answers.some((answer) => answer.substantive)
  const map = mapStatus(state)
  // Results depend on the outputs a participant actually sees, not on
  // reasoning coverage. Saved assessments without map judgments keep the
  // earlier coverage rule until their next evaluated answer.
  const ready = map.known
    ? substantive && map.outlook && map.scale
    : substantive &&
      hasOutlook &&
      hasReasoning &&
      (value >= readinessThreshold || legacyCore(state, dimensions))
  return {
    value,
    threshold: readinessThreshold,
    ready,
    map,
    dimensions,
    covered: dimensions.filter((dimension) => dimension.confidence > 0).length,
    total: vectorIds.length,
    hasOutlook,
    hasReasoning
  }
}

// The algorithm 0.6 focused route, retained only for saved assessments whose
// current revision predates map judgments.
function legacyCore(
  state: Assessment,
  dimensions: Array<{ vector: VectorId; contribution: number }>
) {
  const currentProfile = state.judgments.filter(
    (judgment) =>
      (judgment.stage === 'route' &&
        judgment.answerId === `route:${state.evidenceRevision}`) ||
      (judgment.stage === 'project' &&
        judgment.answerId === `result:${state.evidenceRevision}`)
  )
  const outlook = currentProfile.find(
    (judgment) => judgment.questionId === 'facet:overall_outlook'
  )?.answer
  const basis = currentProfile.find(
    (judgment) => judgment.questionId === 'central_basis'
  )?.answer
  return (
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
  )
}
