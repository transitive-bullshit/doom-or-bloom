import { limits } from '@/lib/assessment/schema'
import type { Provider } from '@/lib/server/provider'

export function paidRequestBudget(args: string[]) {
  const budgetArg = args.find((arg) => arg.startsWith('--max-requests='))
  if (
    !args.includes('--allow-paid') ||
    !budgetArg ||
    args.length !== 2 ||
    !/^--max-requests=([1-9]|1[0-9]|2[0-4])$/.test(budgetArg)
  )
    throw new Error(
      'Paid evaluation is disabled. Explicitly pass --allow-paid and --max-requests=1..24 for a reviewed, budgeted run.'
    )
  return Number(budgetArg.split('=')[1])
}

export function budgetedProvider(
  provider: Provider,
  maximum: number,
  ceiling = 24
) {
  if (
    !Number.isInteger(maximum) ||
    maximum < 1 ||
    maximum > ceiling ||
    ceiling > 1536
  )
    throw new Error('Invalid evaluation request budget')
  let reserved = 0
  const bounded: Provider = {
    kind: provider.kind,
    evaluate: async (state, questions, signal, attemptBudget, captureDebug) => {
      const granted = Math.min(
        limits.providerAttempts,
        attemptBudget ?? limits.providerAttempts,
        maximum - reserved
      )
      if (!Number.isInteger(granted) || granted < 1)
        throw new Error('Evaluation request budget exhausted')
      // Reserve before awaiting to cover concurrent stages. On failure retain
      // the reservation because the physical request count may be unknown.
      reserved += granted
      const result = await provider.evaluate(
        state,
        questions,
        signal,
        granted,
        captureDebug
      )
      if (
        !Number.isInteger(result.attempts) ||
        result.attempts < 1 ||
        result.attempts > granted
      )
        throw new Error('Provider exceeded the evaluation request budget')
      reserved -= granted - result.attempts
      return result
    }
  }
  return {
    provider: bounded,
    report: () => ({ maximum, usedOrReserved: reserved })
  }
}
