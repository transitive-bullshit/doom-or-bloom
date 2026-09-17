import { expect, test } from 'vitest'
import { composite, emptyComponent, quantile } from './projections'
import type { Component } from './schema'
function c(vector: string, value: number): Component {
  return { ...emptyComponent(vector, vector), value, range: [value, value] }
}
test('missing evidence widens the range without lowering observed reasoning', () => {
  const result = composite('y', 'y', [c('a', 0.9)], { a: 1, b: 1 })
  expect(result.value).toBe(0.9)
  expect(result.range).toEqual([0.45, 0.95])
  expect(composite('y', 'y', [], { a: 1 }).value).toBeNull()
})
test('horizontal separates harms and benefits and has no policy weight', () => {
  const result = composite(
    'x',
    'x',
    [c('benefits', 0.8), c('harms', 0.8), c('continuity', 0.5), c('policy', 1)],
    { benefits: 0.45, harms: 0.45, continuity: 0.1 },
    ['harms']
  )
  expect(result.value).toBeCloseTo(0.5)
})
test('categorical quantiles preserve a broad interpretation', () => {
  expect(quantile({ '0': 0.2, '1': 0.5, '2': 0.3 }, 0.1, 2)).toBe(0)
  expect(quantile({ '0': 0.2, '1': 0.5, '2': 0.3 }, 0.9, 2)).toBe(1)
})
