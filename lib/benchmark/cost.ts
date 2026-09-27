import type { AnswerStyle, Job } from './personas'

// Mean cost per call in the 2026-09-27 audit ledger at the published rates in
// lib/journeys/live-budget.ts (cached input priced in full): a participant
// reply by answer style, Jev's interpret and route stages per answer, one
// result projection, and one sample of each rebuilt reference.
const observedUsd = {
  participant: {
    terse: 0.01,
    brief: 0.01,
    conversational: 0.012,
    detailed: 0.016
  } satisfies Record<AnswerStyle, number>,
  jevPerAnswer: 0.0027,
  projection: 0.001,
  reference: { r1: 0.004, r2: 0.009, r3: 0.008, r4: 0 }
}

// With a four-answer floor before automatic results, most interviews stop
// after four or five accepted answers.
const typicalAnswers = 5

/**
 * Estimated spend for a benchmark run: typical (interviews stop at their
 * automatic result) and maximum (every interview uses all its answers).
 * Rejected replies add a participant call each and are not included.
 */
export function estimateRunCost(
  jobs: Array<Pick<Job, 'style'>>,
  options: {
    maxAnswers: number
    continueAfterResult: boolean
    inspect: boolean
  }
) {
  const cost = (style: AnswerStyle, answers: number) =>
    answers * (observedUsd.participant[style] + observedUsd.jevPerAnswer) +
    (options.inspect ? answers : 1) * observedUsd.projection
  const typical = options.continueAfterResult
    ? options.maxAnswers
    : Math.min(options.maxAnswers, typicalAnswers)
  const sum = (answers: number) =>
    jobs.reduce((total, job) => total + cost(job.style, answers), 0)
  return {
    interviews: jobs.length,
    typicalAnswers: typical,
    typicalUsd: sum(typical),
    maximumUsd: sum(options.maxAnswers)
  }
}

/** Estimated spend for rebuilding references: samples per persona and kind. */
export function estimateReferenceCost(
  personas: number,
  samples: Partial<Record<keyof typeof observedUsd.reference, number>>
) {
  return Object.entries(samples).reduce(
    (total, [kind, count]) =>
      total +
      personas *
        (count ?? 0) *
        observedUsd.reference[kind as keyof typeof observedUsd.reference],
    0
  )
}
