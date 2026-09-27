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

export function closestPersonas(
  result: Pick<Result, 'components'> &
    Partial<Pick<Result, 'evidenceRevision' | 'horizontal' | 'experiment'>>,
  personas: PersonaComparison[]
) {
  const values = worldviewValues(result)
  const point = result.horizontal
    ? resultPoint({
        evidenceRevision: result.evidenceRevision ?? -1,
        horizontal: result.horizontal,
        experiment: result.experiment
      })
    : { x: null, y: null }
  const features = [
    ...worldviewIds.flatMap((id) =>
      values[id] === undefined ? [] : [{ id, value: values[id], weight: 1 }]
    ),
    ...(['x', 'y'] as const).flatMap((axis) =>
      point[axis] === null
        ? []
        : [{ id: axis, value: point[axis], weight: mapWeight }]
    )
  ]
  const total = features.reduce((sum, feature) => sum + feature.weight, 0)
  // Avoid a superficially close match based on just one or two observations.
  const minimumShared = Math.max(3, Math.ceil(features.length / 2))
  return personas
    .flatMap((persona) => {
      const known = (id: string) =>
        (id === 'x' || id === 'y'
          ? persona.map?.[id]
          : persona.values[id as WorldviewId]) ?? undefined
      const shared = features.filter(
        (feature) => known(feature.id) !== undefined
      ).length
      if (shared < minimumShared) return []
      // An unknown persona value is not a neutral opinion. It costs the
      // expected disagreement with an uninformed guess, so a persona cannot
      // match by lacking the participant's strongest positions.
      const squared = features.reduce((sum, { id, value, weight }) => {
        const other = known(id)
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
    })
    .sort(
      (a, b) =>
        a.distance - b.distance ||
        b.dimensions - a.dimensions ||
        a.id.localeCompare(b.id)
    )
    .slice(0, 3)
}
