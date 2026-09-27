import { expect, test } from 'vitest'
import { loadBundle } from '@/lib/content/loader'
import { createAssessment } from './state'
import { baseResult, emptyComponent } from './projections'
import {
  buildWorldviewExperiment,
  experimentCandidates
} from './worldview-experiment'
import { inferPdoom } from './pdoom'
import { pdoomRangeLabel, presentPdoom, presentResult } from './present-result'
import type { Result } from './schema'

function savedResult(): Result {
  const state = createAssessment('presented')
  const result = baseResult(state, [], loadBundle().rubric)
  const input = { completeParticipantEvidence: [], activeSupport: [] }
  result.experiment = buildWorldviewExperiment(
    input,
    experimentCandidates(input),
    {},
    state.evidenceRevision,
    'fixture-v1'
  )
  result.horizontal = {
    ...result.horizontal,
    value: 0.5,
    range: [0.5, 0.5]
  }
  result.experiment.transformation = {
    ...emptyComponent('transformation', 'Scale of transformation'),
    value: 1,
    range: [1, 1]
  }
  return result
}

test('saved sharpened P(doom) values are recomputed from their stored bands', () => {
  const bandProbabilities = { remote: 0.2, very_unlikely: 0.5, unlikely: 0.3 }
  const presented = presentPdoom({
    source: 'inferred',
    basis: 'direct',
    token: '≈2%',
    estimate: 0.02,
    bounds: [0.01, 0.04],
    adjustment: {
      method: 'shifted-sharpening-v3',
      rawEstimate: 0.09,
      rawBounds: [0.03, 0.2],
      bandProbabilities
    }
  })!
  const expected = inferPdoom(bandProbabilities)!
  expect(presented.estimate).toBeCloseTo(expected.estimate)
  expect(presented.bounds).toEqual(expected.bounds)
  expect(presented.adjustment?.method).toBe('logodds-v1')
  expect(presented.token).toBe(`≈${Math.round(expected.estimate * 100)}%`)
})

test('inferred values are headlined by their point estimate, and stated qualifiers keep their meaning', () => {
  // A range headline ("under 10%") read as a higher P(doom) than the point.
  const contextual = presentPdoom({
    source: 'inferred',
    basis: 'contextual',
    token: '≈3%',
    estimate: 0.03,
    bounds: [0.008, 0.1]
  })
  expect(contextual?.token).toBe('≈3%')
  const stated = presentPdoom({
    source: 'stated',
    token: 'less than 1%',
    bounds: [0.01, 0.01],
    answerId: 'a1',
    answerNumber: 1,
    text: 'less than 1%'
  })
  expect(stated?.bounds).toEqual([0, 0.01])
  expect(stated?.estimate).toBe(0.005)
  expect(pdoomRangeLabel([0.1, 0.3])).toBe('10–30%')
  expect(pdoomRangeLabel([0.5, 0.995])).toBe('over 50%')
})

test('a split reading is headlined as unclear rather than by a midpoint', () => {
  const split = presentPdoom({
    source: 'inferred',
    basis: 'direct',
    token: '≈38%',
    estimate: 0.38,
    bounds: [0, 1],
    adjustment: {
      method: 'shifted-sharpening-v3',
      rawEstimate: 0.52,
      rawBounds: [0.02, 0.99],
      bandProbabilities: {
        negligible: 0.1,
        very_unlikely: 0.21,
        near_certain: 0.18,
        virtually_certain: 0.14,
        almost_certain: 0.08
      }
    }
  })
  expect(split?.token).toBe('Unclear')
  expect(split?.bounds?.[0]).toBeLessThan(0.1)
  expect(split?.bounds?.[1]).toBeGreaterThan(0.9)
})

test('a wide range within the low end keeps its point estimate', () => {
  // An enthusiast whose reading spreads across the low bands has not read
  // "both ways"; only a range from unlikely to likely is Unclear.
  const low = presentPdoom({
    source: 'inferred',
    basis: 'direct',
    token: '<1%',
    estimate: 0.005,
    bounds: [0, 0.1],
    adjustment: {
      method: 'shifted-sharpening-v3',
      rawEstimate: 0.02,
      rawBounds: [0, 0.1],
      bandProbabilities: {
        virtually_impossible: 0.28,
        negligible: 0.32,
        very_unlikely: 0.34
      }
    }
  })
  expect(low?.bounds?.[1]).toBeLessThan(0.3)
  expect(low?.token).toBe('<1%')
})

test('public statements are shown exactly as recorded', () => {
  const statement = {
    source: 'public-statement' as const,
    token: '10–20%',
    bounds: [0.1, 0.2] as [number, number]
  }
  expect(presentPdoom(statement)).toBe(statement)
})

test('map ranges are never narrower than retest variation and presentation is idempotent', () => {
  const result = savedResult()
  const presented = presentResult(result)
  expect(presented.horizontal.range).toEqual([0.45, 0.55])
  expect(presented.experiment?.transformation.range).toEqual([0.95, 1])
  expect(result.horizontal.range).toEqual([0.5, 0.5])
  expect(presentResult(presented)).toEqual(presented)
  expect(presented.reason).toContain('place your outlook')
  expect(presented.reason).toContain('P(doom)')
})

test('an unplaced map explains what is missing instead of claiming a placement', () => {
  const result = savedResult()
  result.horizontal = { ...result.horizontal, value: null, range: [0, 1] }
  expect(presentResult(result).reason).toContain('don’t place you on the map')
  expect(presentResult({ ...result, capped: true }).reason).toContain(
    'question limit'
  )
})
