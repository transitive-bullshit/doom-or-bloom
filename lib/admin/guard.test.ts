import { afterEach, expect, test, vi } from 'vitest'
const requestHeaders = vi.hoisted(() => vi.fn<() => Promise<Headers>>())
vi.mock('next/headers', () => ({ headers: requestHeaders }))
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('404')
  }
}))
import { requireLocalAdmin } from './guard'
afterEach(() => vi.unstubAllEnvs())
function enable() {
  vi.stubEnv('NODE_ENV', 'development')
  vi.stubEnv('ADMIN_ENABLED', 'true')
  vi.stubEnv('LOCAL_ADMIN_BUILD', 'true')
  for (const name of [
    'VERCEL',
    'VERCEL_ENV',
    'VERCEL_URL',
    'PORTLESS_TAILSCALE_URL',
    'DEV_TUNNEL_URL'
  ])
    vi.stubEnv(name, '')
  requestHeaders.mockResolvedValue(
    new Headers({ host: 'doom-or-bloom.localhost:1355' })
  )
}
test('a production artifact cannot be enabled by changing runtime flags', async () => {
  enable()
  vi.stubEnv('LOCAL_ADMIN_BUILD', 'false')
  await expect(requireLocalAdmin()).rejects.toThrow('404')
})
test('runtime and forwarded-host checks apply on every admin read', async () => {
  enable()
  await expect(requireLocalAdmin()).resolves.toBeUndefined()
  requestHeaders.mockResolvedValue(
    new Headers({
      host: 'localhost:3000',
      'x-forwarded-host': 'remote.example'
    })
  )
  await expect(requireLocalAdmin()).rejects.toThrow('404')
  enable()
  vi.stubEnv('NODE_ENV', 'production')
  await expect(requireLocalAdmin()).rejects.toThrow('404')
})
