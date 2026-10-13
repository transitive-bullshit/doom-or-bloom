import 'server-only'
import { createHash } from 'node:crypto'
import { unstable_cache } from 'next/cache'
import { databaseUrl } from '@/lib/db/config'
import { reportServerError } from '@/lib/server/error-reporting'
import { cache } from 'react'
import { getPool } from '@/lib/db'
import { personaRepository } from '@/lib/personas/repository'
import {
  personaMetadataSchema,
  simulationPresentation
} from '@/lib/personas/payload'
import { personaProfileSchema } from '@/lib/journeys/catalog'
import { journeySchema } from '@/lib/journeys/schema'
import { presentResult } from '@/lib/assessment/present-result'
import {
  closestOnExpressedPositions,
  closestPersonas
} from '@/lib/assessment/persona-matches'
import type { Result } from '@/lib/assessment/schema'
import type { SimilarWorldviewList } from './similar-worldviews'

const loadSummaries = cache((featuredOnly: boolean) =>
  personaRepository(getPool()).selectedSummaries(featuredOnly)
)

// Separate local/test/hosted caches without putting credentials in cache keys.
const databaseKey = () =>
  createHash('sha256').update(databaseUrl()).digest('hex')

// Each deployment reads the selected profiles' versions once, refreshing them
// with its pages. Without a deployment (local builds and development) they
// are read on every render, so local imports show immediately.
const loadVersions = cache(async () => {
  const read = () => personaRepository(getPool()).selectedVersions()
  const deployment = process.env.VERCEL_DEPLOYMENT_ID
  return deployment
    ? await unstable_cache(
        read,
        ['persona-versions-v1', databaseKey(), deployment],
        { revalidate: 172800 }
      )()
    : await read()
})

type SelectedProfile = NonNullable<
  Awaited<ReturnType<ReturnType<typeof personaRepository>['selectedProfile']>>
>
class ChangedSelection extends Error {
  constructor(readonly profile: SelectedProfile | null) {
    super('The persona selection changed after its version was read')
  }
}

// A version names immutable content, so a cached profile is reused across
// requests, languages, cards and deployments until a new run or metadata
// change gives it a new version. Crawlers visiting profiles then rarely wake
// the database.
async function loadProfile(slug: string) {
  const repository = personaRepository(getPool())
  const versions = await loadVersions()
  // A profile selected since the versions were read renders uncached.
  if (!Object.hasOwn(versions, slug)) return repository.selectedProfile(slug)
  const version = versions[slug]!
  try {
    return await unstable_cache(
      async () => {
        const profile = await repository.selectedProfile(slug)
        // Store only the content this version names.
        if (profile?.version !== version) throw new ChangedSelection(profile)
        return profile
      },
      ['persona-profile-v1', databaseKey(), slug, version],
      { revalidate: false }
    )()
  } catch (err) {
    if (err instanceof ChangedSelection) return err.profile
    throw err
  }
}

export const loadPersona = cache(async (slug: string) => {
  const profile = await loadProfile(slug)
  if (!profile) return null
  const journey = journeySchema.parse(profile.journey)
  return {
    person: exampleFromSummary({
      metadata: personaMetadataSchema.parse(profile.metadata),
      assessmentId: profile.assessmentId,
      sources: personaProfileSchema.parse(profile.sourceBrief).sources,
      recordedSources: journey.personaSnapshot?.sources ?? [],
      result: journey.result!
    }),
    assessment: simulationPresentation({ journey }).assessment
  }
})
export const loadPersonaPaths = () =>
  personaRepository(getPool()).selectedSlugs()
export const loadPersonaAssessment = cache(async (id: string) => {
  const row = (await loadSummaries(false)).find((row) => row.metadata.id === id)
  return row
    ? ((await loadPersona(row.metadata.slug))?.assessment ?? null)
    : null
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

// Comparison inputs share the Data Cache across requests and builds.
const comparisons = async (featuredOnly: boolean) => {
  try {
    return await unstable_cache(
      () => personaRepository(getPool()).selectedComparisons(featuredOnly),
      [
        featuredOnly ? 'persona-comparisons-v3' : 'persona-catalog-v1',
        databaseKey()
      ],
      { revalidate: 172800 }
    )()
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
