import { randomUUID } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { runJourneySuite, withoutTraces } from '../lib/journeys/runner'
import { projectJourneyStore } from '../lib/journeys/store'
import { compareJourneys, suiteSchema } from '../lib/journeys/schema'
import { personas } from '../lib/journeys/catalog'
import { budgetedProvider, paidRequestBudget } from '../lib/evaluation/budget'
import { createLiveProvider } from '../lib/server/live-provider'
import { versions } from '../lib/assessment/schema'

const args = process.argv.slice(2)
const allowed =
  /^(--persona=[a-z][a-z0-9-]+|--turns=[1-6]|--max-requests=\d+|--live|--allow-paid|--check|--write-baseline)$/
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
if (personaId && !personas.some((p) => p.id === personaId))
  throw new Error('Unknown persona')
if (
  live &&
  (!personaId || args.includes('--write-baseline') || args.includes('--check'))
)
  throw new Error(
    'Live runs require one --persona and cannot overwrite/check the synthetic baseline'
  )
if (
  !live &&
  args.some((a) => a === '--allow-paid' || a.startsWith('--max-requests='))
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
  let paid: ReturnType<typeof budgetedProvider> | undefined
  if (live) {
    const maximum = paidRequestBudget(
      args.filter(
        (a) => a === '--allow-paid' || a.startsWith('--max-requests=')
      )
    )
    process.loadEnvFile('.env.local')
    if (!process.env.TYPESAFE_API_KEY?.trim())
      throw new Error('Missing local TYPESAFE_API_KEY')
    paid = budgetedProvider(createLiveProvider(versions.model), maximum)
  }
  const suite = await runJourneySuite({
    id: `${Date.now()}-${randomUUID()}`,
    personaId,
    turns,
    live: paid?.provider,
    budgetReport: paid?.report
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
  if (paid)
    console.log(
      `Paid request bound: ${paid.report().usedOrReserved}/${paid.report().maximum} used or reserved`
    )
}
main().catch(() => {
  console.error(
    'Journey generation stopped. Check local script options, artifact validity or credentials. No transport bodies or environment values logged.'
  )
  process.exitCode = 1
})
