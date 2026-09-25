import 'server-only'
import { sql, type SQL } from 'drizzle-orm'
import { z } from 'zod'
import { assessmentSchema } from '../assessment/schema'
import { simulationPayload } from '../personas/payload'
import { personaRepository } from '../personas/repository'
import { worldviewValues } from '../assessment/persona-matches'
import { adminDatabase } from './database'
import type { AdminFilters } from './filters'

// Lists project only small semantic fields. Full snapshots are fetched only
// for the selected assessment, never for the whole dashboard.
const summary = sql`with records as (
  select a.id, a.owner_id, a.title, a.origin, a.visibility, a.is_fork,
    a.created_at, a.updated_at, a.revision, a.inherited_prompt_count,
    u.name, u.is_anonymous, u.x_username,
    s.has_result,
    coalesce(s.payload->>'status', s.payload->'assessment'->>'status', case when s.has_result then 'results' else 'answering' end) as engine_status,
    coalesce(jsonb_array_length(s.payload->'answers'), jsonb_array_length(s.payload->'assessment'->'answers'), (s.payload->'journey'->>'accepted')::int, 0) as answers,
    coalesce(jsonb_array_length(s.payload->'prompts'), jsonb_array_length(s.payload->'assessment'->'prompts'), jsonb_array_length(s.payload->'journey'->'steps'), 0) as prompts,
    case when op.status = 'running' and op.deadline <= now() then 'interrupted' else op.status end as operation_status
  from assessments a
  join "user" u on u.id = a.owner_id
  join assessment_snapshots s on s.id = a.current_snapshot_id and s.assessment_id = a.id
  left join lateral (
    select status, deadline from assessment_operations where assessment_id = a.id order by created_at desc, id desc limit 1
  ) op on true
)`

