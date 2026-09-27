import 'server-only'
import { execFileSync } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from 'node:fs'
import path from 'node:path'
import pMap from 'p-map'
import { versions } from '@/lib/assessment/schema'
import { loadBundle } from '@/lib/content/loader'
import { journeyHashes } from '@/lib/journeys/runner'
import { failureMessage, isBudgetExhausted, runInterview } from './interview'
import type { JobRecord, Step } from './interview'
import { participantAnswer, participantTurnRequest } from './participant'
import { expandJobs, findPersona } from './personas'
import type { AnswerStyle, Job, PersonaSets } from './personas'
import { benchmarkJev, createMeter } from './providers'

export const runsDirectory = 'eval/runs/benchmark'
export function runDirectory(id: string) {
  if (!/^[a-z0-9][a-z0-9._-]{0,80}$/i.test(id))
    throw new Error('Run IDs use letters, digits, dot, dash and underscore')
  return path.join(runsDirectory, id)
}

export type RunOptions = {
  set: string
  personas?: string[]
  styles?: AnswerStyle[]
  repeats?: number
  maxAnswers: number
  continueAfterResult: boolean
  inspect: boolean
}

export type RunPlan = RunOptions & {
  id: string
  createdAt: string
  personaSets: string
  jobs: Job[]
  versions: typeof versions
  participantModel: string
  hashes: ReturnType<typeof runHashes>
  git: { commit: string | null; dirty: boolean | null }
}

function git(args: string[]) {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim()
  } catch {
    return null
  }
}

// The terse request carries the shared instructions plus the benchmark style.
const participantPrompt = (persona: string) =>
  participantTurnRequest({
    persona: findPersona(persona),
    style: 'terse',
    prompt: { id: 'plan', text: '' },
    history: [],
    recoveryGuidance: null
  })

/**
 * Engine, content, persona briefs and participant prompt (including the
 * benchmark's terse style). A run resumes only while these are unchanged.
 */
export function runHashes(personas: string[]) {
  const turn = participantPrompt(personas[0]!)
  return {
    ...journeyHashes(loadBundle(), personas.map(findPersona)),
    participantHash: createHash('sha256')
      .update(`${turn.model}\n${turn.instructions}`)
      .digest('hex')
  }
}

/** Everything that identifies a run: its interviews, engine and content. */
export function planRun(
  sets: PersonaSets,
  options: RunOptions,
  id = `${new Date().toISOString().replace(/[:.]/g, '-')}-${options.set}`
): RunPlan {
  const jobs = expandJobs(sets, options.set, options)
  const status = git(['status', '--porcelain'])
  return {
    ...options,
    id,
    createdAt: new Date().toISOString(),
    personaSets: sets.id,
    jobs,
    versions,
    participantModel: participantPrompt(jobs[0]!.persona).model,
    hashes: runHashes([...new Set(jobs.map((job) => job.persona))]),
    git: {
      commit: git(['rev-parse', 'HEAD']),
      dirty: status === null ? null : status !== ''
    }
  }
}

export function readPlan(id: string): RunPlan {
  const file = path.join(runDirectory(id), 'plan.json')
  if (!existsSync(file)) throw new Error(`No benchmark run ${id}`)
  return JSON.parse(readFileSync(file, 'utf8'))
}

export function readJobRecords(id: string): JobRecord[] {
  const directory = path.join(runDirectory(id), 'jobs')
  if (!existsSync(directory)) return []
  return readdirSync(directory)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => JSON.parse(readFileSync(path.join(directory, file), 'utf8')))
}

/**
 * Runs every interview of the plan that has not completed yet, so a run
 * resumes after a failure or a spent budget. Stops scheduling interviews once
 * the cost cap is reached.
 */
export async function executeRun(
  plan: RunPlan,
  {
    maxCost,
    concurrency,
    log = console.log
  }: { maxCost: number; concurrency: number; log?: (line: string) => void }
) {
  const directory = runDirectory(plan.id)
  const jobsDirectory = path.join(directory, 'jobs')
  mkdirSync(jobsDirectory, { recursive: true })
  const planFile = path.join(directory, 'plan.json')
  if (!existsSync(planFile))
    writeFileSync(planFile, `${JSON.stringify(plan, null, 2)}\n`)
  const meter = createMeter(path.join(directory, 'ledger.jsonl'), maxCost)
  const bundle = loadBundle()
  const done = new Set(
    readJobRecords(plan.id)
      .filter((record) => record.status === 'complete')
      .map((record) => record.job.key)
  )
  const pending = plan.jobs.filter((job) => !done.has(job.key))
  let stopped = false
  const outcome = { complete: done.size, failed: 0, notRun: 0 }
  await pMap(
    pending,
    async (job) => {
      if (stopped) {
        outcome.notRun++
        return
      }
      const startedAt = new Date().toISOString()
      const steps: Step[] = []
      let record: JobRecord
      try {
        const interview = await runInterview({
          id: randomUUID(),
          persona: findPersona(job.persona),
          style: job.style,
          bundle,
          provider: benchmarkJev(meter, job.key),
          answer: (turn) => participantAnswer(turn, meter, job.key),
          maxAnswers: plan.maxAnswers,
          continueAfterResult: plan.continueAfterResult,
          inspect: plan.inspect,
          onStep: (step) => steps.push(step)
        })
        record = {
          job,
          status: 'complete',
          startedAt,
          finishedAt: new Date().toISOString(),
          interview
        }
        outcome.complete++
      } catch (err) {
        if (isBudgetExhausted(err)) stopped = true
        record = {
          job,
          status: 'failed',
          error: failureMessage(err),
          startedAt,
          finishedAt: new Date().toISOString(),
          interview: {
            steps,
            firstReadyAt: null,
            autoStopAt: null,
            stopReason: 'operation failed'
          }
        }
        outcome.failed++
      }
      writeFileSync(
        path.join(jobsDirectory, `${job.key}.json`),
        `${JSON.stringify(record, null, 2)}\n`
      )
      const shown = record.interview.steps.findLast((step) => step.shown)?.shown
      log(
        `${job.key}: ${record.status}${record.error ? ` (${record.error})` : ''}; ${record.interview.steps.length} questions, ready at ${record.interview.firstReadyAt ?? '-'}, result at ${record.interview.autoStopAt ?? '-'}; x=${shown?.x?.toFixed(2) ?? '-'} y=${shown?.y?.toFixed(2) ?? '-'} P(doom)=${shown?.pdoomToken ?? '-'}; spent ≈$${meter.spent().toFixed(2)}`
      )
    },
    { concurrency }
  )
  return {
    ...outcome,
    budgetReached: stopped,
    spentUsd: meter.spent(),
    maximumUsd: meter.maximumUsd
  }
}
