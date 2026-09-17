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
