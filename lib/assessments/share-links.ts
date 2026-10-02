import 'server-only'
import { randomBytes } from 'node:crypto'
import { and, asc, eq, isNull, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import type { Pool } from 'pg'
import { resultSchema } from '../assessment/schema'
import { presentResult } from '../assessment/present-result'
import {
  worldviewValues,
  type PersonaComparison
} from '../assessment/persona-matches'
import { resultPoint } from '../assessment/self-placement'
import { assessmentSnapshots, assessments, shareSnapshots } from '../db/schema'
import { resultCardData } from '../sharing/card-data'
import {
  publicShareLinkSchema,
  shareComparisonSchema,
  type OwnerShareLink,
  type PublicShareLink
} from '../sharing/share-links'
import { AssessmentError } from './contracts'

type Row = typeof shareSnapshots.$inferSelect
const missing = () =>
  new AssessmentError('not_found', 404, 'Assessment not found.')
const owned = (row: Row): OwnerShareLink => ({
  id: row.id,
  name: row.sharerName,
  evidenceRevision: row.evidenceRevision,
  createdAt: row.createdAt.toISOString()
})
const newId = () => randomBytes(12).toString('base64url')

/**
 * Card-only share links. Owner reads and writes are authorized through the
 * assessment, like feedback; public reads see only active links and only the
 * card and comparison values, through an explicit serializer.
 */
export function shareLinkRepository(pool: Pool) {
  const db = drizzle(pool)
  type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]
  async function currentResult(
    tx: typeof db | Transaction,
    ownerId: string,
    assessmentId: string,
    lock: boolean
  ) {
    const query = tx
      .select({
        snapshotId: assessments.currentSnapshotId,
        origin: assessments.origin
      })
      .from(assessments)
      .where(
        and(eq(assessments.id, assessmentId), eq(assessments.ownerId, ownerId))
      )
    // Deletion waits for a short write here and then cascades to it.
    const [row] = await (lock ? query.for('key share') : query)
    if (!row || row.origin !== 'participant') throw missing()
    const [snapshot] = await tx
      .select({
        format: assessmentSnapshots.format,
        hasResult: assessmentSnapshots.hasResult,
        evidenceRevision: assessmentSnapshots.evidenceRevision,
        result: sql<unknown>`${assessmentSnapshots.payload} -> 'result'`
      })
      .from(assessmentSnapshots)
      .where(
        and(
          eq(assessmentSnapshots.id, row.snapshotId),
          eq(assessmentSnapshots.assessmentId, assessmentId)
        )
      )
    if (!snapshot || snapshot.format !== 'assessment_v1') throw missing()
    const result = snapshot.hasResult
      ? resultSchema.parse(snapshot.result)
      : null
    // Like publication, only a result for the current evidence can be shared.
    return {
      snapshotId: row.snapshotId,
      result:
        result && result.evidenceRevision === snapshot.evidenceRevision
          ? result
          : null
    }
  }
  async function active(tx: typeof db | Transaction, assessmentId: string) {
    return tx
      .select()
      .from(shareSnapshots)
      .where(
        and(
          eq(shareSnapshots.assessmentId, assessmentId),
          isNull(shareSnapshots.revokedAt)
        )
      )
      .orderBy(asc(shareSnapshots.createdAt))
  }
  return {
    /** The active link for the current result, and how many are active. */
    async current(ownerId: string, assessmentId: string) {
      return db.transaction(
        async (tx) => {
          const { result } = await currentResult(
            tx,
            ownerId,
            assessmentId,
            false
          )
          const links = await active(tx, assessmentId)
          const link = result
            ? links.find(
                (row) => row.evidenceRevision === result.evidenceRevision
              )
            : undefined
          return { link: link ? owned(link) : null, active: links.length }
        },
        { isolationLevel: 'repeatable read', accessMode: 'read only' }
      )
    },
    /**
     * Reuses the active link for the current result or creates one. The card
     * matches the downloadable card: same builder, same thought leaders.
     */
    async create(
      ownerId: string,
      assessmentId: string,
      name: string | null,
      personas: PersonaComparison[]
    ): Promise<{ link: OwnerShareLink; created: boolean }> {
      return db.transaction(async (tx) => {
        const { snapshotId, result } = await currentResult(
          tx,
          ownerId,
          assessmentId,
          true
        )
        // The page showed a result the server no longer has as current.
        if (!result)
          throw new AssessmentError(
            'conflict',
            409,
            'This result has changed. Refresh to share the current result.'
          )
        const existing = async () =>
          (await active(tx, assessmentId)).find(
            (row) => row.evidenceRevision === result.evidenceRevision
          )
        const reused = await existing()
        if (reused) return { link: owned(reused), created: false }
        const presented = presentResult(result)
        const pdoom =
          presented.experiment?.evidenceRevision === presented.evidenceRevision
            ? presented.experiment.pdoom
            : null
        const [inserted] = await tx
          .insert(shareSnapshots)
          .values({
            id: newId(),
            assessmentId,
            snapshotId,
            evidenceRevision: result.evidenceRevision,
            card: resultCardData(result, personas),
            comparison: shareComparisonSchema.parse({
              values: worldviewValues(presented),
              map: resultPoint(presented),
              pdoomSource:
                pdoom?.source === 'stated' || pdoom?.source === 'inferred'
                  ? pdoom.source
                  : null
            }),
            sharerName: name
          })
          // A concurrent request may have created it first; reuse that one.
          .onConflictDoNothing()
          .returning()
        if (inserted) return { link: owned(inserted), created: true }
        const raced = await existing()
        if (!raced) throw new Error('Share link was neither created nor found')
        return { link: owned(raced), created: false }
      })
    },
    /** Revokes every active link of the assessment; returns their IDs. */
    async revoke(ownerId: string, assessmentId: string) {
      return db.transaction(async (tx) => {
        const [row] = await tx
          .select({ id: assessments.id })
          .from(assessments)
          .where(
            and(
              eq(assessments.id, assessmentId),
              eq(assessments.ownerId, ownerId)
            )
          )
          .for('key share')
        if (!row) throw missing()
        const revoked = await tx
          .update(shareSnapshots)
          .set({ revokedAt: new Date() })
          .where(
            and(
              eq(shareSnapshots.assessmentId, assessmentId),
              isNull(shareSnapshots.revokedAt)
            )
          )
          .returning({ id: shareSnapshots.id })
        return revoked.map(({ id }) => id)
      })
    },
    /** An active link's public resource, or null. */
    async find(id: string): Promise<PublicShareLink | null> {
      const [row] = await db
        .select()
        .from(shareSnapshots)
        .where(and(eq(shareSnapshots.id, id), isNull(shareSnapshots.revokedAt)))
      return row
        ? publicShareLinkSchema.parse({
            id: row.id,
            name: row.sharerName,
            createdAt: row.createdAt.toISOString(),
            card: row.card,
            comparison: row.comparison
          })
        : null
    }
  }
}
