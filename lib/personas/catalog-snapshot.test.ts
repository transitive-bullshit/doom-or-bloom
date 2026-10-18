import { mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, expect, test } from 'vitest'
import {
  readCatalogSnapshot,
  writeCatalogSnapshot,
  type CatalogSnapshotInput
} from './catalog-snapshot'

const roots: string[] = []
const root = () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'catalog-snapshot-'))
  roots.push(dir)
  return dir
}
afterEach(() => {
  for (const dir of roots.splice(0))
    rmSync(dir, { recursive: true, force: true })
})

const summary = (slug: string) =>
  ({
    assessmentId: `assessment-${slug}`,
    metadata: { slug, id: slug, name: slug },
    sources: [],
    recordedSources: [],
    result: { horizontal: { value: 0.5 } }
  }) as unknown as CatalogSnapshotInput['summaries'][number]
const profile = (slug: string) => ({
  slug,
  assessmentId: `assessment-${slug}`,
  metadata: { slug },
  sources: [],
  recordedSources: [],
  result: { horizontal: { value: 0.5 } },
  answers: [{ id: 'a1', promptId: 'p1', question: 'Q?', answer: 'A.' }]
})
const input: CatalogSnapshotInput = {
  summaries: [summary('featured'), summary('other')],
  featuredSlugs: ['featured'],
  comparisons: {
    featured: [
      {
        id: 'featured',
        name: 'F',
        slug: 'featured',
        avatar: '/f.webp',
        values: {}
      }
    ],
    all: [
      {
        id: 'featured',
        name: 'F',
        slug: 'featured',
        avatar: '/f.webp',
        values: {}
      },
      { id: 'other', name: 'O', slug: 'other', avatar: '/o.webp', values: {} }
    ]
  },
  profiles: [profile('featured'), profile('other')]
}

test('a snapshot reads back for its own database only', () => {
  const dir = root()
  const written = writeCatalogSnapshot(dir, input, 'db-a')
  expect(written.profiles).toBe(2)
  expect(written.gzip).toBeLessThan(written.json)
  // Written in one rename: no staging directory is left behind.
  expect(readdirSync(dir)).toEqual(['catalog-snapshot'])

  const snapshot = readCatalogSnapshot(dir, 'db-a')!
  expect(snapshot.summaries).toEqual(input.summaries)
  expect(snapshot.featuredSummaries).toEqual([input.summaries[0]])
  expect(snapshot.comparisons).toEqual(input.comparisons)
  expect(snapshot.slugs).toEqual(['featured', 'other'])
  const { slug: _slug, ...row } = profile('other')
  expect(snapshot.profile('other')).toEqual(row)
  // Request paths can name anything; only snapshot slugs are read.
  expect(snapshot.profile('../catalog')).toBeNull()
  expect(snapshot.profile('constructor')).toBeNull()

  expect(readCatalogSnapshot(dir, 'db-b')).toBeNull()
  expect(readCatalogSnapshot(root(), 'db-a')).toBeNull()
})

test('a rewrite replaces the whole snapshot', () => {
  const dir = root()
  writeCatalogSnapshot(dir, input, 'db-a')
  writeCatalogSnapshot(
    dir,
    { ...input, profiles: [profile('featured')] },
    'db-c'
  )
  const snapshot = readCatalogSnapshot(dir, 'db-c')!
  expect(snapshot.slugs).toEqual(['featured'])
  expect(readdirSync(path.join(dir, 'catalog-snapshot', 'profiles'))).toEqual([
    'featured.json.gz'
  ])
})

test('a slug that is unsafe as a file name fails the snapshot', () => {
  expect(() =>
    writeCatalogSnapshot(
      root(),
      { ...input, profiles: [profile('../escape')] },
      'db-a'
    )
  ).toThrow(/Unsafe profile slug/)
})
