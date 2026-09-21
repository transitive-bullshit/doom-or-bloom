import 'server-only'
import { people } from './people'
import { readFile } from 'node:fs/promises'
import { cache } from 'react'
import { resultSchema } from '@/lib/assessment/schema'
import { personas, type Persona } from '@/lib/journeys/catalog'

export const loadExamples = cache(async () => {
  const suite = JSON.parse(
    await readFile('eval/development/live-persona-journeys.json', 'utf8')
  ) as {
    journeys: Array<{
      personaId: string
      result: unknown
      personaSnapshot?: Pick<Persona, 'sources'>
    }>
  }
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
