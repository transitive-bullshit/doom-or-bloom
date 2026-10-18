import 'server-only'
import { cache } from 'react'
import { reportServerError } from '@/lib/server/error-reporting'
import { getPool } from '@/lib/db'
import { personaRepository } from '@/lib/personas/repository'
import {
  readCatalogSnapshot,
  snapshotDatabaseKey
} from '@/lib/personas/catalog-snapshot'
import { parsePublicProfile } from '@/lib/personas/public-profile'
import { journeySchema } from '@/lib/journeys/schema'
import { personaAssessment } from '@/lib/journeys/persona-assessment'
import { presentResult } from '@/lib/assessment/present-result'
import {
  closestOnExpressedPositions,
  closestPersonas
} from '@/lib/assessment/persona-matches'
import type { Result } from '@/lib/assessment/schema'
import type { SimilarWorldviewList } from './similar-worldviews'

// Production builds snapshot the selected catalog first
// (scripts/catalog-snapshot.ts), so public pages and cards never query
// Postgres at request time: crawler renders of on-demand profile pages and
// cards kept the production database awake (October 2026). Catalog changes go
// live with a deployment. Development and tests read Postgres, so local
// imports show immediately.
const runtime = () =>
  Boolean(process.env.VERCEL) &&
  process.env.NEXT_PHASE !== 'phase-production-build'
let warned = false
function snapshot() {
  if (process.env.NODE_ENV !== 'production') return null
  const found = readCatalogSnapshot(process.cwd(), snapshotDatabaseKey())
  if (!found && runtime() && !warned) {
    warned = true
    reportServerError('catalog_snapshot_unavailable', undefined, {}, 'warn')
  }
  return found
}

// One line per request-time catalog query in a deployment, so a missing
// snapshot or a page that regenerates at runtime shows in the logs before it
// shows as database wake-ups.
function logCatalogRead(read: string, key: Record<string, unknown> = {}) {
  if (!runtime()) return
  console.info(
    JSON.stringify({
      event: 'catalog_postgres_read',
      read,
      ...key,
      deployment: process.env.VERCEL_DEPLOYMENT_ID,
      region: process.env.VERCEL_REGION
    })
  )
}

const loadSummaries = cache(async (featuredOnly: boolean) => {
  const catalog = snapshot()
  if (catalog)
    return featuredOnly ? catalog.featuredSummaries : catalog.summaries
  logCatalogRead('summaries', { featuredOnly })
  return personaRepository(getPool()).selectedSummaries(featuredOnly)
})

async function loadProfile(slug: string) {
  const catalog = snapshot()
  // Unknown slugs are not found without a query.
  if (catalog) return catalog.profile(slug)
  logCatalogRead('profile', { slug })
  return personaRepository(getPool()).selectedProfile(slug)
}

/** A selected profile's presented result, sources and simulated answers. */
export const loadPersona = cache(async (slug: string) => {
  const row = await loadProfile(slug)
  if (!row) return null
  const profile = parsePublicProfile(row)
  return {
    person: exampleFromSummary(profile),
    assessment: { answers: profile.answers }
  }
})
export const loadPersonaPaths = async () => {
  const catalog = snapshot()
  return catalog
    ? catalog.slugs.map((username) => ({ username }))
    : personaRepository(getPool()).selectedSlugs()
}

/**
 * A selected persona's recorded assessment, including the final projection
 * input. It reads the full journey from Postgres, so only fully static pages
 * (About's methodology example, generated at build) and internal prototypes
 * use it.
 */
export const loadPersonaAssessment = cache(async (id: string) => {
  const row = (await loadSummaries(false)).find((row) => row.metadata.id === id)
  if (!row) return null
  logCatalogRead('journey', { slug: row.metadata.slug })
  const journey = await personaRepository(getPool()).selectedJourney(
    row.metadata.slug
  )
  return journey ? personaAssessment(journeySchema.parse(journey)) : null
})
export const loadExamples = cache(async (featuredOnly = true) => {
  return (await loadSummaries(featuredOnly)).map(exampleFromSummary)
})

function exampleFromSummary(
  row: Awaited<
    ReturnType<ReturnType<typeof personaRepository>['selectedSummaries']>
  >[number]
) {
  const { order: _order, ...metadata } = row.metadata
  return {
    ...metadata,
    assessmentId: row.assessmentId,
    sources: row.sources.map(({ title, url, summary, publishedAt }) => ({
      title,
      url,
      summary,
      // Profile structured data dates its citations.
      ...(publishedAt && { publishedAt })
    })),
    sourceBriefUpdated:
      JSON.stringify(row.sources) !== JSON.stringify(row.recordedSources),
    result: presentResult(row.result)
  }
}

const comparisons = async (featuredOnly: boolean) => {
  const catalog = snapshot()
  if (catalog)
    return featuredOnly ? catalog.comparisons.featured : catalog.comparisons.all
  logCatalogRead('comparisons', { featuredOnly })
  try {
    return await personaRepository(getPool()).selectedComparisons(featuredOnly)
  } catch (err) {
    reportServerError('persona_comparisons_unavailable', err, {})
    return []
  }
}

/**
 * Every published profile's name, so prose can link mentions. Empty when the
 * catalog is unavailable, which leaves names unlinked.
 */
export const loadProfileNames = cache(async () =>
  (await comparisons(false)).map(({ slug, name }) => ({ slug, name }))
)

/** Identical comparison inputs for private and public participant results. */
export const loadPersonaComparisons = cache(() => comparisons(true))

/**
 * The simulated users nearest to one profile across the whole catalog, by the
 * same distance participants' closest worldviews use. Profiles link to them.
 * A simulation that expresses too few positions for that comparison is matched
 * on just the ones it does express, and says so; one that expresses none gets
 * no list rather than an invented one.
 */
export async function loadSimilarWorldviews(
  person: { id: string; result: Result },
  limit = 6
) {
  const others = (await comparisons(false)).filter(
    (other) => other.id !== person.id
  )
  const closest = closestPersonas(person.result, others, limit)
  const basis = closest.length ? 'worldview' : 'positions'
  return {
    basis,
    people: (closest.length
      ? closest
      : closestOnExpressedPositions(person.result, others, limit)
    ).map(({ id, slug, name, avatar }) => ({ id, slug, name, avatar }))
  } satisfies SimilarWorldviewList
}
