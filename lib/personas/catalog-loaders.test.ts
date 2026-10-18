import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { expectDiagnostics } from '@/tests/helpers/diagnostics'
import { personas } from '../journeys/catalog'
import { personaAssessment } from '../journeys/persona-assessment'
import type { JourneySuite } from '../journeys/schema'
import type { PublicProfileRow } from './public-profile'
import type { CatalogSnapshot } from './catalog-snapshot'

const repository = vi.hoisted(() => ({
  selectedProfile: vi.fn<(slug: string) => Promise<unknown>>(),
  selectedSummaries: vi.fn<(featured: boolean) => Promise<unknown[]>>(),
  selectedComparisons: vi.fn<(featured: boolean) => Promise<unknown[]>>(),
  selectedSlugs: vi.fn<() => Promise<{ username: string }[]>>()
}))
const snapshot = vi.hoisted(() => ({
  current: null as CatalogSnapshot | null
}))
vi.mock('@/lib/db', () => ({ getPool: () => ({}) }))
vi.mock('@/lib/personas/repository', () => ({
  personaRepository: () => repository
}))
vi.mock('@/lib/personas/catalog-snapshot', () => ({
  snapshotDatabaseKey: () => 'database',
  readCatalogSnapshot: () => snapshot.current
}))

// Calls outside React rendering are not memoized by React's cache.
const data = await import('@/components/landing/data')

const suite: JourneySuite = JSON.parse(
  readFileSync('lib/journeys/__fixtures__/sample-journeys.json', 'utf8')
)
const journey = suite.journeys.find(
  (journey) => journey.personaId === 'anti-doomer'
)!
const brief = personas.find((persona) => persona.id === 'anti-doomer')!
const metadata = {
  id: 'anti-doomer',
  slug: 'sample',
  name: 'Sample Person',
  shortName: 'Sample',
  avatar: '/sample.webp',
  initials: 'SP',
  stance: 'Stance',
  description: 'Description',
  tone: 'Tone',
  featured: true,
  order: 1
}
const row: PublicProfileRow = {
  slug: 'sample',
  assessmentId: 'sample-assessment',
  metadata,
  sources: brief.sources,
  recordedSources: journey.personaSnapshot?.sources ?? [],
  result: journey.result,
  answers: personaAssessment(journey).answers
}
const summary = {
  assessmentId: 'sample-assessment',
  metadata,
  sources: brief.sources,
  recordedSources: brief.sources,
  result: journey.result!
}
const comparison = {
  id: 'anti-doomer',
  name: 'Sample',
  slug: 'sample',
  avatar: '/sample.webp',
  values: {}
}
const catalog = (): CatalogSnapshot => ({
  summaries: [summary, { ...summary, metadata: { ...metadata, slug: 'b' } }],
  featuredSummaries: [summary],
  comparisons: { featured: [comparison], all: [comparison, comparison] },
  slugs: ['sample'],
  profile: (slug) => (slug === 'sample' ? row : null)
})

beforeEach(() => {
  for (const fn of Object.values(repository)) fn.mockReset()
  snapshot.current = catalog()
  vi.stubEnv('NODE_ENV', 'production')
})
afterEach(() => {
  vi.unstubAllEnvs()
})

test('production reads public profiles from the build snapshot, never Postgres', async () => {
  const profile = (await data.loadPersona('sample'))!
  expect(profile.person.name).toBe('Sample Person')
  expect(profile.person.sources).toHaveLength(brief.sources.length)
  expect(profile.person.result.reason).toBeDefined()
  // Only what the page renders: answers, no evaluator state.
  expect(profile.assessment).toEqual({
    answers: personaAssessment(journey).answers
  })
  expect(profile.assessment.answers.length).toBeGreaterThan(0)
  // Unknown slugs are not found without a query.
  expect(await data.loadPersona('unknown')).toBeNull()

  expect((await data.loadExamples()).map(({ slug }) => slug)).toEqual([
    'sample'
  ])
  expect(await data.loadExamples(false)).toHaveLength(2)
  expect(await data.loadPersonaPaths()).toEqual([{ username: 'sample' }])
  expect(await data.loadPersonaComparisons()).toEqual([comparison])
  expect(await data.loadProfileNames()).toHaveLength(2)
  for (const fn of Object.values(repository)) expect(fn).not.toHaveBeenCalled()
})

test('development reads Postgres, so local imports show immediately', async () => {
  vi.stubEnv('NODE_ENV', 'development')
  repository.selectedProfile.mockResolvedValue(row)
  repository.selectedSummaries.mockResolvedValue([summary])
  expect((await data.loadPersona('sample'))?.person.name).toBe('Sample Person')
  expect(await data.loadExamples()).toHaveLength(1)
  expect(repository.selectedProfile).toHaveBeenCalledWith('sample')
  expect(repository.selectedSummaries).toHaveBeenCalledWith(true)
})

test('a deployment without its snapshot warns once and reads Postgres', async () => {
  snapshot.current = null
  vi.stubEnv('VERCEL', '1')
  expectDiagnostics({
    event: 'catalog_snapshot_unavailable',
    severity: 'warn'
  })
  const reads = vi.spyOn(console, 'info').mockImplementation(() => {})
  repository.selectedProfile.mockResolvedValue(row)
  repository.selectedComparisons.mockResolvedValue([comparison])
  await data.loadPersona('sample')
  await data.loadPersonaComparisons()
  expect(repository.selectedProfile).toHaveBeenCalledOnce()
  expect(reads.mock.calls.map(([line]) => JSON.parse(line).read)).toEqual([
    'profile',
    'comparisons'
  ])
})

test('an unavailable comparison catalog is logged and left empty', async () => {
  snapshot.current = null
  expectDiagnostics({
    event: 'persona_comparisons_unavailable',
    severity: 'error'
  })
  repository.selectedComparisons.mockRejectedValue(new Error('Unavailable'))
  expect(await data.loadPersonaComparisons()).toEqual([])
})
