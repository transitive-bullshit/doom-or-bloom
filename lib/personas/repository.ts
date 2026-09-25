import 'server-only'
import { randomUUID } from 'node:crypto'
import { and, asc, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import type { Pool } from 'pg'
import { assessments, assessmentSnapshots, personas, user } from '../db/schema'
import { fingerprint } from '../assessments/repository'
import {
  personaMetadataSchema,
  simulationPayload,
  type PersonaMetadata,
  type SimulationPayload
} from './payload'

export const simulationOwnerId = 'doom-or-bloom-simulations'
export function personaRepository(pool: Pool) {
  const db = drizzle(pool)
  return {
    async upsertProfile(metadata: PersonaMetadata, sourceBrief: unknown) {
      return db.transaction(async (tx) => {
        await tx
          .insert(user)
          .values({
            id: simulationOwnerId,
            name: 'Curated simulations',
            email: 'simulations@service.invalid',
            isAnonymous: false
          })
          .onConflictDoNothing()
        const [row] = await tx
          .insert(personas)
          .values({
            slug: metadata.slug,
            name: metadata.name,
            portrait: metadata.avatar,
            metadata,
            sourceBrief,
            featured: metadata.featured
          })
          .onConflictDoUpdate({
            target: personas.slug,
            set: {
              name: metadata.name,
              portrait: metadata.avatar,
              metadata,
              sourceBrief,
              featured: metadata.featured,
              updatedAt: new Date()
            }
          })
          .returning()
        return row!.id
      })
    },
    async publish(
      personaId: string,
      seedKey: string,
      input: SimulationPayload
    ) {
      const payload = simulationPayload.parse(input)
      if (payload.journey.error || !payload.journey.result)
        throw new Error(
          'Only successful simulations with results can be published'
        )
      const digest = fingerprint(payload)
      const generation = new Date(payload.provenance.createdAt)
      if (!Number.isFinite(generation.getTime()))
        throw new Error('Invalid generation date')
      return db.transaction(async (tx) => {
        const [persona] = await tx
          .select()
          .from(personas)
          .where(eq(personas.id, personaId))
          .for('update')
        if (!persona) throw new Error('Unknown curated persona')
        const metadata = personaMetadataSchema.parse(persona.metadata)
        if (payload.journey.personaId !== metadata.id)
          throw new Error('Simulation belongs to another persona')
        const [existing] = await tx
          .select()
          .from(assessments)
          .where(eq(assessments.seedKey, seedKey))
        let id: string
        if (existing) {
          if (
            existing.personaId !== personaId ||
            existing.createFingerprint !== digest
          )
            throw new Error(
              'Immutable simulation provenance key reused for different content'
            )
          id = existing.id
        } else {
          id = randomUUID()
          const snapshotId = randomUUID()
          await tx.insert(assessments).values({
            id,
            ownerId: simulationOwnerId,
            personaId,
            origin: 'simulation',
            title: `${metadata.name}’s simulated AI worldview`,
            visibility: 'public',
            currentSnapshotId: snapshotId,
            publishedSnapshotId: snapshotId,
            versions: payload.journey.result!.versions,
            createRequestKey: seedKey,
            createFingerprint: digest,
            seedKey,
            createdAt: generation
          })
          await tx.insert(assessmentSnapshots).values({
            id: snapshotId,
            assessmentId: id,
            revision: 0,
            format: payload.kind,
            payload,
            digest,
            evidenceRevision: payload.journey.result!.evidenceRevision,
            hasResult: true,
            createdAt: generation
          })
        }
        // Ordering is the start of generation, never its completion time. Replayed
        // imports or a slow older run cannot roll the selected result backward.
        if (
          !persona.selectedAssessmentId ||
          !persona.selectedGeneration ||
          generation > persona.selectedGeneration
        ) {
          await tx
            .update(personas)
            .set({
              selectedAssessmentId: id,
              selectedGeneration: generation,
              updatedAt: new Date()
            })
            .where(eq(personas.id, personaId))
        }
        return id
      })
    },
    async selected() {
      const rows = await db
        .select({
          persona: personas,
          payload: assessmentSnapshots.payload,
          assessmentId: assessments.id
        })
        .from(personas)
        .innerJoin(
          assessments,
          and(
            eq(assessments.id, personas.selectedAssessmentId),
            eq(assessments.personaId, personas.id)
          )
        )
        .innerJoin(
          assessmentSnapshots,
          eq(assessmentSnapshots.id, assessments.publishedSnapshotId)
        )
        .where(
          and(
            eq(assessments.visibility, 'public'),
            eq(assessments.origin, 'simulation')
          )
        )
        .orderBy(asc(personas.slug))
      return rows
        .map((row) => ({
          ...row,
          metadata: personaMetadataSchema.parse(row.persona.metadata),
          payload: simulationPayload.parse(row.payload)
        }))
        .sort((a, b) => a.metadata.order - b.metadata.order)
    }
  }
}
