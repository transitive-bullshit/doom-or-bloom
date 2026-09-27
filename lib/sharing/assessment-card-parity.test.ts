import { readFile } from 'node:fs/promises'
import { expect, test, vi } from 'vitest'
import sharp from 'sharp'
import type { JourneySuite } from '@/lib/journeys/schema'
import { people } from '@/components/landing/people'
import { worldviewValues } from '@/lib/assessment/persona-matches'
import { resultCardData } from './card-data'
import { GET as publicCard } from '@/app/public/assessments/[id]/social-image.png/route'
import { POST as downloadedCard } from '@/app/api/share-card/route'

const suite: JourneySuite = JSON.parse(
  await readFile('lib/journeys/__fixtures__/sample-journeys.json', 'utf8')
)
const result = suite.journeys.find(
  (journey) => journey.result?.experiment?.pdoom
)!.result!
const comparisons = people
  .slice(0, 3)
  .map((person) => ({ ...person, values: worldviewValues(result) }))
vi.mock('@/components/landing/data', () => ({
  loadPersonaComparisons: async () => comparisons
}))
vi.mock('@/lib/assessments/public-server', () => ({
  findPublished: async (id: string) =>
    id === 'test-assessment'
      ? {
          kind: 'participant',
          title: 'Your AI worldview',
          assessment: { result }
        }
      : null
}))

test('public preview and downloaded PNG render the same assessment composition', async () => {
  const preview = await publicCard(new Request('http://localhost/preview'), {
    params: Promise.resolve({ id: 'test-assessment' })
  })
  const download = await downloadedCard(
    new Request('http://localhost/api/share-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultCardData(result, comparisons))
    })
  )
  expect(preview.status).toBe(200)
  expect(download.status).toBe(200)
  // A returned 404 stays revalidatable; a thrown notFound() would be cached for good.
  const unpublished = await publicCard(
    new Request('http://localhost/preview'),
    {
      params: Promise.resolve({ id: 'unpublished' })
    }
  )
  expect(unpublished.status).toBe(404)
  // Next's route cache supplies public caching; the handler sets no headers of its own.
  expect(preview.headers.get('Content-Type')).toBe('image/png')
  expect(preview.headers.get('Cache-Control')).toBeNull()
  expect(preview.headers.get('X-Robots-Tag')).toBeNull()
  expect(download.headers.get('Cache-Control')).toBe('no-store')
  const social = Buffer.from(await preview.arrayBuffer())
  const png = Buffer.from(await download.arrayBuffer())
  expect(await sharp(social).metadata()).toMatchObject({
    format: 'png',
    width: 1200,
    height: 630
  })
  expect(await sharp(png).metadata()).toMatchObject({
    format: 'png',
    width: 2400,
    height: 1260
  })
  const pixels = await Promise.all(
    [social, png].map((bytes) =>
      sharp(bytes).resize(600, 315).removeAlpha().raw().toBuffer()
    )
  )
  const error =
    pixels[0]!.reduce(
      (sum, value, index) => sum + Math.abs(value - pixels[1]![index]!),
      0
    ) / pixels[0]!.length
  // Allow rasterization at different pixel densities, not layout drift.
  expect(error).toBeLessThan(3)
  await sharp(social).toFile('/tmp/unified-assessment-social.png')
  await sharp(png)
    .resize(1200, 630)
    .toFile('/tmp/unified-assessment-download.png')
})
