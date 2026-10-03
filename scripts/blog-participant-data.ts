// Regenerates the aggregates behind the blog's data posts (docs/BLOG.md
// #participant-data). Reads the database read-only, keeps per-person rows in
// memory, pipes them to scripts/blog-participant-data.py for the statistics and
// writes only aggregates:
//
//   pnpm blog:data --production   content/blog/aggregates/participants.json and charts
//   pnpm blog:data --out=<file>   aggregates of the local database, for checking the pipeline
//   pnpm blog:data --charts-only  rebuild content/blog/data/launch-week-*.json from the committed aggregates
//
// Rows carry pseudonymous indices, UTC days and hours, numbers and enumerated
// categories. Answer text is read in memory only to count words and sort the
// direct scale answer into a keyword category; it never leaves this process.
// Needs Python numpy and scipy through uv (`uv run --with numpy --with scipy`).
import { spawn } from 'node:child_process'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { Pool } from 'pg'
import pMap from 'p-map'
import { resultSchema, type Result } from '../lib/assessment/schema'
import { presentResult } from '../lib/assessment/present-result'
import { resultPoint } from '../lib/assessment/self-placement'
import { closestPersonas } from '../lib/assessment/persona-matches'
import { personaRepository } from '../lib/personas/repository'
import {
  participantAggregatesSchema,
  participantCharts,
  referrersSchema
} from '../lib/blog/participant-charts'
import { siteCreator } from '../lib/site'
import { inspectionDatabaseUrl } from './inspection-env'

const usage =
  'Usage: pnpm blog:data (--production | --out=<file> | --charts-only)'
const { values } = parseArgs({
  options: {
    production: { type: 'boolean', default: false },
    out: { type: 'string' },
    'charts-only': { type: 'boolean', default: false }
  }
})
const modes = [values.production, Boolean(values.out), values['charts-only']]
if (modes.filter(Boolean).length !== 1) {
  console.error(usage)
  process.exit(1)
}

const aggregatesFile = 'content/blog/aggregates/participants.json'
const referrersFile = 'content/blog/aggregates/referrers.json'
const readJson = (file: string): unknown =>
  JSON.parse(readFileSync(file, 'utf8'))

function writeCharts() {
  const charts = participantCharts(
    participantAggregatesSchema.parse(readJson(aggregatesFile)),
    referrersSchema.parse(readJson(referrersFile))
  )
  const files = Object.entries(charts).map(([name, chart]) => {
    const file = path.join('content/blog/data', name)
    writeFileSync(file, `${JSON.stringify(chart, null, 2)}\n`)
    return file
  })
  execFileSync('pnpm', ['exec', 'oxfmt', ...files], { stdio: 'ignore' })
  console.log(
    `Wrote ${files.length} chart files. Translations of changed charts are now stale: run pnpm l10n:translate --scope=blog --only-stale per locale.`
  )
}

if (values['charts-only']) {
  writeCharts()
  process.exit(0)
}

// Defense in depth: nothing here should make an HTTP request.
globalThis.fetch = () => {
  throw new Error('blog:data makes no network requests')
}
const target = values.production ? 'production' : 'local'
const url = new URL(inspectionDatabaseUrl(target))
url.searchParams.set(
  'options',
  '-c default_transaction_read_only=on -c statement_timeout=60000'
)
const pool = new Pool({
  connectionString: url.toString(),
  max: 8,
  application_name: 'doom-or-bloom-blog-data'
})
// The site owner's own account holds launch testing, not participants.
const ownerHandle = new URL(siteCreator.url).pathname.slice(1)

const levelOf = (distribution: Record<string, number> | undefined) => {
  const levels = Object.entries(distribution ?? {}).filter(([key]) =>
    /^\d+$/u.test(key)
  )
  return levels.length
    ? Number(levels.toSorted((a, b) => b[1] - a[1])[0]![0])
    : null
}

