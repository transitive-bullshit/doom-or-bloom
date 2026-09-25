import { createLocalJourneyStore } from '../lib/journeys/local-store'
import { loadSocialPortrait } from '../lib/sharing/portraits'
import { mkdir, writeFile } from 'node:fs/promises'
import { render } from 'takumi-js'
import sharp from 'sharp'
import { people } from '../components/landing/people'
import { SocialCard, socialImageOptions } from '../lib/sharing/social-card'
import type { JourneySuite } from '../lib/journeys/schema'

const output = '/tmp/doom-seo-audit/images'
await mkdir(output, { recursive: true })
const suite: JourneySuite = await createLocalJourneyStore(
  process.cwd()
).latest()
const examples = await Promise.all(
  people.map(async (person) => ({
    ...person,
    portrait: await loadSocialPortrait(person.avatar),
    result: suite.journeys.find((j) => j.personaId === person.id)!.result!
  }))
)
const points = examples.flatMap(({ result, portrait }) => {
  const x = result.horizontal.value
  const y = result.experiment?.transformation.value
  return x != null && y != null ? [{ x, y, portrait }] : []
})
const cards = [
  { name: 'site', card: SocialCard({ points }) },
  ...['sama', 'esyudkowsky', 'pmarca'].map((slug) => ({
    name: slug,
    card: SocialCard({ person: examples.find((p) => p.slug === slug)! })
  }))
]
const results = []
for (const { name, card } of cards) {
  for (const format of ['png', 'webp'] as const) {
    const timings = []
    let bytes!: Uint8Array
    for (let i = 0; i < 4; i++) {
      const start = performance.now()
      bytes = await render(
        card,
        format === 'webp'
          ? socialImageOptions
          : { width: 1200, height: 630, format: 'png', emoji: 'from-font' }
      )
      if (i) timings.push(performance.now() - start)
    }
    await writeFile(`${output}/${name}.${format}`, bytes)
    const meta = await sharp(bytes).metadata()
    results.push({
      name,
      format: meta.format,
      bytes: bytes.length,
      width: meta.width,
      height: meta.height,
      medianMs: timings.sort((a, b) => a - b)[1]
    })
  }
}
await writeFile(`${output}/benchmark.json`, JSON.stringify(results, null, 2))
console.log(JSON.stringify(results, null, 2))
