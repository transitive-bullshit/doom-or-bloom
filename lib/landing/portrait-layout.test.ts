import { expect, it } from 'vitest'
import { separatePortraits } from './portrait-layout'

it('leaves boxes at or below 25% overlap in place', () => {
  const boxes = [
    { x: 100, y: 100, width: 40, height: 40 },
    { x: 130, y: 100, width: 40, height: 40 }
  ]
  expect(separatePortraits(boxes, 400, 300)).toEqual(boxes)
})

it('separates overlapping portraits in opposite directions without drifting on repeat layouts', () => {
  const boxes = [
    { x: 100, y: 100, width: 40, height: 40 },
    { x: 110, y: 100, width: 40, height: 40 }
  ]
  const result = separatePortraits(boxes, 400, 300)
  expect(result[0]!.x).toBeLessThan(100)
  expect(result[1]!.x).toBeGreaterThan(110)
  expect(result[0]!.x + result[1]!.x).toBe(210)
  expect(separatePortraits(boxes, 400, 300)).toEqual(result)
  expect(boxes[0]!.x).toBe(100)
})

it('bounds movement in dense coincident clusters to three six-pixel passes', () => {
  const boxes = Array.from({ length: 46 }, () => ({
    x: 100,
    y: 100,
    width: 40,
    height: 40
  }))
  const result = separatePortraits(boxes, 400, 300)
  expect(result.some((box) => box.x !== 100 || box.y !== 100)).toBe(true)
  for (const box of result)
    expect(Math.hypot(box.x - 100, box.y - 100)).toBeLessThanOrEqual(18.000001)
})

it('keeps at least half of each portrait inside each chart axis', () => {
  const result = separatePortraits(
    [
      { x: 0, y: 0, width: 30, height: 30 },
      { x: 0, y: 0, width: 30, height: 30 },
      { x: 300, y: 310, width: 30, height: 30 }
    ],
    300,
    310
  )
  for (const box of result) {
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x).toBeLessThanOrEqual(300)
    expect(box.y).toBeGreaterThanOrEqual(0)
    expect(box.y).toBeLessThanOrEqual(310)
  }
})

it('preserves ideal edge coordinates for isolated portraits', () => {
  const boxes = [
    { x: 0, y: 0, width: 40, height: 40 },
    { x: 400, y: 300, width: 40, height: 40 }
  ]
  expect(separatePortraits(boxes, 400, 300)).toEqual(boxes)
})
