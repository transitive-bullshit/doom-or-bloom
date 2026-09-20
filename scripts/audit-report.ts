import { readFile, writeFile } from 'node:fs/promises'
import { loadBundle } from '../lib/content/loader'
import { createAssessment } from '../lib/assessment/state'
import { assessmentSchema, epistemicIds } from '../lib/assessment/schema'
import { projectionInput } from '../lib/server/projection-input'
import { createLiveProvider } from '../lib/server/live-provider'
import { budgetedProvider, paidRequestBudget } from '../lib/evaluation/budget'

// Private input stays outside the repository. Compare fixed answers; never supply
// a participant's desired result, identity, or our review to the evaluator.
async function main() {
  const path = process.argv.find((arg) => arg.startsWith('--report='))?.slice(9)
  if (!path) throw new Error('Pass --report=/absolute/path/to/report.md')
  const paid = budgetedProvider(
    createLiveProvider('jev-1.13.0'),
    paidRequestBudget(
      process.argv.slice(2).filter((arg) => !arg.startsWith('--report='))
    )
  )
  const markdown = await readFile(path, 'utf8')
  const match = /```json\n([\s\S]*?)\n```/.exec(markdown)
  if (!match) throw new Error('Report JSON appendix missing')
  const appendix = JSON.parse(match[1]!)
  // Version-2 reports include complete snapshots; older reports only contain
  // the explicitly exported subset. Never spread report metadata into state.
  const recorded = appendix.diagnosticTrace?.operations?.findLast(
    (operation: { assessment?: unknown }) => operation.assessment
  )?.assessment
  const base =
    recorded ??
    createAssessment(appendix.assessmentId ?? 'private-report-audit')
  const source = Object.fromEntries(
    Object.keys(base).map((key) => [key, appendix[key] ?? base[key]])
  )
  const state = assessmentSchema.parse({
    ...source,
    evidenceRevision: appendix.result.evidenceRevision
  })
  const questions = Object.fromEntries(
    state.judgments
      .filter(
        (judgment) =>
          judgment.stage === 'project' &&
          (epistemicIds.some((id) => judgment.questionId === `${id}:score`) ||
            judgment.questionId === 'facet:overall_outlook')
      )
      .map((judgment) => [judgment.questionId, judgment.question])
  )
  const input = projectionInput(state, loadBundle())
  const observations = []
  for (const variant of [
    'as-recorded',
    'without-tentative-issue',
    'speech-aware'
  ] as const) {
    const experiment = {
      ...structuredClone(input),
      unresolved: state.unresolved.map(({ vector, kind }) => ({ vector, kind }))
    }
    if (variant !== 'as-recorded') experiment.unresolved = []
    if (variant === 'speech-aware')
      experiment.evidencePolicy +=
        ' These answers are spontaneous dictated speech. Judge the argument, not prose polish, repetition, disfluencies or obvious transcription errors in names. Preserve clear distinctions between near-term misuse and later loss of control, possible upside and expected risks, and hypothetical disconfirmation and the adopted forecast. Do not infer an incompatibility just from the participant discussing both sides of a conditional. Strong conviction can coexist with specified uncertainties. Apply the authored levels normally; length and nuance alone earn no bonus.'
    const evaluation = await paid.provider.evaluate(
      experiment,
      questions,
      AbortSignal.timeout(60_000)
    )
    const scores = Object.fromEntries(
      Object.entries(evaluation.answers)
        .filter(([, value]) => value.type === 'score')
        .map(([id, value]) => [
          id,
          value.type === 'score' ? value.score / 3 : null
        ])
    )
    const values = Object.values(scores).filter(
      (value): value is number => value !== null
    )
    const observation = {
      variant,
      scores,
      mean: values.reduce((sum, value) => sum + value, 0) / values.length,
      outlook: evaluation.answers['facet:overall_outlook'],
      answers: evaluation.answers
    }
    observations.push(observation)
    console.log(JSON.stringify({ ...observation, answers: undefined }))
  }
  await writeFile(
    '/tmp/doom-report-audit.json',
    JSON.stringify({ requestBudget: paid.report(), observations }, null, 2) +
      '\n'
  )
}
void main().catch(() => {
  console.error(
    'Report audit stopped; inspect input format and the bounded request allowance. No transport details logged.'
  )
  process.exitCode = 1
})
