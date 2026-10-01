import { APIError } from '@typesafe-ai/sdk'
import { expect, test } from 'vitest'
import { AssessmentFailure } from './assessment-failure'
import { errorDetails } from './error-reporting'
import {
  JevBudgetExhausted,
  budgetFailureCategory,
  budgetPeriods,
  budgetState,
  crossedThresholds,
  isProviderOutOfCredits,
  jevBudgetLimits,
  jevCostNanoUsd,
  providerHoldMs,
  usdToNano
} from './jev-budget'
import { EvaluationFailure } from './provider'

const response = (status: number, body: unknown) =>
  APIError.fromResponse(status, body, new Headers())
// The body third parties observed when a TypeSafe organization ran out of credits.
const billing = () =>
  response(402, {
    detail: {
      error_type: 'billing_error',
      message: 'Your organization has no available TypeSafe API credits.'
    }
  })
const trace = {
  assessmentId: 'a',
  requestId: 'r',
  baseRevision: 0,
  stages: [],
  decisions: [],
  elapsedMs: 0
}

test('budget limits default to $150 a month and $50 a day and accept explicit overrides', () => {
  expect(jevBudgetLimits({})).toEqual({
    month: usdToNano(150),
    day: usdToNano(50),
    invalid: []
  })
  expect(
    jevBudgetLimits({
      JEV_MONTHLY_BUDGET_USD: '300',
      JEV_DAILY_BUDGET_USD: '0'
    })
  ).toEqual({ month: usdToNano(300), day: 0, invalid: [] })
  expect(jevBudgetLimits({ JEV_DAILY_BUDGET_USD: ' 12.5 ' }).day).toBe(
    usdToNano(12.5)
  )
})

test('a malformed budget keeps the default ceiling and names the variable', () => {
  for (const value of ['$300', '-1', '1e3', 'unlimited', 'Infinity'])
    expect(jevBudgetLimits({ JEV_MONTHLY_BUDGET_USD: value })).toEqual({
      month: usdToNano(150),
      day: usdToNano(50),
      invalid: ['JEV_MONTHLY_BUDGET_USD']
    })
})

test('spend is priced from reported input tokens at $42 per billion', () => {
  // The production first stage measured 7,155 input tokens on 2026-09-26.
  expect(jevCostNanoUsd({ input_tokens: 7_155, output_tokens: 900 })).toBe(
    300_510
  )
  expect(
    jevCostNanoUsd({ input_tokens: 1_000_000, output_tokens: 1_000_000 })
  ).toBe(usdToNano(0.042))
})

test('budget periods are UTC days and months regardless of the server zone', () => {
  expect(budgetPeriods(new Date('2026-10-31T23:59:59.999Z'))).toEqual({
    day: '2026-10-31',
    month: '2026-10-01'
  })
  expect(budgetPeriods(new Date('2026-11-01T00:00:00.000Z'))).toEqual({
    day: '2026-11-01',
    month: '2026-11-01'
  })
})

test('either budget, or an active TypeSafe credit hold, blocks new Jev calls', () => {
  const limits = { month: 100, day: 10 }
  const now = new Date('2026-10-02T12:00:00Z')
  const state = (month: number, day: number, outOfCreditsAt: Date | null) =>
    budgetState({ spent: { month, day }, outOfCreditsAt }, limits, now).blocked
  expect(state(99, 9, null)).toBeNull()
  expect(state(100, 0, null)).toBe('budget_exhausted')
  expect(state(0, 10, null)).toBe('budget_exhausted')
  const recent = new Date(now.getTime() - providerHoldMs + 1)
  const expired = new Date(now.getTime() - providerHoldMs)
  expect(state(0, 0, recent)).toBe('provider_out_of_credits')
  expect(state(0, 0, expired)).toBeNull()
  // Our own budget is the longer-lived reason when both apply.
  expect(state(100, 0, recent)).toBe('budget_exhausted')
  expect(
    budgetState(
      {
        spent: { month: usdToNano(120), day: usdToNano(1) },
        outOfCreditsAt: null
      },
      { month: usdToNano(150), day: usdToNano(50) },
      now
    )
  ).toEqual({
    blocked: null,
    spentUsd: { month: 120, day: 1 },
    limitUsd: { month: 150, day: 50 }
  })
})

test('a threshold is crossed by exactly one increment', () => {
  expect(crossedThresholds(0, 79, 100)).toEqual([])
  expect(crossedThresholds(79, 80, 100)).toEqual([0.8])
  expect(crossedThresholds(80, 99, 100)).toEqual([])
  expect(crossedThresholds(99, 100, 100)).toEqual([1])
  expect(crossedThresholds(70, 120, 100)).toEqual([0.8, 1])
  expect(crossedThresholds(100, 130, 100)).toEqual([])
  // A zero budget pauses Jev without a crossing to report.
  expect(crossedThresholds(0, 5, 0)).toEqual([])
})

test('TypeSafe out-of-credit responses are recognized through every wrapper', () => {
  const error = billing()
  expect(error.status).toBe(402)
  expect(isProviderOutOfCredits(error)).toBe(true)
  const wrapped = new AssessmentFailure(trace, new EvaluationFailure(error, 1))
  expect(isProviderOutOfCredits(wrapped)).toBe(true)
  expect(budgetFailureCategory(wrapped)).toBe('provider_out_of_credits')
  // A bare 402 counts even without a body.
  expect(isProviderOutOfCredits(response(402, undefined))).toBe(true)
  // A structured billing code under another status counts too.
  for (const body of [
    { detail: { error_type: 'billing_error' } },
    { error: { type: 'insufficient_quota' } },
    { code: 'credit_balance_exhausted' }
  ])
    expect(isProviderOutOfCredits(response(403, body))).toBe(true)
})

test('other provider failures and free text are never read as a budget block', () => {
  for (const error of [
    response(400, { detail: { error_type: 'max_tokens_exceeded' } }),
    response(403, { message: 'Forbidden: no available credits' }),
    response(429, { detail: { error_type: 'rate_limit_exceeded' } }),
    response(500, 'billing service unavailable'),
    new Error('credit balance'),
    new EvaluationFailure(new Error('timeout'), 2)
  ]) {
    expect(isProviderOutOfCredits(error)).toBe(false)
    expect(budgetFailureCategory(error)).toBeNull()
  }
  expect(isProviderOutOfCredits('402')).toBe(false)
})

test('our own budget block keeps its reason through the engine wrapper', () => {
  for (const block of ['budget_exhausted', 'provider_out_of_credits'] as const)
    expect(
      budgetFailureCategory(
        new AssessmentFailure(trace, new JevBudgetExhausted(block))
      )
    ).toBe(block)
})

test('diagnostics name budget blocks and the provider code without its message', () => {
  const details = errorDetails(new EvaluationFailure(billing(), 1))
  expect(details.cause).toMatchObject({
    type: 'TypeSafeAPIError',
    code: 'provider_http_402',
    status: 402,
    providerErrorType: 'billing_error'
  })
  expect(JSON.stringify(details)).not.toContain('organization')
  expect(
    errorDetails(new JevBudgetExhausted('budget_exhausted'))
  ).toMatchObject({ code: 'budget_exhausted' })
})
