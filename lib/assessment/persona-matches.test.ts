import { expect, test } from 'vitest'
import {
  closestPersonas,
  worldviewValues,
  type PersonaComparison
} from './persona-matches'
import { emptyComponent } from './projections'
import { worldviewIds } from './schema'

const result = (values: Record<string, number | null>) => ({
  components: Object.entries(values).map(([id, value]) => ({
    ...emptyComponent(id, id),
    value
  }))
})
const persona = (
  id: string,
  values: PersonaComparison['values']
): PersonaComparison => ({
  id,
  name: id,
  slug: id,
  avatar: '/personas/test.jpg',
  values
})
const all = (value: number) =>
  Object.fromEntries(worldviewIds.map((id) => [id, value]))

test('ranks the closest three using dimensions beyond the map, excluding reasoning', () => {
  const user = result({ ...all(0.8), causal_clarity: 0 })
  const candidates = [
    persona('far', all(0)),
    persona('third', all(0.5)),
    persona('second', all(0.7)),
    persona('first', all(0.8))
  ]
  const matches = closestPersonas(user, candidates)
  expect(matches.map((match) => match.id)).toEqual(['first', 'second', 'third'])
  expect(matches[0]!.distance).toBe(0)
  expect(matches[0]!.dimensions).toBe(8)
  expect(worldviewValues(user)).not.toHaveProperty('causal_clarity')
  expect(candidates[0]!.id).toBe('far')
  // Identical benefit/risk/agency coordinates do not erase policy/control differences.
  const other = { ...all(0.8), technical_controllability: 0, action_posture: 0 }
  expect(
    closestPersonas(user, [
      persona('other', other),
      persona('same', all(0.8))
    ])[0]!.id
  ).toBe('same')
})

test('normalizes distance over the participant’s placed values and never treats missing values as neutral', () => {
  const user = result({
    capability_trajectory: 0,
    transition_dynamics: 0.5,
    beneficial_potential: 1,
    risk_landscape: null
  })
  const matches = closestPersonas(user, [
    persona('match', {
      capability_trajectory: 0,
      transition_dynamics: 0.5,
      beneficial_potential: 1,
      risk_landscape: 1
    })
  ])
  expect(matches[0]).toMatchObject({ distance: 0, dimensions: 3 })
  expect(
    closestPersonas(result({ beneficial_potential: 1 }), [
      persona('match', all(1))
    ])
  ).toEqual([])
  expect(
    closestPersonas(user, [persona('sparse', { beneficial_potential: 1 })])
  ).toEqual([])
  expect(closestPersonas(result({}), [])).toEqual([])
})

test('requires at least half of the participant’s dimensions and uses deterministic ties', () => {
  const partial = {
    capability_trajectory: 0.5,
    transition_dynamics: 0.5,
    beneficial_potential: 0.5
  }
  expect(
    closestPersonas(result(all(0.5)), [persona('sparse', partial)])
  ).toEqual([])
  expect(
    closestPersonas(result(all(0.5)), [
      persona('b', all(0.5)),
      persona('a', all(0.5))
    ]).map((match) => match.id)
  ).toEqual(['a', 'b'])
})

test('a persona cannot match by lacking the participant’s strongest position', () => {
  const user = result({ ...all(0.5), action_posture: 1 })
  const { action_posture: _unknown, ...silent } = all(0.5)
  const matches = closestPersonas(user, [
    persona('silent', silent),
    persona('accelerator', { ...all(0.6), action_posture: 1 })
  ])
  expect(matches.map((match) => match.id)).toEqual(['accelerator', 'silent'])
  // The unknown costs the expected disagreement of an uninformed guess.
  expect(matches[1]!.distance).toBeCloseTo(Math.sqrt(1 / 3 / 8))
  expect(matches[1]!.dimensions).toBe(7)
})

test('the displayed map point counts like two dimensions per axis', () => {
  const user = {
    ...result(all(0.5)),
    evidenceRevision: 2,
    horizontal: { ...emptyComponent('outlook', 'Doom–Bloom'), value: 0.9 },
    experiment: {
      evidenceRevision: 2,
      transformation: {
        ...emptyComponent('transformation', 'Scale'),
        value: 0.6
      }
    }
  } as Parameters<typeof closestPersonas>[0]
  const matches = closestPersonas(user, [
    { ...persona('opposite', all(0.5)), map: { x: 0.1, y: 0.6 } },
    { ...persona('nearby', all(0.55)), map: { x: 0.9, y: 0.6 } }
  ])
  expect(matches.map((match) => match.id)).toEqual(['nearby', 'opposite'])
  expect(matches[0]!.dimensions).toBe(10)
  // A stale experiment leaves the scale out rather than comparing it.
  const stale = closestPersonas(
    { ...user, experiment: { ...user.experiment!, evidenceRevision: 1 } },
    [{ ...persona('nearby', all(0.55)), map: { x: 0.9, y: 0.6 } }]
  )
  expect(stale[0]!.dimensions).toBe(9)
})
