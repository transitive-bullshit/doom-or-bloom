import { expect, test } from 'vitest'
import { expectDiagnostics } from '@/tests/helpers/diagnostics'
import { diagnosticContext, withDiagnosticContext } from './diagnostic-context'
import { reportServerError } from './error-reporting'

test('concurrent request contexts stay isolated and explicit operation IDs win', async () => {
  const logs = expectDiagnostics({
    event: 'context_test',
    severity: 'error',
    count: 3
  })
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  const first = withDiagnosticContext(
    { requestId: 'first', route: '/api/tweet' },
    async () => {
      await gate
      reportServerError('context_test', new Error('private'), {})
      reportServerError('context_test', undefined, {
        requestId: 'operation-key'
      })
    }
  )
  await withDiagnosticContext(
    { requestId: 'second', route: '/api/auth/[...all]' },
    async () => {
      await Promise.resolve()
      reportServerError('context_test', undefined, {})
    }
  )
  release()
  await first
  expect(logs.map((log) => JSON.parse(log).requestId)).toEqual([
    'second',
    'first',
    'operation-key'
  ])
  expect(diagnosticContext()).toBeUndefined()
  expect(logs.join('')).not.toContain('private')
})
