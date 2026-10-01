// A bounded live check that Jev accepts the interview-language context:
// one synthetic Spanish and one synthetic Japanese reply to the root
// question, then a result. Reports dispositions, request counts and the
// stated P(doom) it read; it tunes nothing.
//
//   pnpm eval:smoke:languages --allow-paid --max-requests=24
import { mkdir, writeFile } from 'node:fs/promises'
import { budgetedProvider, paidRequestBudget } from '../lib/evaluation/budget'
import { createLiveProvider } from '../lib/server/live-provider'
import { runAssessment } from '../lib/server/engine'
import { loadBundle } from '../lib/content/loader'
import { createAssessment } from '../lib/assessment/state'
import { versions, type Assessment } from '../lib/assessment/schema'
import { participantLanguageNote } from '../lib/assessment/participant-language'

const maximum = paidRequestBudget(process.argv.slice(2))
const samples = [
  {
    locale: 'es',
    text: 'Creo que la IA traerá avances enormes en medicina y ciencia, pero me preocupa que las empresas compitan demasiado rápido y pierdan el control. Diría que hay un 10% de probabilidad de una catástrofe irreversible.'
  },
  {
    locale: 'ja',
    text: 'AIは医療や教育を大きく変えると思いますが、仕事が減ることや悪用が心配です。人類が滅びる確率は5%くらいだと思います。'
  }
] as const
const bundle = loadBundle()
const report = []
for (const sample of samples) {
  const run = budgetedProvider(
    createLiveProvider(versions.model),
    Math.floor(maximum / samples.length)
  )
  const states: unknown[] = []
  const usage = { input_tokens: 0, output_tokens: 0 }
  const provider = {
    ...run.provider,
    evaluate: (async (state, ...rest) => {
      states.push(state)
      const result = await run.provider.evaluate(state, ...rest)
      usage.input_tokens += result.usage.input_tokens
      usage.output_tokens += result.usage.output_tokens
      return result
    }) as typeof run.provider.evaluate
  }
  const started = performance.now()
  let state: Assessment = createAssessment(`smoke-${sample.locale}`)
  const step = async (
    operation: Parameters<typeof runAssessment>[0]['operation']
  ) => {
    state = (
      await runAssessment(
        {
          requestId: `smoke-${sample.locale}-${state.revision}`,
          assessment: state,
          operation,
          debug: false
        },
        provider,
        bundle
      )
    ).assessment
  }
  const entry: Record<string, unknown> = { locale: sample.locale }
  try {
    await step({ type: 'answer', text: sample.text, locale: sample.locale })
    const attempt = state.attempts.at(-1)
    entry.disposition = attempt?.disposition
    entry.dispositionConfidence = attempt?.confidence
    entry.displayLocale = state.answers.at(-1)?.displayLocale ?? null
    if (attempt?.disposition === 'usable') {
      await step({ type: 'project' })
      const pdoom = state.result?.experiment?.pdoom
      entry.result = {
        outlook: state.result?.horizontal.value,
        transformation: state.result?.experiment?.transformation.value,
        pdoom: pdoom
          ? { source: pdoom.source, token: pdoom.token, bounds: pdoom.bounds }
          : null
      }
    }
    entry.ok = true
  } catch (err) {
    entry.ok = false
    entry.error = err instanceof Error ? err.message.slice(0, 200) : 'unknown'
  }
  entry.stages = states.length
  entry.everyStageHadLanguage = states.every(
    (input) =>
      (input as { participantLanguage?: string }).participantLanguage ===
      participantLanguageNote(sample.locale)
  )
  entry.requestBudget = run.report()
  entry.usage = usage
  // Jev bills input tokens at $0.042 per million (lib/journeys/live-budget.ts).
  entry.estimatedUsd = (usage.input_tokens * 0.042) / 1_000_000
  entry.elapsedMs = Math.round(performance.now() - started)
  report.push(entry)
}
await mkdir('eval/runs', { recursive: true })
const output = { date: new Date().toISOString(), model: versions.model, report }
await writeFile(
  `eval/runs/smoke-languages-${Date.now()}.json`,
  `${JSON.stringify(output, null, 2)}\n`
)
console.log(JSON.stringify(output, null, 2))
if (report.some((entry) => !entry.ok)) process.exitCode = 1
