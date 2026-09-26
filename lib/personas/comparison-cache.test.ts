import type { PersonaComparison } from '../assessment/persona-matches'
import { AsyncLocalStorage } from 'node:async_hooks'
import { beforeEach, afterEach, expect, test, vi } from 'vitest'
import { expectDiagnostics } from '@/tests/helpers/diagnostics'

const selectedComparisons = vi.hoisted(() =>
  vi.fn<() => Promise<PersonaComparison[]>>()
)
vi.mock('@/lib/db', () => ({ getPool: () => ({}) }))
vi.mock('@/lib/personas/repository', () => ({
  personaRepository: () => ({ selectedComparisons })
}))

// Exercise Next's actual unstable_cache with an in-memory storage backend.
// Calls outside React rendering cannot benefit from React's render memoization.
vi.stubGlobal('AsyncLocalStorage', AsyncLocalStorage)
const { loadPersonaComparisons } = await import('@/components/landing/data')
let now = 0
beforeEach(() => {
  now = 0
  selectedComparisons.mockReset()
  vi.stubEnv('DATABASE_URL', 'postgresql://localhost/comparison_test')
  const entries = new Map<string, { value: unknown; at: number }>()
  vi.stubGlobal('__incrementalCache', {
    generateSimpleCacheKey: async (key: string) => key,
    get: async (key: string, options: { revalidate: number }) => {
      const entry = entries.get(key)
      return entry
        ? { value: entry.value, isStale: now - entry.at >= options.revalidate }
        : null
    },
    set: async (key: string, value: unknown) => {
      entries.set(key, { value, at: now })
    }
  })
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})
const personas = [
  {
    id: 'sample',
    name: 'Sample',
    slug: 'sample',
    avatar: '/sample.webp',
    values: { beneficial_potential: 0.6 }
  }
]

test('comparison reads reuse the Data Cache, expire, and isolate database targets', async () => {
  selectedComparisons.mockResolvedValue(personas)
  expect(await loadPersonaComparisons()).toEqual(personas)
  expect(await loadPersonaComparisons()).toEqual(personas)
  expect(selectedComparisons).toHaveBeenCalledTimes(1)
  now = 172799
  expect(await loadPersonaComparisons()).toEqual(personas)
  expect(selectedComparisons).toHaveBeenCalledTimes(1)
  now = 172801
  expect(await loadPersonaComparisons()).toEqual(personas)
  expect(selectedComparisons).toHaveBeenCalledTimes(2)
  vi.stubEnv('DATABASE_URL', 'postgresql://localhost/other_test')
  expect(await loadPersonaComparisons()).toEqual(personas)
  expect(selectedComparisons).toHaveBeenCalledTimes(3)
})

test('an initial database failure does not cache an empty fallback', async () => {
  expectDiagnostics({
    event: 'persona_comparisons_unavailable',
    severity: 'error'
  })
  selectedComparisons.mockRejectedValueOnce(new Error('Fixture unavailable'))
  selectedComparisons.mockResolvedValue(personas)
  expect(await loadPersonaComparisons()).toEqual([])
  expect(await loadPersonaComparisons()).toEqual(personas)
  expect(await loadPersonaComparisons()).toEqual(personas)
  expect(selectedComparisons).toHaveBeenCalledTimes(2)
})
