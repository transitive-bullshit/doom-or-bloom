import 'server-only'
import { people } from './people'
import { readFile } from 'node:fs/promises'
import { cache } from 'react'
import { resultSchema } from '@/lib/assessment/schema'
import type { Persona } from '@/lib/journeys/catalog'

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
    return {
      ...person,
      sources: journey?.personaSnapshot?.sources ?? [],
      result: resultSchema.parse(journey?.result)
    }
  })
})
