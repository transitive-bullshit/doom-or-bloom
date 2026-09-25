import { expect, test } from 'vitest'
import { applyPublicPdoom } from './public-pdoom'
import { personas } from './catalog'
import { resultSchema } from '@/lib/assessment/schema'
import { readFileSync } from 'node:fs'
import type { JourneySuite } from './schema'

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
