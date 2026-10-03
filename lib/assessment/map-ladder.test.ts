import { expect, test } from 'vitest'
import { facets } from './facets'
import { ladderPosition, mapLadderQuestions, mapPosition } from './map-ladder'
import type { ModelAnswer } from './schema'

const outlook = facets.find((facet) => facet.id === 'outlook_orientation')!
const questions = mapLadderQuestions('outlook', outlook.meaning, outlook.levels)

// Answers from a reader who places the view at `position` levels, with a
// shared lean toward "no" (in log-odds) that the mirrored questions cancel.
function answers(position: number, lean = 0) {
  const result: Record<string, ModelAnswer> = {}
  for (const id of Object.keys(questions)) {
    const [, , side, step] = id.split(':')
    const k = Number(step!.slice(1))
    const edge = step!.startsWith('b') ? k - 0.5 : k
    const distance = side === 'past' ? position - edge : edge - position
    result[id] = {
      type: 'noul',
      noul: 1 / (1 + Math.exp(-(4 * distance - lean)))
    }
  }
  return result
}

test('the ladder asks nine mirrored comparisons with each level text', () => {
  expect(Object.keys(questions)).toHaveLength(18)
  for (const level of outlook.levels)
    expect(JSON.stringify(questions)).toContain(level)
  expect(questions['map:outlook:past:b3']).toMatchObject({ type: 'noul' })
})

test('a view squarely at a level reads that level', () => {
  const exact = (level: number) => {
    const result: Record<string, ModelAnswer> = {}
    for (const id of Object.keys(questions)) {
      const [, , side, step] = id.split(':')
      const k = Number(step!.slice(1))
      const past = step!.startsWith('b') ? level >= k : level > k
      const noul = side === 'past' ? (past ? 1 : 0) : level < k ? 1 : 0
      result[id] = { type: 'noul', noul }
    }
    return result
  }
  for (const level of [0, 1, 2, 3, 4])
    expect(ladderPosition(exact(level), 'outlook')).toBeCloseTo(level / 4)
})

test('positions between levels keep their order and a shared lean cancels', () => {
  const read = (position: number, lean = 0) =>
    ladderPosition(answers(position, lean), 'outlook')!
  for (const lean of [0, 1.5]) {
    const values = [2.6, 2.8, 3, 3.2, 3.4].map((p) => read(p, lean))
    for (let i = 1; i < values.length; i++)
      expect(values[i]!).toBeGreaterThan(values[i - 1]!)
    for (const level of [1, 2, 3])
      expect(read(level, lean)).toBeCloseTo(level / 4)
  }
  // Asking only the forward questions would read the leaning reader lower.
  const forward = Object.entries(answers(3, 1.5)).filter(([id]) =>
    id.includes(':past:')
  )
  const forwardOnly =
    forward.reduce((sum, [, a]) => sum + (a.type === 'noul' ? a.noul : 0), 0) /
      8 -
    1 / 16
  expect(forwardOnly).toBeLessThan(0.7)
})

test('the ladder refines but never leaves the stated level’s neighbourhood', () => {
  expect(mapPosition({}, 'outlook', 0.75)).toBe(0.75)
  expect(mapPosition(answers(3.3), 'outlook', 0.75)).toBeGreaterThan(0.75)
  expect(mapPosition(answers(0), 'outlook', 0.75)).toBe(0.625)
  expect(mapPosition(answers(4), 'outlook', 0.5)).toBe(0.625)
})
