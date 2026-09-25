import { afterEach, expect, test, vi } from 'vitest'
import { adminEnvironmentAllowed, localAdminHost } from './access'
import { adminFilters, adminHref } from './filters'
import { assessmentStatus } from './queries'

const enabled = {
  NODE_ENV: 'development',
  ADMIN_ENABLED: 'true'
} as NodeJS.ProcessEnv
afterEach(() => vi.unstubAllEnvs())
test('admin requires explicit development opt-in and refuses hosted environments and tunnels', () => {
  expect(adminEnvironmentAllowed(enabled)).toBe(true)
  for (const patch of [
    { NODE_ENV: 'production' },
    { NODE_ENV: 'test' },
    { ADMIN_ENABLED: undefined },
    { ADMIN_ENABLED: 'false' },
    { VERCEL: '1' },
    { VERCEL_ENV: 'preview' },
    { VERCEL_ENV: 'production' },
    { VERCEL_URL: 'app.vercel.app' },
    { PORTLESS_TAILSCALE_URL: 'https://machine.ts.net' },
    { DEV_TUNNEL_URL: 'https://tunnel.example' },
    { PORTLESS_NGROK_URL: 'https://tunnel.example' },
    { PORTLESS_FUNNEL: '1' },
    { PORTLESS_NGROK: '1' },
    { PORTLESS_TAILSCALE: '1' },
    { PORTLESS_LAN: '1' }
  ])
    expect(adminEnvironmentAllowed({ ...enabled, ...patch })).toBe(false)
})
test('host validation allows loopback and Portless names only', () => {
  for (const host of [
    'localhost:3000',
    '127.0.0.1:4000',
    '[::1]:3000',
    'doom-or-bloom.localhost:1355',
    'branch.doom-or-bloom.localhost'
  ])
    expect(localAdminHost(host)).toBe(true)
  for (const host of [
    null,
    '',
    'doom-or-bloom.com',
    'localhost.evil.com',
    'localhost@evil.com',
    'localhost,evil.com',
    'localhost/path',
    '127.0.0.1\\@evil.com'
  ])
    expect(localAdminHost(host)).toBe(false)
})
test('filters default to participants, use rolling creation cohorts, and bound inputs', () => {
  expect(adminFilters({})).toMatchObject({
    range: 'all',
    origin: 'participant',
    since: null,
    page: 1
  })
  const filters = adminFilters(
    { range: '24h', page: '-3', state: 'completed', q: ' x ' },
    new Date('2026-09-26T12:00:00Z')
  )
  expect(filters).toMatchObject({
    since: '2026-09-25T12:00:00.000Z',
    query: 'x',
    page: 1,
    state: 'completed'
  })
  expect(
    adminFilters({ range: ['7d'], origin: 'invalid', page: '99999999' })
  ).toMatchObject({ range: 'all', origin: 'participant', page: 100000 })
  expect(adminHref('/admin/assessments', filters, { page: 2 })).toContain(
    'page=2'
  )
})
test('processing failures remain visible even when an earlier result exists', () => {
  const row = {
    has_result: true,
    engine_status: 'results',
    operation_status: null
  }
  expect(assessmentStatus(row)).toBe('Completed')
  expect(assessmentStatus({ ...row, operation_status: 'failed' })).toBe(
    'Needs attention'
  )
  expect(assessmentStatus({ ...row, operation_status: 'running' })).toBe(
    'Processing'
  )
  expect(
    assessmentStatus({ ...row, has_result: false, engine_status: 'recovery' })
  ).toBe('Answer recovery')
})
