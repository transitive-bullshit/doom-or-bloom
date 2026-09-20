import { mkdir, readFile, writeFile, rename } from 'node:fs/promises'
import {
  experimentCandidates,
  experimentInputSchema,
  experimentQuestions,
  buildWorldviewExperiment,
  experimentVersion
} from '../lib/assessment/worldview-experiment'
import { worldviewExperimentSchema, versions } from '../lib/assessment/schema'
import { suiteSchema } from '../lib/journeys/schema'
import {
  experimentInputHash,
  experimentReplaySchema
} from '../lib/journeys/experiments'
import { budgetedProvider } from '../lib/evaluation/budget'
import { liveJourneyBudget, meterJev } from '../lib/journeys/live-budget'
import { createLiveProvider } from '../lib/server/live-provider'

const args = process.argv.slice(2)
if (!args.includes('--allow-paid'))
  throw new Error(
    'Pass --allow-paid to evaluate the saved journey snapshots with live Jev.'
  )
const maximum = Number(
  args.find((a) => a.startsWith('--max-requests='))?.split('=')[1] ?? 120
)
const maximumUsd = Number(
  args.find((a) => a.startsWith('--max-cost='))?.split('=')[1] ?? 0.5
)
const budget = liveJourneyBudget(maximumUsd)
const paid = budgetedProvider(
  meterJev(createLiveProvider(versions.model), budget),
  maximum,
  240
)
const suite = suiteSchema.parse(
  JSON.parse(
    await readFile('eval/development/live-persona-journeys.json', 'utf8')
  )
)
const file = 'eval/development/worldview-experiments.json'
const previous = await readFile(file, 'utf8')
  .then((text) => experimentReplaySchema.parse(JSON.parse(text)))
  .catch((err) => {
    if (err instanceof Error && 'code' in err && err.code === 'ENOENT')
      return null
    throw err
  })
const records = previous?.sourceRunId === suite.id ? previous.records : []
await mkdir('eval/runs/worldview-experiments', { recursive: true })
for (const journey of suite.journeys) {
  for (const step of journey.steps) {
    if (!step.result || !step.resultState) continue
    const input = experimentInputSchema.parse(step.resultState)
    const inputHash = experimentInputHash(input)
    if (
      records.some(
        (r) =>
          r.personaId === journey.personaId &&
          r.ordinal === step.ordinal &&
          r.inputHash === inputHash &&
          r.experiment.version === experimentVersion
      )
    )
      continue
    const candidates = experimentCandidates(input)
    const questions = experimentQuestions(candidates)
    const state = { ...input, experimentCandidates: candidates }
    const evaluation = await paid.provider.evaluate(
      state,
      questions,
      AbortSignal.timeout(60_000),
      4,
      true
    )
    const experiment = worldviewExperimentSchema.parse(
      buildWorldviewExperiment(
        input,
        candidates,
        evaluation.answers,
        step.result.evidenceRevision,
        evaluation.model
      )
    )
    records.push({
      personaId: journey.personaId,
      ordinal: step.ordinal,
      inputHash,
      experiment
    })
    await writeFile(
      `eval/runs/worldview-experiments/${journey.personaId}-${step.ordinal}.json`,
      JSON.stringify(
        { sourceRunId: suite.id, inputHash, state, questions, evaluation },
        null,
        2
      ) + '\n'
    )
    await writeFile(
      `${file}.tmp`,
      JSON.stringify(
        {
          version: experimentVersion,
          sourceRunId: suite.id,
          records,
          cost: budget.report(),
          requestBudget: paid.report()
        },
        null,
        2
      ) + '\n'
    )
    await rename(`${file}.tmp`, file)
    console.log(
      `${journey.personaId} answer ${step.ordinal}: influence=${experiment.influence.value?.toFixed(2) ?? '?'} transformation=${experiment.transformation.value?.toFixed(2) ?? '?'} P(doom)=${experiment.pdoom?.token ?? '?'} milestones=${experiment.milestones.length} hinges=${experiment.hinges.length}`
    )
  }
}
console.log(
  JSON.stringify({
    snapshots: records.length,
    cost: budget.report(),
    requestBudget: paid.report()
  })
)
