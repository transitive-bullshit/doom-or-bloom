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
          : prompt.trigger
            ? 'issued only by its trigger'
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
// is an answer, not an invitation to repeat. Last, a split outlook reading gets
// one resolving question.
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
  // P(doom) is best effort; "no idea" still counts as an answer.
  if (
    available('risk.chance') &&
    !state.prompts.some((prompt) => prompt.promptId === 'risk.catastrophe')
  )
    return 'risk.chance'
  // With the core questions settled, a reading split between two neighboring
  // outlook levels gets one question that names both readings.
  const split = splitOutlook(answers['facet:outlook_orientation'])
  const askedSplit = state.prompts.some(
    (issued) =>
      prompts.find((prompt) => prompt.id === issued.promptId)?.trigger ===
      'split_outlook'
  )
  if (split && !askedSplit && available(splitOutlookPrompt(split)))
    return splitOutlookPrompt(split)
  return null
}

// On 219 self-placements, readings split between two neighboring outlook
// levels sat 0.161 from people's own placements, against 0.135 for the rest,
// and a direct question about the lean moved readings closer than an ordinary
// follow-up (docs/research/engine-design-review-2026-09-29.md).
const splitOutlookThresholds = { top: 0.6, runnerUp: 0.25 } as const
export const splitOutlookPairs = ['0-1', '1-2', '2-3', '3-4'] as const
export const splitOutlookPrompt = (pair: string) => `outlook.lean.${pair}`

/**
 * The pair of neighboring outlook levels a placed reading is split between,
 * such as "1-2", or null when one level clearly leads. Probabilities are
 * normalized over the five levels, as the map's outlook is.
 */
export function splitOutlook(answer: ModelAnswer | undefined) {
  if (answer?.type !== 'choice') return null
  const levels = [0, 1, 2, 3, 4].map(
    (level) => answer.probabilities[String(level)] ?? 0
  )
  const mass = levels.reduce((sum, probability) => sum + probability, 0)
  // An unplaced outlook is a different gap, not a split reading.
  if (mass < 0.7) return null
  const [top, next] = levels
    .map((probability, level) => ({ probability: probability / mass, level }))
    .sort((a, b) => b.probability - a.probability || a.level - b.level)
  if (
    !top ||
    !next ||
    top.probability >= splitOutlookThresholds.top ||
    next.probability < splitOutlookThresholds.runnerUp ||
    Math.abs(top.level - next.level) !== 1
  )
    return null
  const low = Math.min(top.level, next.level)
  return `${low}-${low + 1}` as (typeof splitOutlookPairs)[number]
}

// No other question asks about the participant's own life or work
// (docs/research/personal-question-2026-10-04.md). Once the core map questions
// are settled and routing has decided to continue, this question takes the
// next ordinary follow-up slot, once per assessment including inherited
// history. It is not a ranked candidate, so it is never itself a reason to
// withhold results; a pending worthwhile follow-up comes one question later.
export const personalPrompt = 'personal.life-work'

/** The personal question, when routing next issues an ordinary follow-up. */
export function personalQuestion(state: Assessment, prompts: Prompt[]) {
  return prompts.some(
    (prompt) =>
      prompt.id === personalPrompt &&
      prompt.trigger === 'first_follow_up' &&
      !prompt.retired
  ) && !state.prompts.some((issued) => issued.promptId === personalPrompt)
    ? personalPrompt
    : null
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
