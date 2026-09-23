import 'server-only'
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
        sources: sources.map(({ title, url }) => ({ title, url })),
        sourceBriefUpdated:
          JSON.stringify(sources) !== JSON.stringify(recordedSources),
        result: simulationPresentation(row.payload).result
      }
    })
})
