import { mkdir, readFile, writeFile, rename } from 'node:fs/promises'
import {
  experimentCandidates,
  experimentInputSchema,
  experimentQuestions,
  experimentVerificationQuestions,
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
import { applyPublicPdoom } from '../lib/journeys/public-pdoom'

const args = process.argv.slice(2)
if (!args.includes('--allow-paid'))
  throw new Error(
    'Pass --allow-paid to evaluate the saved journey snapshots with live Jev.'
  )
const persona = args
  .find((a) => a.startsWith('--persona='))
  ?.slice('--persona='.length)
const refresh = args.includes('--refresh')
const publish = args.includes('--publish')
if (publish && persona)
  throw new Error('Publishing requires a complete replay, without --persona')
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
  1536
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
const records =
  previous?.sourceRunId === suite.id
    ? previous.records.filter((r) => r.experiment.version === experimentVersion)
    : []
await mkdir('eval/runs/worldview-experiments', { recursive: true })
if (persona && !suite.journeys.some((j) => j.personaId === persona))
  throw new Error(`Unknown persona: ${persona}`)
for (const journey of suite.journeys) {
  if (persona && journey.personaId !== persona) continue
  for (const step of journey.steps) {
    if (!step.result || !step.resultState) continue
    const input = experimentInputSchema.parse(step.resultState)
    const inputHash = experimentInputHash(input)
    if (
      !refresh &&
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
    const verificationQuestions = experimentVerificationQuestions(
      candidates,
      evaluation.answers
    )
    const verification = Object.keys(verificationQuestions).length
      ? await paid.provider.evaluate(
          state,
          verificationQuestions,
          AbortSignal.timeout(60_000),
          4,
          true
        )
      : null
    const inferredExperiment = worldviewExperimentSchema.parse(
      buildWorldviewExperiment(
        input,
        candidates,
        { ...evaluation.answers, ...verification?.answers },
        step.result.evidenceRevision,
        evaluation.model
      )
    )
    const snapshot = journey.personaSnapshot
    const statement =
      snapshot && 'statedPdoom' in snapshot ? snapshot.statedPdoom : undefined
    const experiment = applyPublicPdoom(
      { ...step.result, experiment: inferredExperiment },
      statement
    )!.experiment!
    const previousIndex = records.findIndex(
      (r) => r.personaId === journey.personaId && r.ordinal === step.ordinal
    )
    if (previousIndex >= 0) records.splice(previousIndex, 1)
    records.push({
      personaId: journey.personaId,
      ordinal: step.ordinal,
      inputHash,
      experiment
    })
    await writeFile(
      `eval/runs/worldview-experiments/${journey.personaId}-${step.ordinal}.json`,
      JSON.stringify(
        {
          sourceRunId: suite.id,
          inputHash,
          state,
          questions,
          evaluation,
          verificationQuestions,
          verification
        },
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
// Publish only after every saved snapshot has a matching current interpretation.
// Keep the original interview provenance; the replay file records new scoring usage.
if (publish) {
  for (const journey of suite.journeys) {
    for (const step of journey.steps) {
      if (!step.result) continue
      if (!step.resultState) throw new Error('Missing replay input state')
      const record = records.find(
        (record) =>
          record.personaId === journey.personaId &&
          record.ordinal === step.ordinal &&
          record.inputHash === experimentInputHash(step.resultState) &&
          record.experiment.version === experimentVersion &&
          record.experiment.evidenceRevision === step.result!.evidenceRevision
      )
      if (!record)
        throw new Error('Incomplete replay; bundle was not published')
      step.result.experiment = record.experiment
    }
    if (journey.result) {
      const final = journey.steps.findLast(
        (step) =>
          step.result?.evidenceRevision === journey.result!.evidenceRevision
      )?.result?.experiment
      if (!final)
        throw new Error('Missing final projection; bundle was not published')
      journey.result.experiment = final
    }
  }
  suiteSchema.parse(suite)
  const bundle = 'eval/development/live-persona-journeys.json'
  await writeFile(`${bundle}.tmp`, JSON.stringify(suite, null, 2) + '\n')
  await rename(`${bundle}.tmp`, bundle)
  console.log(`Published ${suite.journeys.length} refreshed persona journeys`)
}
console.log(
  JSON.stringify({
    snapshots: records.length,
    cost: budget.report(),
    requestBudget: paid.report()
  })
)
