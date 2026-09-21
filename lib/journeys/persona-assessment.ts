import type { Journey } from './schema'

/** Public inspection data: exact Q&A and recorded projection inputs, without transport traces. */
export function personaAssessment(journey: Journey) {
  const finalStep = journey.steps.findLast(
    (step) =>
      step.result?.evidenceRevision === journey.result?.evidenceRevision &&
      step.resultState
  )
  return {
    answers: journey.steps
      .filter((step) => step.answer !== null)
      .map((step) => ({
        id: step.prompt.id,
        question: step.prompt.text,
        answer: step.answer!
      })),
    finalState: finalStep?.resultState ?? null
  }
}
export type PersonaAssessment = ReturnType<typeof personaAssessment>
