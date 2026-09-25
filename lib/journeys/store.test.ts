import { expect, test } from 'vitest'
import { mkdtemp, readFile, writeFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { createJourneyStore } from './store'
import { createLocalJourneyStore } from './local-store'
import { suiteSchema } from './schema'

const sample = suiteSchema.parse(
  JSON.parse(
    await readFile('lib/journeys/__fixtures__/sample-journeys.json', 'utf8')
  )
)
const id = () => `${Date.now()}-${randomUUID()}`

test('fresh checkout has no generated results and explains regeneration', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'doom-empty-'))
  try {
    expect(await createJourneyStore(root).list()).toEqual([])
    await expect(createLocalJourneyStore(root).latest()).rejects.toThrow(
      'pnpm journeys:generate'
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('individual reads and partial saves preserve other files and original provenance', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'doom-individual-'))
  try {
    const store = createJourneyStore(root)
    const original = { ...sample, id: id(), sourceRuns: undefined }
    await store.save(original)
    expect(await store.read(original.id)).toEqual(original)
    const manifestFile = path.join(
      root,
      'work/journeys/runs',
      `${original.id}.json`
    )
    const manifest = JSON.parse(await readFile(manifestFile, 'utf8'))
    const other = manifest.records[1]
    const otherFile = path.join(
      root,
      'work/journeys/users',
      other.personaId,
      `${other.hash}.json`
    )
    const before = await stat(otherFile)
    const updated = {
      ...original,
      id: id(),
      journeys: [{ ...original.journeys[0]!, stopped: 'New interview' }]
    }
    await store.save(updated)
    const selected = await store.read(
      updated.id,
      updated.journeys[0]!.personaId
    )
    expect(selected.journeys).toEqual(updated.journeys)
    const collection = await store.read(updated.id)
    expect(collection.journeys).toHaveLength(2)
    expect(
      collection.sourceRuns!.find((r) =>
        r.personaIds.includes(other.personaId)
      )!.runId
    ).toBe(original.id)
    expect((await stat(otherFile)).mtimeMs).toBe(before.mtimeMs)
    expect(await store.read(original.id)).toEqual(original)
    // Reading one user and listing metadata must not open a different user's file.
    await writeFile(otherFile, 'broken')
    expect(
      (await store.read(updated.id, updated.journeys[0]!.personaId)).journeys
    ).toEqual(updated.journeys)
    expect((await store.list())[0]!.personaIds).toHaveLength(2)
    await expect(store.read(updated.id)).rejects.toThrow()
    await expect(store.read('../../.env.local')).rejects.toThrow()
    await expect(store.read(updated.id, '../escape')).rejects.toThrow()
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('concurrent partial saves retain both users and failed writes leave selection intact', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'doom-concurrent-'))
  try {
    const store = createJourneyStore(root)
    const a = {
      ...sample,
      sourceRuns: undefined,
      id: id(),
      journeys: [sample.journeys[0]!]
    }
    const b = {
      ...sample,
      sourceRuns: undefined,
      id: id(),
      journeys: [sample.journeys[1]!]
    }
    await Promise.all([store.save(a), store.save(b)])
    expect((await store.read(b.id)).journeys).toHaveLength(2)
    const invalid = {
      ...a,
      id: id(),
      journeys: [{ ...a.journeys[0]!, personaId: '../escape' }]
    }
    await expect(store.save(invalid)).rejects.toThrow()
    expect((await store.list())[0]!.id).toBe(b.id)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
