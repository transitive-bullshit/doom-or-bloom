import { z } from 'zod'
import {
  componentSchema,
  resultSchema,
  vectorSchema,
  versionsSchema,
  promptInstanceSchema,
  dispositionSchema
} from '@/lib/assessment/schema'
import { questionSchema, modelAnswerSchema } from '@/lib/assessment/schema'
import { personaSchema } from './catalog'

const traceSchema = z.strictObject({
  requestId: z.string(),
  baseRevision: z.number().int(),
  elapsedMs: z.number(),
  decisions: z
    .array(z.strictObject({ action: z.string(), detail: z.unknown() }))
    .max(50),
  stages: z
    .array(
      z.strictObject({
        name: z.string(),
        state: z.unknown(),
        questions: z.record(z.string(), questionSchema),
        answers: z.record(z.string(), modelAnswerSchema),
        model: z.string(),
        elapsedMs: z.number(),
        inputBytes: z.number(),
        outputBytes: z.number(),
        usage: z.strictObject({
          input_tokens: z.number(),
          output_tokens: z.number()
        }),
        attempts: z.number().int(),
        requests: z
          .array(
            z.strictObject({
              attempt: z.number(),
              model: z.string(),
              questionIds: z.array(z.string()),
              elapsedMs: z.number(),
              status: z.number().nullable(),
              response: z
                .strictObject({
                  model: z.string(),
                  answers: z.record(z.string(), modelAnswerSchema),
                  usage: z.strictObject({
                    input_tokens: z.number(),
                    output_tokens: z.number()
                  })
                })
                .optional()
            })
          )
          .optional()
      })
    )
    .max(10)
})

export const readinessSchema = z.strictObject({
  value: z.number().min(0).max(100),
  threshold: z.number(),
  ready: z.boolean(),
  covered: z.number().int(),
  total: z.number().int(),
  hasOutlook: z.boolean(),
  hasReasoning: z.boolean(),
  dimensions: z.array(
    z.strictObject({
      vector: vectorSchema,
      confidence: z.number(),
      unresolved: z.boolean(),
      contribution: z.number()
    })
  )
})
export const rankingSchema = z.object({
  id: z.string(),
  priority: z.number(),
  coverage: z.number(),
  ambiguity: z.number(),
  tension: z.number(),
  projection: z.number(),
  repetition: z.number(),
  effort: z.number()
})
export const journeyStepSchema = z.strictObject({
  ordinal: z.number().int(),
  operation: z.enum(['answer', 'project', 'retry', 'continue']),
  prompt: promptInstanceSchema,
  answer: z.string().nullable(),
  scriptKey: z.string().nullable(),
  disposition: dispositionSchema.nullable(),
  status: z.string(),
  readinessBefore: readinessSchema,
  readiness: readinessSchema,
  coverageAdded: z.array(vectorSchema),
  nextPrompt: promptInstanceSchema.nullable(),
  rankings: z.array(rankingSchema),
  paperclips: z.boolean(),
  stages: z.array(
    z.strictObject({
      name: z.string(),
      model: z.string(),
      questions: z.number().int(),
      attempts: z.number().int(),
      usage: z.strictObject({
        input_tokens: z.number(),
        output_tokens: z.number()
      })
    })
  ),
  trace: traceSchema.optional()
})
export const journeySchema = z.strictObject({
  personaId: z.string(),
  personaSnapshot: personaSchema.optional(),
  steps: z.array(journeyStepSchema).max(20),
  result: resultSchema.nullable(),
  stopped: z.string(),
  error: z.string().nullable(),
  firstReadyAnswer: z.number().nullable(),
  accepted: z.number().int(),
  finalReadiness: readinessSchema,
  components: z.array(componentSchema)
})
export type Journey = z.infer<typeof journeySchema>
export type JourneyStep = z.infer<typeof journeyStepSchema>
export const suiteSchema = z.strictObject({
  schemaVersion: z.literal(1),
  id: z.string().regex(/^(baseline|[0-9]{13}-[a-f0-9-]{36})$/),
  createdAt: z.string(),
  mode: z.enum(['synthetic', 'live']),
  authoring: z.literal('Codex-authored fictional answer scripts'),
  versions: versionsSchema,
  inputHash: z.string(),
  engineHash: z.string(),
  contentHash: z.string(),
  turns: z.number().int().min(1).max(6),
  requestBudget: z
    .strictObject({ maximum: z.number(), usedOrReserved: z.number() })
    .nullable(),
  journeys: z.array(journeySchema).max(10)
})
export type JourneySuite = z.infer<typeof suiteSchema>
export type RunIndex = Pick<
  JourneySuite,
  | 'id'
  | 'createdAt'
  | 'mode'
  | 'versions'
  | 'inputHash'
  | 'engineHash'
  | 'contentHash'
  | 'turns'
> & { personaIds: string[] }

export function runIndex(suite: JourneySuite): RunIndex {
  const {
    id,
    createdAt,
    mode,
    versions,
    inputHash,
    engineHash,
    contentHash,
    turns
  } = suite
  return {
    id,
    createdAt,
    mode,
    versions,
    inputHash,
    engineHash,
    contentHash,
    turns,
    personaIds: suite.journeys.map((j) => j.personaId)
  }
}

// Only semantic observations are compared: UUIDs, elapsed times, byte counts
// and transport use cannot make a deterministic regression fail.
export function journeySnapshot(journey: Journey) {
  return {
    steps: journey.steps.map((s) => ({
      operation: s.operation,
      prompt: s.prompt.promptId,
      answer: s.answer,
      scriptKey: s.scriptKey,
      disposition: s.disposition,
      status: s.status,
      readiness: Number(s.readiness.value.toFixed(4)),
      ready: s.readiness.ready,
      coverageAdded: s.coverageAdded,
      next: s.nextPrompt?.promptId ?? null,
      rankings: s.rankings.map((r) => ({
        ...r,
        priority: Number(r.priority.toFixed(6))
      })),
      paperclips: s.paperclips
    })),
    firstReadyAnswer: journey.firstReadyAnswer,
    accepted: journey.accepted,
    stopped: journey.stopped,
    error: journey.error,
    result: journey.result
      ? {
          horizontal: journey.result.horizontal.value,
          vertical: journey.result.vertical.value,
          horizontalRange: journey.result.horizontal.range,
          verticalRange: journey.result.vertical.range,
          components: journey.result.components.map((c) => ({
            vector: c.vector,
            value: c.value,
            range: c.range
          })),
          findings: journey.result.findings.map((f) => f.id),
          resources: journey.result.resources.map((r) => r.id),
          insufficient: journey.result.insufficient
        }
      : null
  }
}

export function compareJourneys(before: Journey, after: Journey) {
  const a = journeySnapshot(before),
    b = journeySnapshot(after)
  return Object.keys(a).filter(
    (key) =>
      JSON.stringify(a[key as keyof typeof a]) !==
      JSON.stringify(b[key as keyof typeof b])
  )
}
