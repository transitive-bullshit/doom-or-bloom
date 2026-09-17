import 'server-only'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  feedbackEntrySchema,
  feedbackFileSchema,
  feedbackKindSchema
} from './feedback-schema'
import type { FeedbackEntry, FeedbackKind } from './feedback-schema'

const writes = new Map<string, Promise<void>>()

export function createFeedbackStore(directory: string) {
  const filename = (kind: FeedbackKind) =>
    path.join(directory, `${feedbackKindSchema.parse(kind)}.json`)
  async function read(kind: FeedbackKind): Promise<FeedbackEntry[]> {
    try {
      return feedbackFileSchema.parse(
        JSON.parse(await readFile(filename(kind), 'utf8'))
      ).entries
    } catch (err) {
      if (err instanceof Error && 'code' in err && err.code === 'ENOENT')
        return []
      throw err // Never replace a damaged feedback file with an empty one.
    }
  }
  async function append(kind: FeedbackKind, entry: FeedbackEntry) {
    const record = feedbackEntrySchema.parse(entry)
    const file = filename(kind)
    const previous = writes.get(file) ?? Promise.resolve()
    const job = previous.then(async () => {
      const entries = await read(kind)
      await mkdir(directory, { recursive: true })
      const temporary = `${file}.${randomUUID()}.tmp`
      try {
        await writeFile(
          temporary,
          JSON.stringify(
            { schemaVersion: 1, entries: [...entries, record] },
            null,
            2
          ) + '\n',
          { flag: 'wx' }
        )
        await rename(temporary, file)
      } finally {
        await unlink(temporary).catch((err: unknown) => {
          if (!(err instanceof Error && 'code' in err && err.code === 'ENOENT'))
            throw err
        })
      }
      return record
    })
    const settled = job.then(
      () => {},
      () => {}
    )
    writes.set(file, settled)
    try {
      return await job
    } finally {
      if (writes.get(file) === settled) writes.delete(file)
    }
  }
  return { read, append }
}

export function projectFeedbackStore() {
  return createFeedbackStore(path.join(process.cwd(), 'content/feedback'))
}
