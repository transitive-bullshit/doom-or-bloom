import { randomUUID } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { runMechanicalSuite } from '../lib/journeys/mechanical/runner'
import { withoutTraces } from '../lib/journeys/runner'
import { projectJourneyStore } from '../lib/journeys/store'
import { compareJourneys, suiteSchema } from '../lib/journeys/schema'
import { mechanicalCases } from '../lib/journeys/mechanical/cases'

const args = process.argv.slice(2)
const allowed =
  /^(--persona=[a-z][a-z0-9-]+|--turns=[1-6]|--check|--write-baseline)$/
if (
  args.some((a) => !allowed.test(a)) ||
  new Set(args.map((a) => a.split('=')[0])).size !== args.length
)
  throw new Error(
    'Unknown or repeated mechanical-test option; this command never calls live models'
  )
const personaId = args.find((a) => a.startsWith('--persona='))?.split('=')[1]
const turns = Number(
  args.find((a) => a.startsWith('--turns='))?.split('=')[1] ?? 5
)
if (personaId && !mechanicalCases.some((c) => c.id === personaId))
  throw new Error('Unknown mechanical case')
if (
  args.includes('--write-baseline') &&
  (personaId || turns !== 5 || args.includes('--check'))
)
  throw new Error(
    'Mechanical baseline requires all cases, five turns and a separate reviewable update'
  )
async function main() {
  const suite = await runMechanicalSuite({
    id: `${Date.now()}-${randomUUID()}`,
    personaId,
    turns
  })
  await projectJourneyStore().save(suite)
  console.log(
    `Saved mechanical engine-test run ${suite.id}; ${suite.journeys.length} cases`
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
      'eval/development/mechanical-journey-baseline.json',
      JSON.stringify({ ...withoutTraces(suite), id: 'baseline' }, null, 2) +
        '\n'
    )
    console.log(
      'Updated the mechanical-test baseline. Review and commit its diff; this is not semantic validation.'
    )
  }
  if (args.includes('--check')) {
    const baseline = suiteSchema.parse(
      JSON.parse(
        await readFile(
          'eval/development/mechanical-journey-baseline.json',
          'utf8'
        )
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
        'All selected journey observations match the mechanical-test baseline.'
      )
  }
}
main().catch(() => {
  console.error(
    'Mechanical test generation stopped. Check script options or artifacts.'
  )
  process.exitCode = 1
})
