import { readFile, writeFile } from 'node:fs/promises'
import { loadBundle } from '../lib/content/loader'
import { suiteSchema } from '../lib/journeys/schema'

// Read-only review of observed journeys. Flags are inspection prompts, not
// semantic judgments or counterfactual estimates of better answers.
const suite = suiteSchema.parse(
  JSON.parse(
    await readFile('eval/development/live-persona-journeys.json', 'utf8')
  )
)
const bundle = loadBundle()
const usage = new Map<string, number>()
const journeys = suite.journeys.map((journey) => {
  const answers = journey.steps.filter((step) => step.disposition === 'usable')
  const style =
    journey.personaSnapshot && 'responseStyle' in journey.personaSnapshot
      ? (journey.personaSnapshot.responseStyle ?? 'conversational')
      : 'conversational'
  const answerWords = answers.map(
    (step) => step.answer?.trim().split(/\s+/).length ?? 0
  )
  const flags: Array<{ answer: number; reason: string }> = []
  if (style === 'detailed' && (answerWords[0] ?? 0) < 120)
    flags.push({
      answer: 1,
      reason:
        'Detailed persona gave a short opening: inspect simulation fidelity.'
    })
  if (style === 'brief')
    for (const [index, words] of answerWords.entries())
      if (words > 30)
        flags.push({
          answer: index + 1,
          reason: 'Brief persona became verbose: inspect simulation fidelity.'
        })
  for (const [index, step] of answers.entries()) {
    usage.set(step.prompt.promptId, (usage.get(step.prompt.promptId) ?? 0) + 1)
    const previous = answers[index - 1]
    const readinessGain = step.readiness.value - step.readinessBefore.value
    const mapMovement =
      previous?.result && step.result
        ? Math.max(
            ...(['horizontal', 'vertical'] as const).map((axis) =>
              Math.abs(
                (step.result![axis].value ?? 0.5) -
                  (previous.result![axis].value ?? 0.5)
              )
            )
          )
        : null
    if (
      index > 0 &&
      readinessGain < 1 &&
      mapMovement !== null &&
      mapMovement < 0.03
    )
      flags.push({
        answer: index + 1,
        reason:
          'Small readiness and map changes: inspect for repetition or valuable detail outside the map.'
      })
    if (!step.result)
      flags.push({
        answer: index + 1,
        reason: 'No per-answer interpretation recorded.'
      })
    if (step.prompt.variant === 'tension')
      flags.push({
        answer: index + 1,
        reason:
          'Source-quoted tension clarification: inspect whether the answer reconciles or preserves the conflict.'
      })
  }
  return {
    personaId: journey.personaId,
    accepted: journey.accepted,
    responseStyle: style,
    answerWords,
    words: answers.reduce(
      (sum, step) => sum + (step.answer?.trim().split(/\s+/).length ?? 0),
      0
    ),
    questions: answers.map((step) => step.prompt.promptId),
    stopped: journey.stopped,
    outlook: journey.result?.horizontal.value ?? null,
    reasoning: journey.result?.vertical.value ?? null,
    firstReadyAnswer: journey.firstReadyAnswer,
    supportedFacets: journey.components
      .filter(
        (component) =>
          [
            'capability_ceiling',
            'development_pace',
            'deployment_policy',
            'access_policy'
          ].includes(component.vector) &&
          component.claim &&
          component.value !== null &&
          (component.confidence ?? 0) >= 0.75
      )
      .map(({ vector, claim }) => ({ vector, claim })),
    flags,
    error: journey.error
  }
})
const report = {
  sourceSuite: suite.id,
  thresholds:
    'Review flags: readiness gain <1 percentage point and map coordinate movement <0.03. These are not information gain or significance estimates; read the answers and component changes.',
  accepted: journeys.reduce((sum, journey) => sum + journey.accepted, 0),
  usage: [...usage]
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({ id, count })),
  unusedQuestions: bundle.prompts
    .filter((prompt) => !usage.has(prompt.id))
    .map(({ id, text }) => ({ id, text })),
  journeys
}
await writeFile(
  'eval/runs/elicitation-review.json',
  JSON.stringify(report, null, 2) + '\n'
)
console.log(JSON.stringify(report, null, 2))
