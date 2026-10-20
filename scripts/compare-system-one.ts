// Compares Jev with Cloudflare's System One models (Clef, Clairic) by
// replaying featured simulated users' recorded transcripts through the engine.
// No answer is generated and nothing is written to a database; outputs go to
// the git-ignored work/system-one/. Findings and decisions:
// docs/research/cloudflare-system-one-spike-2026-10-20.md.
//
//   compare-system-one dump                       read-only: featured transcripts from production
//   compare-system-one run --variant=<V> --allow-paid [--ids a,b] [--concurrency 6]
//   compare-system-one estimators --allow-paid    Clairic P(doom) estimate designs
//   python3 scripts/compare-system-one.py         analysis.json and the report page
//
// Variants: A = Jev; A2 = Jev again (noise floor); B2 = Jev + Clairic
// complement (Jev keeps its quote picks); B = Jev + Clairic replace (Clairic
// picks quotes); C = Clef + Clairic replace.
// Clef and Clairic use CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID when set,
// else the authenticated `cf` CLI.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import pMap from 'p-map'
import { Pool } from 'pg'
import { doomBands } from '../lib/assessment/pdoom'
import { versions } from '../lib/assessment/schema'
import { loadBundle } from '../lib/content/loader'
import { personas as catalog } from '../lib/journeys/catalog'
import { runPersona } from '../lib/journeys/runner'
import { simulationPayload } from '../lib/personas/payload'
import {
  clairicState,
  createClairicExtractor
} from '../lib/server/clairic-extractor'
import { createClefProvider } from '../lib/server/clef-provider'
import { createLiveProvider } from '../lib/server/live-provider'
import type { Provider } from '../lib/server/provider'
import { runWorkersAi } from '../lib/server/workers-ai'
import { inspectionDatabaseUrl } from './inspection-env'

const dir = 'work/system-one'
const { positionals, values: args } = parseArgs({
  allowPositionals: true,
  options: {
    variant: { type: 'string' },
    ids: { type: 'string' },
    concurrency: { type: 'string', default: '6' },
    'allow-paid': { type: 'boolean', default: false }
  }
})
type User = {
  slug: string
  id: string
  name: string
  transcript: Array<{ promptId: string; question: string; answer: string }>
}
const users = () =>
  JSON.parse(readFileSync(`${dir}/featured.json`, 'utf8')) as User[]
const paid = () => {
  if (!args['allow-paid'])
    throw new Error('This command calls paid models; pass --allow-paid.')
}

async function dump() {
  const url = new URL(inspectionDatabaseUrl('production'))
  url.searchParams.set(
    'options',
    '-c default_transaction_read_only=on -c statement_timeout=60000'
  )
  const db = new Pool({ connectionString: url.toString(), max: 4 })
  const { rows } = await db.query<{
    slug: string
    name: string
    id: string
    payload: unknown
  }>(`select p.slug, p.name, p.metadata->>'id' as id, s.payload
        from personas p join assessments a on a.id = p.selected_assessment_id
        join assessment_snapshots s on s.id = a.current_snapshot_id and s.assessment_id = a.id
       where p.featured order by p.slug`)
  const out = rows.map((row) => {
    const payload = simulationPayload.parse(row.payload)
    const transcript = payload.journey.steps
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
    return { slug: row.slug, name: row.name, id: row.id, transcript }
  })
  mkdirSync(dir, { recursive: true })
  writeFileSync(`${dir}/featured.json`, JSON.stringify(out, null, 1))
  const statements = Object.fromEntries(
    catalog.flatMap((p) => {
      const s = p.statedPdoom
      if (!s) return []
      const [lo, hi] = s.bounds
      // Open ranges plot at their stated end; scoring uses the whole range.
      const point =
        s.estimate ??
        (hi === 1 && lo > 0
          ? lo
          : lo === 0 && hi > 0 && hi < 1
            ? hi
            : (lo + hi) / 2)
      return [[p.id, { token: s.token, estimate: point, bounds: s.bounds }]]
    })
  )
  writeFileSync(`${dir}/public-pdoom.json`, JSON.stringify(statements, null, 1))
  console.log(`${out.length} featured users`)
  await db.end()
}

function provider(variant: string, tokens: Record<string, number>): Provider {
  const count = (model: string) => (usage: { input_tokens: number }) => {
    tokens[model] = (tokens[model] ?? 0) + usage.input_tokens
  }
  const clairic = (mode: 'complement' | 'replace') =>
    createClairicExtractor({
      mode,
      onUsage: (n) => (tokens.clairic = (tokens.clairic ?? 0) + n)
    })
  const jev = () =>
    createLiveProvider(versions.model, { onUsage: count('jev') })
  if (variant === 'A' || variant === 'A2') return jev()
  if (variant === 'B2') return { ...jev(), extractor: clairic('complement') }
  if (variant === 'B') return { ...jev(), extractor: clairic('replace') }
  if (variant === 'C')
    return {
      ...createClefProvider('clef', { onUsage: count('clef') }),
      extractor: clairic('replace')
    }
  throw new Error('Choose --variant=A, A2, B, B2 or C.')
}

