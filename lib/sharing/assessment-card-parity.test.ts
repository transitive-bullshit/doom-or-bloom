import { readFile } from 'node:fs/promises'
import { expect, test, vi } from 'vitest'
import sharp from 'sharp'
import type { JourneySuite } from '@/lib/journeys/schema'
import { people } from '@/components/landing/people'
import { worldviewValues } from '@/lib/assessment/persona-matches'
import { resultCardData } from './card-data'
import { GET as publicCard } from '@/app/public/assessments/[id]/social-image.webp/route'
import { POST as downloadedCard } from '@/app/api/share-card/route'

const suite: JourneySuite = JSON.parse(
  await readFile('eval/development/live-persona-journeys.json', 'utf8')
)
const result = suite.journeys.find(
  (journey) => journey.result?.experiment?.pdoom
)!.result!
const comparisons = people
  .slice(0, 3)
  .map((person) => ({ ...person, values: worldviewValues(result) }))
vi.mock('@/components/landing/data', () => ({
  loadExamples: async () => people,
  loadPersonaComparisons: async () => comparisons
}))
vi.mock('@/lib/assessments/public-server', () => ({
  loadPublished: async () => ({
    kind: 'participant',
    title: 'Your AI worldview',
    assessment: { result }
  })
}))

test('public WebP and downloaded PNG render the same assessment composition', async () => {
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
  expect(preview.headers.get('Cache-Control')).toBe(
    'public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400'
  )
  expect(preview.headers.get('X-Robots-Tag')).toBeNull()
  expect(download.headers.get('Cache-Control')).toBe('no-store')
  const webp = Buffer.from(await preview.arrayBuffer())
  const png = Buffer.from(await download.arrayBuffer())
  expect(await sharp(webp).metadata()).toMatchObject({
    format: 'webp',
    width: 1200,
    height: 630
  })
  expect(await sharp(png).metadata()).toMatchObject({
    format: 'png',
    width: 2400,
    height: 1260
  })
  const pixels = await Promise.all(
    [webp, png].map((bytes) =>
      sharp(bytes).resize(600, 315).removeAlpha().raw().toBuffer()
    )
  )
  const error =
    pixels[0]!.reduce(
      (sum, value, index) => sum + Math.abs(value - pixels[1]![index]!),
      0
    ) / pixels[0]!.length
  // Allow lossy WebP and rasterization at different pixel densities, not layout drift.
  expect(error).toBeLessThan(3)
  await sharp(webp).toFile('/tmp/unified-assessment-social.webp')
  await sharp(png)
    .resize(1200, 630)
    .toFile('/tmp/unified-assessment-download.png')
})
