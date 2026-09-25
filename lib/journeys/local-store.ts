import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import {
  journeySchema,
  runIndex,
  suiteSchema,
  type JourneySuite
} from './schema'

const pending = new Map<string, Promise<unknown>>()
const identifier = z.string().regex(/^[a-zA-Z0-9_-]+$/)
const runIdentifier = z.string().regex(/^[0-9]{13}-[a-f0-9-]{36}$/)
const manifestSchema = suiteSchema.omit({ journeys: true }).extend({
  records: z
    .array(
      z.object({
        personaId: identifier,
        hash: z.string().regex(/^[a-f0-9]{64}$/)
      })
    )
    .max(256)
})
const pointersSchema = z.record(z.string(), runIdentifier)
const absent = (err: unknown) =>
  err instanceof Error && 'code' in err && err.code === 'ENOENT'
async function json(file: string, bound: number) {
  if ((await stat(file)).size > bound)
    throw new Error('Journey artifact exceeds local read bound')
  return JSON.parse(await readFile(file, 'utf8')) as unknown
}
async function atomic(file: string, value: unknown) {
  await mkdir(path.dirname(file), { recursive: true })
  const temporary = `${file}.${randomUUID()}.tmp`
  try {
    await writeFile(temporary, JSON.stringify(value) + '\n', { flag: 'wx' })
    await rename(temporary, file)
  } finally {
    await rm(temporary, { force: true })
  }
}

/** Local generated data only. Manifests reference immutable, independently readable user files. */
export function createLocalJourneyStore(root: string) {
  const directory = path.join(root, 'work/journeys')
  const manifestFile = (id: string) =>
    path.join(directory, 'runs', `${runIdentifier.parse(id)}.json`)
  const recordFile = (id: string, hash: string) =>
    path.join(directory, 'users', identifier.parse(id), `${hash}.json`)
  async function pointers() {
    try {
      return pointersSchema.parse(
        await json(path.join(directory, 'latest.json'), 16_000)
      )
    } catch (err) {
      if (absent(err)) return {}
      throw err
    }
  }
  async function manifest(id: string) {
    const value = manifestSchema.parse(await json(manifestFile(id), 1_000_000))
    if (
      value.id !== id ||
      new Set(value.records.map((r) => r.personaId)).size !==
        value.records.length
    )
      throw new Error('Journey artifact identity mismatch')
    return value
  }
  async function read(id: string, personaId?: string): Promise<JourneySuite> {
    const { records, ...metadata } = await manifest(id)
    if (personaId) identifier.parse(personaId)
    const selected = personaId
      ? records.filter((r) => r.personaId === personaId)
      : records
    const journeys = await Promise.all(
      selected.map(async (record) => {
        const raw = await json(
          recordFile(record.personaId, record.hash),
          32_000_000
        )
        if (
          createHash('sha256').update(JSON.stringify(raw)).digest('hex') !==
          record.hash
        )
          throw new Error('Journey artifact checksum mismatch')
        const journey = journeySchema.parse(raw)
        if (journey.personaId !== record.personaId)
          throw new Error('Journey artifact identity mismatch')
        return journey
      })
    )
    return suiteSchema.parse({ ...metadata, journeys })
  }
  async function list() {
    return Promise.all(
      Object.values(await pointers())
        .sort()
        .reverse()
        .map(async (id) => {
          const { records, ...metadata } = await manifest(id)
          return {
            ...runIndex({ ...metadata, journeys: [] }),
            personaIds: records.map((r) => r.personaId)
          }
        })
    )
  }
  async function latest(personaId?: string) {
    const id = (await pointers()).live
    if (!id)
      throw new Error(
        'No local simulations. Run pnpm journeys:generate or migrate a saved collection with pnpm journeys:migrate --file=<path>.'
      )
    return read(id, personaId)
  }
  async function publish(value: JourneySuite) {
    const suite = suiteSchema.parse(value)
    runIdentifier.parse(suite.id)
    const current = await pointers()
    const previous =
      suite.mode === 'live' && current.live
        ? await manifest(current.live)
        : null
    const replaced = new Set(
      suite.journeys.map((j) => identifier.parse(j.personaId))
    )
    if (replaced.size !== suite.journeys.length)
      throw new Error('Repeated journey identity')
    const records =
      previous?.records.filter((r) => !replaced.has(r.personaId)) ?? []
    for (const journey of suite.journeys) {
      const serialized = JSON.stringify(journey)
      if (Buffer.byteLength(serialized) > 32_000_000)
        throw new Error('Journey artifact exceeds local write bound')
      const hash = createHash('sha256').update(serialized).digest('hex')
      const file = recordFile(journey.personaId, hash)
      // Content-addressed records keep previous manifests valid across partial saves.
      try {
        await stat(file)
      } catch (err) {
        if (!absent(err)) throw err
        await atomic(file, journey)
      }
      records.push({ personaId: journey.personaId, hash })
    }
    const { journeys: _journeys, ...metadata } = suite
    const provenance = (m: typeof metadata, ids: string[]) =>
      m.sourceRuns ?? [
        {
          runId: m.id,
          createdAt: m.createdAt,
          inputHash: m.inputHash,
          engineHash: m.engineHash,
          contentHash: m.contentHash,
          personaIds: ids
        }
      ]
    const sourceRuns = previous
      ? [
          ...provenance(
            previous,
            previous.records.map((r) => r.personaId)
          )
            .map((run) => ({
              ...run,
              personaIds: run.personaIds.filter((id) => !replaced.has(id))
            }))
            .filter((run) => run.personaIds.length),
          ...provenance(
            metadata,
            suite.journeys.map((j) => j.personaId)
          )
        ]
      : metadata.sourceRuns
    const next = manifestSchema.parse({
      ...metadata,
      sourceRuns,
      records
    })
    if (Buffer.byteLength(JSON.stringify(next)) > 1_000_000)
      throw new Error('Journey manifest exceeds local write bound')
    await atomic(manifestFile(suite.id), next)
    await atomic(path.join(directory, 'latest.json'), {
      ...current,
      [suite.mode]: suite.id
    })
    return suite
  }
  function save(suite: JourneySuite) {
    const next = (pending.get(directory) ?? Promise.resolve())
      .catch(() => {})
      .then(() => publish(suite))
    pending.set(directory, next)
    void next
      .finally(() => {
        if (pending.get(directory) === next) pending.delete(directory)
      })
      .catch(() => {})
    return next
  }
  return { read, list, latest, save }
}
