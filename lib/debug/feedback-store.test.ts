import { afterEach, expect, test } from 'vitest'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createFeedbackStore } from './feedback-store'
import type { FeedbackEntry, FeedbackKind } from './feedback-schema'

const directories: string[] = []
afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true }))
  )
})
async function directory() {
  const value = await mkdtemp(path.join(tmpdir(), 'doom-feedback-'))
  directories.push(value)
  return value
}
function note(id: string): FeedbackEntry {
  return {
    id,
    resourceId: 'root',
    label: 'Root question',
    contentVersion: '0.4.0-draft',
    assetHash: 'a'.repeat(64),
    text: `Review ${id}`,
    createdAt: '2026-09-17T00:00:00.000Z'
  }
}
test('concurrent appends survive a new store instance with versions and earlier notes intact', async () => {
  const location = await directory()
  const first = createFeedbackStore(location)
  const second = createFeedbackStore(location)
  await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      (i % 2 ? first : second).append('questions', note(String(i)))
    )
  )
  const saved = await createFeedbackStore(location).read('questions')
  expect(saved).toEqual(Array.from({ length: 10 }, (_, i) => note(String(i))))
  expect(await first.read('corpus')).toEqual([])
  await first.append('corpus', note('corpus'))
  expect(await first.read('questions')).toHaveLength(10)
  expect(await first.read('corpus')).toEqual([note('corpus')])
})
test('damaged files are preserved and a failed append does not poison subsequent writes', async () => {
  const location = await directory()
  const store = createFeedbackStore(location)
  const file = path.join(location, 'questions.json')
  await writeFile(file, '{ broken JSON')
  await expect(store.append('questions', note('1'))).rejects.toThrow()
  expect(await readFile(file, 'utf8')).toBe('{ broken JSON')
  await writeFile(
    file,
    JSON.stringify({ schemaVersion: 1, entries: [note('original')] })
  )
  await store.append('questions', note('retry'))
  expect(await store.read('questions')).toEqual([
    note('original'),
    note('retry')
  ])
  await expect(store.read('../outside' as FeedbackKind)).rejects.toThrow()
})
