import 'server-only'
import { randomUUID } from 'node:crypto'
import { versions } from '@/lib/assessment/schema'
import { budgetedProvider } from '@/lib/evaluation/budget'
import { createLiveProvider } from '@/lib/server/live-provider'
import { createOpenAIParticipant } from './participant'
import { liveJourneyBudget, meterJev } from './live-budget'
import { runJourneySuite } from './runner'
import { projectJourneyStore } from './store'
import type { Journey } from './schema'
import { personas } from './catalog'

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
