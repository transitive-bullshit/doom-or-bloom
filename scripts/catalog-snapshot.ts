// Snapshots the selected public catalog from DATABASE_URL into
// catalog-snapshot/ before `next build`, so production pages and cards render
// it without querying Postgres (docs/PERSISTENCE.md#catalog-snapshot).
// Every profile is validated here: a profile that cannot render fails the build.
import { createRequire } from 'node:module'
import { getPool } from '../lib/db'
import {
  snapshotDatabaseKey,
  writeCatalogSnapshot
} from '../lib/personas/catalog-snapshot'
import { parsePublicProfile } from '../lib/personas/public-profile'
import { personaRepository } from '../lib/personas/repository'

// Load env files with Next's own loader, as `next build` does next, so the
// snapshot reads the database the build renders from. Shell values win.
const require = createRequire(import.meta.url)
const nextEnv = createRequire(require.resolve('next/package.json'))(
  '@next/env'
) as { loadEnvConfig: (dir: string) => unknown }
nextEnv.loadEnvConfig(process.cwd())

const pool = getPool()
try {
  const repository = personaRepository(pool)
  const [summaries, featured, featuredComparisons, allComparisons, profiles] =
    await Promise.all([
      repository.selectedSummaries(false),
      repository.selectedSummaries(true),
      repository.selectedComparisons(true),
      repository.selectedComparisons(false),
      repository.selectedProfiles()
    ])
  for (const profile of profiles) parsePublicProfile(profile)
  const written = writeCatalogSnapshot(
    process.cwd(),
    {
      summaries,
      featuredSlugs: featured.map((row) => row.metadata.slug),
      comparisons: { featured: featuredComparisons, all: allComparisons },
      profiles
    },
    snapshotDatabaseKey()
  )
  const mb = (bytes: number) => (bytes / 1024 / 1024).toFixed(1)
  console.log(
    `Catalog snapshot: ${written.profiles} profiles, ${summaries.length} summaries, ${mb(written.json)} MB JSON (${mb(written.gzip)} MB gzipped)`
  )
} finally {
  await pool.end()
}
