import { afterEach, expect, test, vi } from 'vitest'
import {
  localDebugAvailable,
  localFeedbackRequestAllowed
} from './local-access'

afterEach(() => vi.unstubAllEnvs())
test('only local development pages may write feedback; Portless determines the expected origin', () => {
  vi.stubEnv('NODE_ENV', 'development')
  vi.stubEnv('PORTLESS_URL', 'http://doom-or-bloom.localhost:1355')
  const request = (origin?: string) =>
    new Request('http://127.0.0.1:4000/api/editorial-feedback', {
      headers: origin ? { origin } : {}
    })
  expect(
    localFeedbackRequestAllowed(request('http://doom-or-bloom.localhost:1355'))
  ).toBe(true)
  expect(
    localFeedbackRequestAllowed(request('https://unrelated.example'))
  ).toBe(false)
  expect(localFeedbackRequestAllowed(request())).toBe(false)
  vi.stubEnv('NODE_ENV', 'production')
  expect(localDebugAvailable()).toBe(false)
  expect(
    localFeedbackRequestAllowed(request('http://doom-or-bloom.localhost:1355'))
  ).toBe(false)
})
test('a non-local development host does not expose file writes', () => {
  vi.stubEnv('NODE_ENV', 'development')
  vi.stubEnv('PORTLESS_URL', 'https://public.example')
  expect(
    localFeedbackRequestAllowed(
      new Request('https://public.example/api/editorial-feedback', {
        headers: { origin: 'https://public.example' }
      })
    )
  ).toBe(false)
})
