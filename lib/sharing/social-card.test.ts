import { ShareCard } from './card'
import { resultCardData } from './card-data'
import { renderShareCard } from './render-card'
import { loadSocialPortrait } from './portraits'
import { readFile } from 'node:fs/promises'
import { renderToStaticMarkup } from 'react-dom/server'
import { render } from 'takumi-js'
import sharp from 'sharp'
import { expect, test } from 'vitest'
import type { JourneySuite } from '@/lib/journeys/schema'
import { people } from '@/components/landing/people'
import { SocialCard, socialCardData, socialImageOptions } from './social-card'

const suite: JourneySuite = JSON.parse(
  await readFile('lib/journeys/__fixtures__/sample-journeys.json', 'utf8')
)

test('every public persona portrait renders with a representative saved result', async () => {
  for (const person of people) {
    const portrait = await loadSocialPortrait(person.avatar)
    expect(
      await sharp(Buffer.from(portrait.split(',')[1]!, 'base64')).metadata()
    ).toMatchObject({ width: expect.any(Number) })
    const result = suite.journeys[0]!.result
    expect(result).toBeTruthy()
    const data = socialCardData(result!)
    expect(data.horizontal).toEqual(result!.horizontal.value)
    expect(data.horizontalRange).toEqual(result!.horizontal.range)
    expect(data.transformation).toEqual(
      result!.experiment?.transformation.value ?? null
    )
    expect(data.transformationRange).toEqual(
      result!.experiment?.transformation.range ?? [0, 1]
    )
    const html = renderToStaticMarkup(
      SocialCard({ person: { ...person, result: result!, portrait } })
    )
    expect(html).toContain(person.name.replaceAll('&', '&amp;'))
    const placed = data.horizontal !== null && data.transformation !== null
    expect(html.includes(portrait)).toBe(placed)
    expect(html.includes('Still unplaced')).toBe(!placed)
    expect(html).toContain('SIMULATED AI WORLDVIEW')
    expect(html).toContain('not their own assessment')
  }
})

test('social output is a decodable 1200 × 630 WebP', async () => {
  const bytes = await render(
    SocialCard({
      points: [
        {
          x: 0.2,
          y: 0.8,
          portrait: await loadSocialPortrait(people[0]!.avatar)
        }
      ]
    }),
    socialImageOptions
  )
  expect(await sharp(bytes).metadata()).toMatchObject({
    format: 'webp',
    width: 1200,
    height: 630
  })
  expect(bytes.length).toBeLessThan(100_000)
})

test('participant cards support unknown coordinates without simulated labeling', async () => {
  const result = structuredClone(suite.journeys.find((j) => j.result)!.result!)
  result.horizontal.value = null
  if (result.experiment) result.experiment.transformation.value = null
  const data = resultCardData(result)
  const card = ShareCard({ data })
  const html = renderToStaticMarkup(card)
  expect(html).toContain('My AI Worldview')
  expect(html).toContain('Still unplaced')
  expect(html).not.toContain('SIMULATED')
  const bytes = await renderShareCard(data, { format: 'webp' })
  expect(await sharp(bytes).metadata()).toMatchObject({
    format: 'webp',
    width: 1200,
    height: 630
  })
  await sharp(bytes).toFile('/tmp/persistence-unplaced-card.webp')
})
