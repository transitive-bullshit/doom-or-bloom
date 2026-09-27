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
        : prompt.retired
          ? 'retired'
          : prompt.noveltyGroup === 'horizon' &&
              !timingUnexplored &&
              !state.unresolved.some(
                (u) => u.vector === 'capability_trajectory'
              )
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

// The displayed result is the Doom–Bloom outlook, the scale of change and
// P(doom). Before ordinary follow-ups, ask the overall-impact question when the
// balance is still missing, and the scale and P(doom) questions once each
// (audit variant F). Without the direct scale question, answers about near-term
// change understated the eventual magnitude even when routing read a scale
// (0.7.0 validation: y error 0.158 unasked vs 0.091 asked). Explicit indecision
// is an answer, not an invitation to repeat.
export function mapGapQuestion(
  state: Assessment,
  answers: Record<string, ModelAnswer>,
  prompts: Prompt[]
) {
  const available = (id: string) =>
    prompts.some((prompt) => prompt.id === id && !prompt.retired) &&
    !state.prompts.some((prompt) => prompt.promptId === id)
  const probability = (answer: ModelAnswer | undefined, key: string) =>
    answer?.type === 'choice' ? (answer.probabilities[key] ?? 0) : null
  const overall = answers['facet:overall_outlook']
  if (
    available('impact.overall') &&
    (probability(overall, 'not_expressed') ?? 0) >= 0.35 &&
    (probability(overall, 'explicitly_unknown') ?? 1) < 0.5
  )
    return 'impact.overall'
  if (
    available('transformation.ultimate') &&
    (probability(answers['experiment:transformation'], 'explicitly_unknown') ??
      0) < 0.5
  )
    return 'transformation.ultimate'
  // P(doom) is best effort; the question also accepts "no idea".
  if (
    available('risk.chance') &&
    !state.prompts.some((prompt) => prompt.promptId === 'risk.catastrophe')
  )
    return 'risk.chance'
  return null
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
      // Grounding and crux questions compete on their own value; their former
      // bonuses existed only to satisfy the retired central-basis gate.
      const noveltyThreshold = followUpNoveltyThreshold
      const projection = normalized(`${item.prompt.id}:projection`)
      const priority =
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
