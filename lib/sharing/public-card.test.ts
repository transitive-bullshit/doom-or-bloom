import { readFile } from 'node:fs/promises'
import { expect, test, vi } from 'vitest'
import type { JourneySuite } from '@/lib/journeys/schema'
import type { Result } from '@/lib/assessment/schema'
import { people } from '@/components/landing/people'
import { worldviewValues } from '@/lib/assessment/persona-matches'
import { publicShareCard, publicShareCardPath } from './public-card'

const suite: JourneySuite = JSON.parse(
  await readFile('lib/journeys/__fixtures__/sample-journeys.json', 'utf8')
)
const result = suite.journeys[0]!.result!
vi.mock('@/components/landing/data', () => ({
  loadPersonaComparisons: async () =>
    people
      .slice(0, 3)
      .map((person) => ({ ...person, values: worldviewValues(result) }))
}))

type Published = Parameters<typeof publicShareCard>[0]
const id = '6f1c2b7e-3d4a-4c5b-8e9f-0a1b2c3d4e5f'
const participant = (saved: Result) =>
  ({ kind: 'participant', assessment: { result: saved } }) as Published
const previewPath = async (saved: Published) =>
  publicShareCardPath(id, await publicShareCard(saved))

test('a public preview URL changes exactly when its card changes', async () => {
  const path = await previewPath(participant(result))
  expect(path).toMatch(
    new RegExp(`^/public/assessments/${id}/social-image\\.png\\?v=[\\w-]{12}$`)
  )
  expect(await previewPath(participant(structuredClone(result)))).toBe(path)

  // Re-evaluation replaces the saved result, so crawlers must see a new image URL.
  const reevaluated = structuredClone(result)
  reevaluated.experiment!.generatedAt = '2026-09-27T14:24:00.000Z'
  expect(await previewPath(participant(reevaluated))).not.toBe(path)
  expect(await previewPath(participant(suite.journeys[1]!.result!))).not.toBe(
    path
  )

  const simulation = {
    kind: 'simulation',
    profile: { name: 'Ada Lovelace' },
    simulation: { journey: { result } }
  } as Published
  expect(await publicShareCard(simulation)).toMatchObject({
    title: 'Ada Lovelace’s AI worldview',
    simulated: true
  })
  expect(await previewPath(simulation)).not.toBe(path)
})
