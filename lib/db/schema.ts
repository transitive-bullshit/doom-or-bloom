import { sql } from 'drizzle-orm'
import {
  pgTable,
  text,
  uuid,
  integer,
  boolean,
  timestamp,
  jsonb,
  unique,
  uniqueIndex,
  index,
  check,
  type AnyPgColumn
} from 'drizzle-orm/pg-core'
import type { Publisher } from '../assessments/publisher'
import { user } from './auth-schema'

export * from './auth-schema'
const time = (name: string) =>
  timestamp(name, { withTimezone: true }).notNull().defaultNow()

export const personas = pgTable('personas', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  portrait: text('portrait'),
  metadata: jsonb('metadata').notNull(),
  sourceBrief: jsonb('source_brief').notNull(),
  featured: boolean('featured').notNull().default(false),
  selectedAssessmentId: uuid('selected_assessment_id'),
  selectedGeneration: timestamp('selected_generation', { withTimezone: true }),
  createdAt: time('created_at'),
  updatedAt: time('updated_at')
})

export const assessments = pgTable(
  'assessments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: text('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    title: text('title'),
    origin: text('origin', { enum: ['participant', 'simulation'] })
      .notNull()
      .default('participant'),
    personaId: uuid('persona_id').references(() => personas.id, {
      onDelete: 'restrict'
    }),
    visibility: text('visibility', { enum: ['private', 'public'] })
      .notNull()
      .default('private'),
    revision: integer('revision').notNull().default(0),
    currentSnapshotId: uuid('current_snapshot_id').notNull(),
    publishedSnapshotId: uuid('final_snapshot_id'),
    publishedProfile: jsonb('published_profile').$type<Publisher>(),
    sourceAssessmentId: uuid('source_assessment_id').references(
      (): AnyPgColumn => assessments.id,
      { onDelete: 'set null' }
    ),
    sourceSnapshotId: uuid('source_snapshot_id'),
    isFork: boolean('is_fork').notNull().default(false),
    inheritedPromptCount: integer('inherited_prompt_count')
      .notNull()
      .default(0),
    promptCeiling: integer('prompt_ceiling').notNull().default(12),
    versions: jsonb('versions').notNull(),
    createRequestKey: text('create_request_key').notNull(),
    createFingerprint: text('create_fingerprint').notNull(),
    seedKey: text('seed_key').unique(),
    createdAt: time('created_at'),
    updatedAt: time('updated_at')
  },
  (t) => [
    unique('assessment_creation_key').on(t.ownerId, t.createRequestKey),
    unique('assessment_persona_membership').on(t.id, t.personaId),
    index('assessment_owner_library').on(t.ownerId, t.updatedAt),
    check(
      'assessment_visibility',
      sql`${t.visibility} in ('private', 'public') and ((${t.visibility} = 'public') = (${t.publishedSnapshotId} is not null))`
    ),
    check(
      'assessment_origin',
      sql`(${t.origin} = 'participant' and ${t.personaId} is null) or (${t.origin} = 'simulation' and ${t.personaId} is not null)`
    ),
    check(
      'assessment_budget',
      sql`${t.inheritedPromptCount} >= 0 and ${t.promptCeiling} between 1 and 30 and ${t.inheritedPromptCount} <= ${t.promptCeiling}`
    )
  ]
)

export const assessmentSnapshots = pgTable(
  'assessment_snapshots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    assessmentId: uuid('assessment_id')
      .notNull()
      .references(() => assessments.id, { onDelete: 'cascade' }),
    revision: integer('revision').notNull(),
    format: text('format', {
      enum: [
        'assessment_v1',
        'historical_journey_v1',
        'simulation_v1',
        'generation_input_v1'
      ]
    }).notNull(),
    payload: jsonb('payload').notNull(),
    digest: text('digest').notNull(),
    evidenceRevision: integer('evidence_revision'),
    operationId: uuid('operation_id'),
    hasResult: boolean('has_result').notNull(),
    createdAt: time('created_at')
  },
  (t) => [
    unique('snapshot_revision').on(t.assessmentId, t.revision),
    unique('snapshot_membership').on(t.assessmentId, t.id),
    check('snapshot_revision_nonnegative', sql`${t.revision} >= 0`)
  ]
)

export const assessmentOperations = pgTable(
  'assessment_operations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    assessmentId: uuid('assessment_id')
      .notNull()
      .references(() => assessments.id, { onDelete: 'cascade' }),
    requestKey: text('request_key').notNull(),
    fingerprint: text('fingerprint').notNull(),
    action: jsonb('action').notNull(),
    baseSnapshotId: uuid('base_snapshot_id').notNull(),
    baseRevision: integer('base_revision').notNull(),
    versions: jsonb('versions').notNull(),
    status: text('status', {
      enum: ['running', 'succeeded', 'failed', 'interrupted']
    }).notNull(),
    resultingSnapshotId: uuid('resulting_snapshot_id'),
    retryOf: uuid('retry_of').references(
      (): AnyPgColumn => assessmentOperations.id,
      { onDelete: 'set null' }
    ),
    deadline: timestamp('deadline', { withTimezone: true }).notNull(),
    physicalRequestCount: integer('physical_request_count')
      .notNull()
      .default(0),
    diagnostics: jsonb('diagnostics').notNull().default([]),
    failureCategory: text('failure_category'),
    createdAt: time('created_at'),
    updatedAt: time('updated_at')
  },
  (t) => [
    unique('operation_request_key').on(t.assessmentId, t.requestKey),
    unique('operation_membership').on(t.assessmentId, t.id),
    uniqueIndex('one_running_operation')
      .on(t.assessmentId)
      .where(sql`${t.status} = 'running'`),
    check(
      'operation_status',
      sql`${t.status} in ('running', 'succeeded', 'failed', 'interrupted') and ((${t.status} = 'succeeded') = (${t.resultingSnapshotId} is not null))`
    )
  ]
)
