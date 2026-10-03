import { readFile } from 'node:fs/promises'
import sharp from 'sharp'
import { expect, test } from 'vitest'
import { people } from '@/components/landing/people'
import { presentResult } from '@/lib/assessment/present-result'
import type { JourneySuite } from '@/lib/journeys/schema'
import { loadSocialPortrait } from './portraits'
import { renderSiteSocialImage, siteSocialPoints } from './render-site-social'
import {
  separateVertically,
  siteSocialFaces,
  siteSocialLayout
} from './site-social-card'

const suite: JourneySuite = JSON.parse(
  await readFile('lib/journeys/__fixtures__/sample-journeys.json', 'utf8')
)
const placed = suite.journeys[0]!.result!
const unplaced = structuredClone(placed)
unplaced.horizontal.value = null
const catalog = (slug: string) => people.find((person) => person.slug === slug)!

test('portraits stay on their coordinates unless they would cover each other', () => {
  const [far, left, right] = separateVertically(
    [
      { x: 0, y: 0 },
      { x: 300, y: 100 },
      { x: 310, y: 110 }
    ],
    80,
    4
  )
  expect(far).toEqual({ x: 0, y: 0 })
  // Outlook stays exact; the overlapping pair splits evenly around its midpoint.
  expect([left!.x, right!.x]).toEqual([300, 310])
  expect(left!.y + right!.y).toBeCloseTo(210)
  expect(Math.hypot(right!.x - left!.x, right!.y - left!.y)).toBeCloseTo(84)
})

test('featured people become portraits and everyone else a dot', () => {
  const layout = siteSocialLayout([
    { outlook: 0, transformation: 1, portrait: 'data:image/jpeg;base64,' },
    { outlook: 1, transformation: 0 },
    { outlook: 0.5, transformation: 0.5 }
  ])
  expect(layout.portraits).toEqual([
    { x: 579, y: 95, portrait: 'data:image/jpeg;base64,' }
  ])
  expect(layout.dots).toEqual([
    { x: 1089, y: 535 },
    { x: 834, y: 315 }
  ])
})

test('portrait art direction preserves saved points and horizontal outlook', () => {
  const points = [
    { slug: 'garymarcus', outlook: 0, transformation: 1, portrait: 'marcus' },
    {
      slug: 'geoffreyhinton',
      outlook: 1,
      transformation: 0,
      portrait: 'hinton'
    }
  ]
  const saved = structuredClone(points)
  const layout = siteSocialLayout(points)
  expect(layout.portraits).toEqual([
    { x: 579, y: 185.8, portrait: 'marcus' },
    { x: 1089, y: 580.4, portrait: 'hinton' }
  ])
  expect(points).toEqual(saved)
})

test('every featured face is a public simulated user with a portrait', () => {
  for (const slug of siteSocialFaces) expect(catalog(slug)?.avatar).toBeTruthy()
})

test('points use presented map positions and leave unplaced users off', async () => {
  const other = people.find((person) => !siteSocialFaces.includes(person.slug))!
  const points = await siteSocialPoints([
    ...siteSocialFaces.map((slug) => ({ ...catalog(slug), result: placed })),
    { ...other, result: placed },
    { ...other, slug: 'unplaced', result: unplaced }
  ])
  const shown = presentResult(placed)
  expect(points).toHaveLength(siteSocialFaces.length + 1)
  expect(points.filter((point) => point.portrait)).toHaveLength(
    siteSocialFaces.length
  )
  expect(points.at(-1)).toEqual({
    slug: other.slug,
    outlook: shown.horizontal.value,
    transformation: shown.experiment?.transformation.value,
    portrait: undefined
  })
})

test('generation fails when a featured face has no map position', async () => {
  const [first, ...rest] = siteSocialFaces
  await expect(
    siteSocialPoints([
      { ...catalog(first!), result: unplaced },
      ...rest.map((slug) => ({ ...catalog(slug), result: placed }))
    ])
  ).rejects.toThrow(first)
})

test('the site social image is a decodable 1200 × 630 PNG', async () => {
  const points = await Promise.all(
    people.slice(0, 12).map(async (person, index) => ({
      outlook: index / 11,
      transformation: 1 - (index % 4) / 4,
      portrait:
        index % 3 === 0 ? await loadSocialPortrait(person.avatar) : undefined
    }))
  )
  const bytes = await renderSiteSocialImage(points)
  expect(await sharp(bytes).metadata()).toMatchObject({
    format: 'png',
    width: 1200,
    height: 630
  })
  expect(bytes.length).toBeLessThan(1_000_000)
})
