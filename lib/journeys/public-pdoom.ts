import type { Result } from '@/lib/assessment/schema'
import type { Persona } from './catalog'

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
