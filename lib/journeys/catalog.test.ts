import { expect, test } from 'vitest'
import { personas, personaSchema } from './catalog'
import { mechanicalCases } from './mechanical/cases'
import { mechanicalCaseSchema } from './mechanical/schema'
import { recordedBackgroundSchema } from './schema'
import { runPersona, runJourneySuite } from './runner'
import { loadBundle } from '@/lib/content/loader'
import { createFixtureProvider } from '@/lib/server/provider'

test('live personas contain narrative context, with mechanical judgments confined to separate cases', () => {
  expect(new Set(personas.map((persona) => persona.id)).size).toBe(
    personas.length
  )
  for (const persona of personas) {
    expect(persona.background.length).toBeGreaterThan(30)
    expect(persona.beliefs.length).toBeGreaterThan(0)
    for (const key of [
      'levels',
      'openingVectors',
      'openingTiming',
      'openingConviction',
      'opening',
      'claims',
      'recoveryPrelude'
    ])
      expect(persona).not.toHaveProperty(key)
    expect(personaSchema.safeParse({ ...persona, levels: {} }).success).toBe(
      false
    )
  }
  expect(mechanicalCases).toHaveLength(10)
  expect(mechanicalCaseSchema.parse(mechanicalCases[0]).levels).toBeDefined()
})

test('normal journey runners cannot silently fall back to canned answers or judgments', async () => {
  await expect(runPersona(personas[0]!, loadBundle())).rejects.toThrow(
    'generated participant'
  )
  await expect(
    runPersona(personas[0]!, loadBundle(), 1, createFixtureProvider())
  ).rejects.toThrow('generated participant')
  await expect(
    runJourneySuite({ id: 'missing-live-providers' })
  ).rejects.toThrow('generated participant')
})

test('live narrative snapshots exclude mechanical judgments', () => {
  expect(recordedBackgroundSchema.parse(personas[0])).toEqual(personas[0])
  expect(recordedBackgroundSchema.safeParse(mechanicalCases[0]).success).toBe(
    false
  )
})
