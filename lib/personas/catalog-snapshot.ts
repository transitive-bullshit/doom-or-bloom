import { createHash } from 'node:crypto'
import {
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import path from 'node:path'
import { gunzipSync, gzipSync } from 'node:zlib'
import { databaseUrl } from '../db/config'
import type { PersonaComparison } from '../assessment/persona-matches'
import type { personaRepository } from './repository'
import type { PublicProfileRow } from './public-profile'

/**
 * The selected public catalog as one production build read it, so public
 * pages and cards render without querying Postgres. Written before
 * `next build` and traced into the server bundle (next.config.ts).
 */
const catalogSnapshotDirectory = 'catalog-snapshot'
const format = 1

type Summary = Awaited<
  ReturnType<ReturnType<typeof personaRepository>['selectedSummaries']>
>[number]

export type CatalogSnapshotInput = {
  /** Every selected summary, in catalog order. */
  summaries: Summary[]
  featuredSlugs: string[]
  comparisons: { featured: PersonaComparison[]; all: PersonaComparison[] }
  profiles: (PublicProfileRow & { slug: string })[]
}

type Catalog = Omit<CatalogSnapshotInput, 'profiles'> & {
  format: typeof format
  database: string
  createdAt: string
  slugs: string[]
}

// Snapshots from another database (another environment's build, or a test
// database) are ignored. The hash keeps credentials out of the file.
export const snapshotDatabaseKey = (url = databaseUrl()) =>
  createHash('sha256').update(url).digest('hex')

const slugPattern = /^[a-z0-9_-]{1,80}$/
const gzipJson = (value: unknown) =>
  gzipSync(JSON.stringify(value), { level: 9 })
const gunzipJson = (file: string): unknown =>
  JSON.parse(gunzipSync(readFileSync(file)).toString('utf8'))

/** Replaces the snapshot under `root` in one rename. Returns its sizes. */
export function writeCatalogSnapshot(
  root: string,
  input: CatalogSnapshotInput,
  database = snapshotDatabaseKey()
) {
  const directory = path.join(root, catalogSnapshotDirectory)
  const staging = `${directory}.${process.pid}.tmp`
  rmSync(staging, { recursive: true, force: true })
  mkdirSync(path.join(staging, 'profiles'), { recursive: true })
  let json = 0
  let gzip = 0
  const write = (file: string, value: unknown) => {
    const body = gzipJson(value)
    json += Buffer.byteLength(JSON.stringify(value))
    gzip += body.length
    writeFileSync(path.join(staging, file), body)
  }
  for (const { slug, ...profile } of input.profiles) {
    if (!slugPattern.test(slug)) throw new Error(`Unsafe profile slug ${slug}`)
    write(`profiles/${slug}.json.gz`, profile)
  }
  const { profiles, ...catalog } = input
  write('catalog.json.gz', {
    ...catalog,
    format,
    database,
    createdAt: new Date().toISOString(),
    slugs: profiles.map(({ slug }) => slug)
  } satisfies Catalog)
  rmSync(directory, { recursive: true, force: true })
  renameSync(staging, directory)
  return { profiles: profiles.length, json, gzip }
}

export type CatalogSnapshot = NonNullable<ReturnType<typeof read>>
const loaded = new Map<string, CatalogSnapshot | null>()

/**
 * The snapshot under `root`, or null when it is missing, unreadable or built
 * from another database. Read once per process: a deployment's snapshot
 * never changes.
 */
export function readCatalogSnapshot(root: string, database: string) {
  const key = `${root}\0${database}`
  if (!loaded.has(key)) loaded.set(key, read(root, database))
  return loaded.get(key)!
}

function read(root: string, database: string) {
  const directory = path.join(root, catalogSnapshotDirectory)
  let catalog: Catalog
  try {
    catalog = gunzipJson(path.join(directory, 'catalog.json.gz')) as Catalog
  } catch {
    return null
  }
  if (catalog.format !== format || catalog.database !== database) return null
  const slugs = new Set(catalog.slugs)
  const featured = new Set(catalog.featuredSlugs)
  return {
    summaries: catalog.summaries,
    featuredSummaries: catalog.summaries.filter((row) =>
      featured.has(row.metadata.slug)
    ),
    comparisons: catalog.comparisons,
    slugs: catalog.slugs,
    /** A selected profile's row; null, without reading, for any other slug. */
    profile(slug: string) {
      return slugs.has(slug)
        ? (gunzipJson(
            path.join(directory, 'profiles', `${slug}.json.gz`)
          ) as PublicProfileRow)
        : null
    }
  }
}
