import type { MapExample } from './shared'
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

// Labels live in messages/<locale>.json under Landing.sort.
export const directorySorts = [
  'name',
  'followers',
  'outlook',
  'transformation',
  'pdoom',
  'reasoning',
  'upside',
  'harm',
  'influence'
] as const
export type DirectorySort = (typeof directorySorts)[number]
export function compareUsers(
  a: MapExample,
  b: MapExample,
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
/** The directory lists this many people at first and per “Show more”. */
export const directoryPageSize = 48

// Labels live in messages/<locale>.json under Landing.filters.
export const directoryFilters = [
  'all',
  'doom',
  'mixed',
  'bloom',
  'stated'
] as const
export type DirectoryFilter = (typeof directoryFilters)[number]
/**
 * The side of the map an outlook falls on, by its nearest outlook level:
 * concern-leaning or below, mixed, or benefit-leaning or above.
 */
export function outlookSide(outlook: number | null) {
  if (outlook === null) return null
  return outlook < 0.375 ? 'doom' : outlook < 0.625 ? 'mixed' : 'bloom'
}
export function matchesFilter(person: MapExample, filter: DirectoryFilter) {
  if (filter === 'all') return true
  if (filter === 'stated') return person.pdoomStated === true
  return outlookSide(person.outlook) === filter
}

/** The date, or the span of dates, on which the shown X counts were captured. */
export function followersCapturedLabel(people: MapExample[]) {
  const dates = people
    .filter((person) => person.followers != null && person.followersCapturedAt)
    .map((person) => person.followersCapturedAt!.slice(0, 10))
    .sort()
  if (!dates.length) return ''
  const first = dates[0]!
  const last = dates.at(-1)!
  return first === last ? first : `${first}–${last}`
}
const englishText = {
  unavailable: 'Not available',
  followers: (count: number) => `${count.toLocaleString('en-US')} followers`
}
export function directoryValue(
  person: MapExample,
  key: DirectorySort,
  text: typeof englishText = englishText
) {
  if (key === 'name') return null
  if (key === 'pdoom' && person.pdoomLabel) return person.pdoomLabel
  const value = person[key]
  if (value == null) return text.unavailable
  if (key === 'followers') return text.followers(value)
  if (key === 'pdoom')
    return person.pdoomLabel ?? `${(value * 100).toFixed(1)}%`
  return `${Math.round(value * 100)} / 100`
}
