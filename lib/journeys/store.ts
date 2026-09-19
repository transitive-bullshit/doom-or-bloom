import 'server-only'
import { randomUUID } from 'node:crypto'
import {
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile
} from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import { runIndex, suiteSchema } from './schema'

const pendingSaves = new Map<string, Promise<unknown>>()
import type { JourneySuite, RunIndex } from './schema'

const runId = z.string().regex(/^(baseline|[0-9]{13}-[a-f0-9-]{36})$/)
const indexSchema = suiteSchema
  .omit({
    schemaVersion: true,
    authoring: true,
    requestBudget: true,
    journeys: true
  })
  .extend({ personaIds: z.array(z.string()).max(20) })

export function createJourneyStore(root: string) {
  const directory = path.join(root, 'eval/runs/journeys')
  const baseline = path.join(
    root,
    'eval/development/mechanical-journey-baseline.json'
  )
  const recordedLive = path.join(
    root,
    'eval/development/live-persona-journeys.json'
  )
  async function readArtifact(file: string): Promise<JourneySuite> {
    if ((await stat(file)).size > 64_000_000)
      throw new Error('Journey artifact exceeds local read bound')
    return suiteSchema.parse(JSON.parse(await readFile(file, 'utf8')))
  }
  async function readRecordedLive() {
    try {
      const suite = await readArtifact(recordedLive)
      runId.parse(suite.id)
      if (suite.mode !== 'live' || suite.id === 'baseline')
        throw new Error('Recorded persona journeys must be a live run')
      return suite
    } catch (err) {
      if (err instanceof Error && 'code' in err && err.code === 'ENOENT')
        return null
      throw err
    }
  }
  async function read(id: string): Promise<JourneySuite> {
    runId.parse(id)
    const file =
      id === 'baseline' ? baseline : path.join(directory, id, 'suite.json')
    let suite: JourneySuite
    try {
      suite = await readArtifact(file)
    } catch (err) {
      if (!(err instanceof Error && 'code' in err && err.code === 'ENOENT'))
        throw err
      const recorded = await readRecordedLive()
      if (recorded?.id !== id) throw err
      suite = recorded
    }
    if (suite.id !== id) throw new Error('Journey artifact identity mismatch')
    return suite
  }
  async function list(): Promise<RunIndex[]> {
    let directories: string[] = []
    try {
      directories = (await readdir(directory))
        .filter((id) => runId.safeParse(id).success && id !== 'baseline')
        .sort()
        .reverse()
        .slice(0, 40)
    } catch (err) {
      if (!(err instanceof Error && 'code' in err && err.code === 'ENOENT'))
        throw err
    }
    const runs = await Promise.all(
      directories.map(async (id) => {
        const file = path.join(directory, id, 'index.json')
        if ((await stat(file)).size > 20_000)
          throw new Error('Journey index exceeds read bound')
        const record = indexSchema.parse(
          JSON.parse(await readFile(file, 'utf8'))
        )
        if (record.id !== id) throw new Error('Journey index identity mismatch')
        return record
      })
    )
    const recorded = await readRecordedLive()
    if (recorded && !runs.some((run) => run.id === recorded.id)) {
      runs.push(runIndex(recorded))
      runs.sort((a, b) => b.id.localeCompare(a.id))
    }
    try {
      runs.push(runIndex(await read('baseline')))
    } catch (err) {
      if (!(err instanceof Error && 'code' in err && err.code === 'ENOENT'))
        throw err
    }
    return runs
  }
  async function publish(value: JourneySuite) {
    const suite = suiteSchema.parse(value)
    if (suite.id === 'baseline')
      throw new Error('Baseline updates require the explicit CLI flag')
    const temporary = path.join(directory, `.pending-${randomUUID()}`)
    await mkdir(temporary, { recursive: true })
    try {
      const serialized = JSON.stringify(suite, null, 2) + '\n'
      if (Buffer.byteLength(serialized) > 64_000_000)
        throw new Error('Journey artifact exceeds write bound')
      await writeFile(path.join(temporary, 'suite.json'), serialized, {
        flag: 'wx'
      })
      await writeFile(
        path.join(temporary, 'index.json'),
        JSON.stringify(runIndex(suite), null, 2) + '\n',
        { flag: 'wx' }
      )
      await rename(temporary, path.join(directory, suite.id))
      if (suite.mode === 'live') {
        // A fresh checkout gets the same latest run, without bulky request traces.
        const compact = {
          ...suite,
          journeys: suite.journeys.map((journey) => ({
            ...journey,
            steps: journey.steps.map(({ trace: _trace, ...step }) => step)
          }))
        }
        await mkdir(path.dirname(recordedLive), { recursive: true })
        const pendingRecord = `${recordedLive}.${randomUUID()}.tmp`
        await writeFile(pendingRecord, JSON.stringify(compact, null, 2) + '\n')
        await rename(pendingRecord, recordedLive)
      }
      // Local development retains only the latest run of each test mode.
      for (const id of await readdir(directory)) {
        if (
          id === suite.id ||
          id === 'baseline' ||
          !runId.safeParse(id).success
        )
          continue
        const index = JSON.parse(
          await readFile(path.join(directory, id, 'index.json'), 'utf8')
        ) as RunIndex
        if (index.mode === suite.mode)
          await rm(path.join(directory, id), { recursive: true })
      }
      return suite
    } finally {
      await rm(temporary, { recursive: true, force: true })
    }
  }
  function save(value: JourneySuite) {
    const previous = pendingSaves.get(directory) ?? Promise.resolve()
    const pending = previous.catch(() => {}).then(() => publish(value))
    pendingSaves.set(directory, pending)
    void pending
      .finally(() => {
        if (pendingSaves.get(directory) === pending)
          pendingSaves.delete(directory)
      })
      .catch(() => {})
    return pending
  }
  return { read, list, save }
}

export function projectJourneyStore() {
  return createJourneyStore(process.cwd())
}
