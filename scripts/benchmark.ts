// Interview-modeling regression benchmark; see docs/benchmark.md.
// `run` and `refs` make paid OpenAI and Jev calls only with --allow-paid;
// --dry-run prints the plan and estimate without any network call.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { loadBundle } from '../lib/content/loader'
import { estimateReferenceCost, estimateRunCost } from '../lib/benchmark/cost'
import {
  answerStyles,
  expandJobs,
  findPersona,
  loadPersonaSets
} from '../lib/benchmark/personas'
import type { AnswerStyle } from '../lib/benchmark/personas'
import { failureMessage } from '../lib/benchmark/interview'
import { createMeter } from '../lib/benchmark/providers'
import { buildReferences } from '../lib/benchmark/reference-builders'
import {
  briefHash,
  loadReferences,
  referenceKinds,
  referencesPath,
  saveReferences
} from '../lib/benchmark/references'
import type { ReferenceKind } from '../lib/benchmark/references'
import {
  executeRun,
  planRun,
  readJobRecords,
  readPlan,
  runDirectory,
  runHashes,
  runsDirectory
} from '../lib/benchmark/run'
import type { RunPlan } from '../lib/benchmark/run'
import {
  compareRuns,
  renderComparison,
  renderScore,
  scoreRun
} from '../lib/benchmark/score'

const usage = `Usage:
  pnpm benchmark:run [--set=core] [--personas=a,b] [--styles=terse,brief] [--repeats=N]
                     [--max-answers=12] [--continue-after-result] [--no-inspect]
                     [--concurrency=4] [--max-cost=5] [--id=name] (--dry-run | --allow-paid)
  pnpm benchmark:run --resume=<run-id> [--concurrency=4] [--max-cost=5] (--dry-run | --allow-paid)
  pnpm benchmark:score <run-id> [--references=${referencesPath}]
  pnpm benchmark:compare <baseline-run-id> <candidate-run-id> [--seed=7] [--reps=4000]
  pnpm benchmark:refs --only=r1,r2,r3,r4 [--set=core | --personas=a,b] [--samples=N]
                      [--concurrency=4] [--max-cost=5] (--dry-run | --allow-paid)`

function parseOptions() {
  return parseArgs({
    allowPositionals: true,
    allowNegative: true,
    options: {
      set: { type: 'string' },
      personas: { type: 'string' },
      styles: { type: 'string' },
      repeats: { type: 'string' },
      'max-answers': { type: 'string' },
      'continue-after-result': { type: 'boolean' },
      inspect: { type: 'boolean' },
      concurrency: { type: 'string', default: '4' },
      'max-cost': { type: 'string', default: '5' },
      id: { type: 'string' },
      resume: { type: 'string' },
      references: { type: 'string', default: referencesPath },
      only: { type: 'string' },
      samples: { type: 'string' },
      seed: { type: 'string', default: '7' },
      reps: { type: 'string', default: '4000' },
      'dry-run': { type: 'boolean', default: false },
      'allow-paid': { type: 'boolean', default: false }
    }
  })
}

const { values, positionals } = (() => {
  try {
    return parseOptions()
  } catch (err) {
    console.error(
      `${err instanceof Error ? err.message : 'Invalid options'}\n\n${usage}`
    )
    process.exit(1)
  }
})()

function integer(
  name: string,
  value: string | undefined,
  min: number,
  max: number
) {
  if (value === undefined) return undefined
  const n = Number(value)
  if (!Number.isInteger(n) || n < min || n > max)
    throw new Error(`--${name} must be an integer from ${min} to ${max}`)
  return n
}
const list = (value: string | undefined) =>
  value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean)
const money = (usd: number) => `$${usd.toFixed(2)}`

// Paid work needs an explicit flag, both credentials and a bounded budget.
function paidSetup() {
  if (values['dry-run'] && values['allow-paid'])
    throw new Error('Choose --dry-run or --allow-paid')
  const maxCost = Number(values['max-cost'])
  if (!Number.isFinite(maxCost) || maxCost <= 0 || maxCost > 20)
    throw new Error('--max-cost must be greater than 0 and at most $20')
  return {
    maxCost,
    concurrency: integer('concurrency', values.concurrency, 1, 8)!,
    paid: values['allow-paid']
  }
}
function requireCredentials(openai = true) {
  const missing = [
    ...(process.env.TYPESAFE_API_KEY?.trim() ? [] : ['TYPESAFE_API_KEY']),
    ...(!openai || process.env.OPENAI_API_KEY?.trim() ? [] : ['OPENAI_API_KEY'])
  ]
  if (missing.length)
    throw new Error(
      `Missing ${missing.join(' and ')}. TYPESAFE_API_KEY comes from .env.development.local; OPENAI_API_KEY from your shell environment.`
    )
}

