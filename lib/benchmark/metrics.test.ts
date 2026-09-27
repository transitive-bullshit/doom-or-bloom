import { expect, test } from 'vitest'
import {
  bootstrapCi,
  errorSummary,
  logit,
  mean,
  median,
  pdoomError,
  retest,
  seededRandom,
  within2x
} from './metrics'

test('log-odds are clamped so 0% and 100% stay finite and symmetric', () => {
  expect(logit(0.5)).toBe(0)
  expect(logit(0)).toBe(logit(0.005))
  expect(logit(1)).toBeCloseTo(-logit(0))
  expect(Number.isFinite(logit(1))).toBe(true)
})

test('P(doom) error is absolute log-odds and 0.7 is about a factor of two', () => {
  // A stated 20% shown as 12% is within ~2×; shown as 10% or 3.3% it is not.
  expect(pdoomError(0.12, 0.2)).toBeLessThanOrEqual(within2x)
  expect(pdoomError(0.1, 0.2)).toBeGreaterThan(within2x)
  expect(pdoomError(0.033, 0.2)).toBeCloseTo(1.99, 2)
  expect(pdoomError(0.2, 0.033)).toBe(pdoomError(0.033, 0.2))
  expect(pdoomError(null, 0.2)).toBeNull()
  expect(pdoomError(0.2, null)).toBeNull()
})

test('error summaries skip unplaced values', () => {
  expect(
    errorSummary([
      [0.3, 0.5],
      [0.9, 0.6],
      [null, 0.5],
      [0.4, null]
    ])
  ).toEqual({ n: 2, mae: expect.closeTo(0.25), bias: expect.closeTo(0.05) })
  expect(errorSummary([])).toEqual({ n: 0, mae: null, bias: null })
  expect(mean([1, null, 3])).toBe(2)
  expect(median([4, 1, null, 3])).toBe(3)
  expect(median([4, 1, 3, 2])).toBe(2.5)
  expect(median([])).toBeNull()
})

test('the seeded generator is reproducible and uniform on [0, 1)', () => {
  const a = seededRandom(7)
  const b = seededRandom(7)
  const draws = Array.from({ length: 1000 }, () => a())
  expect(draws).toEqual(Array.from({ length: 1000 }, () => b()))
  expect(draws.every((x) => x >= 0 && x < 1)).toBe(true)
  expect(mean(draws)).toBeCloseTo(0.5, 1)
  expect(seededRandom(8)()).not.toBe(seededRandom(7)())
})

test('bootstrap intervals are deterministic for a seed and bracket the mean', () => {
  const diffs = Array.from({ length: 60 }, (_, i) => ((i % 7) - 3) / 50 - 0.02)
  const ci = bootstrapCi(diffs)!
  expect(bootstrapCi(diffs)).toEqual(ci)
  expect(bootstrapCi(diffs, { seed: 8 })).not.toEqual(ci)
  expect(ci[0]).toBeLessThan(mean(diffs)!)
  expect(ci[1]).toBeGreaterThan(mean(diffs)!)
  expect(ci[1]).toBeLessThan(0.02)
  expect(bootstrapCi([0.1, 0.1, 0.1])).toEqual([
    expect.closeTo(0.1),
    expect.closeTo(0.1)
  ])
  expect(bootstrapCi([])).toBeNull()
})

test('retest variability pools within-person spread across repeated personas', () => {
  // Two personas, three retakes each: within-person SD is 0.05 and the
  // personas are far apart, so reliability is high.
  const result = retest([[0.2, 0.25, 0.3], [0.8, 0.85, 0.9], [0.5]])!
  expect(result.personas).toBe(2)
  expect(result.withinSd).toBeCloseTo(0.05)
  expect(result.maxRange).toBeCloseTo(0.1)
  expect(result.icc).toBeGreaterThan(0.95)
  expect(retest([[0.2, 0.3], [0.5]])).toBeNull()
})
