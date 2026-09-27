// Re-reads saved participant results with the current engine after an engine
// upgrade. Answers never change. `plan` reads the target database and calls Jev
// but writes nothing; `write` commits a reviewed plan. Each updated result
// becomes a new snapshot produced by a succeeded `project` operation, under the
// same guards as a live commit, and earlier snapshots remain. A published
// assessment moves its published pointer with its head and keeps its
// publication date. See docs/PERSISTENCE.md#re-evaluating-saved-results.
//
//   results:reevaluate plan --env <file> --out <plan.jsonl> [--ids a,b] [--limit n]
//   results:reevaluate write --env <file> --plan <plan.jsonl> [--ids a,b]
import { randomUUID } from 'node:crypto'
import { appendFileSync, existsSync, readFileSync } from 'node:fs'
import { parseArgs, parseEnv } from 'node:util'
import pMap from 'p-map'
import { Pool } from 'pg'
import {
  assessmentSchema,
  versions,
  type Assessment,
  type Result
} from '../lib/assessment/schema'
import { presentResult } from '../lib/assessment/present-result'
import { resultPoint } from '../lib/assessment/self-placement'
import { restoreLocalInteraction } from '../lib/assessment/transport'
import { fingerprint } from '../lib/assessments/repository'
import { loadBundle } from '../lib/content/loader'
import { databaseUrl } from '../lib/db/config'
import { runAssessment } from '../lib/server/engine'
import { createLiveProvider } from '../lib/server/live-provider'
import type { Provider } from '../lib/server/provider'

const { positionals, values: args } = parseArgs({
  allowPositionals: true,
  options: {
    env: { type: 'string' },
    out: { type: 'string' },
    plan: { type: 'string' },
    ids: { type: 'string' },
    limit: { type: 'string' },
    concurrency: { type: 'string', default: '6' },
    'max-usd': { type: 'string', default: '5' },
    'idle-minutes': { type: 'string', default: '30' }
  }
})
// Jev bills input tokens only (rates in lib/journeys/live-budget.ts).
const jevUsdPerInputToken = 0.042 / 1_000_000
const operation = { type: 'project' } as const
const ids = args.ids ? new Set(args.ids.split(',')) : null

type Summary = ReturnType<typeof summary>
type PlanEntry = {
  id: string
  visibility: 'private' | 'public'
  baseRevision: number
  baseSnapshotId: string
  status: Assessment['status']
  answers: number
  decision: 'update' | 'skip'
  reason?: string
  usd: number
  before?: Summary
  after?: Summary
  beforeResult?: Result
  next?: Assessment
}

// What the results page shows: the stored result before, presented after.
function summary(result: Result) {
  const point = resultPoint(result)
  const pdoom =
    result.experiment?.evidenceRevision === result.evidenceRevision
      ? result.experiment.pdoom
      : null
  return {
    engine: result.versions.assessment,
    x: point.x,
    y: point.y,
    placed: !result.insufficient && point.x !== null && point.y !== null,
    pdoom: pdoom && {
      token: pdoom.token ?? null,
      estimate: pdoom.estimate ?? null,
      bounds: pdoom.bounds ?? null,
      source: pdoom.source ?? null
    }
  }
}

function pool(write: boolean) {
  if (!args.env)
    throw new Error('Pass --env with the target database settings.')
  const saved = parseEnv(readFileSync(args.env, 'utf8'))
  // Only database settings are read, never auth or app flags. Writes use the
  // application role, like a live commit.
  const value = write
    ? saved.DATABASE_URL
    : saved.ADMIN_DATABASE_URL ||
      saved.DATABASE_MIGRATION_URL ||
      saved.DATABASE_URL
  if (!value) throw new Error(`${args.env} has no database URL.`)
  const url = new URL(databaseUrl(value))
  if (!write && !url.hostname.includes('-pooler.'))
    url.searchParams.set(
      'options',
      '-c default_transaction_read_only=on -c statement_timeout=30000'
    )
  return new Pool({ connectionString: url.toString(), max: 4 })
}

function entries(file: string): PlanEntry[] {
  if (!existsSync(file)) return []
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as PlanEntry)
}

function metered(provider: Provider, usage: { tokens: number }): Provider {
  return {
    kind: provider.kind,
    async evaluate(...call) {
      const result = await provider.evaluate(...call)
      usage.tokens += result.usage.input_tokens
      return result
    }
  }
}

