import type { PersonaComparison } from '../assessment/persona-matches'
import { AsyncLocalStorage } from 'node:async_hooks'
import { beforeEach, afterEach, expect, test, vi } from 'vitest'
import { expectDiagnostics } from '@/tests/helpers/diagnostics'
import { stubDataCache } from '@/tests/helpers/data-cache'

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
let clock = { now: 0 }
beforeEach(() => {
  selectedComparisons.mockReset()
  vi.stubEnv('DATABASE_URL', 'postgresql://localhost/comparison_test')
  clock = stubDataCache()
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
  clock.now = 172799
  expect(await loadPersonaComparisons()).toEqual(personas)
  expect(selectedComparisons).toHaveBeenCalledTimes(1)
  clock.now = 172801
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
