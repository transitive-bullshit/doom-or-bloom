import 'server-only'
import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import type { Pool } from 'pg'
import {
  assessments,
  assessmentSnapshots,
  assessmentOperations,
  personas
} from '../db/schema'
import { fingerprint } from '../assessments/repository'
import { versions } from '../assessment/schema'
import type { Journey } from '../journeys/schema'
import {
  personaMetadataSchema,
  publicJourney,
  simulationPayloadSchema
} from './payload'
import { simulationOwnerId } from './repository'

type Provenance = {
  runId: string
  createdAt: string
  inputHash: string
  engineHash: string
  contentHash: string
}

/** Offline generation remains synchronous; these records provide diagnostics, not jobs. */
export function personaGeneration(pool: Pool) {
  const db = drizzle(pool)
  return {
    async begin(personaId: string, provenance: Provenance, input: unknown) {
      const key = `generation:${provenance.runId}:${personaId}`
      const payload = { kind: 'generation_input_v1', provenance, input }
      const digest = fingerprint(payload)
      return db.transaction(async (tx) => {
        const [persona] = await tx
          .select()
          .from(personas)
          .where(eq(personas.id, personaId))
          .for('update')
        if (!persona) throw new Error('Unknown curated persona')
        const [existing] = await tx
          .select()
          .from(assessments)
          .where(eq(assessments.seedKey, key))
        if (existing) {
          if (existing.createFingerprint !== digest)
            throw new Error('Generation key reused for different input')
          // Never repeat paid generation under an existing request key.
          return { id: existing.id, execute: false }
        }
        const id = randomUUID(),
          snapshotId = randomUUID()
        await tx.insert(assessments).values({
          id,
          ownerId: simulationOwnerId,
          personaId,
          origin: 'simulation',
          title: `${persona.name}’s simulated AI worldview`,
          currentSnapshotId: snapshotId,
          versions,
          createRequestKey: key,
          createFingerprint: digest,
          seedKey: key,
          createdAt: new Date(provenance.createdAt)
        })
        await tx.insert(assessmentSnapshots).values({
          id: snapshotId,
          assessmentId: id,
          revision: 0,
          format: 'generation_input_v1',
          payload,
          digest,
          hasResult: false
        })
        await tx.insert(assessmentOperations).values({
          assessmentId: id,
          requestKey: key,
          fingerprint: digest,
          action: payload,
          baseSnapshotId: snapshotId,
          baseRevision: 0,
          versions,
          status: 'running',
          deadline: new Date(Date.now() + 30 * 60_000)
        })
        return { id, execute: true }
      })
    },
    async finish(id: string, provenance: Provenance, journey: Journey) {
      const valid =
        !journey.error && journey.result && journey.finalAssessment?.result
      const payload = valid
        ? simulationPayloadSchema.parse({
            kind: 'simulation_v1',
            journey: publicJourney(journey),
            assessment: {
              ...journey.finalAssessment,
              draft: '',
              eventMarkers: []
            },
            provenance: {
              ...provenance,
              originalAssessmentId: journey.finalAssessment!.id,
              originalRevision: journey.finalAssessment!.revision
            }
          })
        : null
      return db.transaction(async (tx) => {
        const [assessment] = await tx
          .select()
          .from(assessments)
          .where(eq(assessments.id, id))
          .for('update')
        if (!assessment || assessment.origin !== 'simulation')
          throw new Error('Unknown simulation run')
        const [operation] = await tx
          .select()
          .from(assessmentOperations)
          .where(eq(assessmentOperations.assessmentId, id))
        if (!operation || operation.status !== 'running') return
        const accepted = operation.action as { provenance: Provenance }
        if (fingerprint(accepted.provenance) !== fingerprint(provenance))
          throw new Error('Generation provenance does not match accepted input')
        const [profile] = await tx
          .select()
          .from(personas)
          .where(eq(personas.id, assessment.personaId!))
        if (
          !profile ||
          personaMetadataSchema.parse(profile.metadata).id !== journey.personaId
        )
          throw new Error('Generation belongs to another persona')
        if (
          payload &&
          fingerprint(payload.assessment.result) !==
            fingerprint(payload.journey.result)
        )
          throw new Error(
            'Generation result does not match its engine snapshot'
          )
        if (operation.deadline <= new Date()) {
          await tx
            .update(assessmentOperations)
            .set({
              status: 'interrupted',
              failureCategory: 'generation_deadline',
              updatedAt: new Date()
            })
            .where(eq(assessmentOperations.id, operation.id))
          return
        }
        if (!payload) {
          await tx
            .update(assessmentOperations)
            .set({
              status: 'failed',
              failureCategory: 'generation_failed',
              diagnostics: {
                error: journey.error,
                failureStage: journey.failureStage,
                failedOperation: journey.failedOperation,
                pendingAnswer: journey.pendingAnswer
              },
              updatedAt: new Date()
            })
            .where(eq(assessmentOperations.id, operation.id))
          return
        }
        const snapshotId = randomUUID()
        await tx.insert(assessmentSnapshots).values({
          id: snapshotId,
          assessmentId: id,
          revision: 1,
          format: 'simulation_v1',
          payload,
          digest: fingerprint(payload),
          evidenceRevision: payload.journey.result!.evidenceRevision,
          hasResult: true,
          operationId: operation.id
        })
        await tx
          .update(assessments)
          .set({
            revision: 1,
            currentSnapshotId: snapshotId,
            finalSnapshotId: snapshotId,
            lifecycle: 'completed',
            visibility: 'public',
            updatedAt: new Date()
          })
          .where(eq(assessments.id, id))
        await tx
          .update(assessmentOperations)
          .set({
            status: 'succeeded',
            resultingSnapshotId: snapshotId,
            updatedAt: new Date()
          })
          .where(eq(assessmentOperations.id, operation.id))
        const [persona] = await tx
          .select()
          .from(personas)
          .where(eq(personas.id, assessment.personaId!))
          .for('update')
        // The saved start time is authoritative, even if a caller passes a later date.
        if (
          persona &&
          (!persona.selectedGeneration ||
            assessment.createdAt > persona.selectedGeneration)
        )
          await tx
            .update(personas)
            .set({
              selectedAssessmentId: id,
              selectedGeneration: assessment.createdAt,
              updatedAt: new Date()
            })
            .where(eq(personas.id, persona.id))
      })
    }
  }
}
