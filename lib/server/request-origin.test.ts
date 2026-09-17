import { afterEach, expect, test, vi } from 'vitest'
import { isSameOriginRequest } from './request-origin'

afterEach(() => vi.unstubAllEnvs())
const upstream = 'http://127.0.0.1:4446/api/assessment'
function request(origin?: string, headers: Record<string, string> = {}) {
  return new Request(upstream, {
    method: 'POST',
    headers: { ...headers, ...(origin ? { origin } : {}) }
  })
}

test('a Portless page can submit through a different loopback upstream', () => {
  vi.stubEnv('NODE_ENV', 'development')
  vi.stubEnv('PORTLESS_URL', 'http://doom-or-bloom.localhost:1355')
  expect(
    isSameOriginRequest(request('http://doom-or-bloom.localhost:1355'))
  ).toBe(true)
  for (const origin of [
    'http://other.localhost:1355',
    'http://doom-or-bloom.localhost:3000',
    'https://doom-or-bloom.localhost:1355',
    'http://127.0.0.1:4446',
    'null'
  ])
    expect(isSameOriginRequest(request(origin))).toBe(false)
})

test('HTTPS proxy and worktree URLs use the exact injected origin', () => {
  vi.stubEnv('NODE_ENV', 'development')
  vi.stubEnv('PORTLESS_URL', 'https://feature.doom-or-bloom.localhost')
  expect(
    isSameOriginRequest(request('https://feature.doom-or-bloom.localhost'))
  ).toBe(true)
  expect(isSameOriginRequest(request('https://doom-or-bloom.localhost'))).toBe(
    false
  )
})

test('forwarded headers cannot authorize an unrelated page', () => {
  vi.stubEnv('PORTLESS_URL', 'http://doom-or-bloom.localhost:1355')
  expect(
    isSameOriginRequest(
      request('https://unrelated.example', {
        host: 'unrelated.example',
        'x-forwarded-host': 'unrelated.example',
        'x-forwarded-proto': 'https'
      })
    )
  ).toBe(false)
})

test('production ignores stale development proxy configuration', () => {
  vi.stubEnv('NODE_ENV', 'production')
  vi.stubEnv('PORTLESS_URL', 'http://doom-or-bloom.localhost:1355')
  expect(
    isSameOriginRequest(request('http://doom-or-bloom.localhost:1355'))
  ).toBe(false)
  expect(isSameOriginRequest(request('http://127.0.0.1:4446'))).toBe(true)
})

test('unconfigured requests retain same-origin behavior and malformed settings fail closed', () => {
  vi.stubEnv('NODE_ENV', 'development')
  vi.stubEnv('PORTLESS_URL', '')
  expect(isSameOriginRequest(request('http://127.0.0.1:4446'))).toBe(true)
  expect(isSameOriginRequest(request('https://unrelated.example'))).toBe(false)
  expect(isSameOriginRequest(request())).toBe(true)
  for (const value of ['invalid', 'file:///tmp/assessment']) {
    vi.stubEnv('PORTLESS_URL', value)
    expect(isSameOriginRequest(request('null'))).toBe(false)
  }
})
