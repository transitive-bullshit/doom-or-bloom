import type { Example } from './shared'
import type { Result } from '@/lib/assessment/schema'

/** A quoted approximate percentage is sortable without inventing a range. */
export function directoryPdoom(result: Result) {
  const risk = result.experiment?.pdoom
  if (risk?.estimate != null) return risk.estimate
  if (risk?.bounds) return (risk.bounds[0] + risk.bounds[1]) / 2
  if (risk?.source !== 'stated' && risk?.source !== 'public-statement')
    return null
  const match = risk.token?.match(
    /^(?:(?:about|around|roughly|approximately|~|≈)\s*)?(\d+(?:\.\d+)?)\s*(?:%|percent)$/iu
  )
  if (!match) return null
  const percentage = Number(match[1])
  return percentage <= 100 ? percentage / 100 : null
}

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
  if (key === 'pdoom' && person.pdoomLabel) return person.pdoomLabel
  const value = person[key]
  if (value == null) return 'Not available'
  if (key === 'followers') return `${value.toLocaleString('en-US')} followers`
  if (key === 'pdoom')
    return person.pdoomLabel ?? `${(value * 100).toFixed(1)}%`
  return `${Math.round(value * 100)} / 100`
}
