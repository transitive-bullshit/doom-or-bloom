// Read-only review packet of participant feedback; see docs/benchmark.md.
// Reads the local development database by default (--production to opt in),
// never writes to a database, and makes no HTTP requests: participant text
// stays in the local packet. Only aggregate counts are printed.
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { Pool } from 'pg'
import {
  auditFeedback,
  feedbackRecord,
  loadFeedback,
  renderDisagreements,
  renderSummary
} from '../lib/benchmark/feedback-audit'
import { inspectionDatabaseUrl } from './inspection-env'

const usage =
  'Usage: pnpm feedback:audit [--production] [--since=2026-10-01] [--sample=40] [--seed=1]'
function fail(message: string): never {
  console.error(`${message}\n${usage}`)
  process.exit(1)
}
const { values } = (() => {
  try {
    return parseArgs({
      options: {
        production: { type: 'boolean', default: false },
        since: { type: 'string' },
        sample: { type: 'string', default: '40' },
        seed: { type: 'string', default: '1' }
      }
    })
  } catch (err) {
    return fail(err instanceof Error ? err.message : 'Invalid options')
  }
})()
const sample = Number(values.sample)
const seed = Number(values.seed)
if (!Number.isInteger(sample) || sample < 0 || sample > 500)
  fail('--sample must be an integer from 0 to 500')
if (!Number.isInteger(seed)) fail('--seed must be an integer')
if (values.since && Number.isNaN(Date.parse(values.since)))
  fail('--since must be a date, e.g. 2026-10-01')

// Defense in depth: this tool has no reason to make an HTTP request.
globalThis.fetch = () => {
  throw new Error('The feedback audit makes no network requests')
}

const target = values.production ? 'production' : 'local'
const url = (() => {
  try {
    return new URL(inspectionDatabaseUrl(target))
  } catch (err) {
    // Local configuration messages name files and keys, never values.
    return fail(err instanceof Error ? err.message : 'Invalid configuration')
  }
})()
url.searchParams.set(
  'options',
  '-c default_transaction_read_only=on -c statement_timeout=15000'
)
const pool = new Pool({
  connectionString: url.toString(),
  max: 1,
  connectionTimeoutMillis: 10_000,
  application_name: 'doom-or-bloom-feedback-audit'
})
try {
  const rows = await loadFeedback(pool, values.since ?? null)
  const records = rows.map((row) => {
    try {
      return feedbackRecord(row)
    } catch {
      throw new Error(`Feedback ${row.id} does not match the current contract`)
    }
  })
  const audit = auditFeedback(records, { sample, seed })
  const directory = path.resolve(
    'eval/runs/feedback-audit',
    `${new Date().toISOString().replace(/[:.]/g, '-')}-${target}`
  )
  mkdirSync(directory, { recursive: true, mode: 0o700 })
  const write = (name: string, content: string) =>
    writeFileSync(path.join(directory, name), content, { mode: 0o600 })
  const title = `Feedback audit (${target}${values.since ? ` since ${values.since}` : ''})`
  write('summary.json', `${JSON.stringify(audit.summary, null, 2)}\n`)
  write('summary.md', renderSummary(audit.summary, title))
  write('disagreements.md', renderDisagreements(audit.sample))
  const { feedback, agreement, selfPlacement, disagreements } = audit.summary
  console.log(
    [
      `${title}: ${feedback.rows} feedback entries on ${feedback.ratedResults} rated results (${feedback.assessments} assessments).`,
      `Agreement ${agreement.overall.yes}/${agreement.overall.n} yes; self-placements ${selfPlacement.x.n} with a placed x, ${selfPlacement.y.n} with a placed y.`,
      `${disagreements.total} disagreements, ${disagreements.sampled} sampled for reading.`,
      `Private review packet (participant text; keep it local): ${directory}`
    ].join('\n')
  )
} catch (err) {
  // Database and parser messages can quote data; report only their codes.
  const code =
    err && typeof err === 'object' && 'code' in err ? String(err.code) : null
  console.error(
    code === '42P01'
      ? `The ${target} database has no assessment_feedback table yet; apply the migrations first.`
      : err instanceof Error && err.message.startsWith('Feedback ')
        ? err.message
        : `Feedback audit failed (${code ?? (err instanceof Error ? err.name : 'unknown error')}).`
  )
  process.exitCode = 1
} finally {
  await pool.end()
}