async function reevaluate(
  row: { id: string; visibility: PlanEntry['visibility']; revision: number },
  snapshotId: string,
  state: Assessment
): Promise<PlanEntry> {
  const base = {
    id: row.id,
    visibility: row.visibility,
    baseRevision: row.revision,
    baseSnapshotId: snapshotId,
    status: state.status,
    answers: state.answers.length,
    usd: 0
  }
  const before = state.result
  if (!before || before.evidenceRevision !== state.evidenceRevision)
    return { ...base, decision: 'skip', reason: 'no-current-result' }
  if (before.versions.assessment === versions.assessment)
    return { ...base, decision: 'skip', reason: 'already-current' }
  if (state.revision !== row.revision)
    return { ...base, decision: 'skip', reason: 'revision-mismatch' }
  const requestKey = `reevaluate:${versions.assessment}:r${row.revision}`
  const usage = { tokens: 0 }
  try {
    const response = await runAssessment(
      {
        assessment: { ...state, result: null },
        operation,
        requestId: requestKey,
        debug: false
      },
      metered(createLiveProvider(state.versions.model), usage),
      loadBundle(state.versions.content),
      false,
      AbortSignal.timeout(120_000),
      requestKey
    )
    const next = assessmentSchema.parse({
      ...restoreLocalInteraction(
        state,
        response.assessment,
        operation,
        requestKey
      ),
      draft: '',
      eventMarkers: []
    })
    if (
      next.id !== state.id ||
      next.revision !== state.revision + 1 ||
      !next.result
    )
      throw new Error('Unexpected engine output')
    // Only the interpretation changes: someone who continued past their result
    // keeps their open question.
    if (state.status === 'answering' || state.status === 'recovery')
      next.status = state.status
    const was = summary(before)
    const now = summary(presentResult(next.result))
    return {
      ...base,
      usd: usage.tokens * jevUsdPerInputToken,
      // Never replace a placed map with an unplaced one.
      ...(was.placed && !now.placed
        ? { decision: 'skip', reason: 'would-unplace' }
        : { decision: 'update' }),
      before: was,
      after: now,
      beforeResult: before,
      next
    }
  } catch (err) {
    return {
      ...base,
      usd: usage.tokens * jevUsdPerInputToken,
      decision: 'skip',
      reason: `engine-error: ${err instanceof Error ? err.message.slice(0, 160) : 'unknown'}`
    }
  }
}

async function plan() {
  if (!args.out) throw new Error('Pass --out for the plan file.')
  const out = args.out
  const db = pool(false)
  const done = new Set(entries(out).map((entry) => entry.id))
  const { rows } = await db.query<{
    id: string
    visibility: PlanEntry['visibility']
    revision: number
    current_snapshot_id: string
  }>(
    `select a.id, a.visibility, a.revision, a.current_snapshot_id
       from assessments a
       join assessment_snapshots s
         on s.id = a.current_snapshot_id and s.assessment_id = a.id
      where a.origin = 'participant' and s.has_result and s.format = 'assessment_v1'
      order by a.created_at`
  )
  const selected = rows
    .filter((row) => !done.has(row.id) && (!ids || ids.has(row.id)))
    .slice(0, args.limit ? Number(args.limit) : undefined)
  const maxUsd = Number(args['max-usd'])
  let spent = 0
  let finished = 0
  await pMap(
    selected,
    async (row) => {
      if (spent >= maxUsd) return
      const { rows: saved } = await db.query<{ payload: unknown }>(
        'select payload from assessment_snapshots where id = $1 and assessment_id = $2',
        [row.current_snapshot_id, row.id]
      )
      const entry = await reevaluate(
        row,
        row.current_snapshot_id,
        assessmentSchema.parse(saved[0]!.payload)
      )
      spent += entry.usd
      appendFileSync(out, JSON.stringify(entry) + '\n')
      if (++finished % 25 === 0)
        console.log(
          `${finished}/${selected.length} planned, $${spent.toFixed(3)}`
        )
    },
    { concurrency: Number(args.concurrency) }
  )
  await db.end()
  const all = entries(out)
  const counts = Object.groupBy(all, (entry) => entry.reason ?? entry.decision)
  console.log(
    `Planned ${all.length}: ${Object.entries(counts)
      .map(([reason, list]) => `${reason} ${list!.length}`)
      .join(', ')}. This run spent $${spent.toFixed(3)}.`
  )
}

