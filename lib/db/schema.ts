import { sql } from 'drizzle-orm'
import {
  pgTable,
  text,
  uuid,
  integer,
  bigint,
  date,
  boolean,
  timestamp,
  primaryKey,
  jsonb,
  unique,
  uniqueIndex,
  index,
  check,
  foreignKey,
  type AnyPgColumn
} from 'drizzle-orm/pg-core'
import type {
  AgreementPayload,
  SelfPlacementPayload
} from '../assessments/feedback'
import type { Publisher } from '../assessments/publisher'
import type { CardData } from '../sharing/card'
import type { ShareComparison } from '../sharing/share-links'
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
    index('assessment_owner_library').on(t.ownerId, t.createdAt),
    index('assessment_source_assessment').on(t.sourceAssessmentId),
    index('assessment_source_snapshot').on(t.sourceSnapshotId),
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
    index('operation_retry_of').on(t.retryOf),
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

// Participant feedback about one displayed result. Ownership follows the
// assessment, whose owner can be claimed or merged, so there is no owner column.
export const assessmentFeedback = pgTable(
  'assessment_feedback',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    assessmentId: uuid('assessment_id')
      .notNull()
      .references(() => assessments.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: ['self_placement', 'agreement'] }).notNull(),
    evidenceRevision: integer('evidence_revision').notNull(),
    // The current snapshot when feedback was given: exactly what was shown.
    snapshotId: uuid('snapshot_id').notNull(),
    algorithmVersion: text('algorithm_version').notNull(),
    payload: jsonb('payload')
      .$type<SelfPlacementPayload | AgreementPayload>()
      .notNull(),
    createdAt: time('created_at'),
    updatedAt: time('updated_at')
  },
  (t) => [
    unique('feedback_kind_revision').on(
      t.assessmentId,
      t.kind,
      t.evidenceRevision
    ),
    index('feedback_created_at').on(t.createdAt),
    foreignKey({
      name: 'feedback_snapshot',
      columns: [t.assessmentId, t.snapshotId],
      foreignColumns: [assessmentSnapshots.assessmentId, assessmentSnapshots.id]
    }).onDelete('cascade'),
    check('feedback_kind', sql`${t.kind} in ('self_placement', 'agreement')`),
    check('feedback_revision_nonnegative', sql`${t.evidenceRevision} >= 0`)
  ]
)

// A card-only share link (/s/<id>): the card data of one displayed result and
// the worldview values a recipient compares against, never answers. Ownership
// follows the assessment; deleting it deletes its links, and revoking sets
// `revoked_at`. At most one active link exists per result evidence revision.
export const shareSnapshots = pgTable(
  'share_snapshots',
  {
    id: text('id').primaryKey(),
    assessmentId: uuid('assessment_id')
      .notNull()
      .references(() => assessments.id, { onDelete: 'cascade' }),
    // The assessment snapshot whose result the card shows.
    snapshotId: uuid('snapshot_id').notNull(),
    evidenceRevision: integer('evidence_revision').notNull(),
    card: jsonb('card').$type<CardData>().notNull(),
    comparison: jsonb('comparison').$type<ShareComparison>().notNull(),
    sharerName: text('sharer_name'),
    createdAt: time('created_at'),
    revokedAt: timestamp('revoked_at', { withTimezone: true })
  },
  (t) => [
    index('share_snapshot_assessment').on(t.assessmentId),
    uniqueIndex('one_active_share_snapshot')
      .on(t.assessmentId, t.evidenceRevision)
      .where(sql`${t.revokedAt} is null`),
    foreignKey({
      name: 'share_snapshot_snapshot',
      columns: [t.assessmentId, t.snapshotId],
      foreignColumns: [assessmentSnapshots.assessmentId, assessmentSnapshots.id]
    }).onDelete('cascade'),
    check('share_snapshot_id', sql`${t.id} ~ '^[A-Za-z0-9_-]{16}$'`),
    check(
      'share_snapshot_name',
      sql`${t.sharerName} is null or char_length(${t.sharerName}) between 1 and 40`
    ),
    check('share_snapshot_revision', sql`${t.evidenceRevision} >= 0`)
  ]
)

// A spent draft ID survives deletion so a signed browser ticket cannot recreate it.
// Contains no assessment content or owner data. Nothing is inserted on draft opening.
export const usedAssessmentDrafts = pgTable('used_assessment_drafts', {
  id: uuid('id').primaryKey()
})

// Estimated participant Jev spend per UTC day and month, for the app's own
// budget (lib/server/jev-budget.ts). Aggregate counters only, never participant
// data. Rows are incremented atomically, so concurrent instances never lose spend.
export const jevSpend = pgTable(
  'jev_spend',
  {
    period: text('period', { enum: ['day', 'month'] }).notNull(),
    periodStart: date('period_start', { mode: 'string' }).notNull(),
    inputTokens: bigint('input_tokens', { mode: 'number' })
      .notNull()
      .default(0),
    outputTokens: bigint('output_tokens', { mode: 'number' })
      .notNull()
      .default(0),
    costNanoUsd: bigint('cost_nano_usd', { mode: 'number' })
      .notNull()
      .default(0),
    requests: integer('requests').notNull().default(0),
    updatedAt: time('updated_at')
  },
  (t) => [
    primaryKey({ name: 'jev_spend_pk', columns: [t.period, t.periodStart] }),
    check('jev_spend_period', sql`${t.period} in ('day', 'month')`),
    check(
      'jev_spend_nonnegative',
      sql`${t.inputTokens} >= 0 and ${t.outputTokens} >= 0 and ${t.costNanoUsd} >= 0 and ${t.requests} >= 0`
    )
  ]
)

// When TypeSafe last answered that the account has no credits (HTTP 402).
export const jevProviderStatus = pgTable('jev_provider_status', {
  provider: text('provider').primaryKey(),
  outOfCreditsAt: timestamp('out_of_credits_at', {
    withTimezone: true
  }).notNull(),
  updatedAt: time('updated_at')
})
