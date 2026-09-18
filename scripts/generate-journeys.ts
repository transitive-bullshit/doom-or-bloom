import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { runJourneySuite, withoutTraces } from '../lib/journeys/runner'
import { projectJourneyStore } from '../lib/journeys/store'
import { compareJourneys, suiteSchema } from '../lib/journeys/schema'
import { personas } from '../lib/journeys/catalog'
import { runLiveJourneys } from '../lib/journeys/live'

const args = process.argv.slice(2)
const allowed =
  /^(--persona=[a-z][a-z0-9-]+|--turns=[1-6]|--max-requests=\d+|--max-cost=\d+(?:\.\d+)?|--live|--allow-paid|--check|--write-baseline|--exercise-results)$/
if (
  args.some((arg) => !allowed.test(arg)) ||
  new Set(args.map((a) => a.split('=')[0])).size !== args.length
)
  throw new Error('Unknown or repeated journey option')
const personaId = args.find((a) => a.startsWith('--persona='))?.split('=')[1]
const turns = Number(
  args.find((a) => a.startsWith('--turns='))?.split('=')[1] ?? 5
)
const live = args.includes('--live')
const exerciseResults = args.includes('--exercise-results')
if (exerciseResults && (!live || turns < 3))
  throw new Error(
    'Result exercises require a live run with at least three replies'
  )
if (personaId && !personas.some((p) => p.id === personaId))
  throw new Error('Unknown persona')
if (live && (args.includes('--write-baseline') || args.includes('--check')))
  throw new Error('Live runs cannot overwrite/check the synthetic baseline')
if (
  !live &&
  args.some(
    (a) =>
      a === '--allow-paid' ||
      a.startsWith('--max-requests=') ||
      a.startsWith('--max-cost=')
  )
)
  throw new Error('Paid flags require --live')
if (
  args.includes('--write-baseline') &&
  (personaId || turns !== 5 || args.includes('--check'))
)
  throw new Error(
    'The baseline requires all ten personas, five turns and a separate reviewable update'
  )

async function main() {
  if (live) {
    if (!args.includes('--allow-paid'))
      throw new Error('Live runs require --allow-paid')
    if (existsSync('.env.local')) process.loadEnvFile('.env.local')
    const maxRequestsArg = args.find((a) => a.startsWith('--max-requests='))
    const maxCostArg = args.find((a) => a.startsWith('--max-cost='))
    const suite = await runLiveJourneys({
      personaId,
      turns,
      exerciseResults,
      maxRequests: maxRequestsArg
        ? Number(maxRequestsArg.split('=')[1])
        : undefined,
      maxCost: maxCostArg ? Number(maxCostArg.split('=')[1]) : undefined,
      onJourney: (j) =>
        console.log(
          `${j.personaId}: ${j.accepted} accepted; ${Math.round(j.finalReadiness.value)}% readiness; ${j.result ? 'result' : 'no result'}; ${j.stopped}`
        )
    })
    console.log(
      `Saved live Jev + OpenAI journey run ${suite.id}; ${suite.journeys.length} personas`
    )
    console.log(
      JSON.stringify({ requestBudget: suite.requestBudget, cost: suite.cost })
    )
    if (suite.journeys.some((j) => j.error)) process.exitCode = 1
    return
  }
  const suite = await runJourneySuite({
    id: `${Date.now()}-${randomUUID()}`,
    personaId,
    turns
  })
  await projectJourneyStore().save(suite)
  console.log(
    `Saved ${suite.mode} journey run ${suite.id}; ${suite.journeys.length} personas`
  )
  for (const j of suite.journeys)
    console.log(
      `${j.personaId}: ${j.accepted} accepted; ${Math.round(j.finalReadiness.value)}% readiness; ${j.result ? 'result' : 'no result'}; ${j.stopped}`
    )
  if (suite.journeys.some((j) => j.error)) {
    process.exitCode = 1
    return
  }
  if (args.includes('--write-baseline')) {
    await writeFile(
      'eval/development/persona-baseline.json',
      JSON.stringify({ ...withoutTraces(suite), id: 'baseline' }, null, 2) +
        '\n'
    )
    console.log(
      'Updated the synthetic baseline. Review and commit its diff; this is not semantic validation.'
    )
  }
  if (args.includes('--check')) {
    const baseline = suiteSchema.parse(
      JSON.parse(
        await readFile('eval/development/persona-baseline.json', 'utf8')
      )
    )
    if (baseline.turns !== turns)
      throw new Error('Use the baseline turn count for --check')
    for (const journey of suite.journeys) {
      const before = baseline.journeys.find(
        (j) => j.personaId === journey.personaId
      )
      const changed = before
        ? compareJourneys(before, journey)
        : ['missing baseline']
      if (changed.length) {
        console.log(`${journey.personaId}: changed ${changed.join(', ')}`)
        process.exitCode = 1
      }
    }
    if (!process.exitCode)
      console.log(
        'All selected journey observations match the synthetic baseline.'
      )
  }
}
main().catch(() => {
  console.error(
    'Journey generation stopped. Check local script options, artifact validity or credentials. No transport bodies or environment values logged.'
  )
  process.exitCode = 1
})
