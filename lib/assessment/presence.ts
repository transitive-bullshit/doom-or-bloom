import type { ModelAnswer } from './schema'

// These alternatives both support the same application decision. Confidence
// measures concentration across alternatives, not this combined probability.
export function supportProbability(answer: ModelAnswer | undefined) {
  if (answer?.type !== 'choice') return 0
  return Math.min(
    1,
    (answer.probabilities.stated ?? 0) +
      (answer.probabilities.strongly_implied ?? 0)
  )
}

export function supported(answer: ModelAnswer | undefined, threshold: number) {
  return supportProbability(answer) >= threshold
}