function features(raw: Result) {
  const result = presentResult(raw)
  const point = resultPoint(result)
  const experiment =
    result.experiment?.evidenceRevision === result.evidenceRevision
      ? result.experiment
      : undefined
  const pdoom = experiment?.pdoom
  const outlook = result.components.find(
    (component) => component.vector === 'outlook_orientation'
  )
  return {
    engine: result.versions.assessment,
    x: point.x,
    y: point.y,
    insufficient: result.insufficient,
    placed: !result.insufficient && point.x !== null && point.y !== null,
    outlookLevel: levelOf(
      outlook?.distribution as Record<string, number> | undefined
    ),
    pdoom: pdoom
      ? {
          token: pdoom.token ?? null,
          estimate: pdoom.estimate ?? null,
          source: pdoom.source ?? null
        }
      : null
  }
}

// The direct scale question, sorted into keyword categories. Only the
// category leaves this process.
function scaleCategory(text: string) {
  const t = text.toLowerCase()
  if (
    /\b(complete(ly)?|entirely|totally|fundamental(ly)?|everything|unrecognizabl|transform)/u.test(
      t
    )
  )
    return 'completely'
  if (
    /\b(a lot|lots|massive(ly)?|huge(ly)?|enormous(ly)?|significant(ly)?|major|drastic(ally)?|dramatic(ally)?|substantial(ly)?|big)\b/u.test(
      t
    )
  )
    return 'a lot'
  if (
    /\b(a little|little|slight(ly)?|minor|not much|incremental|some|moderate(ly)?|marginal)\b/u.test(
      t
    )
  )
    return 'a little'
  if (/\b(don'?t know|no idea|unsure|not sure|idk|hard to say)\b/u.test(t))
    return 'unsure'
  return 'other'
}

async function extract() {
  const repository = personaRepository(pool)
  const comparisons = await repository.selectedComparisons()
  const personas = (await repository.selectedSummaries(false)).map((row) => {
    const placed = features(row.result)
    return {
      name: row.metadata.name,
      slug: row.metadata.slug,
      featured: Boolean((row.metadata as { featured?: boolean }).featured),
      x: placed.x,
      y: placed.y,
      placed: placed.placed,
      pdoom: placed.pdoom
    }
  })

  const { rows: meta } = await pool.query<{
    id: string
    owner_id: string
    created_at: Date
    is_fork: boolean
    pinned: string
    is_owner: boolean | null
  }>(
    `select a.id, a.owner_id, a.created_at, a.is_fork,
            a.versions->>'assessment' as pinned,
            (u.x_username = $1) as is_owner
       from assessments a join "user" u on u.id = a.owner_id
      where a.origin = 'participant'
      order by a.created_at, a.id`,
    [ownerHandle]
  )
  const index = new Map(meta.map((row, i) => [row.id, i]))
  const owners = new Map<string, number>()
  for (const row of meta)
    if (!owners.has(row.owner_id)) owners.set(row.owner_id, owners.size)

  const { rows: firsts } = await pool.query<{
    assessment_id: string
    first_result_at: Date
  }>(
    `select distinct on (s.assessment_id) s.assessment_id, s.created_at as first_result_at
       from assessment_snapshots s join assessments a on a.id = s.assessment_id
      where a.origin = 'participant' and s.has_result
      order by s.assessment_id, s.revision`
  )
  const firstResult = new Map(
    firsts.map((row) => [row.assessment_id, row.first_result_at])
  )

  const participants: Record<string, unknown>[] = []
  const batches: string[][] = []
  for (let i = 0; i < meta.length; i += 50)
    batches.push(meta.slice(i, i + 50).map((row) => row.id))
  await pMap(
    batches,
    async (batch) => {
      const { rows } = await pool.query<{
        id: string
        has_result: boolean
        result: unknown
        answers: { promptInstanceId: string; text: string }[]
        prompts: { id: string; promptId: string }[]
      }>(
        `select a.id, s.has_result, s.payload->'result' as result,
                s.payload->'answers' as answers, s.payload->'prompts' as prompts
           from assessments a
           join assessment_snapshots s on s.id = a.current_snapshot_id and s.assessment_id = a.id
          where a.id = any($1::uuid[])`,
        [batch]
      )
      for (const row of rows) {
        const info = meta[index.get(row.id)!]!
        const promptOf = new Map(row.prompts.map((p) => [p.id, p.promptId]))
        const answers = row.answers.map((answer) => ({
          promptId: promptOf.get(answer.promptInstanceId) ?? null,
          words: answer.text.trim().split(/\s+/u).filter(Boolean).length,
          text: answer.text
        }))
        const scale = answers.find(
          (answer) => answer.promptId === 'transformation.ultimate'
        )
        const parsed =
          row.has_result && row.result
            ? resultSchema.safeParse(row.result)
            : null
        const result = parsed?.success ? parsed.data : null
        const first = firstResult.get(row.id)
        participants.push({
          i: index.get(row.id),
          owner: owners.get(info.owner_id),
          isFork: info.is_fork,
          isOwner: Boolean(info.is_owner),
          pinned: info.pinned,
          day: info.created_at.toISOString().slice(0, 10),
          hour: info.created_at.getUTCHours(),
          firstResultDay: first ? first.toISOString().slice(0, 10) : null,
          answers: answers.length,
          words: answers.map((answer) => answer.words),
          promptIds: answers.map((answer) => answer.promptId),
          scaleAnswer: scale ? scaleCategory(scale.text) : null,
          hasResult: Boolean(result),
          ...(result && {
            ...features(result),
            closest: closestPersonas(presentResult(result), comparisons).map(
              (match) => match.slug
            )
          })
        })
      }
    },
    { concurrency: 8 }
  )

  // Feedback: guesses, ratings and placements only, never comments.
  const { rows: feedback } = await pool.query<{
    assessment_id: string
    kind: string
    payload: {
      guess?: { x: number; y: number }
      placed?: { x: number | null; y: number | null }
      rating?: string
    }
    evidence_revision: number
  }>(
    `select f.assessment_id, f.kind, f.payload, f.evidence_revision
       from assessment_feedback f
       join assessments a on a.id = f.assessment_id and a.origin = 'participant'
      order by f.created_at`
  )
  return {
    extractedAt: new Date().toISOString(),
    personas,
    participants: participants.toSorted(
      (a, b) => (a.i as number) - (b.i as number)
    ),
    feedback: feedback.map((row) => ({
      a: index.get(row.assessment_id),
      kind: row.kind,
      evidenceRevision: row.evidence_revision,
      guess: row.payload.guess ?? null,
      placed: row.payload.placed ?? null,
      rating: row.payload.rating ?? null
    }))
  }
}

// The rows go to the analysis on stdin and are never written to disk.
async function analyze(rows: unknown, out: string) {
  const child = spawn(
    'uv',
    [
      'run',
      '--quiet',
      '--with',
      'numpy',
      '--with',
      'scipy',
      'python',
      'scripts/blog-participant-data.py',
      out
    ],
    { stdio: ['pipe', 'inherit', 'inherit'] }
  )
  const done = new Promise<void>((resolve, reject) => {
    child.on('error', reject)
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`Analysis exited with ${code}`))
    )
  })
  child.stdin.end(JSON.stringify(rows))
  await done
}

try {
  const rows = await extract()
  if (values.out) await analyze(rows, path.resolve(values.out))
  else {
    // Validate before replacing the committed aggregates.
    const directory = mkdtempSync(path.join(tmpdir(), 'blog-data-'))
    try {
      const file = path.join(directory, 'participants.json')
      await analyze(rows, file)
      const aggregates = readJson(file)
      participantAggregatesSchema.parse(aggregates)
      writeFileSync(aggregatesFile, `${JSON.stringify(aggregates, null, 2)}\n`)
      execFileSync('pnpm', ['exec', 'oxfmt', aggregatesFile], {
        stdio: 'ignore'
      })
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
    writeCharts()
  }
} catch (err) {
  // Database and parser messages can quote data; report only their codes.
  const code =
    err && typeof err === 'object' && 'code' in err ? String(err.code) : null
  console.error(
    `blog:data failed (${code ?? (err instanceof Error ? err.message : 'unknown error')}).`
  )
  process.exitCode = 1
} finally {
  await pool.end()
}
