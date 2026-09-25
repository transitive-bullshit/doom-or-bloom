import { z } from 'zod'
import { assessmentSchema } from '../assessment/schema'
import {
  journeySchema,
  type Journey,
  type JourneySuite
} from '../journeys/schema'
import { personaAssessment } from '../journeys/persona-assessment'

export const personaMetadataSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  shortName: z.string(),
  featured: z.boolean().default(true),
  possessivePronoun: z.enum(['his', 'her', 'their']).optional(),
  avatar: z.string(),
  initials: z.string(),
  stance: z.string(),
  description: z.string(),
  tone: z.string(),
  xUrl: z.string().nullable().optional(),
  xUsername: z.string().nullable().optional(),
  profileUrl: z.string().optional(),
  profileLabel: z.string().optional(),
  order: z.number().int()
})
export type PersonaMetadata = z.infer<typeof personaMetadataSchema>
const provenanceSchema = z.object({
  runId: z.string(),
  createdAt: z.string(),
  inputHash: z.string(),
  engineHash: z.string(),
  contentHash: z.string(),
  originalAssessmentId: z.string().optional(),
  originalRevision: z.number().optional()
})
const historicalPayloadSchema = z.object({
  kind: z.literal('historical_journey_v1'),
  journey: journeySchema,
  provenance: provenanceSchema
})
export const simulationPayloadSchema = z.object({
  kind: z.literal('simulation_v1'),
  journey: journeySchema,
  assessment: assessmentSchema,
  provenance: provenanceSchema
})
export const simulationPayload = z.discriminatedUnion('kind', [
  historicalPayloadSchema,
  simulationPayloadSchema
])
export type SimulationPayload = z.infer<typeof simulationPayload>

/** No provider request bodies, transport traces, failed inputs, or unpublished states. */
export function publicJourney(journey: Journey): Journey {
  return journeySchema.parse({
    personaId: journey.personaId,
    personaSnapshot: journey.personaSnapshot,
    steps: journey.steps.map(({ trace: _trace, ...step }) => step),
    result: journey.result,
    stopped: journey.stopped,
    error: journey.error,
    firstReadyAnswer: journey.firstReadyAnswer,
    accepted: journey.accepted,
    finalReadiness: journey.finalReadiness,
    components: journey.components
  })
}
export function historicalPayload(suite: JourneySuite, journey: Journey) {
  const source = suite.sourceRuns?.find((run) =>
    run.personaIds.includes(journey.personaId)
  )
  return historicalPayloadSchema.parse({
    kind: 'historical_journey_v1',
    journey: publicJourney(journey),
    provenance: {
      runId: source?.runId ?? suite.id,
      createdAt: source?.createdAt ?? suite.createdAt,
      inputHash: source?.inputHash ?? suite.inputHash,
      engineHash: source?.engineHash ?? suite.engineHash,
      contentHash: source?.contentHash ?? suite.contentHash
    }
  })
}
export function simulationPresentation(payload: SimulationPayload) {
  return {
    result: payload.journey.result!,
    assessment: personaAssessment(payload.journey)
  }
}
