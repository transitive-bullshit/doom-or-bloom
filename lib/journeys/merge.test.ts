import { expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import { suiteSchema, type JourneySuite } from './schema'
import { mergeJourneySuites } from './merge'

const recorded: JourneySuite = JSON.parse(
  readFileSync('eval/development/live-persona-journeys.json', 'utf8')
)

test('scoped generation retains other answers and their original provenance', () => {
  const previous = suiteSchema.parse(recorded)
  const original = previous.journeys[0]!
  const incoming = {
    ...previous,
    id: '1790310000000-00000000-0000-4000-8000-000000000000',
    sourceRuns: undefined,
    journeys: [{ ...original, stopped: 'Refreshed source-grounded simulation' }]
  }
  const merged = mergeJourneySuites(previous, incoming)
  expect(merged.journeys).toHaveLength(previous.journeys.length)
  expect(
    merged.journeys.find((j) => j.personaId === original.personaId)
  ).toEqual(incoming.journeys[0])
  for (const journey of previous.journeys.slice(1)) {
    expect(
      merged.journeys.find((j) => j.personaId === journey.personaId)
    ).toEqual(journey)
  }
  expect(merged.sourceRuns!.flatMap((run) => run.personaIds).sort()).toEqual(
    merged.journeys.map((j) => j.personaId).sort()
  )
  expect(
    merged.sourceRuns!.find((run) =>
      run.personaIds.includes(original.personaId)
    )!.runId
  ).toBe(incoming.id)
})
