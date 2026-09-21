import { expect, test, vi } from 'vitest'
import { parseBoolean, serverEnv } from './env'
import { createFixtureProvider } from './provider'
test('boolean settings are strict and fixture mode is explicit', () => {
  expect(parseBoolean(undefined, 'debug')).toBe(false)
  expect(parseBoolean('false', 'debug')).toBe(false)
  expect(parseBoolean('true', 'debug')).toBe(true)
  expect(() => parseBoolean('yes', 'debug')).toThrow()
  vi.stubEnv('NODE_ENV', 'production')
  vi.stubEnv('ASSESSMENT_PROVIDER', 'fixture')
  expect(() => serverEnv()).toThrow()
  vi.unstubAllEnvs()
})
test('fixture provider requires no secret and identifies itself', async () => {
  const provider = createFixtureProvider()
  const result = await provider.evaluate(
    {},
    {
      disposition: {
        type: 'choice',
        instructions: 'Fixture example',
        criteria: { usable: null, non_answer: null }
      }
    }
  )
  expect(provider.kind).toBe('fixture')
  expect(result.model).toBe('fixture-v1')
  expect(result.usage.input_tokens).toBe(0)
})

test('Vercel analytics is independent of PostHog configuration', () => {
  vi.stubEnv('ASSESSMENT_PROVIDER', 'live')
  vi.stubEnv('NEXT_PUBLIC_ANALYTICS_ENABLED', 'true')
  vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'test-project')
  vi.stubEnv('NEXT_PUBLIC_POSTHOG_HOST', 'https://example.com')
  vi.stubEnv('POSTHOG_IP_DISPOSAL_CONFIRMED', 'false')
  try {
    expect(serverEnv()).toMatchObject({ analytics: true, posthog: false })
    vi.stubEnv('POSTHOG_IP_DISPOSAL_CONFIRMED', 'true')
    expect(serverEnv()).toMatchObject({ analytics: true, posthog: true })
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_HOST', '')
    expect(serverEnv()).toMatchObject({ analytics: true, posthog: false })
    vi.stubEnv('NEXT_PUBLIC_ANALYTICS_ENABLED', 'false')
    expect(serverEnv()).toMatchObject({ analytics: false, posthog: false })
    vi.stubEnv('NEXT_PUBLIC_ANALYTICS_ENABLED', 'true')
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('ASSESSMENT_PROVIDER', 'fixture')
    expect(serverEnv()).toMatchObject({ analytics: false, posthog: false })
  } finally {
    vi.unstubAllEnvs()
  }
})
