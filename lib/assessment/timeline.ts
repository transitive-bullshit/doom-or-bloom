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

// Stored fingerprint claims for the timeline; displayed through
// `Claims.timeline*` messages.
export const timelineUnsettledClaim = 'You have not settled on a timeline.'
export function timelineExpressedClaim(answerNumber: number) {
  return `Timing expressed in answer ${answerNumber}; see the full answer for its scope and uncertainty.`
}
/** The answer number a timeline claim cites, or null. */
export function timelineClaimAnswer(claim: string) {
  const match =
    /^Timing expressed in answer (\d+); see the full answer for its scope and uncertainty\.$/u.exec(
      claim
    )
  return match ? Number(match[1]) : null
}
