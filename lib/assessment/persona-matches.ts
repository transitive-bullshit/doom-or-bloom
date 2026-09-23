import { worldviewIds, type Result } from './schema'

type WorldviewId = (typeof worldviewIds)[number]
export type WorldviewValues = Partial<Record<WorldviewId, number>>
export type PersonaComparison = {
  id: string
  name: string
  slug: string
  avatar: string
  values: WorldviewValues
}

/** Only directional worldview components; never map or reasoning scores. */
export function worldviewValues(
  result: Pick<Result, 'components'>
): WorldviewValues {
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
  result: Pick<Result, 'components'>,
  personas: PersonaComparison[]
) {
  const values = worldviewValues(result)
  // Avoid a superficially close match based on just one or two observations.
  const minimumShared = Math.max(3, Math.ceil(Object.keys(values).length / 2))
  return personas
    .flatMap((persona) => {
      const shared = worldviewIds.filter(
        (id) => values[id] !== undefined && persona.values[id] !== undefined
      )
      if (shared.length < minimumShared) return []
      const distance = Math.sqrt(
        shared.reduce(
          (sum, id) => sum + (values[id]! - persona.values[id]!) ** 2,
          0
        ) / shared.length
      )
      return [{ ...persona, distance, dimensions: shared.length }]
    })
    .sort(
      (a, b) =>
        a.distance - b.distance ||
        b.dimensions - a.dimensions ||
        a.id.localeCompare(b.id)
    )
    .slice(0, 3)
}
