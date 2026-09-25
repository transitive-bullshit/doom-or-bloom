import { expect, test } from 'vitest'
import {
  compareUsers,
  directoryPdoom,
  directoryValue,
  directorySorts
} from '@/components/landing/directory-sort'
import type { Example } from '@/components/landing/shared'
import { resultSchema } from '@/lib/assessment/schema'
import recorded from '@/lib/journeys/__fixtures__/sample-journeys.json'

test('explicit approximate P(doom) is displayed and sorted even without numeric bounds', () => {
  const result = resultSchema.parse(recorded.journeys[0]!.result)
  result.experiment!.pdoom = { source: 'stated', token: 'roughly 70%' }
  const original = structuredClone(result)
  const zvi = {
    id: 'thezvi',
    name: 'Zvi',
    pdoom: directoryPdoom(result),
    pdoomLabel: result.experiment!.pdoom.token
  } as Example
  const inferred = { id: 'other', name: 'Other', pdoom: 0.5 } as Example
  expect(zvi.pdoom).toBe(0.7)
  expect(directoryValue(zvi, 'pdoom')).toBe('roughly 70%')
  expect(compareUsers(zvi, inferred, 'pdoom', 'desc')).toBeLessThan(0)
  expect(compareUsers(zvi, inferred, 'pdoom', 'asc')).toBeGreaterThan(0)
  expect(result).toEqual(original)

  result.experiment!.pdoom = { source: 'stated', token: 'about 0 percent' }
  expect(directoryPdoom(result)).toBe(0)
  result.experiment!.pdoom = {
    source: 'public-statement',
    token: '10–20%',
    bounds: [0.1, 0.2]
  }
  expect(directoryPdoom(result)).toBeCloseTo(0.15)
  result.experiment!.pdoom = { source: 'inferred', estimate: 0.4 }
  expect(directoryPdoom(result)).toBe(0.4)
})

test('explicit qualifiers remain visible without inventing an exact sortable estimate', () => {
  const result = resultSchema.parse(recorded.journeys[0]!.result)
  for (const token of ['less than 10%', '70% ± 10%', '101%', 'unknown']) {
    result.experiment!.pdoom = { source: 'stated', token }
    const person = {
      pdoom: directoryPdoom(result),
      pdoomLabel: token
    } as Example
    expect(person.pdoom).toBeNull()
    expect(directoryValue(person, 'pdoom')).toBe(token)
  }
  result.experiment!.pdoom = null
  expect(directoryPdoom(result)).toBeNull()
  expect(directoryValue({ pdoom: null } as Example, 'pdoom')).toBe(
    'Not available'
  )
})

test('numeric sorts preserve zero, put missing values last in both directions, and break ties by name', () => {
  for (const key of Object.keys(directorySorts).filter(
    (key) => key !== 'name'
  ) as Exclude<keyof typeof directorySorts, 'name'>[]) {
    const base: Example = {
      id: '',
      name: '',
      slug: '',
      shortName: '',
      initials: '',
      stance: '',
      description: '',
      tone: '',
      outlook: null,
      transformation: null,
      avatar: ''
    }
    const users = [
      { ...base, id: 'missing', name: 'Absent', [key]: null },
      { ...base, id: 'zero', name: 'Zero', [key]: 0 },
      { ...base, id: 'b', name: 'Beta', [key]: 1 },
      { ...base, id: 'a', name: 'Alpha', [key]: 1 }
    ]
    expect(
      [...users].sort((a, b) => compareUsers(a, b, key, 'asc')).map((p) => p.id)
    ).toEqual(['zero', 'a', 'b', 'missing'])
    expect(
      [...users]
        .sort((a, b) => compareUsers(a, b, key, 'desc'))
        .map((p) => p.id)
    ).toEqual(['a', 'b', 'zero', 'missing'])
  }
})
