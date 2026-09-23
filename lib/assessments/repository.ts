import 'server-only'
import { createHash, randomUUID } from 'node:crypto'
import { and, desc, eq, lte } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import type { Pool } from 'pg'
import {
  assessmentSchema,
  operationSchema,
  type Assessment,
  type AssessmentResponse,
  type DebugTrace
} from '../assessment/schema'
import { createAssessment } from '../assessment/state'
import { restoreLocalInteraction } from '../assessment/transport'
import {
  assessments,
  assessmentSnapshots,
  assessmentOperations,
  user
} from '../db/schema'
import { AssessmentError, type Submission } from './contracts'

export function fingerprint(value: unknown): string {
  const canonical = (v: unknown): unknown =>
    Array.isArray(v)
      ? v.map(canonical)
      : v !== null && typeof v === 'object'
        ? Object.fromEntries(
            Object.entries(v)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([k, val]) => [k, canonical(val)])
          )
        : v
  return createHash('sha256')
    .update(JSON.stringify(canonical(value)))
    .digest('hex')
}
type RecordRow = typeof assessments.$inferSelect
type OperationRow = typeof assessmentOperations.$inferSelect
const missing = () =>
  new AssessmentError('not_found', 404, 'Assessment not found.')
const conflict = (message: string) =>
  new AssessmentError('conflict', 409, message)
const expired = (op: OperationRow) =>
  op.status === 'running' && op.deadline.getTime() <= Date.now()
function operationView(op: OperationRow) {
  return {
    id: op.id,
    requestKey: op.requestKey,
    action: operationSchema.parse(op.action),
    baseRevision: op.baseRevision,
    status: expired(op) ? ('interrupted' as const) : op.status,
    deadline: op.deadline.toISOString(),
    failureCategory: op.failureCategory,
    retryOf: op.retryOf
  }
}
export type OperationView = ReturnType<typeof operationView>
export type OwnedAssessment = {
  assessment: Assessment
  lifecycle: RecordRow['lifecycle']
  visibility: RecordRow['visibility']
  isFork: boolean
  inheritedPromptCount: number
  promptCeiling: number
  operation: OperationView | null
}
export type OperationOutcome = {
  debug?: DebugTrace
  provider?: 'live' | 'fixture'
  operation: OperationView
  assessment?: Assessment
}
export type ExecutionStats = {
  physicalRequestCount: number
  failures: Array<{ stage: string; status: number | null; attempt: number }>
}
export type Evaluator = (
  state: Assessment,
  input: Submission,
  signal: AbortSignal,
  stats: ExecutionStats
) => Promise<AssessmentResponse>

