import { APIError } from '@typesafe-ai/sdk'
import { expect, test, vi } from 'vitest'
import { expectDiagnostics } from '@/tests/helpers/diagnostics'
import { JevBudgetExhausted, type JevBudgetState } from './jev-budget'
import { jevBudgetGuard, type JevBudgetStore } from './jev-budget-store'
import { EvaluationFailure } from './provider'

function fakeStore(state: () => Promise<JevBudgetState>) {
  const store = {
    state: vi.fn<JevBudgetStore['state']>(state),
    record: vi.fn<JevBudgetStore['record']>(async () => []),
    markProviderOutOfCredits: vi.fn<JevBudgetStore['markProviderOutOfCredits']>(
      async () => true
    )
  }
  return store as typeof store & JevBudgetStore
}
const open =
  (blocked: JevBudgetState['blocked'] = null) =>
  async () => ({
    blocked,
    spentUsd: { day: 0, month: 0 },
    limitUsd: { day: 50, month: 150 }
  })

test('an operation checks the budget once, at its first Jev call', async () => {
  const store = fakeStore(open())
  const guard = jevBudgetGuard(store)
  expect(store.state).not.toHaveBeenCalled()
  await guard.check()
  await guard.check()
  expect(store.state).toHaveBeenCalledTimes(1)
})

test.each(['budget_exhausted', 'provider_out_of_credits'] as const)(
  'a %s block stops the operation before any Jev call',
  async (block) => {
    const guard = jevBudgetGuard(fakeStore(open(block)))
    await expect(guard.check()).rejects.toEqual(new JevBudgetExhausted(block))
    await expect(guard.check()).rejects.toBeInstanceOf(JevBudgetExhausted)
  }
)

test('an unreadable budget fails open with a diagnostic', async () => {
  expectDiagnostics({
    event: 'jev_budget_unavailable',
    severity: 'error',
    application: { effect: 'budget_check_skipped' }
  })
  const guard = jevBudgetGuard(
    fakeStore(async () => {
      throw new Error('relation "jev_spend" does not exist')
    })
  )
  await expect(guard.check()).resolves.toBeUndefined()
})

test('only an out-of-credits failure starts a provider hold', async () => {
  const store = fakeStore(open())
  const guard = jevBudgetGuard(store)
  await guard.failed(
    new EvaluationFailure(
      APIError.fromResponse(429, { message: 'Busy' }, new Headers()),
      2
    )
  )
  expect(store.markProviderOutOfCredits).not.toHaveBeenCalled()
  await guard.failed(
    new EvaluationFailure(
      APIError.fromResponse(
        402,
        { detail: { error_type: 'billing_error' } },
        new Headers()
      ),
      1
    )
  )
  expect(store.markProviderOutOfCredits).toHaveBeenCalledTimes(1)
})

test('successful calls are recorded once per operation, even when it fails later', async () => {
  const store = fakeStore(open())
  const guard = jevBudgetGuard(store)
  await guard.flush()
  expect(store.record).not.toHaveBeenCalled()
  guard.add({ input_tokens: 7_000, output_tokens: 300 })
  guard.add({ input_tokens: 2_000, output_tokens: 0 })
  await guard.flush()
  await guard.flush()
  expect(store.record).toHaveBeenCalledTimes(1)
  expect(store.record).toHaveBeenCalledWith({
    input_tokens: 9_000,
    output_tokens: 300,
    requests: 2
  })
})

test('a failed spend write is reported without failing the operation', async () => {
  expectDiagnostics({
    event: 'jev_budget_unavailable',
    severity: 'error',
    application: { effect: 'spend_not_recorded' },
    requests: 1,
    inputTokens: 10
  })
  const store = fakeStore(open())
  store.record.mockRejectedValueOnce(new Error('connection reset'))
  const guard = jevBudgetGuard(store)
  guard.add({ input_tokens: 10, output_tokens: 0 })
  await expect(guard.flush()).resolves.toBeUndefined()
})
