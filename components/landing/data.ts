import 'server-only'
import { worldviewValues } from '@/lib/assessment/persona-matches'
import { reportServerError } from '@/lib/server/error-reporting'
import { cache } from 'react'
import { getPool } from '@/lib/db'
import { personaRepository } from '@/lib/personas/repository'
import { simulationPresentation } from '@/lib/personas/payload'
import { personaProfileSchema } from '@/lib/journeys/catalog'

const loadSelected = cache(() => personaRepository(getPool()).selected())
export const loadPersonaAssessment = cache(async (id: string) => {
  const row = (await loadSelected()).find((row) => row.metadata.id === id)
  return row ? simulationPresentation(row.payload).assessment : null
})
export const loadExamples = cache(async (featuredOnly = true) => {
  return (await loadSelected())
    .filter((row) => !featuredOnly || row.persona.featured)
    .map((row) => {
      const { order: _order, ...metadata } = row.metadata
      const brief = personaProfileSchema.parse(row.persona.sourceBrief)
      const recordedSources = row.payload.journey.personaSnapshot?.sources ?? []
      const sources = brief.sources ?? recordedSources
      return {
        ...metadata,
        assessmentId: row.assessmentId,
        sources: sources.map(({ title, url, summary }) => ({
          title,
          url,
          summary
        })),
        sourceBriefUpdated:
          JSON.stringify(sources) !== JSON.stringify(recordedSources),
        result: simulationPresentation(row.payload).result
      }
    })
})

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
