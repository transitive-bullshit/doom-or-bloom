import type { Assessment, ModelAnswer } from './schema'
import { currentPrompt } from './state'
import type { Prompt, Rubric } from '@/lib/content/schema'
import { timelineContext, timelineUnknown } from './timeline'
import { evidenceReadiness } from './readiness'

export function candidatePrompts(state: Assessment, prompts: Prompt[]) {
  const support = new Map(
    evidenceReadiness(state).dimensions.map((d) => [d.vector, d.contribution])
  )
  const previous = currentPrompt(state)
  const horizonMissing = timelineContext(state) === null
  const timingUnexplored = horizonMissing && !timelineUnknown(state)
  return prompts.map((prompt) => {
    const uses = state.prompts.filter((p) => p.promptId === prompt.id).length
    const reason =
      prompt.family === 'root'
        ? 'root already issued'
        : prompt.noveltyGroup === 'horizon' &&
            !timingUnexplored &&
            !state.unresolved.some((u) => u.vector === 'capability_trajectory')
          ? 'timing already addressed'
          : prompt.noveltyGroup === 'conviction' && horizonMissing
            ? 'timing premise not established'
            : uses >= prompt.maxUses
              ? 'maximum uses reached'
              : prompt.readingLevel === 'expert' &&
                  state.familiarity.level !== 'expert'
                ? 'expert familiarity not established'
                : !prompt.permittedAfter.includes('*') &&
                    !prompt.permittedAfter.includes(previous.family)
                  ? 'transition excluded'
                  : prompt.prerequisites.some(
                        (v) => state.coverage[v] !== 'assessed'
                      )
                    ? 'prerequisite missing'
                    : prompt.exclusions.some(
                          (v) => state.coverage[v] === 'assessed'
                        )
                      ? 'coverage exclusion'
                      : null
    const convictionMissing = !state.answers.some((a) => a.hasConviction)
    const missing =
      (prompt.family === 'timeline' && timingUnexplored) ||
      (prompt.noveltyGroup === 'conviction' && convictionMissing)
        ? 1
        : prompt.targets.reduce(
            (sum, vector) => sum + 1 - (support.get(vector) ?? 0),
            0
          ) / prompt.targets.length
    const repetition = state.prompts.some(
      (p) =>
        prompts.find((item) => item.id === p.promptId)?.noveltyGroup ===
        prompt.noveltyGroup
    )
      ? 1
      : 0
    const calibration =
      timingUnexplored &&
      prompt.family === 'timeline' &&
      state.answers.length < 3
        ? 1
        : 0
    return { prompt, reason, missing, repetition, calibration }
  })
}

// Give an unexplored displayed axis one direct question before completion.
// Explicit indecision is already an answer, not an invitation to repeat it.
export function missingMapQuestion(state: Assessment) {
  const experiment =
    state.result?.evidenceRevision === state.evidenceRevision
      ? state.result.experiment
      : undefined
  if (!experiment) return null
  return (
    (['influence', 'transformation'] as const)
      .map((axis) => ({
        axis,
        component: experiment[axis],
        promptId: `${axis}.general`
      }))
      .filter(
        ({ component, promptId }) =>
          !state.prompts.some((prompt) => prompt.promptId === promptId) &&
          (component.distribution.explicitly_unknown ?? 0) < 0.5 &&
          (component.distribution.not_expressed ?? 0) >= 0.35
      )
      .sort(
        (a, b) =>
          (b.component.distribution.not_expressed ?? 0) -
          (a.component.distribution.not_expressed ?? 0)
      )[0]?.promptId ?? null
  )
}

export function rankCandidates(
  state: Assessment,
  prompts: Prompt[],
  answers: Record<string, ModelAnswer>,
  rubric: Rubric
) {
  const normalized = (id: string) =>
    answers[id]?.type === 'score' ? answers[id].score / 3 : 0
  const weights = rubric.routingWeights
  return candidatePrompts(state, prompts)
    .filter((item) => !item.reason && answers[`${item.prompt.id}:coverage`])
    .map((item) => {
      const positionGap =
        item.prompt.targets.reduce((sum, vector) => {
          const position = answers[`outlook:${vector}:position`]
          if (position?.type !== 'choice') return sum
          const directlyAnswered = state.answers.some((answer) => {
            const issued = state.prompts.find(
              (p) => p.id === answer.promptInstanceId
            )
            const prompt = prompts.find((p) => p.id === issued?.promptId)
            return prompt?.targets.length === 1 && prompt.targets[0] === vector
          })
          // Broad opening uncertainty may concern the net balance, not each
          // component. Offer one direct elicitation; accept unknown after it.
          return (
            sum +
            (position.probabilities.not_expressed ?? 0) +
            (directlyAnswered
              ? 0
              : (position.probabilities.explicitly_unknown ?? 0))
          )
        }, 0) / item.prompt.targets.length
      const coverage =
        normalized(`${item.prompt.id}:coverage`) * (1 + positionGap * 0.25)
      // A distribution's small nonzero score is not evidence that an issue exists.
      const hasIssue = (kind: 'ambiguity' | 'tension') =>
        state.unresolved.some(
          (issue) =>
            issue.kind === kind && item.prompt.targets.includes(issue.vector)
        )
      const ambiguity = hasIssue('ambiguity')
        ? normalized(`${item.prompt.id}:ambiguity`)
        : 0
      const tension = hasIssue('tension')
        ? normalized(`${item.prompt.id}:tension`)
        : 0
      const noveltyAnswer = answers[`${item.prompt.id}:novelty`]
      const gap = answers[`${item.prompt.id}:gap`]
      const answerableGap =
        gap?.type === 'choice'
          ? (gap.probabilities.unasked ?? 0) + (gap.probabilities.partial ?? 0)
          : 1
      const novelty = Math.min(
        noveltyAnswer?.type === 'noul' ? noveltyAnswer.noul : 0,
        answerableGap
      )
      const basis = answers['outlook:central_basis']
      const basisGap =
        item.prompt.id === 'grounding.general' && basis?.type === 'noul'
          ? 1 - basis.noul
          : 0
      const unaskedCrux =
        item.prompt.id === 'crux.general' &&
        state.coverage.updateability !== 'assessed'
      const noveltyThreshold =
        basisGap >= 0.75 || unaskedCrux ? 0.5 : followUpNoveltyThreshold
      const projection = normalized(`${item.prompt.id}:projection`)
      const priority =
        basisGap +
        weights.coverage * coverage +
        weights.ambiguity * ambiguity +
        weights.tension * tension +
        weights.projection * projection -
        weights.effort * item.prompt.effort -
        weights.repetition * item.repetition
      return {
        ...item,
        coverage,
        ambiguity,
        tension,
        projection,
        novelty,
        noveltyThreshold,
        priority
      }
    })
    .sort(
      (a, b) =>
        Number(worthwhileCandidates([b]).length > 0) -
          Number(worthwhileCandidates([a]).length > 0) ||
        b.priority - a.priority ||
        a.prompt.id.localeCompare(b.prompt.id)
    )
}

// Initial experimental threshold: semantic novelty, not statistical significance.
// Keep the ranking visible for diagnostics and voluntary deeper exploration.
export const followUpNoveltyThreshold = 0.6

export function worthwhileCandidates<
  T extends { novelty: number; priority: number; noveltyThreshold?: number }
>(candidates: T[]) {
  return candidates.filter(
    (candidate) =>
      candidate.novelty >=
        (candidate.noveltyThreshold ?? followUpNoveltyThreshold) &&
      candidate.priority > 0
  )
}
