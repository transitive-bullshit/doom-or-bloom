import { existsSync } from 'node:fs'
import { runLiveJourneys, resumeLiveJourney } from '../lib/journeys/live'
import { fixedUserPersona } from '../lib/journeys/fixed'
import { personas } from '../lib/journeys/catalog'

const args = process.argv.slice(2)
const allowed =
  /^(--resume=[0-9]{13}-[a-f0-9-]{36}|--persona=[a-z][a-z0-9-]+|--turns=[1-6]|--max-requests=\d+|--max-cost=\d+(?:\.\d+)?|--live|--allow-paid)$/
if (
  args.some((a) => !allowed.test(a)) ||
  new Set(args.map((a) => a.split('=')[0])).size !== args.length
)
  throw new Error(
    'Unknown or repeated live journey option; use journeys:mechanical for mocked engine tests'
  )
if (!args.includes('--allow-paid'))
  throw new Error('Live runs require --allow-paid')
const personaId = args.find((a) => a.startsWith('--persona='))?.split('=')[1]
const resumeId = args.find((a) => a.startsWith('--resume='))?.split('=')[1]
const turns = Number(
  args.find((a) => a.startsWith('--turns='))?.split('=')[1] ?? 5
)
if (
  personaId &&
  ![...personas, fixedUserPersona].some((p) => p.id === personaId)
)
  throw new Error('Unknown persona')
if (resumeId && (!personaId || args.some((a) => a.startsWith('--turns='))))
  throw new Error(
    'Resume requires --persona and retries exactly the saved operation'
  )
async function main() {
  if (existsSync('.env.local')) process.loadEnvFile('.env.local')
  const maxRequestsArg = args.find((a) => a.startsWith('--max-requests='))
  const maxCostArg = args.find((a) => a.startsWith('--max-cost='))
  if (resumeId) {
    const suite = await resumeLiveJourney({
      runId: resumeId,
      personaId: personaId!,
      maxRequests: maxRequestsArg
        ? Number(maxRequestsArg.split('=')[1])
        : undefined,
      maxCost: maxCostArg ? Number(maxCostArg.split('=')[1]) : undefined
    })
    console.log(
      `Saved resumed operation as ${suite.id}; ${suite.journeys[0]!.stopped}`
    )
    console.log(
      JSON.stringify({ requestBudget: suite.requestBudget, cost: suite.cost })
    )
    if (suite.journeys.some((j) => j.error)) process.exitCode = 1
    return
  }
  const suite = await runLiveJourneys({
    personaId,
    turns,
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
main().catch(() => {
  console.error(
    'Live journey generation stopped. Check local options, artifact validity or credentials. No transport bodies or environment values logged.'
  )
  process.exitCode = 1
})
