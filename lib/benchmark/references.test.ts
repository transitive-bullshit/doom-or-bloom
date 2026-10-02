import { expect, test } from 'vitest'
import { expandJobs, findPersona, loadPersonaSets } from './personas'
import {
  briefHash,
  displayName,
  loadReferences,
  referencePoint,
  referenceStoreSchema
} from './references'
import type { ReferenceStore } from './references'

const store = loadReferences()

test('the committed store covers every benchmark persona with judge and self references', () => {
  const sets = loadPersonaSets()
  const personas = new Set(
    Object.keys(sets.sets).flatMap((name) =>
      expandJobs(sets, name).map((job) => job.persona)
    )
  )
  const incomplete = [...personas].filter(
    (id) =>
      !store.personas[id]?.r2 ||
      !store.personas[id].r3 ||
      store.personas[id].name !== displayName(findPersona(id))
  )
  expect(incomplete).toEqual([])
  // Only personas with a verified public statement carry R4.
  const withPublic = Object.entries(store.personas).filter(([, e]) => e.r4)
  expect(withPublic.length).toBe(8)
  for (const [id, entry] of withPublic)
    expect(findPersona(id).statedPdoom?.token).toBe(entry.r4!.token)
})

test('references record their provenance and the brief they read', () => {
  const hinton = store.personas['concerned-pioneer']!
  expect(store.provenance[hinton.r1!.provenance]).toMatchObject({
    reference: 'r1',
    versions: { assessment: '0.6.1' }
  })
  expect(store.provenance[hinton.r2!.provenance]?.reference).toBe('r2')
  // The committed reference retains the brief it read, even after source updates.
  expect(hinton.r2!.briefHash).toBe('16cbf6e8c7f9523e')
})

test('the consensus is the mean of the judge and self-placement references', () => {
  const entry: ReferenceStore['personas'][string] = {
    name: 'Test',
    r1: {
      provenance: 'p1',
      briefHash: 'h',
      samples: [{ x: 0.9, y: null, pdoom: 0.5 }]
    },
    r2: {
      provenance: 'p2',
      briefHash: 'h',
      samples: [
        { x: 0.2, y: 0.8, pdoom: 0.1, evidence: 1 },
        { x: 0.4, y: 0.6, pdoom: 0.3, evidence: 1 }
      ]
    },
    r3: {
      provenance: 'p3',
      briefHash: 'h',
      samples: [{ x: 0.5, y: 0.5, pdoom: 0.4, wouldAnswer: true }]
    },
    r4: {
      provenance: 'p4',
      token: '10–20%',
      low: 0.1,
      high: 0.2,
      outcome: 'Extinction',
      publishedAt: '2026-01-01',
      url: 'https://example.com/statement'
    }
  }
  expect(referencePoint(entry, 'consensus')).toEqual({
    x: expect.closeTo(0.4),
    y: expect.closeTo(0.6),
    pdoom: expect.closeTo(0.3)
  })
  expect(referencePoint(entry, 'r1')).toEqual({ x: 0.9, y: null, pdoom: 0.5 })
  expect(referencePoint(entry, 'r4')).toEqual({
    x: null,
    y: null,
    pdoom: expect.closeTo(0.15)
  })
  expect(
    referencePoint({ ...entry, r3: undefined }, 'consensus').x
  ).toBeCloseTo(0.3)
})

test('the store schema rejects unknown provenance and out-of-range values', () => {
  const valid = {
    schemaVersion: 1,
    description: 'test',
    provenance: {
      judge: { reference: 'r2', method: 'm', createdAt: 'd', versions: {} }
    },
    personas: {
      a: {
        name: 'A',
        r2: {
          provenance: 'judge',
          briefHash: 'h',
          samples: [{ x: 0.2, y: 0.3, pdoom: 0.1, evidence: 1 }]
        }
      }
    }
  }
  expect(referenceStoreSchema.safeParse(valid).success).toBe(true)
  const r2 = valid.personas.a.r2
  for (const personas of [
    { a: { name: 'A', r2: { ...r2, provenance: 'missing' } } },
    {
      a: {
        name: 'A',
        r3: { ...r2, samples: [{ ...r2.samples[0], wouldAnswer: true }] }
      }
    },
    {
      a: { name: 'A', r2: { ...r2, samples: [{ ...r2.samples[0]!, x: 1.2 }] } }
    },
    { a: { name: 'A', r2: { provenance: 'judge', samples: r2.samples } } }
  ])
    expect(referenceStoreSchema.safeParse({ ...valid, personas }).success).toBe(
      false
    )
})

test('brief hashes follow the brief, not the benchmark answer style', () => {
  const persona = findPersona('worried-novice')
  expect(briefHash({ ...persona, responseStyle: 'detailed' })).toBe(
    briefHash(persona)
  )
  expect(
    briefHash({ ...persona, background: `${persona.background} More.` })
  ).not.toBe(briefHash(persona))
  expect(displayName(persona)).toBe('Worried novice')
  expect(displayName(findPersona('concerned-pioneer'))).toBe('Geoffrey Hinton')
})

test('persona sets expand into fixed, rebalanced interview lists', () => {
  const sets = loadPersonaSets()
  const core = expandJobs(sets, 'core')
  expect(core).toHaveLength(86)
  expect(new Set(core.map((job) => job.key)).size).toBe(86)
  const styles = (group: string) =>
    new Set(core.filter((job) => job.group === group).map((job) => job.style))
  expect(styles('public')).toEqual(new Set(['terse', 'brief', 'detailed']))
  expect(styles('casual')).toEqual(new Set(['terse', 'brief']))
  expect(expandJobs(sets, 'retest')).toHaveLength(36)
  expect(expandJobs(sets, 'wide')).toHaveLength(163)
  expect(
    expandJobs(sets, 'core', {
      personas: ['casual-unsure', 'frontier-pacer'],
      styles: ['terse'],
      repeats: 2
    }).map((job) => job.key)
  ).toEqual([
    'frontier-pacer__terse__1',
    'frontier-pacer__terse__2',
    'casual-unsure__terse__1',
    'casual-unsure__terse__2'
  ])
  expect(() =>
    expandJobs(sets, 'core', { personas: ['independent-gwern'] })
  ).toThrow('Not in the "core" set')
  expect(() =>
    expandJobs(sets, 'core', {
      personas: ['casual-unsure'],
      styles: ['detailed']
    })
  ).toThrow('matches no interviews')
  expect(() => expandJobs(sets, 'missing')).toThrow('Unknown persona set')
})
