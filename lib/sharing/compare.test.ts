import { readFile } from 'node:fs/promises'
import { afterEach, expect, test, vi } from 'vitest'
import type { JourneySuite } from '@/lib/journeys/schema'
import type { PersonaComparison } from '@/lib/assessment/persona-matches'
import {
  alignmentBucket,
  alignmentThresholds,
  compareParam,
  compareWorldviews,
  parseCompareTarget,
  readCompareTarget,
  writeCompareTarget,
  type ComparedWorldview
} from './compare'
import { personaComparison, shareLinkComparison } from './compare-data'
import type { PublicShareLink } from './share-links'

const suite: JourneySuite = JSON.parse(
  await readFile('lib/journeys/__fixtures__/sample-journeys.json', 'utf8')
)
const result = suite.journeys.find(
  (journey) =>
    journey.result?.horizontal.value != null &&
    journey.result.experiment?.transformation.value != null
)!.result!
const self = personaComparison({
  name: 'Someone',
  slug: 'someone',
  avatar: '/personas/someone.jpg',
  result
})

test('reads persona and share link targets and rejects anything else', () => {
  expect(parseCompareTarget('persona:karpathy')).toEqual({
    kind: 'persona',
    slug: 'karpathy'
  })
  expect(parseCompareTarget('AbCdEfGh_jKl-123')).toEqual({
    kind: 'snapshot',
    id: 'AbCdEfGh_jKl-123'
  })
  for (const value of [
    null,
    '',
    'persona:',
    'persona:Karpathy/../x',
    'https://example.com',
    'AbCdEfGh_jKl-12',
    '00000000-0000-4000-8000-000000000000'
  ])
    expect(parseCompareTarget(value)).toBeNull()
  expect(compareParam({ kind: 'persona', slug: 'karpathy' })).toBe(
    'persona:karpathy'
  )
})

afterEach(() => vi.unstubAllGlobals())

test('keeps the target and whether it is shown in this browser, per result', () => {
  const store = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value)
  })
  const persona = { kind: 'persona', slug: 'karpathy' } as const
  const friend = { kind: 'snapshot', id: 'AbCdEfGh_jKl-123' } as const
  expect(readCompareTarget('a')).toBeNull()
  // Arriving from a compare link shows the comparison.
  writeCompareTarget('a', persona)
  expect(readCompareTarget('a')).toEqual({ target: persona, shown: true })
  writeCompareTarget('a', persona, false)
  expect(readCompareTarget('a')).toEqual({ target: persona, shown: false })
  expect(readCompareTarget('b')).toBeNull()
  // Comparing this result again, from the library, shows it again.
  writeCompareTarget('a', friend)
  expect(readCompareTarget('a')).toEqual({ target: friend, shown: true })
  for (const value of [
    'persona:karpathy',
    'not json',
    '{"target":"persona:karpathy"}',
    '{"target":"https://example.com","shown":true}'
  ]) {
    store.set('doom-or-bloom:compare:a', value)
    expect(readCompareTarget('a')).toBeNull()
  }
  // Blocked storage shows no comparison instead of failing.
  vi.stubGlobal('localStorage', {
    getItem: () => {
      throw new Error('blocked')
    },
    setItem: () => {
      throw new Error('blocked')
    }
  })
  expect(() => writeCompareTarget('a', persona, false)).not.toThrow()
  expect(readCompareTarget('a')).toBeNull()
})

test('buckets the weighted distance at the calibrated thresholds', () => {
  expect(alignmentBucket(0)).toBe('very_aligned')
  expect(alignmentBucket(alignmentThresholds.very_aligned)).toBe('very_aligned')
  expect(alignmentBucket(alignmentThresholds.very_aligned + 0.001)).toBe(
    'mostly_aligned'
  )
  expect(alignmentBucket(alignmentThresholds.some_distance)).toBe(
    'some_distance'
  )
  expect(alignmentBucket(0.6)).toBe('worlds_apart')
})

test('the same worldview is very aligned with no axis differences', () => {
  const comparison = compareWorldviews(result, self, [])
  expect(comparison.distance).toBe(0)
  expect(comparison.bucket).toBe('very_aligned')
  expect(comparison.outlook).toBe('same')
  expect(comparison.change).toBe('same')
  expect(comparison.them).toEqual(comparison.you)
})

test('plain per-axis differences follow the map, and opposite views are worlds apart', () => {
  const you = compareWorldviews(result, self, []).you
  const opposite: ComparedWorldview = {
    ...self,
    values: Object.fromEntries(
      Object.entries(self.values).map(([id, value]) => [id, 1 - value!])
    ),
    map: { x: 1 - you.x!, y: 1 - you.y! }
  }
  const comparison = compareWorldviews(result, opposite, [])
  expect(comparison.bucket).toBe('worlds_apart')
  expect(comparison.outlook).toBe(
    you.x! > 0.5 ? 'more_hopeful' : 'more_worried'
  )
  expect(comparison.change).toBe(you.y! > 0.5 ? 'more' : 'less')
})

test('too little in common has no bucket rather than a misleading one', () => {
  const comparison = compareWorldviews(
    result,
    { ...self, values: {}, map: { x: null, y: null } },
    []
  )
  expect(comparison.bucket).toBeNull()
  expect(comparison.outlook).toBeNull()
  expect(comparison.change).toBeNull()
})

test('names a thought leader in both top three for a friend only', () => {
  const people: PersonaComparison[] = [
    {
      id: 'near',
      name: 'Near',
      slug: 'near',
      avatar: '',
      values: self.values,
      map: self.map
    },
    {
      id: 'far',
      name: 'Far',
      slug: 'far',
      avatar: '',
      values: {},
      map: { x: 0, y: 0 }
    }
  ]
  const friend: ComparedWorldview = {
    ...self,
    kind: 'snapshot',
    closestPersonaIds: ['near']
  }
  expect(compareWorldviews(result, friend, people).sharedClosest?.id).toBe(
    'near'
  )
  expect(
    compareWorldviews(result, { ...friend, closestPersonaIds: ['far'] }, people)
      .sharedClosest
  ).toBeNull()
  expect(
    compareWorldviews(result, { ...self, closestPersonaIds: ['near'] }, people)
      .sharedClosest
  ).toBeNull()
})

test('a share link compares from its card and values, never more', () => {
  const link: PublicShareLink = {
    id: 'AbCdEfGh_jKl-123',
    name: null,
    createdAt: '2026-10-01T00:00:00.000Z',
    card: {
      horizontal: 0.4,
      vertical: null,
      horizontalRange: [0.3, 0.5],
      verticalRange: [0, 1],
      pdoomToken: 'Unclear',
      closestPersonaIds: ['karpathy'],
      provisional: false
    },
    comparison: {
      values: { risk_landscape: 0.6 },
      map: { x: 0.4, y: 0.7 },
      pdoomSource: 'inferred'
    }
  }
  expect(shareLinkComparison(link)).toEqual({
    kind: 'snapshot',
    name: null,
    values: { risk_landscape: 0.6 },
    map: { x: 0.4, y: 0.7 },
    // An unclear number is not compared as a number.
    pdoom: null,
    closestPersonaIds: ['karpathy']
  })
})
