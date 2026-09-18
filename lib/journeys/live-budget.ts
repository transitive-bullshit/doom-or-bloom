import 'server-only'
import type { Provider } from '@/lib/server/provider'
import { limits } from '@/lib/assessment/schema'
import { JourneyFailure, providerFailure } from './failure'

// Published USD per million tokens, checked 2026-09-18. Cached input is
// deliberately charged at the full rate in this development estimate.
export const journeyRates = {
  openai: { input: 0.75, output: 4.5 },
  jev: { input: 0.042, output: 0 }
} as const

export function liveJourneyBudget(maximumUsd = 2) {
  if (!Number.isFinite(maximumUsd) || maximumUsd <= 0 || maximumUsd > 20)
    throw new Error('Journey cost limit must be greater than 0 and at most $20')
  let reservedUsd = 0
  let estimatedUsd = 0
  const usage = {
    openai: { requests: 0, inputTokens: 0, outputTokens: 0 },
    jev: { requests: 0, inputTokens: 0, outputTokens: 0 }
  }
  const price = (kind: keyof typeof usage, input: number, output: number) =>
    (input * journeyRates[kind].input + output * journeyRates[kind].output) /
    1_000_000
  return {
    reserve(kind: keyof typeof usage, inputBound: number, outputBound: number) {
      const reservation = price(kind, inputBound, outputBound)
      if (estimatedUsd + reservedUsd + reservation > maximumUsd)
        throw new JourneyFailure('Journey cost budget exhausted')
      reservedUsd += reservation
      // A failed/unknown request retains its reservation. Never retry here.
      return (input: number, output: number, requests: number) => {
        reservedUsd -= reservation
        estimatedUsd += price(kind, input, output)
        usage[kind].requests += requests
        usage[kind].inputTokens += input
        usage[kind].outputTokens += output
      }
    },
    report: () => ({
      maximumUsd,
      estimatedUsd,
      reservedUsd: Math.max(0, reservedUsd),
      rates: journeyRates,
      usage: structuredClone(usage)
    })
  }
}
export type LiveJourneyBudget = ReturnType<typeof liveJourneyBudget>

export function meterJev(
  provider: Provider,
  budget: LiveJourneyBudget
): Provider {
  return {
    kind: provider.kind,
    async evaluate(state, questions, signal, attemptBudget, captureDebug) {
      // Reserve conservatively for every possible physical attempt, including
      // fallback batches. Actual provider usage replaces this on success.
      const inputBound =
        Buffer.byteLength(JSON.stringify({ state, questions })) + 4096
      const settle = budget.reserve(
        'jev',
        inputBound * (attemptBudget ?? limits.providerAttempts),
        0
      )
      const result = await provider
        .evaluate(state, questions, signal, attemptBudget, captureDebug)
        .catch((err: unknown) => {
          throw providerFailure('Jev', err)
        })
      settle(
        result.usage.input_tokens,
        result.usage.output_tokens,
        result.attempts
      )
      return result
    }
  }
}
