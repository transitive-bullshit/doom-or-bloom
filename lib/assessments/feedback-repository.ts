import 'server-only'
import { and, asc, eq, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import type { Pool } from 'pg'
import { resultSchema } from '../assessment/schema'
import { presentResult } from '../assessment/present-result'
import {
  assessmentFeedback,
  assessmentSnapshots,
  assessments
} from '../db/schema'
import { AssessmentError } from './contracts'
import {
  feedbackItemSchema,
  resultPlacement,
  type FeedbackItem,
  type FeedbackRequest
} from './feedback'

type FeedbackRow = typeof assessmentFeedback.$inferSelect
const missing = () =>
  new AssessmentError('not_found', 404, 'Assessment not found.')
const item = (row: FeedbackRow): FeedbackItem =>
  feedbackItemSchema.parse({
    kind: row.kind,
    evidenceRevision: row.evidenceRevision,
    payload: row.payload,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  })

// Owner-only feedback about a displayed result. Ownership is checked through
// the assessment on every read and write, matching the assessment repository.
export function feedbackRepository(pool: Pool) {
  const db = drizzle(pool)
  return {
    async list(ownerId: string, assessmentId: string) {
      const rows = await db
        .select({ feedback: assessmentFeedback })
        .from(assessments)
        .leftJoin(
          assessmentFeedback,
          eq(assessmentFeedback.assessmentId, assessments.id)
        )
        .where(
          and(
            eq(assessments.id, assessmentId),
            eq(assessments.ownerId, ownerId)
          )
        )
        .orderBy(asc(assessmentFeedback.createdAt), asc(assessmentFeedback.id))
      if (!rows.length) throw missing()
      return rows.flatMap(({ feedback }) => (feedback ? [item(feedback)] : []))
    },
    async record(
      ownerId: string,
      assessmentId: string,
      input: FeedbackRequest
    ): Promise<FeedbackItem> {
      return db.transaction(async (tx) => {
        // Deletion waits for this short write and then cascades to it.
        const [row] = await tx
          .select({ currentSnapshotId: assessments.currentSnapshotId })
          .from(assessments)
          .where(
            and(
              eq(assessments.id, assessmentId),
              eq(assessments.ownerId, ownerId)
            )
          )
          .for('key share')
        if (!row) throw missing()
        const [snapshot] = await tx
          .select({
            format: assessmentSnapshots.format,
            hasResult: assessmentSnapshots.hasResult,
            result: sql<unknown>`${assessmentSnapshots.payload} -> 'result'`
          })
          .from(assessmentSnapshots)
          .where(
            and(
              eq(assessmentSnapshots.id, row.currentSnapshotId),
              eq(assessmentSnapshots.assessmentId, assessmentId)
            )
          )
        if (!snapshot || snapshot.format !== 'assessment_v1') throw missing()
        if (!snapshot.hasResult)
          throw new AssessmentError(
            'conflict',
            409,
            'Results are not ready yet.'
          )
        const result = resultSchema.parse(snapshot.result)
        const placed = resultPlacement(result)
        // Like the results page, an experiment from an earlier revision is not shown.
        const pdoom =
          result.experiment?.evidenceRevision === result.evidenceRevision
            ? presentResult(result).experiment?.pdoom
            : null
        if (input.evidenceRevision !== result.evidenceRevision)
          throw new AssessmentError(
            'conflict',
            409,
            'This result has changed. Refresh to see the current result.'
          )
        const values = {
          assessmentId,
          kind: input.kind,
          evidenceRevision: result.evidenceRevision,
          snapshotId: row.currentSnapshotId,
          algorithmVersion: result.versions.assessment,
          // JSON storage omits an absent comment.
          payload:
            input.kind === 'self_placement'
              ? { guess: input.guess, placed }
              : {
                  rating: input.rating,
                  aspects: input.aspects,
                  comment: input.comment,
                  shown: {
                    ...placed,
                    pdoom:
                      pdoom?.estimate ??
                      (pdoom?.bounds
                        ? (pdoom.bounds[0] + pdoom.bounds[1]) / 2
                        : null),
                    pdoomLabel: pdoom?.token ?? null
                  }
                }
        }
        const target = [
          assessmentFeedback.assessmentId,
          assessmentFeedback.kind,
          assessmentFeedback.evidenceRevision
        ]
        const [saved] =
          input.kind === 'self_placement'
            ? // The first guess wins: a later one may have seen the result.
              await tx
                .insert(assessmentFeedback)
                .values(values)
                .onConflictDoNothing({ target })
                .returning()
            : await tx
                .insert(assessmentFeedback)
                .values(values)
                .onConflictDoUpdate({
                  target,
                  set: {
                    payload: values.payload,
                    snapshotId: values.snapshotId,
                    algorithmVersion: values.algorithmVersion,
                    updatedAt: new Date()
                  }
                })
                .returning()
        if (saved) return item(saved)
        const [kept] = await tx
          .select()
          .from(assessmentFeedback)
          .where(
            and(
              eq(assessmentFeedback.assessmentId, assessmentId),
              eq(assessmentFeedback.kind, input.kind),
              eq(assessmentFeedback.evidenceRevision, result.evidenceRevision)
            )
          )
        return item(kept!)
      })
    }
  }
}
