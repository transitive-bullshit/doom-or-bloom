import type { Assessment } from './schema'

export function timelineContext(state: Assessment) {
  const correction = state.answers.findLastIndex(
    (answer) => answer.correctionTarget === 'capability_trajectory'
  )
  const active = state.evidence.filter(
    (entry) => entry.status !== 'superseded' && entry.status !== 'disputed'
  )
  for (let i = state.answers.length - 1; i >= Math.max(0, correction); i--) {
    const answer = state.answers[i]!
    const candidates = [
      answer.context?.horizonSpanId,
      ...active
        .filter((entry) => entry.answerId === answer.id)
        .map((entry) => entry.horizonSpanId)
    ]
    const span = answer.spans.find((span) => candidates.includes(span.id))
    if (span) return { answer, span }
  }
  return null
}
