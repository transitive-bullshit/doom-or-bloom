import { isDeepStrictEqual } from 'node:util'
import type { Result } from '@/lib/assessment/schema'
import type { Persona } from './catalog'
import type { Journey } from './schema'

/** Presentation override after assessment; external sources never enter Jev or routing. */
export function applyPublicPdoom(
  result: Result | null,
  statement: Persona['statedPdoom']
): Result | null {
  if (!result?.experiment || !statement) return result
  const original = result.experiment.pdoom
  if (original?.source === 'public-statement') return result
  return {
    ...result,
    experiment: {
      ...result.experiment,
      pdoom: {
        token: statement.token,
        bounds: statement.bounds,
        estimate: statement.estimate,
        source: 'public-statement',
        publicStatement: statement,
        assessmentEstimate: original
          ? {
              source: original.source,
              token: original.token,
              estimate: original.estimate,
              bounds: original.bounds
            }
          : null
      }
    }
  }
}

/**
 * A saved journey with a verified statement applied to its persona snapshot
 * and every result, as a live run applies it, without any inference. Answers,
 * scores and map coordinates are unchanged. Returns null when a result already
 * carries a different statement, which cannot be swapped back losslessly.
 */
export function restatePublicPdoom(
  journey: Journey,
  statement: NonNullable<Persona['statedPdoom']>
): Journey | null {
  const results = [
    journey.result,
    journey.finalAssessment?.result,
    ...journey.steps.map((step) => step.result)
  ]
  const conflicting = results.some(
    (result) =>
      result?.experiment?.pdoom?.source === 'public-statement' &&
      !isDeepStrictEqual(result.experiment.pdoom.publicStatement, statement)
  )
  if (conflicting) return null
  const snapshot = journey.personaSnapshot
  return {
    ...journey,
    personaSnapshot:
      snapshot && 'sources' in snapshot
        ? { ...snapshot, statedPdoom: statement }
        : snapshot,
    steps: journey.steps.map((step) =>
      step.result
        ? { ...step, result: applyPublicPdoom(step.result, statement)! }
        : step
    ),
    result: applyPublicPdoom(journey.result, statement),
    ...(journey.finalAssessment && {
      finalAssessment: {
        ...journey.finalAssessment,
        result: applyPublicPdoom(journey.finalAssessment.result, statement)
      }
    })
  }
}