export type AdminAssessmentRow = {
  id: string
  owner_id: string
  title: string | null
  origin: 'participant' | 'simulation'
  visibility: string
  is_fork: boolean
  created_at: string
  updated_at: string
  revision: number
  inherited_prompt_count: number
  name: string
  is_anonymous: boolean | null
  x_username: string | null
  has_result: boolean
  engine_status: string
  answers: number
  prompts: number
  operation_status: string | null
}
export function assessmentStatus(
  row: Pick<
    AdminAssessmentRow,
    'operation_status' | 'engine_status' | 'has_result'
  >
) {
  if (row.operation_status === 'running') return 'Processing'
  if (
    row.operation_status === 'failed' ||
    row.operation_status === 'interrupted'
  )
    return 'Needs attention'
  if (row.has_result) return 'Completed'
  if (row.engine_status === 'recovery' || row.engine_status === 'paused')
    return 'Answer recovery'
  return 'In progress'
}
function where(f: AdminFilters, owner?: string) {
  const conditions: SQL[] = [sql`true`]
  if (f.origin !== 'all') conditions.push(sql`origin = ${f.origin}`)
  if (f.since) conditions.push(sql`created_at >= ${f.since}::timestamptz`)
  if (owner) conditions.push(sql`owner_id = ${owner}`)
  if (f.identity !== 'all')
    conditions.push(
      sql`is_anonymous is ${f.identity === 'anonymous' ? sql`true` : sql`false`}`
    )
  if (f.query) {
    const pattern = `%${f.query.replace(/[\\%_]/g, '\\$&')}%`
    conditions.push(
      sql`(id::text ilike ${pattern} or owner_id ilike ${pattern} or title ilike ${pattern} or name ilike ${pattern} or x_username ilike ${pattern})`
    )
  }
  if (f.state === 'completed') conditions.push(sql`has_result`)
  if (f.state === 'active') conditions.push(sql`not has_result`)
  if (f.state === 'recovery')
    conditions.push(
      sql`engine_status in ('recovery', 'paused') and not has_result`
    )
  if (f.state === 'attention')
    conditions.push(sql`operation_status in ('failed', 'interrupted')`)
  return sql.join(conditions, sql` and `)
}
export async function overview(f: AdminFilters) {
  const db = await adminDatabase()
  const result = await db.execute<{
    started: number
    answered: number
    completed: number
    owners: number
    answers: number
    attention: number
    published: number
  }>(sql`${summary} select count(*)::int as started, count(*) filter (where answers > 0)::int as answered,
    count(*) filter (where has_result)::int as completed, count(distinct owner_id)::int as owners,
    coalesce(sum(answers), 0)::int as answers,
    count(*) filter (where operation_status in ('failed', 'interrupted'))::int as attention,
    count(*) filter (where visibility = 'public')::int as published from records where ${where(f)}`)
  return result.rows[0]!
}
export async function listAssessments(f: AdminFilters, owner?: string) {
  const db = await adminDatabase()
  const count = await db.execute<{ total: number }>(
    sql`${summary} select count(*)::int total from records where ${where(f, owner)}`
  )
  const rows = await db.execute<AdminAssessmentRow>(
    sql`${summary} select * from records where ${where(f, owner)} order by ${f.sort === 'created' ? sql`created_at` : sql`updated_at`} desc, id desc limit 25 offset ${(f.page - 1) * 25}`
  )
  return { rows: rows.rows, total: count.rows[0]!.total }
}
export async function listUsers(f: AdminFilters) {
  const db = await adminDatabase()
  // Users are current owners of matching assessments, not visitors or sessions.
  const query = sql`${summary}, owners as (select owner_id, name, is_anonymous, x_username,
    count(*)::int assessments, count(*) filter (where has_result)::int completed,
    max(updated_at) last_activity, max(created_at) latest_start from records where ${where(f)} group by owner_id, name, is_anonymous, x_username)`
  const count = await db.execute<{ total: number }>(
    sql`${query} select count(*)::int total from owners`
  )
  const rows = await db.execute<{
    owner_id: string
    name: string
    is_anonymous: boolean | null
    x_username: string | null
    assessments: number
    completed: number
    last_activity: string
  }>(
    sql`${query} select * from owners order by ${f.sort === 'created' ? sql`latest_start` : sql`last_activity`} desc, owner_id limit 25 offset ${(f.page - 1) * 25}`
  )
  return { rows: rows.rows, total: count.rows[0]!.total }
}
export async function inspectUser(id: string) {
  const db = await adminDatabase()
  const result = await db.execute<{
    id: string
    name: string
    is_anonymous: boolean | null
    x_username: string | null
    created_at: string
  }>(
    sql`select id, name, is_anonymous, x_username, created_at at time zone 'UTC' as created_at from "user" where id = ${id}`
  )
  return result.rows[0] ?? null
}
export async function inspectAssessment(id: string, published = false) {
  const db = await adminDatabase()
  if (!z.uuid().safeParse(id).success) return null
  const result = await db.execute<AdminAssessmentRow>(
    sql`${summary} select * from records where id = ${id}::uuid`
  )
  const row = result.rows[0]
  if (!row) return null
  const snapshot = await db.execute<{
    payload: unknown
    format: string
    has_result: boolean
    revision: number
  }>(
    sql`select s.payload, s.format, s.has_result, s.revision from assessment_snapshots s join assessments a on s.assessment_id = a.id and s.id = ${published ? sql`a.final_snapshot_id` : sql`a.current_snapshot_id`} where a.id = ${id}::uuid`
  )
  const saved = snapshot.rows[0]
  if (!saved) return null
  const operations = await db.execute<{
    id: string
    action: string
    status: string
    failure_category: string | null
    created_at: string
    submitted_text: string | null
  }>(sql`select id, action->>'type' action,
    case when status = 'running' and deadline <= now() then 'interrupted' else status end status,
    failure_category, created_at,
    case when status <> 'succeeded' then action->>'text' end submitted_text
    from assessment_operations where assessment_id = ${id}::uuid order by created_at desc, id desc limit 30`)
  const state =
    saved.format === 'assessment_v1'
      ? assessmentSchema.parse(saved.payload)
      : null
  if (state && !saved.has_result) state.result = null
  const simulation =
    saved.format === 'simulation_v1' || saved.format === 'historical_journey_v1'
      ? simulationPayload.parse(saved.payload)
      : null
  return {
    row,
    state,
    simulation,
    operations: operations.rows,
    snapshotRevision: saved.revision
  }
}
export async function adminComparisons() {
  const db = await adminDatabase()
  const rows = await personaRepository(db.$client).selectedSummaries(true)
  return rows.map(({ metadata, result }) => ({
    id: metadata.id,
    name: metadata.name,
    slug: metadata.slug,
    avatar: metadata.avatar,
    values: worldviewValues(result)
  }))
}
