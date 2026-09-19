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
import { personas } from './catalog'
import { loadBundle } from '@/lib/content/loader'
import { suiteSchema } from './schema'

export async function runLiveJourneys({
  personaId,
  turns = 5,
  maxRequests,
  maxCost = 2,
  onJourney
}: {
  personaId?: string
  turns?: number
  maxRequests?: number
  maxCost?: number
  onJourney?: (journey: Journey) => void
} = {}) {
  if (personaId && !personas.some((p) => p.id === personaId))
    throw new Error('Unknown persona')
  if (!Number.isInteger(turns) || turns < 1 || turns > 6)
    throw new Error('Journey turn bound is 1–6')
  if (!process.env.TYPESAFE_API_KEY?.trim())
    throw new Error('Missing TYPESAFE_API_KEY')
  const budget = liveJourneyBudget(maxCost)
  const paid = budgetedProvider(
    meterJev(createLiveProvider(versions.model), budget),
    maxRequests ?? (personaId ? 24 : 240),
    240
  )
  const participant = createOpenAIParticipant({
    budget,
    maxRequests: (personaId ? 1 : personas.length) * turns
  })
  const suite = await runJourneySuite({
    id: `${Date.now()}-${randomUUID()}`,
    personaId,
    turns,
    live: paid.provider,
    participant,
    budgetReport: paid.report,
    costReport: budget.report,
    onJourney
  })
  await projectJourneyStore().save(suite)
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
  const budget = liveJourneyBudget(maxCost)
  const paid = budgetedProvider(
    meterJev(createLiveProvider(versions.model), budget),
    maxRequests,
    24
  )
  const journey = await runPersona(
    persona,
    bundle,
    source.turns,
    paid.provider,
    undefined,
    source.exerciseResults,
    previous
  )
  const suite = suiteSchema.parse({
    ...source,
    id: `${Date.now()}-${randomUUID()}`,
    createdAt: new Date().toISOString(),
    ...hashes,
    resumedFrom: { runId, personaId },
    journeys: [journey],
    requestBudget: paid.report(),
    cost: budget.report()
  })
  await store.save(suite)
  return suite
}
