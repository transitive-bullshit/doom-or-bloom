// Re-evaluates the selected simulated users with the current engine by
// replaying each selected run's recorded questions and answers through the
// journey runner; no answer is generated. `plan` reads the target database and
// calls Jev but writes nothing; `write` records each successful replay through
// the ordinary generation records and publishes it as a new public simulation,
// which becomes the persona's selected run when it is newer. Earlier runs stay
// frozen at their own URLs. See docs/PERSISTENCE.md#re-evaluating-saved-results.
//
//   personas:reevaluate plan --env <file> --out <plan.jsonl> [--ids slug,slug]
//   personas:reevaluate write --env <file> --plan <plan.jsonl> [--ids slug,slug]
import { createHash } from 'node:crypto'
import { appendFileSync, existsSync, readFileSync } from 'node:fs'
import { parseArgs, parseEnv } from 'node:util'
import pMap from 'p-map'
import { Pool } from 'pg'
import { versions, type Result } from '../lib/assessment/schema'
import { presentResult } from '../lib/assessment/present-result'
import { resultPoint } from '../lib/assessment/self-placement'
import { loadBundle } from '../lib/content/loader'
import { databaseUrl } from '../lib/db/config'
import { personas as catalog } from '../lib/journeys/catalog'
import { journeyHashes, runPersona } from '../lib/journeys/runner'
import type { Journey } from '../lib/journeys/schema'
import { personaGeneration } from '../lib/personas/generation'
import { simulationPayload } from '../lib/personas/payload'
import { createLiveProvider } from '../lib/server/live-provider'
import type { Provider } from '../lib/server/provider'

const { positionals, values: args } = parseArgs({
  allowPositionals: true,
  options: {
    env: { type: 'string' },
    out: { type: 'string' },
    plan: { type: 'string' },
    ids: { type: 'string' },
    concurrency: { type: 'string', default: '8' },
    'max-usd': { type: 'string', default: '6' }
  }
})
// Jev bills input tokens only (rates in lib/journeys/live-budget.ts).
const jevUsdPerInputToken = 0.042 / 1_000_000
const slugs = args.ids ? new Set(args.ids.split(',')) : null

type Provenance = Parameters<ReturnType<typeof personaGeneration>['begin']>[1]
type Transcript = Array<{ promptId: string; question: string; answer: string }>
type PlanEntry = {
  personaId: string
  slug: string
  name: string
  sourceAssessmentId: string
  sourceEngine: string | null
  answers: number
  decision: 'update' | 'skip'
  reason?: string
  usd: number
  before?: ReturnType<typeof summary>
  after?: ReturnType<typeof summary>
  provenance?: Provenance
  input?: {
    kind: 'reevaluation'
    sourceAssessmentId: string
    transcript: Transcript
  }
  journey?: Journey
}

// What the simulated user's page shows.
function summary(raw: Result) {
  const result = presentResult(raw)
  const point = resultPoint(result)
  const pdoom =
    result.experiment?.evidenceRevision === result.evidenceRevision
      ? result.experiment.pdoom
      : null
  return {
    engine: result.versions.assessment,
    x: point.x,
    y: point.y,
    pdoom: pdoom
      ? {
          token: pdoom.token ?? null,
          estimate: pdoom.estimate ?? null,
          source: pdoom.source ?? null
        }
      : null
  }
}

function pool(write: boolean) {
  if (!args.env)
    throw new Error('Pass --env with the target database settings.')
  const saved = parseEnv(readFileSync(args.env, 'utf8'))
  // Only database settings are read, never auth or app flags.
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
      '-c default_transaction_read_only=on -c statement_timeout=60000'
    )
  return new Pool({
    connectionString: url.toString(),
    max: Math.max(4, Number(args.concurrency))
  })
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

