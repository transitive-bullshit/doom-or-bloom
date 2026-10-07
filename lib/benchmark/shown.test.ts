import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { resultSchema } from '@/lib/assessment/schema'
import { personas } from '@/lib/journeys/catalog'
import { applyPublicPdoom } from '@/lib/journeys/public-pdoom'
import { shownPdoom, shownResult } from './shown'

test('Scott’s public range survives result serialization without a point estimate', () => {
  const recorded = JSON.parse(
    readFileSync('lib/journeys/__fixtures__/sample-journeys.json', 'utf8')
  )
  const result = resultSchema.parse(recorded.journeys[0].result)
  // The sample has an existing override; recover its engine estimate first.
  result.experiment!.pdoom =
    result.experiment!.pdoom!.assessmentEstimate ?? null
  const statement = personas.find(
    (persona) => persona.id === 'rationalist-safety-advocate'
  )!.statedPdoom
  const shown = shownResult(applyPublicPdoom(result, statement)!)
  expect(shown).toMatchObject({
    pdoom: null,
    pdoomBounds: [0.25, 0.3],
    pdoomToken: '25–30%',
    pdoomSource: 'public-statement'
  })
  expect(shownPdoom(shown)).toEqual([0.25, 0.3])
})
