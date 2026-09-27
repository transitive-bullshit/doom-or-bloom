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

test('contextual inferences show a range, and stated qualifiers keep their meaning', () => {
  const contextual = presentPdoom({
    source: 'inferred',
    basis: 'contextual',
    token: '≈3%',
    estimate: 0.03,
    bounds: [0.008, 0.1]
  })
  expect(contextual?.token).toBe('under 10%')
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
