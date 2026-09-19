import { z } from 'zod'
import { limits, vectorSchema } from '@/lib/assessment/schema'
export const mechanicalCaseSchema = z.strictObject({
  id: z.string().regex(/^[a-z][a-z0-9-]+$/),
  name: z.string(),
  proxy: z.string(),
  description: z.string(),
  concern: z.string(),
  sources: z.array(z.strictObject({ title: z.string(), url: z.url() })),
  familiarity: z.enum(['general', 'expert']),
  opening: z.string().min(1).max(limits.answerChars),
  openingVectors: z.array(vectorSchema),
  openingTiming: z.boolean(),
  openingConviction: z.boolean(),
  levels: z.record(z.string(), z.number().int().min(0).max(3).nullable()),
  claims: z.strictObject({
    change: z.string(),
    timing: z.string(),
    conviction: z.string(),
    mechanism: z.string(),
    weakestLink: z.string(),
    basis: z.string(),
    control: z.string(),
    governance: z.string(),
    benefit: z.string(),
    harm: z.string(),
    misuse: z.string().optional(),
    catastrophe: z.string(),
    ordinary: z.string(),
    update: z.string(),
    alternative: z.string(),
    agency: z.string(),
    transition: z.string(),
    tradeoff: z.string(),
    assumption: z.string()
  }),
  recoveryPrelude: z.array(z.string()).max(2)
})
export type MechanicalCase = z.infer<typeof mechanicalCaseSchema>
// Live provenance contains the character and review context, without the
// injected values used only by the deterministic fixture provider.
export const legacyProfileSchema = mechanicalCaseSchema
  .omit({
    openingVectors: true,
    openingTiming: true,
    openingConviction: true,
    levels: true
  })
  .strip()
