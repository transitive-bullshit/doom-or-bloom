import type { Assessment } from './schema'

export function timelineContext(state: Assessment) {
  const correction = state.answers.findLastIndex(
    (answer) => answer.correctionTarget === 'capability_trajectory'
  )
  return (
    state.answers
      .slice(Math.max(0, correction))
      .findLast((answer) => answer.hasHorizon) ?? null
  )
}
