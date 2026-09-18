import { expect, test } from 'vitest'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { runJourneySuite } from './runner'
import { createJourneyStore } from './store'

test('immutable local runs survive concurrent saves and reject paths, overwrite and corrupted artifacts', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'doom-journey-store-'))
  try {
    const store = createJourneyStore(root)
    const a = await runJourneySuite({
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
