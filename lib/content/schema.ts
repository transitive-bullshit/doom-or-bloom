import { z } from 'zod'
import { questionSchema, vectorSchema } from '@/lib/assessment/schema'
export const templateIds = [
  'presence',
  'horizon',
  'horizon_unknown',
  'conviction',
  'disposition',
  'dimension',
  'position',
  'familiarity',
  'tension',
  'resolution',
  'route_coverage',
  'route_ambiguity',
  'route_tension',
  'route_projection',
  'catastrophic_score'
] as const
export const questionTemplatesSchema = z.strictObject({
  version: z.string(),
  status: z.enum(['draft', 'reviewed']),
  questions: z.record(z.enum(templateIds), questionSchema)
})
export type QuestionTemplates = z.infer<typeof questionTemplatesSchema>
const id = z
  .string()
  .regex(/^[a-z0-9][a-z0-9._-]+$/)
  .max(120)
export const promptSchema = z.strictObject({
  id,
  text: z.string().min(1).max(1000),
  family: z.string().max(80),
  readingLevel: z.enum(['general', 'expert']),
  prerequisites: z.array(vectorSchema),
  exclusions: z.array(vectorSchema),
  targets: z.array(vectorSchema).min(1),
  effort: z.number().min(0).max(1),
  noveltyGroup: id,
  maxUses: z.number().int().min(1).max(3),
  permittedAfter: z.array(z.string()),
  recoveryVariants: z.strictObject({
    reask: z.string(),
    clarification: z.string(),
    exhausted: z.string()
  }),
  contentVersion: z.string(),
  status: z.enum(['draft', 'reviewed'])
})
export type Prompt = z.infer<typeof promptSchema>
export const rubricSchema = z.strictObject({
  version: z.string(),
  status: z.enum(['draft', 'reviewed']),
  nonAnswerThreshold: z.number().min(0.5).max(1),
  presenceThreshold: z.number().min(0).max(1),
  readinessCoverage: z.number().int().min(1).max(15),
  quantiles: z.tuple([z.number().min(0).max(0.5), z.number().min(0.5).max(1)]),
  routingWeights: z.strictObject({
    coverage: z.number(),
    ambiguity: z.number(),
    tension: z.number(),
    projection: z.number(),
    effort: z.number(),
    repetition: z.number(),
    calibration: z.number().nonnegative().default(1)
  }),
  horizontalWeights: z.strictObject({
    beneficial_potential: z.number().positive(),
    risk_landscape: z.number().positive(),
    human_agency: z.number().positive()
  }),
  dimensions: z
    .array(
      z.strictObject({
        id: vectorSchema,
        label: z.string(),
        meaning: z.string(),
        levels: z.array(z.string()).min(2).max(6)
      })
    )
    .min(15)
    .max(15),
  catastrophicRisk: z.strictObject({
    label: z.string(),
    meaning: z.string(),
    levels: z.array(z.string()).min(2).max(6)
  })
})
export type Rubric = z.infer<typeof rubricSchema>
export const referenceSchema = z.strictObject({
  id,
  kind: z.enum(['entity', 'event', 'publication']),
  title: z.string(),
  aliases: z.array(z.string()).min(1),
  topics: z.array(z.string()).min(1),
  date: z.string(),
  entities: z.array(id),
  related: z.array(id),
  content_version: z.string(),
  status: z.enum(['draft', 'reviewed']),
  reviewer: z.string().nullable(),
  sources: z
    .array(
      z.strictObject({
        url: z.url(),
        type: z.literal('primary'),
        accessed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
      })
    )
    .min(1)
})
export type Reference = z.infer<typeof referenceSchema> & { summary: string }
export const conditionSchema = z.strictObject({
  vector: vectorSchema,
  min: z.number().min(0).max(1).optional(),
  max: z.number().min(0).max(1).optional(),
  assessed: z.boolean().default(true)
})
export const findingSchema = z.strictObject({
  id,
  text: z.string(),
  conditions: z.array(conditionSchema).min(1),
  exclusions: z.array(conditionSchema),
  status: z.enum(['draft', 'reviewed'])
})
export const resourceSchema = z.strictObject({
  id,
  title: z.string(),
  url: z.url(),
  purpose: z.string(),
  purposeGroup: z.enum([
    'governance',
    'science',
    'capability',
    'evaluation',
    'risk',
    'control',
    'agency'
  ]),
  referenceIds: z.array(id).default([]),
  priority: z.number().min(0).max(1).default(0),
  effort: z.string(),
  familiarity: z.enum(['general', 'expert']),
  conditions: z.array(conditionSchema).min(1),
  exclusions: z.array(conditionSchema),
  status: z.enum(['draft', 'reviewed']),
  sourceAccessed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
})
export const manifestSchema = z.strictObject({
  contentVersion: z.string(),
  rubricVersion: z.string(),
  assessmentVersion: z.string(),
  status: z.enum(['draft', 'reviewed']),
  reviewer: z.string().nullable(),
  changelog: z.string(),
  hashes: z.record(z.string(), z.string().regex(/^[0-9a-f]{64}$/))
})
