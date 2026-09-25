import type { Example } from './shared'

export const directorySorts = {
  name: 'Name',
  followers: 'X followers',
  outlook: 'Doom–Bloom',
  transformation: 'Civilizational change',
  pdoom: 'P(doom)',
  reasoning: 'Demonstrated reasoning',
  upside: 'Expected upside',
  harm: 'Expected harm',
  influence: 'Human influence'
} as const
export type DirectorySort = keyof typeof directorySorts
export function compareUsers(
  a: Example,
  b: Example,
  key: DirectorySort,
  direction: 'asc' | 'desc'
) {
  const byName = a.name.localeCompare(b.name) || a.id.localeCompare(b.id)
  if (key === 'name') return direction === 'asc' ? byName : -byName
  const left = a[key] ?? null
  const right = b[key] ?? null
  // Missing evidence is always last, including descending order. Zero is known.
  if (left === null) return right === null ? byName : 1
  if (right === null) return -1
  return (direction === 'asc' ? left - right : right - left) || byName
}
export function directoryValue(person: Example, key: DirectorySort) {
  if (key === 'name') return null
  const value = person[key]
  if (value == null) return 'Not available'
  if (key === 'followers') return `${value.toLocaleString('en-US')} followers`
  if (key === 'pdoom')
    return person.pdoomLabel ?? `${(value * 100).toFixed(1)}%`
  return `${Math.round(value * 100)} / 100`
}
