import { expect, it } from 'vitest'
import {
  recenterPdoomBounds,
  sharpenInferredPdoom as sharpen
} from './pdoom-transform'

it('matches the selected curve and preserves its endpoints and crossover', () => {
  expect(sharpen(0)).toBe(0)
  expect(sharpen(1)).toBe(1)
  expect(sharpen(0.65)).toBeCloseTo(0.65)
  expect(sharpen(0.4332142857142857)).toBeCloseTo(0.2393, 4)
  expect(sharpen(0.888)).toBeCloseTo(0.9713, 3)
  for (let i = 1; i <= 1000; i++)
    expect(sharpen(i / 1000)).toBeGreaterThan(sharpen((i - 1) / 1000))
})

it('recenters the saved personal range instead of stretching its endpoints', () => {
  const mean = 0.45918367346938777
  const bounds = recenterPdoomBounds(mean, [0.15, 0.85], sharpen(mean))
  expect(bounds[0]).toBe(0)
  expect(bounds[1]).toBeCloseTo(0.6704462484117768)
})

it('preserves asymmetric offsets when unclipped and clips at the upper boundary', () => {
  const asymmetric = recenterPdoomBounds(0.5, [0.4, 0.7], 0.35)
  expect(asymmetric[0]).toBeCloseTo(0.25)
  expect(asymmetric[1]).toBeCloseTo(0.55)
  expect(recenterPdoomBounds(0.9, [0.7, 1], 0.98)[1]).toBe(1)
  expect(recenterPdoomBounds(0.65, [0.3, 0.9], 0.65)).toEqual([0.3, 0.9])
  expect(recenterPdoomBounds(0.4, [0.4, 0.4], 0.2)).toEqual([0.2, 0.2])
})