async function run() {
  paid()
  const variant = args.variant ?? ''
  provider(variant, {})
  const out = `${dir}/runs/${variant}`
  mkdirSync(out, { recursive: true })
  const wanted = args.ids ? new Set(args.ids.split(',')) : null
  const bundle = loadBundle()
  const todo = users().filter(
    (u) =>
      (!wanted || wanted.has(u.slug)) && !existsSync(`${out}/${u.slug}.json`)
  )
  console.log(`${variant}: ${todo.length} to run`)
  let done = 0
  await pMap(
    todo,
    async (user) => {
      const persona = catalog.find((p) => p.id === user.id)
      if (!persona) throw new Error(`No catalog persona ${user.id}`)
      const tokens: Record<string, number> = {}
      const started = performance.now()
      const journey = await runPersona(
        persona,
        bundle,
        user.transcript.length,
        provider(variant, tokens),
        undefined,
        false,
        undefined,
        undefined,
        user.transcript
      )
      if (journey.error || !journey.result) {
        console.log(`FAIL ${user.slug}: ${journey.error ?? journey.stopped}`)
        writeFileSync(
          `${out}/${user.slug}.error.json`,
          JSON.stringify({ error: journey.error, stopped: journey.stopped })
        )
        return
      }
      const steps = journey.steps.map((step) => ({
        ordinal: step.ordinal,
        promptId: step.prompt.promptId,
        nextPromptId: step.nextPrompt?.promptId ?? null,
        ready: step.readiness.ready,
        stages: (step.trace?.stages ?? []).map((s) => ({
          name: s.name,
          model: s.model,
          elapsedMs: s.elapsedMs,
          questions: Object.keys(s.questions).length,
          inputTokens: s.usage.input_tokens
        }))
      }))
      writeFileSync(
        `${out}/${user.slug}.json`,
        JSON.stringify({
          slug: user.slug,
          name: user.name,
          variant,
          firstReadyAnswer: journey.firstReadyAnswer ?? null,
          wallMs: Math.round(performance.now() - started),
          tokens,
          steps,
          result: journey.result
        })
      )
      console.log(
        `${++done}/${todo.length} ${user.slug} ${JSON.stringify(tokens)}`
      )
    },
    { concurrency: Number(args.concurrency) }
  )
}

// Ways of asking Clairic for an unstated P(doom); none beat Jev's bands.
async function estimators() {
  paid()
  const outcome =
    'AI causing human extinction or a comparably irreversible civilization-scale catastrophe (such as AI takeover or permanent human disempowerment)'
  const ask = `The participant's own probability, in percent, of ${outcome}, inferred from their whole account. This is their belief, not yours.`
  const guide =
    'Map everyday wording by attitude: someone who dismisses catastrophe as science fiction or not a real risk is well under 1%; someone who calls it very unlikely is around 1-3%; people who treat it as a real but minority risk are 5-30%; people who see it as plausible or likely are 30-90%; people who expect it by default are above 90%. Optimism that never mentions catastrophic risk is under 1%.'
  const designs = {
    log_001_100: {
      type: 'estimate',
      min: 0.01,
      max: 100,
      step: 0.01,
      scale: 'log',
      instructions: ask
    },
    linear_0_100: {
      type: 'estimate',
      min: 0,
      max: 100,
      step: 0.5,
      instructions: ask
    },
    log_guided: {
      type: 'estimate',
      min: 0.01,
      max: 100,
      step: 0.01,
      scale: 'log',
      instructions: `${ask} ${guide}`
    },
    linear_guided: {
      type: 'estimate',
      min: 0,
      max: 100,
      step: 0.5,
      instructions: `${ask} ${guide}`
    },
    band_index: {
      type: 'estimate',
      min: 0,
      max: Object.keys(doomBands).length - 1,
      step: 0.1,
      instructions: `Which likelihood band best describes the participant's own belief about ${outcome}? Bands: ${Object.values(
        doomBands
      )
        .map((b, i) => `${i} = ${b.label}`)
        .join('; ')}.`
    }
  }
  const rows = await pMap(
    users(),
    async (u) => {
      const state = clairicState(
        u.transcript.map((t, i) => ({
          id: `a${i}`,
          prompt: t.question,
          answer: t.answer
        }))
      ).text
      const { output } = await runWorkersAi<{
        answers: Record<string, { median: number; p10: number; p90: number }>
      }>('@cf/cloudflare/clairic', { model: 'clairic', state, fields: designs })
      return {
        slug: u.slug,
        id: u.id,
        answers: Object.fromEntries(
          Object.entries(output.answers).map(([k, v]) => [
            k,
            { median: v.median, p10: v.p10, p90: v.p90 }
          ])
        )
      }
    },
    { concurrency: 8 }
  )
  writeFileSync(`${dir}/estimator-designs.json`, JSON.stringify(rows, null, 1))
  console.log(`${rows.length} users`)
}

const command = positionals[0]
if (command === 'dump') await dump()
else if (command === 'run') await run()
else if (command === 'estimators') await estimators()
else throw new Error('Commands: dump, run, estimators')
