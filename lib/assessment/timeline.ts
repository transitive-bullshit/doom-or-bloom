import type { Assessment } from './schema'

export function timelineUnknown(state: Assessment) {
  const correction = state.answers.findLastIndex(
    (a) => a.correctionTarget === 'capability_trajectory'
  )
  const latest = state.answers
    .slice(Math.max(0, correction))
    .findLast((a) => a.hasHorizon || a.hasUnknownHorizon)
  return Boolean(latest?.hasUnknownHorizon && !latest.hasHorizon)
}

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
