import { expectDiagnostics } from '@/tests/helpers/diagnostics'
import { expect, test } from 'vitest'
import {
  apiDiagnostics,
  errorDetails,
  isContextOverflow
} from './error-reporting'

test('server errors preserve correlation and causes without logging error messages or bodies', () => {
  const logs = expectDiagnostics({
    event: 'api_request_failed',
    severity: 'error',
    route: '/api/assessment',
    status: 500,
    stage: 'D: projection',
    error: { type: 'Error', cause: { type: 'TypeError' } }
  })
  const diagnostic = apiDiagnostics(
    new Request('http://localhost/api/assessment'),
    '/api/assessment'
  )
  diagnostic.report(
    new Error('PRIVATE_ANSWER', { cause: new TypeError('PRIVATE_KEY') }),
    500,
    { stage: 'D: projection', stateBytes: 84099 }
  )
  const output = logs[0]!
  expect(output).not.toContain('PRIVATE_')
  expect(JSON.parse(output)).toMatchObject({
    requestId: diagnostic.headers['X-Request-ID'],
    route: '/api/assessment',
    status: 500,
    stage: 'D: projection',
    stateBytes: 84099,
    error: { type: 'Error', cause: { type: 'TypeError' } }
  })
})

test('overflow classification is bounded even with cyclic error causes', () => {
  const error = new Error('private')
  error.cause = error
  expect(isContextOverflow(error)).toBe(false)
  expect(() => errorDetails(error)).not.toThrow()
})

test('database error codes remain diagnosable without exposing SQL or row contents', () => {
  const error = Object.assign(new Error('private SQL and row contents'), {
    code: '23514'
  })
  const detail = errorDetails(error)
  expect(detail.code).toBe('23514')
  expect(JSON.stringify(detail)).not.toContain('private SQL')
})
