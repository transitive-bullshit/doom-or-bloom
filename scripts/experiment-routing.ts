import { readFile, readdir, writeFile } from 'node:fs/promises'
import { noveltyPolicy } from '../lib/assessment/prompt-policy'
import { loadBundle } from '../lib/content/loader'
import { suiteSchema } from '../lib/journeys/schema'
import { createLiveProvider } from '../lib/server/live-provider'
import { createQuestions } from '../lib/server/questions'
import { budgetedProvider, paidRequestBudget } from '../lib/evaluation/budget'
import { followUpNoveltyThreshold } from '../lib/assessment/routing'

// Replay novelty judgments at recorded prefixes, without regenerating replies
// or replacing the current journey suite. This tests selection, not answer gain.
const maximum = paidRequestBudget(process.argv.slice(2))
const directories = (await readdir('eval/runs/journeys')).sort().reverse()
let suite
for (const directory of directories) {
  const candidate = suiteSchema.parse(
    JSON.parse(
      await readFile(`eval/runs/journeys/${directory}/suite.json`, 'utf8')
    )
  )
  if (candidate.mode === 'live') {
    suite = candidate
    break
  }
}
if (!suite)
  throw new Error('Generate a live suite with traces before replaying routing')
const bundle = loadBundle()
const { authoredQuestion } = createQuestions(bundle.questionTemplates)
const run = budgetedProvider(createLiveProvider(suite.versions.model), maximum)
const cases = [
  ['control-alarmist', 4],
  ['anti-doomer', 4],
  ['capability-skeptic', 1],
  ['labor-organizer', 4],
  ['dogmatic-doomer', 1],
  ['open-uncertainty', 2]
] as const
const observations = []
for (const [personaId, ordinal] of cases) {
  const step = suite.journeys
    .find((j) => j.personaId === personaId)
    ?.steps.find((s) => s.ordinal === ordinal)
  const route = step?.trace?.stages.find((stage) => stage.name === 'C: route')
  if (!step || !route) continue
  const questions = Object.fromEntries(
    step.rankings.map((candidate) => [
      `${candidate.id}:novelty`,
      authoredQuestion('route_novelty', { promptId: candidate.id })
    ])
  )
  const response = await run.provider.evaluate(
    { ...(route.state as Record<string, unknown>), noveltyPolicy },
    questions,
    undefined,
    maximum
  )
  const candidates = step.rankings.map((candidate) => {
    const answer = response.answers[`${candidate.id}:novelty`]
    return {
      id: candidate.id,
      priority: candidate.priority,
      novelty: answer?.type === 'noul' ? answer.noul : 0
    }
  })
  const eligible = candidates.filter(
    (c) => c.novelty >= followUpNoveltyThreshold && c.priority > 0
  )
  const observation = {
    personaId,
    afterAnswer: ordinal,
    previous: step.nextPrompt?.promptId,
    previousNovelty: candidates.find((c) => c.id === step.nextPrompt?.promptId)
      ?.novelty,
    proposed: eligible[0]?.id ?? 'show result',
    candidates
  }
  observations.push(observation)
  console.log(JSON.stringify({ ...observation, candidates: undefined }))
}
await writeFile(
  'eval/runs/routing-experiment.json',
  JSON.stringify(
    {
      sourceSuite: suite.id,
      createdAt: new Date().toISOString(),
      question: authoredQuestion('route_novelty', { promptId: 'candidate' }),
      threshold: followUpNoveltyThreshold,
      requestBudget: run.report(),
      observations
    },
    null,
    2
  ) + '\n'
)
