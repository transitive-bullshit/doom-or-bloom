import { z } from 'zod'

const feedbackKinds = ['questions', 'corpus'] as const
export const feedbackKindSchema = z.enum(feedbackKinds)
export type FeedbackKind = z.infer<typeof feedbackKindSchema>
export const feedbackLimit = 20_000
export const feedbackInputSchema = z.strictObject({
  kind: feedbackKindSchema,
  resourceId: z.string().min(1).max(120),
  text: z.string().trim().min(1).max(feedbackLimit)
})
export const feedbackEntrySchema = z.strictObject({
  id: z.string().min(1),
  resourceId: z.string().min(1).max(120),
  label: z.string(),
  contentVersion: z.string(),
  assetHash: z.string().regex(/^[0-9a-f]{64}$/),
  text: z.string().min(1).max(feedbackLimit),
  createdAt: z.iso.datetime()
})
export type FeedbackEntry = z.infer<typeof feedbackEntrySchema>
export const feedbackFileSchema = z.strictObject({
  schemaVersion: z.literal(1),
  entries: z.array(feedbackEntrySchema)
})
