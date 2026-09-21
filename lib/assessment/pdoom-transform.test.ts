import { expect, it } from 'vitest'
import { sharpenInferredPdoom as sharpen } from './pdoom-transform'

it('matches the selected curve and preserves its endpoints and crossover', () => {
  expect(sharpen(0)).toBe(0)
  expect(sharpen(1)).toBe(1)
  expect(sharpen(0.65)).toBeCloseTo(0.65)
  expect(sharpen(0.4332142857142857)).toBeCloseTo(0.2393, 4)
  expect(sharpen(0.888)).toBeCloseTo(0.9713, 3)
  for (let i = 1; i <= 1000; i++)
    expect(sharpen(i / 1000)).toBeGreaterThan(sharpen((i - 1) / 1000))
})
