import { createLocalJourneyStore } from '../lib/journeys/local-store'
import { writeFile } from 'node:fs/promises'
import { loadBundle } from '../lib/content/loader'
import { suiteSchema } from '../lib/journeys/schema'
import { personas } from '../lib/journeys/catalog'
import { createOpenAIParticipant } from '../lib/journeys/participant'
import { liveJourneyBudget, meterJev } from '../lib/journeys/live-budget'
import { createLiveProvider } from '../lib/server/live-provider'
import { runAssessment } from '../lib/server/engine'
import { createAssessment, issuePrompt } from '../lib/assessment/state'
import { budgetedProvider, paidRequestBudget } from '../lib/evaluation/budget'

async function main() {
  const budget = liveJourneyBudget(2)
  const paid = budgetedProvider(
    meterJev(createLiveProvider('jev-1.13.0'), budget),
    paidRequestBudget(process.argv.slice(2))
  )
  const participant = createOpenAIParticipant({ budget, maxRequests: 4 })
  const suite = suiteSchema.parse(
    await createLocalJourneyStore(process.cwd()).latest()
  )
  const bundle = loadBundle()
  const observations = []
  for (const personaId of ['brief-pragmatist', 'labor-organizer']) {
    const persona = personas.find((item) => item.id === personaId)!
    const opening = suite.journeys
      .find((journey) => journey.personaId === personaId)!
      .steps.find((step) => step.disposition === 'usable')!
    const initial = await runAssessment(
      {
        assessment: createAssessment(`grounding-${personaId}`),
        requestId: 'opening',
        operation: { type: 'answer', text: opening.answer! },
        debug: true
      },
      paid.provider,
      bundle,
      true
    )
    const ranked = initial.debug!.decisions.find(
      (decision) => decision.action === 'routing priorities and tie-break by ID'
    )!.detail as Array<{ id: string }>
    for (const promptId of new Set([ranked[0]!.id, 'grounding.general'])) {
      const prompt = bundle.prompts.find((item) => item.id === promptId)!
      // Explicit experimental intervention. Not a normal routed journey and
      // never saved in the journey inspector or represented as its selection.
      const branch = structuredClone(initial.assessment)
      branch.prompts = branch.prompts.filter((issued) =>
        branch.answers.some((answer) => answer.promptInstanceId === issued.id)
      )
      const state = issuePrompt(branch, {
        promptId,
        text: prompt.text,
        family: prompt.family,
        variant: 'original',
        sourceEvidenceIds: []
      })
      const exchange = await participant.generate({
        persona,
        prompt: state.prompts.at(-1)!,
        history: branch.answers.map((answer) => ({
          question: answer.promptText,
          answer: answer.text
        })),
        recoveryGuidance: null
      })
      const result = await runAssessment(
        {
          assessment: state,
          requestId: `branch-${promptId}`,
          operation: { type: 'answer', text: exchange.response.text },
          debug: true
        },
        paid.provider,
        bundle,
        true
      )
      observations.push({
        personaId,
        arm:
          promptId === 'grounding.general'
            ? 'grounding intervention'
            : 'highest ranked question',
        prompt: prompt.text,
        answer: exchange.response.text,
        words: exchange.response.text.split(/\s+/).length,
        before: initial.assessment.result,
        after: result.assessment.result,
        trace: result.debug
      })
      console.log(
        JSON.stringify({
          personaId,
          prompt: prompt.text,
          answer: exchange.response.text
        })
      )
    }
  }
  await writeFile(
    'eval/runs/grounding-experiment.json',
    JSON.stringify(
      {
        sourceSuite: suite.id,
        cost: budget.report(),
        requestBudget: paid.report(),
        observations
      },
      null,
      2
    ) + '\n'
  )
}
void main().catch(() => {
  console.error(
    'Grounding experiment stopped; no provider bodies or credentials logged.'
  )
  process.exitCode = 1
})
