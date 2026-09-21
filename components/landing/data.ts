import 'server-only'
import { people } from './people'
import { readFile } from 'node:fs/promises'
import { cache } from 'react'
import { resultSchema } from '@/lib/assessment/schema'

export const loadExamples = cache(async () => {
  const suite = JSON.parse(
    await readFile('eval/development/live-persona-journeys.json', 'utf8')
  ) as { journeys: Array<{ personaId: string; result: unknown }> }
  return people.map((person) => {
    const journey = suite.journeys.find((j) => j.personaId === person.id)
    return { ...person, result: resultSchema.parse(journey?.result) }
  })
})
