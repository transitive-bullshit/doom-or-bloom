import { expect, test } from 'vitest'
import { placementComparison, placementGap } from './self-placement'

test('self-placement comparisons describe the direction of each difference', () => {
  expect(placementComparison({ x: 0.5, y: 0.5 }, { x: 0.55, y: 0.45 })).toBe(
    'Close to where you placed yourself.'
  )
  expect(placementComparison({ x: 0.7, y: 0.5 }, { x: 0.3, y: 0.5 })).toBe(
    'Your answers read as more worried than you placed yourself. Both can be true: the dot reflects what you wrote, not a verdict.'
  )
  expect(placementComparison({ x: 0.5, y: 0.3 }, { x: 0.5, y: 0.8 })).toBe(
    'Your answers suggest you expect more change than you placed yourself. Both can be true: the dot reflects what you wrote, not a verdict.'
  )
  expect(placementComparison({ x: 0.2, y: 0.9 }, { x: 0.6, y: 0.5 })).toBe(
    'Your answers read as more hopeful than you placed yourself, and suggest you expect less change. Both can be true: the dot reflects what you wrote, not a verdict.'
  )
  expect(
    placementComparison({ x: 0.2, y: 0.9 }, { x: null, y: 0.5 })
  ).toContain('don’t place you')
})

test('placement gaps are coarse buckets', () => {
  expect(placementGap({ x: 0.5, y: 0.5 }, { x: 0.55, y: 0.55 })).toBe('close')
  expect(placementGap({ x: 0.5, y: 0.5 }, { x: 0.7, y: 0.5 })).toBe('moderate')
  expect(placementGap({ x: 0, y: 0 }, { x: 1, y: 1 })).toBe('far')
})
