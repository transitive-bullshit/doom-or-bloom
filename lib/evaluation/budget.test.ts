import { expect, test } from 'vitest'
import { budgetedProvider, paidRequestBudget } from './budget'
import type { Provider } from '@/lib/server/provider'

const success = (attempts: number) => ({
  model: 'fixture-v1',
  answers: {},
  usage: { input_tokens: 0, output_tokens: 0 },
  attempts
})

test('credentials alone never authorize a paid evaluation', () => {
  for (const args of [
    [],
    ['--allow-paid'],
    ['--max-requests=1'],
    ['--allow-paid', '--max-requests=0'],
    ['--allow-paid', '--max-requests=25'],
    ['--allow-paid', '--max-requests=1', '--max-requests=2']
  ])
    expect(() => paidRequestBudget(args)).toThrow('Paid evaluation is disabled')
  expect(paidRequestBudget(['--allow-paid', '--max-requests=3'])).toBe(3)
})

test('the whole run shares a physical ceiling, including retries and stages', async () => {
  const granted: number[] = []
  const source: Provider = {
    kind: 'fixture',
    evaluate: async (_state, _questions, _signal, budget) => {
      granted.push(budget!)
      return success(Math.min(2, budget!))
    }
  }
  const run = budgetedProvider(source, 3)
  await run.provider.evaluate({}, {})
  await run.provider.evaluate({}, {})
  await expect(run.provider.evaluate({}, {})).rejects.toThrow('exhausted')
  expect(granted).toEqual([3, 1])
  expect(run.report()).toEqual({ maximum: 3, usedOrReserved: 3 })
})

test('unknown failure cost is reserved before any further calls', async () => {
  let calls = 0
  const run = budgetedProvider(
    {
      kind: 'fixture',
      evaluate: async () => {
        calls++
        throw new Error('Transport failed')
      }
    },
    4
  )
  await expect(run.provider.evaluate({}, {})).rejects.toThrow(
    'Transport failed'
  )
  await expect(run.provider.evaluate({}, {})).rejects.toThrow('exhausted')
  expect(calls).toBe(1)
  expect(run.report().usedOrReserved).toBe(4)
})

test('concurrent stages cannot both spend a reserved budget', async () => {
  let release!: () => void
  const pending = new Promise<void>((resolve) => {
    release = resolve
  })
  const run = budgetedProvider(
    {
      kind: 'fixture',
      evaluate: async () => {
        await pending
        return success(1)
      }
    },
    2
  )
  const first = run.provider.evaluate({}, {})
  await expect(run.provider.evaluate({}, {})).rejects.toThrow('exhausted')
  release()
  await first
  expect(run.report().usedOrReserved).toBe(1)
})
