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

test('immutable local runs survive concurrent saves and reject paths, overwrite and corrupted artifacts', async () => {
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
    expect((await store.list()).map((r) => r.id).sort()).toEqual(
      [a.id, b.id].sort()
    )
    expect((await store.read(a.id)).journeys[0]!.firstReadyAnswer).toBe(1)
    await expect(store.read('../../.env.local')).rejects.toThrow()
    await expect(store.save(a)).rejects.toThrow()
    const file = path.join(root, 'eval/runs/journeys', a.id, 'suite.json')
    await writeFile(file, 'broken json')
    await expect(store.read(a.id)).rejects.toThrow()
    expect(await readFile(file, 'utf8')).toBe('broken json')
    expect((await store.read(b.id)).id).toBe(b.id)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
