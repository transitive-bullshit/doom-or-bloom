import { suiteSchema, type JourneySuite } from './schema'

/** Keep unselected interviews byte-for-byte and retain each batch's provenance. */
export function mergeJourneySuites(
  previous: JourneySuite | null,
  incoming: JourneySuite
): JourneySuite {
  if (!previous) return incoming
  const replaced = new Set(
    incoming.journeys.map((journey) => journey.personaId)
  )
  const provenance = (suite: JourneySuite) =>
    suite.sourceRuns ?? [
      {
        runId: suite.id,
        createdAt: suite.createdAt,
        inputHash: suite.inputHash,
        engineHash: suite.engineHash,
        contentHash: suite.contentHash,
        personaIds: suite.journeys.map((journey) => journey.personaId)
      }
    ]
  return suiteSchema.parse({
    ...incoming,
    // Cost and request budget describe only the incoming paid batch.
    journeys: [
      ...previous.journeys.filter(
        (journey) => !replaced.has(journey.personaId)
      ),
      ...incoming.journeys
    ],
    sourceRuns: [
      ...provenance(previous)
        .map((run) => ({
          ...run,
          personaIds: run.personaIds.filter((id) => !replaced.has(id))
        }))
        .filter((run) => run.personaIds.length),
      ...provenance(incoming)
    ]
  })
}
