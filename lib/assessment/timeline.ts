import type { Assessment } from './schema'

function latestTiming(state: Assessment) {
  const correction = state.answers.findLastIndex(
    (a) => a.correctionTarget === 'capability_trajectory'
  )
  return state.answers
    .slice(Math.max(0, correction))
    .findLast((a) => a.hasHorizon || a.hasUnknownHorizon)
}

export function timelineUnknown(state: Assessment) {
  const latest = latestTiming(state)
  return Boolean(latest?.hasUnknownHorizon && !latest.hasHorizon)
}

export function timelineContext(state: Assessment) {
  const latest = latestTiming(state)
  return latest?.hasHorizon ? latest : null
}
