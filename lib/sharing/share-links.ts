import { z } from 'zod'
import { worldviewIds } from '@/lib/assessment/schema'
import { cardSchema } from './card'

// Card-only share links ("snapshot links"): a short, unguessable URL that shows
// what the downloadable card already shows, never answers. Shared by the owner
// API, the public page and the recipient's browser, so it stays client-safe.

/** 12 random bytes as base64url: 96 bits, 16 characters. */
export const shareLinkIdSchema = z.string().regex(/^[A-Za-z0-9_-]{16}$/)

/**
 * The optional first name the sharer types. Letters and marks in any script,
 * with single spaces, hyphens or apostrophes between them: no digits, dots,
 * slashes or colons, so it cannot carry a URL or a handle.
 */
export const sharerNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .regex(/^[\p{L}\p{M}]+(?:[ '’-][\p{L}\p{M}]+)*$/u)

export const shareLinkRequestSchema = z.strictObject({
  // An empty field means no name; the page then says “A friend”.
  name: z
    .union([z.literal(''), sharerNameSchema])
    .optional()
    .transform((name) => name || null),
  // The page language, so the new link is warmed where it will be shared.
  locale: z.string().max(10).optional()
})

const coordinate = z.number().finite().min(0).max(1)

/** What a recipient's browser needs to compare: values, never answers. */
export const shareComparisonSchema = z.strictObject({
  values: z.partialRecord(z.enum(worldviewIds), coordinate),
  map: z.strictObject({
    x: coordinate.nullable(),
    y: coordinate.nullable()
  }),
  pdoomSource: z.enum(['stated', 'inferred']).nullable()
})
export type ShareComparison = z.infer<typeof shareComparisonSchema>

/** The public resource behind /s/<id>, for the page and for comparisons. */
export const publicShareLinkSchema = z.strictObject({
  id: shareLinkIdSchema,
  name: sharerNameSchema.nullable(),
  createdAt: z.iso.datetime({ offset: true }),
  card: cardSchema,
  comparison: shareComparisonSchema
})
export type PublicShareLink = z.infer<typeof publicShareLinkSchema>

/** The owner's view of a link; the id is all the share bar needs. */
export type OwnerShareLink = {
  id: string
  name: string | null
  evidenceRevision: number
  createdAt: string
}

export const shareLinkPath = (id: string) => `/s/${id}`
