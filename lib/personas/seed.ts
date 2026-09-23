import 'server-only'
import { readFile } from 'node:fs/promises'
import type { Pool } from 'pg'
import { people } from '../../components/landing/people'
import { personas as authoredPersonas } from '../journeys/catalog'
import { suiteSchema } from '../journeys/schema'
import { historicalPayload, personaMetadataSchema } from './payload'
import { personaRepository } from './repository'

export async function seedPersonas(pool: Pool) {
  const repo = personaRepository(pool)
  const suite = suiteSchema.parse(
    JSON.parse(
      await readFile('eval/development/live-persona-journeys.json', 'utf8')
    )
  )
  const ids: string[] = []
  for (const [order, person] of people.entries()) {
    const journey = suite.journeys.find((item) => item.personaId === person.id)
    const brief = authoredPersonas.find((item) => item.id === person.id)
    if (!journey || !brief || journey.error || !journey.result)
      throw new Error(`Missing successful curated fixture: ${person.id}`)
    const personaId = await repo.upsertProfile(
      personaMetadataSchema.parse({ ...person, order }),
      brief
    )
    const payload = historicalPayload(suite, journey)
    ids.push(
      await repo.publish(
        personaId,
        `historical-v1:${payload.provenance.runId}:${person.id}`,
        payload
      )
    )
  }
  return ids
}
