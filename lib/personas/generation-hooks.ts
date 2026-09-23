import 'server-only'
import { people } from '../../components/landing/people'
import { getPool } from '../db'
import type { Persona } from '../journeys/catalog'
import type { Journey } from '../journeys/schema'
import { personaMetadataSchema } from './payload'
import { personaRepository } from './repository'
import { personaGeneration } from './generation'

type Provenance = Parameters<ReturnType<typeof personaGeneration>['begin']>[1]
export function generationHooks() {
  const repo = personaRepository(getPool())
  const generations = personaGeneration(getPool())
  const pending = new Map<string, { id: string; provenance: Provenance }>()
  return {
    async onStart(persona: Persona, provenance: Provenance) {
      const order = people.findIndex((person) => person.id === persona.id)
      if (order < 0) return
      const id = await repo.upsertProfile(
        personaMetadataSchema.parse({ ...people[order], order }),
        persona
      )
      const run = await generations.begin(id, provenance, persona)
      if (!run.execute)
        throw new Error(
          'This generation already exists; inspect its saved status before starting a new run'
        )
      pending.set(persona.id, { id: run.id, provenance })
    },
    async onJourney(journey: Journey) {
      const run = pending.get(journey.personaId)
      if (run) await generations.finish(run.id, run.provenance, journey)
    }
  }
}
