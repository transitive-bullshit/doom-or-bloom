import { worldviewIds, type Result } from './schema'
import { resultPoint } from './self-placement'

type WorldviewId = (typeof worldviewIds)[number]
export type WorldviewValues = Partial<Record<WorldviewId, number>>
export type PersonaComparison = {
  id: string
  name: string
  slug: string
  avatar: string
  values: WorldviewValues
  // The persona's displayed map point, compared like the participant's own.
  map?: { x: number | null; y: number | null }
}

// Each placed map axis counts like two worldview dimensions: the map is what
// participants compare themselves by.
const mapWeight = 2

/** Only directional worldview components; never map or reasoning scores. */
export function worldviewValues(result: {
  components: Pick<Result['components'][number], 'vector' | 'value'>[]
}): WorldviewValues {
  return Object.fromEntries(
    worldviewIds.flatMap((id) => {
      const value = result.components.find(
        (component) => component.vector === id
      )?.value
      return typeof value === 'number' && Number.isFinite(value)
        ? [[id, value]]
        : []
    })
  )
}

type Matchable = Pick<Result, 'components'> &
  Partial<Pick<Result, 'evidenceRevision' | 'horizontal' | 'experiment'>>
type Feature = { id: string; value: number; weight: number }

/**
 * The positions a result is compared on: its directional components, then
 * each placed map axis counted like two of them. `expressedOnly` leaves out an
 * unsettled transformation, whose point marks the center of an open range
 * rather than a belief.
 */
function features(result: Matchable, expressedOnly = false): Feature[] {
  const values = worldviewValues(result)
  const point = result.horizontal
    ? resultPoint({
        evidenceRevision: result.evidenceRevision ?? -1,
        horizontal: result.horizontal,
        experiment: result.experiment
      })
    : { x: null, y: null }
  const unsettled =
    expressedOnly &&
    result.experiment?.transformation.interpretation === 'unsettled'
  return [
    ...worldviewIds.flatMap((id) =>
      values[id] === undefined ? [] : [{ id, value: values[id], weight: 1 }]
    ),
    ...(['x', 'y'] as const).flatMap((axis) =>
      point[axis] === null || (axis === 'y' && unsettled)
        ? []
        : [{ id: axis, value: point[axis], weight: mapWeight }]
    )
  ]
}

const knownValue = (persona: PersonaComparison, id: string) =>
  (id === 'x' || id === 'y'
    ? persona.map?.[id]
    : persona.values[id as WorldviewId]) ?? undefined

const nearest = <
  T extends { distance: number; dimensions: number; id: string }
>(
  matches: T[],
  limit: number
) =>
  matches
    .sort(
      (a, b) =>
        a.distance - b.distance ||
        b.dimensions - a.dimensions ||
        a.id.localeCompare(b.id)
    )
    .slice(0, limit)

/** The `limit` nearest personas, closest first. */
export function closestPersonas(
  result: Matchable,
  personas: PersonaComparison[],
  limit = 3
) {
  const compared = features(result)
  const total = compared.reduce((sum, feature) => sum + feature.weight, 0)
  // Avoid a superficially close match based on just one or two observations.
  const minimumShared = Math.max(3, Math.ceil(compared.length / 2))
  return nearest(
    personas.flatMap((persona) => {
      const shared = compared.filter(
        (feature) => knownValue(persona, feature.id) !== undefined
      ).length
      if (shared < minimumShared) return []
      // An unknown persona value is not a neutral opinion. It costs the
      // expected disagreement with an uninformed guess, so a persona cannot
      // match by lacking the participant's strongest positions.
      const squared = compared.reduce((sum, { id, value, weight }) => {
        const other = knownValue(persona, id)
        return (
          sum +
          weight *
            (other === undefined
              ? value ** 2 - value + 1 / 3
              : (value - other) ** 2)
        )
      }, 0)
      return [
        { ...persona, distance: Math.sqrt(squared / total), dimensions: shared }
      ]
    }),
    limit
  )
}

/**
 * A fallback for a result too sparse for `closestPersonas`: the `limit`
 * personas nearest on just the positions it expresses, each of which they
 * must also hold, so nobody matches by what they lack. Empty when the result
 * expresses no position at all; there is then nothing honest to compare.
 */
export function closestOnExpressedPositions(
  result: Matchable,
  personas: PersonaComparison[],
  limit = 3
) {
  const compared = features(result, true)
  if (!compared.length) return []
  const total = compared.reduce((sum, feature) => sum + feature.weight, 0)
  return nearest(
    personas.flatMap((persona) => {
      const squared = compared.reduce<number | null>(
        (sum, { id, value, weight }) => {
          const other = knownValue(persona, id)
          return sum === null || other === undefined
            ? null
            : sum + weight * (value - other) ** 2
        },
        0
      )
      return squared === null
        ? []
        : [
            {
              ...persona,
              distance: Math.sqrt(squared / total),
              dimensions: compared.length
            }
          ]
    }),
    limit
  )
}
