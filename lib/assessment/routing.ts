import type { Assessment, ModelAnswer } from './schema'
import { currentPrompt } from './state'
import type { Prompt, Rubric } from '@/lib/content/schema'

export function candidatePrompts(state: Assessment, prompts: Prompt[]) {
  const previous = currentPrompt(state)
  return prompts.map((prompt) => {
    const uses = state.prompts.filter((p) => p.promptId === prompt.id).length
    const reason =
      prompt.family === 'root'
        ? 'root already issued'
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
    const horizonMissing =
      !state.answers.some((a) => a.context?.horizonSpanId) &&
      !state.evidence.some((e) => e.status !== 'superseded' && e.horizonSpanId)
    const convictionMissing =
      !state.answers.some((a) => a.context?.convictionSpanId) &&
      !state.evidence.some(
        (e) => e.status !== 'superseded' && e.convictionSpanId
      )
    const missing =
      (prompt.family === 'timeline' && horizonMissing) ||
      (prompt.family === 'conviction' && convictionMissing)
        ? 1
        : prompt.targets.filter((v) => state.coverage[v] !== 'assessed')
            .length / prompt.targets.length
    const repetition = state.prompts.some(
      (p) =>
        prompts.find((item) => item.id === p.promptId)?.noveltyGroup ===
        prompt.noveltyGroup
    )
      ? 1
      : 0
    const calibration =
      horizonMissing && prompt.family === 'timeline' && state.answers.length < 3
        ? 1
        : 0
    return { prompt, reason, missing, repetition, calibration }
  })
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
      const coverage = item.missing * normalized(`${item.prompt.id}:coverage`)
      const ambiguity = normalized(`${item.prompt.id}:ambiguity`)
      const tension = normalized(`${item.prompt.id}:tension`)
      const projection = normalized(`${item.prompt.id}:projection`)
      const priority =
        weights.calibration * item.calibration +
        weights.coverage * coverage +
        weights.ambiguity * ambiguity +
        weights.tension * tension +
        weights.projection * projection -
        weights.effort * item.prompt.effort -
        weights.repetition * item.repetition
      return { ...item, coverage, ambiguity, tension, projection, priority }
    })
    .sort(
      (a, b) =>
        b.priority - a.priority || a.prompt.id.localeCompare(b.prompt.id)
    )
}