async function plan() {
  if (!args.out) throw new Error('Pass --out for the plan file.')
  const out = args.out
  const db = pool(false)
  const bundle = loadBundle()
  const { engineHash, contentHash } = journeyHashes(bundle, [])
  const runId = `reevaluate-${versions.assessment}-${Date.now()}`
  const done = new Set(entries(out).map((entry) => entry.slug))
  const { rows } = await db.query<{
    id: string
    slug: string
    name: string
    catalog_id: string
    selected_assessment_id: string
  }>(
    `select id, slug, name, metadata->>'id' as catalog_id, selected_assessment_id
       from personas where selected_assessment_id is not null order by slug`
  )
  const selected = rows.filter(
    (row) => !done.has(row.slug) && (!slugs || slugs.has(row.slug))
  )
  const maxUsd = Number(args['max-usd'])
  let spent = 0
  let finished = 0
  await pMap(
    selected,
    async (row) => {
      const base = {
        personaId: row.id,
        slug: row.slug,
        name: row.name,
        sourceAssessmentId: row.selected_assessment_id,
        usd: 0
      }
      const record = (entry: PlanEntry) => {
        appendFileSync(out, JSON.stringify(entry) + '\n')
        if (++finished % 10 === 0)
          console.log(
            `${finished}/${selected.length} planned, $${spent.toFixed(3)}`
          )
      }
      if (spent >= maxUsd)
        return record({
          ...base,
          sourceEngine: null,
          answers: 0,
          decision: 'skip',
          reason: 'budget'
        })
      const { rows: saved } = await db.query<{ payload: unknown }>(
        `select s.payload from assessments a
           join assessment_snapshots s on s.id = a.current_snapshot_id and s.assessment_id = a.id
          where a.id = $1`,
        [row.selected_assessment_id]
      )
      const payload = simulationPayload.parse(saved[0]!.payload)
      const old = payload.journey.result
      const persona = catalog.find((p) => p.id === row.catalog_id)
      // Only accepted answers are replayed; each is answered again to its own question.
      const transcript: Transcript = payload.journey.steps
        .filter(
          (s) =>
            s.operation === 'answer' &&
            s.answer !== null &&
            (s.disposition ?? 'usable') === 'usable'
        )
        .map((s) => ({
          promptId: s.prompt.promptId,
          question: s.prompt.text,
          answer: s.answer!
        }))
      const known = {
        ...base,
        sourceEngine: old?.versions.assessment ?? null,
        answers: transcript.length
      }
      if (!persona)
        return record({ ...known, decision: 'skip', reason: 'not-in-catalog' })
      if (!old)
        return record({ ...known, decision: 'skip', reason: 'no-saved-result' })
      if (old.versions.assessment === versions.assessment)
        return record({ ...known, decision: 'skip', reason: 'already-current' })
      if (!transcript.length || transcript.length > 12)
        return record({
          ...known,
          decision: 'skip',
          reason: 'transcript-length'
        })
      const startedAt = new Date().toISOString()
      const usage = { tokens: 0 }
      const journey = await runPersona(
        persona,
        bundle,
        transcript.length,
        metered(createLiveProvider(versions.model), usage),
        undefined,
        false,
        undefined,
        undefined,
        transcript
      )
      const usd = usage.tokens * jevUsdPerInputToken
      spent += usd
      // Keep the source snapshot the answers were written from; the verified
      // public statement is the current one the runner applied.
      const original = payload.journey.personaSnapshot
      if (original && 'sources' in original) {
        const { statedPdoom: _previous, ...rest } =
          original as typeof original & { statedPdoom?: unknown }
        journey.personaSnapshot = (
          persona.statedPdoom
            ? { ...rest, statedPdoom: persona.statedPdoom }
            : rest
        ) as Journey['personaSnapshot']
      }
      if (journey.error || !journey.result || !journey.finalAssessment?.result)
        return record({
          ...known,
          usd,
          decision: 'skip',
          reason: `replay: ${journey.error ?? journey.stopped}`.slice(0, 200)
        })
      const input = {
        kind: 'reevaluation' as const,
        sourceAssessmentId: row.selected_assessment_id,
        transcript
      }
      record({
        ...known,
        usd,
        decision: 'update',
        before: summary(old),
        after: summary(journey.result),
        provenance: {
          runId,
          createdAt: startedAt,
          inputHash: createHash('sha256')
            .update(JSON.stringify(input))
            .digest('hex'),
          engineHash,
          contentHash
        },
        input,
        journey: {
          ...journey,
          steps: journey.steps.map(({ trace: _trace, ...step }) => step)
        }
      })
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

async function write() {
  if (!args.plan) throw new Error('Pass --plan with a reviewed plan file.')
  const db = pool(true)
  // Fail before any write when the role cannot publish.
  const { rows: grants } = await db.query<{ ok: boolean }>(
    `select has_table_privilege('assessments', 'INSERT') and has_table_privilege('assessment_snapshots', 'INSERT')
        and has_table_privilege('assessment_operations', 'INSERT') and has_table_privilege('personas', 'UPDATE') as ok`
  )
  if (!grants[0]?.ok)
    throw new Error('This database role cannot publish simulations.')
  const generations = personaGeneration(db)
  const log = `${args.plan}.written.jsonl`
  const written = new Set(
    entries(log)
      .filter((e) => (e as unknown as { status: string }).status === 'selected')
      .map((e) => e.slug)
  )
  const selected = entries(args.plan).filter(
    (entry) =>
      entry.decision === 'update' &&
      !written.has(entry.slug) &&
      (!slugs || slugs.has(entry.slug))
  )
  const outcomes: Record<string, number> = {}
  await pMap(
    selected,
    async (entry) => {
      let status: string
      let id: string | null = null
      try {
        const run = await generations.begin(
          entry.personaId,
          entry.provenance!,
          entry.input
        )
        id = run.id
        // A repeated write finds the same generation and finishes it at most once.
        await generations.finish(run.id, entry.provenance!, entry.journey!)
        const { rows } = await db.query<{ selected_assessment_id: string }>(
          'select selected_assessment_id from personas where id = $1',
          [entry.personaId]
        )
        status =
          rows[0]?.selected_assessment_id === run.id
            ? 'selected'
            : 'published-not-selected'
      } catch (err) {
        status = `failed: ${err instanceof Error ? err.message.slice(0, 160) : 'unknown'}`
      }
      outcomes[status] = (outcomes[status] ?? 0) + 1
      appendFileSync(
        log,
        JSON.stringify({
          slug: entry.slug,
          at: new Date().toISOString(),
          status,
          assessmentId: id,
          previousAssessmentId: entry.sourceAssessmentId
        }) + '\n'
      )
    },
    { concurrency: Number(args.concurrency) }
  )
  await db.end()
  console.log(
    `Wrote ${selected.length} planned re-evaluations: ${Object.entries(outcomes)
      .map(([key, n]) => `${key} ${n}`)
      .join(', ')}. Log: ${log}`
  )
}

if (positionals[0] === 'plan') await plan()
else if (positionals[0] === 'write') await write()
else throw new Error('Choose plan or write.')
