import { z } from 'zod'

export const worldviewIds = [
  'capability_trajectory',
  'transition_dynamics',
  'beneficial_potential',
  'risk_landscape',
  'technical_controllability',
  'institutional_competence',
  'human_agency',
  'action_posture'
] as const
export const epistemicIds = [
  'causal_clarity',
  'scope_discipline',
  'appropriate_uncertainty',
  'internal_coherence',
  'counterargument_engagement',
  'updateability',
  'grounded_understanding'
] as const
export const vectorIds = [...worldviewIds, ...epistemicIds] as const
export const vectorSchema = z.enum(vectorIds)
export type VectorId = z.infer<typeof vectorSchema>
export const limits = {
  prompts: 12,
  warning: 10,
  recovery: 3,
  answerChars: 2000,
  requestBytes: 8_000_000,
  questions: 96,
  referenceCandidates: 12,
  resolvedReferences: 2,
  providerAttempts: 16
} as const
export const versionsSchema = z.strictObject({
  assessment: z.string().max(50),
  content: z.string().max(50),
  rubric: z.string().max(50),
  model: z.string().max(80)
})
export const versions = {
  assessment: '0.2.1',
  content: '0.1.0-draft',
  rubric: '0.1.0-draft',
  model: 'jev-1.13.0'
}
export const rootPrompt = 'What do you think AI means for our future—and why?'
export const dispositionSchema = z.enum([
  'usable',
  'needs_clarification',
  'non_answer',
  'navigation'
])
export type Disposition = z.infer<typeof dispositionSchema>
const probability = z.number().finite().min(0).max(1)
const distribution = z
  .record(z.string().max(120), probability)
  .refine(
    (d) => Math.abs(Object.values(d).reduce((a, b) => a + b, 0) - 1) < 0.015,
    'Probabilities must sum to one'
  )
