import 'server-only'
import { people } from './people'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { cache } from 'react'
import { resultSchema } from '@/lib/assessment/schema'
import { personas } from '@/lib/journeys/catalog'
import type { JourneySuite } from '@/lib/journeys/schema'
import { personaAssessment } from '@/lib/journeys/persona-assessment'

const loadSuite = cache(
  async () =>
    JSON.parse(
      await readFile(
        path.join(process.cwd(), 'eval/development/live-persona-journeys.json'),
        'utf8'
      )
    ) as JourneySuite
)

export const loadPersonaAssessment = cache(async (id: string) => {
  const journey = (await loadSuite()).journeys.find(
    (journey) => journey.personaId === id
  )
  return journey ? personaAssessment(journey) : null
})

export const loadExamples = cache(async () => {
  const suite = await loadSuite()
  return people.map((person) => {
    const journey = suite.journeys.find((j) => j.personaId === person.id)
    const recordedSources = journey?.personaSnapshot?.sources ?? []
    const sources =
      personas.find((persona) => persona.id === person.id)?.sources ??
      recordedSources
    return {
      ...person,
      sources: sources.map(({ title, url }) => ({ title, url })),
      sourceBriefUpdated:
        JSON.stringify(sources) !== JSON.stringify(recordedSources),
      result: resultSchema.parse(journey?.result)
    }
  })
})
