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

it.each([
  [0.1, 0.08, 0.13, 0.003688145247419009, 0.010977216091135635],
  [0.9, 0.87, 0.92, 0.9629785969084423, 0.9873246135552913],
  [0.5, 0.49, 0.52, 0.3318, 0.3864]
])(
  'scales asymmetric spread using the local slope at %s',
  (p, low, high, expectedLow, expectedHigh) => {
    const bounds = recenterPdoomBounds(p, [low, high], sharpen(p))
    expect(bounds[0]).toBeCloseTo(expectedLow)
    expect(bounds[1]).toBeCloseTo(expectedHigh)
    const numericalSlope = (sharpen(p + 1e-6) - sharpen(p - 1e-6)) / 2e-6
    expect((bounds[1] - bounds[0]) / (high - low)).toBeCloseTo(numericalSlope)
    expect((sharpen(p) - bounds[0]) / (bounds[1] - sharpen(p))).toBeCloseTo(
      (p - low) / (high - p)
    )
  }
)

it('clips expanded ranges and handles endpoints and zero-width ranges', () => {
  expect(recenterPdoomBounds(0.5, [0, 1], sharpen(0.5))).toEqual([0, 1])
  expect(recenterPdoomBounds(0, [0, 0.1], 0)).toEqual([0, 0])
  expect(recenterPdoomBounds(1, [0.9, 1], 1)).toEqual([1, 1])
  expect(recenterPdoomBounds(0.4, [0.4, 0.4], sharpen(0.4))).toEqual([
    sharpen(0.4),
    sharpen(0.4)
  ])
})
