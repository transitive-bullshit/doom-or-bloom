import { EvaluationFailure } from '@/lib/server/provider'
import type { DebugRequest } from '@/lib/assessment/schema'

// Only locally authored messages belong in persisted journey failures.
export class JourneyFailure extends Error {
  evaluation?: { attempts: number; requests?: DebugRequest[] }
}

const validationMessages = new Set([
  'Unexpected number of provider answers',
  'Provider answer does not match its question',
  'Provider returned an unknown option',
  'Provider returned an invalid score scale',
  'Provider score disagrees with distribution',
  'Provider returned a different model version'
])

export function providerFailure(provider: string, error: unknown) {
  if (error instanceof JourneyFailure) return error
  const evaluation = error instanceof EvaluationFailure ? error : undefined
  if (evaluation) error = evaluation.cause
  const status =
    error instanceof Error &&
    'status' in error &&
    typeof error.status === 'number'
      ? error.status
      : null
  const message = error instanceof Error ? error.message : ''
  const category =
    (error instanceof Error && error.name === 'ZodError') ||
    validationMessages.has(message)
      ? 'response validation'
      : /token|context|too large/i.test(message)
        ? 'context limit'
        : /timeout|timed out|abort/i.test(message)
          ? 'timeout or cancellation'
          : /budget/i.test(message)
            ? 'request budget'
            : 'provider or transport failure'
  const failure = new JourneyFailure(
    `${provider}: ${category}${status ? ` (HTTP ${status})` : ''}.`
  )
  if (evaluation)
    failure.evaluation = {
      attempts: evaluation.attempts,
      requests: evaluation.requests
    }
  return failure
}
