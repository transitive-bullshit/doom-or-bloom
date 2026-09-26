import { afterEach, expect, test, vi } from 'vitest'
import { expectDiagnostics } from './diagnostics'

afterEach(() => vi.unstubAllGlobals())

test('only the expected diagnostic and count are silenced; all other arguments pass through', () => {
  // These outer spies stand in for the real console to verify forwarding.
  const errorOutput = vi.fn<(...args: unknown[]) => void>()
  const warnOutput = vi.fn<(...args: unknown[]) => void>()
  vi.stubGlobal('console', {
    ...console,
    error: (...args: unknown[]) => errorOutput(...args),
    warn: (...args: unknown[]) => warnOutput(...args)
  })
  const expected = {
    event: 'deliberate_failure',
    severity: 'error' as const,
    stage: 'D: projection',
    error: { code: 'ECONNRESET' }
  }
  const logs = expectDiagnostics(expected)
  const raw = JSON.stringify({
    ...expected,
    requestId: 'dynamic-id',
    error: { ...expected.error, stack: ['dynamic stack'] }
  })
  const otherCode = JSON.stringify({ ...expected, error: { code: 'ENOENT' } })
  const otherStage = JSON.stringify({ ...expected, stage: 'A: interpret' })
  const otherEvent = JSON.stringify({ ...expected, event: 'unrelated' })
  const error = new Error('unexpected')
  console.error(otherCode)
  console.error(otherStage)
  console.error(otherEvent)
  console.error('malformed {')
  console.error(null)
  console.error(raw, error)
  console.warn(raw)
  console.error(raw)
  expect(logs).toEqual([raw])
  console.error(raw) // A duplicate beyond the expected count stays visible.
  expect(errorOutput.mock.calls).toEqual([
    [otherCode],
    [otherStage],
    [otherEvent],
    ['malformed {'],
    [null],
    [raw, error],
    [raw]
  ])
  expect(warnOutput.mock.calls).toEqual([[raw]])
})

test('expected warnings use the same bounded matching without intercepting ordinary logs', () => {
  const warnOutput = vi.fn<(...args: unknown[]) => void>()
  const logOutput = vi.fn<(...args: unknown[]) => void>()
  vi.stubGlobal('console', {
    ...console,
    warn: (...args: unknown[]) => warnOutput(...args),
    log: (...args: unknown[]) => logOutput(...args)
  })
  const expected = { event: 'deliberate_warning', severity: 'warn' as const }
  const logs = expectDiagnostics({ ...expected, count: 2 })
  const raw = JSON.stringify(expected)
  console.warn(raw)
  console.warn(raw)
  console.warn(raw)
  console.log('still visible')
  expect(logs).toEqual([raw, raw])
  expect(warnOutput.mock.calls).toEqual([[raw]])
  expect(logOutput.mock.calls).toEqual([['still visible']])
})
