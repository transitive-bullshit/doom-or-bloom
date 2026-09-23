import { z } from 'zod'
import { operationSchema } from '../assessment/schema'

export const submitSchema = z.strictObject({
  assessmentId: z.uuid(),
  expectedRevision: z.number().int().nonnegative(),
  requestKey: z.string().min(1).max(120),
  operation: operationSchema,
  retryOf: z.uuid().optional(),
  debug: z.boolean().default(false)
})
export type Submission = z.infer<typeof submitSchema>

export class AssessmentError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    message: string
  ) {
    super(message)
  }
}
