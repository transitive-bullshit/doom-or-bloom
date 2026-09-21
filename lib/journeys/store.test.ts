import { expect, test } from 'vitest'
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { runMechanicalSuite } from './mechanical/runner'
import { createJourneyStore } from './store'
import { suiteSchema } from './schema'

test('recorded live journeys work on a fresh checkout and local traces take precedence', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'doom-recorded-journeys-'))
  try {
    const serialized = await readFile(
      'eval/development/live-persona-journeys.json',
      'utf8'
    )
    const recorded = suiteSchema.parse(JSON.parse(serialized))
    await mkdir(path.join(root, 'eval/development'), { recursive: true })
    await writeFile(
      path.join(root, 'eval/development/live-persona-journeys.json'),
      serialized
    )
    const store = createJourneyStore(root)
    expect((await store.list()).map((run) => run.id)).toEqual([recorded.id])
    expect(await store.read(recorded.id)).toEqual(recorded)
    const local = { ...recorded, turns: recorded.turns === 5 ? 6 : 5 }
    await store.save(local)
    expect(await store.read(recorded.id)).toEqual(local)
    expect((await store.list()).map((run) => run.id)).toEqual([recorded.id])
    await writeFile(
      path.join(root, 'eval/runs/journeys', recorded.id, 'suite.json'),
      'broken'
    )
    await expect(store.read(recorded.id)).rejects.toThrow()
    await expect(store.read(`${Date.now()}-${randomUUID()}`)).rejects.toThrow()
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('concurrent saves keep only the latest local run and reject paths, overwrite and corrupted artifacts', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'doom-journey-store-'))
  try {
    const store = createJourneyStore(root)
    const a = await runMechanicalSuite({
      id: `${Date.now()}-${randomUUID()}`,
      personaId: 'control-alarmist',
      turns: 1
    })
    const b = { ...a, id: `${Date.now()}-${randomUUID()}` }
    await Promise.all([store.save(a), store.save(b)])
    expect((await store.list()).map((r) => r.id).sort()).toEqual([b.id])
    await expect(store.read(a.id)).rejects.toThrow()
    expect((await store.read(b.id)).journeys[0]!.firstReadyAnswer).toBe(1)
    await expect(store.read('../../.env.local')).rejects.toThrow()
    await expect(store.save(b)).rejects.toThrow()
    const file = path.join(root, 'eval/runs/journeys', b.id, 'suite.json')
    await writeFile(file, 'broken json')
    await expect(store.read(b.id)).rejects.toThrow()
    expect(await readFile(file, 'utf8')).toBe('broken json')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('64-person collections retain generation provenance through storage', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'doom-expanded-journeys-'))
  try {
    const suite = await runMechanicalSuite({
      id: `${Date.now()}-${randomUUID()}`,
      personaId: 'control-alarmist',
      turns: 1
    })
    const expanded = {
      ...suite,
      sourceRuns: [
        {
          runId: suite.id,
          createdAt: suite.createdAt,
          personaIds: Array.from({ length: 64 }, (_, i) => `storage-case-${i}`),
          inputHash: suite.inputHash,
          engineHash: suite.engineHash,
          contentHash: suite.contentHash
        }
      ],
      journeys: Array.from({ length: 64 }, (_, index) => ({
        ...suite.journeys[0]!,
        personaId: `storage-case-${index}`
      }))
    }
    const store = createJourneyStore(root)
    await store.save(expanded)
    expect((await store.list())[0]!.personaIds).toHaveLength(64)
    expect(await store.read(expanded.id)).toEqual(expanded)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
