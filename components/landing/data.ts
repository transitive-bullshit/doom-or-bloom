import 'server-only'
import { worldviewValues } from '@/lib/assessment/persona-matches'
import { reportServerError } from '@/lib/server/error-reporting'
import { cache } from 'react'
import { getPool } from '@/lib/db'
import { personaRepository } from '@/lib/personas/repository'
import { simulationPresentation } from '@/lib/personas/payload'
import { personaProfileSchema } from '@/lib/journeys/catalog'

const loadSummaries = cache((featuredOnly: boolean) =>
  personaRepository(getPool()).selectedSummaries(featuredOnly)
)
export const loadPersona = cache(async (slug: string) => {
  const row = await personaRepository(getPool()).selectedBySlug(slug)
  return row
    ? {
        person: exampleFromSummary({
          metadata: row.metadata,
          assessmentId: row.assessmentId,
          sources: personaProfileSchema.parse(row.persona.sourceBrief).sources,
          recordedSources: row.payload.journey.personaSnapshot?.sources ?? [],
          result: row.payload.journey.result!
        }),
        assessment: simulationPresentation(row.payload).assessment
      }
    : null
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
    sources: row.sources.map(({ title, url, summary }) => ({
      title,
      url,
      summary
    })),
    sourceBriefUpdated:
      JSON.stringify(row.sources) !== JSON.stringify(row.recordedSources),
    result: row.result
  }
}

/** Identical comparison inputs for private and public participant results. */
export const loadPersonaComparisons = cache(async () => {
  try {
    return (await loadExamples()).map(({ id, name, slug, avatar, result }) => ({
      id,
      name,
      slug,
      avatar,
      values: worldviewValues(result)
    }))
  } catch (err) {
    reportServerError('persona_comparisons_unavailable', err, {})
    return []
  }
})
