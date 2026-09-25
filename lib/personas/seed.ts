import { createLocalJourneyStore } from '../journeys/local-store'
import 'server-only'
import type { Pool } from 'pg'
import { people } from '../../components/landing/people'
import { personas as authoredPersonas } from '../journeys/catalog'
import { historicalPayload, personaMetadataSchema } from './payload'
import { personaRepository } from './repository'

export async function seedPersonas(pool: Pool) {
  const repo = personaRepository(pool)
  const ids: string[] = []
  for (const [order, person] of people.entries()) {
    const suite = await createLocalJourneyStore(process.cwd()).latest(person.id)
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