async function commit(db: Pool, entry: PlanEntry) {
  const client = await db.connect()
  const skipped = async (reason: string) => {
    await client.query('rollback')
    return { status: 'skipped', reason }
  }
  try {
    await client.query('begin')
    const { rows } = await client.query<{
      origin: string
      visibility: string
      revision: number
      current_snapshot_id: string
      final_snapshot_id: string | null
      versions: Record<string, string>
    }>(
      `select origin, visibility, revision, current_snapshot_id, final_snapshot_id, versions
         from assessments where id = $1 for update`,
      [entry.id]
    )
    const row = rows[0]
    if (!row || row.origin !== 'participant') return await skipped('missing')
    if (
      row.revision !== entry.baseRevision ||
      row.current_snapshot_id !== entry.baseSnapshotId ||
      row.visibility !== entry.visibility
    )
      return await skipped('changed')
    const { rows: latest } = await client.query<{
      status: string
      created_at: Date
    }>(
      `select status, created_at from assessment_operations
        where assessment_id = $1 order by created_at desc, id desc limit 1`,
      [entry.id]
    )
    // A running operation, or a failed one awaiting retry, owns the next revision.
    if (latest[0] && latest[0].status !== 'succeeded')
      return await skipped(`operation-${latest[0].status}`)
    if (
      latest[0] &&
      Date.now() - latest[0].created_at.getTime() <
        Number(args['idle-minutes']) * 60_000
    )
      return await skipped('recently-active')
    const payload = assessmentSchema.parse({
      ...entry.next,
      draft: '',
      eventMarkers: []
    })
    if (
      payload.id !== entry.id ||
      payload.revision !== row.revision + 1 ||
      !payload.result
    )
      return await skipped('invalid-plan')
    const requestKey = `reevaluate:${payload.result.versions.assessment}:r${row.revision}`
    const { rows: inserted } = await client.query<{ id: string }>(
      `insert into assessment_operations
         (assessment_id, request_key, fingerprint, action, base_snapshot_id,
          base_revision, versions, status, deadline)
       values ($1, $2, $3, $4::jsonb, $5, $6, $7::jsonb, 'running', now() + interval '2 minutes')
       on conflict (assessment_id, request_key) do nothing
       returning id`,
      [
        entry.id,
        requestKey,
        fingerprint({
          expectedRevision: row.revision,
          operation,
          retryOf: null
        }),
        JSON.stringify(operation),
        row.current_snapshot_id,
        row.revision,
        JSON.stringify({
          ...row.versions,
          assessment: payload.result.versions.assessment
        })
      ]
    )
    if (!inserted[0]) return await skipped('already-written')
    const snapshotId = randomUUID()
    await client.query(
      `insert into assessment_snapshots
         (id, assessment_id, revision, format, payload, digest, evidence_revision, operation_id, has_result)
       values ($1, $2, $3, 'assessment_v1', $4::jsonb, $5, $6, $7, true)`,
      [
        snapshotId,
        entry.id,
        payload.revision,
        JSON.stringify(payload),
        fingerprint(payload),
        payload.evidenceRevision,
        inserted[0].id
      ]
    )
    // updated_at is left alone: it dates a publication and the owner's last change.
    await client.query(
      `update assessments
          set revision = $2, current_snapshot_id = $3,
              final_snapshot_id = case when visibility = 'public' then $3 else final_snapshot_id end
        where id = $1`,
      [entry.id, payload.revision, snapshotId]
    )
    await client.query(
      `update assessment_operations
          set status = 'succeeded', resulting_snapshot_id = $2, updated_at = now()
        where id = $1`,
      [inserted[0].id, snapshotId]
    )
    await client.query('commit')
    return {
      status: 'written',
      visibility: row.visibility,
      previousSnapshotId: row.current_snapshot_id,
      snapshotId,
      operationId: inserted[0].id
    }
  } catch (err) {
    await client.query('rollback').catch(() => {})
    return {
      status: 'failed',
      error: err instanceof Error ? err.message.slice(0, 200) : 'unknown'
    }
  } finally {
    client.release()
  }
}

async function write() {
  if (!args.plan) throw new Error('Pass --plan with a reviewed plan file.')
  const db = pool(true)
  const log = `${args.plan}.written.jsonl`
  const selected = entries(args.plan).filter(
    (entry) => entry.decision === 'update' && (!ids || ids.has(entry.id))
  )
  const outcomes: Record<string, number> = {}
  for (const entry of selected) {
    const outcome = await commit(db, entry)
    const key =
      'reason' in outcome
        ? `${outcome.status}:${outcome.reason}`
        : outcome.status
    outcomes[key] = (outcomes[key] ?? 0) + 1
    appendFileSync(
      log,
      JSON.stringify({
        id: entry.id,
        at: new Date().toISOString(),
        ...outcome
      }) + '\n'
    )
  }
  await db.end()
  console.log(
    `Wrote ${selected.length} planned updates: ${Object.entries(outcomes)
      .map(([key, n]) => `${key} ${n}`)
      .join(', ')}. Log: ${log}`
  )
}

if (positionals[0] === 'plan') await plan()
else if (positionals[0] === 'write') await write()
else throw new Error('Choose plan or write.')
