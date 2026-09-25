import 'server-only'
import { randomUUID } from 'node:crypto'
import { versions } from '@/lib/assessment/schema'
import { budgetedProvider } from '@/lib/evaluation/budget'
import { createLiveProvider } from '@/lib/server/live-provider'
import { createOpenAIParticipant } from './participant'
import { liveJourneyBudget, meterJev } from './live-budget'
import { runJourneySuite, runPersona, journeyHashes } from './runner'
import { projectJourneyStore } from './store'
import type { Journey } from './schema'
import { fixedUserPersona } from './fixed'
import { personas } from './catalog'
import { loadBundle } from '@/lib/content/loader'
import { suiteSchema } from './schema'
import { generationHooks } from '../personas/generation-hooks'
import { mergeJourneySuites } from './merge'

export async function runLiveJourneys({
  personaId,
  personaIds,
  turns = 5,
  maxRequests,
  maxCost,
  onJourney
}: {
  personaId?: string
  personaIds?: string[]
  turns?: number
  maxRequests?: number
  maxCost?: number
  onJourney?: (journey: Journey) => void
} = {}) {
  if (personaId && personaIds) throw new Error('Choose one selection option')
  if (
    personaIds &&
    (!personaIds.length ||
      new Set(personaIds).size !== personaIds.length ||
      personaIds.some((id) => !personas.some((person) => person.id === id)))
  )
    throw new Error('Unknown or repeated simulated user')
  if (
    personaId &&
    ![...personas, fixedUserPersona].some((p) => p.id === personaId)
  )
    throw new Error('Unknown persona')
  if (!Number.isInteger(turns) || turns < 1 || turns > 12)
    throw new Error('Journey turn bound is 1–12')
  if (!process.env.TYPESAFE_API_KEY?.trim())
    throw new Error('Missing TYPESAFE_API_KEY')
  const budget = liveJourneyBudget(maxCost ?? (personaId ? 2 : 5))
  const paid = budgetedProvider(
    meterJev(createLiveProvider(versions.model), budget),
    maxRequests ??
      Math.min(
        1536,
        (personaIds?.length ?? (personaId ? 1 : personas.length + 1)) * 24
      ),
    1536
  )
  const participant = createOpenAIParticipant({
    budget,
    maxRequests:
      (personaIds?.length ?? (personaId ? 1 : personas.length)) * turns
  })
  const persistence = generationHooks()
  const store = projectJourneyStore()
  const previousIndex =
    personaId || personaIds
      ? (await store.list()).find((run) => run.mode === 'live')
      : undefined
  const previous = previousIndex ? await store.read(previousIndex.id) : null
  const suite = await runJourneySuite({
    id: `${Date.now()}-${randomUUID()}`,
    personaId,
    personaIds,
    concurrency: personaIds ? 4 : 1,
    turns,
    live: paid.provider,
    participant,
    budgetReport: paid.report,
    costReport: budget.report,
    onStart: (persona, provenance) => persistence.onStart(persona, provenance),
    onJourney: async (journey) => {
      await persistence.onJourney(journey)
      onJourney?.(journey)
    }
  })
  await store.save(mergeJourneySuites(previous, suite))
  return suite
}

export async function resumeLiveJourney({
  runId,
  personaId,
  maxRequests = 24,
  maxCost = 0.5
}: {
  runId: string
  personaId: string
  maxRequests?: number
  maxCost?: number
}) {
  const store = projectJourneyStore()
  const source = await store.read(runId)
  const previous = source.journeys.find((j) => j.personaId === personaId)
  const persona = personas.find((p) => p.id === personaId)
  if (source.mode !== 'live' || !previous?.failedOperation || !persona)
    throw new Error(
      'Select a live journey with a saved failed operation; older failures without a checkpoint cannot be resumed'
    )
  const bundle = loadBundle(
    previous.failedOperation.assessment.versions.content
  )
  const hashes = journeyHashes(bundle)
  if (
    hashes.contentHash !== source.contentHash ||
    source.versions.model !== versions.model
  )
    throw new Error(
      'Resume requires unchanged authored content and model; use the matching checkout'
    )
  const budget = liveJourneyBudget(maxCost ?? (personaId ? 2 : 5))
  const paid = budgetedProvider(
    meterJev(createLiveProvider(versions.model), budget),
    maxRequests,
    24
  )
  const id = `${Date.now()}-${randomUUID()}`
  const createdAt = new Date().toISOString()
  const persistence = generationHooks()
  await persistence.onStart(persona, { runId: id, createdAt, ...hashes })
  const journey = await runPersona(
    persona,
    bundle,
    source.turns,
    paid.provider,
    undefined,
    source.exerciseResults,
    previous
  )
  await persistence.onJourney(journey)
  const suite = suiteSchema.parse({
    ...source,
    sourceRuns: undefined,
    id,
    createdAt,
    ...hashes,
    resumedFrom: { runId, personaId },
    journeys: [journey],
    requestBudget: paid.report(),
    cost: budget.report()
  })
  await store.save(mergeJourneySuites(source, suite))
  return suite
}
