import { expect, test } from 'vitest'
import {
  placementComparison,
  placementGap,
  placementQuestion
} from './self-placement'

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

test('a large placement difference offers one question about the larger gap', () => {
  // Differences up to the gap offer nothing, including exactly 0.25.
  expect(placementQuestion({ x: 0.5, y: 0.5 }, { x: 0.7, y: 0.3 })).toBeNull()
  expect(placementQuestion({ x: 0.75, y: 0.5 }, { x: 0.5, y: 0.5 })).toBeNull()
  const id = (guess: { x: number; y: number }, x: number, y: number) =>
    placementQuestion(guess, { x, y })?.id
  expect(id({ x: 0.8, y: 0.5 }, 0.4, 0.5)).toBe('placement.more-hopeful')
  expect(id({ x: 0.2, y: 0.5 }, 0.6, 0.5)).toBe('placement.more-worried')
  expect(id({ x: 0.5, y: 0.9 }, 0.5, 0.5)).toBe('placement.more-change')
  expect(id({ x: 0.5, y: 0.2 }, 0.45, 0.9)).toBe('placement.less-change')
  // When both axes differ, the larger difference is asked about.
  expect(id({ x: 0.9, y: 0.1 }, 0.5, 0.8)).toBe('placement.less-change')
  expect(placementQuestion({ x: 0.9, y: 0.1 }, { x: 0.5, y: 0.8 })?.text).toBe(
    'Your answers suggest bigger changes than you expect. What do you think will stay the same?'
  )
  // An unplaced result has nothing to compare.
  expect(placementQuestion({ x: 0.9, y: 0.9 }, { x: null, y: 0.2 })).toBeNull()
})
