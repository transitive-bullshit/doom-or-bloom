import { expect, test } from 'vitest'
import { fitFontSize, pillWidth, textWidth } from './text-fit'

test('estimates wider text for longer and full-width labels', () => {
  expect(textWidth('Your view', 12)).toBeLessThan(
    textWidth('Visión simulada', 12)
  )
  expect(textWidth('你的观点', 12)).toBeGreaterThan(textWidth('abcd', 12))
})

test('keeps the original pill for short labels and grows it for longer ones', () => {
  expect(pillWidth('Your view', 12, { minimum: 92 })).toBe(92)
  expect(pillWidth('Visión simulada', 12, { minimum: 92 })).toBeGreaterThan(92)
})

test('shrinks a label only when it overflows', () => {
  expect(fitFontSize('worried', 12, 70)).toBe(12)
  const size = fitFontSize('preocupación', 20, 70)
  expect(size).toBeLessThan(20)
  expect(textWidth('preocupación', size)).toBeCloseTo(70)
})
