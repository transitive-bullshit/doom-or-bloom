import { writeFile } from 'node:fs/promises'
import { createLiveProvider } from '../lib/server/live-provider'
import { budgetedProvider, paidRequestBudget } from '../lib/evaluation/budget'
import { mkdir } from 'node:fs/promises'

const maximum = paidRequestBudget(process.argv.slice(2))
const model = process.env.TYPESAFE_MODEL || 'jev-1.13.0'
const run = budgetedProvider(createLiveProvider(model), maximum)
const provider = run.provider
const started = performance.now()
try {
  const result = await provider.evaluate(
    {
      answer:
        'I expect AI to help science, but I am uncertain because deployment could outpace oversight.'
    },
    {
      outlook: {
        type: 'choice',
        instructions: 'What outlook is expressed in `answer`?',
        criteria: {
          positive: 'Only benefits',
          negative: 'Only harms',
          mixed: 'Benefits and concerns',
          unclear: 'No interpretable view'
        }
      },
      mechanism: {
        type: 'score',
        instructions: 'How much causal explanation is present in `answer`?',
        criteria: [
          'No mechanism offered',
          'A mechanism named but not developed',
          'A mechanism explained with a condition or dependency'
        ]
      },
      uncertainty: {
        type: 'noul',
        instructions: 'Does `answer` explicitly express uncertainty?'
      }
    }
  )
  const report = {
    date: new Date().toISOString(),
    requestedModel: model,
    returnedModel: result.model,
    elapsedMs: Math.round(performance.now() - started),
    usage: result.usage,
    attempts: result.attempts,
    requestBudget: run.report(),
    answers: result.answers
  }
  await mkdir('eval/runs', { recursive: true })
  await writeFile(
    `eval/runs/smoke-${Date.now()}.json`,
    JSON.stringify(report, null, 2) + '\n'
  )
  console.log(JSON.stringify(report, null, 2))
} catch {
  console.error('Live Jev smoke failed. No request body or credentials logged.')
  process.exitCode = 1
}