export function assessmentRepository(pool: Pool) {
  const db = drizzle(pool)
  type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]
  async function owned(
    tx: typeof db | Transaction,
    ownerId: string,
    id: string,
    lock = false
  ) {
    const query = tx
      .select()
      .from(assessments)
      .where(and(eq(assessments.id, id), eq(assessments.ownerId, ownerId)))
    const [row] = await (lock ? query.for('update') : query)
    if (!row) throw missing()
    return row
  }
  async function snapshot(
    tx: typeof db | Transaction,
    assessmentId: string,
    id: string
  ) {
    const [row] = await tx
      .select()
      .from(assessmentSnapshots)
      .where(
        and(
          eq(assessmentSnapshots.id, id),
          eq(assessmentSnapshots.assessmentId, assessmentId)
        )
      )
    if (!row || row.format !== 'assessment_v1') throw missing()
    return assessmentSchema.parse(row.payload)
  }
  async function interruptExpired(tx: Transaction, id: string) {
    await tx
      .update(assessmentOperations)
      .set({
        status: 'interrupted',
        failureCategory: 'deadline',
        updatedAt: new Date()
      })
      .where(
        and(
          eq(assessmentOperations.assessmentId, id),
          eq(assessmentOperations.status, 'running'),
          lte(assessmentOperations.deadline, new Date())
        )
      )
  }
  async function assertIdle(tx: Transaction, id: string) {
    await interruptExpired(tx, id)
    const [running] = await tx
      .select({ id: assessmentOperations.id })
      .from(assessmentOperations)
      .where(
        and(
          eq(assessmentOperations.assessmentId, id),
          eq(assessmentOperations.status, 'running')
        )
      )
    if (running)
      throw new AssessmentError(
        'busy',
        409,
        'An operation is still processing. Please wait.'
      )
  }
  async function insertSnapshot(
    tx: Transaction,
    state: Assessment,
    operationId: string | null = null
  ) {
    const id = randomUUID()
    const payload = assessmentSchema.parse({
      ...state,
      draft: '',
      eventMarkers: []
    })
    await tx.insert(assessmentSnapshots).values({
      id,
      assessmentId: state.id,
      revision: state.revision,
      format: 'assessment_v1',
      payload,
      digest: fingerprint(payload),
      evidenceRevision: state.evidenceRevision,
      operationId,
      hasResult: payload.result !== null
    })
    return id
  }
  async function outcome(
    tx: typeof db | Transaction,
    op: OperationRow
  ): Promise<OperationOutcome> {
    const result: OperationOutcome = { operation: operationView(op) }
    if (op.resultingSnapshotId)
      result.assessment = await snapshot(
        tx,
        op.assessmentId,
        op.resultingSnapshotId
      )
    return result
  }
  return {
    async create(
      ownerId: string,
      requestKey: string,
      model: string,
      onlyIfEmpty = false
    ) {
      const digest = fingerprint({ model, onlyIfEmpty })
      return db.transaction(async (tx) => {
        const [owner] = await tx
          .select({ id: user.id })
          .from(user)
          .where(eq(user.id, ownerId))
          .for('update')
        if (!owner)
          throw new AssessmentError(
            'unauthorized',
            401,
            'Start a new browser session.'
          )
        const [previous] = await tx
          .select()
          .from(assessments)
          .where(
            and(
              eq(assessments.ownerId, ownerId),
              eq(assessments.createRequestKey, requestKey)
            )
          )
        if (previous) {
          if (previous.createFingerprint !== digest)
            throw conflict(
              'This creation key was already used for different input.'
            )
          return { id: previous.id }
        }
        if (onlyIfEmpty) {
          const [existing] = await tx
            .select({ id: assessments.id })
            .from(assessments)
            .where(eq(assessments.ownerId, ownerId))
            .limit(1)
          if (existing) return { id: null }
        }
        const id = randomUUID(),
          snapshotId = randomUUID()
        const state = createAssessment(id, model)
        await tx.insert(assessments).values({
          id,
          ownerId,
          currentSnapshotId: snapshotId,
          versions: state.versions,
          createRequestKey: requestKey,
          createFingerprint: digest
        })
        await tx.insert(assessmentSnapshots).values({
          id: snapshotId,
          assessmentId: id,
          revision: 0,
          format: 'assessment_v1',
          payload: state,
          digest: fingerprint(state),
          evidenceRevision: 0,
          hasResult: false
        })
        return { id }
      })
    },
    async list(ownerId: string) {
      return db
        .select({
          id: assessments.id,
          title: assessments.title,
          lifecycle: assessments.lifecycle,
          visibility: assessments.visibility,
          updatedAt: assessments.updatedAt,
          isFork: assessments.isFork
        })
        .from(assessments)
        .where(eq(assessments.ownerId, ownerId))
        .orderBy(desc(assessments.updatedAt))
    },
    async load(ownerId: string, id: string): Promise<OwnedAssessment> {
      return db.transaction(
        async (tx) => {
          const row = await owned(tx, ownerId, id)
          const [op] = await tx
            .select()
            .from(assessmentOperations)
            .where(eq(assessmentOperations.assessmentId, id))
            .orderBy(
              desc(assessmentOperations.createdAt),
              desc(assessmentOperations.id)
            )
            .limit(1)
          return {
            assessment: await snapshot(tx, id, row.currentSnapshotId),
            lifecycle: row.lifecycle,
            visibility: row.visibility,
            isFork: row.isFork,
            inheritedPromptCount: row.inheritedPromptCount,
            promptCeiling: row.promptCeiling,
            operation: op ? operationView(op) : null
          }
        },
        { isolationLevel: 'repeatable read', accessMode: 'read only' }
      )
    },
    async getOperation(
      ownerId: string,
      assessmentId: string,
      requestKey: string
    ) {
      await owned(db, ownerId, assessmentId)
      const [op] = await db
        .select()
        .from(assessmentOperations)
        .where(
          and(
            eq(assessmentOperations.assessmentId, assessmentId),
            eq(assessmentOperations.requestKey, requestKey)
          )
        )
      if (!op) throw missing()
      return outcome(db, op)
    },
    async submit(
      ownerId: string,
      input: Submission,
      evaluate: Evaluator,
      signal?: AbortSignal
    ): Promise<OperationOutcome> {
      const digest = fingerprint({
        expectedRevision: input.expectedRevision,
        operation: input.operation,
        retryOf: input.retryOf ?? null
      })
      const accepted = await db.transaction(async (tx) => {
        const row = await owned(tx, ownerId, input.assessmentId, true)
        const [prior] = await tx
          .select()
          .from(assessmentOperations)
          .where(
            and(
              eq(assessmentOperations.assessmentId, row.id),
              eq(assessmentOperations.requestKey, input.requestKey)
            )
          )
        if (prior) {
          if (prior.fingerprint !== digest)
            throw conflict(
              'This request key was already used for different input.'
            )
          return { replay: await outcome(tx, prior) }
        }
        await assertIdle(tx, row.id)
        if (row.lifecycle !== 'open')
          throw conflict(
            'This assessment is complete. Continue in a new assessment.'
          )
        if (row.revision !== input.expectedRevision)
          throw conflict('This assessment changed. Refresh before submitting.')
        if (input.retryOf) {
          const [priorAttempt] = await tx
            .select()
            .from(assessmentOperations)
            .where(
              and(
                eq(assessmentOperations.id, input.retryOf),
                eq(assessmentOperations.assessmentId, row.id)
              )
            )
          if (
            !priorAttempt ||
            !['failed', 'interrupted'].includes(priorAttempt.status) ||
            priorAttempt.baseRevision !== row.revision ||
            fingerprint(priorAttempt.action) !== fingerprint(input.operation)
          )
            throw conflict(
              'This operation cannot be retried from the current assessment.'
            )
        }
        const state = await snapshot(tx, row.id, row.currentSnapshotId)
        const [op] = await tx
          .insert(assessmentOperations)
          .values({
            assessmentId: row.id,
            requestKey: input.requestKey,
            fingerprint: digest,
            action: input.operation,
            baseSnapshotId: row.currentSnapshotId,
            baseRevision: row.revision,
            versions: row.versions,
            status: 'running',
            deadline: new Date(Date.now() + 120_000),
            retryOf: input.retryOf
          })
          .returning()
        return { op: op!, state }
      })
      if ('replay' in accepted) return accepted.replay!
      const { op, state } = accepted
      const stats: ExecutionStats = { physicalRequestCount: 0, failures: [] }
      try {
        const deadlineSignal = AbortSignal.timeout(
          Math.max(1, op.deadline.getTime() - Date.now())
        )
        const operationSignal = signal
          ? AbortSignal.any([signal, deadlineSignal])
          : deadlineSignal
        operationSignal.throwIfAborted()
        const response = await evaluate(state, input, operationSignal, stats)
        operationSignal.throwIfAborted()
        const next = assessmentSchema.parse({
          ...restoreLocalInteraction(
            state,
            response.assessment,
            input.operation,
            input.requestKey
          ),
          draft: '',
          eventMarkers: []
        })
        if (next.id !== state.id || next.revision !== state.revision + 1)
          throw new Error('Invalid evaluator revision')
        return await db.transaction(async (tx) => {
          // Owner may be claimed during inference. Identity was authorized on acceptance;
          // commit requires the same operation, assessment, and unchanged revision.
          const [row] = await tx
            .select()
            .from(assessments)
            .where(eq(assessments.id, state.id))
            .for('update')
          if (!row) throw missing()
          const [current] = await tx
            .select()
            .from(assessmentOperations)
            .where(eq(assessmentOperations.id, op.id))
          if (
            !current ||
            current.status !== 'running' ||
            expired(current) ||
            row.revision !== op.baseRevision ||
            row.lifecycle !== 'open'
          )
            throw conflict(
              'This operation is no longer current. Refresh to see the saved state.'
            )
          const snapshotId = await insertSnapshot(tx, next, op.id)
          const changes: Partial<typeof assessments.$inferInsert> = {
            revision: next.revision,
            currentSnapshotId: snapshotId,
            updatedAt: new Date()
          }
          if (input.operation.type === 'complete') {
            changes.lifecycle = 'completed'
            changes.finalSnapshotId = snapshotId
          }
          await tx
            .update(assessments)
            .set(changes)
            .where(eq(assessments.id, row.id))
          const [done] = await tx
            .update(assessmentOperations)
            .set({
              status: 'succeeded',
              physicalRequestCount: stats.physicalRequestCount,
              diagnostics: stats.failures.slice(0, 32),
              resultingSnapshotId: snapshotId,
              updatedAt: new Date()
            })
            .where(eq(assessmentOperations.id, op.id))
            .returning()
          const result = await outcome(tx, done!)
          if (response.debug) {
            result.debug = response.debug
            result.provider = response.provider
          }
          return result
        })
      } catch (err) {
        // This read also resolves a COMMIT whose acknowledgment was lost. Never
        // downgrade success or reevaluate simply because the connection failed.
        const [saved] = await db
          .select()
          .from(assessmentOperations)
          .where(eq(assessmentOperations.id, op.id))
        if (!saved) throw missing()
        if (saved.status !== 'running') return outcome(db, saved)
        const [failed] = await db
          .update(assessmentOperations)
          .set({
            status: expired(saved) ? 'interrupted' : 'failed',
            physicalRequestCount: stats.physicalRequestCount,
            failureCategory:
              err instanceof AssessmentError ? err.code : 'evaluation_failed',
            diagnostics: [
              ...stats.failures.slice(0, 32),
              {
                category:
                  err instanceof AssessmentError
                    ? err.code
                    : 'evaluation_failed'
              }
            ],
            updatedAt: new Date()
          })
          .where(
            and(
              eq(assessmentOperations.id, op.id),
              eq(assessmentOperations.status, 'running')
            )
          )
          .returning()
        if (failed) return outcome(db, failed)
        const [resolved] = await db
          .select()
          .from(assessmentOperations)
          .where(eq(assessmentOperations.id, op.id))
        if (!resolved) throw missing()
        return outcome(db, resolved)
      }
    },
    async setVisibility(
      ownerId: string,
      id: string,
      expectedRevision: number,
      visibility: 'private' | 'public'
    ) {
      await db.transaction(async (tx) => {
        const row = await owned(tx, ownerId, id, true)
        await assertIdle(tx, id)
        if (row.revision !== expectedRevision)
          throw conflict('This assessment changed. Refresh before sharing.')
        const state = await snapshot(tx, id, row.currentSnapshotId)
        if (visibility === 'public' && !state.result)
          throw conflict('View your results before sharing.')
        const changes: Partial<typeof assessments.$inferInsert> = {
          visibility,
          updatedAt: new Date()
        }
        if (visibility === 'public') {
          changes.lifecycle = 'completed'
          changes.finalSnapshotId = row.currentSnapshotId
        }
        await tx.update(assessments).set(changes).where(eq(assessments.id, id))
      })
    },
    async remove(ownerId: string, id: string) {
      await db.transaction(async (tx) => {
        await owned(tx, ownerId, id, true)
        await tx.delete(assessments).where(eq(assessments.id, id))
      })
    }
  }
}
