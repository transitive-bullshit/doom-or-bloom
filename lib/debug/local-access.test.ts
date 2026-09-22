import { afterEach, expect, test, vi } from 'vitest'
import { localDebugAvailable, localWriteRequestAllowed } from './local-access'

afterEach(() => vi.unstubAllEnvs())
test('only local development pages may write local data; Portless determines the expected origin', () => {
  vi.stubEnv('NODE_ENV', 'development')
  vi.stubEnv('PORTLESS_URL', 'http://doom-or-bloom.localhost:1355')
  const request = (origin?: string) =>
    new Request('http://127.0.0.1:4000/api/user-journeys', {
      headers: origin ? { origin } : {}
    })
  expect(
    localWriteRequestAllowed(request('http://doom-or-bloom.localhost:1355'))
  ).toBe(true)
  expect(localWriteRequestAllowed(request('https://unrelated.example'))).toBe(
    false
  )
  expect(localWriteRequestAllowed(request())).toBe(false)
  vi.stubEnv('NODE_ENV', 'production')
  expect(localDebugAvailable()).toBe(false)
  expect(
    localWriteRequestAllowed(request('http://doom-or-bloom.localhost:1355'))
  ).toBe(false)
})
test('a non-local development host does not expose file writes', () => {
  vi.stubEnv('NODE_ENV', 'development')
  vi.stubEnv('PORTLESS_URL', 'https://public.example')
  expect(
    localWriteRequestAllowed(
      new Request('https://public.example/api/user-journeys', {
        headers: { origin: 'https://public.example' }
      })
    )
  ).toBe(false)
})