export const questionSchema = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal('choice'),
    instructions: z.string().max(5000),
    criteria: z.record(z.string().max(120), z.string().nullable())
  }),
  z.strictObject({
    type: z.literal('score'),
    instructions: z.string().max(5000),
    criteria: z.array(z.string()).min(2).max(12)
  }),
  z.strictObject({
    type: z.literal('noul'),
    instructions: z.string().max(5000),
    criteria: z.strictObject({ true: z.string(), false: z.string() }).optional()
  })
])
export type Question = z.infer<typeof questionSchema>
export const modelAnswerSchema = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal('choice'),
    choice: z.string(),
    probabilities: distribution,
    confidence: probability
  }),
  z.strictObject({
    type: z.literal('score'),
    score: z.number().finite().min(0).max(11),
    legend: z.record(z.string(), z.string()),
    probabilities: distribution,
    confidence: probability
  }),
  z.strictObject({ type: z.literal('noul'), noul: probability })
])
export type ModelAnswer = z.infer<typeof modelAnswerSchema>
export const judgmentSchema = z.strictObject({
  id: z.string().max(120),
  questionId: z.string().max(120),
  answerId: z.string().max(120),
  vector: vectorSchema.optional(),
  stage: z.enum(['interpret', 'identify', 'ground', 'route', 'project']),
  question: questionSchema,
  answer: modelAnswerSchema,
  model: z.string().max(80),
  rubricVersion: z.string().max(50)
})
export type Judgment = z.infer<typeof judgmentSchema>
export const spanSchema = z.strictObject({
  id: z.string().max(120),
  start: z.number().int().min(0),
  end: z.number().int().min(0),
  text: z.string().max(limits.answerChars)
})
export const promptInstanceSchema = z.strictObject({
  id: z.string().max(120),
  promptId: z.string().max(120),
  text: z.string().max(2000),
  family: z.string().max(80),
  ordinal: z.number().int().min(1).max(limits.prompts),
  variant: z.string().max(80),
  target: vectorSchema.optional(),
  claimTarget: z.literal('catastrophic_risk').optional(),
  sourceEvidenceIds: z.array(z.string()).max(100)
})
export type PromptInstance = z.infer<typeof promptInstanceSchema>
export const answerSchema = z.strictObject({
  id: z.string().max(120),
  promptInstanceId: z.string().max(120),
  promptText: z.string().max(2000),
  text: z.string().min(1).max(limits.answerChars),
  spans: z.array(spanSchema).max(80),
  substantive: z.boolean(),
  correctionTarget: vectorSchema.optional(),
  correctionClaimTarget: z.literal('catastrophic_risk').optional(),
  context: z
    .strictObject({
      horizonSpanId: z.string().nullable(),
      convictionSpanId: z.string().nullable(),
      assumptionSpanId: z.string().nullable()
    })
    .optional()
})
export type Answer = z.infer<typeof answerSchema>
export const evidenceSchema = z.strictObject({
  id: z.string().max(160),
  answerId: z.string(),
  spanId: z.string(),
  vector: vectorSchema,
  status: z.enum([
    'stated',
    'strongly_implied',
    'weakly_inferred',
    'disputed',
    'superseded'
  ]),
  judgmentIds: z.array(z.string()).max(20),
  referenceIds: z.array(z.string()).max(12),
  contextReferenceIds: z.array(z.string()).max(12),
  horizonSpanId: z.string().nullable(),
  convictionSpanId: z.string().nullable(),
  assumptionSpanId: z.string().nullable()
})
export type EvidenceEntry = z.infer<typeof evidenceSchema>
export const referenceClaimSchema = z.strictObject({
  id: z.string().max(160),
  answerId: z.string(),
  spanId: z.string(),
  referenceId: z.string(),
  attribution: z.enum(['yes', 'no', 'unclear']),
  fit: z.enum(['yes', 'no', 'unclear']),
  uncertainty: z.enum(['yes', 'no', 'unclear']),
  materiality: z.enum(['yes', 'no', 'unclear']),
  judgmentIds: z.array(z.string()).max(8)
})
export const attemptSchema = z.strictObject({
  id: z.string(),
  promptInstanceId: z.string(),
  variant: z.string(),
  disposition: dispositionSchema,
  confidence: probability,
  evaluated: z.boolean()
})
export const componentSchema = z.strictObject({
  vector: z.string().max(80),
  label: z.string().max(120),
  value: z.number().finite().min(0).max(1).nullable(),
  range: z.tuple([probability, probability]),
  distribution: z.record(z.string(), probability),
  confidence: probability.nullable(),
  evidenceIds: z.array(z.string()).max(200),
  claim: z.string().max(2000).nullable()
})
export type Component = z.infer<typeof componentSchema>
export const resultSchema = z.strictObject({
  evidenceRevision: z.number().int().min(0),
  versions: versionsSchema,
  horizontal: componentSchema,
  vertical: componentSchema,
  components: z.array(componentSchema).max(40),
  findings: z
    .array(
      z.strictObject({
        id: z.string(),
        text: z.string().max(3000),
        evidenceIds: z.array(z.string()).max(200)
      })
    )
    .max(8),
  resources: z
    .array(
      z.strictObject({
        id: z.string(),
        title: z.string(),
        url: z.url(),
        purpose: z.string(),
        effort: z.string()
      })
    )
    .max(5),
  fingerprint: z.array(componentSchema).max(5).default([]),
  sources: z
    .array(
      z.strictObject({
        id: z.string(),
        title: z.string(),
        urls: z.array(z.url()).max(8),
        status: z.enum(['draft', 'reviewed']),
        accessed: z.string()
      })
    )
    .max(200)
    .default([]),
  provisional: z.boolean(),
  capped: z.boolean(),
  insufficient: z.boolean(),
  reason: z.string().max(500)
})
export type Result = z.infer<typeof resultSchema>
export const assessmentSchema = z.strictObject({
  schemaVersion: z.literal(1),
  id: z.string().max(120),
  revision: z.number().int().min(0),
  evidenceRevision: z.number().int().min(0),
  versions: versionsSchema,
  status: z.enum([
    'answering',
    'recovery',
    'paused',
    'results',
    'completed',
    'capped'
  ]),
  prompts: z.array(promptInstanceSchema).min(1).max(limits.prompts),
  answers: z.array(answerSchema).max(limits.prompts),
  attempts: z.array(attemptSchema).max(limits.prompts * limits.recovery),
  interactionHistory: z
    .array(
      z.strictObject({
        requestId: z.string().max(120),
        promptInstanceId: z.string().max(120),
        text: z.string().max(limits.answerChars),
        disposition: dispositionSchema
      })
    )
    .max(20)
    .default([]),
  judgments: z.array(judgmentSchema).max(5000),
  evidence: z.array(evidenceSchema).max(limits.prompts * vectorIds.length),
  referenceClaims: z
    .array(referenceClaimSchema)
    .max(limits.prompts * limits.resolvedReferences)
    .default([]),
  familiarity: z
    .strictObject({
      level: z.enum(['unknown', 'general', 'expert']),
      answerId: z.string().nullable(),
      judgmentId: z.string().nullable()
    })
    .default({ level: 'unknown', answerId: null, judgmentId: null }),
  coverage: z.record(
    vectorSchema,
    z.enum(['unassessed', 'assessed', 'ambiguous'])
  ),
  unresolved: z
    .array(
      z.strictObject({
        id: z.string(),
        vector: vectorSchema,
        evidenceIds: z.array(z.string()),
        kind: z.enum(['ambiguity', 'tension', 'reference'])
      })
    )
    .max(100),
  recovery: z.strictObject({
    evaluated: z.number().int().min(0).max(3),
    clearMisses: z.number().int().min(0).max(150),
    paperclipShown: z.boolean(),
    paperclipActive: z.boolean(),
    reason: z
      .enum([
        'non_answer',
        'needs_clarification',
        'navigation',
        'exhausted',
        'stopped'
      ])
      .nullable()
  }),
  draft: z.string().max(limits.answerChars),
  result: resultSchema.nullable(),
  eventMarkers: z.array(z.string().max(200)).max(1000)
})
export type Assessment = z.infer<typeof assessmentSchema>
export const operationSchema = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal('answer'),
    text: z.string().trim().min(1).max(limits.answerChars)
  }),
  z.strictObject({ type: z.literal('project') }),
  z.strictObject({ type: z.literal('continue') }),
  z.strictObject({
    type: z.literal('clarify'),
    vector: vectorSchema,
    claim: z.literal('catastrophic_risk').optional()
  }),
  z.strictObject({ type: z.literal('skip') }),
  z.strictObject({ type: z.literal('retry') }),
  z.strictObject({ type: z.literal('dismiss') }),
  z.strictObject({ type: z.literal('stop') }),
  z.strictObject({ type: z.literal('complete') })
])
export type Operation = z.infer<typeof operationSchema>
export const requestSchema = z.strictObject({
  requestId: z.string().min(1).max(120),
  assessment: assessmentSchema
    .omit({ interactionHistory: true })
    .transform((snapshot) => ({
      ...snapshot,
      interactionHistory: [] as Assessment['interactionHistory']
    })),
  operation: operationSchema,
  debug: z.boolean().default(false)
})
export type AssessmentRequest = z.infer<typeof requestSchema>
export type DebugStage = {
  name: string
  state: unknown
  questions: Record<string, Question>
  answers: Record<string, ModelAnswer>
  model: string
  elapsedMs: number
  inputBytes: number
  outputBytes: number
  usage: { input_tokens: number; output_tokens: number }
  attempts: number
}
export type DebugTrace = {
  requestId: string
  baseRevision: number
  stages: DebugStage[]
  decisions: Array<{ action: string; detail: unknown }>
  elapsedMs: number
}
export type AssessmentResponse = {
  assessmentId: string
  baseRevision: number
  requestId: string
  assessment: Assessment
  debug?: DebugTrace
  provider: 'live' | 'fixture'
}
