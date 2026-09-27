import { z } from 'zod'
import { resultPoint } from '@/lib/assessment/self-placement'

// Participant feedback about a displayed result: where they expected to land
// before it was revealed, and whether it feels right afterwards. Shared by the
// owner API and client components, so this module holds only contracts.

export const agreementAspects = [
  'outlook_too_doom',
  'outlook_too_bloom',
  'scale_too_high',
  'scale_too_low',
  'pdoom_too_high',
  'pdoom_too_low',
  'other'
] as const
export type AgreementAspect = (typeof agreementAspects)[number]

const coordinate = z.number().min(0).max(1)
const evidenceRevision = z.number().int().nonnegative()
const guess = z.strictObject({ x: coordinate, y: coordinate })
const agreement = {
  rating: z.enum(['yes', 'not_quite']),
  aspects: z
    .array(z.enum(agreementAspects))
    .max(agreementAspects.length)
    .refine(
      (aspects) => new Set(aspects).size === aspects.length,
      'Choose each aspect once'
    ),
  comment: z.string().trim().min(1).max(1000).optional()
}
// Only a "Not quite" rating names what is off.
const onlyCorrectionsHaveAspects = (value: {
  rating: string
  aspects: unknown[]
}) => value.rating === 'not_quite' || value.aspects.length === 0
const correctionIssue = {
  path: ['aspects'],
  message: 'A "Yes" rating has no aspects'
}

export const selfPlacementPayloadSchema = z.strictObject({
  guess,
  // Computed on the server from the stored result, never accepted from a client.
  placed: z.strictObject({ x: coordinate.nullable(), y: coordinate.nullable() })
})
export type SelfPlacementPayload = z.infer<typeof selfPlacementPayloadSchema>
// What the participant saw when rating it, computed on the server at write
// time. Presentation can change later, so audits never have to recompute it.
const shownSchema = z.strictObject({
  x: coordinate.nullable(),
  y: coordinate.nullable(),
  pdoom: coordinate.nullable(),
  pdoomLabel: z.string().max(120).nullable()
})
export const agreementPayloadSchema = z
  .strictObject({ ...agreement, shown: shownSchema.optional() })
  .refine(onlyCorrectionsHaveAspects, correctionIssue)
export type AgreementPayload = z.infer<typeof agreementPayloadSchema>

/** POST body for `/api/assessments/<id>/feedback`. */
export const feedbackRequestSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('self_placement'),
    evidenceRevision,
    guess
  }),
  z
    .strictObject({
      kind: z.literal('agreement'),
      evidenceRevision,
      ...agreement
    })
    .refine(onlyCorrectionsHaveAspects, correctionIssue)
])
export type FeedbackRequest = z.infer<typeof feedbackRequestSchema>

const saved = {
  evidenceRevision,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
}
/** One stored feedback entry, as returned by the owner API. */
export const feedbackItemSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('self_placement'),
    ...saved,
    payload: selfPlacementPayloadSchema
  }),
  z.strictObject({
    kind: z.literal('agreement'),
    ...saved,
    payload: agreementPayloadSchema
  })
])
export type FeedbackItem = z.infer<typeof feedbackItemSchema>

/** The map point shown for a saved result; the server records it as placed. */
export const resultPlacement: (
  result: Parameters<typeof resultPoint>[0]
) => SelfPlacementPayload['placed'] = resultPoint
