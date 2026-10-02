import { expect, test } from 'vitest'
import { applyPublicPdoom, restatePublicPdoom } from './public-pdoom'
import { personas } from './catalog'
import { resultSchema } from '@/lib/assessment/schema'
import { readFileSync } from 'node:fs'
import { journeySchema, type JourneySuite } from './schema'

const recorded: JourneySuite = JSON.parse(
  readFileSync('lib/journeys/__fixtures__/sample-journeys.json', 'utf8')
)

test('source overrides preserve assessment estimates and leave engine results untouched', () => {
  for (const persona of personas.filter((p) => p.statedPdoom)) {
    const result = resultSchema.parse(recorded.journeys[0]!.result)
    result.experiment!.pdoom =
      result.experiment!.pdoom?.assessmentEstimate ?? result.experiment!.pdoom
    const original = structuredClone(result)
    const updated = applyPublicPdoom(result, persona.statedPdoom)!
    expect(result).toEqual(original)
    expect(updated.experiment!.pdoom!.source).toBe('public-statement')
    expect(updated.experiment!.pdoom!.bounds).toEqual(
      persona.statedPdoom!.bounds
    )
    expect(updated.experiment!.pdoom!.publicStatement!.url).toBe(
      persona.statedPdoom!.url
    )
    const expected =
      original.experiment!.pdoom?.source === 'public-statement'
        ? original.experiment!.pdoom.assessmentEstimate?.estimate
        : original.experiment!.pdoom?.estimate
    expect(updated.experiment!.pdoom!.assessmentEstimate?.estimate).toBe(
      expected
    )
    expect(resultSchema.safeParse(updated).success).toBe(true)
    expect(applyPublicPdoom(updated, persona.statedPdoom)).toBe(updated)
  }
})

test('missing statement or result does not invent a projection', () => {
  const result = resultSchema.parse(recorded.journeys[0]!.result)
  expect(applyPublicPdoom(result, undefined)).toBe(result)
  expect(
    applyPublicPdoom(null, personas.find((p) => p.statedPdoom)!.statedPdoom)
  ).toBeNull()
})

test('restating a saved journey applies the statement everywhere without changing scores', () => {
  const journey = journeySchema.parse(recorded.journeys[1])
  const statement = personas.find((p) => p.id === 'anti-doomer')!.statedPdoom!
  const saved = structuredClone(journey)
  const restated = restatePublicPdoom(journey, statement)!
  expect(journey).toEqual(saved)
  expect(
    restated.personaSnapshot && 'statedPdoom' in restated.personaSnapshot
      ? restated.personaSnapshot.statedPdoom
      : null
  ).toEqual(statement)
  const pairs = [
    [journey.result, restated.result],
    ...journey.steps.map((step, i) => [step.result, restated.steps[i]!.result])
  ]
  expect(pairs.filter(([before]) => before?.experiment).length).toBeGreaterThan(
    1
  )
  for (const [before, after] of pairs) {
    if (!before?.experiment) continue
    expect(after!.experiment!.pdoom!.source).toBe('public-statement')
    expect(after!.experiment!.pdoom!.assessmentEstimate?.estimate).toBe(
      before.experiment.pdoom?.estimate
    )
    expect(after!.horizontal).toEqual(before.horizontal)
    expect(after!.experiment!.transformation).toEqual(
      before.experiment.transformation
    )
  }
  expect(restatePublicPdoom(restated, statement)).toEqual(restated)
  const other = personas.find((p) => p.id === 'frontier-pacer')!.statedPdoom!
  expect(restatePublicPdoom(restated, other)).toBeNull()
})
