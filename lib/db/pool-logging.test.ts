import { EventEmitter } from 'node:events'
import { afterEach, expect, test, vi } from 'vitest'
import { expectDiagnostics } from '@/tests/helpers/diagnostics'
import { getPool } from './index'

vi.mock('./config', () => ({
  databaseUrl: () => 'postgres://private-credentials'
}))
vi.mock('pg', () => ({
  Pool: class extends EventEmitter {
    totalCount = 2
    idleCount = 1
    waitingCount = 0
  }
}))
afterEach(() => {
  delete (globalThis as typeof globalThis & { assessmentPool?: unknown })
    .assessmentPool
})

test('one pool listener reports idle-client errors without connection secrets', () => {
  const logs = expectDiagnostics({
    event: 'database_pool_error',
    severity: 'error'
  })
  const pool = getPool()
  expect(getPool()).toBe(pool)
  expect(pool.listenerCount('error')).toBe(1)
  expect(() =>
    pool.emit(
      'error',
      Object.assign(new Error('private-credentials'), { code: 'ECONNRESET' })
    )
  ).not.toThrow()
  expect(JSON.parse(logs[0]!)).toMatchObject({
    boundary: 'database',
    totalConnections: 2,
    idleConnections: 1,
    error: { code: 'ECONNRESET' }
  })
  expect(logs[0]).not.toContain('private-credentials')
})
