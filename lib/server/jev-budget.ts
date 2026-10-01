import { APIError } from '@typesafe-ai/sdk'

// The app's own ceiling on participant Jev spend (docs/TYPESAFE.md#spend-budget).
// TypeSafe is prepaid with auto-recharge and has no monthly cap, so this is the
// only hard limit. Raising it is a deliberate environment change plus redeploy.
const defaultJevBudgetUsd = { monthly: 150, daily: 50 } as const
const jevBudgetVariables = {
  monthly: 'JEV_MONTHLY_BUDGET_USD',
  daily: 'JEV_DAILY_BUDGET_USD'
} as const

// docs.typesafe.ai/models (checked 2026-10-02): jev-1.13.0 costs $42 per
// billion input tokens and output tokens are free. Spend is estimated from the
// usage TypeSafe reports for each successful request; the API reports no cost.
const jevNanoUsdPerToken = { input: 42, output: 0 } as const

// After TypeSafe answers 402 (no credits), skip Jev calls for this long before
// one real request probes again. Auto-recharge usually refills within minutes.
export const providerHoldMs = 10 * 60_000

// Signal once as estimated spend crosses each fraction of a budget.
const budgetThresholds = [0.8, 1] as const

export type JevUsage = {
  input_tokens: number
  output_tokens: number
  requests: number
}
export type BudgetPeriod = 'day' | 'month'
export type JevBudgetLimits = Record<BudgetPeriod, number>
export type BudgetBlock = 'budget_exhausted' | 'provider_out_of_credits'

const nano = 1e9
export const usdToNano = (usd: number) => Math.round(usd * nano)
export const nanoToUsd = (value: number) => value / nano

/** Budget limits in nano-USD. Accepts a non-negative decimal; 0 pauses Jev. */
function parseBudgetUsd(value: string | undefined) {
  if (value === undefined || value.trim() === '') return undefined
  return /^\d+(?:\.\d+)?$/.test(value.trim()) ? Number(value) : null
}
export function jevBudgetLimits(
  env: Record<string, string | undefined> = process.env
): JevBudgetLimits & { invalid: string[] } {
  const invalid: string[] = []
  const read = (period: 'monthly' | 'daily') => {
    const parsed = parseBudgetUsd(env[jevBudgetVariables[period]])
    if (parsed === null) invalid.push(jevBudgetVariables[period])
    // An invalid value keeps the default ceiling rather than removing it.
    return usdToNano(parsed ?? defaultJevBudgetUsd[period])
  }
  return { month: read('monthly'), day: read('daily'), invalid }
}

export function jevCostNanoUsd(usage: Omit<JevUsage, 'requests'>) {
  return (
    usage.input_tokens * jevNanoUsdPerToken.input +
    usage.output_tokens * jevNanoUsdPerToken.output
  )
}

/** UTC day and month keys (`YYYY-MM-DD`, the month as its first day). */
export function budgetPeriods(now: Date): Record<BudgetPeriod, string> {
  const day = now.toISOString().slice(0, 10)
  return { day, month: `${day.slice(0, 7)}-01` }
}

export type BudgetSpend = {
  spent: Record<BudgetPeriod, number>
  outOfCreditsAt: Date | null
}
export type JevBudgetState = {
  blocked: BudgetBlock | null
  spentUsd: Record<BudgetPeriod, number>
  limitUsd: Record<BudgetPeriod, number>
}
export function budgetState(
  { spent, outOfCreditsAt }: BudgetSpend,
  limits: JevBudgetLimits,
  now: Date
): JevBudgetState {
  const over = spent.month >= limits.month || spent.day >= limits.day
  const held =
    outOfCreditsAt !== null &&
    now.getTime() - outOfCreditsAt.getTime() < providerHoldMs
  return {
    blocked: over
      ? 'budget_exhausted'
      : held
        ? 'provider_out_of_credits'
        : null,
    spentUsd: { day: nanoToUsd(spent.day), month: nanoToUsd(spent.month) },
    limitUsd: { day: nanoToUsd(limits.day), month: nanoToUsd(limits.month) }
  }
}

/** Thresholds crossed by one increment; exactly one writer sees each crossing. */
export function crossedThresholds(
  before: number,
  after: number,
  limit: number
) {
  return budgetThresholds.filter((fraction) => {
    const mark = limit * fraction
    return before < mark && after >= mark
  })
}

/** Thrown before any Jev call while a budget is used up or TypeSafe is held. */
export class JevBudgetExhausted extends Error {
  constructor(readonly block: BudgetBlock) {
    super(
      block === 'budget_exhausted'
        ? 'The Jev spend budget is used up'
        : 'TypeSafe reported no available credits'
    )
  }
}

// TypeSafe documents no billing error. A 402 with
// {"detail":{"error_type":"billing_error"}} was observed by third parties
// (October 2026); match the status and structured codes, never free text.
const billingCode =
  /billing|credit|balance|insufficient_(?:funds|quota)|payment_required/i
function structuredCodes(body: unknown) {
  const record = (value: unknown) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : undefined
  const root = record(body)
  const nested = [root, record(root?.detail), record(root?.error)]
  return nested.flatMap((value) =>
    ['error_type', 'type', 'code']
      .map((key) => value?.[key])
      .filter((code): code is string => typeof code === 'string')
  )
}
export function providerErrorType(error: APIError) {
  return structuredCodes(error.body).find((code) =>
    /^[A-Za-z][\w.-]{0,59}$/.test(code)
  )
}
export function isProviderOutOfCredits(error: unknown, depth = 0): boolean {
  if (!(error instanceof Error) || depth > 4) return false
  if (
    error instanceof APIError &&
    (error.status === 402 ||
      structuredCodes(error.body).some((code) => billingCode.test(code)))
  )
    return true
  return isProviderOutOfCredits(error.cause, depth + 1)
}

/** The stored failure category for an evaluation error caused by a budget. */
export function budgetFailureCategory(
  error: unknown,
  depth = 0
): BudgetBlock | null {
  if (!(error instanceof Error) || depth > 4) return null
  if (error instanceof JevBudgetExhausted) return error.block
  if (isProviderOutOfCredits(error)) return 'provider_out_of_credits'
  return budgetFailureCategory(error.cause, depth + 1)
}