function describePlan(plan: RunPlan, maxCost: number) {
  const counts = new Map<string, number>()
  for (const job of plan.jobs) {
    const key = `${job.group}/${job.style}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const estimate = estimateRunCost(plan.jobs, plan)
  const store = loadReferences()
  const personas = [...new Set(plan.jobs.map((job) => job.persona))]
  const missing = personas.filter(
    (id) => !store.personas[id]?.r2 || !store.personas[id]?.r3
  )
  const stale = personas.filter((id) =>
    (['r2', 'r3'] as const).some(
      (kind) =>
        store.personas[id]?.[kind] &&
        store.personas[id][kind].briefHash !== briefHash(findPersona(id))
    )
  )
  console.log(
    [
      `Run ${plan.id}: set "${plan.set}" (${plan.personaSets}), ${plan.jobs.length} interview${plan.jobs.length === 1 ? '' : 's'}`,
      `  ${[...counts].map(([key, n]) => `${key} ${n}`).join(', ')}`,
      `  Up to ${plan.maxAnswers} accepted answers each; ${plan.continueAfterResult ? 'continues after automatic results' : 'stops at the automatic result'}; ${plan.inspect ? 'records the result available after every answer' : 'no inspection projections'}`,
      `  Algorithm ${plan.versions.assessment}, content ${plan.versions.content}, Jev ${plan.versions.model}, participant ${plan.participantModel}; commit ${plan.git.commit?.slice(0, 8) ?? 'unknown'}${plan.git.dirty ? ' (dirty tree)' : ''}`,
      `  Estimated ${money(estimate.typicalUsd)} (about ${estimate.typicalAnswers} answers per interview), at most ${money(estimate.maximumUsd)} if every interview uses all ${plan.maxAnswers}; cap ${money(maxCost)}${estimate.typicalUsd > maxCost ? ' — raise --max-cost to finish, or resume later' : ''}`,
      ...(missing.length
        ? [
            `  No R2/R3 reference (scored without accuracy): ${missing.join(', ')}`
          ]
        : []),
      ...(stale.length
        ? [`  References built from an older brief: ${stale.join(', ')}`]
        : [])
    ].join('\n')
  )
}

async function run() {
  const { maxCost, concurrency, paid } = paidSetup()
  let plan: RunPlan
  if (values.resume) {
    const selection = [
      'set',
      'personas',
      'styles',
      'repeats',
      'max-answers',
      'continue-after-result',
      'inspect',
      'id'
    ] as const
    if (selection.some((name) => values[name] !== undefined))
      throw new Error(
        '--resume continues the saved plan; drop selection options'
      )
    plan = readPlan(values.resume)
  } else {
    const styles = list(values.styles)
    if (styles?.some((style) => !answerStyles.includes(style as AnswerStyle)))
      throw new Error(`--styles must be among ${answerStyles.join(', ')}`)
    plan = planRun(
      loadPersonaSets(),
      {
        set: values.set ?? 'core',
        personas: list(values.personas),
        styles: styles as AnswerStyle[] | undefined,
        repeats: integer('repeats', values.repeats, 1, 5),
        maxAnswers: integer('max-answers', values['max-answers'], 1, 12) ?? 12,
        continueAfterResult: values['continue-after-result'] ?? false,
        inspect: values.inspect ?? true
      },
      values.id
    )
    if (existsSync(path.join(runDirectory(plan.id), 'plan.json')))
      throw new Error(`Run ${plan.id} exists; use --resume=${plan.id}`)
  }
  const done = new Set(
    readJobRecords(plan.id)
      .filter((record) => record.status === 'complete')
      .map((record) => record.job.key)
  )
  if (done.size === plan.jobs.length) {
    console.log(
      `Run ${plan.id} is complete. Score it with: pnpm benchmark:score ${plan.id}`
    )
    return
  }
  if (values.resume) {
    const current = runHashes([...new Set(plan.jobs.map((job) => job.persona))])
    const changed = Object.entries(current).filter(
      ([key, hash]) => plan.hashes[key as keyof typeof current] !== hash
    )
    if (changed.length)
      throw new Error(
        `The ${changed.map(([key]) => key).join(', ')} changed since this run started; start a new run to compare them.`
      )
  }
  describePlan(
    { ...plan, jobs: plan.jobs.filter((job) => !done.has(job.key)) },
    maxCost
  )
  if (!paid) {
    if (!values['dry-run'])
      throw new Error(
        'Runs make paid calls: pass --allow-paid, or --dry-run to preview'
      )
    console.log('Dry run: no network calls made and nothing written.')
    return
  }
  requireCredentials()
  const outcome = await executeRun(plan, { maxCost, concurrency })
  console.log(
    `Run ${plan.id}: ${outcome.complete} of ${plan.jobs.length} interviews complete, ${outcome.failed} failed, ${outcome.notRun} not run; spent about ${money(outcome.spentUsd)} of ${money(outcome.maximumUsd)}.${outcome.complete < plan.jobs.length ? ` Continue with --resume=${plan.id}.` : ''} Score with: pnpm benchmark:score ${plan.id}`
  )
  if (outcome.failed || outcome.budgetReached) process.exitCode = 1
}

async function refs() {
  const { maxCost, concurrency, paid } = paidSetup()
  const kinds = list(values.only) as ReferenceKind[] | undefined
  if (!kinds?.length || kinds.some((kind) => !referenceKinds.includes(kind)))
    throw new Error(
      `--only must list references among ${referenceKinds.join(', ')}`
    )
  if (values.set && values.personas)
    throw new Error('Choose --set or --personas')
  const ids = values.personas
    ? list(values.personas)!.map((id) => findPersona(id).id)
    : [
        ...new Set(
          expandJobs(loadPersonaSets(), values.set ?? 'core').map(
            (job) => job.persona
          )
        )
      ]
  // The audit's sample counts: engine ×3, judge ×2, self-placement ×3.
  const count = integer('samples', values.samples, 1, 5)
  const samples = { r1: count ?? 3, r2: count ?? 2, r3: count ?? 3 }
  const selected = Object.fromEntries(
    kinds.filter((kind) => kind !== 'r4').map((kind) => [kind, samples[kind]])
  )
  const estimate = estimateReferenceCost(ids.length, selected)
  console.log(
    `Rebuild ${kinds.join(', ')} for ${ids.length} personas (${
      Object.entries(selected)
        .map(([k, n]) => `${k} ×${n}`)
        .join(', ') || 'public statements only'
    }); estimated ${money(estimate)}, cap ${money(maxCost)}.`
  )
  if (values['dry-run']) {
    console.log('Dry run: no network calls made and nothing written.')
    return
  }
  // R4 copies verified public statements from the catalog and costs nothing.
  const needsNetwork = kinds.some((kind) => kind !== 'r4')
  if (needsNetwork && !paid)
    throw new Error(
      'Rebuilding R1–R3 makes paid calls: pass --allow-paid, or --dry-run'
    )
  if (needsNetwork)
    requireCredentials(kinds.some((k) => k === 'r2' || k === 'r3'))
  const ledger = path.join(
    runsDirectory,
    'refs',
    `${new Date().toISOString().replace(/[:.]/g, '-')}.jsonl`
  )
  mkdirSync(path.dirname(ledger), { recursive: true })
  const meter = createMeter(ledger, maxCost)
  const { store, failed } = await buildReferences({
    store: loadReferences(values.references),
    ids,
    kinds,
    samples,
    meter,
    bundle: loadBundle(),
    concurrency,
    onPersona: (id, error) =>
      console.log(
        `${id}: ${error ? `kept previous references (${failureMessage(error)})` : 'rebuilt'}; spent about ${money(meter.spent())}`
      )
  })
  saveReferences(store, values.references)
  console.log(
    `Saved ${values.references}; spent about ${money(meter.spent())}. Review and commit its diff.${failed.length ? ` Not rebuilt: ${failed.join(', ')}.` : ''}`
  )
  if (failed.length) process.exitCode = 1
}

function save(
  directory: string,
  name: string,
  json: unknown,
  markdown: string
) {
  writeFileSync(
    path.join(directory, `${name}.json`),
    `${JSON.stringify(json, null, 2)}\n`
  )
  writeFileSync(path.join(directory, `${name}.md`), markdown)
  console.log(markdown)
  console.log(`Saved ${path.join(directory, name)}.{json,md}`)
}

function score() {
  const [id] = positionals.slice(1)
  if (!id || positionals.length !== 2) throw new Error(usage)
  const plan = readPlan(id)
  const result = scoreRun(
    plan,
    readJobRecords(id),
    loadReferences(values.references)
  )
  save(runDirectory(id), 'score', result, renderScore(result))
}

function compare() {
  const [a, b] = positionals.slice(1)
  if (!a || !b || positionals.length !== 3) throw new Error(usage)
  readPlan(a)
  readPlan(b)
  const comparison = compareRuns(
    readJobRecords(a),
    readJobRecords(b),
    loadReferences(values.references),
    {
      seed: integer('seed', values.seed, 0, 2 ** 31),
      reps: integer('reps', values.reps, 100, 100_000)
    }
  )
  save(
    runDirectory(b),
    `compare-${a}`,
    comparison,
    renderComparison(comparison, { a, b })
  )
}

const commands: Record<string, () => unknown> = { run, refs, score, compare }
const command = commands[positionals[0] ?? '']
if (!command) {
  console.error(usage)
  process.exitCode = 1
} else {
  Promise.resolve()
    .then(command)
    .catch((err: unknown) => {
      // Messages are local; provider failures are already categorized.
      console.error(err instanceof Error ? err.message : 'Benchmark failed')
      process.exitCode = 1
    })
}
