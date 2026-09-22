import { expect, test, vi } from 'vitest'
import {
  apiDiagnostics,
  errorDetails,
  isContextOverflow
} from './error-reporting'

test('server errors preserve correlation and causes without logging error messages or bodies', () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {})
  try {
    const diagnostic = apiDiagnostics(
      new Request('http://localhost/api/assessment'),
      '/api/assessment'
    )
    diagnostic.report(
      new Error('PRIVATE_ANSWER', { cause: new TypeError('PRIVATE_KEY') }),
      500,
      { stage: 'D: projection', stateBytes: 84099 }
    )
    const output = log.mock.calls[0]![0] as string
    expect(output).not.toContain('PRIVATE_')
    expect(JSON.parse(output)).toMatchObject({
      requestId: diagnostic.headers['X-Request-ID'],
      route: '/api/assessment',
      status: 500,
      stage: 'D: projection',
      stateBytes: 84099,
      error: { type: 'Error', cause: { type: 'TypeError' } }
    })
  } finally {
    log.mockRestore()
  }
})

test('overflow classification is bounded even with cyclic error causes', () => {
  const error = new Error('private')
  error.cause = error
  expect(isContextOverflow(error)).toBe(false)
  expect(() => errorDetails(error)).not.toThrow()
})
