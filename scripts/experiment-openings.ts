import { readFile, writeFile } from 'node:fs/promises'
import { loadBundle } from '../lib/content/loader'
import { suiteSchema } from '../lib/journeys/schema'
import { createLiveProvider } from '../lib/server/live-provider'
import { runAssessment } from '../lib/server/engine'
import { createAssessment, currentPrompt } from '../lib/assessment/state'
import { budgetedProvider, paidRequestBudget } from '../lib/evaluation/budget'

// Replay actual generated opening answers through the real revised engine.
// No new participant answer or persona target judgment is supplied to Jev.
async function main() {
  const run = budgetedProvider(
    createLiveProvider('jev-1.13.0'),
    paidRequestBudget(
      process.argv.slice(2).filter((arg) => !arg.startsWith('--persona='))
    )
  )
  const suite = suiteSchema.parse(
    JSON.parse(
      await readFile('eval/development/live-persona-journeys.json', 'utf8')
    )
  )
  const bundle = loadBundle()
  const observations = []
  const selection = process.argv
    .find((arg) => arg.startsWith('--persona='))
    ?.slice('--persona='.length)
  for (const personaId of selection
    ? selection.split(',')
    : ['dogmatic-doomer', 'high-risk-accelerator', 'worried-novice']) {
    const opening = suite.journeys
      .find((j) => j.personaId === personaId)
      ?.steps.find((s) => s.disposition === 'usable')
    if (!opening?.answer) continue
    const response = await runAssessment(
      {
        requestId: `opening-${personaId}`,
        assessment: createAssessment(`opening-${personaId}`),
        operation: { type: 'answer', text: opening.answer },
        debug: true
      },
      run.provider,
      bundle,
      true
    )
    const interpretation = response.debug!.stages.find(
      (stage) => stage.name === 'A: interpret'
    )!
    const state = response.assessment
    const observation = {
      personaId,
      status: state.status,
      next: state.status === 'answering' ? currentPrompt(state).promptId : null,
      tensionPresent: interpretation.answers.tension_present,
      tensionLocation: interpretation.answers.tension,
      unresolved: state.unresolved,
      result: state.result,
      trace: response.debug
    }
    observations.push(observation)
    console.log(
      JSON.stringify({
        ...observation,
        trace: undefined,
        result: undefined,
        outlook: state.result?.horizontal,
        reasoning: state.result?.vertical.value,
        tensionLocation: undefined
      })
    )
  }
  await writeFile(
    'eval/runs/opening-experiment.json',
    JSON.stringify(
      {
        sourceSuite: suite.id,
        createdAt: new Date().toISOString(),
        requestBudget: run.report(),
        observations
      },
      null,
      2
    ) + '\n'
  )
}
void main().catch(() => {
  console.error(
    'Opening experiment stopped; inspect the request budget and last successful observation. Provider errors are omitted.'
  )
  process.exitCode = 1
})
