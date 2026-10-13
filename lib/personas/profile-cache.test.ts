import { AsyncLocalStorage } from 'node:async_hooks'
import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { stubDataCache } from '@/tests/helpers/data-cache'
import { personas } from '../journeys/catalog'
import type { JourneySuite } from '../journeys/schema'

const selectedVersions = vi.hoisted(() =>
  vi.fn<() => Promise<Record<string, string>>>()
)
const selectedProfile = vi.hoisted(() =>
  vi.fn<(slug: string) => Promise<unknown>>()
)
vi.mock('@/lib/db', () => ({ getPool: () => ({}) }))
vi.mock('@/lib/personas/repository', () => ({
  personaRepository: () => ({ selectedVersions, selectedProfile })
}))

// Exercise Next's actual unstable_cache with an in-memory storage backend.
// Calls outside React rendering cannot benefit from React's render memoization.
vi.stubGlobal('AsyncLocalStorage', AsyncLocalStorage)
const { loadPersona } = await import('@/components/landing/data')

const suite: JourneySuite = JSON.parse(
  readFileSync('lib/journeys/__fixtures__/sample-journeys.json', 'utf8')
)
const profile = (version: string) => ({
  version,
  assessmentId: 'sample-assessment',
  metadata: {
    id: 'anti-doomer',
    slug: 'sample',
    name: 'Sample Person',
    shortName: 'Sample',
    avatar: '/sample.webp',
    initials: 'SP',
    stance: 'Stance',
    description: 'Description',
    tone: 'Tone',
    order: 1
  },
  sourceBrief: personas.find((persona) => persona.id === 'anti-doomer'),
  journey: suite.journeys.find((journey) => journey.personaId === 'anti-doomer')
})

beforeEach(() => {
  selectedVersions.mockReset()
  selectedProfile.mockReset()
  vi.stubEnv('DATABASE_URL', 'postgresql://localhost/profile_test')
  vi.stubEnv('VERCEL_DEPLOYMENT_ID', 'dpl_first')
  stubDataCache()
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

test('a profile is read once per version, across deployments', async () => {
  selectedVersions.mockResolvedValue({ sample: 'v1' })
  selectedProfile.mockResolvedValue(profile('v1'))
  const first = await loadPersona('sample')
  expect(first?.person.name).toBe('Sample Person')
  expect(first?.assessment.answers.length).toBeGreaterThan(0)
  expect(await loadPersona('sample')).toEqual(first)
  expect(selectedVersions).toHaveBeenCalledTimes(1)
  expect(selectedProfile).toHaveBeenCalledTimes(1)

  // A deployment rereads the versions but keeps unchanged profiles.
  vi.stubEnv('VERCEL_DEPLOYMENT_ID', 'dpl_second')
  expect(await loadPersona('sample')).toEqual(first)
  expect(selectedVersions).toHaveBeenCalledTimes(2)
  expect(selectedProfile).toHaveBeenCalledTimes(1)

  // A new run or metadata edit is a new version.
  vi.stubEnv('VERCEL_DEPLOYMENT_ID', 'dpl_third')
  selectedVersions.mockResolvedValue({ sample: 'v2' })
  selectedProfile.mockResolvedValue(profile('v2'))
  await loadPersona('sample')
  expect(selectedProfile).toHaveBeenCalledTimes(2)
})

test('content newer than its version, or without one, is not cached', async () => {
  // Selected after this deployment read its versions.
  selectedVersions.mockResolvedValue({ sample: 'v1' })
  selectedProfile.mockResolvedValue(profile('v2'))
  expect((await loadPersona('sample'))?.person.name).toBe('Sample Person')
  await loadPersona('sample')
  expect(selectedProfile).toHaveBeenCalledTimes(2)

  // Absent from the versions: read directly, so unknown slugs return null.
  selectedProfile.mockResolvedValue(null)
  expect(await loadPersona('unknown')).toBeNull()
  expect(await loadPersona('constructor')).toBeNull()
  expect(selectedProfile).toHaveBeenCalledTimes(4)
})

test('without a deployment, versions are read on every render', async () => {
  vi.stubEnv('VERCEL_DEPLOYMENT_ID', '')
  selectedVersions.mockResolvedValue({ sample: 'v1' })
  selectedProfile.mockResolvedValue(profile('v1'))
  await loadPersona('sample')
  await loadPersona('sample')
  expect(selectedVersions).toHaveBeenCalledTimes(2)
  expect(selectedProfile).toHaveBeenCalledTimes(1)
})
