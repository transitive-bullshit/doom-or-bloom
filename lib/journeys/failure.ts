// Only locally authored messages belong in persisted journey failures.
export class JourneyFailure extends Error {}

export function providerFailure(provider: string, error: unknown) {
  if (error instanceof JourneyFailure) return error
  const status =
    error instanceof Error &&
    'status' in error &&
    typeof error.status === 'number'
      ? error.status
      : null
  const message = error instanceof Error ? error.message : ''
  const category = /token|context|too large/i.test(message)
    ? 'context limit'
    : /timeout|timed out|abort/i.test(message)
      ? 'timeout or cancellation'
      : /budget/i.test(message)
        ? 'request budget'
        : 'provider or transport failure'
  return new JourneyFailure(
    `${provider}: ${category}${status ? ` (HTTP ${status})` : ''}.`
  )
}
